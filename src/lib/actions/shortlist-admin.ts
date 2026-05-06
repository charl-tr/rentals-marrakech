"use server";

// ════════════════════════════════════════════════════════════════════
// Mutations admin — shortlist curée côté conseiller pour un lead.
// Tout ajout/retrait est logué en lead_event pour la timeline interne.
// ════════════════════════════════════════════════════════════════════

import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { defineMutation } from "./_core/defineMutation";

// Utilitaire : check ownership (advisor ne peut agir que sur SES leads)
async function leadBelongsToSessionOrDirector(
  leadId: string,
  advisorSlug: string,
  role: "advisor" | "director"
): Promise<boolean> {
  if (role === "director") return true;
  const { data } = await supabaseAdmin
    .from("leads")
    .select("assigned_advisor_slug")
    .eq("id", leadId)
    .maybeSingle();
  return data?.assigned_advisor_slug === advisorSlug;
}

export const addToShortlist = defineMutation({
  name: "addToShortlist",
  schema: z.object({
    leadId: z.string().uuid(),
    propertySlug: z.string().min(1),
    note: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  }),
  guard: async ({ input, session }) => {
    const ok = await leadBelongsToSessionOrDirector(
      input.leadId,
      session.advisorSlug,
      session.role
    );
    return ok ? null : "Ce lead n'est pas dans votre portefeuille.";
  },
  handler: async ({ input, session }) => {
    const { error } = await supabaseAdmin.from("lead_shortlist").upsert(
      {
        lead_id: input.leadId,
        property_slug: input.propertySlug,
        advisor_note: input.note ?? null,
        added_by: session.advisorSlug,
      },
      { onConflict: "lead_id,property_slug" }
    );
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("lead_events").insert({
      lead_id: input.leadId,
      type: "note",
      author_slug: session.advisorSlug,
      body: `Bien ajouté à la shortlist : ${input.propertySlug}${input.note ? ` — « ${input.note} »` : ""}`,
    });

    return { message: "Bien ajouté à la shortlist client." };
  },
  revalidate: ({ input }) => [
    `/admin/leads/${input.leadId}`,
    // Aucun revalidate portail — lookup dynamique par token
  ],
});

export const removeFromShortlist = defineMutation({
  name: "removeFromShortlist",
  schema: z.object({
    leadId: z.string().uuid(),
    propertySlug: z.string().min(1),
  }),
  guard: async ({ input, session }) => {
    const ok = await leadBelongsToSessionOrDirector(
      input.leadId,
      session.advisorSlug,
      session.role
    );
    return ok ? null : "Accès refusé.";
  },
  handler: async ({ input, session }) => {
    const { error } = await supabaseAdmin
      .from("lead_shortlist")
      .delete()
      .eq("lead_id", input.leadId)
      .eq("property_slug", input.propertySlug);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("lead_events").insert({
      lead_id: input.leadId,
      type: "note",
      author_slug: session.advisorSlug,
      body: `Bien retiré de la shortlist : ${input.propertySlug}`,
    });

    return { message: "Bien retiré." };
  },
  revalidate: ({ input }) => [`/admin/leads/${input.leadId}`],
});
