import { Skeleton, SkeletonPageHeader } from "@/components/admin/_primitives/Skeleton";

export default function BienDetailLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <div className="space-y-6 px-5 py-6 md:px-8">
        <Skeleton className="aspect-[16/10] w-full rounded-[14px]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-[14px]" />
          <Skeleton className="h-56 rounded-[14px]" />
        </div>
      </div>
    </div>
  );
}
