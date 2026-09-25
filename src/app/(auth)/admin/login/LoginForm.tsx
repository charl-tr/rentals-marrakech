"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check, Mail, RotateCcw } from "lucide-react";
import { sendMagicLink, type LoginActionState } from "@/lib/actions/auth";

const initialState: LoginActionState = { status: "idle" };

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${"•".repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

export default function LoginForm({ next }: { next: string }) {
  const [attempt, setAttempt] = useState(0);

  return (
    <LoginAttempt
      key={attempt}
      next={next}
      onReset={() => setAttempt((value) => value + 1)}
    />
  );
}

function LoginAttempt({
  next,
  onReset,
}: {
  next: string;
  onReset: () => void;
}) {
  const [state, action] = useActionState(sendMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <div className="mt-8" role="status" aria-live="polite">
        <div className="rounded-[14px] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
              <Check size={18} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div>
              <div className="font-serif text-xl text-[var(--color-charcoal)]">
                Vérifiez votre boîte mail.
              </div>
              <p className="mt-1.5 text-sm leading-6 text-[var(--color-stone)]">
                Le lien sécurisé a été envoyé à{" "}
                <span className="font-medium text-[var(--color-charcoal)]">
                  {maskEmail(state.email)}
                </span>
                . Il peut mettre quelques instants à arriver.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--color-success)]/15 pt-4 text-xs leading-5 text-[var(--color-stone)]">
            Pensez à vérifier les courriers indésirables. Le lien est à usage
            unique : ouvrez-le dans le navigateur où vous souhaitez travailler.
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <form action={action} className="flex-1">
            <input type="hidden" name="email" value={state.email} />
            <input type="hidden" name="next" value={next} />
            <ResendButton />
          </form>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[10px] px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-stone)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-charcoal)]"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Changer d&apos;adresse
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="admin-email" className="block">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          Adresse professionnelle
        </span>
        <div className="relative mt-2">
          <Mail
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-stone-soft)]"
            aria-hidden="true"
          />
          <input
            id="admin-email"
            type="email"
            name="email"
            required
            autoFocus
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            aria-describedby="admin-email-help"
            placeholder="vous@agence.com"
            className="field min-h-13 pl-11"
          />
        </div>
        <span
          id="admin-email-help"
          className="mt-2 block text-xs leading-5 text-[var(--color-stone)]"
        >
          Utilisez l&apos;adresse enregistrée dans votre profil équipe.
        </span>
      </label>

      {state.status === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-[10px] border-l-2 border-[var(--color-alert)] bg-[var(--color-alert-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-charcoal)]"
        >
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-gold min-h-13 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Envoi en cours…" : "Recevoir mon lien d'accès"}
      {!pending && <ArrowRight size={15} aria-hidden="true" />}
    </button>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Mail size={14} aria-hidden="true" />
      {pending ? "Renvoi…" : "Renvoyer le lien"}
    </button>
  );
}
