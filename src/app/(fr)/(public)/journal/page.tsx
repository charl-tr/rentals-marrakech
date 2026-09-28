import type { Metadata } from "next";
import Content from "@/components/JournalPageContent";
export const metadata: Metadata = {
  title: "Journal — Marrakech Realty",
  description:
    "Le magazine éditorial de l'agence : marché, restauration, art de vivre marocain, portraits de quartiers et de propriétaires.",
  alternates: { canonical: "/journal" },
};
export default function Page() { return <Content />; }
