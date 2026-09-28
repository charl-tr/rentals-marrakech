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
import FormGuard from "@/components/FormGuard";
import { toast } from "sonner";

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
  locale = "fr",
}: {
  kind: "favoris" | "comparateur";
  slugs: string[];
  locale?: "fr" | "en";
}) {
  const en = locale === "en";
  const [checked, setChecked] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [hidden, setHidden] = useState(false); // masquage transitoire (états liés)
  const [link, setLink] = useState<SelectionLink | null>(null);
  const [email, setEmail] = useState("");

  const [state, action, isPending] = useActionState<FavoritesLeadState, FormData>(
    submitFavoritesLead,
    { status: "idle" }
  );
  const [isUpdating, startUpdate] = useTransition();

  // Montée : lire le flag "dismiss" + le lien existant sur ce navigateur
  useEffect(() => {
    try {
      // Client-only storage hydration; server and first client render stay identical.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY_PREFIX + kind) === "1");
    } catch {
      setDismissed(false);
    }
    setLink(getSelectionLink(kind));
    setChecked(true);
  }, [kind]);

  // Première sauvegarde réussie → on LIE ce navigateur à la sélection.
  useEffect(() => {
    if (state.status === "success" && state.token) {
      const newLink: SelectionLink = {
        token: state.token,
        email: email.trim(),
        savedSlugs: slugs,
      };
      setSelectionLink(kind, newLink);
      // Synchronize the browser's linked selection after the server action succeeds.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLink(newLink);
    }
    // On ne réagit qu'à la transition d'état de l'action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const dismissForever = () => {
    try { window.sessionStorage.setItem(DISMISS_KEY_PREFIX + kind, "1"); } catch { /* Still dismiss for this visit. */ }
    setDismissed(true);
  };

  const handleUpdate = () => {
    if (!link) return;
    startUpdate(async () => {
      try {
        const res = await updateSavedSelection(link.token, slugs);
        if (!res.ok) throw new Error("selection-update-failed");
        const newLink: SelectionLink = { ...link, savedSlugs: [...slugs] };
        setSelectionLink(kind, newLink);
        setLink(newLink);
        toast.success(en ? "Selection updated." : "Sélection mise à jour.");
      } catch {
        toast.error(en ? "The update failed. Your saved properties are kept; please try again." : "La mise à jour a échoué. Vos favoris sont conservés ; réessayez.");
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
          <span className="font-medium">{en ? "Selection saved." : <>Sélection sauvegardée.</>}</span>{" "}
          {en ? state.emailSent ? "Your link was passed to the email service. Check your spam folder too." : "Email delivery was not confirmed. Your saved properties are still available here." : state.emailSent ? "L’email contenant votre lien a été transmis au service d’envoi. Vérifiez aussi vos indésirables." : "L’envoi de l’email n’a pas été confirmé. Vos favoris restent accessibles ici."}
          {state.token && <a href={`/ma-selection/${state.token}`} className="ml-2 underline underline-offset-4">{en ? "Open my saved selection (French)" : <>Ouvrir ma sélection sauvegardée</>}</a>}
        </p>
      </div>
    );
  }

  // ── État 2 & 3 : navigateur DÉJÀ lié ─────────────────────────────────
  if (link) {
    if (slugs.length === 0) return null;
    const upToDate = sameSelection(slugs, link.savedSlugs);

    if (upToDate) {
      return (
        <div className="mb-8 flex items-center gap-3 rounded-[14px] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] px-5 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
            <Check size={15} strokeWidth={2.5} />
          </div>
          <p className="flex-1 text-sm text-[var(--color-charcoal)]">
            <span className="font-medium">{en ? "Selection saved" : <>Sélection enregistrée</>}</span>
            {link.email ? ` · ${link.email}` : ""}. <a href={`/ma-selection/${link.token}`} className="underline underline-offset-4">{en ? "Open my selection link (French)" : <>Ouvrir le lien de ma sélection</>}</a>
          </p>
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label={en ? "Hide" : "Masquer"}
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
            <span className="font-medium">{en ? "Your selection has changed." : <>Vous avez modifié votre sélection.</>}</span>{" "}
            {en ? "Update the saved selection" : <>Mettez à jour l&apos;enregistrement</>}{link.email ? ` · ${link.email}` : ""}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isUpdating}
          className="btn-gold flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {en ? isUpdating ? "Updating…" : "Update" : isUpdating ? "Mise à jour…" : "Mettre à jour"}
          {!isUpdating && <RefreshCw size={14} />}
        </button>
      </div>
    );
  }

  // ── État 1 : pas encore lié — formulaire de première capture ─────────
  if (dismissed || slugs.length < 1) return null;

  return (
    <div className="relative mb-8 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5">
      <button
        type="button"
        onClick={dismissForever}
        aria-label={en ? "Close" : "Fermer"}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-stone)] transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
      >
        <X size={14} />
      </button>

      <details open={state.status === "error" ? true : undefined}>
        <summary className="cursor-pointer pr-8 text-sm font-medium text-[var(--color-charcoal)]">
          <span className="inline-flex items-center gap-2">
            <Mail size={15} className="text-[var(--color-accent)]" />
            {en ? "Get my selection by email" : <>Retrouver ma sélection par email</>}
          </span>
        </summary>
          <p className="mt-1 text-xs text-[var(--color-stone)]">
            {en ? "Keep the properties you like and access them from another device. No account needed. The selection email and private page are currently in French." : <>Gardez les biens qui vous plaisent et retrouvez-les sur un autre
            appareil. Aucun compte à créer.</>}
          </p>

        <form
          action={action}
          className="mt-4 flex flex-shrink-0 flex-col gap-2 sm:flex-row"
        >
          <FormGuard />
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="slugs" value={JSON.stringify(slugs)} />
          <input type="hidden" name="email" value={email} />
          <div className="w-full sm:w-56">
            <EmailField
              value={email}
              onChange={setEmail}
              placeholder={en ? "you@example.com" : "vous@exemple.com"}
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="btn-gold flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "…" : en ? "Send my selection" : "Recevoir"}
          </button>
        </form>

      {state.status === "error" && (
        <p role="alert" className="mt-2 text-xs text-[var(--color-accent-deep)]">{en ? "Could not save your selection. Check your email address and try again." : state.message}</p>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-stone)]">
        {en ? "By entering your email, you agree to be contacted by Marrakech Realty about this selection." : <>En renseignant votre email, vous acceptez d&apos;être recontacté(e) par l&apos;équipe Marrakech Realty au sujet de cette sélection.</>} <a href="/politique-confidentialite" className="underline">{en ? "Privacy (French)" : "Confidentialité"}</a>.
      </p>
      </details>
    </div>
  );
}
