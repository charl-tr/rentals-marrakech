"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Kbd from "./_primitives/Kbd";

// ════════════════════════════════════════════════════════════════════
// CommandPaletteTrigger — bouton visuel qui indique "cmd+K".
//
// Le raccourci lui-même est écouté par <CommandPalette>.
// Ce composant n'a qu'un rôle visuel ET émet l'événement custom
// `admin:open-command-palette` quand cliqué, repris par la palette.
// ════════════════════════════════════════════════════════════════════

export default function CommandPaletteTrigger() {
  const [mac, setMac] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMac(/mac|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  return (
    <button
      type="button"
      aria-label="Recherche rapide"
      onClick={() => {
        // Dispatch un event synth ⌘K pour faire toggle la palette
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "k",
            metaKey: mac,
            ctrlKey: !mac,
          })
        );
      }}
      className="hidden h-9 items-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-3 text-xs text-[var(--color-stone)] transition-colors hover:border-[var(--color-charcoal)] md:inline-flex"
    >
      <Search size={12} />
      <span className="hidden text-[11px] lg:inline">Rechercher</span>
      <Kbd mod>K</Kbd>
    </button>
  );
}
