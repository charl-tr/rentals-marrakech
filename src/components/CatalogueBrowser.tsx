"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  LayoutGrid,
  Map as MapIcon,
  SlidersHorizontal,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import {
  NEIGHBORHOODS,
  propertyTypeLabel,
  type PropertySummary,
  type PropertyType,
} from "@/data/properties";
import type { PropertyPin } from "@/lib/db";
import type { FilterMode } from "@/components/Catalogue";

type Bucket = { key: string; label: string; min?: number; max?: number };
const MOBILE_PAGE_SIZE = 12;
const DESKTOP_PAGE_SIZE = 24;
const DESKTOP_MEDIA = "(min-width: 1024px)";

function subscribeToDesktopMedia(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_MEDIA);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getDesktopMediaSnapshot() {
  return window.matchMedia(DESKTOP_MEDIA).matches;
}

const MapClientWrapper = dynamic(() => import("@/components/MapClientWrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[var(--color-cream)] text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-stone)]">
      Chargement de la carte…
    </div>
  ),
});

interface Props {
  properties: PropertySummary[];
  mode: FilterMode;
  baseHref: string;
  visibleFilters: {
    type?: boolean;
    neighborhood?: boolean;
    city?: boolean;
    budget?: boolean;
    bedrooms?: boolean;
    duration?: boolean;
  };
  buckets: readonly Bucket[];
  availableTypes: PropertyType[];
  initial: Record<string, string | undefined>;
}

type Filters = {
  type?: string;
  quartier?: string;
  ville?: string;
  budget?: string;
  chambres?: string;
  duree?: string;
  piscine?: string;
  tri?: string;
  vue?: string;
  page?: string;
};

const DURATION_OPTIONS = [
  { value: "longue", label: "Longue durée" },
  { value: "saisonnier", label: "Saisonnière" },
];

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5"].map((n) => ({
  value: n,
  label: n === "5" ? "5 chambres et +" : `${n} chambres et +`,
}));

const SORT_OPTIONS = [
  { value: "default", label: "Pertinence" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "surface-desc", label: "Plus grandes surfaces" },
];

const EDITORIAL_TYPE_WEIGHT: Partial<Record<PropertyType, number>> = {
  villa: 720,
  "riad-renove": 700,
  "maison-hotes": 620,
  appartement: 520,
  "riad-a-renover": 470,
  "programme-neuf": 400,
  terrain: 90,
  autre: 50,
};

const LEAD_SEQUENCE: PropertyType[] = [
  "villa",
  "riad-renove",
  "villa",
  "maison-hotes",
  "appartement",
  "villa",
  "riad-renove",
  "programme-neuf",
  "villa",
  "appartement",
  "maison-hotes",
  "riad-renove",
];

function editorialScore(property: PropertySummary) {
  return (
    (property.featured ? 2_000 : 0) +
    (property.exclusivity ? 500 : 0) +
    (EDITORIAL_TYPE_WEIGHT[property.type] ?? 0) +
    (property.pool ? 180 : 0) +
    Math.min(property.bedrooms, 6) * 25 +
    Math.min(property.surface ?? 0, 1_000) / 10 +
    Math.min(property.imageCount ?? 0, 12) * 12 +
    (property.status === "new" ? 90 : 0) +
    (property.price > 0 ? 40 : 0)
  );
}

function editorialOrder(properties: PropertySummary[], diversify: boolean) {
  const ranked = [...properties].sort((a, b) => {
    const difference = editorialScore(b) - editorialScore(a);
    return difference || a.slug.localeCompare(b.slug, "fr");
  });

  if (!diversify) return ranked;

  const remaining = [...ranked];
  const lead = LEAD_SEQUENCE.flatMap((type) => {
    const index = remaining.findIndex((property) => property.type === type);
    return index === -1 ? [] : remaining.splice(index, 1);
  });

  return [...lead, ...remaining];
}

function matches(p: PropertySummary, f: Filters, buckets: readonly Bucket[], mode: FilterMode) {
  if (f.type && p.type !== f.type) return false;
  if (f.quartier && p.neighborhoodSlug !== f.quartier) return false;
  if (f.ville && p.city !== f.ville) return false;
  if (f.budget) {
    const b = buckets.find((x) => x.key === f.budget);
    if (b) {
      // Un prix nul signifie "Prix sur demande" : il ne doit appartenir à
      // aucune tranche. Les bornes basses sont exclusives pour éviter qu'un
      // bien exactement à 300 k€, 600 k€, etc. apparaisse dans deux tranches.
      if (p.price <= 0) return false;
      if (b.min !== undefined && p.price <= b.min) return false;
      if (b.max !== undefined && p.price > b.max) return false;
    }
  }
  if (f.chambres) {
    const m = parseInt(f.chambres, 10);
    if (!Number.isNaN(m) && p.bedrooms < m) return false;
  }
  if (f.piscine === "1" && !p.pool) return false;
  if (f.duree && mode === "location") {
    if (f.duree === "longue" && p.listing !== "location") return false;
    if (f.duree === "saisonnier" && p.listing !== "location-saisonniere") return false;
  }
  return true;
}

function toPin(p: PropertySummary): PropertyPin {
  return {
    slug: p.slug,
    title: p.title,
    price: p.price,
    priceUnit: p.priceUnit ?? undefined,
    listing: p.listing,
    type: p.type,
    coordinates: p.coordinates,
    neighborhoodSlug: p.neighborhoodSlug ?? "",
    city: p.city,
    image: p.images[0] ?? null,
    bedrooms: p.bedrooms,
    surface: p.surface ?? 0,
  };
}

export default function CatalogueBrowser({
  properties,
  mode,
  baseHref,
  visibleFilters,
  buckets,
  availableTypes,
  initial,
}: Props) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const isDesktop = useSyncExternalStore(
    subscribeToDesktopMedia,
    getDesktopMediaSnapshot,
    () => false
  );
  const pageSize = isDesktop ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE;
  const initialPage = Math.max(1, Number.parseInt(initial.page ?? "1", 10) || 1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const catalogueTopRef = useRef<HTMLDivElement>(null);
  const isMap = filters.vue === "carte";

  useEffect(() => {
    const params = new URLSearchParams();
    (Object.entries(filters) as [string, string | undefined][]).forEach(([k, v]) => {
      if (k !== "page" && v) params.set(k, v);
    });
    if (!isMap && currentPage > 1) params.set("page", String(currentPage));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${baseHref}?${qs}` : baseHref);
  }, [filters, baseHref, currentPage, isMap]);

  const set = useCallback((patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setCurrentPage(1);
    setOpenKey(null);
  }, []);

  const clearAll = useCallback(() => {
    setFilters((f) => ({ tri: f.tri, vue: f.vue }));
    setCurrentPage(1);
    setOpenKey(null);
  }, []);

  const items = useMemo(() => {
    let out = properties.filter((p) => matches(p, filters, buckets, mode));
    if (filters.tri === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    else if (filters.tri === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    else if (filters.tri === "surface-desc")
      out = [...out].sort((a, b) => (b.surface ?? 0) - (a.surface ?? 0));
    else out = editorialOrder(out, !filters.type && baseHref === "/acheter");
    return out;
  }, [properties, filters, buckets, mode, baseHref]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const visibleItems = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, effectivePage, pageSize]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.requestAnimationFrame(() => {
      const top = (catalogueTopRef.current?.offsetTop ?? 0) - 72;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, [totalPages]);

  const typeOpts = useMemo(() => {
    const candidates = properties.filter((property) =>
      matches(property, { ...filters, type: undefined }, buckets, mode)
    );
    const present = new Set(candidates.map((property) => property.type));

    return availableTypes
      .filter((type) => present.has(type) || type === filters.type)
      .map((type) => ({ value: type, label: propertyTypeLabel(type) }));
  }, [availableTypes, buckets, filters, mode, properties]);

  const zoneOpts = useMemo(() => {
    const labels = new Map<string, string>(NEIGHBORHOODS.map((n) => [n.slug, n.label]));
    const present = new Map<string, string>();
    const candidates = properties.filter((property) =>
      matches(property, { ...filters, quartier: undefined }, buckets, mode)
    );

    for (const property of candidates) {
      if (!property.neighborhoodSlug) continue;
      present.set(
        property.neighborhoodSlug,
        labels.get(property.neighborhoodSlug) || property.neighborhood || property.neighborhoodSlug
      );
    }

    if (filters.quartier && !present.has(filters.quartier)) {
      const selected = properties.find(
        (property) => property.neighborhoodSlug === filters.quartier
      );
      present.set(
        filters.quartier,
        labels.get(filters.quartier) || selected?.neighborhood || filters.quartier
      );
    }

    return [...present.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [buckets, filters, mode, properties]);

  const budgetOpts = buckets.map((b) => ({ value: b.key, label: b.label }));
  const cityOpts = useMemo(() => {
    const candidates = properties.filter((property) =>
      matches(property, { ...filters, ville: undefined }, buckets, mode)
    );
    const present = new Set(candidates.map((property) => property.city).filter(Boolean));
    if (filters.ville) present.add(filters.ville);

    return [...present]
        .sort((a, b) => a.localeCompare(b, "fr"))
        .map((city) => ({ value: city, label: city }));
  }, [buckets, filters, mode, properties]);

  const activeCount = [
    filters.type, filters.quartier, filters.ville, filters.budget,
    filters.chambres, filters.duree, filters.piscine,
  ].filter(Boolean).length;

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === (filters.tri ?? "default"))?.label ?? "Pertinence";

  return (
    <>
      {/* ═══ BARRE — filtres en ligne, instantanés ═══ */}
      <div ref={catalogueTopRef} className="sticky top-14 z-40 border-y border-[var(--color-border)] bg-[var(--color-cream)]/95 backdrop-blur-xl lg:top-16">
        <div className="container-luxe py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 md:hidden">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl text-[var(--color-charcoal)]">{items.length}</span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--color-stone)]">
                {items.length > 1 ? "biens" : "bien"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                aria-expanded={mobileFiltersOpen}
                aria-controls="catalogue-filters"
                className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)]"
              >
                <SlidersHorizontal size={14} />
                Filtres{activeCount > 0 ? ` (${activeCount})` : ""}
              </button>
              {!isMap && (
                <Pill
                  label="Trier"
                  value={filters.tri && filters.tri !== "default" ? filters.tri : undefined}
                  display={filters.tri && filters.tri !== "default" ? sortLabel : undefined}
                  options={SORT_OPTIONS.filter((option) => option.value !== "default")}
                  open={openKey === "mobile-tri"}
                  onToggle={() => setOpenKey((key) => (key === "mobile-tri" ? null : "mobile-tri"))}
                  onSelect={(value) => set({ tri: value })}
                  onClose={() => setOpenKey(null)}
                  allLabel="Trier"
                  bare
                  align="right"
                />
              )}
              <button
                type="button"
                onClick={() => set({ vue: isMap ? undefined : "carte" })}
                className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)]"
              >
                {isMap ? <LayoutGrid size={14} /> : <MapIcon size={14} />}
                {isMap ? "Liste" : "Carte"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
            {/* Groupe filtres (gauche) */}
            <div id="catalogue-filters" className={`${mobileFiltersOpen ? "flex" : "hidden"} mt-3 flex-wrap items-center gap-2.5 border-t border-[var(--color-border)] pt-3 md:mt-0 md:flex md:border-0 md:pt-0`}>
              <div className="mr-1 hidden items-baseline gap-2 md:flex">
                <span className="font-serif text-[1.6rem] text-[var(--color-charcoal)]">{items.length}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--color-stone)]">
                  {items.length > 1 ? "biens" : "bien"}
                </span>
              </div>

              {visibleFilters.type && (
                <Pill label="Type" value={filters.type}
                  display={filters.type ? propertyTypeLabel(filters.type as PropertyType) : undefined}
                  options={typeOpts} open={openKey === "type"}
                  onToggle={() => setOpenKey((k) => (k === "type" ? null : "type"))}
                  onSelect={(v) => set({ type: v })} onClose={() => setOpenKey(null)} allLabel="Tous les types" />
              )}
              {visibleFilters.neighborhood && (
                <Pill label="Quartier" value={filters.quartier}
                  display={filters.quartier ? zoneOpts.find((n) => n.value === filters.quartier)?.label : undefined}
                  options={zoneOpts} open={openKey === "quartier"}
                  onToggle={() => setOpenKey((k) => (k === "quartier" ? null : "quartier"))}
                  onSelect={(v) => set({ quartier: v })} onClose={() => setOpenKey(null)} allLabel="Tous les quartiers" />
              )}
              {visibleFilters.budget && (
                <Pill label="Budget" value={filters.budget}
                  display={filters.budget ? budgetOpts.find((b) => b.value === filters.budget)?.label : undefined}
                  options={budgetOpts} open={openKey === "budget"}
                  onToggle={() => setOpenKey((k) => (k === "budget" ? null : "budget"))}
                  onSelect={(v) => set({ budget: v })} onClose={() => setOpenKey(null)} allLabel="Tous budgets" />
              )}
              {visibleFilters.bedrooms && (
                <Pill label="Chambres" value={filters.chambres}
                  display={filters.chambres ? `${filters.chambres}+ ch.` : undefined}
                  options={BEDROOM_OPTIONS} open={openKey === "chambres"}
                  onToggle={() => setOpenKey((k) => (k === "chambres" ? null : "chambres"))}
                  onSelect={(v) => set({ chambres: v })} onClose={() => setOpenKey(null)} allLabel="Indifférent" />
              )}
              {visibleFilters.city && (
                <Pill label="Ville" value={filters.ville} display={filters.ville}
                  options={cityOpts} open={openKey === "ville"}
                  onToggle={() => setOpenKey((k) => (k === "ville" ? null : "ville"))}
                  onSelect={(v) => set({ ville: v })} onClose={() => setOpenKey(null)} allLabel="Toutes les villes" />
              )}
              {visibleFilters.duration && (
                <Pill label="Durée" value={filters.duree}
                  display={filters.duree ? DURATION_OPTIONS.find((d) => d.value === filters.duree)?.label : undefined}
                  options={DURATION_OPTIONS} open={openKey === "duree"}
                  onToggle={() => setOpenKey((k) => (k === "duree" ? null : "duree"))}
                  onSelect={(v) => set({ duree: v })} onClose={() => setOpenKey(null)} allLabel="Toutes durées" />
              )}
              <button
                type="button"
                onClick={() => set({ piscine: filters.piscine === "1" ? undefined : "1" })}
                  className={`whitespace-nowrap rounded-[10px] border px-4 py-2.5 text-[12px] font-medium transition-colors duration-200 ${
                  filters.piscine === "1"
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-deep)]"
                    : "border-[var(--color-border)] bg-white/45 text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                }`}
              >
                Piscine
              </button>

              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-accent)]"
                >
                  Effacer ({activeCount})
                </button>
              )}
            </div>

            {/* Groupe Tri + Vue (droite) */}
            <div className="hidden items-center gap-5 md:flex md:gap-7">
              {!isMap && (
                <Pill label="Trier" value={filters.tri && filters.tri !== "default" ? filters.tri : undefined}
                  display={filters.tri && filters.tri !== "default" ? sortLabel : undefined}
                  options={SORT_OPTIONS.filter((o) => o.value !== "default")} open={openKey === "tri"}
                  onToggle={() => setOpenKey((k) => (k === "tri" ? null : "tri"))}
                  onSelect={(v) => set({ tri: v })} onClose={() => setOpenKey(null)} allLabel="Pertinence"
                  bare align="right" />
              )}
              <button
                type="button"
                onClick={() => set({ vue: isMap ? undefined : "carte" })}
                aria-label={isMap ? "Afficher en liste" : "Afficher sur une carte"}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)]"
              >
                {isMap ? <LayoutGrid size={13} /> : <MapIcon size={13} />}
                <span className="hidden sm:inline">{isMap ? "Liste" : "Carte"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ VUE ═══ */}
      {isMap ? (
        <div className="h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-7.5rem)]">
          <MapClientWrapper pins={items.map(toPin)} />
        </div>
      ) : (
        <section className="min-h-[60vh] bg-[var(--color-cream)] py-8 md:py-16">
          <div className="container-luxe">
            {baseHref === "/acheter" && activeCount === 0 && (
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-5 md:mb-10">
                <div>
                  <div className="eyebrow">La sélection</div>
                  <p className="mt-1 text-sm text-[var(--color-stone)]">
                    Les propriétés les plus remarquables du portefeuille.
                  </p>
                </div>
                <div className="flex items-center gap-5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-charcoal)]">
                  <Link href="/acheter/terrain" className="transition-colors hover:text-[var(--color-accent)]">
                    Terrains
                  </Link>
                  <Link href="/acheter/autre" className="transition-colors hover:text-[var(--color-accent)]">
                    Commerces
                  </Link>
                </div>
              </div>
            )}
            {items.length === 0 ? (
              <div className="mx-auto max-w-lg py-20 text-center">
                <div className="eyebrow">Aucun résultat</div>
                <div className="mt-4 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
                  Aucun bien correspondant<br />à ces critères.
                </div>
                <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--color-stone)]">
                  Élargissez vos critères, ou confiez-nous votre recherche — nous
                  activerons notre réseau et notre fichier off-market.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button type="button" onClick={clearAll} className="btn-outline">
                    Réinitialiser
                  </button>
                  <Link href="/contact" className="btn-gold">
                    Nous décrire votre projet
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
                {visibleItems.map((p, i) => (
                  <PropertyCard key={p.slug} property={p} priority={i === 0} />
                ))}
              </div>
            )}

            {!isMap && items.length > 0 && totalPages > 1 && (
              <Pagination currentPage={effectivePage} totalPages={totalPages} onChange={goToPage} />
            )}
          </div>
        </section>
      )}

    </>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  );

  return (
    <nav aria-label="Pagination des biens" className="mt-12 flex flex-col items-center gap-4 md:mt-16">
      <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        Page {currentPage} sur {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={15} />
        </button>
        {pages.map((page, index) => {
          const previous = pages[index - 1];
          return (
            <span key={page} className="flex items-center gap-2">
              {previous && page - previous > 1 && (
                <span className="px-1 text-[var(--color-stone)]">…</span>
              )}
              <button
                type="button"
                onClick={() => onChange(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`flex h-11 min-w-11 items-center justify-center rounded-[10px] px-3 text-sm transition-colors ${
                  page === currentPage
                    ? "bg-[var(--color-accent-deep)] text-white"
                    : "border border-[var(--color-border)] text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                }`}
              >
                {page}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </nav>
  );
}

// ── Pill dropdown en ligne ────────────────────────────────────────────
function Pill({
  label,
  value,
  display,
  options,
  open,
  onToggle,
  onSelect,
  onClose,
  allLabel,
  bare = false,
  align = "left",
}: {
  label: string;
  value?: string;
  display?: string;
  options: { value: string; label: string }[];
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string | undefined) => void;
  onClose: () => void;
  allLabel: string;
  bare?: boolean;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const active = !!value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={
          bare
            ? `inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.24em] transition-colors ${
                active ? "text-[var(--color-accent)]" : "text-[var(--color-charcoal)] hover:text-[var(--color-accent)]"
              }`
            : `inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border px-4 py-2.5 text-[12px] font-medium transition-colors duration-200 ${
                active || open
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-deep)]"
                  : "border-[var(--color-border)] bg-white/45 text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
              }`
        }
      >
        {bare && <span className="hidden text-[var(--color-stone)] sm:inline">Trier&nbsp;·</span>}
        <span>{active && display ? display : bare ? allLabel : label}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`animate-mega-in absolute top-[calc(100%+8px)] z-50 max-h-80 min-w-[240px] overflow-y-auto rounded-[14px] border border-[var(--color-border)] bg-white py-1.5 shadow-[var(--shadow-luxe)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-[13px] transition-colors hover:bg-[var(--color-cream)] ${
              !value ? "text-[var(--color-accent)]" : "text-[var(--color-stone)]"
            }`}
          >
            {allLabel}
            {!value && <Check size={13} className="shrink-0" />}
          </button>
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onSelect(o.value)}
                className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-[13px] transition-colors hover:bg-[var(--color-cream)] ${
                  sel ? "text-[var(--color-accent)]" : "text-[var(--color-charcoal)]"
                }`}
              >
                {o.label}
                {sel && <Check size={13} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
