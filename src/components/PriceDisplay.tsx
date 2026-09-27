"use client";

import { propertyPricePair, sourcePriceRange } from "@/lib/property-price";
import type { Listing } from "@/data/properties";

// Display the recorded MAD and EUR values, never a silent fixed-rate conversion.

export default function PriceDisplay({
  priceEur,
  priceMad,
  sourcePriceEur,
  sourcePriceMad,
  listing,
  priceUnit,
  className = "",
}: {
  priceEur: number;
  priceMad?: number;
  sourcePriceEur?: string;
  sourcePriceMad?: string;
  listing: Listing;
  priceUnit?: "semaine" | "mois";
  className?: string;
  showOriginal?: boolean;
}) {
  const pair = propertyPricePair(priceEur, priceMad);
  const range = !(priceEur > 0) ? sourcePriceRange(sourcePriceEur, sourcePriceMad) : null;
  if (range) return <span className={className}>{range.primary}<span className="mt-1 block font-sans text-sm leading-snug opacity-75">{range.secondary}</span></span>;

  if (!(priceEur > 0) && !(priceMad && priceMad > 0)) {
    return <span className={className}>Prix sur demande</span>;
  }

  const amount = pair.primary;
  const suffix =
    listing === "vente"
      ? ""
      : priceUnit === "mois"
      ? " / mois"
      : priceUnit === "semaine"
      ? " / semaine"
      : " · période à confirmer";

  return (
    <span className={className}>
      {amount}
      {suffix}
      {pair.secondary && (
        <span className="mt-1 block font-sans text-sm leading-snug opacity-75">
          {pair.secondary}{suffix}
        </span>
      )}
    </span>
  );
}
