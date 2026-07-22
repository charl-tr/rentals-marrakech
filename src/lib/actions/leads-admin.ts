"use server";

// ════════════════════════════════════════════════════════════════════
// Mutations admin sur les leads. Nouvelle forme : defineMutation helper
// pour les cas standards. Ancienne forme (inline) pour les cas avec
// logique multi-étapes complexe.
// ════════════════════════════════════════════════════════════════════

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { isDirector, requireAdminSession, type AdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/leads";
import { defineMutation, type MutationState } from "./_core/defineMutation";

export type { MutationState };

// Guard : la session a-t-elle le droit d'agir sur ce lead ?
async function requireLeadAccess(
  session: AdminSession,
  leadId: string
): Promise<{ currentStatus: LeadStatus; assignedAdvisorSlug: string | null } | null> {
  const { data } = await supabaseAdmin
    .from("leads")
    .select("status, assigned_advisor_slug")
    .eq("id", leadId)
    .maybeSingle();
  if (!data) return null;

  const assigned = (data.assigned_advisor_slug as string | null) ?? null;

  if (session.role !== "director" && assigned !== session.advisorSlug) {
    return null; // l'UI n'aurait pas dû proposer la mutation
  }

  return {
    currentStatus: (data.status as LeadStatus) ?? "new",
    assignedAdvisorSlug: assigned,
  };
}

// ── updateLeadStatus ────────────────────────────────────────────────

export async function updateLeadStatus(
  _prev: MutationState,
  formData: FormData
): Promise<MutationState> {
  const session = await requireAdminSession();

  const leadId = formData.get("leadId");
  const newStatus = formData.get("status");
  const note = formData.get("note");

  if (typeof leadId !== "string" || typeof newStatus !== "string") {
    return { status: "error", message: "Paramètres manquants." };
  }
  if (!(LEAD_STATUSES as readonly string[]).includes(newStatus)) {
    return { status: "error", message: "Statut invalide." };
  }

  // Guard : ownership + rôle
  const access = await requireLeadAccess(session, leadId);
  if (!access) {
    return { status: "error", message: "Accès refusé à ce lead." };
  }

  const fromStatus = access.currentStatus;
  const toStatus = newStatus as LeadStatus;
  if (fromStatus === toStatus) {
    return { status: "error", message: "Ce lead est déjà dans ce statut." };
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: toStatus,
  };

  // first_action_at marquée à la 1ère action non-"new"
  if (fromStatus === "new" && toStatus !== "new") {
    patch.first_action_at = now;
  }
  // closed_at marqué sur statuts terminaux
  if (toStatus === "signed" || toStatus === "lost") {
    patch.closed_at = now;
  } else {
    patch.closed_at = null;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("leads")
    .update(patch)
    .eq("id", leadId);

  if (updateErr) {
    console.error("[updateLeadStatus] update:", updateErr);
    return { status: "error", message: "Impossible de mettre à jour le statut." };
  }

  // Log de l'event
  const { error: eventErr } = await supabaseAdmin.from("lead_events").insert({
    lead_id: leadId,
    type: "status_change",
    author_slug: session.advisorSlug,
    body: typeof note === "string" && note.trim() ? note.trim() : null,
    payload: { from: fromStatus, to: toStatus },
  });

  if (eventErr) {
    console.error("[updateLeadStatus] event:", eventErr);
    // Update a quand même réussi — non bloquant
  }

  revalidateLeadPaths(leadId);

  return {
    status: "success",
    message: `Statut passé à « ${STATUS_LABELS[toStatus]} ».`,
  };
}

// ── addNote (nouvelle forme : defineMutation) ──────────────────────

export const addNote = defineMutation({
  name: "addNote",
  schema: z.object({
    leadId: z.string().uuid(),
    body: z.string().trim().min(1, "Note vide"),
  }),
  guard: async ({ input, session }) => {
    const access = await requireLeadAccess(session, input.leadId);
    return access ? null : "Accès refusé à ce lead.";
  },
  handler: async ({ input, session }) => {
    const { error } = await supabaseAdmin.from("lead_events").insert({
      lead_id: input.leadId,
      type: "note",
      author_slug: session.advisorSlug,
      body: input.body,
    });
    if (error) throw new Error(error.message);
    return { message: "Note enregistrée." };
  },
  revalidate: ({ input }) => [
    "/admin",
    "/admin/leads",
    `/admin/leads/${input.leadId}`,
  ],
});

// ── logInteraction (quick log call/whatsapp) ────────────────────────

export async function logInteraction(
  _prev: MutationState,
  formData: FormData
): Promise<MutationState> {
  const session = await requireAdminSession();

  const leadId = formData.get("leadId");
  const typeRaw = formData.get("type"); // "call_logged" | "whatsapp_sent"
  const body = formData.get("body");

  if (typeof leadId !== "string" || typeof typeRaw !== "string") {
    return { status: "error", message: "Paramètres manquants." };
  }
  if (typeRaw !== "call_logged" && typeRaw !== "whatsapp_sent") {
    return { status: "error", message: "Type d'interaction invalide." };
  }

  const access = await requireLeadAccess(session, leadId);
  if (!access) return { status: "error", message: "Accès refusé à ce lead." };

  const { error } = await supabaseAdmin.from("lead_events").insert({
    lead_id: leadId,
    type: typeRaw,
    author_slug: session.advisorSlug,
    body: typeof body === "string" && body.trim() ? body.trim() : null,
  });

  if (error) {
    console.error("[logInteraction]:", error);
    return { status: "error", message: "Impossible d'enregistrer." };
  }

  // Si le lead était "new", on passe en "contacted" car l'appel EST le 1er contact
  if (access.currentStatus === "new") {
    await supabaseAdmin
      .from("leads")
      .update({
        status: "contacted",
        first_action_at: new Date().toISOString(),
      })
      .eq("id", leadId);
    await supabaseAdmin.from("lead_events").insert({
      lead_id: leadId,
      type: "status_change",
      author_slug: session.advisorSlug,
      payload: { from: "new", to: "contacted" },
    });
  }

  revalidateLeadPaths(leadId);
  return {
    status: "success",
    message: typeRaw === "call_logged" ? "Appel logué." : "Message WhatsApp logué.",
  };
}

// ── assignLead ──────────────────────────────────────────────────────

export async function assignLead(
  _prev: MutationState,
  formData: FormData
): Promise<MutationState> {
  const session = await requireAdminSession();

  // Director only
  if (!isDirector(session)) {
    return { status: "error", message: "Réassignation réservée au directeur." };
  }

  const leadId = formData.get("leadId");
  const newAdvisorSlug = formData.get("advisorSlug");

  if (typeof leadId !== "string" || typeof newAdvisorSlug !== "string") {
    return { status: "error", message: "Paramètres manquants." };
  }

  // Vérifie que l'advisor cible existe et est actif
  const { data: advisor } = await supabaseAdmin
    .from("advisors")
    .select("slug, name")
    .eq("slug", newAdvisorSlug)
    .eq("active", true)
    .maybeSingle();

  if (!advisor) {
    return { status: "error", message: "Conseiller inconnu ou inactif." };
  }

  // Ancienne assignation pour log
  const { data: current } = await supabaseAdmin
    .from("leads")
    .select("assigned_advisor_slug")
    .eq("id", leadId)
    .maybeSingle();
  const fromSlug = current?.assigned_advisor_slug ?? null;

  const { error } = await supabaseAdmin
    .from("leads")
    .update({
      assigned_advisor_slug: newAdvisorSlug,
      assigned_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) {
    console.error("[assignLead]:", error);
    return { status: "error", message: "Impossible de réassigner." };
  }

  await supabaseAdmin.from("lead_events").insert({
    lead_id: leadId,
    type: "assignment_change",
    author_slug: session.advisorSlug,
    body: `Réassigné à ${advisor.name}`,
    payload: { from: fromSlug, to: newAdvisorSlug },
  });

  revalidateLeadPaths(leadId);
  return { status: "success", message: `Réassigné à ${advisor.name}.` };
}

// ── scheduleVisit ────────────────────────────────────────────────────

export const scheduleVisit = defineMutation({
  name: "scheduleVisit",
  schema: z.object({
    leadId: z.string().uuid(),
    visitAt: z.string().min(1, "Date requise"),
    propertySlug: z.string().min(1, "Bien requis"),
    note: z.string().optional(),
  }),
  guard: async ({ input, session }) => {
    const access = await requireLeadAccess(session, input.leadId);
    return access ? null : "Accès refusé à ce lead.";
  },
  handler: async ({ input, session }) => {
    const { error } = await supabaseAdmin
      .from("leads")
      .update({
        next_visit_at: input.visitAt,
        next_visit_property_slug: input.propertySlug,
        next_visit_confirmed: false,
        status: "visit_scheduled",
        first_action_at: new Date().toISOString(),
      })
      .eq("id", input.leadId);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("lead_events").insert({
      lead_id: input.leadId,
      type: "visit_scheduled",
      author_slug: session.advisorSlug,
      body: input.note || null,
      payload: { visitAt: input.visitAt, propertySlug: input.propertySlug },
    });

    return { message: "Visite programmée." };
  },
  revalidate: ({ input }) => [
    "/admin",
    "/admin/leads",
    `/admin/leads/${input.leadId}`,
    "/admin/agenda",
  ],
});

// ── Helpers ─────────────────────────────────────────────────────────

function revalidateLeadPaths(leadId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  updateTag("admin");
}
