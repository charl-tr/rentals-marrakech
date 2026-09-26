import { requireAdminSession, isDirector } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { EDITOR_FIELDS } from "@/lib/property-editor";
import PropertyEditor from "./PropertyEditor";

export default async function PropertyEditorSection({ slug }: { slug: string }) {
  const session = await requireAdminSession();
  if (!isDirector(session)) return null;
  const [property, neighborhoods, advisors] = await Promise.all([
    supabaseAdmin.from("properties").select(EDITOR_FIELDS.join(",")).eq("slug", slug).single(),
    supabaseAdmin.from("neighborhoods").select("slug,name,city").order("name"),
    supabaseAdmin.from("advisors").select("slug,name").order("name"),
  ]);
  if (property.error || neighborhoods.error || advisors.error || !property.data) {
    return <p role="alert" className="mt-6">Le formulaire n’a pas pu être chargé. Rechargez la page pour réessayer.</p>;
  }
  const values = Object.fromEntries(Object.entries(property.data).map(([key, value]) => [key,
    Array.isArray(value) ? value.join("\n") : value == null ? (["pool", "exclusivity"].includes(key) ? "false" : "") : String(value),
  ]));
  return <PropertyEditor key={values.updated_at} values={values}
    neighborhoods={(neighborhoods.data ?? []).map((n) => ({ value: n.slug, label: `${n.name} · ${n.city}` }))}
    advisors={(advisors.data ?? []).map((a) => ({ value: a.slug, label: a.name }))} />;
}
