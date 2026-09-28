import type { PropertySummary } from "@/data/properties";
import { englishPropertyHeading, englishTypes } from "./english";
import { matchesPropertySearch } from "@/lib/inventory-search";
import { matchesPriceBucket } from "@/lib/property-filter-values";

export const saleBudgets = [
  { key: "300", label: "Up to €300,000", max: 300000 },
  { key: "600", label: "€300,000–600,000", min: 300000, max: 600000 },
  { key: "1000", label: "€600,000–1 million", min: 600000, max: 1000000 },
  { key: "2000", label: "€1–2 million", min: 1000000, max: 2000000 },
  { key: "high", label: "Over €2 million", min: 2000000 },
];

export const rentalBudgets = [
  { key: "1500", label: "Up to €1,500 / month", max: 1500 },
  { key: "3000", label: "€1,500–3,000 / month", min: 1500, max: 3000 },
  { key: "5000", label: "€3,000–5,000 / month", min: 3000, max: 5000 },
  { key: "10000", label: "€5,000–10,000 / month", min: 5000, max: 10000 },
  { key: "high", label: "Over €10,000 / month", min: 10000 },
];

export function filterEnglishCatalogue(properties: PropertySummary[], query: Record<string, string>, rental = false) {
  const bucket = (rental ? rentalBudgets : saleBudgets).find((b) => b.key === query.budget);
  const out = properties.filter((p) =>
    (!query.type || p.type === query.type) &&
    (!query.quartier || p.neighborhoodSlug === query.quartier) &&
    (!query.ville || p.city === query.ville) &&
    (!query.chambres || (p.bedrooms > 0 && p.bedrooms >= Number(query.chambres))) &&
    (query.piscine !== "1" || p.pool) &&
    (!query.duree || (query.duree === "longue" ? p.listing === "location" : query.duree === "saisonnier" ? p.listing === "location-saisonniere" : true)) &&
    (!bucket || ((!rental || p.priceUnit === "mois") && matchesPriceBucket(p.price, bucket))) &&
    (!query.q || matchesPropertySearch(query.q, [p.title, p.slug, p.city, p.neighborhood, englishTypes[p.type], englishPropertyHeading(p)]))
  );
  return out.sort((a, b) => {
    if (query.tri === "price-asc" || query.tri === "price-desc") {
      if (!(a.price > 0)) return b.price > 0 ? 1 : a.slug.localeCompare(b.slug);
      if (!(b.price > 0)) return -1;
      return query.tri === "price-asc" ? a.price - b.price : b.price - a.price;
    }
    if (query.tri === "surface-desc") return b.surface - a.surface;
    return Number(!!b.featured) - Number(!!a.featured) || Number(!!b.pool) - Number(!!a.pool) || (b.imageCount ?? 0) - (a.imageCount ?? 0) || a.slug.localeCompare(b.slug);
  });
}
