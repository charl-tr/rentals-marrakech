import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Calendar,
  FileSignature,
  Home,
  Mail,
  MessageCircle,
  Phone,
  ScrollText,
  Users,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import {
  getAdvisor,
  getAllLeads,
  getMandatesByAdvisor,
  getRecentEventsByAdvisor,
  getPropertyBySlug,
} from "@/lib/db";
import {
  STATUS_LABELS as LEAD_STATUS_LABELS,
  relativeTime,
  slaStatus,
} from "@/lib/leads";
import { MANDATE_TYPE_LABELS, mandateExpiryBadge } from "@/lib/mandates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const advisor = await getAdvisor(slug);
  return {
    title: advisor ? `${advisor.name} · Portefeuille` : "Conseiller",
    robots: { index: false, follow: false },
  };
}

export default async function AdvisorPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const now = new Date();
  const { slug } = await params;
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Advisor ne peut voir que son propre portfolio (sauf director)
  if (session.role !== "director" && session.advisorSlug !== slug) {
    redirect(`/admin/equipe/${session.advisorSlug}`);
  }

  const advisor = await getAdvisor(slug);
  if (!advisor) notFound();

  const [allLeads, mandates, recentEvents] = await Promise.all([
    getAllLeads({ assignedAdvisorSlug: slug }),
    getMandatesByAdvisor(slug),
    getRecentEventsByAdvisor(slug, 20),
  ]);

  const isDirectorProfile = advisor.slug === session.advisorSlug && session.role === "director";

  // ── Stats
  const activeLeads = allLeads.filter(
    (l) => l.status !== "signed" && l.status !== "lost"
  );
  const slaBreaches = activeLeads.filter(
    (l) => slaStatus(l, now) === "breach"
  );
  const visitsUpcoming = allLeads.filter(
    (l) =>
      l.nextVisit &&
      new Date(l.nextVisit.at).getTime() > now.getTime() &&
      new Date(l.nextVisit.at).getTime() <
        now.getTime() + 7 * 24 * 3_600_000
  );
  const offersPending = allLeads.filter((l) => l.status === "offer");

  // Temps médian de 1ère réponse (h) — calculé depuis les leads ayant first_action_at
  const responseTimes = allLeads
    .filter((l) => l.firstResponseAt)
    .map(
      (l) =>
        (new Date(l.firstResponseAt!).getTime() -
          new Date(l.createdAt).getTime()) /
        3_600_000
    )
    .sort((a, b) => a - b);
  const medianResponseH =
    responseTimes.length > 0
      ? responseTimes[Math.floor(responseTimes.length / 2)]
      : null;

  const initials = advisor.name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase())
    .slice(0, 2)
    .join("");

  // Pour la section "Biens en mandat", on a besoin des Property titres.
  // `mandates` a juste property_slug — enrichissons avec les titres.
  const mandatesEnriched = await Promise.all(
    mandates.map(async (m) => {
      const p = await getPropertyBySlug(m.propertySlug);
      return { mandate: m, property: p };
    })
  );

  return (
    <div className="container-luxe py-10 md:py-14">
      <Link
        href="/admin/equipe"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
      >
        <ArrowLeft size={12} />
        Retour à l&apos;équipe
      </Link>

      {/* HEADER */}
      <div className="mt-6 flex flex-col gap-6 border-b border-[var(--color-beige-warm)] pb-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-xl font-medium uppercase text-white">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
                {advisor.name}
              </h1>
              {isDirectorProfile && (
                <span className="rounded-full bg-[var(--color-terracotta)] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white">
                  Directeur
                </span>
              )}
            </div>
            <div className="mt-2 text-sm text-[var(--color-stone)]">
              {advisor.role}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-stone)]">
              {advisor.languages.length > 0 && (
                <span>Langues : {advisor.languages.join(" · ")}</span>
              )}
              {advisor.yearsExperience > 0 && (
                <>
                  <span>·</span>
                  <span>{advisor.yearsExperience} ans d&apos;expérience</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contacts rapides */}
        <div className="flex flex-wrap items-center gap-2">
          {advisor.phone && (
            <a
              href={`tel:${advisor.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
            >
              <Phone size={12} />
              Appeler
            </a>
          )}
          {advisor.whatsapp && (
            <a
              href={`https://wa.me/${advisor.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          )}
          {advisor.email && (
            <a
              href={`mailto:${advisor.email}`}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
            >
              <Mail size={12} />
              Mail
            </a>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-0 overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white md:grid-cols-5 md:divide-x md:divide-[var(--color-beige-warm)]">
        <Kpi label="Leads actifs" value={activeLeads.length} />
        <Kpi
          label="Mandats actifs"
          value={mandates.length}
          icon={ScrollText}
        />
        <Kpi
          label="Visites (7j)"
          value={visitsUpcoming.length}
          icon={Calendar}
        />
        <Kpi
          label="Offres en cours"
          value={offersPending.length}
          icon={FileSignature}
          accent={offersPending.length > 0}
        />
        <Kpi
          label="SLA ⚠"
          value={slaBreaches.length}
          alert={slaBreaches.length > 0}
        />
      </div>

      {medianResponseH !== null && (
        <div className="mt-4 text-xs text-[var(--color-stone)]">
          Temps de 1ʳᵉ réponse médian :{" "}
          <span className="font-medium text-[var(--color-charcoal)]">
            {medianResponseH < 1
              ? `${Math.round(medianResponseH * 60)} min`
              : `${medianResponseH.toFixed(1)} h`}
          </span>{" "}
          · calculé sur {responseTimes.length} leads traités
        </div>
      )}

      {/* GRID : leads + mandats */}
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Leads actifs */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 font-serif text-2xl text-[var(--color-charcoal)]">
              <Users size={16} />
              Leads actifs
              <span className="text-[var(--color-stone)]">
                · {activeLeads.length}
              </span>
            </h2>
            <Link
              href={`/admin/leads?advisor=${slug}`}
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
            >
              Tous les leads →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-[var(--color-beige-warm)] overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
            {activeLeads.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-stone)]">
                Aucun lead actif.
              </div>
            ) : (
              activeLeads.slice(0, 8).map((lead) => {
                const sla = slaStatus(lead, now);
                return (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="group flex items-center gap-3 p-4 transition-colors hover:bg-[var(--color-cream)]"
                  >
                    <div
                      className={`h-2 w-2 flex-shrink-0 rounded-full ${
                        sla === "breach"
                          ? "bg-[var(--color-alert)]"
                          : sla === "watch"
                          ? "bg-[var(--color-warning)]"
                          : "bg-[var(--color-success)]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                        {lead.buyer.firstName} {lead.buyer.lastName}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
                        {LEAD_STATUS_LABELS[lead.status]} ·{" "}
                        {relativeTime(lead.lastActivityAt, now)}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Mandats actifs */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 font-serif text-2xl text-[var(--color-charcoal)]">
              <Briefcase size={16} />
              Mandats en cours
              <span className="text-[var(--color-stone)]">
                · {mandates.length}
              </span>
            </h2>
            <Link
              href={`/admin/biens?advisor=${slug}`}
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
            >
              Tous les biens →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-[var(--color-beige-warm)] overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
            {mandatesEnriched.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-stone)]">
                Aucun mandat actif.
              </div>
            ) : (
              mandatesEnriched.map(({ mandate: m, property: p }) => {
                const expiry = mandateExpiryBadge(m, now);
                return (
                  <Link
                    key={m.id}
                    href={`/admin/biens/${m.propertySlug}`}
                    className="group flex items-center gap-3 p-4 transition-colors hover:bg-[var(--color-cream)]"
                  >
                    {p?.images[0] && (
                      <div className="relative h-12 w-14 flex-shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-beige)]">
                        <Image
                          src={p.images[0]}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                        {p?.title ?? m.propertySlug}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--color-stone)]">
                        <span>{MANDATE_TYPE_LABELS[m.type]}</span>
                        {m.exclusivity && (
                          <span className="text-[var(--color-terracotta)]">★</span>
                        )}
                        {expiry && (
                          <>
                            <span>·</span>
                            <span
                              className={
                                expiry.status === "expired"
                                  ? "text-[var(--color-alert)]"
                                  : expiry.status === "watch"
                                  ? "text-[var(--color-warning)]"
                                  : ""
                              }
                            >
                              {expiry.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Visites à venir */}
      {visitsUpcoming.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-[var(--color-charcoal)]">
            <Calendar size={16} />
            Visites cette semaine
            <span className="text-[var(--color-stone)]">
              · {visitsUpcoming.length}
            </span>
          </h2>

          <div className="mt-5 divide-y divide-[var(--color-beige-warm)] overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white">
            {visitsUpcoming.slice(0, 6).map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="group grid grid-cols-[80px_1fr_auto] items-center gap-4 p-4 transition-colors hover:bg-[var(--color-cream)]"
              >
                <div className="flex flex-col items-center rounded-[10px] border border-[var(--color-beige-warm)] bg-white py-2">
                  <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-[var(--color-terracotta)]">
                    {new Intl.DateTimeFormat("fr-FR", { month: "short" })
                      .format(new Date(lead.nextVisit!.at))
                      .toUpperCase()}
                  </div>
                  <div className="font-serif text-2xl text-[var(--color-charcoal)]">
                    {new Date(lead.nextVisit!.at).getDate()}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                    {lead.buyer.firstName} {lead.buyer.lastName}
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-stone)]">
                    {new Intl.DateTimeFormat("fr-FR", {
                      weekday: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(lead.nextVisit!.at))}
                    {" · "}
                    {lead.nextVisit!.confirmed ? "confirmée" : "à confirmer"}
                  </div>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-[var(--color-stone-soft)] group-hover:text-[var(--color-terracotta)]"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Activité récente */}
      {recentEvents.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-[var(--color-charcoal)]">
            <Activity size={16} />
            Activité récente
          </h2>
          <div className="mt-5 space-y-4">
            {recentEvents.map((ev) => (
              <div key={ev.id} className="flex gap-3 text-sm">
                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-cream)] text-[var(--color-charcoal)]">
                  {ev.source === "lead" ? (
                    <Users size={11} />
                  ) : (
                    <Home size={11} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[var(--color-stone)]">
                    <span className="font-medium text-[var(--color-charcoal)]">
                      {ev.type.replace(/_/g, " ")}
                    </span>
                    {" · "}
                    <Link
                      href={
                        ev.source === "lead"
                          ? `/admin/leads/${ev.refId}`
                          : `/admin/biens/${ev.refId}`
                      }
                      className="hover:text-[var(--color-terracotta)]"
                    >
                      {ev.source === "lead" ? "lead" : "bien"} →
                    </Link>
                    {" · "}
                    {relativeTime(ev.createdAt, now)}
                  </div>
                  {ev.body && (
                    <div className="mt-1 text-sm text-[var(--color-charcoal)]">
                      {ev.body}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Primitives ─────────────────────────────────────────────────────

function Kpi({
  label,
  value,
  icon: Icon,
  accent = false,
  alert = false,
}: {
  label: string;
  value: number;
  icon?: React.ElementType;
  accent?: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`p-6 ${accent ? "bg-[var(--color-cream)]" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          {label}
        </div>
        {Icon && (
          <Icon
            size={12}
            className={
              alert
                ? "text-[var(--color-alert)]"
                : accent
                ? "text-[var(--color-terracotta)]"
                : "text-[var(--color-stone)]"
            }
          />
        )}
      </div>
      <div
        className={`mt-2 font-serif text-3xl ${
          alert
            ? "text-[var(--color-alert)]"
            : accent
            ? "text-[var(--color-terracotta)]"
            : value === 0
            ? "text-[var(--color-stone-soft)]"
            : "text-[var(--color-charcoal)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
