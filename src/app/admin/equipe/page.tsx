import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Crown } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { getAllAdvisors, getAllLeads } from "@/lib/db";
import { getLeadsCount, slaStatus } from "@/lib/leads";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Équipe — Admin Marrakech Realty",
  robots: { index: false, follow: false },
};

export default async function AdminEquipePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Advisor non-director → redirige directement sur son propre portfolio
  if (session.role !== "director") {
    redirect(`/admin/equipe/${session.advisorSlug}`);
  }

  const [advisors, allLeads] = await Promise.all([
    getAllAdvisors(),
    getAllLeads(),
  ]);

  const now = new Date();

  // Pré-compute stats par advisor
  const statsByAdvisor = advisors.map((a) => {
    const leads = allLeads.filter((l) => l.advisorSlug === a.slug);
    const active = leads.filter(
      (l) => l.status !== "signed" && l.status !== "lost"
    );
    const counts = getLeadsCount(leads);
    const slaBreaches = active.filter((l) => slaStatus(l, now) === "breach");
    const offers = leads.filter((l) => l.status === "offer");
    return {
      advisor: a,
      total: leads.length,
      active: active.length,
      offers: offers.length,
      signed: counts.signed,
      slaBreaches: slaBreaches.length,
    };
  });

  return (
    <div>
      <div className="border-b border-[var(--color-beige-warm)] bg-white px-5 py-6 md:px-8">
        <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
          Portefeuilles
        </div>
        <h1 className="mt-2 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
          Équipe
          <span className="ml-3 text-[var(--color-stone)]">· {advisors.length}</span>
        </h1>
        <p className="mt-1 text-xs text-[var(--color-stone)]">
          Cliquer sur un conseiller pour voir son portefeuille complet (leads, biens, visites, performance).
        </p>
      </div>

      <div className="px-5 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statsByAdvisor.map(
            ({ advisor, active, offers, signed, slaBreaches }) => {
              const isDirector = advisor.slug === session.advisorSlug;
              const initials = advisor.name
                .split(/\s+/)
                .filter(Boolean)
                .map((s) => s[0].toUpperCase())
                .slice(0, 2)
                .join("");
              return (
                <Link
                  key={advisor.slug}
                  href={`/admin/equipe/${advisor.slug}`}
                  className="group flex flex-col border border-[var(--color-beige-warm)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-charcoal)] hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-sm font-medium uppercase text-white">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="truncate font-serif text-lg text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                          {advisor.name}
                        </div>
                        {isDirector && (
                          <Crown
                            size={12}
                            className="flex-shrink-0 text-[var(--color-terracotta)]"
                          />
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                        {advisor.role.split("—")[1]?.trim() ?? advisor.role}
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-[var(--color-stone-soft)] transition-colors group-hover:text-[var(--color-terracotta)]"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-2 border-t border-[var(--color-beige-warm)] pt-4">
                    <Mini label="Actifs" value={active} />
                    <Mini label="Offres" value={offers} accent={offers > 0} />
                    <Mini label="Signés" value={signed} />
                    <Mini
                      label="SLA ⚠"
                      value={slaBreaches}
                      alert={slaBreaches > 0}
                    />
                  </div>
                </Link>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  accent = false,
  alert = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
  alert?: boolean;
}) {
  return (
    <div>
      <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
      </div>
      <div
        className={`mt-1 font-serif text-xl ${
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
