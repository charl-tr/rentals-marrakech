// Écran de chargement instantané — affiché dès le clic (Suspense boundary
// du groupe public), pendant que le serveur rend la page. Supprime la
// sensation de "figé" : la navigation répond immédiatement.

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-[var(--color-cream)]">
      <div className="animate-slow-pulse font-serif text-2xl tracking-[0.08em] text-[var(--color-charcoal)]">
        Marrakech Realty
      </div>
      <div className="animate-slow-pulse h-px w-12 bg-[var(--color-terracotta)]" />
    </div>
  );
}
