import { Skeleton, SkeletonPageHeader } from "@/components/admin/_primitives/Skeleton";

export default function AgendaLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <div className="space-y-4 px-5 py-6 md:px-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-20 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
