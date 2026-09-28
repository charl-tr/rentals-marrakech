import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AlertCircle,
  Bed,
  Calendar,
  Check,
  FileSignature,
  Globe,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  NotebookPen,
  Phone,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import {
  STATUS_LABELS,
  relativeTime,
  slaStatus,
  type AdminLeadComm,
  type LeadStatus,
} from "@/lib/leads";
import {
  getAdvisor,
  getAllPropertiesAdmin,
  getLeadById,
  getPropertiesBySlugs,
  getPropertyBySlug,
  getShortlistForLead,
} from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { formatPrice } from "@/data/properties";
import StatusChanger from "@/components/admin/StatusChanger";
import NoteComposer from "@/components/admin/NoteComposer";
import NextActionCard from "@/components/admin/NextActionCard";
import QuickLogCall from "@/components/admin/QuickLogCall";
import LeadShortcuts from "@/components/admin/LeadShortcuts";
import ShortlistManager from "@/components/admin/ShortlistManager";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import VisitScheduler from "@/components/admin/VisitScheduler";
import { computeNextAction } from "@/lib/next-best-action";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadById(id);
  return {
    title: lead
      ? `${lead.buyer.firstName} ${lead.buyer.lastName} · Admin`
      : "Lead · Admin",
    robots: { index: false, follow: false },
  };
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const now = new Date();
  const { id } = await params;
  const session = await getAdminSession();
  const lead = await getLeadById(id, session);
  if (!lead) notFound();

  const [advisor, sourceProperty, shortlist, allProperties] = await Promise.all([
    lead.advisorSlug ? getAdvisor(lead.advisorSlug) : null,
    lead.sourcePropertySlug ? getPropertyBySlug(lead.sourcePropertySlug) : null,
    getShortlistForLead(lead.id),
    getAllPropertiesAdmin(),
  ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const portalUrl = `${siteUrl}/mon-espace/${lead.portalToken}`;
  const canEditShortlist =
    session?.role === "director" ||
    (session?.role === "advisor" && session.advisorSlug === lead.advisorSlug);

  // Director qui consulte le lead d'un autre conseiller → bandeau de contexte
  const isDirectorViewingOther =
    session?.role === "director" &&
    lead.advisorSlug &&
    lead.advisorSlug !== session.advisorSlug;

  // Next-best-action — le système suggère quoi faire
  const nba = computeNextAction(lead, now);

  const viewed = lead.propertiesViewed ?? [];
  const viewedMap = await getPropertiesBySlugs(viewed);
  const viewedProps = viewed.map((s) => viewedMap.get(s) ?? null);

  const sla = slaStatus(lead, now);

  return (
    <div className="container-luxe py-10 md:py-14">
      {/* Raccourcis clavier contextuels : s, n, c */}
      <LeadShortcuts />

      <AdminBreadcrumbs
        crumbs={[
          { label: "Leads", href: "/admin/leads" },
          { label: `${lead.buyer.firstName} ${lead.buyer.lastName}`.trim() || lead.id },
        ]}
      />

      {isDirectorViewingOther && advisor && (
        <div className="mt-5 flex items-center gap-3 rounded-[10px] border-l-2 border-[var(--color-terracotta)] bg-white px-4 py-2.5 text-xs text-[var(--color-charcoal)]">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-terracotta)]">
            Vue directrice
          </span>
          <span className="text-[var(--color-stone)]">
            — lead assigné à <span className="text-[var(--color-charcoal)]">{advisor.name}</span>.
            Tes actions sont loguées sous ton nom.
          </span>
        </div>
      )}

      {/* HEADER */}
      <div className="mt-6 flex flex-col gap-6 border-b border-[var(--color-beige-warm)] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-stone)]">
              {lead.id}
            </span>
            <StatusBadge status={lead.status} />
            <SlaBadge sla={sla} lead={lead} />
          </div>
          <h1 className="mt-4 font-serif text-4xl text-[var(--color-charcoal)] md:text-5xl">
            {lead.buyer.firstName} {lead.buyer.lastName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-stone)]">
            <span className="flex items-center gap-1.5">
              <Globe size={12} /> {lead.buyer.city}, {lead.buyer.country}
            </span>
            <span>·</span>
            <span>Langues : {lead.buyer.languages.join(" / ")}</span>
            <span>·</span>
            <span>
              Lead créé {relativeTime(lead.createdAt, now)}
            </span>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${lead.buyer.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-charcoal)] bg-white px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
          >
            <Phone size={12} />
            Appeler
          </a>
          <a
            href={`https://wa.me/${lead.buyer.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-charcoal)] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
          >
            <MessageCircle size={12} />
            WhatsApp
          </a>
          <QuickLogCall leadId={lead.id} />
          <StatusChanger leadId={lead.id} currentStatus={lead.status} />
        </div>
      </div>

      {/* NEXT-BEST-ACTION — ce que le système suggère + actions 1-clic */}
      {nba && (
        <NextActionCard
          leadId={lead.id}
          nba={nba}
          phone={lead.buyer.phone || null}
          whatsapp={lead.buyer.phone || null}
        />
      )}

      {/* MAIN GRID */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        {/* LEFT : buyer profile + bien d'origine */}
        <div className="space-y-8">
          {/* Profil acheteur */}
          <Section title="Profil acheteur" icon={User}>
            <dl className="space-y-4">
              <Row label="E-mail" value={
                <a
                  href={`mailto:${lead.buyer.email}`}
                  className="text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
                >
                  {lead.buyer.email}
                </a>
              } />
              <Row label="Téléphone" value={lead.buyer.phone} />
              <Row label="Origine" value={`${lead.buyer.city}, ${lead.buyer.country}`} />
              <Row
                label="Budget"
                value={
                  <span className="font-serif text-[var(--color-charcoal)]">
                    {lead.buyer.budget.min
                      ? `${(lead.buyer.budget.min / 1000).toFixed(0)}k — `
                      : "Jusqu'à "}
                    {(lead.buyer.budget.max / 1000000).toFixed(1)} M€
                  </span>
                }
              />
              <Row
                label="Types recherchés"
                value={lead.buyer.criteria.types.join(" · ")}
              />
              <Row
                label="Quartiers"
                value={lead.buyer.criteria.neighborhoods.join(" · ")}
              />
              <Row
                label="Minimum chambres"
                value={`${lead.buyer.criteria.bedroomsMin}`}
              />
              {lead.buyer.criteria.mustHave.length > 0 && (
                <Row
                  label="Critères bloquants"
                  value={lead.buyer.criteria.mustHave.join(" · ")}
                />
              )}
            </dl>
          </Section>

          {/* Bien d'origine */}
          {sourceProperty && (
            <Section title="Bien d'origine" icon={Home}>
              <Link
                href={`/acheter/${sourceProperty.slug}`}
                target="_blank"
                className="group block"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] bg-[var(--color-charcoal)]">
                  {sourceProperty.images[0] && (
                    <Image
                      src={sourceProperty.images[0]}
                      alt={sourceProperty.title}
                      fill
                      sizes="400px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute bottom-3 left-3 rounded-full bg-[var(--color-charcoal)]/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white">
                    Réf. {sourceProperty.reference}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                    {sourceProperty.neighborhood}, {sourceProperty.city}
                  </div>
                  <div className="mt-1 font-serif text-lg text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                    {sourceProperty.title}
                  </div>
                  <div className="mt-2 font-serif text-xl text-[var(--color-terracotta)]">
                    {formatPrice(
                      sourceProperty.price,
                      sourceProperty.listing,
                      sourceProperty.currency,
                      sourceProperty.priceUnit
                    )}
                  </div>
                </div>
              </Link>
            </Section>
          )}

          {/* Parcours sur le site */}
          {viewedProps.filter(Boolean).length > 1 && (
            <Section title="Parcours sur le site" icon={Target}>
              <p className="mb-4 text-xs text-[var(--color-stone)]">
                {viewedProps.filter(Boolean).length} biens consultés avant la
                prise de contact
              </p>
              <div className="space-y-2">
                {viewedProps.filter(Boolean).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-[10px] border border-[var(--color-beige-warm)] bg-white p-2.5"
                  >
                    <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-charcoal)]">
                      {p!.images[0] && (
                        <Image
                          src={p!.images[0]}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-[var(--color-charcoal)]">
                        {p!.title}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--color-stone)]">
                        {p!.neighborhood} ·{" "}
                        {formatPrice(p!.price, p!.listing, p!.currency, p!.priceUnit)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* RIGHT : comms log + advisor + offer */}
        <div className="space-y-8">
          {/* Shortlist portail client — nouveau */}
          <section>
            <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
              Espace client
            </div>
            <ShortlistManager
              leadId={lead.id}
              portalUrl={portalUrl}
              initialShortlist={shortlist}
              availableProperties={allProperties.map((p) => ({
                slug: p.slug,
                title: p.title,
                reference: p.reference,
                neighborhood: p.neighborhood,
                images: p.images,
                type: p.type,
                listing: p.listing,
              }))}
              canEdit={canEditShortlist}
            />
          </section>

          {/* Advisor assigné */}
          {advisor && (
            <div className="rounded-[14px] border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] p-6 text-white">
              <div className="flex items-center gap-4">
                {advisor.photo && (
                  <div className="relative h-14 w-14 overflow-hidden rounded-full">
                    <Image
                      src={advisor.photo}
                      alt={advisor.name}
                      fill
                      sizes="56px"
                      className="object-cover grayscale"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
                    Conseiller assigné
                  </div>
                  <div className="mt-1 font-serif text-xl">{advisor.name}</div>
                  <div className="text-xs text-white/60">
                    {advisor.role.split("—")[1]?.trim()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offer */}
          {lead.offer && (
            <Section title="Offre en cours" icon={FileSignature} accent>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                    Montant proposé
                  </div>
                  <div className="mt-1 font-serif text-3xl text-[var(--color-terracotta)]">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(lead.offer.amount)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                    Statut
                  </div>
                  <div className="mt-1 text-sm font-medium text-[var(--color-charcoal)]">
                    {lead.offer.status === "pending"
                      ? "Attente propriétaire"
                      : lead.offer.status === "accepted"
                      ? "Acceptée"
                      : "Refusée"}
                  </div>
                </div>
              </div>
              {sourceProperty && (
                <div className="mt-4 border-t border-[var(--color-beige-warm)] pt-4 text-xs text-[var(--color-stone)]">
                  Prix affiché :{" "}
                  {formatPrice(
                    sourceProperty.price,
                    sourceProperty.listing,
                    sourceProperty.currency,
                    sourceProperty.priceUnit
                  )}{" "}
                  · Écart :{" "}
                  <span
                    className={
                      lead.offer.amount < sourceProperty.price
                        ? "text-[var(--color-terracotta)]"
                        : ""
                    }
                  >
                    {(
                      ((lead.offer.amount - sourceProperty.price) /
                        sourceProperty.price) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              )}
            </Section>
          )}

          {/* Next visit */}
          {lead.nextVisit && (
            <Section title="Prochaine visite" icon={Calendar}>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-[10px] border border-[var(--color-beige-warm)] bg-white">
                  <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-[var(--color-terracotta)]">
                    {new Intl.DateTimeFormat("fr-FR", { month: "short" })
                      .format(new Date(lead.nextVisit.at))
                      .toUpperCase()}
                  </div>
                  <div className="font-serif text-2xl leading-none">
                    {new Date(lead.nextVisit.at).getDate()}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-[var(--color-charcoal)]">
                    {new Intl.DateTimeFormat("fr-FR", {
                      weekday: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(lead.nextVisit.at))}
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-stone)]">
                    {lead.nextVisit.confirmed
                      ? "Confirmée avec propriétaire"
                      : "En attente de confirmation"}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Visit scheduler */}
          <Section title="Programmer une visite" icon={Calendar}>
            <VisitScheduler
              leadId={lead.id}
              defaultPropertySlug={lead.sourcePropertySlug}
              existingVisit={
                lead.nextVisit
                  ? { at: lead.nextVisit.at, propertySlug: lead.nextVisit.propertySlug }
                  : null
              }
            />
          </Section>

          {/* Communications timeline */}
          <Section title="Historique des échanges" icon={MessageCircle}>
            <CommsTimeline comms={lead.communications} now={now} />

            <NoteComposer leadId={lead.id} />
          </Section>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  accent = false,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[14px] border ${
        accent
          ? "border-[var(--color-terracotta)]/40 bg-[var(--color-cream)]"
          : "border-[var(--color-beige-warm)] bg-white"
      } p-6`}
    >
      <div className="mb-5 flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
        <Icon size={12} />
        {title}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
      </dt>
      <dd className="text-right text-sm text-[var(--color-charcoal)]">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const style =
    status === "signed"
      ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
      : status === "lost"
      ? "bg-[var(--color-beige)] text-[var(--color-stone)]"
      : status === "offer"
      ? "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]"
      : "bg-[var(--color-charcoal)]/10 text-[var(--color-charcoal)]";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] ${style}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function SlaBadge({
  sla,
  lead,
}: {
  sla: "ok" | "watch" | "breach" | "resolved";
  lead: { createdAt: string };
}) {
  if (sla === "resolved") {
    return (
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
        <Check size={10} /> Traité
      </span>
    );
  }
  const labels = {
    ok: "SLA Ok",
    watch: "À traiter",
    breach: "SLA dépassé",
  } as const;
  const colors = {
    ok: "text-[var(--color-success)] bg-[var(--color-success-soft)]",
    watch: "text-[var(--color-warning)] bg-[var(--color-warning-soft)]",
    breach: "text-[var(--color-alert)] bg-[var(--color-alert-soft)]",
  } as const;
  const Icon = sla === "breach" ? AlertCircle : sla === "watch" ? AlertCircle : Check;
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] ${colors[sla]}`}
    >
      <Icon size={10} />
      {labels[sla]}
    </span>
  );
}

function CommsTimeline({ comms, now }: { comms: AdminLeadComm[]; now: Date }) {
  if (comms.length === 0)
    return (
      <div className="text-sm text-[var(--color-stone)]">
        Aucun échange pour le moment.
      </div>
    );
  return (
    <div className="space-y-5">
      {comms.map((c) => {
        const isInbound = c.direction === "inbound";
        return (
          <div key={c.id} className="flex gap-4">
            <div
              className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                isInbound
                  ? "bg-[var(--color-beige)] text-[var(--color-charcoal)]"
                  : c.channel === "note"
                  ? "bg-[var(--color-cream)] text-[var(--color-stone)]"
                  : "bg-[var(--color-charcoal)] text-white"
              }`}
            >
              {c.channel === "email" ? (
                <Mail size={13} />
              ) : c.channel === "whatsapp" ? (
                <MessageCircle size={13} />
              ) : c.channel === "phone" ? (
                <Phone size={13} />
              ) : c.channel === "meeting" ? (
                <Calendar size={13} />
              ) : (
                <NotebookPen size={13} />
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-baseline gap-2 text-xs text-[var(--color-stone)]">
                <span className="font-medium text-[var(--color-charcoal)]">
                  {c.by ?? (isInbound ? "Client" : "Système")}
                </span>
                <span>·</span>
                <span className="uppercase tracking-[0.18em]">{c.channel}</span>
                <span>·</span>
                <span>{relativeTime(c.at, now)}</span>
              </div>
              <div
                className={`mt-2 text-sm leading-relaxed ${
                  c.channel === "note"
                    ? "border-l-2 border-[var(--color-beige-warm)] pl-3 italic text-[var(--color-stone)]"
                    : "text-[var(--color-charcoal)]"
                }`}
              >
                {c.body}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
