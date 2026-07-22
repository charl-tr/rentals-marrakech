import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Bath, Maximize, Trees } from "lucide-react";
import {
  formatMad,
  propertyTypeLabel,
  STATUS_LABELS,
  type Property,
} from "@/data/properties";
import FavoriteButton from "@/components/FavoriteButton";
import CompareToggleButton from "@/components/CompareToggleButton";
import PriceDisplay from "@/components/PriceDisplay";

interface Props {
  property: Property;
  priority?: boolean;
}

// ── Carte de bien — Aman : carte contenue, calme, élégante.
// Conteneur blanc arrondi + bordure fine + ombre douce. L'image porte,
// les specs sont lisibles d'un coup d'œil, le prix domine le pied de carte.
export default function PropertyCard({ property, priority = false }: Props) {
  const isLocation = property.listing !== "vente";
  const href = `${isLocation ? "/louer" : "/acheter"}/${property.slug}`;
  const isUnavailable =
    property.status === "sold" || property.status === "rented";

  const specs = [
    property.bedrooms > 0
      ? { icon: BedDouble, value: `${property.bedrooms}`, label: "chambres" }
      : null,
    property.bathrooms > 0
      ? { icon: Bath, value: `${property.bathrooms}`, label: "salles de bain" }
      : null,
    property.surface > 0
      ? { icon: Maximize, value: `${property.surface} m²`, label: "habitable" }
      : null,
    property.landSurface && property.landSurface > 0
      ? { icon: Trees, value: `${property.landSurface} m²`, label: "terrain" }
      : null,
  ].filter(Boolean) as {
    icon: typeof BedDouble;
    value: string;
    label: string;
  }[];

  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-shadow duration-500 hover:shadow-[var(--shadow-hover)] ${
        isUnavailable ? "opacity-80" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-charcoal-deep)]">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.045] ${
            isUnavailable ? "grayscale-[40%]" : ""
          }`}
        />

        {/* Badge unique, discret */}
        <div className="absolute left-0 top-0 p-4">
          {property.status && property.status !== "available" ? (
            <span
              className={`rounded-full px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.22em] ${
                property.status === "new"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-charcoal-deep)]/85 text-white backdrop-blur-sm"
              }`}
            >
              {STATUS_LABELS[property.status]}
            </span>
          ) : property.exclusivity ? (
            <span className="rounded-full bg-[var(--color-charcoal-deep)]/85 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm">
              Exclusivité
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="absolute right-0 top-0 flex flex-col items-end gap-2 p-4">
          <FavoriteButton slug={property.slug} />
          <CompareToggleButton slug={property.slug} variant="card" />
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-6">
        {/* Localisation + type */}
        <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          <span className="truncate">
            {property.neighborhood} · {property.city}
          </span>
          <span className="shrink-0 text-[var(--color-accent)]">
            {propertyTypeLabel(property.type)}
          </span>
        </div>

        {/* Titre — 2 lignes max, hauteur stable */}
        <h3 className="mt-2.5 line-clamp-2 min-h-[2.5em] font-serif text-[1.5rem] leading-[1.25] text-[var(--color-charcoal)]">
          {property.title}
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
                priceEur={property.price}
                listing={property.listing}
                priceUnit={property.priceUnit}
              />
            </div>
            {property.priceMad && (
              <div className="mt-1.5 text-[10px] text-[var(--color-stone)]">
                {formatMad(property.priceMad)}
              </div>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1.5 pb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors group-hover:text-[var(--color-accent)]">
            Découvrir
            <ArrowRight
              size={13}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
