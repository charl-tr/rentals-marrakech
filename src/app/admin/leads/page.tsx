import {
  LEAD_STATUSES,
  slaStatus,
  type AdminLead,
  type LeadStatus,
} from "@/lib/leads";
import { computeNextAction } from "@/lib/next-best-action";
import { getAllAdvisors, getAllLeads, getLeadsForSession } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import LeadsFilterBar, {
  type IntentFilter,
  type ScopeMode,
  type SlaFilter,
  type ViewMode,
} from "@/components/admin/LeadsFilterBar";
import LeadsTable from "@/components/admin/LeadsTable";
import LeadsKanban from "@/components/admin/LeadsKanban";
import ExportButton from "@/components/admin/ExportButton";

// Ordre de priorité NBA pour le tri Table
const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    scope?: string;
    status?: string;
    advisor?: string;
    sla?: string;
    q?: string;
    intent?: string;
  }>;
}) {
  const now = new Date();
  const sp = await searchParams;
  const session = await getAdminSession();
  const isDirector = session?.role === "director";

  // ── Scope (director only) ─────────────────────────────────────
  const scope: ScopeMode = !isDirector
    ? "mine"
    : sp.scope === "mine"
    ? "mine"
    : "team";

  // ── View mode ────────────────────────────────────────────────
  const view: ViewMode = sp.view === "kanban" ? "kanban" : "table";

  // ── Filtres ──────────────────────────────────────────────────
  const statusFilter: LeadStatus | null =
    sp.status && (LEAD_STATUSES as readonly string[]).includes(sp.status)
      ? (sp.status as LeadStatus)
      : null;
  const advisorFilter = sp.advisor ?? null;
  const slaFilter: SlaFilter =
    sp.sla === "breach" || sp.sla === "watch" || sp.sla === "ok"
      ? sp.sla
      : "all";
  const searchQuery = (sp.q ?? "").trim().toLowerCase();
  const intent: IntentFilter =
    sp.intent === "acheter" || sp.intent === "louer" || sp.intent === "vendre"
      ? sp.intent
      : "all";

  // ── Fetch ───────────────────────────────────────────────────
  const allLeads = await (isDirector && scope === "mine"
    ? getAllLeads({ assignedAdvisorSlug: session!.advisorSlug })
    : isDirector
    ? getAllLeads()
    : getLeadsForSession(session));
  const advisors = await getAllAdvisors();

  // ── Counts par intent (avant filtres, pour les tabs) ─────────
  const intentCounts: Record<IntentFilter, number> = {
    all: allLeads.length,
    acheter: allLeads.filter((l) => l.intent === "acheter").length,
    louer: allLeads.filter((l) => l.intent === "louer").length,
    vendre: allLeads.filter((l) => l.intent === "vendre").length,
  };

  // ── Apply filters ──────────────────────────────────────────
  let leads = allLeads;
  if (intent !== "all") {
    leads = leads.filter((l) => l.intent === intent);
  }
  if (statusFilter) leads = leads.filter((l) => l.status === statusFilter);
  if (advisorFilter) leads = leads.filter((l) => l.advisorSlug === advisorFilter);
  if (slaFilter !== "all") {
    leads = leads.filter((l) => slaStatus(l, now) === slaFilter);
  }
  if (searchQuery) {
    leads = leads.filter((l) => {
      return (
        l.buyer.firstName.toLowerCase().includes(searchQuery) ||
        l.buyer.lastName.toLowerCase().includes(searchQuery) ||
        l.buyer.email.toLowerCase().includes(searchQuery) ||
        l.buyer.phone.toLowerCase().includes(searchQuery) ||
        l.sourcePropertySlug.toLowerCase().includes(searchQuery)
      );
    });
  }

  // Le tri par priorité NBA est désormais géré par DataTable (defaultSort).
  // Pour le Kanban, l'ordre par colonne + date est géré par la vue Kanban elle-même.

  // Mapping advisor slug → prénom
  const advisorFirstBySlug: Record<string, string> = {};
  for (const a of advisors) advisorFirstBySlug[a.slug] = a.name.split(" ")[0];

  // Compteurs synthèse
  const totalActive = leads.filter(
    (l) => l.status !== "signed" && l.status !== "lost"
  ).length;
  const totalVisible = leads.length;

  return (
    <div>
      {/* HEADER */}
      <div className="border-b border-[var(--color-beige-warm)] bg-white px-5 py-6 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
              Pipeline commercial
            </div>
            <h1 className="mt-2 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
              Leads
              <span className="ml-3 text-[var(--color-stone)]">
                · {totalVisible}
              </span>
            </h1>
            <p className="mt-1 text-xs text-[var(--color-stone)]">
              {scope === "team" ? "Équipe entière" : "Mon portefeuille"}
              {isDirector ? "" : ""} · {totalActive} actif
              {totalActive > 1 ? "s" : ""}
              {totalVisible !== allLeads.length &&
                ` · ${allLeads.length} au total sans filtre`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ExportButton />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-charcoal)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
            >
              + Nouveau lead
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <LeadsFilterBar
        advisors={advisors}
        isDirector={isDirector}
        counts={intentCounts}
      />

      {/* CONTENT */}
      <div className="px-5 py-6 md:px-8">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] border border-[var(--color-beige-warm)] text-[var(--color-stone)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-charcoal)]">
              {allLeads.length === 0 ? "Aucun lead pour l'instant" : "Aucun lead ne correspond aux filtres"}
            </p>
            <p className="mt-1 text-xs text-[var(--color-stone)]">
              {allLeads.length === 0
                ? "Les nouveaux leads apparaîtront ici dès qu'un contact remplit un formulaire."
                : "Essaie de modifier ou réinitialiser les filtres actifs."}
            </p>
          </div>
        ) : view === "kanban" ? (
          <LeadsKanban
            leads={leads}
            advisorFirstBySlug={advisorFirstBySlug}
            now={now}
          />
        ) : (
          <LeadsTable
            leads={leads}
            advisorFirstBySlug={advisorFirstBySlug}
            now={now}
          />
        )}
      </div>
    </div>
  );
}
