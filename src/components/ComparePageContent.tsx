import { getAllProperties } from "@/lib/db";
import CompareView, { type ComparisonProperty } from "@/components/CompareView";


export default async function ComparePageContent({ locale = "fr" }: { locale?: "fr" | "en" }) {
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
    priceMad: property.priceMad,
    sourcePriceEur: property.sourcePriceEur,
    sourcePriceMad: property.sourcePriceMad,
    priceUnit: property.priceUnit,
    missingFields: property.missingFields,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    surface: property.surface,
    landSurface: property.landSurface,
    yearBuilt: property.yearBuilt,
    pool: property.pool,
    exclusivity: property.exclusivity,
    images: [property.images[0]],
  }));
  return <CompareView locale={locale} properties={properties} />;
}
