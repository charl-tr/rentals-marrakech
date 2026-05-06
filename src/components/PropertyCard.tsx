import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Maximize, Trees, Waves } from "lucide-react";
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

export default function PropertyCard({ property, priority = false }: Props) {
  const isLocation = property.listing !== "vente";
  const href = `${isLocation ? "/louer" : "/acheter"}/${property.slug}`;
  const isUnavailable =
    property.status === "sold" || property.status === "rented";

  return (
    <Link
      href={href}
      className={`group block bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-luxe)] ${
        isUnavailable ? "opacity-80" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-[900ms] group-hover:scale-105 ${
            isUnavailable ? "grayscale-[40%]" : ""
          }`}
        />

        {/* Top-left badges (status, type, exclusivité) */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-col items-start gap-2">
            {/* Status badge prioritaire si non-available */}
            {property.status && property.status !== "available" && (
              <span
                className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] ${
                  property.status === "new"
                    ? "bg-[var(--color-terracotta)] text-white"
                    : "bg-[var(--color-charcoal)] text-white"
                }`}
              >
                {STATUS_LABELS[property.status]}
              </span>
            )}
            <span className="bg-white/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] backdrop-blur-sm">
              {propertyTypeLabel(property.type)}
            </span>
            {property.exclusivity && (
              <span className="bg-[var(--color-terracotta)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
                Exclusivité
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <FavoriteButton slug={property.slug} />
            <CompareToggleButton slug={property.slug} variant="card" />
            {property.pool && (
              <span className="flex items-center gap-1.5 bg-white/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] backdrop-blur-sm">
                <Waves size={11} className="text-[var(--color-terracotta)]" />
                Piscine
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-charcoal)]/50 to-transparent" />
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-stone)]">
          <MapPin size={12} className="text-[var(--color-terracotta)]" />
          {property.neighborhood}, {property.city}
        </div>

        <h3 className="mt-2 line-clamp-2 font-serif text-lg leading-snug text-[var(--color-charcoal)] transition-colors group-hover:text-[var(--color-terracotta)] sm:mt-3 sm:text-xl">
          {property.title}
        </h3>

        {property.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-stone)]">
            {property.shortDescription}
          </p>
        )}

        {/* Specs row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[var(--color-beige-warm)] pt-4 text-xs text-[var(--color-charcoal)]/80 sm:mt-5 sm:gap-x-5 sm:gap-y-2 sm:pt-5">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble size={14} className="text-[var(--color-terracotta)]" />
              {property.bedrooms} ch.
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath size={14} className="text-[var(--color-terracotta)]" />
              {property.bathrooms} sdb.
            </span>
          )}
          {property.surface > 0 && (
            <span className="flex items-center gap-1.5">
              <Maximize size={14} className="text-[var(--color-terracotta)]" />
              {property.surface} m²
            </span>
          )}
          {property.landSurface && property.landSurface > 0 && (
            <span className="flex items-center gap-1.5 text-[var(--color-stone)]">
              <Trees size={14} className="text-[var(--color-terracotta)]" />
              {property.landSurface} m² terrain
            </span>
          )}
        </div>

        {/* Price + ref */}
        <div className="mt-4 flex items-end justify-between gap-4 sm:mt-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-stone)]">
              {property.listing === "vente"
                ? "Prix de vente"
                : property.priceUnit === "mois"
                ? "Loyer mensuel"
                : "À partir de"}
            </div>
            <div className="mt-1 font-serif text-2xl text-[var(--color-charcoal)]">
              <PriceDisplay
                priceEur={property.price}
                listing={property.listing}
                priceUnit={property.priceUnit}
              />
            </div>
            {property.priceMad && (
              <div className="mt-0.5 text-[10px] text-[var(--color-stone)]">
                {formatMad(property.priceMad)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
              Réf. {property.reference}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-terracotta)] opacity-0 transition-opacity group-hover:opacity-100">
              Découvrir →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
