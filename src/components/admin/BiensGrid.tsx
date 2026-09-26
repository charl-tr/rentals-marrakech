import Image from "next/image";
import Link from "next/link";
import { EyeOff, Star } from "lucide-react";
import {
  propertyTypeLabel,
  type Property,
  type PropertyStatus,
  type Listing,
} from "@/data/properties";
import { inventoryPrice, inventoryStatusLabel } from "@/lib/admin-inventory";

export default function BiensGrid({
  properties,
  leadsCountBySlug,
  returnHref = "/admin/biens",
}: {
  properties: Property[];
  leadsCountBySlug: Record<string, number>;
  returnHref?: string;
}) {
  if (properties.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[var(--color-beige-warm)] bg-white px-8 py-16 text-center">
        <div className="font-serif text-xl text-[var(--color-charcoal)]">
          Aucun bien ne matche.
        </div>
        <p className="mt-2 text-sm text-[var(--color-stone)]">
          Ajustez vos filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((p) => (
        <BienCard
          key={p.slug}
          property={p}
          returnHref={returnHref}
          leadsCount={leadsCountBySlug[p.slug] ?? 0}
        />
      ))}
    </div>
  );
}

function BienCard({
  property,
  leadsCount,
  returnHref,
}: {
  property: Property;
  leadsCount: number;
  returnHref: string;
}) {
  const unpublished = property.published === false;

  return (
    <Link
      href={`/admin/biens/${property.slug}?returnTo=${encodeURIComponent(returnHref)}`}
      className={`group flex flex-col overflow-hidden rounded-[14px] border bg-white transition-all hover:-translate-y-0.5 hover:border-[var(--color-charcoal)] hover:shadow-[var(--shadow-card)] ${
        unpublished
          ? "border-[var(--color-beige-warm)] opacity-80"
          : "border-[var(--color-beige-warm)]"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-beige)]">
        {property.images[0] && (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
          />
        )}

        {/* Status overlay top-left */}
        <div className="absolute left-2 top-2 flex gap-1.5">
          <StatusPill status={property.status} listing={property.listing} />
        </div>

        {/* Visibility overlay top-right */}
        <div className="absolute right-2 top-2 flex gap-1.5">
          {unpublished && (
            <span
              title="Masqué"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-charcoal)]/85 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm"
            >
              <EyeOff size={9} /> Off
            </span>
          )}
          {property.featured && (
            <span
              title="En avant"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-terracotta)] p-1 text-white"
            >
              <Star size={10} fill="currentColor" />
            </span>
          )}
        </div>

        {/* Reference bottom-right */}
        <div className="absolute bottom-2 right-2 rounded-full bg-[var(--color-charcoal)]/85 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm">
          {property.reference}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
          {propertyTypeLabel(property.type)} · {property.neighborhood}
        </div>
        <h3 className="mt-2 flex-1 font-serif text-base leading-snug text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
          {property.title}
        </h3>

        <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-[var(--color-beige-warm)] pt-3">
          <span className="font-serif text-lg text-[var(--color-charcoal)]">
            {inventoryPrice(property)}
          </span>
          {leadsCount > 0 && (
            <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-terracotta)]">
              {leadsCount} demande{leadsCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function StatusPill({ status, listing }: { status: PropertyStatus; listing: Listing }) {
  const style =
    status === "sold" || status === "rented"
      ? "bg-[#795238] text-white"
      : status === "reserved"
      ? "bg-[var(--color-terracotta)] text-white"
      : status === "new"
      ? "bg-[var(--color-charcoal)] text-white"
      : "bg-white/95 text-[var(--color-charcoal)]";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm ${style}`}
    >
      {inventoryStatusLabel(status, listing)}
    </span>
  );
}
