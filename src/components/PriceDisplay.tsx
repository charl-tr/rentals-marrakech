"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { displayPropertyPrice } from "@/lib/display-price";
import type { Listing } from "@/data/properties";

export default function PriceDisplay({
  priceEur, priceMad, sourcePriceEur, sourcePriceMad, listing, priceUnit, className = "", locale = "fr",
}: {
  priceEur: number; priceMad?: number; sourcePriceEur?: string; sourcePriceMad?: string;
  listing: Listing; priceUnit?: "semaine" | "mois"; className?: string;
  showOriginal?: boolean; locale?: "fr" | "en";
}) {
  const { currency, rates } = useCurrency();
  const en = locale === "en";
  const price = displayPropertyPrice({ priceEur, priceMad, sourcePriceEur, sourcePriceMad, listing, priceUnit }, currency, rates, locale);
  const title = price.estimated
    ? (en ? "Indicative conversion from EUR · ECB reference rate " : "Conversion indicative depuis l’EUR · taux BCE du ") + price.date
    : price.fallback ? (en ? "Conversion unavailable: recorded EUR price shown." : "Conversion indisponible : prix EUR enregistré affiché.") : undefined;
  return <span className={className} data-price-currency={price.estimated ? currency : "EUR"} title={title}>
    {price.primary}
    <span className="mt-1 block font-sans text-sm leading-snug opacity-75" data-price-mad>{price.secondary}</span>
    {price.fallback && <span className="mt-1 block font-sans text-[10px] leading-snug opacity-75">{en ? "Conversion unavailable · EUR shown" : "Conversion indisponible · affichage EUR"}</span>}
  </span>;
}
