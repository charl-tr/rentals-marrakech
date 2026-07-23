"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Check, Phone, MessageCircle, Mail } from "lucide-react";
import { submitLead, type LeadActionState } from "@/lib/actions/leads";
import type { Advisor } from "@/data/properties";

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

const initialState: LeadActionState = { status: "idle" };

const PHONE = "+212660629444";
const WHATSAPP = "https://wa.me/212660629444";

export default function ContactForm({
  advisors,
  propertySlug,
  sourcePage,
  defaultProject,
  channel = "contact_form",
  title = "Décrivez-nous votre projet.",
  subtitle = "Nous vous répondons sous 24 heures ouvrées.",
}: ContactFormProps) {
  const [state, action] = useActionState(submitLead, initialState);

  if (state.status === "success") {
    const advisor =
      advisors.find((a) => a.slug === state.advisorSlug) ?? advisors[0];
    return <SuccessPanel advisor={advisor} />;
  }

  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-10">
      <div className="eyebrow">Écrivez-nous</div>
      <h2 className="mt-4 font-serif text-3xl">{title}</h2>
      <p className="mt-3 text-sm text-[var(--color-stone)]">{subtitle}</p>

      {/* Contact immédiat — sans passer par le formulaire */}
      <div className="mt-6 flex flex-col gap-3 rounded-[12px] border border-[var(--color-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
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

      {state.status === "error" && !state.fieldErrors && (
        <div className="mt-6 rounded-[10px] border-l-2 border-[var(--color-accent)] bg-white px-4 py-3 text-sm text-[var(--color-charcoal)]">
          {state.message}
        </div>
      )}

      <form action={action} className="mt-10 space-y-6">
        <input type="hidden" name="channel" value={channel} />
        {propertySlug && (
          <input type="hidden" name="propertySlug" value={propertySlug} />
        )}
        {sourcePage && (
          <input type="hidden" name="sourcePage" value={sourcePage} />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Prénom" required error={errors.firstName?.[0]}>
            <input type="text" name="firstName" className="field" required />
          </Field>
          <Field label="Nom" required error={errors.lastName?.[0]}>
            <input type="text" name="lastName" className="field" required />
          </Field>
        </div>

        <Field label="E-mail" required error={errors.email?.[0]}>
          <input type="email" name="email" className="field" required />
        </Field>

        <Field label="Téléphone" error={errors.phone?.[0]}>
          <input
            type="tel"
            name="phone"
            className="field"
            placeholder="+33 ou +212"
          />
        </Field>

        <Field label="Votre projet (facultatif)" error={errors.project?.[0]}>
          <select
            name="project"
            className="field"
            defaultValue={defaultProject ?? ""}
          >
            <option value="">— Je préfère en parler de vive voix —</option>
            {PROJECT_OPTIONS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Votre message" error={errors.message?.[0]}>
          <textarea name="message" rows={5} className="field resize-none" />
        </Field>

        <SubmitButton />

        <p className="text-[11px] text-[var(--color-stone)]">
          En envoyant ce formulaire, vous acceptez d&apos;être recontacté(e) par
          l&apos;équipe Marrakech Realty. Vos données ne sont jamais transmises
          à des tiers.
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-gold w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Envoi en cours…" : "Envoyer ma demande"}
    </button>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
        {required && <span className="text-[var(--color-accent)]"> *</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && (
        <div className="mt-1.5 text-[11px] text-[var(--color-accent-deep)]">
          {error}
        </div>
      )}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────
// État de succès — ce qu'on veut que le prospect ressente :
// "Je sais qui est mon interlocuteur, comment le joindre, et quand."

function SuccessPanel({ advisor }: { advisor: Advisor | undefined }) {
  if (!advisor) {
    return (
      <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-10">
        <div className="eyebrow">Message reçu</div>
        <h2 className="mt-4 font-serif text-3xl">Merci.</h2>
        <p className="mt-3 text-sm text-[var(--color-stone)]">
          Un conseiller vous recontacte sous 24 heures ouvrées.
        </p>
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
                <MessageCircle
                  size={14}
                  className="text-[var(--color-accent)]"
                />
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
    </div>
  );
}
