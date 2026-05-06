"use client";

import { useActionState, useOptimistic, useTransition } from "react";
import { useMutationToast } from "./useMutationToast";
import type { MutationState } from "@/lib/actions/_core/defineMutation";

// ════════════════════════════════════════════════════════════════════
// useOptimisticMutation — wrapper sur useActionState qui applique
// l'optimistic update en UI AVANT le round-trip serveur.
//
// Si le serveur refuse (error), React.useOptimistic rollback seul.
// Les toasts d'erreur/succès sont dispatchés via useMutationToast.
//
// Usage :
//   const [optimisticStatus, { trigger, state, pending }] =
//     useOptimisticMutation({
//       action: updateLeadStatus,
//       initial: lead.status,
//       reducer: (_prev, newStatus) => newStatus,
//     });
//
//   <form action={(fd) => trigger(fd.get("status"), fd)}>...</form>
//
// Note : pour une UX "instant", l'UI doit lire `optimisticStatus` et non
// plus la prop server-driven. Ex : `<Badge status={optimisticStatus} />`.
// ════════════════════════════════════════════════════════════════════

export interface OptimisticConfig<TValue, TAction> {
  /** Server action (compat useActionState). */
  action: (
    prev: MutationState,
    formData: FormData
  ) => Promise<MutationState>;
  /** Valeur initiale (souvent la prop server-rendered). */
  initial: TValue;
  /** Reducer qui applique le changement UI. */
  reducer: (current: TValue, input: TAction) => TValue;
}

export function useOptimisticMutation<TValue, TAction>(
  config: OptimisticConfig<TValue, TAction>
) {
  const idle: MutationState = { status: "idle" };
  const [state, rawAction] = useActionState(config.action, idle);
  const [optimisticValue, applyOptimistic] = useOptimistic<TValue, TAction>(
    config.initial,
    config.reducer
  );
  const [pending, startTransition] = useTransition();

  useMutationToast(state);

  function trigger(preview: TAction, formData: FormData) {
    startTransition(() => {
      applyOptimistic(preview);
      rawAction(formData);
    });
  }

  return {
    optimisticValue,
    trigger,
    state,
    pending,
  };
}
