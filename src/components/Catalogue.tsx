import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import BackToList from "@/components/BackToList";
import CatalogueBrowser from "@/components/CatalogueBrowser";
import { type PropertySummary, type PropertyType } from "@/data/properties";
import { getCatalogueProperties } from "@/lib/db";

export type FilterMode = "vente" | "location";

export interface CatalogueProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  prefilter: (p: PropertySummary) => boolean;
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

// Ordre d'affichage stable. La présence d'une option est ensuite déduite des
// biens réellement chargés, afin que le sélecteur reste aligné avec la DB.
const TYPE_ORDER: PropertyType[] = [
  "riad-renove",
  "riad-a-renover",
  "villa",
  "appartement",
  "maison-hotes",
  "programme-neuf",
  "terrain",
  "autre",
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
  const all = await getCatalogueProperties();
  const buckets = filterMode === "location" ? BUDGET_LOCATION : BUDGET_VENTE;
  const prefiltered = all.filter(prefilter);
  const typesInCatalogue = new Set(prefiltered.map((property) => property.type));
  const availableTypes = TYPE_ORDER.filter((type) => typesInCatalogue.has(type));

  return (
    <>
      {/* HEADER — page éditoriale claire et continue. Le rail sombre ne sert qu'à
          préserver la lisibilité de la navigation transparente au sommet. */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_84%_18%,rgba(156,114,86,0.13),transparent_34%),linear-gradient(145deg,#f7f5f0_0%,#efeae1_100%)]">
        <div aria-hidden className="absolute inset-x-0 top-0 h-14 bg-[var(--color-charcoal-deep)] lg:h-16" />
        <div className="container-luxe relative pb-10 pt-20 md:pb-16 md:pt-24">
          {(breadcrumbs || backFallbackHref) && (
            <div className="mb-5 flex items-center gap-8 md:mb-8">
              <BackToList fallbackHref={backFallbackHref} variant="light" compactOnMobile />
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="hidden sm:block">
                  <Breadcrumbs variant="light" items={breadcrumbs} />
                </div>
              )}
            </div>
          )}
          <div className="eyebrow">
            {eyebrow}
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.15rem] leading-[1.04] text-[var(--color-charcoal)] md:mt-4 md:text-5xl lg:text-[3.55rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-stone)] md:mt-5 md:text-lg">
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
