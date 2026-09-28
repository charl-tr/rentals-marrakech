import { notFound } from "next/navigation";
import { requireAdminSession, isDirector } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function ConversionPage() {
  const session = await requireAdminSession();
  if (!isDirector(session)) notFound();
  const sinceDate = new Date();
  sinceDate.setUTCDate(sinceDate.getUTCDate() - 30);
  const since = sinceDate.toISOString();
  const events: { session_id: string; event: string }[] = [];
  const leads: { id: string; status: string; meta: Record<string, unknown> | null }[] = [];
  let unavailable = false;
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabaseAdmin.from("conversion_events").select("session_id,event").gte("created_at", since).order("id").range(offset, offset + 499);
    if (error) { unavailable = true; break; }
    events.push(...data);
    if (data.length < 500) break;
  }
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabaseAdmin.from("leads").select("id,status,meta").gte("created_at", since).order("id").range(offset, offset + 499);
    if (error) { unavailable = true; break; }
    leads.push(...data);
    if (data.length < 500) break;
  }
  const viewed = new Set(events.filter((e) => e.event === "property_view").map((e) => e.session_id));
  const selected = new Set(events.filter((e) => e.event === "favorite_add" && viewed.has(e.session_id)).map((e) => e.session_id));
  const attributed = leads.filter((l) => typeof l.meta?.funnel_session_id === "string" && viewed.has(l.meta.funnel_session_id));
  // History, not only current status: a visit remains counted when a lead is later lost.
  const visited = new Set<string>();
  const signed = new Set<string>();
  for (let i = 0; i < attributed.length; i += 100) {
    const ids = attributed.slice(i, i + 100).map((l) => l.id);
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabaseAdmin.from("lead_events").select("lead_id,payload").in("lead_id", ids).eq("type", "status_change").order("id").range(offset, offset + 499);
      if (error) { unavailable = true; break; }
      for (const e of data) {
        if (e.payload?.to === "visit_done") visited.add(e.lead_id);
        if (e.payload?.to === "signed") signed.add(e.lead_id);
      }
      if (data.length < 500) break;
    }
  }
  const sessionsFor = (predicate: (lead: typeof leads[number]) => boolean) => new Set(attributed.filter(predicate).map((l) => l.meta!.funnel_session_id)).size;
  const steps = [
    ["Fiche consultée", viewed.size],
    ["Ajout à la sélection", selected.size],
    ["Demande enregistrée", sessionsFor(() => true)],
    ["Visite réalisée", sessionsFor((l) => visited.has(l.id) || l.status === "visit_done")],
    ["Transaction signée", sessionsFor((l) => signed.has(l.id) || l.status === "signed")],
  ] as const;
  return <main className="container-luxe space-y-8 py-12">
    <header><div className="eyebrow">Pilotage commercial · 30 derniers jours</div><h1 className="mt-3 font-serif text-4xl">Du bien consulté à la signature.</h1><p className="mt-4 max-w-3xl text-sm text-[var(--color-stone)]">Cohorte de sessions consentantes ayant consulté une fiche. Une session dure au maximum 30 minutes, dans un onglet. Ce ne sont pas des personnes uniques. Les favoris sont facultatifs : une demande peut être directe.</p></header>
    {unavailable ? <p role="alert" className="rounded-xl border p-6">Mesure indisponible : vérifier la migration 0015 et les accès aux données. Aucun chiffre n’est présenté comme zéro par défaut.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{steps.map(([label, count]) => <section key={label} className="rounded-xl border border-[var(--color-border)] bg-white p-5"><h2 className="text-sm">{label}</h2><p className="mt-4 font-serif text-4xl">{count}</p><p className="mt-2 text-xs text-[var(--color-stone)]">{viewed.size ? `${(100 * count / viewed.size).toFixed(1)} % des sessions avec fiche` : "Pas encore de référence"}</p></section>)}</div>}
    <section className="rounded-xl bg-[var(--color-cream)] p-6 text-sm leading-relaxed"><h2 className="font-serif text-2xl">Ce que ces chiffres permettent de dire</h2><ul className="mt-4 list-disc space-y-2 pl-5"><li>Les visites réalisées et signatures viennent des statuts renseignés dans le CRM, jamais d’un clic.</li><li>Le suivi ne couvre pas les visiteurs sans consentement, les autres appareils, ni les demandes téléphone ou WhatsApp non rapprochées manuellement.</li><li>Un ajout aux favoris n’est pas une demande. Un passage au statut « signé » n’est pas un encaissement vérifié.</li><li>Référence avant lancement : non renseignée. Comparer des périodes et sources de trafic comparables ; aucun gain de chiffre d’affaires ne peut encore être attribué au site.</li><li>Les historiques antérieurs à cette instrumentation ne sont pas reconstruits. Les anciennes demandes sans attribution restent dans le CRM.</li></ul></section>
  </main>;
}
