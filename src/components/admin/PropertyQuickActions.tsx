"use client";

import { useActionState } from "react";
import { quickEditProperty } from "@/lib/actions/property-quick-edit";
import { useMutationToast } from "@/lib/hooks/useMutationToast";
import { inventoryStatusLabel } from "@/lib/admin-inventory";
import type { Listing, PropertyStatus } from "@/data/properties";

export default function PropertyQuickActions({ slug, title, status, published, listing, canEdit }: { slug: string; title: string; status: PropertyStatus; published: boolean; listing: Listing; canEdit: boolean }) {
  const [state, action, pending] = useActionState(quickEditProperty, { status: "idle" });
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
    <form action={action} onSubmit={(event) => { if (!window.confirm(`${published ? "Masquer" : "Publier"} « ${title} » sur le site ? Son statut commercial restera inchangé.`)) event.preventDefault(); }}>
      <input type="hidden" name="slug" value={slug} /><input type="hidden" name="field" value="published" /><input type="hidden" name="expected" value={String(published)} /><input type="hidden" name="value" value={String(!published)} />
      <button type="submit" disabled={pending} title={published ? "Masquer du site" : "Publier sur le site"} className="min-h-10 rounded-lg border border-[#d8cbbc] px-3 text-xs font-medium disabled:opacity-50">{pending ? "Enregistrement…" : published ? "En ligne · Masquer" : "Masqué · Publier"}</button>
    </form>
    {state.status === "error" && <p role="alert" className="w-full text-xs text-red-700">{state.message}</p>}
  </div>;
}
