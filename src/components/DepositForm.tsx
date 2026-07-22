"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  submitDepositLead,
  type DepositLeadState,
} from "@/lib/actions/deposit-lead";

const inputCls =
  "w-full border border-[var(--color-beige-warm)] bg-white px-4 py-3 text-sm text-[var(--color-charcoal)] focus:border-[var(--color-terracotta)] focus:outline-none";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
        {required && <span className="text-[var(--color-terracotta)]"> *</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && error.length > 0 && (
        <p className="mt-1 text-xs text-[var(--color-alert)]">{error[0]}</p>
      )}
    </label>
  );
}

export default function DepositForm() {
  const [state, formAction, isPending] = useActionState<
    DepositLeadState,
    FormData
  >(submitDepositLead, { status: "idle" });

  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className="border border-[var(--color-beige-warm)] bg-white p-10 text-center">
        <CheckCircle2
          size={32}
          className="mx-auto text-[var(--color-success)]"
        />
        <h3 className="mt-4 font-serif text-2xl text-[var(--color-charcoal)]">
          Demande envoyée.
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--color-stone)]">
          Un conseiller senior vous contactera dans les prochaines heures pour
          organiser une visite et préparer votre estimation. Merci de votre
          confiance.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 border border-[var(--color-beige-warm)] bg-white p-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Prénom" required error={errors?.firstName}>
          <input name="firstName" className={inputCls} required />
        </Field>
        <Field label="Nom" required error={errors?.lastName}>
          <input name="lastName" className={inputCls} required />
        </Field>
        <Field label="E-mail" required error={errors?.email}>
          <input type="email" name="email" className={inputCls} required />
        </Field>
        <Field label="Téléphone" required error={errors?.phone}>
          <input type="tel" name="phone" className={inputCls} required />
        </Field>
      </div>

      <Field label="Type de bien" required error={errors?.type}>
        <select name="type" className={inputCls} required defaultValue="">
          <option value="" disabled>Choisir…</option>
          <option value="riad-renove">Riad rénové</option>
          <option value="riad-a-renover">Riad à rénover</option>
          <option value="villa">Villa</option>
          <option value="appartement">Appartement</option>
          <option value="maison-hotes">Maison d&apos;hôtes en activité</option>
          <option value="terrain">Terrain</option>
          <option value="programme-neuf">Programme neuf</option>
        </select>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Ville" required error={errors?.city}>
          <select name="city" className={inputCls} required defaultValue="">
            <option value="" disabled>Choisir…</option>
            <option value="Marrakech">Marrakech</option>
            <option value="Essaouira">Essaouira</option>
            <option value="Autre">Autre</option>
          </select>
        </Field>
        <Field label="Quartier ou route">
          <input name="neighborhood" className={inputCls} placeholder="Palmeraie, Médina, Diabat…" />
        </Field>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Field label="Surface habitable (m²)">
          <input type="number" name="surface" className={inputCls} />
        </Field>
        <Field label="Surface terrain (m²)">
          <input type="number" name="landSurface" className={inputCls} />
        </Field>
        <Field label="Chambres">
          <input type="number" name="bedrooms" className={inputCls} />
        </Field>
      </div>

      <Field label="Particularités du bien">
        <textarea
          name="description"
          rows={4}
          className={`${inputCls} resize-none`}
          placeholder="Restauration récente, vue exceptionnelle, dépendances, dossier juridique en règle…"
        />
      </Field>

      <Field label="Calendrier de vente envisagé">
        <select name="timeline" className={inputCls} defaultValue="">
          <option value="">Pas pressé</option>
          <option value="3-mois">Sous 3 mois</option>
          <option value="6-mois">Sous 6 mois</option>
          <option value="annee">Cette année</option>
        </select>
      </Field>

      {state.status === "error" && (
        <p className="text-sm text-[var(--color-alert)]">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-gold w-full justify-center"
      >
        {isPending ? "Envoi en cours…" : "Demander une estimation gratuite"}
        {!isPending && <ArrowRight size={14} />}
      </button>
      <p className="text-[11px] text-[var(--color-stone)]">
        Vos informations restent strictement confidentielles. Aucun partage avec
        des tiers, aucun acquéreur ne sera contacté sans votre accord express.
      </p>
    </form>
  );
}
