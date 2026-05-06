// ════════════════════════════════════════════════════════════════════
// Skeleton primitives — placeholders animés pour loading states.
//
// Design : fond beige animé (pulse discret), respectueux des tokens,
// pas de spinner rotatif (daté, visuellement "cheap").
// ════════════════════════════════════════════════════════════════════

export function Skeleton({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-beige)] ${className}`}
      aria-hidden
    >
      {children}
    </div>
  );
}

/** Ligne de texte skeleton. */
export function SkeletonLine({
  className = "",
  width = "100%",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <Skeleton
      className={`h-3 ${className}`}
      {...({ style: { width } } as object)}
    />
  );
}

/** Row d'une table admin (pour LeadsTable / Biens table). */
export function SkeletonTableRow() {
  return (
    <div className="grid grid-cols-[32px_1.4fr_0.8fr_2fr_0.8fr_0.5fr_0.6fr_20px] items-center gap-3 border-b border-[var(--color-beige-warm)] px-4 py-3.5">
      <Skeleton className="h-2 w-2 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/2 opacity-60" />
      </div>
      <Skeleton className="h-5 w-16" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-2.5 w-2/3 opacity-60" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4 mx-auto rounded-full" />
      <Skeleton className="h-3 w-12 justify-self-end" />
      <div />
    </div>
  );
}

/** Card grille bien. */
export function SkeletonCard() {
  return (
    <div className="overflow-hidden border border-[var(--color-beige-warm)] bg-white">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-2.5 w-1/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-3 flex items-center justify-between border-t border-[var(--color-beige-warm)] pt-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

/** Header de page admin (titre + sous-titre + bouton). */
export function SkeletonPageHeader() {
  return (
    <div className="border-b border-[var(--color-beige-warm)] bg-white px-5 py-6 md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

/** KPI card. */
export function SkeletonKpi() {
  return (
    <div className="p-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
    </div>
  );
}
