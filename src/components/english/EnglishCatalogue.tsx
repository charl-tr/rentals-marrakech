import type { PropertySummary } from "@/data/properties";
import Catalogue from "@/components/Catalogue";

// Routing adapter only. Both languages render the exact same catalogue.
export default function EnglishCatalogue({ properties, title, base, query, fixedType }: { properties: PropertySummary[]; title: string; base: string; query: Record<string, string>; fixedType?: string }) {
  const rental = base.startsWith("/en/rent");
  const rentalType = rental && (fixedType === "villa" || fixedType === "appartement");
  const seasonal = base === "/en/rent/holiday-rentals";
  const heading = rentalType ? `${fixedType === "villa" ? "Villas" : "Apartments"} to rent.` : title;
  const subtitle = rentalType
    ? fixedType === "villa" ? "Furnished long-term rentals in secure estates." : "Long-term rentals in premium residences."
    : undefined;
  return <Catalogue locale="en" properties={properties}
    inventory={base === "/en/sold-properties" ? "sold" : "active"}
    eyebrow={rental ? "Rent — Marrakech & Essaouira" : "Property — Marrakech & Essaouira"}
    title={heading}
    subtitle={subtitle}
    breadcrumbs={[{ label: "Home", href: "/en" }, { label: title }]}
    prefilter={(property) => !fixedType || property.type === fixedType}
    filterMode={rental ? "location" : "vente"}
    baseHref={base} backFallbackHref={rental ? "/en/rent" : "/en/buy"}
    selectedFilters={query}
    visibleFilters={rentalType ? { neighborhood: true, budget: true, bedrooms: true } : seasonal ? { neighborhood: true, city: true, bedrooms: true } : { type: !fixedType, neighborhood: true, city: true, budget: true, bedrooms: true, duration: rental }}
  />;
}
