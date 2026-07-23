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
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPropertyBySlug } from "@/lib/db";
import { formatPrice } from "@/data/properties";
import { computeSlaDueAt, computeSlaTier } from "@/lib/leads";
import { sendEmail } from "@/lib/email/client";
import { z } from "zod";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  void sendSelectionEmail({
    to: email,
    url: restoreUrl,
    siteUrl,
    slugs: slugList,
    kind,
  });

  return { status: "success", token: portalToken };
}

// ── Mise à jour d'une sélection déjà liée ────────────────────────────
// Appelée quand le navigateur est déjà "lié" (a un token) et que l'utilisateur
// a modifié sa sélection : on met à jour LE MÊME lead (via son token) au lieu
// d'en créer un nouveau → pas de doublon côté admin, continuité côté client.
// Le token joue le rôle de clé au porteur — cohérent avec le modèle lien magique.
export type UpdateSelectionResult = { ok: boolean };

export async function updateSavedSelection(
  token: string,
  slugs: string[]
): Promise<UpdateSelectionResult> {
  if (!UUID_RE.test(token)) return { ok: false };

  const clean = Array.isArray(slugs)
    ? slugs.filter((s) => typeof s === "string").slice(0, 50)
    : [];

  // Lecture du meta existant pour le fusionner (update jsonb = remplacement total)
  const { data, error: readErr } = await supabaseAdmin
    .from("leads")
    .select("meta, channel")
    .eq("portal_token", token)
    .maybeSingle();
  if (readErr || !data) return { ok: false };

  // Garde-fou : on ne met à jour que les leads issus d'une sélection sauvegardée.
  if (data.channel !== "favorites_save") return { ok: false };

  const meta = { ...((data.meta as Record<string, unknown>) ?? {}), saved_slugs: clean };
  const kindLabel =
    meta.saved_kind === "comparateur" ? "biens en comparateur" : "biens en favoris";

  const { error: updateErr } = await supabaseAdmin
    .from("leads")
    .update({
      meta,
      property_slug: clean[0] ?? null,
      message: clean.length
        ? `A mis à jour sa sélection (${clean.length} ${kindLabel}) : ${clean.join(", ")}`
        : `A vidé sa sélection.`,
    })
    .eq("portal_token", token);
  if (updateErr) {
    console.error("[updateSavedSelection] update error:", updateErr.message);
    return { ok: false };
  }

  try {
    updateTag("admin");
  } catch {
    /* hors Server Action uniquement */
  }
  return { ok: true };
}

// ── Email transactionnel — lien de restauration + biens en vignettes ─
// Inline (contrainte email), layout table pour compatibilité clients. Montre
// les biens sauvegardés (photo + titre + prix) → email de désir, pas juste un
// lien. Non-bloquant : si RESEND absent, le client email logue en console.
async function sendSelectionEmail(params: {
  to: string;
  url: string;
  siteUrl: string;
  slugs: string[];
  kind: "favoris" | "comparateur";
}) {
  const count = params.slugs.length;
  const plural = count > 1 ? "s" : "";

  // Hydrate les biens (max 4 vignettes pour garder l'email léger)
  const properties = (
    await Promise.all(params.slugs.slice(0, 4).map((s) => getPropertyBySlug(s)))
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const cards = properties
    .map((p) => {
      const href =
        p.listing === "vente" || p.type === "programme-neuf"
          ? `${params.siteUrl}/acheter/${p.slug}`
          : `${params.siteUrl}/louer/${p.slug}`;
      const price = formatPrice(p.price, p.listing, p.currency, p.priceUnit);
      const img = p.images?.[0] ?? "";
      return `
      <tr><td style="padding:6px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e0d5;border-radius:12px;overflow:hidden">
          <tr>
            <td width="130" style="width:130px;vertical-align:top">
              <a href="${href}"><img src="${img}" width="130" height="98" alt="${p.title}" style="display:block;width:130px;height:98px;object-fit:cover;border:0"/></a>
            </td>
            <td style="padding:12px 16px;vertical-align:top">
              <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#877f73;margin:0 0 4px">${p.neighborhood}, ${p.city}</div>
              <a href="${href}" style="font-family:Georgia,serif;font-size:16px;color:#17140f;text-decoration:none;line-height:1.3">${p.title}</a>
              <div style="font-family:Georgia,serif;font-size:15px;color:#9c7256;margin-top:6px">${price}</div>
            </td>
          </tr>
        </table>
      </td></tr>`;
    })
    .join("");

  const preheader = `Vos ${count} bien${plural} sélectionné${plural} vous attendent — retrouvez-les sur tous vos appareils.`;

  const html = `
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
  <div style="background:#f7f5f0;padding:28px 16px;font-family:Georgia,'Times New Roman',serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;margin:0 auto">
      <tr><td style="padding:0 4px 20px">
        <img src="${params.siteUrl}/logo-complete.png" alt="Marrakech Realty" height="34" style="display:block;height:34px;width:auto;border:0"/>
      </td></tr>
      <tr><td style="background:#ffffff;border:1px solid #e6e0d5;border-radius:16px;padding:32px 28px">
        <h1 style="font-size:24px;font-weight:600;margin:0 0 12px;color:#17140f">Votre sélection vous attend.</h1>
        <p style="font-size:15px;line-height:1.6;color:#4a443c;margin:0 0 22px">
          Vous avez mis <strong>${count} bien${plural}</strong> de côté. Retrouvez-${count > 1 ? "les" : "le"} sur n'importe quel appareil — ordinateur, téléphone.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cards}</table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:26px 0 6px">
          <a href="${params.url}" style="display:inline-block;background:#9c7256;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">Retrouver ma sélection</a>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:18px 6px 0">
        <p style="font-size:12px;line-height:1.6;color:#877f73;margin:0;font-family:Arial,sans-serif">
          Ce lien vous est personnel — inutile de créer un compte. Un conseiller reste disponible au
          <a href="tel:+212660629444" style="color:#9c7256">+212&nbsp;660&nbsp;62&nbsp;94&nbsp;44</a>.
        </p>
      </td></tr>
    </table>
  </div>`;

  try {
    await sendEmail({
      to: params.to,
      subject: `Vos ${count} bien${plural} sélectionné${plural} vous attendent`,
      html,
    });
  } catch (err) {
    console.error("[submitFavoritesLead] email send failed:", err);
    // Non-bloquant : la sélection est déjà en base et restaurable via le lien.
  }
}
