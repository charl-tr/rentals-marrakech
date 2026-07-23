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
import { sendEmail } from "@/lib/email/client";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(160),
  kind: z.enum(["favoris", "comparateur"]),
  slugs: z.string().max(2000).optional(),
});

export type FavoritesLeadState =
  | { status: "idle" }
  | { status: "success"; token: string }
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

  // Envoi du lien magique (non-bloquant) — c'est le SEUL moyen de retrouver la
  // sélection sur un AUTRE appareil (l'appareil courant l'a déjà en localStorage).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const restoreUrl = `${siteUrl}/ma-selection/${portalToken}`;
  void sendSelectionEmail({ to: email, url: restoreUrl, count: slugList.length, kind });

  return { status: "success", token: portalToken };
}

// ── Email transactionnel — lien de restauration de la sélection ──────
// Minimal, inline (contrainte email), ton de marque. Non-bloquant : si RESEND
// n'est pas configuré, le client email logue en console (mode démo).
async function sendSelectionEmail(params: {
  to: string;
  url: string;
  count: number;
  kind: "favoris" | "comparateur";
}) {
  const label = params.kind === "favoris" ? "vos biens favoris" : "votre comparateur";
  const html = `
  <div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;color:#23201b">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9c7256;margin:0 0 8px">Marrakech Realty</p>
    <h1 style="font-size:24px;font-weight:600;margin:0 0 16px;color:#17140f">Votre sélection vous attend.</h1>
    <p style="font-size:15px;line-height:1.6;color:#4a443c;margin:0 0 24px">
      Vous avez sauvegardé <strong>${params.count} bien${params.count > 1 ? "s" : ""}</strong> dans ${label}.
      Ouvrez ce lien depuis n'importe quel appareil — ordinateur, téléphone — pour les retrouver instantanément.
    </p>
    <p style="margin:0 0 28px">
      <a href="${params.url}" style="display:inline-block;background:#9c7256;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">Retrouver ma sélection</a>
    </p>
    <p style="font-size:12px;line-height:1.6;color:#877f73;margin:0;font-family:Arial,sans-serif">
      Ce lien vous est personnel — inutile de créer un compte. Un conseiller reste disponible au
      <a href="tel:+212660629444" style="color:#9c7256">+212 660 62 94 44</a>.
    </p>
  </div>`;
  try {
    await sendEmail({
      to: params.to,
      subject: "Votre sélection Marrakech Realty",
      html,
    });
  } catch (err) {
    console.error("[submitFavoritesLead] email send failed:", err);
    // Non-bloquant : la sélection est déjà en base et restaurable via le lien.
  }
}
