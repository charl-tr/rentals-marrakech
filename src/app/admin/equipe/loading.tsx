import {
  SkeletonPageHeader,
  Skeleton,
} from "@/components/admin/_primitives/Skeleton";

export default function EquipeLoading() {
  return (
    <div>
      <SkeletonPageHeader />

      <div className="px-5 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex flex-col border border-[var(--color-beige-warm)] bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-11 w-11 flex-shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2 opacity-60" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 border-t border-[var(--color-beige-warm)] pt-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-2.5 w-10 opacity-60" />
                    <Skeleton className="mt-1 h-5 w-8" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
