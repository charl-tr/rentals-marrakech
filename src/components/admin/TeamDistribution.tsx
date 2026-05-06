import Link from "next/link";
import { AlertCircle, Crown } from "lucide-react";
import {
  slaStatus,
  type AdminLead,
} from "@/lib/leads";
import type { Advisor } from "@/data/properties";

interface AdvisorStats {
  advisor: Advisor;
  total: number;
  active: number; // non-terminaux
  inFunnel: number; // qualified + visit_scheduled + visit_done
  offers: number;
  signed: number;
  lost: number;
  slaBreaches: number;
}

function computeStats(
  advisor: Advisor,
  leads: AdminLead[],
  now: Date
): AdvisorStats {
  const theirs = leads.filter((l) => l.advisorSlug === advisor.slug);
  const active = theirs.filter((l) => l.status !== "signed" && l.status !== "lost");
  const inFunnel = theirs.filter((l) =>
    l.status === "qualified" ||
    l.status === "visit_scheduled" ||
    l.status === "visit_done"
  );
  const offers = theirs.filter((l) => l.status === "offer");
  const signed = theirs.filter((l) => l.status === "signed");
  const lost = theirs.filter((l) => l.status === "lost");
  const slaBreaches = active.filter((l) => slaStatus(l, now) === "breach");

  return {
    advisor,
    total: theirs.length,
    active: active.length,
    inFunnel: inFunnel.length,
    offers: offers.length,
    signed: signed.length,
    lost: lost.length,
    slaBreaches: slaBreaches.length,
  };
}

export default function TeamDistribution({
  leads,
  advisors,
  directorSlug,
}: {
  leads: AdminLead[];
  advisors: Advisor[];
  directorSlug: string | null;
}) {
  const now = new Date();
  const stats = advisors
    .map((a) => computeStats(a, leads, now))
    .sort((a, b) => b.active - a.active);

  const totalActive = stats.reduce((s, x) => s + x.active, 0);
  const totalBreaches = stats.reduce((s, x) => s + x.slaBreaches, 0);

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[var(--color-charcoal)]">
            Répartition équipe
          </h2>
          <p className="mt-1 text-xs text-[var(--color-stone)]">
            {totalActive} dossiers actifs · {totalBreaches} SLA dépassés
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-[var(--color-beige-warm)] bg-white">
        {/* Header */}
        <div className="grid grid-cols-[minmax(180px,2fr)_repeat(5,minmax(0,1fr))_minmax(80px,1fr)] border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          <div>Conseiller</div>
          <div className="text-right">Actifs</div>
          <div className="text-right">En funnel</div>
          <div className="text-right">Offres</div>
          <div className="text-right">Signés</div>
          <div className="text-right">Perdus</div>
          <div className="text-right text-[var(--color-alert)]">SLA ⚠</div>
        </div>

        {stats.map(({ advisor, total, active, inFunnel, offers, signed, lost, slaBreaches }) => {
          const isDirector = advisor.slug === directorSlug;
          return (
            <Link
              key={advisor.slug}
              href={`/admin/equipe/${advisor.slug}`}
              className="group grid grid-cols-[minmax(180px,2fr)_repeat(5,minmax(0,1fr))_minmax(80px,1fr)] items-center border-b border-[var(--color-beige-warm)] px-5 py-4 transition-colors hover:bg-[var(--color-cream)] last:border-b-0"
            >
              {/* Advisor */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-[11px] font-medium uppercase text-white">
                  {advisor.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((s) => s[0].toUpperCase())
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="truncate font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                      {advisor.name}
                    </div>
                    {isDirector && (
                      <Crown size={11} className="flex-shrink-0 text-[var(--color-terracotta)]" />
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                    {advisor.role.split("—")[1]?.trim() ?? advisor.role}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <Metric value={active} muted={active === 0} />
              <Metric value={inFunnel} muted={inFunnel === 0} />
              <Metric value={offers} accent={offers > 0} />
              <Metric value={signed} success={signed > 0} />
              <Metric value={lost} muted />
              <Metric
                value={slaBreaches}
                alert={slaBreaches > 0}
                alertIcon={slaBreaches > 0}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Metric({
  value,
  muted = false,
  accent = false,
  success = false,
  alert = false,
  alertIcon = false,
}: {
  value: number;
  muted?: boolean;
  accent?: boolean;
  success?: boolean;
  alert?: boolean;
  alertIcon?: boolean;
}) {
  const cls = alert
    ? "text-[var(--color-alert)]"
    : accent
    ? "text-[var(--color-terracotta)]"
    : success
    ? "text-[var(--color-success)]"
    : muted
    ? "text-[var(--color-stone-soft)]"
    : "text-[var(--color-charcoal)]";

  return (
    <div className={`flex items-center justify-end gap-1 font-serif text-xl ${cls}`}>
      {alertIcon && <AlertCircle size={12} className="text-[var(--color-alert)]" />}
      {value}
    </div>
  );
}
