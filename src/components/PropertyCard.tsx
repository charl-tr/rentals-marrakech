import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

// ── Carte de bien — éditoriale, sans chrome (façon Barnes/Christie's).
// L'image et l'espace portent la carte. Zéro icône décorative, specs en
// texte pur. Un seul accent : la révélation "Découvrir" au survol.
export default function PropertyCard({ property, priority = false }: Props) {
  const isLocation = property.listing !== "vente";
  const href = `${isLocation ? "/louer" : "/acheter"}/${property.slug}`;
  const isUnavailable =
    property.status === "sold" || property.status === "rented";

  const specs = [
    property.bedrooms > 0 ? `${property.bedrooms} ch.` : null,
    property.bathrooms > 0 ? `${property.bathrooms} sdb.` : null,
    property.surface > 0 ? `${property.surface} m²` : null,
    property.landSurface && property.landSurface > 0
      ? `${property.landSurface} m² terrain`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={href}
      className={`group block ${isUnavailable ? "opacity-80" : ""}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-charcoal-deep)]">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] ${
            isUnavailable ? "grayscale-[40%]" : ""
          }`}
        />

        {/* Badge unique, discret */}
        <div className="absolute left-0 top-0 p-4">
          {property.status && property.status !== "available" ? (
            <span
              className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] ${
                property.status === "new"
                  ? "bg-[var(--color-terracotta)] text-white"
                  : "bg-[var(--color-charcoal-deep)] text-white"
              }`}
            >
              {STATUS_LABELS[property.status]}
            </span>
          ) : property.exclusivity ? (
            <span className="bg-[var(--color-charcoal-deep)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
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

      {/* Contenu — éditorial, sous l'image */}
      <div className="pt-5">
        <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          <span className="truncate">
            {property.neighborhood} · {property.city}
          </span>
          <span className="shrink-0">{propertyTypeLabel(property.type)}</span>
        </div>

        <h3 className="mt-3 line-clamp-1 font-serif text-xl text-[var(--color-charcoal)]">
          {property.title}
        </h3>

        {specs && (
          <div className="mt-2 text-[13px] text-[var(--color-stone)]">
            {specs}
          </div>
        )}

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--color-border)] pt-5">
          <div>
            <div className="font-serif text-2xl text-[var(--color-charcoal)]">
              <PriceDisplay
                priceEur={property.price}
                listing={property.listing}
                priceUnit={property.priceUnit}
              />
            </div>
            {property.priceMad && (
              <div className="mt-1 text-[10px] text-[var(--color-stone)]">
                {formatMad(property.priceMad)}
              </div>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1.5 pb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors group-hover:text-[var(--color-terracotta)]">
            Découvrir
            <ArrowRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
