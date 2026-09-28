import type { PropertySummary, PropertyType, PropertyStatus } from "@/data/properties";

export const englishTypes: Record<PropertyType, string> = {
  "riad-renove": "Renovated riad", "riad-a-renover": "Riad to renovate",
  villa: "Villa", appartement: "Apartment", "maison-hotes": "Guesthouse",
  "programme-neuf": "New development", terrain: "Land", autre: "Commercial property",
};
export const englishStatus: Record<PropertyStatus, string> = {
  available: "Available", new: "New listing", sold: "Sold", rented: "Let", reserved: "Under offer",
};
export function englishPropertyHeading(p: Pick<PropertySummary, "type" | "city" | "neighborhood">) {
  // A factual heading, not an invented translation of the owner's description.
  return `${englishTypes[p.type]} in ${p.neighborhood || p.city}${p.neighborhood && p.city && p.neighborhood !== p.city ? `, ${p.city}` : ""}`;
}
export function englishPrices(p: Pick<PropertySummary, "price" | "priceMad" | "listing" | "priceUnit" | "sourcePriceEur" | "sourcePriceMad">) {
  // Preserve ranges and nightly rates recorded in the original feed.
  const range = (v?: string) => v && /^\d+\s*[\/_–—-]\s*\d+\s*(?:€|Dhs|MAD)\s*\/\s*nuit$/i.test(v.trim())
    ? v.replace(/nuit/gi, "night").replace(/Dhs/gi, "MAD") : null;
  const suffix = p.listing === "vente" ? "" : p.priceUnit ? ` / ${p.priceUnit === "mois" ? "month" : "week"}` : " (rental period to confirm)";
  const fmt = (v: number, currency: string) => new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  return [range(p.sourcePriceEur) ?? (p.price > 0 ? fmt(p.price, "EUR") + suffix : "EUR price on request"), range(p.sourcePriceMad) ?? (p.priceMad && p.priceMad > 0 ? fmt(p.priceMad, "MAD") + suffix : "MAD price on request")];
}
