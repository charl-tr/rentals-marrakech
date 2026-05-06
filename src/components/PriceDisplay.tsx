"use client";

import { formatInCurrency, useCurrency } from "@/hooks/useCurrency";
import type { Listing } from "@/data/properties";

// Client component qui affiche un prix selon la devise choisie.
// Tous les prix en DB sont en EUR — on convertit à l'affichage.
//
// Mode "compact" (card) : juste le montant + unité
// Mode "full" : inclut la devise originale en subtext si différente

export default function PriceDisplay({
  priceEur,
  listing,
  priceUnit,
  className = "",
  showOriginal = false,
}: {
  priceEur: number;
  listing: Listing;
  priceUnit?: "semaine" | "mois";
  className?: string;
  showOriginal?: boolean;
}) {
  const { currency, hydrated } = useCurrency();
  const effective = hydrated ? currency : "EUR";
  const amount = formatInCurrency(priceEur, effective);
  const suffix =
    listing === "vente"
      ? ""
      : priceUnit === "mois"
      ? " / mois"
      : priceUnit === "semaine"
      ? " / semaine"
      : "";

  return (
    <span className={className}>
      {amount}
      {suffix}
      {showOriginal && effective !== "EUR" && (
        <span className="ml-2 text-xs text-[var(--color-stone)]">
          ({formatInCurrency(priceEur, "EUR")})
        </span>
      )}
    </span>
  );
}
