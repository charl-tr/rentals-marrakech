// ============================================================================
// Système de design Marrakech Realty — « Cuir, crème, caractère »
// ============================================================================
// Source de vérité UNIQUE des couleurs, surfaces, typo et primitives.
// Toute primitive et tout écran consomme ces tokens —
// JAMAIS de hex en dur dans les composants. Changer un token = l'app suit.
//
// Principes (cf. globals.css + charte DA) :
//   1. 90 % de l'UI vit en blanc + crème + charcoal. La typo (Playfair +
//      Inter) et l'espace portent la hiérarchie, pas la couleur.
//   2. Le TERRACOTTA = l'accent unique, rare et précieux (1 accent / écran).
//   3. Les couleurs de STATUT sont sémantiques (jamais décoratives).
//   4. Pas de rainbow : le wayfinding se lit (numéro, label, position), il
//      ne se colorie pas.
//   5. Surfaces mates et chaudes : pas de dégradé décoratif, pas de halo,
//      pas de reflet glossy. Le luxe c'est l'espace, pas l'effet.
//   6. Zero border-radius sur les cartes, boutons, inputs. L'architecture
//      marocaine est géométrique — les zelliges sont des lignes droites.
// ============================================================================

import type { CSSProperties } from "react";

export const mr = {
  color: {
    // ── Canvas ──────────────────────────────────────────────────
    bg: "#ffffff",              // fond par défaut (body, cartes)
    bgAlt: "#faf8f4",           // sections alternées (~2% warm)
    bgTint: "#f2ede4",          // sidebar, hover, zones secondaires
    hairline: "#e8e3d8",        // bordure par défaut
    hairlineStrong: "#c9bfae",  // bordure appuyée

    // ── Encre ───────────────────────────────────────────────────
    ink: "#1a1814",             // titres, texte primaire
    inkSoft: "#3d3731",         // mid-emphasis
    inkMuted: "#78726b",        // labels, meta, descriptions
    inkHint: "#a9a39a",         // placeholder, hint text
    onDark: "#ffffff",          // texte sur fond sombre

    // ── Accent cuir — marron patiné, UNIQUE accent du site ─────
    accent: "#6e4f3a",          // CTA, liens actifs, eyebrows
    accentDeep: "#4e3625",      // hover / pressed
    accentLight: "#8e6b4b",     // sur fond sombre (text-terracotta-light)
    accentSoft: "#f3ece1",      // tint background
    accentVeil: "rgba(110, 79, 58, 0.06)", // voile subtil

    // ── Zones sombres (hero, footer, admin) ─────────────────────
    dark: "#1a1814",            // fond sombre (= ink)
    darkSoft: "#2d2823",        // surface élevée sur fond sombre

    // ── Statut — teintes sourdes uniquement ─────────────────────
    success: "#5e7266",
    successSoft: "#e5ebe6",
    warning: "#8e6b4b",         // = accentLight (cohérence)
    warningSoft: "#f3ece1",     // = accentSoft
    alert: "#8a3d2a",
    alertSoft: "#f3e3dc",
  },

  // ── Border radius — DANS LE MARBRE ────────────────────────────
  // ZERO partout sauf avatars. Choix de marque : géométrie marocaine.
  //
  //   none    0px  → défaut absolu : cartes, boutons, inputs, images
  //   avatar  50%  → uniquement : photos conseillers (cercle)
  //
  // INTERDIT : rounded-md, rounded-lg ou toute valeur > 0 sur un
  // composant qui n'est pas un avatar.
  radius: {
    none: "0px",
    avatar: "50%",
  },

  font: {
    serif: "'Playfair Display', Georgia, serif",
    sans: "'Inter', system-ui, -apple-system, sans-serif",
  },

  // Poids canoniques
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },

  // ── Grammaire typographique — 7 rôles, source unique ──────────
  // Consommer via `style={{ ...mr.text.X }}` ou les classes Tailwind.
  // RÈGLE : Playfair ne descend JAMAIS en dessous de 18px.
  //         Inter ne monte JAMAIS au-dessus de 16px (sauf hero subtitle).
  text: {
    // Hero — titre principal plein écran
    hero: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      fontSize: "clamp(2.4rem, 5vw, 5rem)",
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
    } as CSSProperties,

    // H1 — titre de section principal
    h1: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      fontSize: "clamp(2rem, 4vw, 3.2rem)",
      lineHeight: 1.15,
      letterSpacing: "-0.02em",
    } as CSSProperties,

    // H2 — sous-titre de section
    h2: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    } as CSSProperties,

    // H3 — titre de carte / bloc
    h3: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 500,
      fontSize: "1.25rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    } as CSSProperties,

    // Eyebrow — label de section, toujours uppercase
    eyebrow: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 500,
      fontSize: "11px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.32em",
    } as CSSProperties,

    // Body — texte courant
    body: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: 1.7,
    } as CSSProperties,

    // Label — champs de formulaire, metadata
    label: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 500,
      fontSize: "10px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.22em",
    } as CSSProperties,
  },

  // ── Ombres — minimales et chaudes ─────────────────────────────
  shadow: {
    card: "0 1px 3px rgba(26, 24, 20, 0.04), 0 2px 12px -6px rgba(26, 24, 20, 0.06)",
    luxe: "0 24px 60px -24px rgba(26, 24, 20, 0.22), 0 6px 16px -8px rgba(26, 24, 20, 0.08)",
    inner: "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
  },

  // ── Espacement — échelle de 8px ───────────────────────────────
  space: {
    micro: "4px",
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "32px",
    xl: "48px",
    section: "64px",
    sectionLg: "112px",
  },

  // ── Animations ────────────────────────────────────────────────
  ease: [0.16, 1, 0.3, 1] as const,     // cubic-bezier principal
  duration: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
    hero: "0.8s",
    kenBurns: "16s",
  },

  // ── Overlays hero — garantissent la lisibilité sur toute image ─
  overlay: {
    bottom: "linear-gradient(to top, rgba(23,20,15,0.92) 0%, rgba(23,20,15,0.75) 28%, rgba(23,20,15,0.35) 60%, rgba(23,20,15,0.10) 100%)",
    top: "linear-gradient(to bottom, rgba(23,20,15,0.88) 0%, rgba(23,20,15,0.65) 40%, rgba(23,20,15,0.55) 70%, rgba(23,20,15,0.80) 100%)",
    left: "linear-gradient(to right, rgba(23,20,15,0.45) 0%, rgba(23,20,15,0.15) 50%, transparent 100%)",
    full: "rgba(23, 20, 15, 0.60)",
  },

  // ── Boutons — 4 variantes, zero radius ────────────────────────
  // Specs communes : padding 14px 28px, font-size 12-13px,
  // uppercase, tracking .18em, transition .2s
  button: {
    primary: { bg: "#1a1814", text: "#ffffff", hover: "#6e4f3a" },
    gold: { bg: "#6e4f3a", text: "#ffffff", hover: "#4e3625" },
    outline: { bg: "transparent", text: "#1a1814", border: "#1a1814", hover: { bg: "#1a1814", text: "#ffffff" } },
    outlineLight: { bg: "transparent", text: "#ffffff", border: "rgba(255,255,255,0.7)", hover: { bg: "#ffffff", text: "#1a1814" } },
  },

  // ── Breakpoints ───────────────────────────────────────────────
  breakpoint: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
} as const;

// ── Helpers ──────────────────────────────────────────────────────

export type MRStatus = "success" | "warning" | "alert" | "neutral";

export function statusColor(status: MRStatus): string {
  switch (status) {
    case "success": return mr.color.success;
    case "warning": return mr.color.warning;
    case "alert":   return mr.color.alert;
    case "neutral":
    default:        return mr.color.inkMuted;
  }
}

export function statusBg(status: MRStatus): string {
  switch (status) {
    case "success": return mr.color.successSoft;
    case "warning": return mr.color.warningSoft;
    case "alert":   return mr.color.alertSoft;
    case "neutral":
    default:        return mr.color.bgTint;
  }
}
