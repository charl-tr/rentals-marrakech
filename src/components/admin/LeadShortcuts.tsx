"use client";

// ════════════════════════════════════════════════════════════════════
// LeadShortcuts — raccourcis clavier contextuels sur une fiche lead.
//
// Écoute :
//   s = ouvre le StatusChanger modal (click programmatique)
//   n = focus le NoteComposer textarea
//   c = ouvre log call dialog (click programmatique)
//
// Implémentation : le composant ne rend rien, il écoute le clavier et
// dispatch via des événements DOM sur les composants existants (par
// `data-shortcut` attribute). Ça évite un refactor de StatusChanger et
// NoteComposer en "controlled".
// ════════════════════════════════════════════════════════════════════

import { useKeyboard } from "@/lib/hooks/useKeyboard";

export default function LeadShortcuts() {
  useKeyboard("s", () => {
    const btn = document.querySelector<HTMLButtonElement>(
      "[data-shortcut='open-status']"
    );
    btn?.click();
  });
  useKeyboard("n", () => {
    const el = document.querySelector<HTMLTextAreaElement>(
      "[data-shortcut='focus-note']"
    );
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });
  useKeyboard("c", () => {
    const btn = document.querySelector<HTMLButtonElement>(
      "[data-shortcut='log-call']"
    );
    btn?.click();
  });

  return null;
}
