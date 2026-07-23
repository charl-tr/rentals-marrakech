"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { submitLead, type LeadActionState } from "@/lib/actions/leads";
import type { Advisor } from "@/data/properties";
import {
  clearSentRecord,
  getSentRecord,
  setSentRecord,
  type SentRecord,
} from "@/lib/form-memory";
import PhoneField from "@/components/PhoneField";
import EmailField from "@/components/EmailField";

interface ContactFormProps {
  advisors: Advisor[];
  propertySlug?: string;
  sourcePage?: string;
  defaultProject?: string;
  channel?: "contact_form" | "property_form";
  title?: string;
  subtitle?: string;
}

const PROJECT_OPTIONS = [
  "Acheter un riad",
  "Acheter une villa",
  "Acheter un appartement",
  "Programme neuf",
  "Louer (longue durée)",
  "Louer (saisonnier)",
  "Vendre — estimation",
  "Gestion locative",
  "Autre",
];

const PHONE = "+212660629444";
const WHATSAPP = "https://wa.me/212660629444";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState: LeadActionState = { status: "idle" };

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  project: string;
  message: string;
};

export default function ContactForm({
  advisors,
  propertySlug,
  sourcePage,
  defaultProject,
  channel = "contact_form",
}: ContactFormProps) {
  const [state, action, isPending] = useActionState(submitLead, initialState);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    project: defaultProject ?? "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Mémoire locale : "cette demande a déjà été envoyée depuis ce navigateur".
  // Clé par contexte (bien précis, ou formulaire générique) → au refresh on
  // reconnaît l'envoi au lieu de réafficher un formulaire vierge.
  const contextId = `${channel}:${propertySlug ?? "generic"}`;
  const [mounted, setMounted] = useState(false);
  const [memory, setMemory] = useState<SentRecord | null>(null);
  const [forceForm, setForceForm] = useState(false);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    setMemory(getSentRecord(contextId));
    setMounted(true);
  }, [contextId]);

  // À la réussite : on grave la trace (avec le conseiller assigné).
  useEffect(() => {
    if (state.status === "success") {
      const rec: SentRecord = {
        sentAt: Date.now(),
        advisorSlug: state.advisorSlug,
      };
      setSentRecord(contextId, rec);
      setMemory(rec);
      setForceForm(false);
    }
    // On ne réagit qu'à la transition de l'action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleReopen = () => {
    clearSentRecord(contextId);
    setMemory(null);
    setForceForm(true);
    setStep(0);
    setValues({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      project: defaultProject ?? "",
      message: "",
    });
    setError(null);
  };

  // "Déjà envoyé" : soit à l'instant, soit mémorisé d'une visite précédente.
  // Réouvrable explicitement via "Envoyer un autre message".
  const advisorSlug =
    state.status === "success" ? state.advisorSlug : memory?.advisorSlug ?? null;
  const showSuccess =
    !forceForm && (state.status === "success" || (mounted && memory !== null));
  if (showSuccess) {
    const advisor = advisors.find((a) => a.slug === advisorSlug) ?? advisors[0];
    return <SuccessPanel advisor={advisor} onReopen={handleReopen} />;
  }

  const set = (patch: Partial<Values>) => {
    setValues((v) => ({ ...v, ...patch }));
    setError(null);
  };

  const STEPS = [
    {
      key: "name",
      question: "Comment vous appelez-vous ?",
      hint: "Pour savoir qui vous répond.",
      valid: () =>
        values.firstName.trim() !== "" && values.lastName.trim() !== "",
      invalidMsg: "Indiquez votre prénom et votre nom.",
    },
    {
      key: "contact",
      question: "Comment vous joindre ?",
      hint: "Réponse sous 24 heures ouvrées.",
      valid: () => EMAIL_RE.test(values.email.trim()),
      invalidMsg: "Indiquez une adresse e-mail valide.",
    },
    {
      key: "message",
      question: "Dites-nous en plus.",
      hint: "Votre projet en quelques mots — ou rien, on en parlera.",
      valid: () => true,
      invalidMsg: "",
    },
  ] as const;

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

  return (
    <div className="space-y-4">
      {/* Contact immédiat */}
      <div className="flex flex-col gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-charcoal)]">
          <span className="font-medium">Plus rapide&nbsp;?</span> Écrivez-nous
          directement.
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
        action={action}
        className="rounded-[16px] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-card)] md:p-10"
      >
        <input type="hidden" name="channel" value={channel} />
        {propertySlug && (
          <input type="hidden" name="propertySlug" value={propertySlug} />
        )}
        {sourcePage && (
          <input type="hidden" name="sourcePage" value={sourcePage} />
        )}
        {/* Valeurs complètes portées en caché → FormData toujours complet */}
        <input type="hidden" name="firstName" value={values.firstName} />
        <input type="hidden" name="lastName" value={values.lastName} />
        <input type="hidden" name="email" value={values.email} />
        <input type="hidden" name="phone" value={values.phone} />
        <input type="hidden" name="project" value={values.project} />
        <input type="hidden" name="message" value={values.message} />

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--color-stone)]">
            Étape {step + 1} sur {total}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Réponse sous 24h
          </span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        <div key={step} className="mt-8 animate-scale-in">
          <h3 className="font-serif text-2xl leading-tight text-[var(--color-charcoal)]">
            {current.question}
          </h3>
          <p className="mt-1.5 text-sm text-[var(--color-stone)]">{current.hint}</p>

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

            {current.key === "contact" && (
              <div className="space-y-4">
                <EmailField
                  ref={firstInputRef}
                  value={values.email}
                  onChange={(v) => set({ email: v })}
                  onKeyDown={onKeyDown}
                  placeholder="E-mail *"
                />
                <PhoneField
                  value={values.phone}
                  onChange={(v) => set({ phone: v })}
                  onKeyDown={onKeyDown}
                  placeholder="Téléphone (facultatif)"
                />
              </div>
            )}

            {current.key === "message" && (
              <div className="space-y-4">
                <select
                  className="field"
                  value={values.project}
                  onChange={(e) => set({ project: e.target.value })}
                >
                  <option value="">— Votre projet (facultatif) —</option>
                  {PROJECT_OPTIONS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <textarea
                  rows={4}
                  className="field resize-none"
                  placeholder="Votre message (facultatif)…"
                  value={values.message}
                  onChange={(e) => set({ message: e.target.value })}
                />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-xs text-[var(--color-accent-deep)]">{error}</p>
          )}
          {state.status === "error" && !state.fieldErrors && (
            <p className="mt-3 rounded-[10px] border-l-2 border-[var(--color-accent)] bg-[var(--color-bg-alt)] px-4 py-2.5 text-sm text-[var(--color-charcoal)]">
              {state.message}
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={goBack} className="btn-back">
              <ArrowLeft size={12} />
              Retour
            </button>
          )}
          {/* Un seul bouton, toujours type="submit" — le comportement (avancer
              ou envoyer) est décidé en JS via preventDefault(), jamais en
              changeant l'attribut type d'un bouton déjà ciblé par le clic
              (ce changement d'attribut in-place pouvait déclencher une
              soumission native fantôme du formulaire). */}
          <button
            type="submit"
            disabled={isLast && isPending}
            onClick={(e) => {
              if (!isLast) {
                e.preventDefault();
                goNext();
              }
            }}
            className="btn-gold ml-auto disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLast ? (isPending ? "Envoi…" : "Envoyer") : "Continuer"}
            {!(isLast && isPending) && <ArrowRight size={14} />}
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-[var(--color-stone)]">
          Vos données ne sont jamais transmises à des tiers.
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// État de succès — "Je sais qui est mon interlocuteur, comment le joindre."

function SuccessPanel({
  advisor,
  onReopen,
}: {
  advisor: Advisor | undefined;
  onReopen?: () => void;
}) {
  if (!advisor) {
    return (
      <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-10">
        <div className="eyebrow">Message reçu</div>
        <h2 className="mt-4 font-serif text-3xl">Merci.</h2>
        <p className="mt-3 text-sm text-[var(--color-stone)]">
          Un conseiller vous recontacte sous 24 heures ouvrées.
        </p>
        {onReopen && <ReopenLink onReopen={onReopen} />}
      </div>
    );
  }

  const initials = advisor.name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-10">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
          <Check size={16} strokeWidth={2.5} />
        </div>
        <div className="eyebrow">Message reçu</div>
      </div>

      <h2 className="mt-6 font-serif text-3xl leading-tight">
        Merci. Votre demande<br />est entre de bonnes mains.
      </h2>

      <p className="mt-4 text-sm text-[var(--color-stone)]">
        {advisor.name.split(" ")[0]}, {advisor.role.toLowerCase()}, est votre
        interlocuteur. Elle·il vous rappelle sous 24 heures ouvrées.
      </p>

      <div className="mt-10 flex items-start gap-5 border-t border-[var(--color-border)] pt-8">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-beige)]">
          {advisor.photo ? (
            <Image
              src={advisor.photo}
              alt={advisor.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-[var(--color-charcoal)]">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-serif text-xl text-[var(--color-charcoal)]">
            {advisor.name}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
            {advisor.role.split("—")[1]?.trim() ?? advisor.role}
          </div>

          <div className="mt-5 space-y-2 text-sm">
            {advisor.phone && (
              <a
                href={`tel:${advisor.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)]"
              >
                <Phone size={14} className="text-[var(--color-accent)]" />
                {advisor.phone}
              </a>
            )}
            {advisor.whatsapp && (
              <a
                href={`https://wa.me/${advisor.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)]"
              >
                <MessageCircle size={14} className="text-[var(--color-accent)]" />
                WhatsApp direct
              </a>
            )}
            {advisor.email && (
              <a
                href={`mailto:${advisor.email}`}
                className="flex items-center gap-2.5 text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)]"
              >
                <Mail size={14} className="text-[var(--color-accent)]" />
                {advisor.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {onReopen && <ReopenLink onReopen={onReopen} />}
    </div>
  );
}

// Réouverture explicite — envoyer une AUTRE demande (efface la mémoire locale
// de ce contexte et réaffiche un formulaire vierge). Empêche la re-soumission
// accidentelle sans jamais bloquer une relance volontaire.
function ReopenLink({ onReopen }: { onReopen: () => void }) {
  return (
    <div className="mt-8 border-t border-[var(--color-border)] pt-6">
      <button
        type="button"
        onClick={onReopen}
        className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-stone)] underline-offset-4 transition-colors hover:text-[var(--color-accent)] hover:underline"
      >
        Envoyer un autre message
      </button>
    </div>
  );
}
