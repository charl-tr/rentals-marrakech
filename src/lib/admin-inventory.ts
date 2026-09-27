import type { Listing, Property, PropertyStatus } from "@/data/properties";
import { propertyPricePair, sourcePriceRange } from "@/lib/property-price";

export function inventoryPrice(property: Property) {
  const range = !(property.price > 0) ? sourcePriceRange(property.sourcePriceEur, property.sourcePriceMad) : null;
  if (range) return `${range.primary} · ${range.secondary}`;
  const pair = propertyPricePair(property.price, property.priceMad);
  const price = [pair.primary, pair.secondary].filter(Boolean).join(" · ");
  if (property.listing === "vente" || !(property.price > 0)) return price;
  return property.priceUnit ? `${price} / ${property.priceUnit}` : `${price} · période à confirmer`;
}

export const TRANSACTION_LABELS: Record<Listing, string> = {
  vente: "Vente", location: "Location longue durée", "location-saisonniere": "Location saisonnière",
};
export type InventorySection = Listing | "programme-neuf";
export const INVENTORY_SECTIONS: Record<InventorySection, string> = { ...TRANSACTION_LABELS, "programme-neuf": "Programmes neufs" };
export function inventorySection(value?: string): InventorySection {
  return value === "programme-neuf" ? value : inventoryTransaction(value);
}
export function inInventorySection(property: Pick<Property, "listing" | "type">, section: InventorySection) {
  return section === "programme-neuf" ? property.type === "programme-neuf" : property.type !== "programme-neuf" && property.listing === section;
}
export function inventoryStatusLabel(status: PropertyStatus, listing?: Listing) {
  return ({ available: "Disponible", new: "Nouveau", sold: "Vendu", rented: "Loué", reserved: listing && listing !== "vente" ? "Réservé" : "Sous compromis" })[status] ?? status;
}
export function inventoryTransaction(value?: string): Listing {
  return value === "location" || value === "location-saisonniere" ? value : "vente";
}
export function sortInventory(properties: Property[], sort: string, counts: Record<string, number>) {
  if (sort === "recent") return [...properties]; // Input already ordered by creation date.
  return [...properties].sort((a, b) => {
    let result = 0;
    if (sort === "price-asc" || sort === "price-desc") {
      // Unknown prices always last. Do not compare a nightly rate to a monthly rent.
      if (!(a.price > 0) || !(b.price > 0)) result = Number(b.price > 0) - Number(a.price > 0);
      else {
        const unitA = a.listing === "vente" ? "vente" : a.priceUnit ?? "zz-inconnue";
        const unitB = b.listing === "vente" ? "vente" : b.priceUnit ?? "zz-inconnue";
        result = unitA.localeCompare(unitB) || (sort === "price-asc" ? a.price - b.price : b.price - a.price);
      }
    } else if (sort === "surface") result = (b.surface || 0) - (a.surface || 0);
    else if (sort === "requests") result = (counts[b.slug] || 0) - (counts[a.slug] || 0);
    else if (sort === "reference") result = a.reference.localeCompare(b.reference, "fr", { numeric: true });
    else result = a.title.localeCompare(b.title, "fr");
    return result || a.slug.localeCompare(b.slug);
  });
}
