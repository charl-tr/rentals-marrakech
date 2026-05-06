"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════════════════
// useMutationToast — hook générique pour afficher un toast
// quand un état de mutation passe en "success" ou "error".
//
// Toutes nos mutations retournent des états de la forme :
//   { status: "idle" | "success" | "error"; message?: string; ... }
// Ce hook watch ces transitions et dispatch le toast adéquat.
//
// Usage :
//   const [state, action] = useActionState(...)
//   useMutationToast(state)
// ════════════════════════════════════════════════════════════════════

type ToastableState = {
  status: string;
  message?: string;
};

export function useMutationToast<T extends ToastableState>(state: T) {
  // Ref pour ne pas redéclencher au mount initial si status === "idle"
  const lastStatusRef = useRef<string>("idle");

  useEffect(() => {
    if (state.status === lastStatusRef.current) return;
    lastStatusRef.current = state.status;

    if (state.status === "success") {
      toast.success(state.message ?? "Enregistré.");
    } else if (state.status === "error") {
      toast.error(state.message ?? "Une erreur est survenue.");
    }
  }, [state]);
}
