"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitDepositLead } from "@/lib/actions/deposit-lead";
import { englishTypes } from "@/lib/i18n/english";
import type { PropertyType } from "@/data/properties";
import FormGuard from "@/components/FormGuard";

export default function SellerContactForm({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const [version, setVersion] = useState(0);
  return <SellerForm locale={locale} key={version} onRestart={() => setVersion(v => v + 1)} />;
}

function SellerForm({ onRestart, locale }: { onRestart: () => void; locale: "fr" | "en" }) {
  const en = locale === "en";
  const copy: Record<string, string> = {"Votre demande a bien été reçue.":"Your enquiry has been received.","L’agence dispose de vos coordonnées pour échanger sur votre projet. Votre bien n’a pas été publié : les conditions de mise en vente seront définies avec vous.":"The agency has your details to discuss your plans. Your property has not been published: the terms of sale will be agreed with you.","Découvrir les biens en vente":"Explore properties for sale","Présenter un autre bien":"Tell us about another property","Parlons de votre bien.":"Let’s talk about your property.","Votre nom et un numéro suffisent pour commencer. Aucun compte à créer, aucun document à fournir.":"Your name and phone number are enough to get started. No account or documents needed.","Votre nom":"Your name","Téléphone":"Phone","— facultatif":"— optional","Type de bien":"Property type","À préciser ensemble":"To discuss together","Ville":"City","Autre ville / alentours":"Other city / nearby","Ajouter quelques précisions — facultatif":"Add a few details — optional","Quartier":"Area","Votre projet":"Your project","Confidentialité":"Privacy","Cette demande ne signe aucun mandat et ne publie aucune annonce. Vos coordonnées servent à traiter votre projet.":"This enquiry does not sign an agency agreement or publish a listing. Your details are used to respond to your project."};
  const t = (value: string) => en ? copy[value] ?? value : value;
  const [state, action, pending] = useActionState(submitDepositLead, { status: "idle" });
  const [values, setValues] = useState({ firstName: "", phone: "", email: "", type: "", city: "", neighborhood: "", description: "" });
  const confirmation = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state.status === "success") confirmation.current?.focus(); }, [state.status]);
  const set = (key: keyof typeof values, value: string) => setValues(v => ({ ...v, [key]: value }));
  if (state.status === "success") return <div role="status" className="rounded-2xl border border-[var(--color-border)] bg-white p-7 md:p-9">
    <h2 ref={confirmation} tabIndex={-1} className="font-serif text-3xl">{t("Votre demande a bien été reçue.")}</h2>
    <p className="mt-4 leading-relaxed text-[var(--color-stone)]">{t("L’agence dispose de vos coordonnées pour échanger sur votre projet. Votre bien n’a pas été publié : les conditions de mise en vente seront définies avec vous.")}</p>
    <Link href={en ? "/en/buy" : "/acheter"} className="btn-gold mt-6">{t("Découvrir les biens en vente")}</Link>
    <button type="button" onClick={onRestart} className="mt-5 block text-sm underline underline-offset-4">{t("Présenter un autre bien")}</button>
  </div>;
  return <form action={action} className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
    <FormGuard />
    <input type="hidden" name="locale" value={locale} />
    <h2 className="font-serif text-3xl">{t("Parlons de votre bien.")}</h2>
    <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">{t("Votre nom et un numéro suffisent pour commencer. Aucun compte à créer, aucun document à fournir.")}</p>
    <fieldset disabled={pending} className="mt-6 grid gap-4 sm:grid-cols-2 disabled:opacity-70">
      <label className="text-sm font-medium">{t("Votre nom")} <span aria-hidden="true">*</span><input name="firstName" required maxLength={100} autoComplete="name" className="field mt-2 w-full" value={values.firstName} onChange={e => set("firstName", e.target.value)} /></label>
      <label className="text-sm font-medium">{t("Téléphone")} <span aria-hidden="true">*</span><input name="phone" type="tel" required minLength={8} maxLength={40} autoComplete="tel" placeholder={en ? "+212… or +33…" : "+212… ou +33…"} className="field mt-2 w-full" value={values.phone} onChange={e => set("phone", e.target.value)} /></label>
      <label className="text-sm font-medium sm:col-span-2">E-mail <span className="font-normal text-[var(--color-stone)]">{t("— facultatif")}</span><input name="email" type="email" maxLength={254} autoComplete="email" className="field mt-2 w-full" value={values.email} onChange={e => set("email", e.target.value)} /></label>
      <label className="text-sm font-medium">{t("Type de bien")}<select name="type" className="field mt-2 w-full" value={values.type} onChange={e => set("type", e.target.value)}><option value="">{t("À préciser ensemble")}</option>{[["villa","Villa"],["appartement","Appartement"],["riad-renove","Riad rénové"],["riad-a-renover","Riad à rénover"],["terrain","Terrain"],["maison-hotes","Maison d’hôtes"],["programme-neuf","Programme neuf"],["autre","Commerce / autre"]].map(([v,l])=><option key={v} value={v}>{en ? englishTypes[v as PropertyType] : l}</option>)}</select></label>
      <label className="text-sm font-medium">{t("Ville")}<select name="city" className="field mt-2 w-full" value={values.city} onChange={e => set("city", e.target.value)}><option value="">{t("À préciser ensemble")}</option><option>Marrakech</option><option>Essaouira</option><option value="Autre">{t("Autre ville / alentours")}</option></select></label>
      <details className="sm:col-span-2"><summary className="cursor-pointer py-2 text-sm font-medium text-[var(--color-accent-deep)]">{t("Ajouter quelques précisions — facultatif")}</summary><div className="mt-3 grid gap-4"><label className="text-sm">{t("Quartier")}<input name="neighborhood" maxLength={150} className="field mt-2 w-full" value={values.neighborhood} onChange={e => set("neighborhood",e.target.value)} /></label><label className="text-sm">{t("Votre projet")}<textarea name="description" maxLength={3000} rows={3} placeholder={en ? "Area, timing, questions… You don’t need every detail." : "Surface, délai souhaité, questions… Pas besoin de tout connaître."} className="field mt-2 w-full" value={values.description} onChange={e=>set("description",e.target.value)} /></label></div></details>
      {state.status === "error" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{en ? state.fieldErrors ? "Check your name, phone number and email (if provided)." : "Something went wrong. Please try again or call us." : state.message}</p>}
      <button type="submit" disabled={pending} className="btn-gold w-full justify-center sm:col-span-2">{en ? pending ? "Sending…" : "Contact me about selling" : pending ? "Envoi en cours…" : "Être contacté pour vendre mon bien"}</button>
    </fieldset>
    <p className="mt-4 text-xs leading-relaxed text-[var(--color-stone)]">{t("Cette demande ne signe aucun mandat et ne publie aucune annonce. Vos coordonnées servent à traiter votre projet.")} <Link href="/politique-confidentialite" className="underline underline-offset-2">{t("Confidentialité")}</Link>.</p>
  </form>;
}
