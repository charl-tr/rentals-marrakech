"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, LayoutGrid, Map, SlidersHorizontal, X } from "lucide-react";
import {
  NEIGHBORHOODS,
  propertyTypeLabel,
  type Property,
  type PropertyType,
} from "@/data/properties";

export type FilterMode = "vente" | "location";

type Bucket = { key: string; label: string; min?: number; max?: number };

export interface FilterToolbarProps {
  properties: Property[];
  mode: FilterMode;
  baseHref: string;
  selectedFilters: Record<string, string | undefined>;
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
}

const DURATION_OPTIONS = [
  { key: "longue", label: "Longue durée" },
  { key: "saisonnier", label: "Saisonnière" },
] as const;

const BEDROOM_PILLS = ["1", "2", "3", "4", "5"] as const;

const SORT_OPTIONS = [
  { key: "default", label: "Pertinence" },
  { key: "price-asc", label: "Prix croissant" },
  { key: "price-desc", label: "Prix décroissant" },
  { key: "surface-desc", label: "Plus grandes surfaces" },
  { key: "recent", label: "Nouveautés" },
] as const;

function buildQS(values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  return params.toString();
}

function matchesFilters(
  p: Property,
  filters: Record<string, string | undefined>,
  buckets: readonly Bucket[],
  mode: FilterMode
): boolean {
  if (filters.type && p.type !== filters.type) return false;
  if (filters.quartier && p.neighborhoodSlug !== filters.quartier) return false;
  if (filters.ville && p.city !== filters.ville) return false;
  if (filters.budget) {
    const bucket = buckets.find((b) => b.key === filters.budget);
    if (bucket) {
      if (bucket.min !== undefined && p.price < bucket.min) return false;
      if (bucket.max !== undefined && p.price > bucket.max) return false;
    }
  }
  if (filters.chambres) {
    const min = parseInt(filters.chambres, 10);
    if (!Number.isNaN(min) && p.bedrooms < min) return false;
  }
  if (filters.piscine === "1" && !p.pool) return false;
  if (filters.duree && mode === "location") {
    if (filters.duree === "longue" && p.listing !== "location") return false;
    if (filters.duree === "saisonnier" && p.listing !== "location-saisonniere")
      return false;
  }
  return true;
}

export default function FilterToolbar({
  properties,
  mode,
  baseHref,
  selectedFilters,
  visibleFilters,
  buckets,
  availableTypes,
}: FilterToolbarProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState(selectedFilters);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    setDraft(selectedFilters);
  }, [selectedFilters]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const liveCount = useMemo(
    () => properties.filter((p) => matchesFilters(p, draft, buckets, mode)).length,
    [properties, draft, buckets, mode]
  );

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (selectedFilters.type)
      chips.push({
        key: "type",
        label: propertyTypeLabel(selectedFilters.type as PropertyType),
      });
    if (selectedFilters.quartier) {
      const n = NEIGHBORHOODS.find((x) => x.slug === selectedFilters.quartier);
      if (n) chips.push({ key: "quartier", label: n.label });
    }
    if (selectedFilters.ville)
      chips.push({ key: "ville", label: selectedFilters.ville });
    if (selectedFilters.budget) {
      const b = buckets.find((x) => x.key === selectedFilters.budget);
      if (b) chips.push({ key: "budget", label: b.label });
    }
    if (selectedFilters.chambres)
      chips.push({ key: "chambres", label: `${selectedFilters.chambres}+ ch.` });
    if (selectedFilters.duree && mode === "location") {
      const d = DURATION_OPTIONS.find((x) => x.key === selectedFilters.duree);
      if (d) chips.push({ key: "duree", label: d.label });
    }
    if (selectedFilters.piscine === "1")
      chips.push({ key: "piscine", label: "Piscine" });
    return chips;
  }, [selectedFilters, buckets, mode]);

  const applyFilters = useCallback(() => {
    const qs = buildQS({ ...draft, vue: selectedFilters.vue });
    router.push(qs ? `${baseHref}?${qs}` : baseHref);
    setDrawerOpen(false);
  }, [draft, selectedFilters.vue, router, baseHref]);

  const resetFilters = useCallback(() => {
    setDraft({ tri: selectedFilters.tri });
  }, [selectedFilters.tri]);

  const removeChip = useCallback(
    (key: string) => {
      const next = { ...selectedFilters };
      delete next[key];
      const qs = buildQS(next);
      router.push(qs ? `${baseHref}?${qs}` : baseHref);
    },
    [selectedFilters, router, baseHref]
  );

  const changeSort = useCallback(
    (key: string) => {
      const next = { ...selectedFilters, tri: key === "default" ? undefined : key };
      const qs = buildQS(next);
      router.push(qs ? `${baseHref}?${qs}` : baseHref);
      setSortOpen(false);
    },
    [selectedFilters, router, baseHref]
  );

  const activeCount = activeChips.length;
  const totalItems = properties.filter((p) =>
    matchesFilters(p, selectedFilters, buckets, mode)
  ).length;
  const isMap = selectedFilters.vue === "carte";
  const sortLabel = (
    SORT_OPTIONS.find((o) => o.key === (selectedFilters.tri ?? "default")) ??
    SORT_OPTIONS[0]
  ).label;

  return (
    <>
      {/* ═══ BARRE — sticky, respirée ═══ */}
      <div className="sticky top-14 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md lg:top-16">
        <div className="container-luxe flex items-center justify-between gap-6 py-4 md:py-5">
          {/* Compteur */}
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-2xl text-[var(--color-charcoal)] md:text-3xl">
              {totalItems}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
              {totalItems > 1 ? "biens" : "bien"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5 md:gap-8">
            {/* Filtres */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
            >
              <SlidersHorizontal size={13} />
              Filtres
              {activeCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center bg-[var(--color-terracotta)] px-1 text-[9px] font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Tri */}
            {!isMap && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                >
                  <span className="hidden text-[var(--color-stone)] sm:inline">Trier&nbsp;·</span>
                  <span>{sortLabel}</span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 min-w-[220px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-luxe)]">
                      {SORT_OPTIONS.map((opt) => {
                        const active = (selectedFilters.tri ?? "default") === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => changeSort(opt.key)}
                            className={`block w-full px-5 py-3 text-left text-sm transition-colors hover:bg-[var(--color-cream)] ${
                              active
                                ? "text-[var(--color-terracotta)]"
                                : "text-[var(--color-charcoal)]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Vue carte / liste */}
            {(() => {
              const next = isMap
                ? { ...selectedFilters, vue: undefined }
                : { ...selectedFilters, vue: "carte" };
              const qs = buildQS(next);
              const href = qs ? `${baseHref}?${qs}` : baseHref;
              return (
                <Link
                  href={href}
                  aria-label={isMap ? "Afficher en liste" : "Afficher sur une carte"}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                >
                  {isMap ? <LayoutGrid size={13} /> : <Map size={13} />}
                  <span className="hidden sm:inline">{isMap ? "Liste" : "Carte"}</span>
                </Link>
              );
            })()}
          </div>
        </div>

        {/* Chips actifs — rangée dédiée, sobre */}
        {activeCount > 0 && (
          <div className="border-t border-[var(--color-border)]/60">
            <div className="container-luxe flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              {activeChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => removeChip(c.key)}
                  className="group inline-flex items-center gap-1.5 text-[11px] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                >
                  {c.label}
                  <X size={11} className="opacity-40 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
              <Link
                href={isMap ? `${baseHref}?vue=carte` : baseHref}
                className="ml-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
              >
                Tout effacer
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODAL — recherche avancée ═══ */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-0 md:items-center md:p-6 lg:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 animate-fade-in bg-[var(--color-charcoal-deep)]/75 backdrop-blur-sm"
          />

          <div className="relative flex min-h-screen w-full flex-col bg-white shadow-[var(--shadow-luxe)] animate-scale-in md:min-h-0 md:max-h-[90vh] md:max-w-5xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)] md:right-6 md:top-6"
            >
              <X size={22} />
            </button>

            <div className="border-b border-[var(--color-border)] px-5 py-7 sm:px-8 sm:py-10 md:px-12">
              <div className="eyebrow">Recherche avancée</div>
              <h2
                id="filter-modal-title"
                className="mt-3 font-serif text-2xl leading-tight text-[var(--color-charcoal)] sm:text-3xl md:text-4xl"
              >
                Affiner votre{" "}
                <span className="italic text-[var(--color-accent)]">sélection</span>.
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-10 md:px-12">
              <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                {visibleFilters.type && (
                  <FilterSection label="Type de bien">
                    <GridPills
                      options={availableTypes.map((t) => ({ value: t, label: propertyTypeLabel(t) }))}
                      value={draft.type}
                      onChange={(v) => setDraft((d) => ({ ...d, type: v }))}
                    />
                  </FilterSection>
                )}

                {visibleFilters.neighborhood && (
                  <FilterSection label="Quartier">
                    <GridPills
                      options={NEIGHBORHOODS.map((n) => ({ value: n.slug, label: n.label }))}
                      value={draft.quartier}
                      onChange={(v) => setDraft((d) => ({ ...d, quartier: v }))}
                    />
                  </FilterSection>
                )}

                {visibleFilters.city && (
                  <FilterSection label="Ville">
                    <GridPills
                      options={[
                        { value: "Marrakech", label: "Marrakech" },
                        { value: "Essaouira", label: "Essaouira" },
                      ]}
                      value={draft.ville}
                      onChange={(v) => setDraft((d) => ({ ...d, ville: v }))}
                    />
                  </FilterSection>
                )}

                {visibleFilters.budget && (
                  <FilterSection label="Budget">
                    <div className="flex flex-col gap-2">
                      {buckets.map((b) => {
                        const active = draft.budget === b.key;
                        return (
                          <button
                            key={b.key}
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({ ...d, budget: active ? undefined : b.key }))
                            }
                            className={`border px-4 py-3 text-left text-sm transition-colors ${
                              active
                                ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
                                : "border-[var(--color-border)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                            }`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>
                )}

                {visibleFilters.bedrooms && (
                  <FilterSection label="Chambres minimum">
                    <div className="flex items-center gap-2">
                      {BEDROOM_PILLS.map((n) => {
                        const active = draft.chambres === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({ ...d, chambres: active ? undefined : n }))
                            }
                            className={`flex h-12 w-14 items-center justify-center text-sm font-medium transition-colors ${
                              active
                                ? "bg-[var(--color-charcoal)] text-white"
                                : "border border-[var(--color-border)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                            }`}
                          >
                            {n === "5" ? "5+" : n}
                          </button>
                        );
                      })}
                    </div>
                  </FilterSection>
                )}

                {visibleFilters.duration && (
                  <FilterSection label="Durée de location">
                    <GridPills
                      options={DURATION_OPTIONS.map((d) => ({ value: d.key, label: d.label }))}
                      value={draft.duree}
                      onChange={(v) => setDraft((d) => ({ ...d, duree: v }))}
                    />
                  </FilterSection>
                )}

                <FilterSection label="Équipements">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, piscine: d.piscine === "1" ? undefined : "1" }))
                    }
                    aria-pressed={draft.piscine === "1"}
                    className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                      draft.piscine === "1"
                        ? "bg-[var(--color-charcoal)] text-white"
                        : "border border-[var(--color-border)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                    }`}
                  >
                    Piscine
                  </button>
                </FilterSection>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)] px-5 py-4 sm:px-8 sm:py-5 md:px-12">
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="inline-flex items-center gap-3 bg-[var(--color-charcoal)] px-8 py-4 text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
              >
                Voir {liveCount} {liveCount > 1 ? "biens" : "bien"} →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
        {label}
      </div>
      {children}
    </section>
  );
}

function GridPills({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(active ? undefined : opt.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--color-charcoal)] text-white"
                : "border border-[var(--color-border)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
