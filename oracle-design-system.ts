// ============================================================================
// Système de design Oracle — « Noir, os, or »
// ============================================================================
// Source de vérité UNIQUE des couleurs, surfaces et typo de la nouvelle DA.
// Toute primitive (src/components/oracle/*) et tout écran consomme ces tokens —
// JAMAIS de hex en dur dans les composants. Changer un token = l'app suit.
//
// Principes (cf. discussion DA 2026-06-12) :
//   1. 90 % de l'UI vit en noir + os + gris. La typo (Work Sans + tracking)
//      et l'espace portent la hiérarchie, pas la couleur.
//   2. L'OR = la signature souveraine, rare et précieuse (1 moment d'or / écran).
//   3. Les couleurs de STATUT sont sémantiques (jamais décoratives).
//   4. Pas de rainbow : le wayfinding se lit (numéro, label, position), il ne se
//      colorie pas.
//   5. Surfaces mates : pas de dégradé décoratif, pas de halo coloré, pas de
//      reflet glossy interne.
// ============================================================================

import type { CSSProperties } from "react";

export const oracle = {
  color: {
    // ── Canvas ──
    bg: "#070708", // noir absolu (fond app)
    bgRaised: "#0D0E10", // surface mate (cartes)
    bgInset: "#0A0B0C", // creux / champs
    hairline: "rgba(255,255,255,0.06)", // bordure filaire par défaut
    hairlineStrong: "rgba(255,255,255,0.12)", // bordure au repos d'un élément interactif
    hairlineHover: "rgba(255,255,255,0.18)",

    // ── Os (texte) ──
    bone: "#F4F4F2",
    boneMuted: "rgba(244,244,242,0.52)",
    boneFaint: "rgba(244,244,242,0.34)",
    boneGhost: "rgba(244,244,242,0.20)",

    // ── Or — signature souveraine (rare) ──
    gold: "#C7AC74", // champagne-taupe : clair + légèrement grisé (fuit le laiton, accent net sur noir)
    goldHairline: "rgba(199,172,116,0.30)",
    goldGlow: "rgba(199,172,116,0.22)",
    onGold: "#2A1E0A", // texte sur fond or — brun espresso (couture, pas noir « chantier »)

    // ── Statut — sémantique uniquement ──
    positive: "#34D399", // validé / win / long / RR+
    warn: "#E0A93B", // à corriger (non-critique) — plus jaune/saturé que l'or
    critical: "#E0524D", // refusé / critique / loss / short
    review: "#7E97AD", // EN REVIEW / soumis — bleu acier désaturé (process, pas un bleu criard)
    neutral: "rgba(244,244,242,0.45)", // pas encore noté / brouillon (aucun verdict)
  },

  // ── Échelle de rayon — DANS LE MARBRE (charte 2026-06-13, enforced app-wide 2026-06-13) ──
  // CONCENTRIQUE : un contrôle niche toujours dans sa surface, un micro dans son contrôle.
  //   surface (16) ⊃ contrôle (12) ⊃ micro (9)   ·   overlay (20) = grandes nappes/sheets
  //
  // TABLE CANONIQUE — 1 token Tailwind par rôle (cf. tailwind.config.ts borderRadius) :
  //   micro    9px  → rounded-sm  : badge, pastille, tag-chip, mini-contrôle
  //   contrôle 12px → rounded-md  : bouton, input, select, segmented  ← défaut shadcn/OracleButton
  //   surface  16px → rounded-lg  : carte, panneau, dialog, popover, sheet
  //   overlay  20px → rounded-xl  : nappe pleine hauteur, grand overlay
  //
  // INTERDIT : toute valeur arbitraire `rounded-[Npx]` hors {9,12,16,20} (sauf data-viz :
  //   cellules heatmap / swatch chart = micro 2px, seule exception documentée).
  //
  // PILL (`rounded-full`, 999) — N'EST PAS sur l'échelle. Réservé STRICTEMENT à :
  //   (a) cercles : avatars, pastilles de statut (dots), boutons-icône circulaires ;
  //   (b) chips de tag/filtre (affordance d'étiquette).
  //   → JAMAIS sur un bouton rectangulaire, un input, une carte (aboli au profit de `control`).
  radius: { micro: "9px", control: "12px", surface: "16px", overlay: "20px",
            sm: "9px", md: "12px", lg: "16px", xl: "20px", pill: "999px" },

  font: {
    sans: "'Work Sans', system-ui, sans-serif",
    mono: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace",
  },

  // Poids canoniques : body 400, labels/medium 500, boutons/titre 700 (bold).
  // Le bold est réservé aux BOUTONS et aux titres (hiérarchie via poids + espace).
  weight: { display: 600, body: 400, medium: 500, button: 700 },

  // Grammaire typographique — 5 rôles, source unique. Consommer via `style={{ ...oracle.text.X }}`
  // ou les primitives (Eyebrow = label, Metric = data). Tailles passées à part (text-*).
  text: {
    // Display — grands nombres héros : SF Mono tabular, tracking serré.
    // SF Mono : espacement fixe naturellement tabular, excellent à grande taille.
    display: { fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 },
    // Title — titres de sous-section (spans/divs en dessous du niveau h) : Outfit Regular.
    // Les éléments h1-h6 reçoivent Outfit via la règle CSS globale (index.css).
    title: { fontFamily: "'Outfit', system-ui, sans-serif", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.2 },
    // Body — texte courant : Work Sans Regular (police de base app 2026-06-14).
    body: { fontFamily: "'Work Sans', system-ui, sans-serif", fontWeight: 400, lineHeight: 1.6 },
    // Label — eyebrows & labels de champ : Work Sans UPPERCASE, tracking large.
    label: { fontFamily: "'Work Sans', system-ui, sans-serif", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.16em" },
    // Data — métriques inline CHIFFRÉES : mono tabular (seul rôle du mono).
    data: { fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontVariantNumeric: "tabular-nums" },
  } satisfies Record<string, CSSProperties>,

  ease: [0.22, 1, 0.36, 1] as const,

  // Verre dépoli iOS — surfaces sticky (barre du haut, bandeaux de cycle). Fond
  // peu opaque + blur + saturate (vibrance) : le contenu défile FLOUTÉ à travers,
  // jamais de boîte opaque grise. Source de vérité unique — à spreader dans `style`.
  glass: {
    background: "rgba(13,14,17,0.55)",
    backdropFilter: "blur(22px) saturate(1.7)",
    WebkitBackdropFilter: "blur(22px) saturate(1.7)",
  } as CSSProperties,
} as const;

export type OracleStatus = "positive" | "review" | "neutral" | "warn" | "critical" | "draft";

/** Couleur d'un statut (draft = neutre faible). */
export function statusColor(status: OracleStatus): string {
  switch (status) {
    case "positive":
      return oracle.color.positive;
    case "warn":
      return oracle.color.warn;
    case "critical":
      return oracle.color.critical;
    case "review":
      return oracle.color.review;
    case "draft":
      return oracle.color.boneGhost;
    case "neutral":
    default:
      return oracle.color.neutral;
  }
}
