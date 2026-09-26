import { z } from "zod";

const text = z.string().trim().max(20000);
const optionalNumber = z.string().trim().transform((v) => v === "" ? null : Number(v))
  .pipe(z.number().int().min(0).max(2147483647).nullable());
const flag = z.enum(["true", "false"]).transform((v) => v === "true");
const lines = text.transform((v) => v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));

export const propertyEditorSchema = z.object({
  slug: z.string().min(1).max(250),
  updated_at: z.string().min(1),
  reference: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(500),
  tagline: text,
  type: z.enum(["riad-renove", "riad-a-renover", "villa", "appartement", "maison-hotes", "programme-neuf", "terrain", "autre"]),
  listing: z.enum(["vente", "location", "location-saisonniere"]),
  city: z.string().trim().min(1).max(150),
  neighborhood_slug: text.transform((v) => v || null),
  source_location_label: text,
  source_type_label: text,
  advisor_slug: text.transform((v) => v || null),
  price_eur: optionalNumber.transform((v) => v ?? 0),
  price_mad: optionalNumber,
  price_unit: z.enum(["", "mois", "semaine"]).transform((v) => v || null),
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  surface: optionalNumber,
  land_surface: optionalNumber,
  year_built: optionalNumber.refine((v) => v === null || (v >= 1000 && v <= 2200), "Année entre 1000 et 2200."),
  pool: flag,
  exclusivity: flag,
  short_description: text,
  description: text,
  features: lines,
  images: lines.pipe(z.array(z.url().refine((v) => {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password &&
      ["www.marrakechrealty.com", "bjdcdtwfqlmvwxkrfklt.supabase.co"].includes(u.hostname);
  }, "Utilisez une image Marrakech Realty ou du stockage Supabase du projet.")).max(100)),
  seo_title: z.string().trim().max(200),
  seo_description: z.string().trim().max(500),
});

export const EDITOR_FIELDS = Object.keys(propertyEditorSchema.shape);

export const EDITOR_GROUPS = [
  { title: "Identification et classement", fields: ["title", "reference", "type", "source_type_label", "listing", "city", "neighborhood_slug", "source_location_label", "advisor_slug", "tagline"] },
  { title: "Prix et caractéristiques", fields: ["price_eur", "price_mad", "price_unit", "bedrooms", "bathrooms", "surface", "land_surface", "year_built", "pool", "exclusivity"] },
  { title: "Description et équipements", fields: ["short_description", "description", "features"] },
  { title: "Photos et référencement", fields: ["images", "seo_title", "seo_description"] },
];

export const EDITOR_LABELS: Record<string, string> = {
  title: "Titre", reference: "Référence", type: "Catégorie", source_type_label: "Libellé du type affiché", listing: "Transaction",
  city: "Ville", neighborhood_slug: "Quartier — filtre catalogue", source_location_label: "Localisation affichée", advisor_slug: "Conseiller", tagline: "Accroche",
  price_eur: "Prix (€) — vide : sur demande", price_mad: "Prix (MAD)", price_unit: "Période du loyer", bedrooms: "Chambres", bathrooms: "Salles de bain",
  surface: "Surface habitable (m²)", land_surface: "Surface terrain (m²)", year_built: "Année de construction", pool: "Piscine", exclusivity: "Exclusivité",
  short_description: "Résumé", description: "Description complète", features: "Équipements — un par ligne",
  images: "Photos — une URL par ligne, couverture en premier", seo_title: "Titre SEO", seo_description: "Description SEO",
};
