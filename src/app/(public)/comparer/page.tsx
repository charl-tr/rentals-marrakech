import type { Metadata } from "next";
import { getAllProperties } from "@/lib/db";
import CompareView, { type ComparisonProperty } from "./CompareView";

export const metadata: Metadata = {
  title: "Comparer des biens — Marrakech Realty",
  description:
    "Comparez jusqu'à 3 biens côte à côte : prix, surface, chambres, équipements.",
  alternates: { canonical: "/comparer" },
  robots: { index: false, follow: false },
};

export default async function ComparerPage() {
  // On charge tous les biens publiés. Le filtrage visuel selon
  // localStorage se fait côté client dans CompareView.
  const properties: ComparisonProperty[] = (await getAllProperties()).map((property) => ({
    slug: property.slug,
    reference: property.reference,
    title: property.title,
    type: property.type,
    listing: property.listing,
    city: property.city,
    neighborhood: property.neighborhood,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    surface: property.surface,
    landSurface: property.landSurface,
    yearBuilt: property.yearBuilt,
    pool: property.pool,
    exclusivity: property.exclusivity,
    images: [property.images[0]],
  }));
  return <CompareView properties={properties} />;
}
