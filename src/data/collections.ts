// ════════════════════════════════════════════════════════════════════
// Collections éditoriales — sélections curatoriales par intention.
// Pas en DB pour l'instant — hardcodé ici, facilement migrable vers une
// table `collections` quand on voudra les éditer depuis l'admin.
// ════════════════════════════════════════════════════════════════════

import type { Property } from "./properties";

export interface Collection {
  slug: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  heroImage?: string; // à fetch depuis un bien featured si absent
  filter: (property: Property) => boolean;
  /** Tri optionnel — par défaut featured puis prix desc */
  sort?: (a: Property, b: Property) => number;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "pour-vivre",
    title: "Pour s'installer à l'année",
    eyebrow: "Collection — Résidence principale",
    subtitle:
      "Villas et riads qui font une vraie maison — assez d'espace pour une famille, standing au quotidien, ancrage résidentiel.",
    filter: (p) =>
      (p.type === "villa" || p.type === "riad-renove" || p.type === "maison-hotes") &&
      p.bedrooms >= 4 &&
      p.listing === "vente",
    sort: (a, b) => b.bedrooms - a.bedrooms || b.price - a.price,
  },
  {
    slug: "pour-louer-saisonnier",
    title: "Conçus pour la location saisonnière",
    eyebrow: "Collection — Investissement",
    subtitle:
      "Riads restaurés de la médina et villas avec piscine — les typologies les plus demandées par les vacanciers haut de gamme.",
    filter: (p) =>
      p.listing === "vente" &&
      (p.type === "riad-renove" || (p.type === "villa" && p.pool)),
  },
  {
    slug: "pour-la-retraite",
    title: "Pour une retraite lumineuse",
    eyebrow: "Collection — Art de vivre",
    subtitle:
      "Appartements de standing à Guéliz et l'Hivernage — services de résidence, sécurité, proximité centre. Sans contrainte d'entretien.",
    filter: (p) =>
      p.type === "appartement" &&
      p.listing === "vente" &&
      ["gueliz", "hivernage"].includes(p.neighborhoodSlug),
  },
  {
    slug: "pour-les-alizes",
    title: "Cap sur Essaouira",
    eyebrow: "Collection — Bord de mer",
    subtitle:
      "Le Maroc atlantique — médina UNESCO, plages infinies, vent d'été. Riads, villas et maisons d'hôtes à Diabat, Ghazoua, Sidi Kaouki.",
    filter: (p) => p.city === "Essaouira" && p.listing === "vente",
  },
  {
    slug: "avec-piscine",
    title: "Avec piscine et jardin",
    eyebrow: "Collection — Ressourcement",
    subtitle:
      "Le luxe authentique au Maroc — avoir sa piscine, son jardin, ses oliviers. Villas et riads de caractère.",
    filter: (p) => p.pool && p.listing === "vente",
    sort: (a, b) => (b.landSurface ?? 0) - (a.landSurface ?? 0),
  },
  {
    slug: "riad-a-renover",
    title: "Restaurer un riad",
    eyebrow: "Collection — Projet",
    subtitle:
      "La médina à son état le plus authentique — prix plus doux, potentiel énorme. Pour ceux qui veulent mettre leur propre marque.",
    filter: (p) => p.type === "riad-a-renover" && p.listing === "vente",
  },
];

export function findCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
