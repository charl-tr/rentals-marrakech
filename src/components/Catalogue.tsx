import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import BackToList from "@/components/BackToList";
import CatalogueBrowser from "@/components/CatalogueBrowser";
import { type Property, type PropertyType } from "@/data/properties";
import { getAllProperties } from "@/lib/db";

export type FilterMode = "vente" | "location";

export interface CatalogueProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  prefilter: (p: Property) => boolean;
  filterMode?: FilterMode;
  visibleFilters?: {
    type?: boolean;
    neighborhood?: boolean;
    city?: boolean;
    budget?: boolean;
    bedrooms?: boolean;
    duration?: boolean;
  };
  baseHref: string;
  backFallbackHref?: string;
  selectedFilters?: Record<string, string | undefined>;
}

const BUDGET_VENTE = [
  { key: "300", label: "Jusqu'à 300 000 €", max: 300000 },
  { key: "600", label: "300 000 — 600 000 €", min: 300000, max: 600000 },
  { key: "1000", label: "600 000 € — 1 M€", min: 600000, max: 1000000 },
  { key: "2000", label: "1 — 2 M€", min: 1000000, max: 2000000 },
  { key: "high", label: "Plus de 2 M€", min: 2000000 },
] as const;

const BUDGET_LOCATION = [
  { key: "1500", label: "Jusqu'à 1 500 € / mois", max: 1500 },
  { key: "3000", label: "1 500 — 3 000 € / mois", min: 1500, max: 3000 },
  { key: "5000", label: "3 000 — 5 000 € / mois", min: 3000, max: 5000 },
  { key: "10000", label: "5 000 — 10 000 € / mois", min: 5000, max: 10000 },
  { key: "high", label: "Plus de 10 000 € / mois", min: 10000 },
] as const;

const TYPES_VENTE: PropertyType[] = [
  "riad-renove",
  "riad-a-renover",
  "villa",
  "appartement",
  "maison-hotes",
  "programme-neuf",
  "terrain",
];

const TYPES_LOCATION: PropertyType[] = [
  "riad-renove",
  "villa",
  "appartement",
  "maison-hotes",
];

export default async function Catalogue({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  prefilter,
  filterMode = "vente",
  visibleFilters = {
    type: true,
    neighborhood: true,
    city: true,
    budget: true,
    bedrooms: true,
    duration: filterMode === "location",
  },
  baseHref,
  backFallbackHref = "/",
  selectedFilters = {},
}: CatalogueProps) {
  const all = await getAllProperties();
  const buckets = filterMode === "location" ? BUDGET_LOCATION : BUDGET_VENTE;
  const availableTypes = filterMode === "location" ? TYPES_LOCATION : TYPES_VENTE;

  const prefiltered = all.filter(prefilter);

  return (
    <>
      {/* HEADER — éditorial, bandeau noir, zéro image stock */}
      <section className="bg-[var(--color-charcoal-deep)] text-white">
        <div className="container-luxe pt-28 pb-12 md:pt-32 md:pb-16">
          {(breadcrumbs || backFallbackHref) && (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <BackToList fallbackHref={backFallbackHref} variant="dark" />
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs variant="dark" items={breadcrumbs} />
              )}
            </div>
          )}
          <div className="eyebrow-light">
            {eyebrow}
          </div>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.06] text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl leading-relaxed text-white/60 md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* EXPÉRIENCE DE NAVIGATION — filtrage/tri instantané côté client */}
      <CatalogueBrowser
        properties={prefiltered}
        mode={filterMode}
        baseHref={baseHref}
        visibleFilters={visibleFilters}
        buckets={buckets}
        availableTypes={availableTypes}
        initial={selectedFilters}
      />
    </>
  );
}
