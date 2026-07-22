import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Bed,
  Home,
  MapPin,
  Ruler,
  User,
  Users,
} from "lucide-react";
import {
  getActiveMandateForProperty,
  getAdvisor,
  getAllAdvisors,
  getLeadsForProperty,
  getPropertyBySlug,
  getPropertyEvents,
} from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import OwnerMandateSection from "@/components/admin/OwnerMandateSection";
import PropertyTimeline from "@/components/admin/PropertyTimeline";
import { Activity } from "lucide-react";
import {
  STATUS_LABELS,
  formatPrice,
  propertyTypeLabel,
} from "@/data/properties";
import {
  STATUS_LABELS as LEAD_STATUS_LABELS,
  relativeTime,
} from "@/lib/leads";
import PropertyAdminActions from "@/components/admin/PropertyAdminActions";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const now = new Date();
  const session = await getAdminSession();
  const canEdit = session?.role === "director";

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [advisor, leads, mandate, events, allAdvisors] = await Promise.all([
    property.advisorSlug ? getAdvisor(property.advisorSlug) : null,
    getLeadsForProperty(slug),
    getActiveMandateForProperty(slug),
    getPropertyEvents(slug),
    getAllAdvisors(),
  ]);

  const activeLeads = leads.filter(
    (l) => l.status !== "signed" && l.status !== "lost"
  );

  const publicHref =
    property.listing === "vente" || property.type === "programme-neuf"
      ? `/acheter/${property.slug}`
      : `/louer/${property.slug}`;

  return (
    <div className="container-luxe py-10 md:py-14">
      <AdminBreadcrumbs
        crumbs={[
          { label: "Biens", href: "/admin/biens" },
          { label: property.title },
        ]}
      />

      {/* HEADER */}
      <div className="mt-6 flex flex-col gap-6 border-b border-[var(--color-beige-warm)] pb-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-stone)]">
              Réf. {property.reference}
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--color-charcoal)]/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)]">
              {propertyTypeLabel(property.type)}
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--color-cream)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)]">
              {property.listing === "vente"
                ? "Vente"
                : property.listing === "location-saisonniere"
                ? "Saisonnier"
                : "Location"}
            </span>
            {property.exclusivity && (
              <span className="inline-flex items-center rounded-full bg-[var(--color-terracotta)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
                ★ Exclusivité
              </span>
            )}
          </div>

          <h1 className="mt-4 font-serif text-3xl leading-tight text-[var(--color-charcoal)] md:text-4xl">
            {property.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-stone)]">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {property.neighborhood}, {property.city}
            </span>
            {property.bedrooms > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Bed size={12} /> {property.bedrooms} chambres
                </span>
              </>
            )}
            {property.surface > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Ruler size={12} /> {property.surface} m²
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={publicHref}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
          >
            Voir sur le site
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        {/* LEFT : aperçu + leads */}
        <div className="space-y-8">
          {/* Aperçu visuel */}
          {property.images[0] && (
            <section>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[14px] bg-[var(--color-charcoal)]">
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  className="object-cover"
                />
              </div>
              {property.images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {property.images.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[var(--color-beige)]"
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-[var(--color-stone)]">
                {property.images.length} photo{property.images.length > 1 ? "s" : ""} ·
                upload photo non encore disponible (géré depuis Supabase Studio pour l&apos;instant)
              </p>
            </section>
          )}

          {/* Leads générés */}
          <Section title={`Leads générés par ce bien · ${leads.length}`} icon={Users}>
            {leads.length === 0 ? (
              <p className="text-sm text-[var(--color-stone)]">
                Aucun lead généré par ce bien pour l&apos;instant.
              </p>
            ) : (
              <>
                <p className="mb-4 text-xs text-[var(--color-stone)]">
                  {activeLeads.length} actif{activeLeads.length > 1 ? "s" : ""} ·{" "}
                  {leads.length - activeLeads.length} clos
                </p>
                <div className="divide-y divide-[var(--color-beige-warm)]">
                  {leads.slice(0, 8).map((l) => (
                    <Link
                      key={l.id}
                      href={`/admin/leads/${l.id}`}
                      className="group flex items-center gap-3 py-3 transition-colors hover:bg-[var(--color-cream)]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                          {l.buyer.firstName} {l.buyer.lastName}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
                          {l.buyer.city}
                          {l.buyer.city && l.buyer.country ? ", " : ""}
                          {l.buyer.country} · {relativeTime(l.createdAt, now)}
                        </div>
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-[var(--color-cream)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)]">
                        {LEAD_STATUS_LABELS[l.status]}
                      </span>
                    </Link>
                  ))}
                </div>
                {leads.length > 8 && (
                  <Link
                    href={`/admin/leads?property=${property.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
                  >
                    Voir les {leads.length} leads →
                  </Link>
                )}
              </>
            )}
          </Section>

          {/* Description courte */}
          {property.shortDescription && (
            <Section title="Présentation" icon={Home}>
              <p className="text-sm leading-relaxed text-[var(--color-charcoal)]">
                {property.shortDescription}
              </p>
            </Section>
          )}

          {/* Timeline événements */}
          <Section title="Historique du bien" icon={Activity}>
            <PropertyTimeline events={events} advisors={allAdvisors} now={now} />
          </Section>
        </div>

        {/* RIGHT : actions + conseiller */}
        <div className="space-y-6">
          {/* Actions admin */}
          <div>
            <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
              Actions
            </div>
            <PropertyAdminActions
              slug={property.slug}
              currentStatus={property.status}
              currentPrice={property.price}
              isPublished={property.published ?? true}
              isFeatured={property.featured ?? false}
              canEdit={canEdit}
            />
          </div>

          {/* Propriétaire + mandat */}
          <OwnerMandateSection
            slug={property.slug}
            owner={{
              name: property.ownerName ?? null,
              phone: property.ownerPhone ?? null,
              email: property.ownerEmail ?? null,
              notes: property.ownerNotes ?? null,
            }}
            mandate={mandate}
            canEdit={canEdit}
          />

          {/* Conseiller assigné */}
          {advisor && (
            <Section title="Conseiller assigné" icon={User}>
              <div className="font-serif text-lg text-[var(--color-charcoal)]">
                {advisor.name}
              </div>
              <div className="mt-1 text-xs text-[var(--color-stone)]">
                {advisor.role}
              </div>
            </Section>
          )}

          {/* Méta */}
          <Section title="Métadonnées" icon={Home}>
            <dl className="space-y-3 text-sm">
              <Row label="Slug" value={property.slug} mono />
              <Row
                label="Statut commercial"
                value={STATUS_LABELS[property.status]}
              />
              <Row
                label="Prix affiché"
                value={formatPrice(
                  property.price,
                  property.listing,
                  property.currency,
                  property.priceUnit
                )}
              />
              {property.priceMad && (
                <Row
                  label="Prix MAD"
                  value={new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "MAD",
                    maximumFractionDigits: 0,
                  }).format(property.priceMad)}
                />
              )}
              {property.yearBuilt && (
                <Row label="Année construction" value={`${property.yearBuilt}`} />
              )}
              {property.landSurface && (
                <Row label="Surface terrain" value={`${property.landSurface} m²`} />
              )}
              <Row
                label="Publié"
                value={property.published ? "Oui" : "Non"}
              />
              <Row
                label="Mis en avant"
                value={property.featured ? "Oui" : "Non"}
              />
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-5">
      <div className="mb-4 flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
        <Icon size={12} />
        {title}
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
      </dt>
      <dd
        className={`text-right text-[var(--color-charcoal)] ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
