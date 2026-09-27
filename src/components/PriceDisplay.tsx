"use client";

import { propertyPricePair } from "@/lib/property-price";
import type { Listing } from "@/data/properties";

// Display the recorded MAD and EUR values, never a silent fixed-rate conversion.

export default function PriceDisplay({
  priceEur,
  priceMad,
  listing,
  priceUnit,
  className = "",
}: {
  priceEur: number;
  priceMad?: number;
  listing: Listing;
  priceUnit?: "semaine" | "mois";
  className?: string;
  showOriginal?: boolean;
}) {
  const pair = propertyPricePair(priceEur, priceMad);

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
