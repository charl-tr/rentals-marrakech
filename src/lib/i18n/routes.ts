export type Locale = "fr" | "en";

// Only presentation paths change. Property slugs, IDs and query values remain
// stable, including accents encoded in the URL. Never translate database keys.
const segments: Record<string, string> = {
  comparer: "compare", carte: "map", acheter: "buy", louer: "rent", "biens-vendus": "sold-properties",
  "deposer-un-bien": "sell", contact: "contact", favoris: "saved-properties",
  essaouira: "essaouira", "a-propos": "about", quartiers: "areas",
  "programmes-neufs": "new-developments", "riad-renove": "renovated-riads",
  "riad-a-renover": "riads-to-renovate", appartement: "apartments",
  villa: "villas", terrain: "land", autre: "commercial",
  "maison-hotes": "guesthouses", saisonnier: "holiday-rentals",
  "vente-villa": "villas-for-sale", "vente-riad": "riads-for-sale",
  "vente-terrain": "land-for-sale", "location-villa": "villas-to-rent",
};
const reverse = Object.fromEntries(Object.entries(segments).map(([a, b]) => [b, a]));

export function languagePath(input: string, locale: Locale): string {
  if (!input.startsWith("/") || input.startsWith("//")) return input;
  const url = new URL(input, "https://local.invalid");
  let parts = url.pathname.split("/").filter(Boolean);
  const wasEnglish = parts[0] === "en";
  if (wasEnglish || parts[0] === "fr") parts = parts.slice(1);
  // Translate known route/taxonomy segments only; full property slugs are kept.
  if (wasEnglish) parts = parts.map((part, index) => index < 2 ? reverse[part] ?? part : part);
  if (locale === "en") parts = parts.map((part, index) => index < 2 ? segments[part] ?? part : part);
  const path = (locale === "en" ? "/en" : "") + (parts.length ? `/${parts.join("/")}` : "");
  return (path || "/") + url.search + url.hash;
}

export function propertyEnglishPath(property: { listing: string; slug: string }) {
  return `/en/${property.listing === "vente" ? "buy" : "rent"}/${property.slug}`;
}
