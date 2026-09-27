"use client";

import { useActionState, useOptimistic } from "react";
import type { MutationState } from "@/lib/actions/_core/defineMutation";
import { quickEditProperty } from "@/lib/actions/property-quick-edit";
import { useMutationToast } from "@/lib/hooks/useMutationToast";
import { inventoryStatusLabel } from "@/lib/admin-inventory";
import type { Listing, PropertyStatus } from "@/data/properties";

export default function PropertyQuickActions({ slug, title, status, published, listing, canEdit }: { slug: string; title: string; status: PropertyStatus; published: boolean; listing: Listing; canEdit: boolean }) {
  const [visible, setVisible] = useOptimistic(published);
  const [state, action, pending] = useActionState<MutationState, FormData>(async (previous, form) => {
    if (form.get("field") === "published") setVisible(form.get("value") === "true");
    try { return await quickEditProperty(previous, form); }
    catch { return { status: "error", message: "Connexion interrompue. L’état n’a pas pu être confirmé ; actualisez avant de réessayer." }; }
  }, { status: "idle" });
  useMutationToast(state);
  if (!canEdit) return <div className="flex flex-wrap gap-2 text-xs"><span>{inventoryStatusLabel(status, listing)}</span><span>· {published ? "En ligne" : "Masqué / brouillon"}</span></div>;
  return <div className="flex flex-wrap items-center gap-2" aria-label={`Actions rapides : ${title}`}>
    <form action={action} onSubmit={(event) => {
      const form = event.currentTarget;
      const value = new FormData(form).get("value");
      if ((value === "sold" || value === "rented") && !window.confirm(`Marquer « ${title} » comme ${value === "sold" ? "vendu" : "loué"} ? Sa visibilité ne changera pas.`)) { event.preventDefault(); form.reset(); }
    }}>
      <input type="hidden" name="slug" value={slug} /><input type="hidden" name="field" value="status" /><input type="hidden" name="expected" value={status} />
      <select key={`${status}-${pending}-${state.status}`} name="value" aria-label={`Statut commercial : ${title}`} defaultValue={status} disabled={pending} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="min-h-10 max-w-full rounded-lg border border-[#d8cbbc] bg-[#f7f4ee] px-2 text-xs font-medium disabled:opacity-50">
        <option value="available">{listing === "vente" ? "À vendre" : "À louer"}</option>
        {status === "new" && <option value="new">{listing === "vente" ? "À vendre · nouveau" : "À louer · nouveau"}</option>}
        <option value="reserved">{listing === "vente" ? "Sous compromis" : "Réservé"}</option>
        <option value={listing === "vente" ? "sold" : "rented"}>{listing === "vente" ? "Vendu" : "Loué"}</option>
      </select>
    </form>
    <form action={action}>
      <input type="hidden" name="slug" value={slug} /><input type="hidden" name="field" value="published" /><input type="hidden" name="expected" value={String(published)} /><input type="hidden" name="value" value={String(!published)} />
      <button type="submit" role="switch" aria-checked={visible} aria-label={`Visible sur le site : ${title}`} aria-busy={pending} disabled={pending} title={published ? "Masquer du site" : "Publier sur le site"} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-[#795238] disabled:opacity-50">
        <span aria-hidden="true" className={`relative h-6 w-11 rounded-full transition-colors ${visible ? "bg-[#795238]" : "bg-[#c7beb3]"}`}><span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${visible ? "translate-x-[22px]" : "translate-x-0.5"}`} /></span>
        <span>{pending ? "Enregistrement…" : published ? "En ligne" : "Masqué"}</span>
      </button>
    </form>
    {state.status === "error" && <p role="alert" className="w-full text-xs text-red-700">{state.message}</p>}
  </div>;
}
