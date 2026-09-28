import type { PropertySummary } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
export default function EnglishPropertyCard({ property }: { property: PropertySummary }) {
  return <PropertyCard property={property} locale="en" />;
}
