import type { Metadata } from "next";
import Content from "@/components/JournalPageContent";
export const metadata: Metadata = {
  title: "Journal — Marrakech Realty",
  description:
    "Une sélection de lectures du blog original de Marrakech Realty : frais d’achat, démarches et achat depuis l’étranger. Sources et dates indiquées.",
  alternates: { canonical: "/journal" },
};
export default function Page() { return <Content />; }
