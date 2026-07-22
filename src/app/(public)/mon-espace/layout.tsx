// Portail acheteur — TEMPS RÉEL. Opt-out du cache ISR du groupe public :
// le client doit toujours voir l'état à jour de sa shortlist et de son
// parcours, jamais une version en cache.
export const dynamic = "force-dynamic";

export default function MonEspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
