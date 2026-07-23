"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Check, Mail, RefreshCw, X } from "lucide-react";
import {
  submitFavoritesLead,
  updateSavedSelection,
  type FavoritesLeadState,
} from "@/lib/actions/favorites-lead";
import {
  getSelectionLink,
  sameSelection,
  setSelectionLink,
  type SelectionLink,
} from "@/lib/selection-link";
import EmailField from "@/components/EmailField";

const DISMISS_KEY_PREFIX = "mr:save-selection-dismissed:";

// ════════════════════════════════════════════════════════════════════
// SaveSelectionBanner — capture email + CONTINUITÉ.
//
// Le navigateur garde une mémoire locale (selection-link) du fait qu'il est
// déjà "lié" à une sélection sauvegardée. Trois états :
//   1. Pas encore lié        → formulaire "recevez votre sélection par email".
//   2. Lié & à jour          → reconnaissance calme ("✓ enregistrée · email"),
//                              plus aucune re-proposition (fini la boucle).
//   3. Lié & sélection changée → "Mettre à jour" : met à jour LE MÊME
//                              enregistrement (pas de nouveau lead, pas de doublon).
// ════════════════════════════════════════════════════════════════════
export default function SaveSelectionBanner({
  kind,
  slugs,
}: {
  kind: "favoris" | "comparateur";
  slugs: string[];
}) {
  const [checked, setChecked] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [hidden, setHidden] = useState(false); // masquage transitoire (états liés)
  const [link, setLink] = useState<SelectionLink | null>(null);
  const [email, setEmail] = useState("");
  const [updated, setUpdated] = useState(false);

  const [state, action, isPending] = useActionState<FavoritesLeadState, FormData>(
    submitFavoritesLead,
    { status: "idle" }
  );
  const [isUpdating, startUpdate] = useTransition();

  // Montée : lire le flag "dismiss" + le lien existant sur ce navigateur
  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY_PREFIX + kind) === "1");
    setLink(getSelectionLink(kind));
    setChecked(true);
  }, [kind]);

  // Première sauvegarde réussie → on LIE ce navigateur à la sélection.
  useEffect(() => {
    if (state.status === "success") {
      const newLink: SelectionLink = {
        token: state.token,
        email: email.trim(),
        savedSlugs: slugs,
      };
      setSelectionLink(kind, newLink);
      setLink(newLink);
    }
    // On ne réagit qu'à la transition d'état de l'action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const dismissForever = () => {
    window.localStorage.setItem(DISMISS_KEY_PREFIX + kind, "1");
    setDismissed(true);
  };

  const handleUpdate = () => {
    if (!link) return;
    startUpdate(async () => {
      const res = await updateSavedSelection(link.token, slugs);
      if (res.ok) {
        const newLink: SelectionLink = { ...link, savedSlugs: slugs };
        setSelectionLink(kind, newLink);
        setLink(newLink);
        setUpdated(true);
      }
    });
  };

  if (!checked || hidden) return null;

  // ── État 1b : sauvegarde à l'instant réussie (message "email envoyé") ──
  if (state.status === "success") {
    return (
      <div className="mb-8 flex items-start gap-3 rounded-[14px] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] px-5 py-4">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Check size={15} strokeWidth={2.5} />
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-charcoal)]">
          <span className="font-medium">Sélection sauvegardée.</span> On vient de
          vous envoyer un lien par email pour la retrouver sur tous vos appareils —
          et un conseiller peut vous la recontextualiser si besoin.
        </p>
      </div>
    );
  }

  // ── État 2 & 3 : navigateur DÉJÀ lié ─────────────────────────────────
  if (link) {
    if (slugs.length === 0) return null;
    const upToDate = updated || sameSelection(slugs, link.savedSlugs);

    if (upToDate) {
      return (
        <div className="mb-8 flex items-center gap-3 rounded-[14px] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] px-5 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
            <Check size={15} strokeWidth={2.5} />
          </div>
          <p className="flex-1 text-sm text-[var(--color-charcoal)]">
            <span className="font-medium">Sélection enregistrée</span>
            {link.email ? ` · ${link.email}` : ""}. Vous la retrouvez sur tous vos
            appareils.
          </p>
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Masquer"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[var(--color-stone)] transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    // Lié mais la sélection a changé → mise à jour du même enregistrement
    return (
      <div className="mb-8 flex flex-col gap-3 rounded-[14px] border-l-2 border-[var(--color-accent)] bg-[var(--color-bg-alt)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <RefreshCw
            size={16}
            className="mt-0.5 flex-shrink-0 text-[var(--color-accent)]"
          />
          <p className="text-sm text-[var(--color-charcoal)]">
            <span className="font-medium">Vous avez modifié votre sélection.</span>{" "}
            Mettez à jour l&apos;enregistrement
            {link.email ? ` lié à ${link.email}` : ""}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isUpdating}
          className="btn-gold flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUpdating ? "Mise à jour…" : "Mettre à jour"}
          {!isUpdating && <RefreshCw size={14} />}
        </button>
      </div>
    );
  }

  // ── État 1 : pas encore lié — formulaire de première capture ─────────
  if (dismissed || slugs.length < 2) return null;

  return (
    <div className="relative mb-8 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5">
      <button
        type="button"
        onClick={dismissForever}
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
            Retrouvez-la sur tous vos appareils, et laissez un conseiller vous la
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
