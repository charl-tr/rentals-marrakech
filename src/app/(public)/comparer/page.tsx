import type { Metadata } from "next";
import { getAllProperties } from "@/lib/db";
import CompareView from "./CompareView";

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
  const properties = await getAllProperties();
  return <CompareView properties={properties} />;
}
