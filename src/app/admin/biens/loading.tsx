import {
  SkeletonPageHeader,
  SkeletonCard,
  Skeleton,
} from "@/components/admin/_primitives/Skeleton";

export default function BiensLoading() {
  return (
    <div>
      <SkeletonPageHeader />

      {/* FilterBar skeleton */}
      <div className="flex flex-col border-b border-[var(--color-beige-warm)] bg-white">
        <div className="flex items-center gap-3 px-5 py-4 md:px-8">
          <Skeleton className="h-8 max-w-md flex-1" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex gap-2 border-t border-[var(--color-beige-warm)] px-5 py-3 md:px-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-24" />
          ))}
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="px-5 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
