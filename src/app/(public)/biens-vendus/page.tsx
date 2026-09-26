import type { Metadata } from "next";
import Catalogue from "@/components/Catalogue";

export const metadata: Metadata = {
  title: "Biens vendus — Marrakech Realty",
  description: "Découvrez les biens signalés vendus dans notre catalogue à Marrakech et Essaouira, et explorez les alternatives disponibles.",
  alternates: { canonical: "/biens-vendus" },
};

export default async function SoldPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, typeof value === "string" ? value : undefined]));
  return <Catalogue inventory="sold" eyebrow="Les archives" title="Biens vendus." subtitle="Ces biens ne sont plus disponibles. Les prix affichés sont les derniers prix d’annonce, pas les prix de transaction. Retrouvez des alternatives disponibles sur chaque fiche." baseHref="/biens-vendus" backFallbackHref="/acheter" prefilter={(p) => p.listing === "vente"} selectedFilters={filters} />;
}
