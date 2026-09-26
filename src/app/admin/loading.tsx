import { SkeletonPageHeader, SkeletonTableRow } from "@/components/admin/_primitives/Skeleton";

export default function AdminLoading() {
  return <div aria-busy="true" aria-label="Chargement de la section"><SkeletonPageHeader /><div className="px-5 py-6 md:px-8">{Array.from({ length: 6 }, (_, index) => <SkeletonTableRow key={index} />)}</div></div>;
}
