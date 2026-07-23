"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoriteButton({
  slug,
  variant = "card",
}: {
  slug: string;
  variant?: "card" | "hero";
}) {
  const { has, toggle, hydrated } = useFavorites();
  const router = useRouter();
  const active = hydrated && has(slug);
  const [burst, setBurst] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Empêche la navigation quand le bouton est dans un <Link>
    e.preventDefault();
    e.stopPropagation();

    const wasActive = active;
    toggle(slug);

    if (!wasActive) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 550);
      toast("Ajouté à vos favoris.", {
        description: "Retrouvez-le à tout moment dans votre sélection.",
        action: { label: "Voir", onClick: () => router.push("/favoris") },
      });
    } else {
      toast("Retiré de vos favoris.");
    }
  };

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm transition-colors ${
          active
            ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)] text-white"
            : "border-white/40 bg-transparent text-white hover:border-white"
        }`}
      >
        <Heart
          size={12}
          fill={active ? "currentColor" : "none"}
          strokeWidth={active ? 0 : 1.8}
          className={burst ? "animate-heart-pop" : ""}
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
      className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition-colors ${
        active
          ? "text-[var(--color-terracotta)]"
          : "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
      }`}
    >
      {burst && (
        <span
          aria-hidden
          className="animate-heart-burst pointer-events-none absolute inset-0 m-auto h-5 w-5 rounded-full bg-[var(--color-terracotta)]"
        />
      )}
      <Heart
        size={15}
        fill={active ? "currentColor" : "none"}
        strokeWidth={active ? 0 : 1.8}
        className={`relative ${burst ? "animate-heart-pop" : ""}`}
      />
    </button>
  );
}
