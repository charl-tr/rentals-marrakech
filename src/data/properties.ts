// Types et utilities pour les biens immobiliers.
// Les DONNÉES (properties[], advisors[], featuredProperties, getPropertyBySlug…)
// vivent désormais dans Supabase et sont accessibles via `@/lib/db`.
//
// Ce fichier ne contient plus que :
//   • Les types (PropertyType, Listing, Property, Advisor, …)
//   • Les utilities pures (propertyTypeLabel, formatPrice)
//   • Les constantes (NEIGHBORHOODS, ALL_TYPES) — listes statiques de référence

export type PropertyType =
  | "riad-renove"
  | "riad-a-renover"
  | "villa"
  | "appartement"
  | "maison-hotes"
  | "programme-neuf"
  | "terrain";

export type Listing = "vente" | "location" | "location-saisonniere";

export type PropertyStatus =
  | "available" // disponible (default)
  | "new"       // récemment listé (badge marketing)
  | "sold"      // vendu
  | "rented"    // loué
  | "reserved"; // sous compromis

export interface Advisor {
  slug: string;
  name: string;
  role: string;
  photo: string;
  phone: string;
  whatsapp: string;
  email: string;
  speciality: string;
  languages: string[];
  yearsExperience: number;
}

export interface Property {
  slug: string;
  reference: string;
  title: string;
  tagline: string;
  type: PropertyType;
  listing: Listing;
  status: PropertyStatus;
  exclusivity?: boolean;
  city: "Marrakech" | "Essaouira";
  neighborhood: string;
  neighborhoodSlug: string;
  price: number;
  currency: "EUR";
  priceMad?: number;          // prix en dirhams marocains, affiché à côté de l'EUR
  priceUnit?: "semaine" | "mois";
  bedrooms: number;
  bathrooms: number;
  surface: number;
  landSurface?: number;
  yearBuilt?: number;
  pool: boolean;
  featured?: boolean;
  published?: boolean;
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  ownerNotes?: string | null;
  shortDescription: string;
  story: { eyebrow: string; title: string; paragraphs: string[] };
  description: string;
  features: string[];
  images: string[];
  walkingDistances?: { label: string; minutes: number }[];
  coordinates: { lat: number; lng: number };
  advisorSlug: string;
}

const TYPE_LABELS: Record<PropertyType, string> = {
  "riad-renove": "Riad rénové",
  "riad-a-renover": "Riad à rénover",
  villa: "Villa",
  appartement: "Appartement",
  "maison-hotes": "Maison d'hôtes",
  "programme-neuf": "Programme neuf",
  terrain: "Terrain",
};

export const propertyTypeLabel = (t: PropertyType) => TYPE_LABELS[t];
export const ALL_TYPES = Object.keys(TYPE_LABELS) as PropertyType[];

const NEIGHBORHOODS_DATA = [
  { slug: "medina", label: "Médina", city: "Marrakech" as const },
  { slug: "hivernage", label: "Hivernage", city: "Marrakech" as const },
  { slug: "gueliz", label: "Guéliz", city: "Marrakech" as const },
  { slug: "palmeraie", label: "Palmeraie", city: "Marrakech" as const },
  { slug: "targa", label: "Targa", city: "Marrakech" as const },
  { slug: "amelkis", label: "Amelkis", city: "Marrakech" as const },
  { slug: "agdal", label: "Agdal", city: "Marrakech" as const },
  { slug: "ourika", label: "Route de l'Ourika", city: "Marrakech" as const },
  { slug: "fes", label: "Route de Fès", city: "Marrakech" as const },
  { slug: "ouarzazate", label: "Route de Ouarzazate", city: "Marrakech" as const },
  { slug: "amizmiz", label: "Route d'Amizmiz", city: "Marrakech" as const },
  { slug: "essaouira-medina", label: "Médina d'Essaouira", city: "Essaouira" as const },
  { slug: "diabat", label: "Diabat", city: "Essaouira" as const },
] as const;

export const NEIGHBORHOODS = NEIGHBORHOODS_DATA;
export type NeighborhoodSlug = (typeof NEIGHBORHOODS_DATA)[number]["slug"];

export const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  medina:            { lat: 31.6260, lng: -7.9841 },
  hivernage:         { lat: 31.6154, lng: -8.0011 },
  gueliz:            { lat: 31.6314, lng: -8.0082 },
  palmeraie:         { lat: 31.6643, lng: -7.9439 },
  targa:             { lat: 31.6016, lng: -8.0215 },
  amelkis:           { lat: 31.5907, lng: -7.9117 },
  agdal:             { lat: 31.6105, lng: -8.0010 },
  ourika:            { lat: 31.5650, lng: -7.9500 },
  fes:               { lat: 31.6900, lng: -7.9100 },
  ouarzazate:        { lat: 31.5700, lng: -7.8600 },
  amizmiz:           { lat: 31.5900, lng: -8.0600 },
  "essaouira-medina":{ lat: 31.5125, lng: -9.7700 },
  diabat:            { lat: 31.4840, lng: -9.7831 },
};

export const formatPrice = (
  price: number,
  listing: Listing,
  currency: "EUR" = "EUR",
  priceUnit: "semaine" | "mois" = "semaine"
) => {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
  if (listing === "vente") return formatted;
  return `${formatted} / ${priceUnit}`;
};

export const formatMad = (mad: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(mad)} MAD`;

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "",
  new: "Nouveau",
  sold: "Vendu",
  rented: "Loué",
  reserved: "Sous compromis",
};
