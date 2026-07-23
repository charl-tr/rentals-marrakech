"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Values = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export default function DepositForm() {
  const [state, formAction, isPending] = useActionState<
    DepositLeadState,
    FormData
  >(submitDepositLead, { status: "idle" });

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus le premier champ à chaque changement d'étape
  useEffect(() => {
    firstInputRef.current?.focus();
  }, [step]);

  const set = (patch: Partial<Values>) => {
    setValues((v) => ({ ...v, ...patch }));
    setError(null);
  };

  // ── Définition des étapes ─────────────────────────────────────────
  const STEPS = [
    {
      key: "name",
      question: "Comment vous appelez-vous ?",
      hint: "Pour savoir qui rappeler.",
      valid: () => values.firstName.trim() !== "" && values.lastName.trim() !== "",
      invalidMsg: "Indiquez votre prénom et votre nom.",
    },
    {
      key: "phone",
      question: "Votre numéro de téléphone ?",
      hint: "Un conseiller vous rappelle dans la journée.",
      valid: () => values.phone.trim().length >= 6,
      invalidMsg: "Indiquez un numéro valide.",
    },
    {
      key: "email",
      question: "Et votre e-mail ?",
      hint: "Pour vous envoyer l'estimation écrite.",
      valid: () => EMAIL_RE.test(values.email.trim()),
      invalidMsg: "Indiquez une adresse e-mail valide.",
    },
  ];

  const total = STEPS.length;
  const current = STEPS[step];
  const isLast = step === total - 1;

  const goNext = () => {
    if (!current.valid()) {
      setError(current.invalidMsg);
      return;
    }
    setError(null);
    setStep((s) => Math.min(total - 1, s + 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  // Entrée = avancer. On bloque TOUJOURS la soumission native par Entrée :
  // sur la dernière étape, l'envoi exige un clic délibéré sur le bouton.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isLast) goNext();
    }
  };

  // ── Succès ────────────────────────────────────────────────────────
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
      {/* Contact immédiat — sans passer par le formulaire */}
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
        {/* Valeurs complètes portées en caché → FormData toujours complet */}
        <input type="hidden" name="firstName" value={values.firstName} />
        <input type="hidden" name="lastName" value={values.lastName} />
        <input type="hidden" name="phone" value={values.phone} />
        <input type="hidden" name="email" value={values.email} />

        {/* Progression */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--color-stone)]">
            Étape {step + 1} sur {total}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Rappel sous 24h
          </span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        {/* Étape courante — ré-animée à chaque changement */}
        <div key={step} className="mt-8 animate-scale-in">
          <h3 className="font-serif text-2xl leading-tight text-[var(--color-charcoal)]">
            {current.question}
          </h3>
          <p className="mt-1.5 text-sm text-[var(--color-stone)]">
            {current.hint}
          </p>

          <div className="mt-6">
            {current.key === "name" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  ref={firstInputRef}
                  className="field"
                  placeholder="Prénom"
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={(e) => set({ firstName: e.target.value })}
                  onKeyDown={onKeyDown}
                />
                <input
                  className="field"
                  placeholder="Nom"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={(e) => set({ lastName: e.target.value })}
                  onKeyDown={onKeyDown}
                />
              </div>
            )}
            {current.key === "phone" && (
              <input
                ref={firstInputRef}
                type="tel"
                className="field"
                placeholder="+33 ou +212…"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => set({ phone: e.target.value })}
                onKeyDown={onKeyDown}
              />
            )}
            {current.key === "email" && (
              <input
                ref={firstInputRef}
                type="email"
                className="field"
                placeholder="vous@exemple.com"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set({ email: e.target.value })}
                onKeyDown={onKeyDown}
              />
            )}
          </div>

          {error && (
            <p className="mt-3 text-xs text-[var(--color-accent-deep)]">{error}</p>
          )}
          {state.status === "error" && (
            <p className="mt-3 rounded-[10px] border-l-2 border-[var(--color-accent)] bg-[var(--color-bg-alt)] px-4 py-2.5 text-sm text-[var(--color-charcoal)]">
              {state.message}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={goBack} className="btn-back">
              <ArrowLeft size={12} />
              Retour
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              className="btn-gold ml-auto"
            >
              Continuer
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending || !current.valid()}
              className="btn-gold ml-auto disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Envoi…" : "Être rappelé·e"}
              {!isPending && <ArrowRight size={14} />}
            </button>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[var(--color-stone)]">
          <ShieldCheck size={13} className="text-[var(--color-stone)]" />
          Confidentiel. Aucun partage, aucun acquéreur contacté sans votre accord.
        </p>
      </form>
    </div>
  );
}
