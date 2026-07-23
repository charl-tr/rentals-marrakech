"use server";

import { updateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { computeSlaDueAt, computeSlaTier } from "@/lib/leads";
import { z } from "zod";

const depositSchema = z.object({
  // Strict minimum pour être rappelé — le reste est facultatif.
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  type: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  surface: z.string().optional(),
  landSurface: z.string().optional(),
  bedrooms: z.string().optional(),
  description: z.string().optional(),
  timeline: z.string().optional(),
});

export type DepositLeadState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export async function submitDepositLead(
  _prev: DepositLeadState,
  formData: FormData
): Promise<DepositLeadState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = depositSchema.safeParse(raw);

  if (!parsed.success) {
    const tree = parsed.error.flatten();
    return {
      status: "error",
      message: "Veuillez remplir tous les champs obligatoires.",
      fieldErrors: tree.fieldErrors as Record<string, string[]>,
    };
  }

  const d = parsed.data;
  const name = `${d.firstName} ${d.lastName}`.trim();

  const slaTier = computeSlaTier({
    propertyPrice: null,
    propertyCity: d.city === "Essaouira" ? "Essaouira" : "Marrakech",
  });
  const slaDueAt = computeSlaDueAt(slaTier);
  const portalToken = crypto.randomUUID();

  const { error } = await supabase.from("leads").insert({
    name,
    email: d.email,
    phone: d.phone,
    channel: "website",
    source_page: "/deposer-un-bien",
    property_slug: null,
    intent: "vendre",
    message: d.description || null,
    criteria_type: d.type || null,
    criteria_neighborhood_slug: d.neighborhood || null,
    status: "new",
    sla_tier: slaTier,
    sla_due_at: slaDueAt.toISOString(),
    portal_token: portalToken,
    meta: {
      project_label: "Vendre — dépôt de bien",
      deposit: {
        type: d.type,
        city: d.city,
        neighborhood: d.neighborhood || null,
        surface: d.surface ? Number(d.surface) : null,
        landSurface: d.landSurface ? Number(d.landSurface) : null,
        bedrooms: d.bedrooms ? Number(d.bedrooms) : null,
        timeline: d.timeline || null,
      },
    },
  });

  if (error) {
    console.error("[submitDepositLead] insert error:", {
      message: error.message,
      code: error.code,
    });
    return {
      status: "error",
      message: "Une erreur est survenue. Réessayez ou appelez-nous directement.",
    };
  }

  // Expire le cache court des listes admin → visible immédiatement.
  try {
    updateTag("admin");
  } catch {
    // updateTag ne peut échouer que hors Server Action — ici on l'est.
  }

  return { status: "success" };
}
