// ════════════════════════════════════════════════════════════════════
// Next-best-action engine — rules-based, zero ML.
// ════════════════════════════════════════════════════════════════════
// Sur chaque lead, retourne UNE action suggérée (la plus prioritaire).
// Simple, déterministe, explicable. Le conseiller sait exactement pourquoi.
//
// Règles triées par priorité décroissante — la première qui match gagne.
// ════════════════════════════════════════════════════════════════════

import type { AdminLead, LeadStatus } from "./leads";

export type SuggestedActionType =
  | "status_change"
  | "log_call"
  | "add_note"
  | "schedule_visit";

export interface SuggestedAction {
  type: SuggestedActionType;
  label: string;            // CTA bouton (ex: "Marquer contacté")
  statusTo?: LeadStatus;    // si type = status_change
}

export interface NextAction {
  priority: "urgent" | "high" | "medium" | "low";
  label: string;       // Titre court (ex: "Relancer — 2e follow-up")
  reason: string;      // Motivation (ex: "Pas de contact depuis 5 jours")
  hint?: string;       // Conseil tactique optionnel
  suggested?: SuggestedAction; // Action 1-clic qui avance le dossier
}

const H = 3_600_000;
const D = 24 * H;

export function computeNextAction(
  lead: AdminLead,
  now: Date = new Date()
): NextAction | null {
  const nowMs = now.getTime();
  const created = new Date(lead.createdAt).getTime();
  const lastActivity = new Date(lead.lastActivityAt).getTime();
  const ageMs = nowMs - created;
  const dormantMs = nowMs - lastActivity;

  // ── Status terminaux : rien à faire ────────────────────────────
  if (lead.status === "signed" || lead.status === "lost") {
    return null;
  }

  // ── Visite imminente non confirmée ─────────────────────────────
  if (
    lead.nextVisit &&
    !lead.nextVisit.confirmed &&
    new Date(lead.nextVisit.at).getTime() - nowMs < 2 * D
  ) {
    return {
      priority: "urgent",
      label: "Confirmer la visite avec le propriétaire",
      reason: `Visite prévue ${relativeIn(lead.nextVisit.at, now)}, propriétaire pas confirmé`,
      hint: "Appeler directement — SMS / WhatsApp trop tardif",
      suggested: { type: "log_call", label: "Logger l'appel propriétaire" },
    };
  }

  // ── Offre en attente depuis >5 jours ───────────────────────────
  if (
    lead.offer &&
    lead.offer.status === "pending" &&
    nowMs - new Date(lead.offer.submittedAt).getTime() > 5 * D
  ) {
    return {
      priority: "urgent",
      label: "Ping propriétaire — offre en attente",
      reason: `Offre ${formatPrice(lead.offer.amount)} soumise il y a ${Math.round((nowMs - new Date(lead.offer.submittedAt).getTime()) / D)}j, aucune réponse`,
      hint: "Si pas de retour sous 48h, ré-évaluer le prix ou changer d'approche",
      suggested: { type: "log_call", label: "Logger un call propriétaire" },
    };
  }

  // ── SLA breach sur lead "new" ──────────────────────────────────
  if (lead.status === "new" && nowMs > new Date(lead.slaDueAt).getTime()) {
    return {
      priority: "urgent",
      label: "À contacter — SLA dépassé",
      reason: `Le lead attend depuis ${relativeFrom(created, now)}, SLA ${lead.slaTier} dépassé`,
      hint: lead.buyer.phone ? "Appel direct préférable" : "Réponse email sous 1h",
      suggested: {
        type: "status_change",
        statusTo: "contacted",
        label: "Marquer contacté",
      },
    };
  }

  // ── Lead "new" urgent (budget >1M€) ────────────────────────────
  if (lead.status === "new" && lead.slaTier === "urgent" && ageMs > 1 * H) {
    return {
      priority: "urgent",
      label: "Prise de contact premium",
      reason: "Budget élevé + fenêtre SLA qui se réduit",
      hint: "Appel dans l'heure si possible",
      suggested: {
        type: "status_change",
        statusTo: "contacted",
        label: "Marquer contacté",
      },
    };
  }

  // ── Lead "new" jamais triagé — TOUJOURS remonté en tête de liste.
  // Sans cette règle, un lead qui vient d'arriver (trop récent pour
  // déclencher les règles SLA/budget ci-dessus) n'a aucune action calculée
  // → tombe en toute dernière position du tri par priorité, invisible.
  // Le premier contact est la priorité n°1 d'un pipeline commercial.
  if (lead.status === "new") {
    const fresh = ageMs <= 6 * H;
    return {
      priority: fresh ? "urgent" : "high",
      label: fresh ? "Nouveau — premier contact" : "Première réponse",
      reason: fresh
        ? `Demande reçue à l'instant (${relativeFrom(created, now)})`
        : `Demande reçue il y a ${relativeFrom(created, now)}`,
      suggested: {
        type: "status_change",
        statusTo: "contacted",
        label: "Marquer contacté",
      },
    };
  }

  // ── Lead "contacted" sans 2e follow-up après 72h ───────────────
  if (lead.status === "contacted" && dormantMs > 3 * D) {
    return {
      priority: "high",
      label: "2e follow-up — relance attendue",
      reason: `Pas d'échange depuis ${relativeFrom(lastActivity, now)}`,
      hint: "Proposer un appel visio ou une sélection affinée",
      suggested: { type: "log_call", label: "Logger le 2e contact" },
    };
  }

  // ── Lead "qualified" depuis >5j sans visite ────────────────────
  if (lead.status === "qualified" && dormantMs > 5 * D && !lead.nextVisit) {
    return {
      priority: "high",
      label: "Proposer une visite",
      reason: `Qualifié depuis ${relativeFrom(created, now)}, aucune visite encore planifiée`,
      suggested: {
        type: "status_change",
        statusTo: "visit_scheduled",
        label: "Passer en visite programmée",
      },
    };
  }

  // ── Post-visite : relancer sous 48h ────────────────────────────
  if (lead.status === "visit_done" && dormantMs > 2 * D) {
    return {
      priority: "high",
      label: "Relance post-visite",
      reason: `Visite effectuée il y a ${relativeFrom(lastActivity, now)} — feedback à capter`,
      hint: "Appel ouvert : écoute, hésitations, objections concrètes",
      suggested: { type: "log_call", label: "Logger le retour post-visite" },
    };
  }

  // ── Visite programmée, J-1 ou jour même ────────────────────────
  if (
    lead.nextVisit &&
    lead.nextVisit.confirmed &&
    new Date(lead.nextVisit.at).getTime() - nowMs < 1 * D &&
    new Date(lead.nextVisit.at).getTime() - nowMs > 0
  ) {
    return {
      priority: "medium",
      label: "Préparer la visite",
      reason: `Visite ${relativeIn(lead.nextVisit.at, now)} — brief et logistique`,
      hint: "Vérifier accès, clés, horaire propriétaire",
      suggested: { type: "add_note", label: "Noter le brief" },
    };
  }

  // ── Dormant >30j sans clôture ──────────────────────────────────
  if (dormantMs > 30 * D) {
    return {
      priority: "low",
      label: "Relance longue · nouveautés du marché",
      reason: `Aucun échange depuis ${Math.round(dormantMs / D)}j`,
      hint: "Réactiver avec un bien récent qui matche ses critères",
      suggested: { type: "log_call", label: "Logger la tentative de réactivation" },
    };
  }

  // ── Aucun match → rien d'urgent ────────────────────────────────
  return null;
}

// ── Helpers ─────────────────────────────────────────────────────

function relativeFrom(pastMs: number, now: Date): string {
  const diff = now.getTime() - pastMs;
  if (diff < 1 * H) return `${Math.round(diff / 60_000)} min`;
  if (diff < 1 * D) return `${Math.round(diff / H)}h`;
  return `${Math.round(diff / D)} jours`;
}

function relativeIn(futureIso: string, now: Date): string {
  const diff = new Date(futureIso).getTime() - now.getTime();
  if (diff < 1 * H) return `dans ${Math.max(1, Math.round(diff / 60_000))} min`;
  if (diff < 1 * D) return `dans ${Math.round(diff / H)}h`;
  return `dans ${Math.round(diff / D)}j`;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
