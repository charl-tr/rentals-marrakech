import type { Metadata } from "next";
import Content from "@/components/AreasPageContent";
export const metadata: Metadata = {
  title: "Quartiers de Marrakech & Essaouira — Marrakech Realty",
  description:
    "Magazine éditorial : Médina, Palmeraie, Hivernage, Targa, Amelkis, Diabat… Choisir son quartier avant de choisir son bien.",
  alternates: { canonical: "/quartiers" },
};
export default function Page() { return <Content />; }
