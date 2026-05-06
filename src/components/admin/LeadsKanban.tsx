import Link from "next/link";
import { AlertCircle, Check, Clock } from "lucide-react";
import {
  KANBAN_COLUMNS,
  STATUS_LABELS,
  relativeTime,
  slaStatus,
  type AdminLead,
  type LeadStatus,
} from "@/lib/leads";

// Colonnes Kanban — on inclut tous les statuts actifs. visit_done et lost
// sont optionnels et s'activent si des leads existent dans ces stades.
const KANBAN_COLUMNS_EXTENDED: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "visit_done",
  "offer",
  "signed",
  "lost",
];

export default function LeadsKanban({
  leads,
  advisorFirstBySlug,
  now,
}: {
  leads: AdminLead[];
  advisorFirstBySlug: Record<string, string>;
  now: Date;
}) {
  return (
    <div className="grid grid-flow-col auto-cols-[min(300px,85vw)] gap-4 overflow-x-auto pb-6 md:auto-cols-[minmax(220px,1fr)]">
      {KANBAN_COLUMNS_EXTENDED.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          leads={leads.filter((l) => l.status === status)}
          advisorFirstBySlug={advisorFirstBySlug}
          now={now}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  status,
  leads,
  advisorFirstBySlug,
  now,
}: {
  status: LeadStatus;
  leads: AdminLead[];
  advisorFirstBySlug: Record<string, string>;
  now: Date;
}) {
  const isTerminal = status === "signed" || status === "lost";

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between border-b-2 px-2 pb-2.5 ${
          status === "signed"
            ? "border-[var(--color-terracotta)]"
            : status === "lost"
            ? "border-[var(--color-stone-soft)]"
            : "border-[var(--color-charcoal)]"
        }`}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)]">
            {STATUS_LABELS[status]}
          </span>
          <span className="text-xs text-[var(--color-stone)]">{leads.length}</span>
        </div>
        {status === "signed" && <Check size={12} className="text-[var(--color-terracotta)]" />}
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {leads.length === 0 ? (
          <div className="border border-dashed border-[var(--color-beige-warm)] px-3 py-6 text-center text-[11px] text-[var(--color-stone)]">
            —
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              advisorFirst={advisorFirstBySlug[lead.advisorSlug] ?? "?"}
              now={now}
              dimmed={isTerminal}
            />
          ))
        )}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  advisorFirst,
  now,
  dimmed,
}: {
  lead: AdminLead;
  advisorFirst: string;
  now: Date;
  dimmed: boolean;
}) {
  const sla = slaStatus(lead, now);

  return (
    <Link
      href={`/admin/leads/${lead.id}`}
      className={`group block border bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[var(--color-charcoal)] hover:shadow-[var(--shadow-card)] ${
        dimmed ? "border-[var(--color-beige-warm)] opacity-75" : "border-[var(--color-beige-warm)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          {lead.id.slice(0, 8)}
        </span>
        <SlaIndicator sla={sla} />
      </div>

      <div className="mt-2 font-serif text-base leading-tight text-[var(--color-charcoal)] transition-colors group-hover:text-[var(--color-terracotta)]">
        {lead.buyer.firstName} {lead.buyer.lastName}
      </div>
      {(lead.buyer.city || lead.buyer.country) && (
        <div className="mt-0.5 text-[10px] text-[var(--color-stone)]">
          {lead.buyer.city}
          {lead.buyer.city && lead.buyer.country ? ", " : ""}
          {lead.buyer.country}
        </div>
      )}

      {lead.offer && (
        <div className="mt-3 border-t border-[var(--color-beige-warm)] pt-2 font-serif text-base text-[var(--color-terracotta)]">
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(lead.offer.amount)}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between border-t border-[var(--color-beige-warm)] pt-2 text-[10px] text-[var(--color-stone)]">
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-[8px] font-medium text-white">
            {advisorFirst.charAt(0)}
          </span>
          {advisorFirst}
        </span>
        <span>{relativeTime(lead.lastActivityAt, now)}</span>
      </div>
    </Link>
  );
}

function SlaIndicator({ sla }: { sla: "ok" | "watch" | "breach" | "resolved" }) {
  if (sla === "resolved") return null;
  if (sla === "breach") {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--color-alert)]">
        <AlertCircle size={9} />
      </span>
    );
  }
  if (sla === "watch") {
    return (
      <span className="flex items-center gap-0.5 text-[9px] uppercase tracking-[0.18em] text-[var(--color-warning)]">
        <Clock size={9} />
      </span>
    );
  }
  return (
    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
  );
}
