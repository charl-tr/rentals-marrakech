import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Check, ChevronRight, Star } from "lucide-react";
import {
  getAllPropertiesAdmin,
  getLeadsCountByProperty,
} from "@/lib/db";
import {
  STATUS_LABELS,
  formatPrice,
  propertyTypeLabel,
  type PropertyStatus,
} from "@/data/properties";
import BiensFilterBar, {
  type BiensViewMode,
} from "@/components/admin/BiensFilterBar";
import BiensGrid from "@/components/admin/BiensGrid";

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
  }>;
}) {
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().toLowerCase();
  const statusFilter = sp.status ?? "all";
  const typeFilter = sp.type ?? "all";
  const zoneFilter = sp.zone ?? "all";
  const visFilter = sp.vis ?? "all";
  const view: BiensViewMode = sp.view === "grid" ? "grid" : "table";

  const [properties, leadsByProp] = await Promise.all([
    getAllPropertiesAdmin(),
    getLeadsCountByProperty(),
  ]);

  // Apply filters
  let filtered = properties;
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
  if (statusFilter !== "all") {
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

  const totalActiveListings = properties.filter(
    (p) => p.status === "available" || p.status === "new"
  ).length;
  const totalSold = properties.filter((p) => p.status === "sold" || p.status === "rented").length;
  const totalReserved = properties.filter((p) => p.status === "reserved").length;

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
              Biens
              <span className="ml-3 text-[var(--color-stone)]">
                · {filtered.length}
              </span>
            </h1>
            <p className="mt-1 text-xs text-[var(--color-stone)]">
              {totalActiveListings} en commercialisation · {totalReserved} sous compromis ·{" "}
              {totalSold} vendus/loués · {properties.length} au total
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 bg-[var(--color-charcoal)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
          >
            + Nouveau bien
          </button>
        </div>
      </div>

      <BiensFilterBar />

      {/* CONTENU */}
      <div className="px-5 py-6 md:px-8">
        {view === "grid" ? (
          <BiensGrid properties={filtered} leadsCountBySlug={leadsByProp} />
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-[var(--color-beige-warm)] bg-white px-8 py-16 text-center">
            <div className="font-serif text-xl text-[var(--color-charcoal)]">
              Aucun bien ne matche.
            </div>
            <p className="mt-2 text-sm text-[var(--color-stone)]">
              Ajustez vos filtres.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-[var(--color-beige-warm)] bg-white">
            <div className="grid grid-cols-[60px_minmax(240px,2fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(80px,0.5fr)_minmax(60px,0.4fr)_20px] items-center gap-3 border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
              <div></div>
              <div>Bien</div>
              <div>Prix</div>
              <div>Statut</div>
              <div className="text-center">Visibilité</div>
              <div className="text-center">Leads</div>
              <div></div>
            </div>

            <div className="divide-y divide-[var(--color-beige-warm)]">
              {filtered.map((p) => (
                <Link
                  key={p.slug}
                  href={`/admin/biens/${p.slug}`}
                  className="group grid grid-cols-[60px_minmax(240px,2fr)_minmax(120px,0.8fr)_minmax(100px,0.7fr)_minmax(80px,0.5fr)_minmax(60px,0.4fr)_20px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-cream)]"
                >
                  {/* Thumbnail */}
                  <div className="relative h-12 w-14 flex-shrink-0 overflow-hidden bg-[var(--color-beige)]">
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
                      {propertyTypeLabel(p.type)} · {p.neighborhood}, {p.city} · Réf. {p.reference}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="font-serif text-sm text-[var(--color-charcoal)]">
                    {formatPrice(p.price, p.listing, p.currency, p.priceUnit)}
                  </div>

                  {/* Status */}
                  <StatusBadge status={p.status} />

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
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PropertyStatus }) {
  const style =
    status === "sold" || status === "rented"
      ? "bg-[var(--color-beige)] text-[var(--color-stone)]"
      : status === "reserved"
      ? "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]"
      : status === "new"
      ? "bg-[var(--color-charcoal)] text-white"
      : "bg-[var(--color-success-soft)] text-[var(--color-success)]";
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-[9px] font-medium uppercase tracking-[0.18em] ${style}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
