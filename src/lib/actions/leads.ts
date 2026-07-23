"use server";

// ════════════════════════════════════════════════════════════════════
// Server actions — soumission de leads depuis les formulaires publics
// ════════════════════════════════════════════════════════════════════
// Appelé par :
//   - /contact                   (formulaire générique)
//   - PropertyDetail             (CTA "Demander ce bien")
//   - /deposer-un-bien           (formulaire vendeur)
//
// Flow : FormData → Zod parse → computation SLA → INSERT via anon client
//        (RLS: "anon can insert leads").
//
// Pas d'envoi d'email ici — branché dans une passe Resend ultérieure
// (le lead est sauvegardé même si l'email échoue).
// ════════════════════════════════════════════════════════════════════

import { updateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { getAdvisor, getPropertyBySlug } from "@/lib/db";
import {
  computeSlaDueAt,
  computeSlaTier,
  INTENT_FROM_PROJECT_LABEL,
  leadSubmitSchema,
  type LeadIntent,
} from "@/lib/leads";
import { sendEmail } from "@/lib/email/client";
import {
  renderClientConfirmation,
  renderAdvisorNotification,
} from "@/lib/email/templates";
import { isLikelyBot, looksSpammy } from "@/lib/anti-spam";

// ── État retourné à useActionState ─────────────────────────────────
export type LeadActionState =
  | { status: "idle" }
  | { status: "success"; leadId: string; advisorSlug: string | null }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

// ── Assignation conseiller : règle simple pour la démo ─────────────
// v1 : assignation par spécialité quartier si connue, sinon round-robin.
// Sera remplacée par les règles territoriales du directeur en Sprint 2.5.
async function pickAdvisor(params: {
  propertyCity?: "Marrakech" | "Essaouira" | null;
  propertyNeighborhoodSlug?: string | null;
  propertyType?: string | null;
}): Promise<string | null> {
  const { data: advisors } = await supabase
    .from("advisors")
    .select("slug, specialties")
    .eq("active", true);

  if (!advisors || advisors.length === 0) return null;

  // Match par spécialité (format "villa:palmeraie", "riad:medina")
  if (params.propertyNeighborhoodSlug) {
    const match = advisors.find((a) => {
      const specs = (a.specialties as string[] | null) ?? [];
      return specs.some((s) => s.includes(params.propertyNeighborhoodSlug!));
    });
    if (match) return match.slug;
  }

  // Dédié Essaouira
  if (params.propertyCity === "Essaouira") {
    const essaouira = advisors.find((a) => {
      const specs = (a.specialties as string[] | null) ?? [];
      return specs.some((s) => s.includes("essaouira") || s.includes("diabat"));
    });
    if (essaouira) return essaouira.slug;
  }

  // Fallback : premier conseiller actif (ordre DB)
  return advisors[0].slug;
}

// ── Server action principale ───────────────────────────────────────
export async function submitLead(
  _prev: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  // 0. Anti-spam — drop silencieux (le bot reçoit un "succès", ne réessaie pas)
  if (isLikelyBot(formData)) {
    return { status: "success", leadId: "", advisorSlug: null };
  }

  // 1. Parse brut
  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSubmitSchema.safeParse(raw);

  if (!parsed.success) {
    const tree = parsed.error.flatten();
    return {
      status: "error",
      message: "Le formulaire contient des erreurs.",
      fieldErrors: tree.fieldErrors as Record<string, string[]>,
    };
  }
  const input = parsed.data;

  // 1b. Contenu manifestement spammy (liens en rafale) → drop silencieux
  if (looksSpammy(input.message)) {
    return { status: "success", leadId: "", advisorSlug: null };
  }

  // 2. Contexte bien (si slug fourni)
  const property = input.propertySlug
    ? await getPropertyBySlug(input.propertySlug)
    : null;

  // 3. Intent canonique depuis le libellé "project" (facultatif → défaut)
  const project = input.project ?? "Prise de contact";
  const intent: LeadIntent =
    INTENT_FROM_PROJECT_LABEL[project] ??
    (project.toLowerCase().includes("vendre") ? "vendre" : "autre");

  // 4. SLA
  const slaTier = computeSlaTier({
    propertyPrice: property?.price ?? null,
    propertyCity: property?.city ?? null,
  });
  const slaDueAt = computeSlaDueAt(slaTier);

  // 5. Assignation conseiller
  const advisorSlug = await pickAdvisor({
    propertyCity: property?.city ?? null,
    propertyNeighborhoodSlug: property?.neighborhoodSlug ?? null,
    propertyType: property?.type ?? null,
  });

  // 6. Insertion — pas de .select() chaîné : RLS anon autorise INSERT
  //    mais pas SELECT, donc un read-back post-insert échouerait.
  //    On génère le portal token côté app pour qu'il soit connu avant insert
  //    et utilisable dans l'email immédiatement.
  const portalToken = crypto.randomUUID();
  const name = `${input.firstName} ${input.lastName}`.trim();
  const { error } = await supabase.from("leads").insert({
    name,
    email: input.email,
    phone: input.phone ?? null,
    channel: input.channel,
    source_page: input.sourcePage ?? null,
    property_slug: input.propertySlug ?? null,
    intent,
    message: input.message ?? null,
    criteria_type: property?.type ?? null,
    criteria_neighborhood_slug: property?.neighborhoodSlug || null,
    criteria_budget_max: property?.price ?? null,
    status: "new",
    assigned_advisor_slug: advisorSlug,
    assigned_at: advisorSlug ? new Date().toISOString() : null,
    sla_tier: slaTier,
    sla_due_at: slaDueAt.toISOString(),
    portal_token: portalToken,
    meta: {
      project_label: project,
    },
  });

  if (error) {
    // Supabase PostgrestError sérialise mal via console.error — extraction explicite.
    console.error("[submitLead] insert error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return {
      status: "error",
      message:
        "Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous contacter directement par téléphone.",
    };
  }

  // Le lead est en base → on expire le cache court des listes admin pour
  // qu'il apparaisse immédiatement dans /admin/leads (sinon jusqu'à 15s).
  try {
    updateTag("admin");
  } catch {
    // updateTag ne peut échouer que hors Server Action — ici on l'est.
  }

  // ── Emails transactionnels (non-bloquants) ───────────────────────
  // Si RESEND_API_KEY absente → log console (mode démo local).
  // Si un envoi échoue → on ne bloque pas le lead (déjà sauvegardé).
  void sendTransactionalEmails({
    firstName: input.firstName,
    clientName: name,
    clientEmail: input.email,
    clientPhone: input.phone ?? null,
    message: input.message ?? null,
    project,
    channel: input.channel,
    slaTier,
    advisorSlug,
    property,
    portalToken,
  });

  return {
    status: "success",
    leadId: "",
    advisorSlug,
  };
}

async function sendTransactionalEmails(params: {
  firstName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  message: string | null;
  project: string;
  channel: string;
  slaTier: "urgent" | "standard";
  advisorSlug: string | null;
  property: Awaited<ReturnType<typeof getPropertyBySlug>>;
  portalToken: string;
}) {
  try {
    const advisor = params.advisorSlug ? await getAdvisor(params.advisorSlug) : null;
    const slaHours = params.slaTier === "urgent" ? 4 : 24;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const portalUrl = `${siteUrl}/mon-espace/${params.portalToken}`;

    // 1. Accusé au client
    const clientEmail = renderClientConfirmation({
      firstName: params.firstName,
      advisor,
      property: params.property
        ? {
            title: params.property.title,
            reference: params.property.reference,
            slug: params.property.slug,
            city: params.property.city,
            neighborhood: params.property.neighborhood,
          }
        : null,
      slaHours,
      portalUrl,
    });
    await sendEmail({
      to: params.clientEmail,
      subject: clientEmail.subject,
      html: clientEmail.html,
      replyTo: advisor?.email || undefined,
    });

    // 2. Notif au conseiller assigné (si email connu)
    if (advisor?.email) {
      const advisorEmail = renderAdvisorNotification({
        leadId: "new-" + Date.now(),
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        clientPhone: params.clientPhone,
        message: params.message,
        project: params.project,
        channel: params.channel,
        slaTier: params.slaTier,
        property: params.property
          ? {
              title: params.property.title,
              reference: params.property.reference,
              slug: params.property.slug,
              city: params.property.city,
              neighborhood: params.property.neighborhood,
              price: params.property.price,
              currency: params.property.currency,
            }
          : null,
        adminUrl: `${siteUrl}/admin/leads`,
      });
      await sendEmail({
        to: advisor.email,
        subject: advisorEmail.subject,
        html: advisorEmail.html,
        replyTo: params.clientEmail,
      });
    }
  } catch (err) {
    console.error("[submitLead] email send failed:", err);
    // Non-bloquant : le lead est déjà en DB
  }
}
