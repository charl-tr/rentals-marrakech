// ════════════════════════════════════════════════════════════════════
// Mandats + événements bien — types, vocabulaires, Zod, helpers
// ════════════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Vocabulaires ────────────────────────────────────────────────────

export const MANDATE_TYPES = ["exclusif", "simple", "apport_affaires"] as const;
export type MandateType = (typeof MANDATE_TYPES)[number];

export const MANDATE_STATUSES = [
  "active",
  "paused",
  "expired",
  "terminated",
] as const;
export type MandateStatus = (typeof MANDATE_STATUSES)[number];

export const MANDATE_TYPE_LABELS: Record<MandateType, string> = {
  exclusif: "Mandat exclusif",
  simple: "Mandat simple",
  apport_affaires: "Apport d'affaires",
};

export const MANDATE_STATUS_LABELS: Record<MandateStatus, string> = {
  active: "Actif",
  paused: "En pause",
  expired: "Expiré",
  terminated: "Résilié",
};

// ── Types runtime ───────────────────────────────────────────────────

export interface Mandate {
  id: string;
  propertySlug: string;
  createdAt: string;
  updatedAt: string;
  type: MandateType;
  exclusivity: boolean;
  commissionPct: number | null;
  commissionFixed: number | null;
  signedAt: string | null;
  startDate: string | null;
  expiryDate: string | null;
  closedAt: string | null;
  status: MandateStatus;
  disposition: string | null;
  assignedAdvisorSlug: string | null;
  notes: string | null;
  ownerToken: string;
}

export interface PropertyEvent {
  id: string;
  propertySlug: string;
  mandateId: string | null;
  createdAt: string;
  type: string;
  authorSlug: string | null;
  body: string | null;
  payload: Record<string, unknown>;
}

// ── Zod schemas (server actions) ────────────────────────────────────

export const ownerUpdateSchema = z.object({
  slug: z.string().min(1),
  ownerName: z
    .string()
    .trim()
    .max(120)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  ownerPhone: z
    .string()
    .trim()
    .max(40)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  ownerEmail: z
    .string()
    .trim()
    .max(160)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  ownerNotes: z
    .string()
    .trim()
    .max(2000)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
});

export const mandateCreateSchema = z.object({
  propertySlug: z.string().min(1),
  type: z.enum(MANDATE_TYPES).default("simple"),
  exclusivity: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  commissionPct: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .nullable()
    .optional(),
  signedAt: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  startDate: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  expiryDate: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  notes: z
    .string()
    .trim()
    .max(2000)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
});

export const mandateCloseSchema = z.object({
  mandateId: z.string().uuid(),
  disposition: z.string().trim().max(300).optional(),
});

// ── Helpers display ─────────────────────────────────────────────────

export function formatCommission(m: Mandate): string {
  if (m.commissionPct !== null) {
    return `${m.commissionPct.toFixed(2).replace(".", ",")} %`;
  }
  if (m.commissionFixed !== null) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(m.commissionFixed);
  }
  return "—";
}

export function mandateExpiryBadge(
  m: Mandate,
  now: Date = new Date()
): { label: string; status: "ok" | "watch" | "expired" } | null {
  if (!m.expiryDate) return null;
  const expiry = new Date(m.expiryDate).getTime();
  const diffDays = Math.round((expiry - now.getTime()) / (24 * 3_600_000));
  if (diffDays < 0) return { label: `Expiré il y a ${-diffDays}j`, status: "expired" };
  if (diffDays <= 30) return { label: `Expire dans ${diffDays}j`, status: "watch" };
  return { label: `Expire dans ${diffDays}j`, status: "ok" };
}
