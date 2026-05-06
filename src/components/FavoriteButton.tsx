"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoriteButton({
  slug,
  variant = "card",
}: {
  slug: string;
  variant?: "card" | "hero";
}) {
  const { has, toggle, hydrated } = useFavorites();
  const active = hydrated && has(slug);

  const handleClick = (e: React.MouseEvent) => {
    // Empêche la navigation quand le bouton est dans un <Link>
    e.preventDefault();
    e.stopPropagation();
    toggle(slug);
  };

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm transition-colors ${
          active
            ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)] text-white"
            : "border-white/40 bg-transparent text-white hover:border-white"
        }`}
      >
        <Heart
          size={12}
          fill={active ? "currentColor" : "none"}
          strokeWidth={active ? 0 : 1.8}
        />
        {active ? "Dans vos favoris" : "Ajouter aux favoris"}
      </button>
    );
  }

  // variant="card" — icône subtile top-right
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center bg-white/85 backdrop-blur-sm transition-colors ${
        active
          ? "text-[var(--color-terracotta)]"
          : "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
      }`}
    >
      <Heart
        size={15}
        fill={active ? "currentColor" : "none"}
        strokeWidth={active ? 0 : 1.8}
      />
    </button>
  );
}
