"use server";

import { supabase } from "@/lib/supabase";
import { computeSlaDueAt, computeSlaTier } from "@/lib/leads";
import { z } from "zod";

// ════════════════════════════════════════════════════════════════════
// Lead capture sur /estimer — gate email avant affichage du résultat.
//
// Crée un lead intent="vendre" avec le contexte d'estimation en meta.
// Pas d'envoi d'email ici (branchement Resend ultérieur).
// ════════════════════════════════════════════════════════════════════

const estimationLeadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  type: z.string(),
  zone: z.string(),
  surface: z.string(),
  bedrooms: z.string().optional(),
});

export type EstimationLeadState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitEstimationLead(
  _prev: EstimationLeadState,
  formData: FormData
): Promise<EstimationLeadState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = estimationLeadSchema.safeParse(raw);

  if (!parsed.success) {
    return { status: "error", message: "Adresse email invalide." };
  }

  const { email, firstName, type, zone, surface, bedrooms } = parsed.data;
  const name = firstName?.trim() || email.split("@")[0];

  const slaTier = computeSlaTier({
    propertyPrice: null,
    propertyCity: null,
  });
  const slaDueAt = computeSlaDueAt(slaTier);
  const portalToken = crypto.randomUUID();

  const { error } = await supabase.from("leads").insert({
    name,
    email,
    phone: null,
    channel: "website",
    source_page: "/estimer",
    property_slug: null,
    intent: "vendre",
    message: null,
    status: "new",
    sla_tier: slaTier,
    sla_due_at: slaDueAt.toISOString(),
    portal_token: portalToken,
    meta: {
      project_label: "Vendre — estimation en ligne",
      estimation: {
        type,
        zone,
        surface: Number(surface),
        bedrooms: bedrooms ? Number(bedrooms) : null,
      },
    },
  });

  if (error) {
    console.error("[submitEstimationLead] insert error:", {
      message: error.message,
      code: error.code,
    });
    return {
      status: "error",
      message: "Une erreur est survenue. Réessayez ou contactez-nous directement.",
    };
  }

  return { status: "success" };
}
