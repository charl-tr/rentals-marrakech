"use server";

// ════════════════════════════════════════════════════════════════════
// submitFavoritesLead — capture d'email depuis la bannière "Sauvegarder
// ma sélection" sur /favoris et /comparer. Ne demande QUE l'email
// (frictionless) ; crée un lead standard pour que l'agence puisse
// recontacter avec une sélection personnalisée. Pas de compte, pas de
// mot de passe — juste une trace exploitable côté conseiller.
// ════════════════════════════════════════════════════════════════════

import { updateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { computeSlaDueAt, computeSlaTier } from "@/lib/leads";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(160),
  kind: z.enum(["favoris", "comparateur"]),
  slugs: z.string().max(2000).optional(),
});

export type FavoritesLeadState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitFavoritesLead(
  _prev: FavoritesLeadState,
  formData: FormData
): Promise<FavoritesLeadState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Adresse email invalide." };
  }
  const { email, kind, slugs } = parsed.data;

  let slugList: string[] = [];
  try {
    const decoded = slugs ? JSON.parse(slugs) : [];
    if (Array.isArray(decoded)) slugList = decoded.filter((s) => typeof s === "string");
  } catch {
    slugList = [];
  }

  // Nom lisible dérivé de l'email — aucune identité demandée à l'utilisateur.
  const localPart = email.split("@")[0] ?? "Visiteur";
  const firstToken = localPart.split(/[._-]/)[0] || "Visiteur";
  const displayName = `${firstToken.charAt(0).toUpperCase()}${firstToken.slice(1)} (sélection)`;

  const label = kind === "favoris" ? "biens en favoris" : "biens en comparateur";
  const slaTier = computeSlaTier({ propertyPrice: null, propertyCity: null });
  const slaDueAt = computeSlaDueAt(slaTier);
  const portalToken = crypto.randomUUID();

  const { error } = await supabase.from("leads").insert({
    name: displayName,
    email,
    phone: null,
    channel: "favorites_save",
    source_page: kind === "favoris" ? "/favoris" : "/comparer",
    property_slug: slugList[0] ?? null,
    intent: "autre",
    message: slugList.length
      ? `A demandé à recevoir sa sélection (${slugList.length} ${label}) : ${slugList.join(", ")}`
      : `A demandé à recevoir sa sélection (${label}).`,
    status: "new",
    sla_tier: slaTier,
    sla_due_at: slaDueAt.toISOString(),
    portal_token: portalToken,
    meta: {
      project_label: "Sélection sauvegardée",
      saved_kind: kind,
      saved_slugs: slugList,
    },
  });

  if (error) {
    console.error("[submitFavoritesLead] insert error:", error.message);
    return {
      status: "error",
      message: "Une erreur est survenue. Réessayez.",
    };
  }

  try {
    updateTag("admin");
  } catch {
    // updateTag ne peut échouer que hors Server Action — ici on l'est.
  }

  return { status: "success" };
}
