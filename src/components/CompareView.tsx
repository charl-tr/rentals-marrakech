"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, Maximize, MapPin, Trees, Waves, X } from "lucide-react";
import { useCompareList } from "@/hooks/useCompareList";
import PriceDisplay from "@/components/PriceDisplay";
import { languagePath } from "@/lib/i18n/routes";
import { englishPropertyHeading, englishTypes } from "@/lib/i18n/english";
import { propertyTypeLabel, type Property } from "@/data/properties";
import SaveSelectionBanner from "@/components/SaveSelectionBanner";

// ════════════════════════════════════════════════════════════════════
// CompareView — client-side compare. Reçoit les biens pré-chargés
// depuis la page server (via slug → property lookup).
// L'utilisateur peut retirer un bien → mise à jour localStorage → l'UI
// se synchronise (mais le server render initial reste juste la baseline).
// ════════════════════════════════════════════════════════════════════

export type ComparisonProperty = Pick<
  Property,
  | "slug"
  | "reference"
  | "title"
  | "type"
  | "listing"
  | "city"
  | "neighborhood"
  | "price"
  | "priceMad"
  | "sourcePriceEur"
  | "sourcePriceMad"
  | "priceUnit"
  | "missingFields"
  | "bedrooms"
  | "bathrooms"
  | "surface"
  | "landSurface"
  | "yearBuilt"
  | "pool"
  | "exclusivity"
  | "images"
>;

export default function CompareView({
  properties,
  locale = "fr",
}: {
  locale?: "fr" | "en";
  properties: ComparisonProperty[];
}) {
  const { items, remove, hydrated } = useCompareList();
  const en = locale === "en";

  // Dérivé directement de localStorage : aucun rendu intermédiaire ni effet
  // de synchronisation supplémentaire.
  const bySlug = new Map(properties.map((property) => [property.slug, property]));
  const displayed = items.map((slug) => bySlug.get(slug)).filter((property): property is ComparisonProperty => Boolean(property));
  if (!hydrated) return <div role="status" className="container-luxe py-24">{en ? "Loading your comparison…" : "Chargement de votre comparaison…"}</div>;

  if (displayed.length === 0) {
    return (
      <div className="container-luxe py-20 text-center">
        <div className="eyebrow">{en ? "Compare" : "Comparateur"}</div>
        <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)]">
          {en ? "Your comparison is empty." : "Votre comparateur est vide."}
        </h2>
        <p className="mt-3 text-sm text-[var(--color-stone)]">
          {en ? "Add up to 3 properties to compare them side by side." : <>Ajoutez jusqu&apos;à 3 biens depuis leurs fiches pour les comparer côte à côte.</>}
        </p>
        <Link href={languagePath("/acheter", locale)} className="btn-outline mt-8">
          <ArrowLeft size={14} /> {en ? "Browse properties" : "Parcourir les biens"}
        </Link>
      </div>
    );
  }

  // Helpers comparaison : quel est le winner par ligne ?
  const comparablePrices = new Set(displayed.map((p) => `${p.listing}:${p.priceUnit ?? ""}`)).size === 1;
  const minPrice = Math.min(...displayed.filter((p) => p.price > 0).map((p) => p.price));
  const maxSurface = Math.max(...displayed.map((p) => p.surface));
  const maxBedrooms = Math.max(...displayed.map((p) => p.bedrooms));
  const maxBathrooms = Math.max(...displayed.map((p) => p.bathrooms));
  const maxLand = Math.max(...displayed.map((p) => p.landSurface ?? 0));

  return (
    <div className="container-luxe pb-10 pt-24 md:pb-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="eyebrow">{en ? "Compare" : "Comparateur"}</div>
          <h1 className="mt-2 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            {en ? `Compare ${displayed.length} ${displayed.length === 1 ? "property" : "properties"}` : `Comparer ${displayed.length} bien${displayed.length > 1 ? "s" : ""}`}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-stone)]">
            {en ? "Compare recorded property details. Missing values are not estimated." : "Comparez les caractéristiques renseignées. Les valeurs manquantes ne sont pas estimées."}
          </p>
        </div>
      </div>

      <SaveSelectionBanner locale={locale}
        kind="comparateur"
        slugs={displayed.map((p) => p.slug)}
      />

      <div className="overflow-x-auto">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `160px repeat(${displayed.length}, minmax(240px, 1fr))`, maxWidth: 160 + displayed.length * 376 }}
        >
          {/* Row : images */}
          <div />
          {displayed.map((p) => (
            <div key={`img-${p.slug}`} className="relative">
              <Link
                href={languagePath(`/${p.listing === "vente" || p.type === "programme-neuf" ? "acheter" : "louer"}/${p.slug}`, locale)}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[var(--color-charcoal)]">
                  {p.images[0] && (
                    <Image
                      src={p.images[0]}
                      alt={en ? englishPropertyHeading(p) : p.title}
                      fill
                      sizes="(max-width: 768px) 240px, 360px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
              </Link>
              <button
                type="button"
                onClick={() => remove(p.slug)}
                aria-label={en ? "Remove from comparison" : "Retirer du comparateur"}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-terracotta)] hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Row : title */}
          <Label>{en ? "Property" : "Bien"}</Label>
          {displayed.map((p) => (
            <Cell key={`title-${p.slug}`}>
              <Link
                href={languagePath(`/${p.listing === "vente" || p.type === "programme-neuf" ? "acheter" : "louer"}/${p.slug}`, locale)}
                className="group"
              >
                <div className="font-serif text-base leading-tight text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                  {en ? englishPropertyHeading(p) : p.title}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  <MapPin size={10} /> {p.neighborhood}, {p.city}
                </div>
              </Link>
            </Cell>
          ))}

          {/* Row : type */}
          <Label>Type</Label>
          {displayed.map((p) => (
            <Cell key={`type-${p.slug}`}>
              <span className="text-sm text-[var(--color-charcoal)]">
                {en ? englishTypes[p.type] : propertyTypeLabel(p.type)}
              </span>
            </Cell>
          ))}

          {/* Row : reference */}
          <Label>{en ? "Reference" : "Référence"}</Label>
          {displayed.map((p) => (
            <Cell key={`ref-${p.slug}`}>
              <span className="font-mono text-xs text-[var(--color-stone)]">
                {p.reference}
              </span>
            </Cell>
          ))}

          {/* Row : price */}
          <Label>{en ? "Price" : "Prix"}</Label>
          {displayed.map((p) => (
            <Cell key={`price-${p.slug}`} winner={comparablePrices && p.price > 0 && p.price === minPrice && displayed.length > 1}>
              <div className="font-serif text-lg text-[var(--color-charcoal)]">
                <PriceDisplay locale={locale} priceEur={p.price} priceMad={p.priceMad} sourcePriceEur={p.sourcePriceEur} sourcePriceMad={p.sourcePriceMad} listing={p.listing} priceUnit={p.priceUnit} />
              </div>
              {comparablePrices && p.price > 0 && p.price === minPrice && displayed.length > 1 && (
                <div className="text-[10px] text-[var(--color-stone)]">
                  {en ? "Lowest listed price" : "Prix affiché le plus bas"}
                </div>
              )}
            </Cell>
          ))}

          {/* Row : bedrooms */}
          <Label>{en ? "Bedrooms" : "Chambres"}</Label>
          {displayed.map((p) => (
            <Cell key={`bed-${p.slug}`} winner={p.bedrooms > 0 && p.bedrooms === maxBedrooms && displayed.length > 1}>
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <BedDouble size={12} className="text-[var(--color-stone)]" />
                {p.missingFields?.includes("bedrooms") ? (en ? "Not specified" : "Non renseigné") : p.bedrooms}
              </span>
            </Cell>
          ))}

          {/* Row : bathrooms */}
          <Label>{en ? "Bathrooms" : "Salles de bain"}</Label>
          {displayed.map((p) => (
            <Cell key={`bath-${p.slug}`} winner={p.bathrooms > 0 && p.bathrooms === maxBathrooms && displayed.length > 1}>
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <Bath size={12} className="text-[var(--color-stone)]" />
                {p.missingFields?.includes("bathrooms") ? (en ? "Not specified" : "Non renseigné") : p.bathrooms}
              </span>
            </Cell>
          ))}

          {/* Row : surface habitable */}
          <Label>{en ? "Living area" : "Surface habitable"}</Label>
          {displayed.map((p) => (
            <Cell key={`surf-${p.slug}`} winner={p.surface > 0 && p.surface === maxSurface && displayed.length > 1}>
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <Maximize size={12} className="text-[var(--color-stone)]" />
                {p.missingFields?.includes("surface") ? (en ? "Not specified" : "Non renseigné") : `${p.surface} m²`}
              </span>
            </Cell>
          ))}

          {/* Row : land surface */}
          <Label>{en ? "Land" : "Terrain"}</Label>
          {displayed.map((p) => (
            <Cell
              key={`land-${p.slug}`}
              winner={Boolean(p.landSurface) && p.landSurface === maxLand && maxLand > 0 && displayed.length > 1}
            >
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]">
                <Trees size={12} className="text-[var(--color-stone)]" />
                {p.landSurface ? `${p.landSurface} m²` : "—"}
              </span>
            </Cell>
          ))}

          {/* Row : pool */}
          <Label>{en ? "Pool" : "Piscine"}</Label>
          {displayed.map((p) => (
            <Cell key={`pool-${p.slug}`}>
              <span className={`flex items-center gap-1.5 text-sm ${p.pool ? "text-[var(--color-charcoal)]" : "text-[var(--color-stone-soft)]"}`}>
                <Waves size={12} />
                {p.pool ? (en ? "Yes" : "Oui") : (en ? "No" : "Non")}
              </span>
            </Cell>
          ))}

          {/* Row : exclusivity */}
          <Label>{en ? "Exclusive" : "Exclusivité"}</Label>
          {displayed.map((p) => (
            <Cell key={`excl-${p.slug}`}>
              {p.exclusivity ? (
                <span className="inline-flex items-center rounded-full bg-[var(--color-terracotta)] px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white">
                  ★ {en ? "Exclusive" : "Exclusivité"}
                </span>
              ) : (
                <span className="text-[11px] text-[var(--color-stone-soft)]">—</span>
              )}
            </Cell>
          ))}

          {/* Row : year built */}
          <Label>{en ? "Year" : "Année"}</Label>
          {displayed.map((p) => (
            <Cell key={`year-${p.slug}`}>
              <span className="text-sm text-[var(--color-charcoal)]">
                {p.yearBuilt ?? "—"}
              </span>
            </Cell>
          ))}

          {/* Row : CTA */}
          <Label></Label>
          {displayed.map((p) => (
            <Cell key={`cta-${p.slug}`}>
              <Link
                href={languagePath(`/contact?property=${encodeURIComponent(p.slug)}`, locale)}
                className="btn-outline w-full justify-center"
              >
                {en ? "Enquire about this property" : "Demander ce bien"}
              </Link>
            </Cell>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
      {children}
    </div>
  );
}

function Cell({
  children,
  winner = false,
}: {
  children: React.ReactNode;
  winner?: boolean;
}) {
  return (
    <div
      className={`border-t border-[var(--color-beige-warm)] py-3 ${
        winner ? "bg-[var(--color-success-soft)] px-2" : ""
      }`}
    >
      {children}
    </div>
  );
}
