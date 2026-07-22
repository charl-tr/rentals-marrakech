// Portail propriétaire — TEMPS RÉEL. Opt-out du cache ISR du groupe public :
// le vendeur doit toujours voir l'état à jour de son mandat (visites,
// offres, progression), jamais une version en cache.
export const dynamic = "force-dynamic";

export default function MonBienLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
