"use server";

import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { defineMutation } from "./_core/defineMutation";

export const addManualRequest = defineMutation({
  name: "addManualRequest",
  schema: z.object({
    requestId: z.uuid(),
    propertySlug: z.string().min(1).max(250),
    leadId: z.union([z.uuid(), z.literal("")]),
    name: z.string().trim().max(160),
    email: z.union([z.email(), z.literal("")]),
    phone: z.string().trim().max(40),
    source: z.enum(["phone", "whatsapp", "email", "portal", "other"]),
    note: z.string().trim().min(1, "Indiquez le contexte ou la prochaine action.").max(1500),
  }).superRefine((v, ctx) => {
    if (v.phone && v.phone.replace(/\D/g, "").length < 6) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Téléphone invalide." });
    }
    if (!v.leadId && (!v.name || (!v.email && !v.phone))) {
      ctx.addIssue({ code: "custom", path: ["name"], message: "Nom et email ou téléphone requis pour un nouveau prospect." });
    }
  }),
  handler: async ({ input, session }) => {
    const { data: property, error: propertyError } = await supabaseAdmin.from("properties").select("slug,reference,listing").eq("slug", input.propertySlug).maybeSingle();
    if (propertyError || !property) throw new Error("Bien introuvable.");
    const leadId = input.leadId || input.requestId;
    const { data: existing, error: existingError } = await supabaseAdmin.from("leads").select("id,assigned_advisor_slug").eq("id", leadId).maybeSingle();
    if (existingError) throw new Error("Lecture du dossier impossible.");
    if (existing && session.role !== "director" && existing.assigned_advisor_slug !== session.advisorSlug) throw new Error("Ce dossier n’est pas dans votre portefeuille.");
    if (input.leadId && !existing) throw new Error("Dossier introuvable.");

    if (!existing) {
      // Warn on exact contact matches. Never silently merge people or overwrite a dossier.
      for (const [field, value] of [["email", input.email.toLowerCase()], ["phone", input.phone]] as const) {
        if (!value) continue;
        let query = supabaseAdmin.from("leads").select("id").eq(field, value).limit(1);
        if (session.role !== "director") query = query.eq("assigned_advisor_slug", session.advisorSlug);
        const { data, error } = await query;
        if (error) throw new Error("Vérification des contacts indisponible.");
        if (data.length) throw new Error("Un dossier utilise déjà ces coordonnées. Choisissez « Prospect existant » pour le rattacher.");
      }
      const { error } = await supabaseAdmin.from("leads").insert({
        id: leadId, name: input.name, email: input.email.toLowerCase() || null, phone: input.phone || null,
        channel: input.source, property_slug: property.slug,
        intent: property.listing === "vente" ? "acheter" : "louer",
        message: input.note, status: "new", assigned_advisor_slug: session.advisorSlug,
        assigned_at: new Date().toISOString(), sla_tier: "standard",
        sla_due_at: new Date(Date.now() + 24 * 3600_000).toISOString(),
        meta: { manual_entry: true, created_by: session.advisorSlug },
      });
      if (error && error.code !== "23505") throw new Error("Création du dossier impossible.");
      if (error) throw new Error("Demande déjà enregistrée. Rechargez la page pour vérifier le dossier.");
    }
    const labels = { phone: "Téléphone", whatsapp: "WhatsApp", email: "Email", portal: "Portail / autre site", other: "Autre" };
    const { error } = await supabaseAdmin.from("lead_events").upsert({
      id: input.requestId, lead_id: leadId, type: "note", author_slug: session.advisorSlug,
      body: `Demande ${labels[input.source]} · Réf. ${property.reference}\n${input.note}`,
      payload: { kind: "property_request", property_slug: property.slug, source: input.source, manual_entry: true },
    }, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw new Error("Le dossier existe, mais le rattachement a échoué. Réessayez sans fermer le formulaire.");
    return { message: "Demande rattachée au dossier. Aucun email automatique envoyé." };
  },
  revalidate: ({ input }) => ["/admin", "/admin/leads", `/admin/biens/${input.propertySlug}`, `/admin/leads/${input.leadId || input.requestId}`],
});
