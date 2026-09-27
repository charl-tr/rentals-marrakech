"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitDepositLead } from "@/lib/actions/deposit-lead";
import FormGuard from "@/components/FormGuard";

export default function SellerContactForm() {
  const [version, setVersion] = useState(0);
  return <SellerForm key={version} onRestart={() => setVersion(v => v + 1)} />;
}

function SellerForm({ onRestart }: { onRestart: () => void }) {
  const [state, action, pending] = useActionState(submitDepositLead, { status: "idle" });
  const [values, setValues] = useState({ firstName: "", phone: "", email: "", type: "", city: "", neighborhood: "", description: "" });
  const confirmation = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state.status === "success") confirmation.current?.focus(); }, [state.status]);
  const set = (key: keyof typeof values, value: string) => setValues(v => ({ ...v, [key]: value }));
  if (state.status === "success") return <div role="status" className="rounded-2xl border border-[var(--color-border)] bg-white p-7 md:p-9">
    <h2 ref={confirmation} tabIndex={-1} className="font-serif text-3xl">Votre demande a bien été reçue.</h2>
    <p className="mt-4 leading-relaxed text-[var(--color-stone)]">L’agence dispose de vos coordonnées pour échanger sur votre projet. Votre bien n’a pas été publié : les conditions de mise en vente seront définies avec vous.</p>
    <Link href="/acheter" className="btn-gold mt-6">Découvrir les biens en vente</Link>
    <button type="button" onClick={onRestart} className="mt-5 block text-sm underline underline-offset-4">Présenter un autre bien</button>
  </div>;
  return <form action={action} className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
    <FormGuard />
    <h2 className="font-serif text-3xl">Parlons de votre bien.</h2>
    <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">Votre nom et un numéro suffisent pour commencer. Aucun compte à créer, aucun document à fournir.</p>
    <fieldset disabled={pending} className="mt-6 grid gap-4 sm:grid-cols-2 disabled:opacity-70">
      <label className="text-sm font-medium">Votre nom <span aria-hidden="true">*</span><input name="firstName" required maxLength={100} autoComplete="name" className="field mt-2 w-full" value={values.firstName} onChange={e => set("firstName", e.target.value)} /></label>
      <label className="text-sm font-medium">Téléphone <span aria-hidden="true">*</span><input name="phone" type="tel" required minLength={8} maxLength={40} autoComplete="tel" placeholder="+212… ou +33…" className="field mt-2 w-full" value={values.phone} onChange={e => set("phone", e.target.value)} /></label>
      <label className="text-sm font-medium sm:col-span-2">E-mail <span className="font-normal text-[var(--color-stone)]">— facultatif</span><input name="email" type="email" maxLength={254} autoComplete="email" className="field mt-2 w-full" value={values.email} onChange={e => set("email", e.target.value)} /></label>
      <label className="text-sm font-medium">Type de bien<select name="type" className="field mt-2 w-full" value={values.type} onChange={e => set("type", e.target.value)}><option value="">À préciser ensemble</option>{[["villa","Villa"],["appartement","Appartement"],["riad-renove","Riad rénové"],["riad-a-renover","Riad à rénover"],["terrain","Terrain"],["maison-hotes","Maison d’hôtes"],["programme-neuf","Programme neuf"],["autre","Commerce / autre"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <label className="text-sm font-medium">Ville<select name="city" className="field mt-2 w-full" value={values.city} onChange={e => set("city", e.target.value)}><option value="">À préciser ensemble</option><option>Marrakech</option><option>Essaouira</option><option value="Autre">Autre ville / alentours</option></select></label>
      <details className="sm:col-span-2"><summary className="cursor-pointer py-2 text-sm font-medium text-[var(--color-accent-deep)]">Ajouter quelques précisions — facultatif</summary><div className="mt-3 grid gap-4"><label className="text-sm">Quartier<input name="neighborhood" maxLength={150} className="field mt-2 w-full" value={values.neighborhood} onChange={e => set("neighborhood",e.target.value)} /></label><label className="text-sm">Votre projet<textarea name="description" maxLength={3000} rows={3} placeholder="Surface, délai souhaité, questions… Pas besoin de tout connaître." className="field mt-2 w-full" value={values.description} onChange={e=>set("description",e.target.value)} /></label></div></details>
      {state.status === "error" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-gold w-full justify-center sm:col-span-2">{pending ? "Envoi en cours…" : "Être contacté pour vendre mon bien"}</button>
    </fieldset>
    <p className="mt-4 text-xs leading-relaxed text-[var(--color-stone)]">Cette demande ne signe aucun mandat et ne publie aucune annonce. Vos coordonnées servent à traiter votre projet. <Link href="/politique-confidentialite" className="underline underline-offset-2">Confidentialité</Link>.</p>
  </form>;
}
