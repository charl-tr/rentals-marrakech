"use server";

import { updateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { propertyEditorSchema } from "@/lib/property-editor";
import { defineMutation } from "./_core/defineMutation";

export const savePropertyDetails = defineMutation({
  name: "savePropertyDetails",
  requiredRole: "director",
  schema: propertyEditorSchema,
  handler: async ({ input }) => {
    const { slug, updated_at, ...fields } = input;
    if (fields.published && fields.images.length === 0) throw new Error("Ajoutez au moins une photo avant de publier, ou enregistrez la fiche en brouillon.");
    // Compare-and-set: do not silently overwrite another advisor's changes.
    const { data: current, error: readError } = await supabaseAdmin.from("properties")
      .select("updated_at,description,reference").eq("slug", slug).single();
    if (readError || !current) throw new Error("Bien introuvable.");
    if (current.updated_at !== updated_at) throw new Error("Cette fiche a changé. Rechargez la page avant de réessayer ; vos modifications ne sont pas enregistrées.");
    if (fields.reference !== current.reference) throw new Error("La référence de ce bien est protégée et ne peut pas être modifiée depuis cette fiche.");
    if (fields.reference.trim().toUpperCase() !== current.reference.trim().toUpperCase()) {
      for (let offset = 0; ; offset += 500) {
        const { data: references, error: duplicateError } = await supabaseAdmin.from("properties")
          .select("slug,reference").order("slug").range(offset, offset + 499);
        if (duplicateError) throw new Error("La référence n’a pas pu être vérifiée. Réessayez.");
        if (references?.some((p) => p.slug !== slug && p.reference.trim().toUpperCase() === fields.reference.trim().toUpperCase())) {
          throw new Error("Cette référence est déjà utilisée par un autre bien. Choisissez une référence unique.");
        }
        if (!references || references.length < 500) break;
      }
    }
    const { data, error } = await supabaseAdmin.from("properties").update({
      ...fields,
      // The public detail prefers story over description. Clear it only when
      // the director explicitly changes the description, not on unrelated edits.
      ...(fields.description !== (current.description ?? "") ? { story: null, description_html: null } : {}),
      updated_at: new Date().toISOString(),
    }).eq("slug", slug).eq("updated_at", updated_at).select("slug");
    if (error?.code === "23505") throw new Error("Cette référence est déjà utilisée par un autre bien.");
    if (error) throw new Error("Enregistrement impossible. Vérifiez les champs et réessayez.");
    if (!data?.length) throw new Error("La fiche vient de changer. Rechargez-la avant de réessayer.");
    updateTag("public-properties");
    return { message: fields.published ? "Fiche enregistrée et publiée. La galerie et les informations sont à jour." : "Brouillon enregistré. Cette fiche n’est pas visible sur le site public." };
  },
  revalidate: ({ input }) => ["/", "/admin/biens", `/admin/biens/${input.slug}`, `/acheter/${input.slug}`, `/louer/${input.slug}`, "/acheter", "/louer", "/essaouira", "/biens-vendus"],
});
