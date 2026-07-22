"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { addNote, type MutationState } from "@/lib/actions/leads-admin";
import { useMutationToast } from "@/lib/hooks/useMutationToast";

const initialState: MutationState = { status: "idle" };

export default function NoteComposer({ leadId }: { leadId: string }) {
  const [state, action] = useActionState(addNote, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useMutationToast(state);

  useEffect(() => {
    if (state.status === "success" && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-6 border-t border-[var(--color-beige-warm)] pt-6">
      <input type="hidden" name="leadId" value={leadId} />
      <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        Ajouter une note interne
      </label>
      <textarea
        name="body"
        rows={3}
        required
        data-shortcut="focus-note"
        placeholder="Note privée (visible uniquement par l'équipe)… Raccourci : n"
        className="mt-2 w-full rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-4 py-3 text-sm focus:border-[var(--color-charcoal)] focus:outline-none"
      />

      {state.status === "error" && (
        <div className="mt-2 text-[11px] text-[var(--color-terracotta)]">
          {state.message}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[10px] bg-[var(--color-charcoal)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}
