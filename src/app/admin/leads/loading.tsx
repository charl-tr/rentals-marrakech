import {
  SkeletonPageHeader,
  SkeletonTableRow,
  Skeleton,
} from "@/components/admin/_primitives/Skeleton";

export default function LeadsLoading() {
  return (
    <div>
      <SkeletonPageHeader />

      {/* FilterBar skeleton */}
      <div className="flex flex-col border-b border-[var(--color-beige-warm)] bg-white">
        <div className="flex overflow-x-auto border-b border-[var(--color-beige-warm)] px-5 md:px-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-3">
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 px-5 py-4 md:px-8">
          <Skeleton className="h-8 max-w-md flex-1" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex gap-2 border-t border-[var(--color-beige-warm)] px-5 py-3 md:px-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-24" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="px-5 py-6 md:px-8">
        <div className="overflow-hidden border border-[var(--color-beige-warm)] bg-white">
          <div className="border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-4 py-3">
            <Skeleton className="h-3 w-32" />
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonTableRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
