// ════════════════════════════════════════════════════════════════════
// CRM Leads — types + validation + vocabulaires
// ════════════════════════════════════════════════════════════════════
// Source de vérité unique pour :
//   - Vocabulaires (status, channel, intent, sla_tier)
//   - Schéma Zod du submit public (un seul schéma, client + serveur)
//   - Types TS dérivés (évite le drift)
//
// Le client des server actions vit dans src/lib/actions/leads.ts,
// les reads admin dans src/lib/db.ts.
// ════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Vocabulaires ────────────────────────────────────────────────────
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "visit_done",
  "offer",
  "signed",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_CHANNELS = [
  "contact_form",
  "property_form",
  "whatsapp",
  "email",
  "phone",
  "matching",
  "favorites_save",
] as const;
export type LeadChannel = (typeof LEAD_CHANNELS)[number];

export const LEAD_INTENTS = ["acheter", "louer", "vendre", "autre"] as const;
export type LeadIntent = (typeof LEAD_INTENTS)[number];

export const SLA_TIERS = ["urgent", "standard"] as const;
export type SlaTier = (typeof SLA_TIERS)[number];

// Mapping libellés option <select> → intent canonique
export const INTENT_FROM_PROJECT_LABEL: Record<string, LeadIntent> = {
  "Acheter un riad": "acheter",
  "Acheter une villa": "acheter",
  "Acheter un appartement": "acheter",
  "Programme neuf": "acheter",
  "Louer (longue durée)": "louer",
  "Louer (saisonnier)": "louer",
  "Vendre — estimation": "vendre",
  "Gestion locative": "autre",
  Autre: "autre",
};

// ── Schéma Zod du submit public ─────────────────────────────────────
// Utilisé par /contact, la fiche bien, /deposer-un-bien
export const leadSubmitSchema = z.object({
  // Identité
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(160),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  // Projet — facultatif (frictionless) : par défaut « Prise de contact ».
  project: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  message: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  // Contexte implicite (rempli par le code, pas par l'utilisateur)
  channel: z.enum(LEAD_CHANNELS).default("contact_form"),
  propertySlug: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  sourcePage: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type LeadSubmitInput = z.input<typeof leadSubmitSchema>;
export type LeadSubmitParsed = z.output<typeof leadSubmitSchema>;

// ── Types runtime (alignés sur la DB) ───────────────────────────────
export interface Lead {
  id: string;
  createdAt: string;

  name: string;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  preferredLanguage: string | null;

  channel: LeadChannel;
  sourcePage: string | null;
  propertySlug: string | null;
  intent: LeadIntent;
  message: string | null;

  criteriaType: string | null;
  criteriaNeighborhoodSlug: string | null;
  criteriaBudgetMax: number | null;
  criteriaBedroomsMin: number | null;

  status: LeadStatus;
  assignedAdvisorSlug: string | null;
  assignedAt: string | null;
  firstActionAt: string | null;
  slaTier: SlaTier;
  slaDueAt: string | null;
  closedAt: string | null;
  disposition: string | null;

  // Profil buyer étendu
  buyerCity: string | null;
  buyerCountry: string | null;
  buyerLanguages: string[];
  propertiesViewed: string[];

  // Visite & offre (queryable)
  nextVisitAt: string | null;
  nextVisitPropertySlug: string | null;
  nextVisitConfirmed: boolean;
  offerAmount: number | null;
  offerSubmittedAt: string | null;
  offerStatus: "pending" | "accepted" | "rejected" | null;

  meta: Record<string, unknown>;
}

export interface LeadEvent {
  id: string;
  leadId: string;
  createdAt: string;
  type: string;
  authorSlug: string | null;
  body: string | null;
  payload: Record<string, unknown>;
}

// ── SLA helper ──────────────────────────────────────────────────────
// Calcul du tier au submit : basé sur le prix du bien lié (si connu).
// Seuils : Marrakech > 1 M€ = urgent, Essaouira > 800 k€ = urgent, sinon standard.
export function computeSlaTier(params: {
  propertyPrice?: number | null;
  propertyCity?: "Marrakech" | "Essaouira" | null;
}): SlaTier {
  const { propertyPrice, propertyCity } = params;
  if (!propertyPrice) return "standard";
  const threshold = propertyCity === "Essaouira" ? 800_000 : 1_000_000;
  return propertyPrice >= threshold ? "urgent" : "standard";
}

export function computeSlaDueAt(tier: SlaTier, fromDate: Date = new Date()): Date {
  const hours = tier === "urgent" ? 4 : 24;
  return new Date(fromDate.getTime() + hours * 60 * 60 * 1000);
}

// ════════════════════════════════════════════════════════════════════
// AdminLead — forme utilisée par les routes /admin/*
// ════════════════════════════════════════════════════════════════════
// Vue "enrichie" du Lead pour l'UI admin : profil buyer imbriqué,
// communications fusionnées (lead + events), compteurs dérivés.
// Construite par les helpers dans src/lib/db.ts.
// ════════════════════════════════════════════════════════════════════

export interface AdminBuyer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  languages: string[];
  budget: { min?: number; max: number };
  criteria: {
    types: string[];
    neighborhoods: string[];
    bedroomsMin: number;
    mustHave: string[];
  };
}

export interface AdminLeadComm {
  id: string;
  channel: "email" | "whatsapp" | "phone" | "note" | "meeting";
  direction: "inbound" | "outbound";
  body: string;
  at: string;
  by?: string;
}

export interface AdminLead {
  id: string;
  buyer: AdminBuyer;
  sourcePropertySlug: string;
  source: LeadChannel;
  intent: LeadIntent;
  advisorSlug: string;
  status: LeadStatus;
  message?: string;
  createdAt: string;
  firstResponseAt?: string;
  lastActivityAt: string;
  nextVisit?: { at: string; propertySlug: string; confirmed: boolean };
  offer?: {
    amount: number;
    submittedAt: string;
    status: "pending" | "accepted" | "rejected";
  };
  communications: AdminLeadComm[];
  propertiesViewed?: string[];
  slaTier: SlaTier;
  slaDueAt: string;
  portalToken: string;
}

export interface ShortlistItem {
  id: string;
  leadId: string;
  propertySlug: string;
  advisorNote: string | null;
  addedAt: string;
  addedBy: string | null;
}

// ── Helpers d'affichage ─────────────────────────────────────────────

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  visit_scheduled: "Visite programmée",
  visit_done: "Visite effectuée",
  offer: "Offre en cours",
  signed: "Signé",
  lost: "Perdu",
};

export const KANBAN_COLUMNS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "offer",
  "signed",
];

// Format "il y a 3h" / "il y a 2 jours" / "dans 5 min"
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 0) {
    const future = Math.abs(diffMin);
    if (future < 60) return `dans ${future} min`;
    if (future < 1440) return `dans ${Math.round(future / 60)} h`;
    return `dans ${Math.round(future / 1440)} j`;
  }
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;
  const diffM = Math.round(diffD / 30);
  return `il y a ${diffM} mois`;
}

// SLA derived status — basé sur la vraie colonne sla_due_at + first_action_at
export function slaStatus(
  lead: Pick<AdminLead, "firstResponseAt" | "slaDueAt" | "status">,
  now: Date = new Date()
): "ok" | "watch" | "breach" | "resolved" {
  if (lead.firstResponseAt) return "resolved";
  if (lead.status === "signed" || lead.status === "lost") return "resolved";
  const due = new Date(lead.slaDueAt).getTime();
  const diffMs = due - now.getTime();
  if (diffMs < 0) return "breach";
  // Dans les 2 dernières heures avant échéance → "watch"
  if (diffMs < 2 * 60 * 60 * 1000) return "watch";
  return "ok";
}

export function getLeadsCount(leads: AdminLead[]): Record<LeadStatus, number> {
  const counts: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    visit_scheduled: 0,
    visit_done: 0,
    offer: 0,
    signed: 0,
    lost: 0,
  };
  for (const l of leads) counts[l.status]++;
  return counts;
}

// ── Adapters Lead <-> AdminLead ─────────────────────────────────────

// Split "Jean Dupont" → { firstName: "Jean", lastName: "Dupont" }
export function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

// Mapping event.type → AdminLeadComm (filtre les events non-communicationnels)
export function eventToComm(
  ev: LeadEvent,
  advisorName: string | null
): AdminLeadComm | null {
  const byLabel = ev.authorSlug ? advisorName ?? "Système" : "Client";
  switch (ev.type) {
    case "email_sent":
      return { id: ev.id, channel: "email", direction: "outbound", body: ev.body ?? "", at: ev.createdAt, by: byLabel };
    case "email_received":
      return { id: ev.id, channel: "email", direction: "inbound", body: ev.body ?? "", at: ev.createdAt, by: "Client" };
    case "whatsapp_sent":
      return { id: ev.id, channel: "whatsapp", direction: "outbound", body: ev.body ?? "", at: ev.createdAt, by: byLabel };
    case "whatsapp_received":
      return { id: ev.id, channel: "whatsapp", direction: "inbound", body: ev.body ?? "", at: ev.createdAt, by: "Client" };
    case "call_logged":
      return { id: ev.id, channel: "phone", direction: "outbound", body: ev.body ?? "", at: ev.createdAt, by: byLabel };
    case "note":
      return { id: ev.id, channel: "note", direction: "outbound", body: ev.body ?? "", at: ev.createdAt, by: byLabel };
    case "visit_scheduled":
    case "visit_completed":
      return { id: ev.id, channel: "meeting", direction: "outbound", body: ev.body ?? "", at: ev.createdAt, by: byLabel };
    default:
      return null; // status_change / assignment_change / sla_breach → meta events, pas dans comms
  }
}
