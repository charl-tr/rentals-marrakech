import type { Metadata } from "next";
import ComparePageContent from "@/components/ComparePageContent";
export const metadata: Metadata = {
  title: "Comparer des biens — Marrakech Realty",
  description:
    "Comparez jusqu'à 3 biens côte à côte : prix, surface, chambres, équipements.",
  alternates: { canonical: "/comparer" },
  robots: { index: false, follow: false },
};
export default function Page() { return <ComparePageContent />; }
