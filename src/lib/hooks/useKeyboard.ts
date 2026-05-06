"use client";

import { useEffect } from "react";

// ════════════════════════════════════════════════════════════════════
// useKeyboard — registrer un raccourci clavier scopé au composant.
//
// Features :
// - cmd/ctrl auto-mappé selon plateforme (Mac → cmd, sinon ctrl)
// - shift/alt supportés
// - ignore les events quand on est dans un <input> ou <textarea>
//   (sauf si `allowInInput: true` — pour ex cmd+Enter dans un textarea)
// - cleanup auto à l'unmount
//
// Usage :
//   useKeyboard("k", () => open(), { mod: true })        // cmd/ctrl+K
//   useKeyboard("Escape", () => close())
//   useKeyboard("j", () => navDown())                     // pas de modifier
//   useKeyboard("/", () => focusSearch())
//   useKeyboard("Enter", submit, { mod: true, allowInInput: true })
// ════════════════════════════════════════════════════════════════════

export interface KeyboardOptions {
  /** Requiert cmd (mac) ou ctrl (autres). Default: false */
  mod?: boolean;
  /** Requiert shift. Default: false */
  shift?: boolean;
  /** Requiert alt/option. Default: false */
  alt?: boolean;
  /** Autorise le déclenchement quand focus dans <input>/<textarea>. Default: false */
  allowInInput?: boolean;
  /** Désactive temporairement le raccourci (sans l'unmount). */
  enabled?: boolean;
}

export function useKeyboard(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: KeyboardOptions = {}
) {
  const {
    mod = false,
    shift = false,
    alt = false,
    allowInInput = false,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      // Check si on est dans un input/textarea
      const target = e.target as HTMLElement | null;
      const inEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (inEditable && !allowInInput) return;

      // Match key (case-insensitive)
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      // Match modifiers
      const hasMod = e.metaKey || e.ctrlKey;
      if (mod !== hasMod) return;
      if (shift !== e.shiftKey) return;
      if (alt !== e.altKey) return;

      e.preventDefault();
      handler(e);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, mod, shift, alt, allowInInput, enabled, handler]);
}

// ── Helper : détection plateforme (pour afficher cmd ou ctrl) ──────

export function isMacLike(): boolean {
  if (typeof navigator === "undefined") return true;
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}
