import type { Metadata } from "next";
import { getPropertyPins } from "@/lib/db";
import MapClientWrapper from "@/components/MapClientWrapper";

export const metadata: Metadata = {
  title: "Carte des biens — Marrakech Realty",
  description:
    "Explorez notre catalogue de riads, villas et appartements à Marrakech et Essaouira sur une carte interactive.",
};

export default async function CartePage() {
  const pins = await getPropertyPins();

  return (
    // Plein écran sous la navbar fixe (h-14 lg:h-16)
    <div className="h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-4rem)]">
      <MapClientWrapper pins={pins} />
    </div>
  );
}
