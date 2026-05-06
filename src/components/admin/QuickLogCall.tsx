"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Phone, X } from "lucide-react";
import { logInteraction } from "@/lib/actions/leads-admin";
import { useMutationToast } from "@/lib/hooks/useMutationToast";
import type { MutationState } from "@/lib/actions/_core/defineMutation";

const idle: MutationState = { status: "idle" };

// Bouton "Logger appel" sur fiche lead, avec raccourci clavier `c`.
// Dialog avec textarea pour capturer la note de l'appel.

export default function QuickLogCall({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(logInteraction, idle);
  useMutationToast(state);

  if (state.status === "success" && open) setOpen(false);

  return (
    <>
      <button
        type="button"
        data-shortcut="log-call"
        onClick={() => setOpen(true)}
        title="Logger un appel (c)"
        className="inline-flex items-center gap-2 border border-[var(--color-beige-warm)] bg-white px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
      >
        <Phone size={12} />
        Logger appel
        <kbd className="ml-1 inline-flex items-center border border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-1 py-px font-mono text-[9px] normal-case">
          c
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-charcoal)]/30 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md border border-[var(--color-beige-warm)] bg-white p-8 shadow-[var(--shadow-luxe)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow">Interaction</div>
                <h3 className="mt-3 font-serif text-2xl text-[var(--color-charcoal)]">
                  Logger un appel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
              >
                <X size={18} />
              </button>
            </div>

            <form action={action} className="mt-6 space-y-4">
              <input type="hidden" name="leadId" value={leadId} />
              <input type="hidden" name="type" value="call_logged" />
              <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Note (optionnelle)
                </span>
                <textarea
                  name="body"
                  rows={3}
                  autoFocus
                  placeholder="Ex : appelé 14h30, pas décroché — rappel demain matin"
                  className="mt-2 w-full border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border border-[var(--color-beige-warm)] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)]"
                >
                  Annuler
                </button>
                <SubmitBtn />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[var(--color-charcoal)] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "…" : "Enregistrer"}
    </button>
  );
}
