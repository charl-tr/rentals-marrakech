import type { Locale } from "./routes";

const english: Record<string, string> = {
  "Longue durée": "Long-term", "Saisonnière": "Holiday rental", "Pertinence": "Our selection",
  "Prix croissant": "Price: low to high", "Prix décroissant": "Price: high to low", "Plus grandes surfaces": "Largest living area",
  "Type": "Type", "Quartier": "Area", "Budget": "Budget", "Chambres": "Bedrooms", "Ville": "City", "Durée": "Rental term",
  "Tous les types": "All types", "Tous les quartiers": "All areas", "Tous budgets": "Any budget", "Indifférent": "Any",
  "Toutes les villes": "All cities", "Toutes durées": "All rental terms", "Trier": "Sort", "Filtres": "Filters", "Piscine": "Pool",
  "Liste": "List", "Carte": "Map", "Afficher en liste": "Show list", "Afficher sur une carte": "Show map",
  "La sélection": "Our selection", "Les propriétés les plus remarquables du portefeuille.": "Standout properties from our portfolio.",
  "Terrains": "Land", "Commerces": "Commercial", "Aucun résultat": "No results", "Réinitialiser": "Reset",
  "Nous décrire votre projet": "Tell us about your search", "Pagination des biens": "Property pages", "Page précédente": "Previous page", "Page suivante": "Next page",
};

export function ui(locale: Locale, label: string) {
  return locale === "en" ? english[label] ?? label : label;
}
