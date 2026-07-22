// Template — re-monté à chaque navigation. Enveloppe le contenu dans un
// fondu léger (0.25s) pour une transition douce entre les pages, au lieu
// d'un remplacement sec. Respecte prefers-reduced-motion (cf. globals.css).

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
