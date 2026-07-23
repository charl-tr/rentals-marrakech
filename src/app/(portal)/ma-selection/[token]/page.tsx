import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSavedSelectionByToken } from "@/lib/db";
import RestoreSelection from "@/components/RestoreSelection";

export const metadata: Metadata = {
  title: "Votre sélection — Marrakech Realty",
  robots: { index: false, follow: false },
};

// ── Restauration de sélection — espace sans mot de passe ────────────
// Le visiteur ouvre son lien magique sur N'IMPORTE quel appareil ; on lit sa
// sélection (favoris ou comparateur) rattachée au portal_token, puis le
// composant client la réinjecte dans le localStorage de cet appareil.
// Colmate la fuite #1 (sélection perdue entre appareils).
export default async function MaSelectionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validation UUID superficielle (évite les 404 larges sur des paths randoms)
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
  ) {
    notFound();
  }

  const selection = await getSavedSelectionByToken(token);
  if (!selection) notFound();

  return <RestoreSelection kind={selection.kind} slugs={selection.slugs} />;
}
