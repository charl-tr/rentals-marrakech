"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

/**
 * Affiche l'icône cœur avec count dans le navbar.
 * Réactif : se met à jour dès qu'un favori change.
 */
export default function FavoriteCounter({
  variant = "light",
  locale = "fr",
}: {
  variant?: "light" | "dark"; // light = texte foncé (fond clair), dark = texte clair (fond sombre)
  locale?: "fr" | "en";
}) {
  const { count, hydrated } = useFavorites();

  // Évite le flash "0 favoris" au premier render (hydration)
  if (!hydrated) {
    return (
      <Link
        href={locale === "en" ? "/en/saved-properties" : "/favoris"}
        aria-label={locale === "en" ? "Saved properties" : "Mes favoris"}
        className={`flex items-center transition-colors ${
          variant === "dark"
            ? "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
            : "text-white hover:text-[var(--color-terracotta-light)]"
        }`}
      >
        <Heart size={16} strokeWidth={1.8} />
      </Link>
    );
  }

  const linkClass =
    variant === "dark"
      ? "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
      : "text-white hover:text-[var(--color-terracotta-light)]";

  return (
    <Link
      href={locale === "en" ? "/en/saved-properties" : "/favoris"}
      aria-label={`${locale === "en" ? "Saved properties" : "Mes favoris"} (${count})`}
      className={`relative inline-flex items-center transition-colors ${linkClass}`}
    >
      <Heart
        size={16}
        fill={count > 0 ? "currentColor" : "none"}
        strokeWidth={count > 0 ? 0 : 1.8}
        className={count > 0 ? "text-[var(--color-terracotta)]" : ""}
      />
      {count > 0 && (
        <span className="ml-1.5 text-[11px] font-medium">{count}</span>
      )}
    </Link>
  );
}
