import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getAllPropertiesAdmin,
  getLeadsCountByProperty,
} from "@/lib/db";
import {
  propertyTypeLabel,
  type Listing,
} from "@/data/properties";
import BiensFilterBar, {
  type BiensViewMode,
} from "@/components/admin/BiensFilterBar";
import BiensGrid from "@/components/admin/BiensGrid";
import InventoryPhoto from "@/components/admin/InventoryPhoto";
import PropertyQuickActions from "@/components/admin/PropertyQuickActions";
import { requireAdminSession } from "@/lib/auth";
import { inventoryPrice, inventoryTransaction, sortInventory, TRANSACTION_LABELS } from "@/lib/admin-inventory";

export const metadata: Metadata = {
  title: "Biens — Admin Marrakech Realty",
  robots: { index: false, follow: false },
};

export default async function AdminBiensPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    zone?: string;
    vis?: string;
    view?: string;
    page?: string;
    listing?: string;
    sort?: string;
    missing?: string;
  }>;
}) {
  const sp = await searchParams;
  const session = await requireAdminSession();
  const canEdit = session.role === "director";
  // Old bookmarks used overlapping statuses. Canonicalize them to the new views.
  if (sp.status && !["reserved", "sold", "rented", "any"].includes(sp.status)) {
    const canonical = new URLSearchParams(Object.entries(sp).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    canonical.delete("status");
    canonical.delete("page");
    if (sp.status === "all") canonical.set("status", "any");
    redirect(`/admin/biens?${canonical.toString()}`);
  }

  const q = (sp.q ?? "").trim().toLowerCase();
  const statusFilter = sp.status ?? "active";
  const listing = inventoryTransaction(sp.listing);
  const typeFilter = sp.type ?? "all";
  const zoneFilter = sp.zone ?? "all";
  const visFilter = sp.vis ?? "all";
  const view: BiensViewMode = sp.view === "grid" ? "grid" : "table";

  const [properties, leadsByProp] = await Promise.all([
    getAllPropertiesAdmin(),
    getLeadsCountByProperty(),
  ]);
  const scoped = properties.filter((p) => p.listing === listing);
  const counts = Object.fromEntries((Object.keys(TRANSACTION_LABELS) as Listing[]).map((key) => [key, properties.filter((p) => p.listing === key && ["available", "new"].includes(p.status)).length])) as Record<Listing, number>;
  const types = [...new Set(scoped.map((p) => p.type))].sort((a, b) => propertyTypeLabel(a).localeCompare(propertyTypeLabel(b), "fr"));
  const zones = [...new Map(scoped.filter((p) => p.neighborhoodSlug).map((p) => [p.neighborhoodSlug, { slug: p.neighborhoodSlug, label: `${p.neighborhood || p.neighborhoodSlug} · ${p.city}` }])).values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));

  // Apply filters
  let filtered = scoped;
  const referenceCounts = new Map<string, number>();
  properties.forEach((p) => { const key = p.reference.trim().toUpperCase(); referenceCounts.set(key, (referenceCounts.get(key) ?? 0) + 1); });
  if (sp.missing === "reference") filtered = filtered.filter((p) => (referenceCounts.get(p.reference.trim().toUpperCase()) ?? 0) > 1);
  else if (sp.missing === "price") filtered = filtered.filter((p) => !(p.price > 0));
  else if (sp.missing === "neighborhood") filtered = filtered.filter((p) => !p.neighborhoodSlug);
  else if (sp.missing) filtered = filtered.filter((p) => p.missingFields?.includes(sp.missing!));
  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        (p.neighborhood ?? "").toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.tagline ?? "").toLowerCase().includes(q) ||
        (p.shortDescription ?? "").toLowerCase().includes(q)
    );
  }
  if (statusFilter === "active") {
    filtered = filtered.filter((p) => ["available", "new"].includes(p.status));
  } else if (statusFilter !== "any" && statusFilter !== "all") {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }
  if (typeFilter !== "all") {
    filtered = filtered.filter((p) => p.type === typeFilter);
  }
  if (zoneFilter !== "all") {
    filtered = filtered.filter((p) => p.neighborhoodSlug === zoneFilter);
  }
  if (visFilter === "published") {
    filtered = filtered.filter((p) => p.published !== false);
  } else if (visFilter === "unpublished") {
    filtered = filtered.filter((p) => p.published === false);
  } else if (visFilter === "featured") {
    filtered = filtered.filter((p) => p.featured === true);
  }

  const validSort = ["recent", "price-asc", "price-desc", "surface", "requests", "reference", "title"].includes(sp.sort ?? "recent") ? sp.sort ?? "recent" : "recent";
  filtered = sortInventory(filtered, validSort, leadsByProp);
  const totalActiveListings = scoped.filter(
    (p) => p.status === "available" || p.status === "new"
  ).length;
  const totalSold = scoped.filter((p) => p.status === "sold" || p.status === "rented").length;
  const totalReserved = scoped.filter((p) => p.status === "reserved").length;
  const pageSize = 32;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const requestedPage = Number(sp.page);
  const page = Math.min(pageCount, Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  const visibleProperties = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) if (value && key !== "page") params.set(key, value);
    params.set("page", String(target));
    return `/admin/biens?${params.toString()}`;
  };

  return (
    <div>
      {/* HEADER */}
      <div className="border-b border-[var(--color-beige-warm)] bg-white px-5 py-6 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
              Portefeuille de biens
            </div>
            <h1 className="mt-2 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
              {TRANSACTION_LABELS[listing]}
              <span className="ml-3 text-[var(--color-stone)]">
                · {filtered.length}
              </span>
            </h1>
            <p className="mt-1 text-xs text-[var(--color-stone)]">
              {totalActiveListings} {listing === "vente" ? "à vendre" : "à louer"} · {totalReserved} {listing === "vente" ? "sous compromis" : "réservés"} ·{" "}
              {totalSold} archivés · {scoped.length} dans cette catégorie
            </p>
          </div>

        </div>
      </div>

      <BiensFilterBar listing={listing} counts={counts} types={types} zones={zones} />

      {/* CONTENU */}
      <div className="px-5 py-6 md:px-8">
        <p className="mb-4 text-xs text-[var(--color-stone)]">{filtered.length} résultats {validSort.startsWith("price") && "· Prix non renseignés en dernier ; tarifs locatifs regroupés par unité."}</p>
        {view === "grid" ? (
          <BiensGrid properties={visibleProperties} leadsCountBySlug={leadsByProp} returnHref={pageHref(page)} canEdit={canEdit} />
        ) : filtered.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[var(--color-beige-warm)] bg-white px-8 py-16 text-center">
            <div className="font-serif text-xl text-[var(--color-charcoal)]">
              Aucun bien ne matche.
            </div>
            <p className="mt-2 text-sm text-[var(--color-stone)]">
              Ajustez vos filtres.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-beige-warm)] overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
            {visibleProperties.map((p) => <article key={p.slug} className="grid items-center gap-4 p-4 sm:grid-cols-[112px_minmax(0,1fr)] xl:grid-cols-[112px_minmax(220px,1fr)_150px_330px]">
              <InventoryPhoto images={p.images} title={p.title} />
              <div className="min-w-0">
                <Link href={`/admin/biens/${p.slug}?returnTo=${encodeURIComponent(pageHref(page))}`} className="line-clamp-2 font-medium text-[var(--color-charcoal)] hover:underline">{p.title}</Link>
                <p className="mt-1 text-xs text-[var(--color-stone)]">{propertyTypeLabel(p.type)} · {[p.neighborhood, p.city].filter(Boolean).join(", ")} · Réf. {p.reference}</p>
                <p className="mt-1 text-xs text-[var(--color-stone)]">{[p.surface > 0 ? `${p.surface} m²` : null, p.bedrooms > 0 ? `${p.bedrooms} ch.` : null, `${leadsByProp[p.slug] ?? 0} demande(s)`].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="font-medium text-sm">{inventoryPrice(p)}</p>
              <PropertyQuickActions slug={p.slug} title={p.title} listing={p.listing} status={p.status} published={p.published !== false} canEdit={canEdit} />
            </article>)}
          </div>
        )}
        {pageCount > 1 && <nav aria-label="Pagination des biens" className="mt-6 flex items-center justify-between gap-4 text-sm"><span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} sur {filtered.length} biens</span><div className="flex items-center gap-4">{page > 1 && <Link href={pageHref(page - 1)} className="btn-outline">Précédent</Link>}<span>Page {page} / {pageCount}</span>{page < pageCount && <Link href={pageHref(page + 1)} className="btn-outline">Suivant</Link>}</div></nav>}
      </div>
    </div>
  );
}
