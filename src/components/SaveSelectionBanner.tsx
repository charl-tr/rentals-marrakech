"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Mail, X } from "lucide-react";
import {
  submitFavoritesLead,
  type FavoritesLeadState,
} from "@/lib/actions/favorites-lead";
import EmailField from "@/components/EmailField";

const DISMISS_KEY_PREFIX = "mr:save-selection-dismissed:";

// Bannière discrète — proposée après le 2e bien ajouté (favoris ou
// comparateur), jamais bloquante, ne réapparaît plus une fois fermée.
// Ne demande que l'email : le lead est capturé pour l'agence, aucun
// compte à créer.
export default function SaveSelectionBanner({
  kind,
  slugs,
}: {
  kind: "favoris" | "comparateur";
  slugs: string[];
}) {
  const [dismissed, setDismissed] = useState(true);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [state, action, isPending] = useActionState<
    FavoritesLeadState,
    FormData
  >(submitFavoritesLead, { status: "idle" });

  useEffect(() => {
    const key = DISMISS_KEY_PREFIX + kind;
    setDismissed(window.localStorage.getItem(key) === "1");
    setChecked(true);
  }, [kind]);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY_PREFIX + kind, "1");
    setDismissed(true);
  };

  if (!checked || dismissed || slugs.length < 2) return null;

  if (state.status === "success") {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-[14px] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] px-5 py-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Check size={15} strokeWidth={2.5} />
        </div>
        <p className="text-sm text-[var(--color-charcoal)]">
          C&apos;est noté — un conseiller pourra vous recontacter avec cette sélection.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mb-8 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-stone)] transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
      >
        <X size={14} />
      </button>

      <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-charcoal)]">
            <Mail size={15} className="text-[var(--color-accent)]" />
            Recevez votre sélection par email.
          </div>
          <p className="mt-1 text-xs text-[var(--color-stone)]">
            Retrouvez-la plus tard, et laissez un conseiller vous la
            recontextualiser si besoin.
          </p>
        </div>

        <form
          action={action}
          className="flex flex-shrink-0 flex-col gap-2 sm:flex-row"
        >
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="slugs" value={JSON.stringify(slugs)} />
          <input type="hidden" name="email" value={email} />
          <div className="w-full sm:w-56">
            <EmailField
              value={email}
              onChange={setEmail}
              placeholder="vous@exemple.com"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="btn-gold flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "…" : "Recevoir"}
          </button>
        </form>
      </div>

      {state.status === "error" && (
        <p className="mt-2 text-xs text-[var(--color-accent-deep)]">{state.message}</p>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-stone)]">
        En renseignant votre email, vous acceptez d&apos;être recontacté(e) par
        l&apos;équipe Marrakech Realty au sujet de cette sélection. Vos données ne
        sont jamais transmises à des tiers.
      </p>
    </div>
  );
}
