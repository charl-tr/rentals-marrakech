import type { MetadataRoute } from "next";
import { ALL_TYPES, NEIGHBORHOODS } from "@/data/properties";
import {
  getAllArticles,
  getAllNeighborhoods,
  getAllPropertySlugs,
} from "@/lib/db";

const SITE_URL = "https://marrakechrealty.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [propertiesList, neighborhoodsList, articlesList] = await Promise.all([
    getAllPropertySlugs(),
    getAllNeighborhoods(),
    getAllArticles(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/acheter`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${SITE_URL}/louer`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/louer/villa`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/louer/appartement`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/louer/saisonnier`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/essaouira`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/essaouira/vente-villa`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${SITE_URL}/essaouira/vente-riad`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${SITE_URL}/essaouira/vente-terrain`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/essaouira/location-villa`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${SITE_URL}/quartiers`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/equipe`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/savoir-acheter`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/deposer-un-bien`, lastModified: now, changeFrequency: "yearly", priority: 0.85 },
    { url: `${SITE_URL}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Taxonomies /acheter/[type]
  const typePages: MetadataRoute.Sitemap = ALL_TYPES.map((t) => ({
    url: `${SITE_URL}/acheter/${t === "programme-neuf" ? "programmes-neufs" : t}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Geo-landings /acheter/villa/[quartier] — Marrakech uniquement
  const geoPages: MetadataRoute.Sitemap = NEIGHBORHOODS.filter(
    (n) => n.city === "Marrakech"
  ).map((n) => ({
    url: `${SITE_URL}/acheter/villa/${n.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Fiches biens — /acheter/<slug> (vente + programmes-neufs) et /louer/<slug>
  const propertyPages: MetadataRoute.Sitemap = propertiesList.map((p) => ({
    url: `${SITE_URL}/${p.listing === "vente" || p.type === "programme-neuf" ? "acheter" : "louer"}/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Quartiers — /quartiers/<slug> (uniquement les quartiers avec éditorial)
  const quartierPages: MetadataRoute.Sitemap = neighborhoodsList
    .filter((n) => n.paragraphs.length > 0)
    .map((n) => ({
      url: `${SITE_URL}/quartiers/${n.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  // Articles journal
  const journalPages: MetadataRoute.Sitemap = articlesList.map((a) => ({
    url: `${SITE_URL}/journal/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [
    ...staticPages,
    ...typePages,
    ...geoPages,
    ...propertyPages,
    ...quartierPages,
    ...journalPages,
  ];
}
