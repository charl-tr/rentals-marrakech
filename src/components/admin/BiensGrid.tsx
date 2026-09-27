import Link from "next/link";
import { propertyTypeLabel, type Property } from "@/data/properties";
import { inventoryPrice } from "@/lib/admin-inventory";
import InventoryPhoto from "./InventoryPhoto";
import PropertyQuickActions from "./PropertyQuickActions";

export default function BiensGrid({ properties, leadsCountBySlug, returnHref = "/admin/biens", canEdit = false }: {
  properties: Property[]; leadsCountBySlug: Record<string, number>; returnHref?: string; canEdit?: boolean;
}) {
  if (!properties.length) return <p className="rounded-xl border border-dashed p-8 text-center">Aucun bien ne correspond. Ajustez vos filtres.</p>;
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {properties.map((p) => <article key={p.slug} className="rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
      <InventoryPhoto images={p.images} title={p.title} large />
      <div className="space-y-3 p-4">
        <p className="text-xs text-[var(--color-stone)]">{propertyTypeLabel(p.type)} · {p.city} · Réf. {p.reference}</p>
        <Link className="block line-clamp-2 font-medium hover:underline" href={`/admin/biens/${p.slug}?returnTo=${encodeURIComponent(returnHref)}`}>{p.title}</Link>
        <div className="flex justify-between gap-2 text-sm"><span>{inventoryPrice(p)}</span><span>{leadsCountBySlug[p.slug] ?? 0} demande(s)</span></div>
        <PropertyQuickActions slug={p.slug} title={p.title} listing={p.listing} status={p.status} published={p.published !== false} canEdit={canEdit} />
        <Link href={`/admin/biens/${p.slug}?returnTo=${encodeURIComponent(returnHref)}`} className="flex min-h-11 items-center justify-center rounded-lg bg-[#795238] px-4 py-2 text-sm font-medium text-white hover:bg-[#62432f]">{canEdit ? "Modifier la fiche" : "Ouvrir la fiche"} →</Link>
      </div>
    </article>)}
  </div>;
}
