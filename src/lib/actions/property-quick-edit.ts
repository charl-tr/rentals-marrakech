"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { defineMutation } from "./_core/defineMutation";

export const quickEditProperty = defineMutation({
  name: "quickEditProperty", requiredRole: "director",
  schema: z.object({ slug: z.string().min(1).max(250), field: z.enum(["status", "published"]), value: z.string(), expected: z.string() }),
  handler: async ({ input }) => {
    const { data: row, error } = await supabaseAdmin.from("properties").select("status,published,listing,images,updated_at").eq("slug", input.slug).single();
    if (error || !row) throw new Error("Bien introuvable. Rechargez la liste.");
    if (String(row[input.field]) !== input.expected) throw new Error("Ce bien a changé depuis l’affichage. Rechargez la liste avant de réessayer.");
    let value: string | boolean;
    if (input.field === "published") {
      if (!["true", "false"].includes(input.value)) throw new Error("Visibilité invalide.");
      value = input.value === "true";
      if (value && !row.images?.length) throw new Error("Ajoutez une photo dans la fiche avant de publier.");
    } else {
      const allowed = ["available", "new", "reserved", row.listing === "vente" ? "sold" : "rented"];
      if (!allowed.includes(input.value)) throw new Error("Statut incompatible avec cette transaction.");
      value = input.value;
    }
    const { data: changed, error: saveError } = await supabaseAdmin.from("properties")
      .update({ [input.field]: value, updated_at: new Date().toISOString() }).eq("slug", input.slug).eq("updated_at", row.updated_at).select("slug");
    if (saveError || !changed?.length) throw new Error("Modification non enregistrée. Le bien a peut-être changé ; rechargez la liste.");
    updateTag("public-properties");
    return { message: input.field === "published" ? (value ? "Bien publié." : "Bien masqué, conservé dans le portefeuille.") : "Statut enregistré. La visibilité du bien reste inchangée." };
  },
  revalidate: ({ input }) => ["/admin/biens", `/admin/biens/${input.slug}`, "/", "/acheter", "/louer", "/essaouira", "/biens-vendus", `/acheter/${input.slug}`, `/louer/${input.slug}`],
});
