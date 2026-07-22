"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, LayoutGrid, Map as MapIcon } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import MapClientWrapper from "@/components/MapClientWrapper";
import {
  NEIGHBORHOODS,
  propertyTypeLabel,
  type Property,
  type PropertyType,
} from "@/data/properties";
import type { PropertyPin } from "@/lib/db";
import type { FilterMode } from "@/components/Catalogue";

type Bucket = { key: string; label: string; min?: number; max?: number };

interface Props {
  properties: Property[];
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

function matches(p: Property, f: Filters, buckets: readonly Bucket[], mode: FilterMode) {
  if (f.type && p.type !== f.type) return false;
  if (f.quartier && p.neighborhoodSlug !== f.quartier) return false;
  if (f.ville && p.city !== f.ville) return false;
  if (f.budget) {
    const b = buckets.find((x) => x.key === f.budget);
    if (b) {
      if (b.min !== undefined && p.price < b.min) return false;
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

function toPin(p: Property): PropertyPin {
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
  const isMap = filters.vue === "carte";

  useEffect(() => {
    const params = new URLSearchParams();
    (Object.entries(filters) as [string, string | undefined][]).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${baseHref}?${qs}` : baseHref);
  }, [filters, baseHref]);

  const set = useCallback((patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setOpenKey(null);
  }, []);

  const clearAll = useCallback(() => {
    setFilters((f) => ({ tri: f.tri, vue: f.vue }));
    setOpenKey(null);
  }, []);

  const items = useMemo(() => {
    let out = properties.filter((p) => matches(p, filters, buckets, mode));
    if (filters.tri === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    else if (filters.tri === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    else if (filters.tri === "surface-desc")
      out = [...out].sort((a, b) => (b.surface ?? 0) - (a.surface ?? 0));
    return out;
  }, [properties, filters, buckets, mode]);

  const typeOpts = availableTypes.map((t) => ({ value: t, label: propertyTypeLabel(t) }));
  const zoneOpts = NEIGHBORHOODS.map((n) => ({ value: n.slug, label: n.label }));
  const budgetOpts = buckets.map((b) => ({ value: b.key, label: b.label }));
  const cityOpts = [
    { value: "Marrakech", label: "Marrakech" },
    { value: "Essaouira", label: "Essaouira" },
  ];

  const activeCount = [
    filters.type, filters.quartier, filters.ville, filters.budget,
    filters.chambres, filters.duree, filters.piscine,
  ].filter(Boolean).length;

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === (filters.tri ?? "default"))?.label ?? "Pertinence";

  return (
    <>
      {/* ═══ BARRE — filtres en ligne, instantanés ═══ */}
      <div className="sticky top-14 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-xl lg:top-16">
        <div className="container-luxe py-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
            {/* Groupe filtres (gauche) */}
            <div className="flex flex-wrap items-center gap-2.5">
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
                  display={filters.quartier ? NEIGHBORHOODS.find((n) => n.slug === filters.quartier)?.label : undefined}
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
                className={`whitespace-nowrap rounded-[10px] border px-4 py-2.5 text-[12px] transition-colors duration-200 ${
                  filters.piscine === "1"
                    ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
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
            <div className="flex items-center gap-5 md:gap-7">
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
        <section className="bg-white py-16 md:py-24">
          <div className="container-luxe">
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
              <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
                {items.map((p, i) => (
                  <PropertyCard key={p.slug} property={p} priority={i < 3} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
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
            : `inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border px-4 py-2.5 text-[12px] transition-colors duration-200 ${
                active
                  ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
              }`
        }
      >
        {bare && <span className="hidden text-[var(--color-stone)] sm:inline">{label}&nbsp;·</span>}
        <span>{active && display ? display : label}</span>
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
