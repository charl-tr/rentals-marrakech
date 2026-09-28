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
  const copy: Record<string, string> = {"Votre demande a bien été reçue.":"Your enquiry has been received.","Votre demande a été transmise à l’agence pour qu’un conseiller vous rappelle et prépare avec vous les prochaines étapes de l’estimation. Votre bien n’est pas publié : vous gardez la main.":"Your enquiry has been sent to the agency so an advisor can call you and discuss the next steps for a valuation. Your property is not published: you stay in control.","Découvrir les biens en vente":"Explore properties for sale","Présenter un autre bien":"Tell us about another property","Parlons de votre bien.":"Let’s talk about your property.","Quelques réponses pour préparer votre échange. Sans compte, sans document à fournir.":"A few answers to prepare your conversation. No account or documents needed.","Votre nom":"Your name","Téléphone":"Phone","— facultatif":"— optional","Type de bien":"Property type","À préciser ensemble":"To discuss together","Ville":"City","Autre ville / alentours":"Other city / nearby","Ajouter quelques précisions — facultatif":"Add a few details — optional","Quartier":"Area","Votre projet":"Your project","Confidentialité":"Privacy","Cette demande ne signe aucun mandat et ne publie aucune annonce. Vos coordonnées servent à traiter votre projet.":"This enquiry does not sign an agency agreement or publish a listing. Your details are used to respond to your project."};
  const t = (value: string) => en ? copy[value] ?? value : value;
  const [state, action, pending] = useActionState(submitDepositLead, { status: "idle" });
  const [values, setValues] = useState({ firstName: "", phone: "", email: "", type: "", city: "", neighborhood: "", description: "" });
  const [step, setStep] = useState(0);
  const fieldset = useRef<HTMLFieldSetElement>(null);
  const question = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) question.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [step]);
  const next = () => {
    const inputs = fieldset.current?.querySelectorAll<HTMLInputElement>("input");
    if (inputs && [...inputs].some(input => !input.reportValidity())) return;
    setStep(s => Math.min(3, s + 1));
  };
  const confirmation = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state.status === "success") confirmation.current?.focus(); }, [state.status]);
  const set = (key: keyof typeof values, value: string) => setValues(v => ({ ...v, [key]: value }));
  if (state.status === "success") return <div role="status" className="rounded-2xl border border-[var(--color-border)] bg-white p-7 md:p-9">
    <h2 ref={confirmation} tabIndex={-1} className="font-serif text-3xl">{t("Votre demande a bien été reçue.")}</h2>
    <p className="mt-4 leading-relaxed text-[var(--color-stone)]">{t("Votre demande a été transmise à l’agence pour qu’un conseiller vous rappelle et prépare avec vous les prochaines étapes de l’estimation. Votre bien n’est pas publié : vous gardez la main.")}</p>
    <Link href={en ? "/en/buy" : "/acheter"} className="btn-gold mt-6">{t("Découvrir les biens en vente")}</Link>
    <button type="button" onClick={onRestart} className="mt-5 block text-sm underline underline-offset-4">{t("Présenter un autre bien")}</button>
  </div>;
  return <form action={action} onSubmit={e => { if (step < 3) { e.preventDefault(); next(); } }} className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-8">
    <FormGuard />
    <input type="hidden" name="locale" value={locale} />
    {Object.entries(values).map(([name, value]) => <input type="hidden" name={name} value={value} key={name} />)}
    <div className="mb-5 flex justify-between text-xs text-[var(--color-stone)]"><span>{en ? "Your selling project" : "Votre projet de vente"}</span><span>{step + 1} / 4</span></div>
    <div role="progressbar" aria-label={en ? "Progress" : "Progression"} aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} className="mb-6 h-1 overflow-hidden rounded-full bg-[var(--color-cream)]"><div className="h-full bg-[var(--color-accent-deep)] transition-all" style={{width: `${(step + 1) * 25}%`}} /></div>
    <h2 className="font-serif text-3xl">{t("Parlons de votre bien.")}</h2>
    <p className="mt-2 text-sm leading-relaxed text-[var(--color-stone)]">{t("Quelques réponses pour préparer votre échange. Sans compte, sans document à fournir.")}</p>
    <h3 ref={question} tabIndex={-1} className="mt-6 text-lg font-medium outline-none">{(en ? ["What would you like to sell?", "Where is your property?", "Anything to add?", "One last step: your callback."] : ["Quel bien souhaitez-vous vendre ?", "Où se situe votre bien ?", "Un détail à nous partager ?", "Dernière étape : votre rappel."])[step]}</h3>
    <fieldset ref={fieldset} disabled={pending} className="seller-step mt-5 grid min-h-44 gap-4 disabled:opacity-70" data-step={step}>
      {step === 3 && <label className="text-sm font-medium">{t("Votre nom")} <span aria-hidden="true">*</span><input required maxLength={100} autoComplete="name" className="field mt-2 w-full" value={values.firstName} onChange={e => set("firstName", e.target.value)} /></label>}
      {step === 3 && <label className="text-sm font-medium">{t("Téléphone")} <span aria-hidden="true">*</span><input type="tel" required minLength={8} maxLength={40} autoComplete="tel" placeholder={en ? "+212… or +33…" : "+212… ou +33…"} className="field mt-2 w-full" value={values.phone} onChange={e => set("phone", e.target.value)} /></label>}
      {step === 3 && <label className="text-sm font-medium sm:col-span-2">E-mail <span className="font-normal text-[var(--color-stone)]">{t("— facultatif")}</span><input type="email" maxLength={254} autoComplete="email" className="field mt-2 w-full" value={values.email} onChange={e => set("email", e.target.value)} /></label>}
      {step === 0 && <div className="grid grid-cols-2 gap-2">{[["villa","Villa"],["appartement","Appartement"],["riad-renove","Riad rénové"],["riad-a-renover","Riad à rénover"],["terrain","Terrain"],["maison-hotes","Maison d’hôtes"],["programme-neuf","Programme neuf"],["autre","Autre"]].map(([v,label]) => <button type="button" key={v} aria-pressed={values.type === v} onClick={() => set("type",v)} className={`min-h-14 rounded-xl border p-3 text-left text-sm ${values.type === v ? "border-[var(--color-accent-deep)] bg-[var(--color-cream)]" : "border-[var(--color-border)]"}`}>{en ? englishTypes[v as PropertyType] ?? "Other" : label}</button>)}</div>}
      {step === 1 && <div className="grid gap-3">{["Marrakech","Essaouira","Autre"].map(v => <button type="button" key={v} aria-pressed={values.city === v} onClick={() => set("city",v)} className={`min-h-14 rounded-xl border p-4 text-left text-sm ${values.city === v ? "border-[var(--color-accent-deep)] bg-[var(--color-cream)]" : "border-[var(--color-border)]"}`}>{v === "Autre" ? t("Autre ville / alentours") : v}</button>)}</div>}
      {step === 2 && <details open className="sm:col-span-2"><summary className="cursor-pointer py-2 text-sm font-medium text-[var(--color-accent-deep)]">{t("Ajouter quelques précisions — facultatif")}</summary><div className="mt-3 grid gap-4"><label className="text-sm">{t("Quartier")}<input maxLength={150} className="field mt-2 w-full" value={values.neighborhood} onChange={e => set("neighborhood",e.target.value)} /></label><label className="text-sm">{t("Votre projet")}<textarea maxLength={3000} rows={3} placeholder={en ? "Area, timing, questions… You don’t need every detail." : "Surface, délai souhaité, questions… Pas besoin de tout connaître."} className="field mt-2 w-full" value={values.description} onChange={e=>set("description",e.target.value)} /></label></div></details>}
      {state.status === "error" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{en ? state.fieldErrors ? "Check your name, phone number and email (if provided)." : "Something went wrong. Please try again or call us." : state.message}</p>}
      {step === 3 && <button type="submit" disabled={pending} className="btn-gold w-full justify-center sm:col-span-2">{en ? pending ? "Sending…" : "Request a callback" : pending ? "Envoi en cours…" : "Demander mon rappel"}</button>}
    </fieldset>
    <div className="mt-5 flex gap-3">{step > 0 && <button type="button" disabled={pending} className="btn-outline" onClick={() => setStep(s => s - 1)}>{en ? "Back" : "Retour"}</button>}{step < 3 && <button type="button" className="btn-gold flex-1 justify-center !tracking-normal !normal-case whitespace-nowrap" onClick={next}>{step === 2 && !values.description && !values.neighborhood ? en ? "Skip this step →" : "Passer cette étape →" : en ? "Continue →" : "Continuer →"}</button>}</div>
    <p className="mt-4 text-xs leading-relaxed text-[var(--color-stone)]">{t("Cette demande ne signe aucun mandat et ne publie aucune annonce. Vos coordonnées servent à traiter votre projet.")} <Link href="/politique-confidentialite" className="underline underline-offset-2">{t("Confidentialité")}</Link>.</p>
  </form>;
}
