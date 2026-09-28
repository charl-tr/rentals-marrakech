import { Skeleton, SkeletonPageHeader } from "@/components/admin/_primitives/Skeleton";

export default function LeadDetailLoading() {
  return (
    <div>
      <SkeletonPageHeader />
      <div className="px-5 py-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-[14px]" />
            <Skeleton className="h-64 rounded-[14px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-[14px]" />
            <Skeleton className="h-32 rounded-[14px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
