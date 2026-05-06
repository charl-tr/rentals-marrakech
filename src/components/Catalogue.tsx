import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import BackToList from "@/components/BackToList";
import FilterToolbar, { type FilterMode } from "@/components/FilterToolbar";
import MapClientWrapper from "@/components/MapClientWrapper";
import {
  propertyTypeLabel,
  type Property,
  type PropertyType,
} from "@/data/properties";
import { getAllProperties, type PropertyPin } from "@/lib/db";

export type { FilterMode };

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

// Version server-side du matching (même logique que FilterToolbar côté client)
function matchesFilters(
  p: Property,
  f: Record<string, string | undefined>,
  buckets: readonly { key: string; min?: number; max?: number }[],
  mode: FilterMode
): boolean {
  if (f.type && p.type !== f.type) return false;
  if (f.quartier && p.neighborhoodSlug !== f.quartier) return false;
  if (f.ville && p.city !== f.ville) return false;
  if (f.budget) {
    const bucket = buckets.find((b) => b.key === f.budget);
    if (bucket) {
      if (bucket.min !== undefined && p.price < bucket.min) return false;
      if (bucket.max !== undefined && p.price > bucket.max) return false;
    }
  }
  if (f.chambres) {
    const min = parseInt(f.chambres, 10);
    if (!Number.isNaN(min) && p.bedrooms < min) return false;
  }
  if (f.piscine === "1" && !p.pool) return false;
  if (f.duree && mode === "location") {
    if (f.duree === "longue" && p.listing !== "location") return false;
    if (f.duree === "saisonnier" && p.listing !== "location-saisonniere")
      return false;
  }
  return true;
}

function propertyToPin(p: Property): PropertyPin {
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
  const BUCKETS = filterMode === "location" ? BUDGET_LOCATION : BUDGET_VENTE;
  const availableTypes = filterMode === "location" ? TYPES_LOCATION : TYPES_VENTE;

  const prefiltered = all.filter(prefilter);

  // Hero = premier bien pertinent du contexte (featured desc déjà appliqué côté DB).
  // On prend images[1] si dispo (shot architectural) plutôt que la photo de garde [0]
  // qui sert de thumb dans la grille juste en dessous — évite la répétition visuelle.
  const heroSource =
    prefiltered.find((p) => p.images.length > 0) ??
    all.find((p) => p.images.length > 0);
  const heroImage = heroSource?.images[1] ?? heroSource?.images[0];
  const heroAlt = heroSource?.title ?? title;

  let items = prefiltered.filter((p) =>
    matchesFilters(p, selectedFilters, BUCKETS, filterMode)
  );

  const tri = selectedFilters.tri ?? "default";
  if (tri === "price-asc") items = [...items].sort((a, b) => a.price - b.price);
  else if (tri === "price-desc")
    items = [...items].sort((a, b) => b.price - a.price);
  else if (tri === "surface-desc")
    items = [...items].sort((a, b) => (b.surface ?? 0) - (a.surface ?? 0));

  return (
    <>
      {/* HERO COMPACT — image contextualisée + overlay standardisé */}
      <section className="relative overflow-hidden bg-[var(--color-charcoal)] text-white">
        {heroImage && (
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div aria-hidden className="absolute inset-0 hero-overlay-top" />
        <div aria-hidden className="absolute inset-0 hero-overlay-left" />

        <div className="container-luxe relative z-10 pt-[96px] pb-10 md:pt-[108px] md:pb-12">
          {(breadcrumbs || backFallbackHref) && (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <BackToList fallbackHref={backFallbackHref} variant="dark" />
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs variant="dark" items={breadcrumbs} />
              )}
            </div>
          )}
          <div className="hero-text-soft text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
            {eyebrow}
          </div>
          <h1 className="hero-text mt-3 max-w-3xl font-serif text-3xl leading-[1.08] text-white md:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="hero-text-soft mt-4 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* TOOLBAR + DRAWER (Client Component) */}
      <FilterToolbar
        properties={prefiltered}
        mode={filterMode}
        baseHref={baseHref}
        selectedFilters={selectedFilters}
        visibleFilters={visibleFilters}
        buckets={BUCKETS}
        availableTypes={availableTypes}
      />

      {/* MAP VIEW */}
      {selectedFilters.vue === "carte" ? (
        <div className="h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-7.5rem)]">
          <MapClientWrapper pins={items.map(propertyToPin)} />
        </div>
      ) : (
        /* GRID VIEW */
        <section className="bg-[var(--color-cream)] py-12 md:py-16">
          <div className="container-luxe">
            {items.length === 0 ? (
              <div className="border border-[var(--color-beige-warm)] bg-white p-12 text-center">
                <div className="font-serif text-2xl text-[var(--color-charcoal)]">
                  Aucun bien correspondant.
                </div>
                <p className="mt-3 text-sm text-[var(--color-stone)]">
                  Notre portefeuille évolue chaque semaine — confiez-nous vos critères,
                  nous activerons notre réseau.
                </p>
                <Link href="/contact" className="btn-gold mt-8 inline-flex">
                  Nous décrire votre projet
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
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
