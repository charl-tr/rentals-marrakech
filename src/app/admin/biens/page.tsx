import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, ChevronRight, Star } from "lucide-react";
import {
  getAllPropertiesAdmin,
  getLeadsCountByProperty,
} from "@/lib/db";
import {
  propertyTypeLabel,
  type PropertyStatus,
  type Listing,
} from "@/data/properties";
import BiensFilterBar, {
  type BiensViewMode,
} from "@/components/admin/BiensFilterBar";
import BiensGrid from "@/components/admin/BiensGrid";
import { inventoryPrice, inventoryStatusLabel, inventoryTransaction, sortInventory, TRANSACTION_LABELS } from "@/lib/admin-inventory";

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
          <BiensGrid properties={visibleProperties} leadsCountBySlug={leadsByProp} returnHref={pageHref(page)} />
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
          <div className="overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
            <div className="grid grid-cols-[60px_minmax(240px,2fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(80px,0.5fr)_minmax(60px,0.4fr)_20px] items-center gap-3 border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
              <div></div>
              <div>Bien</div>
              <div>{listing === "vente" ? "Prix de vente" : "Loyer / tarif"}</div>
              <div>Statut</div>
              <div className="text-center">Visibilité</div>
              <div className="text-center">Demandes</div>
              <div></div>
            </div>

            <div className="divide-y divide-[var(--color-beige-warm)]">
              {visibleProperties.map((p) => (
                <Link
                  key={p.slug}
                  href={`/admin/biens/${p.slug}?returnTo=${encodeURIComponent(pageHref(page))}`}
                  className="group grid grid-cols-[60px_minmax(240px,2fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(80px,0.5fr)_minmax(60px,0.4fr)_20px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-cream)]"
                >
                  {/* Thumbnail */}
                  <div className="relative h-12 w-14 flex-shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-beige)]">
                    {p.images[0] && (
                      <Image
                        src={p.images[0]}
                        alt={p.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Title + meta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                        {p.title}
                      </span>
                      {p.featured && (
                        <Star
                          size={10}
                          fill="currentColor"
                          className="flex-shrink-0 text-[var(--color-terracotta)]"
                        />
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
                      {propertyTypeLabel(p.type)} · {[p.neighborhood, p.city].filter(Boolean).join(", ")} · Réf. {p.reference}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-stone)]">{[p.surface > 0 ? `${p.surface} m²` : null, p.bedrooms > 0 ? `${p.bedrooms} ch.` : null].filter(Boolean).join(" · ")}</div>
                  </div>

                  {/* Price */}
                  <div className="font-serif text-sm text-[var(--color-charcoal)]">
                    {inventoryPrice(p)}
                  </div>

                  {/* Status */}
                  <StatusBadge status={p.status} listing={listing} />

                  {/* Visibility */}
                  <div className="flex items-center justify-center gap-1">
                    {p.published === false ? (
                      <span
                        title="Masqué"
                        className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--color-stone-soft)]"
                      >
                        Off
                      </span>
                    ) : (
                      <Check
                        size={12}
                        className="text-[var(--color-success)]"
                        strokeWidth={2.5}
                      />
                    )}
                    {p.featured && (
                      <Star
                        size={10}
                        className="text-[var(--color-terracotta)]"
                        fill="currentColor"
                      />
                    )}
                  </div>

                  {/* Leads count */}
                  <div className="text-center">
                    <span
                      className={`font-serif text-base ${
                        (leadsByProp[p.slug] ?? 0) > 0
                          ? "text-[var(--color-terracotta)]"
                          : "text-[var(--color-stone-soft)]"
                      }`}
                    >
                      {leadsByProp[p.slug] ?? 0}
                    </span>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-[var(--color-stone-soft)] transition-colors group-hover:text-[var(--color-terracotta)]"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
        {pageCount > 1 && <nav aria-label="Pagination des biens" className="mt-6 flex items-center justify-between gap-4 text-sm"><span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} sur {filtered.length} biens</span><div className="flex items-center gap-4">{page > 1 && <Link href={pageHref(page - 1)} className="btn-outline">Précédent</Link>}<span>Page {page} / {pageCount}</span>{page < pageCount && <Link href={pageHref(page + 1)} className="btn-outline">Suivant</Link>}</div></nav>}
      </div>
    </div>
  );
}

function StatusBadge({ status, listing }: { status: PropertyStatus; listing: Listing }) {
  const style =
    status === "sold" || status === "rented"
      ? "bg-[#795238] text-white"
      : status === "reserved"
      ? "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]"
      : status === "new"
      ? "bg-[var(--color-charcoal)] text-white"
      : "bg-[var(--color-success-soft)] text-[var(--color-success)]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${style}`}
    >
      {inventoryStatusLabel(status, listing)}
    </span>
  );
}
