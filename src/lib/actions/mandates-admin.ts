"use server";

// ════════════════════════════════════════════════════════════════════
// Mutations admin — propriétaire + mandat + property events.
// Toutes via defineMutation (vertical slice test).
// ════════════════════════════════════════════════════════════════════

import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ownerUpdateSchema,
  mandateCreateSchema,
  mandateCloseSchema,
} from "@/lib/mandates";
import { defineMutation } from "./_core/defineMutation";

// ── Update owner (info propriétaire sur bien) ──────────────────────

export const updatePropertyOwner = defineMutation({
  name: "updatePropertyOwner",
  requiredRole: "director",
  schema: ownerUpdateSchema,
  handler: async ({ input, session }) => {
    const patch = {
      owner_name: input.ownerName ?? null,
      owner_phone: input.ownerPhone ?? null,
      owner_email: input.ownerEmail ?? null,
      owner_notes: input.ownerNotes ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("properties")
      .update(patch)
      .eq("slug", input.slug);
    if (error) throw new Error(error.message);

    // Timeline event
    await supabaseAdmin.from("property_events").insert({
      property_slug: input.slug,
      type: "owner_updated",
      author_slug: session.advisorSlug,
      body: input.ownerName
        ? `Propriétaire renseigné : ${input.ownerName}`
        : "Informations propriétaire effacées",
    });

    return { message: "Propriétaire mis à jour." };
  },
  revalidate: ({ input }) => [
    "/admin/biens",
    `/admin/biens/${input.slug}`,
  ],
});

// ── Créer un mandat ─────────────────────────────────────────────────

export const createMandate = defineMutation({
  name: "createMandate",
  requiredRole: "director",
  schema: mandateCreateSchema,
  handler: async ({ input, session }) => {
    // Vérifie qu'il n'y a pas déjà un mandat actif
    const { data: existing } = await supabaseAdmin
      .from("mandates")
      .select("id")
      .eq("property_slug", input.propertySlug)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      throw new Error(
        "Un mandat actif existe déjà — clôture-le avant d'en créer un nouveau."
      );
    }

    const { data: mandate, error } = await supabaseAdmin
      .from("mandates")
      .insert({
        property_slug: input.propertySlug,
        type: input.type,
        exclusivity: input.exclusivity,
        commission_pct: input.commissionPct ?? null,
        signed_at: input.signedAt ?? null,
        start_date: input.startDate ?? null,
        expiry_date: input.expiryDate ?? null,
        notes: input.notes ?? null,
        status: "active",
        assigned_advisor_slug: session.advisorSlug,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    // Timeline event
    await supabaseAdmin.from("property_events").insert({
      property_slug: input.propertySlug,
      mandate_id: mandate?.id,
      type: "mandate_created",
      author_slug: session.advisorSlug,
      body: `Mandat ${input.type}${input.exclusivity ? " exclusif" : ""} signé`,
      payload: {
        type: input.type,
        exclusivity: input.exclusivity,
        commission_pct: input.commissionPct ?? null,
        expiry_date: input.expiryDate ?? null,
      },
    });

    // Reflet sur le bien : exclusivity sur Property
    if (input.exclusivity) {
      await supabaseAdmin
        .from("properties")
        .update({ exclusivity: true, updated_at: new Date().toISOString() })
        .eq("slug", input.propertySlug);
    }

    return { message: "Mandat créé." };
  },
  revalidate: ({ input }) => [
    "/admin/biens",
    `/admin/biens/${input.propertySlug}`,
    `/acheter/${input.propertySlug}`,
    `/louer/${input.propertySlug}`,
  ],
});

// ── Clôturer un mandat ──────────────────────────────────────────────

export const closeMandate = defineMutation({
  name: "closeMandate",
  requiredRole: "director",
  schema: mandateCloseSchema,
  handler: async ({ input, session }) => {
    // Récupère le mandat pour avoir propertySlug
    const { data: mandate } = await supabaseAdmin
      .from("mandates")
      .select("property_slug, type, exclusivity")
      .eq("id", input.mandateId)
      .maybeSingle();

    if (!mandate) throw new Error("Mandat introuvable.");

    const { error } = await supabaseAdmin
      .from("mandates")
      .update({
        status: "terminated",
        closed_at: new Date().toISOString().slice(0, 10),
        disposition: input.disposition ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.mandateId);

    if (error) throw new Error(error.message);

    await supabaseAdmin.from("property_events").insert({
      property_slug: mandate.property_slug as string,
      mandate_id: input.mandateId,
      type: "mandate_closed",
      author_slug: session.advisorSlug,
      body: input.disposition
        ? `Mandat clôturé — ${input.disposition}`
        : "Mandat clôturé",
    });

    // Si c'était un exclusif, retire l'exclusivité du bien
    if (mandate.exclusivity) {
      await supabaseAdmin
        .from("properties")
        .update({ exclusivity: false, updated_at: new Date().toISOString() })
        .eq("slug", mandate.property_slug as string);
    }

    return { message: "Mandat clôturé." };
  },
  revalidate: ({ input }) => ["/admin/biens", `/admin/biens/[slug]`],
  // Note : on pourrait lookup le propertySlug avant mais coûte un query
  // de plus ; les pages revalideront d'elles-mêmes sur navigation.
});
