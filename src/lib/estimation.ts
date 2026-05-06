import "server-only";
import { supabase } from "./supabase";
import type { PropertyType } from "@/data/properties";

// ════════════════════════════════════════════════════════════════════
// Estimation vendeur — algorithme basé sur biens comparables en DB.
//
// Principe : on cherche les biens publiés, même type, même quartier,
// avec surface proche (±30%). On calcule la médiane du prix au m².
// Résultat : fourchette basée sur ±15% autour de l'estimation médiane.
//
// Fallback : si <3 biens trouvés dans le quartier exact, on élargit au
// quartier voisin / à la ville entière.
// ════════════════════════════════════════════════════════════════════

export interface EstimationInput {
  type: PropertyType;
  neighborhoodSlug: string;
  surface: number;
  bedrooms?: number;
}

export interface EstimationResult {
  estimatedPriceLow: number; // borne basse (-15%)
  estimatedPriceMid: number; // médiane
  estimatedPriceHigh: number; // borne haute (+15%)
  pricePerSqm: number; // prix moyen au m² comparables
  comparablesCount: number;
  confidence: "strong" | "moderate" | "low";
  notes: string[];
}

export async function estimateProperty(
  input: EstimationInput
): Promise<EstimationResult | null> {
  const { type, neighborhoodSlug, surface } = input;
  const notes: string[] = [];

  // Étape 1 : comparables exacts (même type + quartier + surface proche)
  const minSurface = surface * 0.7;
  const maxSurface = surface * 1.3;

  const { data: exact } = await supabase
    .from("properties")
    .select("price_eur, surface")
    .eq("published", true)
    .eq("listing", "vente")
    .eq("type", type)
    .eq("neighborhood_slug", neighborhoodSlug)
    .gte("surface", minSurface)
    .lte("surface", maxSurface);

  let sample = ((exact ?? []) as { price_eur: number; surface: number }[]).filter(
    (p) => p.surface && p.surface > 0
  );

  // Étape 2 : si peu, élargir au même type + quartier (surface libre)
  if (sample.length < 3) {
    const { data: loose } = await supabase
      .from("properties")
      .select("price_eur, surface")
      .eq("published", true)
      .eq("listing", "vente")
      .eq("type", type)
      .eq("neighborhood_slug", neighborhoodSlug);
    sample = ((loose ?? []) as { price_eur: number; surface: number }[]).filter(
      (p) => p.surface && p.surface > 0
    );
    if (sample.length >= 3) {
      notes.push(
        "Surface élargie pour obtenir plus de comparables. Fourchette plus large."
      );
    }
  }

  // Étape 3 : fallback même type + ville (Marrakech ou Essaouira)
  if (sample.length < 3) {
    const { data: city } = await supabase
      .from("properties")
      .select("price_eur, surface, city")
      .eq("published", true)
      .eq("listing", "vente")
      .eq("type", type);
    sample = ((city ?? []) as { price_eur: number; surface: number }[]).filter(
      (p) => p.surface && p.surface > 0
    );
    if (sample.length >= 3) {
      notes.push(
        "Peu de biens comparables dans ce quartier — estimation élargie à la ville."
      );
    }
  }

  if (sample.length < 3) {
    return null;
  }

  // Calcul : prix au m² sur sample, médiane
  const pricesPerSqm = sample
    .map((p) => p.price_eur / p.surface)
    .sort((a, b) => a - b);
  const medianPricePerSqm =
    pricesPerSqm[Math.floor(pricesPerSqm.length / 2)];

  const estimatedMid = medianPricePerSqm * surface;
  const estimatedLow = estimatedMid * 0.85;
  const estimatedHigh = estimatedMid * 1.15;

  const confidence: EstimationResult["confidence"] =
    sample.length >= 10 ? "strong" : sample.length >= 5 ? "moderate" : "low";

  if (confidence === "low") {
    notes.push(
      "Échantillon restreint — cette estimation est indicative. Un conseiller peut affiner avec des transactions off-market récentes."
    );
  }

  return {
    estimatedPriceLow: Math.round(estimatedLow / 1000) * 1000,
    estimatedPriceMid: Math.round(estimatedMid / 1000) * 1000,
    estimatedPriceHigh: Math.round(estimatedHigh / 1000) * 1000,
    pricePerSqm: Math.round(medianPricePerSqm),
    comparablesCount: sample.length,
    confidence,
    notes,
  };
}
