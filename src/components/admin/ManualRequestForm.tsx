"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { addManualRequest } from "@/lib/actions/manual-request";

export default function ManualRequestForm({ propertySlug, requestId, prospects }: {
  propertySlug: string; requestId: string; prospects: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(addManualRequest, { status: "idle" });
  const [mode, setMode] = useState("existing");
  const [leadId, setLeadId] = useState("");
  const [search, setSearch] = useState("");
  const field = "mt-1 w-full rounded-[10px] border border-[var(--color-border)] bg-white px-3 py-2 text-sm";
  if (state.status === "success") return <div role="status" className="rounded-xl bg-[var(--color-cream)] p-4 text-sm">{state.message}<Link className="mt-3 block underline" href={`/admin/leads/${leadId || requestId}`}>Ouvrir le dossier →</Link></div>;
  return <details className="mb-5 rounded-xl border border-[var(--color-border)] p-4">
    <summary className="cursor-pointer text-sm font-medium">+ Ajouter une demande pour ce bien</summary>
    <p className="mt-3 text-xs text-[var(--color-stone)]">Appel, WhatsApp ou portail : rattachez la demande à un dossier existant, ou créez un prospect. Aucun échange externe n’est importé automatiquement.</p>
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="requestId" value={requestId} /><input type="hidden" name="propertySlug" value={propertySlug} />
      <label className="block text-sm">Prospect<select className={field} value={mode} onChange={(e) => { setMode(e.target.value); setLeadId(""); }}><option value="existing">Prospect existant</option><option value="new">Nouveau prospect</option></select></label>
      {mode === "existing" ? <>
        <label className="block text-sm">Rechercher par nom<input className={field} value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <label className="block text-sm">Dossier<select name="leadId" required value={leadId} onChange={(e) => setLeadId(e.target.value)} className={field}><option value="">Choisir un dossier</option>{prospects.filter((p) => p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) || p.id === leadId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <input type="hidden" name="name" value="" /><input type="hidden" name="email" value="" /><input type="hidden" name="phone" value="" />
      </> : <>
        <input type="hidden" name="leadId" value="" />
        <label className="block text-sm">Nom<input name="name" required maxLength={160} autoComplete="name" className={field} /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm">Email<input name="email" type="email" autoComplete="email" className={field} /></label><label className="block text-sm">Téléphone<input name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} /></label></div>
        <p className="text-xs text-[var(--color-stone)]">Un email ou un téléphone suffit.</p>
      </>}
      <label className="block text-sm">Origine<select name="source" className={field}><option value="phone">Téléphone</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="portal">Portail / autre site</option><option value="other">Autre</option></select></label>
      <label className="block text-sm">Contexte et prochaine action<textarea name="note" required maxLength={1500} rows={2} className={field} placeholder="Ex. Intéressé par une visite samedi. Le rappeler demain." /></label>
      <p className="text-xs text-[var(--color-stone)]">Cette note apparaît dans l’historique ; elle ne programme pas un rappel automatique.</p>
      {state.status === "error" && <p role="alert" className="text-sm text-red-700">{state.message} {Object.values(state.fieldErrors ?? {}).flat().join(" ")}</p>}
      <button disabled={pending} className="btn-primary" type="submit">{pending ? "Enregistrement…" : "Enregistrer la demande"}</button>
    </form>
  </details>;
}
