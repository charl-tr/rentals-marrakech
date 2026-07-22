"use server";

// ════════════════════════════════════════════════════════════════════
// Mutations admin sur les biens (properties).
// Toutes guardées par `requiredRole: "director"` via defineMutation.
// ════════════════════════════════════════════════════════════════════

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { isDirector, requireAdminSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PropertyStatus } from "@/data/properties";
import { defineMutation, type MutationState } from "./_core/defineMutation";

export type PropertyActionState = MutationState;

const PROPERTY_STATUSES: readonly PropertyStatus[] = [
  "available",
  "new",
  "sold",
  "rented",
  "reserved",
];

// ── Toggle published (nouvelle forme) ───────────────────────────────

export const togglePublished = defineMutation({
  name: "togglePublished",
  requiredRole: "director",
  schema: z.object({
    slug: z.string().min(1),
    published: z.enum(["true", "false"]).transform((v) => v === "true"),
  }),
  handler: async ({ input }) => {
    const { error } = await supabaseAdmin
      .from("properties")
      .update({ published: input.published, updated_at: new Date().toISOString() })
      .eq("slug", input.slug);
    if (error) throw new Error(error.message);
    return {
      message: input.published
        ? "Bien publié."
        : "Bien dépublié (masqué du site public).",
    };
  },
  revalidate: ({ input }) => [
    "/admin/biens",
    `/admin/biens/${input.slug}`,
    `/acheter/${input.slug}`,
    `/louer/${input.slug}`,
    "/",
  ],
});

// ── Toggle featured (nouvelle forme) ────────────────────────────────

export const toggleFeatured = defineMutation({
  name: "toggleFeatured",
  requiredRole: "director",
  schema: z.object({
    slug: z.string().min(1),
    featured: z.enum(["true", "false"]).transform((v) => v === "true"),
  }),
  handler: async ({ input }) => {
    const { error } = await supabaseAdmin
      .from("properties")
      .update({ featured: input.featured, updated_at: new Date().toISOString() })
      .eq("slug", input.slug);
    if (error) throw new Error(error.message);
    return {
      message: input.featured
        ? "Bien mis en avant sur la home."
        : "Retiré de la mise en avant.",
    };
  },
  revalidate: ({ input }) => ["/admin/biens", `/admin/biens/${input.slug}`, "/"],
});

// ── Update status (commercial) ──────────────────────────────────────

export async function updatePropertyStatus(
  _prev: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const session = await requireAdminSession();
  if (!isDirector(session)) {
    return { status: "error", message: "Changement de statut réservé au directeur." };
  }

  const slug = formData.get("slug");
  const newStatus = formData.get("status");

  if (typeof slug !== "string" || typeof newStatus !== "string") {
    return { status: "error", message: "Paramètres manquants." };
  }
  if (!(PROPERTY_STATUSES as readonly string[]).includes(newStatus)) {
    return { status: "error", message: "Statut invalide." };
  }

  const { error } = await supabaseAdmin
    .from("properties")
    .update({
      status: newStatus as PropertyStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);

  if (error) {
    console.error("[updatePropertyStatus]:", error);
    return { status: "error", message: "Impossible de changer le statut." };
  }

  revalidatePath("/admin/biens");
  revalidatePath(`/admin/biens/${slug}`);
  revalidatePath(`/acheter/${slug}`);
  revalidatePath(`/louer/${slug}`);
  updateTag("admin");

  return { status: "success", message: `Statut mis à jour.` };
}

// ── Update price ────────────────────────────────────────────────────

export async function updatePropertyPrice(
  _prev: PropertyActionState,
  formData: FormData
): Promise<PropertyActionState> {
  const session = await requireAdminSession();
  if (!isDirector(session)) {
    return { status: "error", message: "Changement de prix réservé au directeur." };
  }

  const slug = formData.get("slug");
  const priceRaw = formData.get("priceEur");
  if (typeof slug !== "string" || typeof priceRaw !== "string") {
    return { status: "error", message: "Paramètres manquants." };
  }

  const price = Number(priceRaw.replace(/[\s,]/g, ""));
  if (!Number.isFinite(price) || price <= 0) {
    return { status: "error", message: "Prix invalide." };
  }

  const { error } = await supabaseAdmin
    .from("properties")
    .update({ price_eur: Math.round(price), updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    console.error("[updatePropertyPrice]:", error);
    return { status: "error", message: "Impossible de mettre à jour le prix." };
  }

  revalidatePath("/admin/biens");
  revalidatePath(`/admin/biens/${slug}`);
  revalidatePath(`/acheter/${slug}`);
  revalidatePath(`/louer/${slug}`);
  updateTag("admin");

  return {
    status: "success",
    message: `Prix ajusté à ${new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price)}.`,
  };
}
