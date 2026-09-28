import { Skeleton, SkeletonPageHeader } from "@/components/admin/_primitives/Skeleton";

export default function MatchingLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <div className="px-5 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-[14px]" />
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-[14px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
