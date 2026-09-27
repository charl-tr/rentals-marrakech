"use server";

import { updateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { computeSlaDueAt, computeSlaTier } from "@/lib/leads";
import { isLikelyBot } from "@/lib/anti-spam";
import { z } from "zod";

const depositSchema = z.object({
  // Strict minimum pour être rappelé — le reste est facultatif.
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().default(""),
  email: z.union([z.string().trim().email().max(254), z.literal("")]).optional().default(""),
  phone: z.string().trim().max(40).refine(v => /^\+?[\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 8 && v.replace(/\D/g, "").length <= 15),
  type: z.enum(["", "villa", "appartement", "riad-renove", "riad-a-renover", "terrain", "maison-hotes", "programme-neuf", "autre"]).optional(),
  city: z.string().trim().max(100).optional(),
  neighborhood: z.string().trim().max(150).optional(),
  surface: z.string().optional(),
  landSurface: z.string().optional(),
  bedrooms: z.string().optional(),
  description: z.string().max(3000).optional(),
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
  // Anti-spam — drop silencieux (le bot reçoit un "succès")
  if (isLikelyBot(formData)) {
    return { status: "success" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = depositSchema.safeParse(raw);

  if (!parsed.success) {
    const tree = parsed.error.flatten();
    return {
      status: "error",
      message: tree.fieldErrors.phone ? "Indiquez un numéro de téléphone valide (8 à 15 chiffres, avec indicatif si nécessaire)." : tree.fieldErrors.email ? "Vérifiez votre adresse e-mail, ou laissez ce champ vide." : "Vérifiez votre nom et les informations renseignées.",
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
    email: d.email || null,
    phone: d.phone,
    channel: "website",
    source_page: "/deposer-un-bien",
    property_slug: null,
    intent: "vendre",
    message: [d.type && `Bien : ${d.type}`, d.city && `Ville : ${d.city}`, d.neighborhood && `Quartier : ${d.neighborhood}`, d.description].filter(Boolean).join("\n") || null,
    criteria_type: d.type || null,
    // Free-form seller location is retained in message/meta, not in a FK slug.
    criteria_neighborhood_slug: null,
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
