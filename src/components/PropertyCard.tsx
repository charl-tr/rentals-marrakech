import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Bath, Maximize, Trees } from "lucide-react";
import {
  displayPropertyType,
  STATUS_LABELS,
  type PropertySummary,
} from "@/data/properties";
import FavoriteButton from "@/components/FavoriteButton";
import PriceDisplay from "@/components/PriceDisplay";
import { languagePath } from "@/lib/i18n/routes";
import { englishPropertyHeading, englishStatus, englishTypes } from "@/lib/i18n/english";

interface Props {
  locale?: "fr" | "en";
  property: PropertySummary;
  priority?: boolean;
}

// ── Carte de bien — Aman : carte contenue, calme, élégante.
// Conteneur blanc arrondi + bordure fine + ombre douce. L'image porte,
// les specs sont lisibles d'un coup d'œil, le prix domine le pied de carte.
export default function PropertyCard({ property, priority = false, locale = "fr" }: Props) {
  const en = locale === "en";
  const title = en ? englishPropertyHeading(property) : property.title;
  const isLocation = property.listing !== "vente";
  const href = languagePath(`${isLocation ? "/louer" : "/acheter"}/${property.slug}`, locale);
  const isUnavailable =
    property.status === "sold" || property.status === "rented";

  const specs = [
    property.bedrooms > 0
      ? { icon: BedDouble, value: `${property.bedrooms}`, label: en ? "bedrooms" : "chambres" }
      : null,
    property.bathrooms > 0
      ? { icon: Bath, value: `${property.bathrooms}`, label: en ? "bathrooms" : "salles de bain" }
      : null,
    property.surface > 0
      ? { icon: Maximize, value: `${property.surface} m²`, label: en ? "living area" : "habitable" }
      : null,
    property.landSurface && property.landSurface > 0
      ? { icon: Trees, value: `${property.landSurface} m²`, label: en ? "land area" : "terrain" }
      : null,
  ].filter(Boolean) as {
    icon: typeof BedDouble;
    value: string;
    label: string;
  }[];

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] shadow-[var(--shadow-card)] transition-[transform,box-shadow,background-color] duration-500 hover:-translate-y-0.5 hover:bg-white hover:shadow-[var(--shadow-hover)] focus-within:ring-2 focus-within:ring-[var(--color-accent)] ${
        isUnavailable ? "border-[#795238]/30" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-charcoal-deep)]">
        <Image
          src={property.images[0]}
          alt={title}
          fill
          preload={priority}
          quality={55}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.045] ${
            isUnavailable ? "grayscale-[40%]" : ""
          }`}
        />

        {/* Badge unique, discret */}
        <div className="absolute left-0 top-0 p-4">
          {property.status && property.status !== "available" ? (
            <span
              className={`inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                isUnavailable
                  ? "bg-[#795238] text-white ring-1 ring-white/70 shadow-sm"
                  : property.status === "new"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-charcoal-deep)]/85 text-white backdrop-blur-sm"
              }`}
            >
              {en ? englishStatus[property.status] : STATUS_LABELS[property.status]}
            </span>
          ) : property.exclusivity ? (
            <span className="rounded-full bg-[var(--color-charcoal-deep)]/85 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm">
              {en ? "Exclusive" : "Exclusivité"}
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="absolute right-0 top-0 z-20 flex flex-col items-end gap-2 p-4">
          <FavoriteButton locale={locale} slug={property.slug} />
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-6">
        {/* Localisation + type */}
        <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          <span className="truncate">
            {[property.neighborhood, property.city].filter(Boolean).join(" · ")}
          </span>
          <span className="shrink-0 text-[var(--color-accent)]">
            {en ? englishTypes[property.type] : displayPropertyType(property)}
          </span>
        </div>

        {/* Titre — 2 lignes max, hauteur stable */}
        <h3 className="mt-2.5 line-clamp-2 min-h-[2.5em] font-serif text-[1.5rem] leading-[1.25] text-[var(--color-charcoal)]">
          <Link href={href} className="after:absolute after:inset-0 after:z-10 focus:outline-none">{title}</Link>
        </h3>

        {/* Specs — icônes fines, lisibles d'un coup d'œil */}
        {specs.length > 0 && (
          <div className="mt-5 mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[var(--color-ink-soft)]">
            {specs.map((s, i) => {
              const Icon = s.icon;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5"
                  title={s.label}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.6}
                    className="text-[var(--color-ink-hint)]"
                  />
                  {s.value}
                </span>
              );
            })}
          </div>
        )}

        {/* Pied — prix + CTA */}
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--color-border)] pt-6">
          <div>
            <div className="font-serif text-[1.7rem] leading-none text-[var(--color-charcoal)]">
              <PriceDisplay
                locale={locale}
                priceEur={property.price}
                priceMad={property.priceMad}
                sourcePriceEur={property.sourcePriceEur}
                sourcePriceMad={property.sourcePriceMad}
                listing={property.listing}
                priceUnit={property.priceUnit}
              />
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 pb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors group-hover:text-[var(--color-accent)]">
            {en ? "Discover" : "Découvrir"}
            <ArrowRight
              size={13}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </article>
  );
}
