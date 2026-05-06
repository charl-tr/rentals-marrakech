"use client";

import { List, LayoutGrid } from "lucide-react";
import AdminFilterBar from "./_primitives/AdminFilterBar";
import {
  LEAD_STATUSES,
  STATUS_LABELS,
} from "@/lib/leads";
import type { Advisor } from "@/data/properties";

// Types réexportés pour compat avec le code existant
export type ViewMode = "table" | "kanban";
export type ScopeMode = "mine" | "team";
export type SlaFilter = "all" | "breach" | "watch" | "ok";
export type IntentFilter = "all" | "acheter" | "louer" | "vendre";

export default function LeadsFilterBar({
  advisors,
  isDirector,
  counts,
}: {
  advisors: Advisor[];
  isDirector: boolean;
  counts: Record<IntentFilter, number>;
}) {
  return (
    <AdminFilterBar>
      <AdminFilterBar.Tabs
        param="intent"
        tabs={[
          { value: null, label: "Tous", count: counts.all },
          { value: "acheter", label: "Acquéreurs", count: counts.acheter },
          { value: "louer", label: "Locataires", count: counts.louer },
          { value: "vendre", label: "Vendeurs", count: counts.vendre },
        ]}
      />
      <AdminFilterBar.Row>
        <AdminFilterBar.Search placeholder="Nom, email, téléphone…" />
        <AdminFilterBar.Spacer />
        {isDirector && (
          <AdminFilterBar.Toggle
            param="scope"
            defaultValue={null}
            options={[
              { value: null, label: "Équipe" },
              { value: "mine", label: "Mes leads" },
            ]}
          />
        )}
        <AdminFilterBar.Toggle
          param="view"
          defaultValue={null}
          iconOnly
          options={[
            { value: null, icon: <List size={14} />, title: "Table" },
            { value: "kanban", icon: <LayoutGrid size={14} />, title: "Kanban" },
          ]}
        />
      </AdminFilterBar.Row>
      <AdminFilterBar.Pills>
        <AdminFilterBar.Pill
          param="status"
          label="Statut"
          options={[
            { value: null, label: "Tous statuts" },
            ...LEAD_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
          ]}
        />
        {isDirector && (
          <AdminFilterBar.Pill
            param="advisor"
            label="Conseiller"
            options={[
              { value: null, label: "Tous conseillers" },
              ...advisors.map((a) => ({ value: a.slug, label: a.name })),
            ]}
          />
        )}
        <AdminFilterBar.Pill
          param="sla"
          label="SLA"
          options={[
            { value: null, label: "Tous SLA" },
            { value: "breach", label: "Dépassés" },
            { value: "watch", label: "À traiter" },
            { value: "ok", label: "OK" },
          ]}
        />
        <AdminFilterBar.Reset preserve={["view", "scope", "intent"]} />
      </AdminFilterBar.Pills>
    </AdminFilterBar>
  );
}
