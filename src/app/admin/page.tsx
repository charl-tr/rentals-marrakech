import Link from "next/link";
import { Suspense } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  FileSignature,
  Sparkles,
} from "lucide-react";
import {
  KANBAN_COLUMNS,
  STATUS_LABELS,
  getLeadsCount,
  relativeTime,
  slaStatus,
  type AdminLead,
} from "@/lib/leads";
import { getAllAdvisors, getAllPropertiesAdmin, getLeadsForSession } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { buildPropertyMatches } from "@/lib/matching";
import TeamDistribution from "@/components/admin/TeamDistribution";
import type { AdminSession } from "@/lib/auth";

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

export default async function AdminDashboardPage() {
  const now = new Date();
  const session = await getAdminSession();
  const firstName = session?.advisorName.split(" ")[0] ?? "vous";
  const scopeLabel = session?.role === "director" ? "Vue maison" : "Mon portefeuille";

  return (
    <div className="container-luxe py-12 md:py-16">
      {/* HEADER — renders instantly, no DB */}
      <div className="flex flex-col gap-6 border-b border-[var(--color-beige-warm)] pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
            {formatDate(now)}
          </div>
          <h1 className="mt-4 font-serif text-4xl text-[var(--color-charcoal)] md:text-5xl">
            Bonjour {firstName}.
          </h1>
          <p className="mt-3 text-lg text-[var(--color-stone)]">
            {scopeLabel}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--color-stone)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-terracotta)]" />
          Système actif · dernier rafraîchissement à l&apos;instant
        </div>
      </div>

      {/* BODY — streams in as DB resolves */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBody session={session} now={now} />
      </Suspense>
    </div>
  );
}

// ── Streaming body ──────────────────────────────────────────────────────

async function DashboardBody({
  session,
  now,
}: {
  session: AdminSession | null;
  now: Date;
}) {
  const isDirector = session?.role === "director";

  const [leads, advisors, allProperties] = await Promise.all([
    getLeadsForSession(session),
    isDirector ? getAllAdvisors() : Promise.resolve([]),
    getAllPropertiesAdmin(),
  ]);

  const matchingResults = buildPropertyMatches(allProperties, leads);
  const topMatch = matchingResults[0];

  const counts = getLeadsCount(leads);
  const totalActive = leads.filter(
    (l) => l.status !== "signed" && l.status !== "lost"
  ).length;
  const visitsScheduled = leads.filter((l) => l.status === "visit_scheduled").length;
  const offersPending = leads.filter((l) => l.status === "offer").length;
  const signedThisMonth = counts.signed;
  const urgentLeads = leads.filter((l) => slaStatus(l, now) === "breach");
  const freshThisWeek = leads.filter((l) => {
    const age = now.getTime() - new Date(l.createdAt).getTime();
    return age < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <>
      {/* Lead count in subtitle — updated once streamed */}
      <p className="-mt-2 mb-8 text-sm text-[var(--color-stone)]">
        {leads.length} dossier{leads.length > 1 ? "s" : ""}
      </p>

      {/* KPI CARDS */}
      <div className="grid gap-0 border border-[var(--color-beige-warm)] bg-white md:grid-cols-4 md:divide-x md:divide-[var(--color-beige-warm)]">
        <KpiCard
          value={totalActive}
          label="leads actifs"
          sub={`${freshThisWeek} entrés cette semaine`}
        />
        <KpiCard
          value={visitsScheduled}
          label="visites programmées"
          icon={Calendar}
        />
        <KpiCard
          value={offersPending}
          label="offres en cours"
          icon={FileSignature}
          accent
        />
        <KpiCard
          value={signedThisMonth}
          label="signés ce mois"
          icon={Check}
        />
      </div>

      {/* 2-COL GRID : urgent + matching */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* URGENT */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
              À traiter aujourd&apos;hui
            </h2>
            <Link
              href="/admin/leads"
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
            >
              Tous les leads →
            </Link>
          </div>

          <div className="mt-6 divide-y divide-[var(--color-beige-warm)] border border-[var(--color-beige-warm)] bg-white">
            {urgentLeads.length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--color-stone)]">
                Rien d&apos;urgent. Tous les SLA tiennent.
              </div>
            )}
            {urgentLeads.map((lead) => (
              <UrgentLeadRow key={lead.id} lead={lead} now={now} />
            ))}
          </div>
        </section>

        {/* MATCHING */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
              Matching
            </h2>
            <Link
              href="/admin/matching"
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
            >
              Voir tous →
            </Link>
          </div>

          {topMatch ? (
            <Link
              href="/admin/matching"
              className="group mt-6 block border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] p-6 text-white transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
                <Sparkles size={12} />
                Top match actif
              </div>

              <div className="mt-5 font-serif text-2xl leading-tight md:text-3xl">
                {topMatch.property.title}
              </div>
              <div className="mt-2 text-sm text-white/70">
                {topMatch.property.neighborhood}, {topMatch.property.city} ·{" "}
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(topMatch.property.price)}
              </div>

              <div className="mt-6 border-t border-white/20 pt-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-5xl text-[var(--color-terracotta-light)]">
                    {topMatch.matches.length}
                  </span>
                  <span className="text-sm text-white/80">
                    acheteurs actifs correspondent
                  </span>
                </div>
                <div className="mt-4 text-xs text-white/70">
                  {topMatch.matches.slice(0, 3).map((m, i) => (
                    <span key={i}>
                      {m.lead.buyer.firstName} {m.lead.buyer.lastName.charAt(0)}.{" "}
                      <span className="text-white/40">({m.score}%)</span>
                      {i < 2 ? "  ·  " : null}
                    </span>
                  ))}{" "}
                  {topMatch.matches.length > 3 && (
                    <span className="text-white/40">
                      + {topMatch.matches.length - 3} autres
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-terracotta-light)] group-hover:text-white">
                Voir tous les matchings
                <ArrowRight size={14} />
              </div>
            </Link>
          ) : (
            <div className="mt-6 border border-[var(--color-beige-warm)] bg-white p-8 text-center">
              <p className="text-sm text-[var(--color-stone)]">Aucun matching actif.</p>
            </div>
          )}
        </section>
      </div>

      {/* TEAM DISTRIBUTION — director only */}
      {isDirector && (
        <TeamDistribution
          leads={leads}
          advisors={advisors}
          directorSlug={session?.advisorSlug ?? null}
        />
      )}

      {/* PIPELINE MINI */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">Pipeline</h2>
          <Link
            href="/admin/leads"
            className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
          >
            Ouvrir le Kanban →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-0 border border-[var(--color-beige-warm)] bg-white md:grid-cols-6 md:divide-x md:divide-[var(--color-beige-warm)]">
          {KANBAN_COLUMNS.map((status) => (
            <Link
              key={status}
              href={`/admin/leads?status=${status}`}
              className="group block p-6 transition-colors hover:bg-[var(--color-cream)]"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                {STATUS_LABELS[status]}
              </div>
              <div className="mt-3 font-serif text-4xl text-[var(--color-charcoal)] transition-colors group-hover:text-[var(--color-terracotta)]">
                {counts[status]}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-4 w-24 bg-[var(--color-beige-warm)]" />
      <div className="grid gap-0 border border-[var(--color-beige-warm)] bg-white md:grid-cols-4 md:divide-x md:divide-[var(--color-beige-warm)]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-8">
            <div className="h-3 w-20 bg-[var(--color-beige-warm)]" />
            <div className="mt-4 h-12 w-14 bg-[var(--color-beige-warm)]" />
          </div>
        ))}
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          <div className="h-7 w-40 bg-[var(--color-beige-warm)]" />
          <div className="border border-[var(--color-beige-warm)] bg-white p-8">
            <div className="h-4 w-48 bg-[var(--color-beige-warm)]" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-7 w-24 bg-[var(--color-beige-warm)]" />
          <div className="h-48 bg-[var(--color-beige-warm)]" />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────

function KpiCard({
  value,
  label,
  sub,
  icon: Icon,
  accent = false,
}: {
  value: number | string;
  label: string;
  sub?: string;
  icon?: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`p-8 ${accent ? "bg-[var(--color-cream)]" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          {label}
        </div>
        {Icon && (
          <Icon
            size={14}
            className={accent ? "text-[var(--color-terracotta)]" : "text-[var(--color-stone)]"}
          />
        )}
      </div>
      <div className="mt-3 font-serif text-5xl text-[var(--color-charcoal)]">
        {value}
      </div>
      {sub && (
        <div className="mt-2 text-xs text-[var(--color-stone)]">{sub}</div>
      )}
    </div>
  );
}

function UrgentLeadRow({ lead, now }: { lead: AdminLead; now: Date }) {
  const waiting = slaStatus(lead, now) === "breach";
  const bienLabel = lead.sourcePropertySlug
    ? lead.sourcePropertySlug.split("-").slice(0, 4).join(" ") + "..."
    : "hors bien";
  const sourceLabel = sourceLabels[lead.source] ?? lead.source;
  return (
    <Link
      href={`/admin/leads/${lead.id}`}
      className="group flex items-center gap-4 p-5 transition-colors hover:bg-[var(--color-cream)]"
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
          waiting
            ? "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]"
            : "bg-[var(--color-beige)] text-[var(--color-charcoal)]"
        }`}
      >
        {waiting ? <AlertCircle size={14} /> : <Clock size={14} />}
      </div>
      <div className="flex-1">
        <div className="font-medium text-[var(--color-charcoal)]">
          {lead.buyer.firstName} {lead.buyer.lastName}{" "}
          <span className="ml-1 text-sm font-normal text-[var(--color-stone)]">
            attend une réponse · {relativeTime(lead.createdAt, now)}
          </span>
        </div>
        <div className="mt-1 text-xs text-[var(--color-stone)]">
          Bien : {bienLabel} · source : {sourceLabel}
        </div>
      </div>
      <ChevronRight
        size={16}
        className="text-[var(--color-stone)] transition-colors group-hover:text-[var(--color-terracotta)]"
      />
    </Link>
  );
}

const sourceLabels: Record<string, string> = {
  contact_form: "formulaire contact",
  property_form: "fiche bien",
  whatsapp: "WhatsApp",
  email: "email",
  phone: "téléphone",
  matching: "matching",
};
