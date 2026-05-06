"use client";

import { useEffect, useState } from "react";
import { isMacLike } from "@/lib/hooks/useKeyboard";

// ════════════════════════════════════════════════════════════════════
// <Kbd> — chip d'affichage d'un raccourci clavier.
//
// Gère :
// - `mod` → affiche ⌘ sur Mac, Ctrl ailleurs
// - combinaisons (shift + K, mod + Enter, etc.)
// - style cohérent (border fine, monospace, petite taille)
//
// Usage :
//   <Kbd>K</Kbd>
//   <Kbd mod>K</Kbd>              // ⌘K ou CtrlK
//   <Kbd shift>?</Kbd>
//   <Kbd mod shift>Enter</Kbd>
// ════════════════════════════════════════════════════════════════════

export default function Kbd({
  children,
  mod = false,
  shift = false,
  alt = false,
  className = "",
}: {
  children: React.ReactNode;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  className?: string;
}) {
  const [mac, setMac] = useState(true);

  // Hydrater côté client (navigator n'existe pas en SSR).
  // Le setState dans l'effect est intentionnel pour éviter hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMac(isMacLike());
  }, []);

  const parts: React.ReactNode[] = [];
  if (mod) parts.push(mac ? "⌘" : "Ctrl");
  if (shift) parts.push(mac ? "⇧" : "Shift");
  if (alt) parts.push(mac ? "⌥" : "Alt");
  parts.push(children);

  return (
    <span
      className={`inline-flex items-center gap-0.5 border border-[var(--color-beige-warm)] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-stone)] ${className}`}
    >
      {parts.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </span>
  );
}
