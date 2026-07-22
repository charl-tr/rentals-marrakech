"use client";

import { AlertCircle, Clock, Sparkles } from "lucide-react";
import {
  STATUS_LABELS,
  relativeTime,
  slaStatus,
  type AdminLead,
} from "@/lib/leads";
import { computeNextAction } from "@/lib/next-best-action";
import DataTable, { type DataTableColumn } from "./_primitives/DataTable";

const PRIORITY_WEIGHT: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function LeadsTable({
  leads,
  advisorFirstBySlug,
  now,
}: {
  leads: AdminLead[];
  advisorFirstBySlug: Record<string, string>;
  now: Date;
}) {
  const columns: DataTableColumn<AdminLead>[] = [
    {
      key: "priority",
      header: "",
      width: "32px",
      cell: (lead) => <PriorityDot lead={lead} now={now} />,
      sortable: (a, b) => {
        const nbaA = computeNextAction(a, now);
        const nbaB = computeNextAction(b, now);
        const pA = nbaA ? PRIORITY_WEIGHT[nbaA.priority] ?? 99 : 99;
        const pB = nbaB ? PRIORITY_WEIGHT[nbaB.priority] ?? 99 : 99;
        if (pA !== pB) return pA - pB;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
    },
    {
      key: "client",
      header: "Client",
      width: "minmax(160px,1.4fr)",
      sortable: (a, b) =>
        `${a.buyer.lastName} ${a.buyer.firstName}`.localeCompare(
          `${b.buyer.lastName} ${b.buyer.firstName}`
        ),
      cell: (lead, { isActive }) => (
        <div className="min-w-0">
          <div
            className={`truncate font-medium ${
              isActive
                ? "text-[var(--color-terracotta)]"
                : "text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]"
            }`}
          >
            {lead.buyer.firstName} {lead.buyer.lastName}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
            {lead.buyer.city}
            {lead.buyer.city && lead.buyer.country ? ", " : ""}
            {lead.buyer.country}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      width: "minmax(100px,0.8fr)",
      sortable: (a, b) => a.status.localeCompare(b.status),
      cell: (lead) => <StatusBadge status={lead.status} />,
    },
    {
      key: "nba",
      header: "Prochaine action",
      width: "minmax(220px,2fr)",
      cell: (lead) => <NbaCell lead={lead} now={now} />,
    },
    {
      key: "advisor",
      header: "Conseiller",
      width: "minmax(100px,0.8fr)",
      sortable: (a, b) => a.advisorSlug.localeCompare(b.advisorSlug),
      cell: (lead) => {
        const first = advisorFirstBySlug[lead.advisorSlug] ?? "?";
        return (
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal)] text-[9px] font-medium uppercase text-white">
              {first.charAt(0)}
            </span>
            <span className="truncate text-sm text-[var(--color-charcoal)]">
              {first}
            </span>
          </div>
        );
      },
    },
    {
      key: "sla",
      header: "SLA",
      width: "minmax(70px,0.5fr)",
      align: "center",
      sortable: (a, b) =>
        new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime(),
      cell: (lead) => <SlaDot sla={slaStatus(lead, now)} />,
    },
    {
      key: "activity",
      header: "Activité",
      width: "minmax(80px,0.6fr)",
      align: "right",
      sortable: (a, b) =>
        new Date(a.lastActivityAt).getTime() -
        new Date(b.lastActivityAt).getTime(),
      cell: (lead) => (
        <span className="text-[11px] text-[var(--color-stone)]">
          {relativeTime(lead.lastActivityAt, now)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={leads}
      rowKey={(lead) => lead.id}
      rowHref={(lead) => `/admin/leads/${lead.id}`}
      defaultSort={{ columnKey: "priority", dir: "asc" }}
      emptyState={
        <div className="rounded-[14px] border border-dashed border-[var(--color-beige-warm)] bg-white px-8 py-16 text-center">
          <div className="font-serif text-xl text-[var(--color-charcoal)]">
            Aucun dossier ne matche.
          </div>
          <p className="mt-2 text-sm text-[var(--color-stone)]">
            Ajustez vos filtres ou réinitialisez.
          </p>
        </div>
      }
    />
  );
}

// ── Visual helpers ─────────────────────────────────────────────────

function PriorityDot({ lead, now }: { lead: AdminLead; now: Date }) {
  const nba = computeNextAction(lead, now);
  if (!nba) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-[var(--color-beige-warm)]" />
      </div>
    );
  }
  const color =
    nba.priority === "urgent"
      ? "bg-[var(--color-alert)]"
      : nba.priority === "high"
      ? "bg-[var(--color-terracotta)]"
      : nba.priority === "medium"
      ? "bg-[var(--color-warning)]"
      : "bg-[var(--color-stone-soft)]";
  return (
    <div className="flex h-full items-center justify-center">
      <div className={`h-2 w-2 rounded-full ${color}`} />
    </div>
  );
}

function NbaCell({ lead, now }: { lead: AdminLead; now: Date }) {
  const nba = computeNextAction(lead, now);
  if (!nba) {
    return <span className="text-xs text-[var(--color-stone-soft)]">—</span>;
  }
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <Sparkles
          size={10}
          className={
            nba.priority === "urgent"
              ? "text-[var(--color-alert)]"
              : nba.priority === "high"
              ? "text-[var(--color-terracotta)]"
              : "text-[var(--color-stone)]"
          }
        />
        <span className="truncate text-sm text-[var(--color-charcoal)]">
          {nba.label}
        </span>
      </div>
      <div className="mt-0.5 truncate text-[11px] text-[var(--color-stone)]">
        {nba.reason}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminLead["status"] }) {
  const style =
    status === "signed"
      ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
      : status === "lost"
      ? "bg-[var(--color-beige)] text-[var(--color-stone)]"
      : status === "offer"
      ? "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]"
      : status === "visit_scheduled" || status === "visit_done"
      ? "bg-[var(--color-charcoal)] text-white"
      : "bg-[var(--color-cream)] text-[var(--color-charcoal)]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[9px] font-medium uppercase tracking-[0.18em] ${style}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function SlaDot({
  sla,
}: {
  sla: "ok" | "watch" | "breach" | "resolved";
}) {
  if (sla === "breach") {
    return (
      <span
        title="SLA dépassé"
        className="inline-flex h-6 w-6 items-center justify-center text-[var(--color-alert)]"
      >
        <AlertCircle size={13} />
      </span>
    );
  }
  if (sla === "watch") {
    return (
      <span
        title="À traiter bientôt"
        className="inline-flex h-6 w-6 items-center justify-center text-[var(--color-warning)]"
      >
        <Clock size={13} />
      </span>
    );
  }
  if (sla === "resolved") {
    return (
      <span
        title="Traité"
        className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-stone-soft)]"
      />
    );
  }
  return (
    <span
      title="Fresh"
      className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"
    />
  );
}
