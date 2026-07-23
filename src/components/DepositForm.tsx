"use client";

import { useActionState, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import {
  submitDepositLead,
  type DepositLeadState,
} from "@/lib/actions/deposit-lead";

const PHONE = "+212660629444";
const PHONE_DISPLAY = "+212 660 62 94 44";
const WHATSAPP = "https://wa.me/212660629444";

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
        {required && <span className="text-[var(--color-accent)]">*</span>}
        {hint && (
          <span className="tracking-normal normal-case text-[var(--color-ink-hint)]">
            {hint}
          </span>
        )}
      </span>
      <div className="mt-2">{children}</div>
      {error && error.length > 0 && (
        <p className="mt-1 text-xs text-[var(--color-accent-deep)]">{error[0]}</p>
      )}
    </label>
  );
}

export default function DepositForm() {
  const [state, formAction, isPending] = useActionState<
    DepositLeadState,
    FormData
  >(submitDepositLead, { status: "idle" });
  const [showDetails, setShowDetails] = useState(false);

  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Check size={22} strokeWidth={2.5} />
        </div>
        <h3 className="mt-6 font-serif text-2xl text-[var(--color-charcoal)]">
          C&apos;est noté. On vous rappelle.
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--color-stone)]">
          Un conseiller senior, référent de votre secteur, vous rappelle sous
          24 heures ouvrées pour organiser la visite et préparer votre
          estimation.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:justify-center">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[var(--color-success)] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
          <a
            href={`tel:${PHONE}`}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--color-charcoal)] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
          >
            <Phone size={14} />
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rappel immédiat — sans passer par le formulaire */}
      <div className="flex flex-col gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-charcoal)]">
          <span className="font-medium">Pressé·e ?</span> Écrivez-nous, on
          s&apos;occupe du reste.
        </p>
        <div className="flex gap-2">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-success)] px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
          <a
            href={`tel:${PHONE}`}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--color-charcoal)] px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
          >
            <Phone size={14} />
            Appeler
          </a>
        </div>
      </div>

      <form
        action={formAction}
        className="rounded-[16px] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-card)] md:p-10"
      >
        <div>
          <h3 className="font-serif text-2xl text-[var(--color-charcoal)]">
            Être rappelé·e sous 24h.
          </h3>
          <p className="mt-2 text-sm text-[var(--color-stone)]">
            Vos coordonnées suffisent pour démarrer — un conseiller vous rappelle
            dans la journée.
          </p>
        </div>

        {/* ── Essentiel ─────────────────────────────────────────── */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Field label="Prénom" required error={errors?.firstName}>
            <input name="firstName" className="field" autoComplete="given-name" required />
          </Field>
          <Field label="Nom" required error={errors?.lastName}>
            <input name="lastName" className="field" autoComplete="family-name" required />
          </Field>
          <Field label="Téléphone" required error={errors?.phone}>
            <input
              type="tel"
              name="phone"
              className="field"
              autoComplete="tel"
              placeholder="+33 ou +212"
              required
            />
          </Field>
          <Field label="E-mail" required error={errors?.email}>
            <input type="email" name="email" className="field" autoComplete="email" required />
          </Field>
        </div>

        {/* ── Détails du bien — dépliant fluide, facultatif ──────── */}
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="mt-6 flex w-full items-center justify-between rounded-[10px] border border-dashed border-[var(--color-border-strong)] px-4 py-3 text-left text-[13px] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-charcoal)]"
        >
          <span>
            Ajouter des détails sur le bien{" "}
            <span className="text-[var(--color-stone)]">
              — facultatif, ça accélère l&apos;estimation
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 text-[var(--color-stone)] transition-transform duration-300 ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-500 ease-out ${
            showDetails
              ? "mt-6 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-6">
              <Field label="Type de bien" hint="(facultatif)">
                <select name="type" className="field" defaultValue="">
                  <option value="">— Indifférent —</option>
                  <option value="riad-renove">Riad rénové</option>
                  <option value="riad-a-renover">Riad à rénover</option>
                  <option value="villa">Villa</option>
                  <option value="appartement">Appartement</option>
                  <option value="maison-hotes">
                    Maison d&apos;hôtes en activité
                  </option>
                  <option value="terrain">Terrain</option>
                  <option value="programme-neuf">Programme neuf</option>
                </select>
              </Field>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Ville" hint="(facultatif)">
                  <select name="city" className="field" defaultValue="">
                    <option value="">— Indifférent —</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Essaouira">Essaouira</option>
                    <option value="Autre">Autre</option>
                  </select>
                </Field>
                <Field label="Quartier ou route" hint="(facultatif)">
                  <input
                    name="neighborhood"
                    className="field"
                    placeholder="Palmeraie, Médina, Diabat…"
                  />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Field label="Surface (m²)" hint="(facultatif)">
                  <input type="number" name="surface" className="field" />
                </Field>
                <Field label="Terrain (m²)" hint="(facultatif)">
                  <input type="number" name="landSurface" className="field" />
                </Field>
                <Field label="Chambres" hint="(facultatif)">
                  <input type="number" name="bedrooms" className="field" />
                </Field>
              </div>

              <Field label="Particularités" hint="(facultatif)">
                <textarea
                  name="description"
                  rows={3}
                  className="field resize-none"
                  placeholder="Restauration récente, vue exceptionnelle, dossier juridique en règle…"
                />
              </Field>

              <Field label="Calendrier envisagé" hint="(facultatif)">
                <select name="timeline" className="field" defaultValue="">
                  <option value="">Pas pressé·e</option>
                  <option value="3-mois">Sous 3 mois</option>
                  <option value="6-mois">Sous 6 mois</option>
                  <option value="annee">Cette année</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {state.status === "error" && (
          <p className="mt-6 rounded-[10px] border-l-2 border-[var(--color-accent)] bg-[var(--color-bg-alt)] px-4 py-2.5 text-sm text-[var(--color-charcoal)]">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-gold mt-8 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Envoi…" : "Être rappelé·e"}
          {!isPending && <ArrowRight size={14} />}
        </button>

        <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[var(--color-stone)]">
          <ShieldCheck size={13} className="text-[var(--color-stone)]" />
          Confidentiel. Aucun partage, aucun acquéreur contacté sans votre accord.
        </p>
      </form>
    </div>
  );
}
