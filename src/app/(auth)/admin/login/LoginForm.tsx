"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Mail } from "lucide-react";
import { sendMagicLink, type LoginActionState } from "@/lib/actions/auth";

const initialState: LoginActionState = { status: "idle" };

export default function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(sendMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 border border-[var(--color-terracotta)]/40 bg-[var(--color-cream)] p-6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-[var(--color-terracotta)] text-white">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-serif text-lg text-[var(--color-charcoal)]">
              Lien envoyé.
            </div>
            <div className="mt-1 text-sm text-[var(--color-stone)]">
              Vérifiez <span className="text-[var(--color-charcoal)]">{state.email}</span>.
              Cliquez sur le lien dans l&apos;email pour vous connecter.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
          Email professionnel
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="vous@marrakechrealty.com"
          className="mt-2 w-full border border-[var(--color-beige-warm)] bg-white px-4 py-3 text-sm text-[var(--color-charcoal)] focus:border-[var(--color-terracotta)] focus:outline-none"
        />
      </label>

      {state.status === "error" && (
        <div className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-charcoal)]">
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
      className="btn-gold w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Mail size={14} />
      {pending ? "Envoi du lien…" : "Recevoir le lien de connexion"}
    </button>
  );
}
