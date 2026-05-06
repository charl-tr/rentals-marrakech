"use client";

import { GitCompare } from "lucide-react";
import { useCompareList } from "@/hooks/useCompareList";

export default function CompareToggleButton({
  slug,
  variant = "hero",
}: {
  slug: string;
  variant?: "hero" | "card";
}) {
  const { has, toggle, hydrated, count, max } = useCompareList();
  const active = hydrated && has(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug);
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Retirer du comparateur" : "Ajouter au comparateur"}
        aria-pressed={active}
        title={active ? "Dans le comparateur" : `Comparer (${count}/${max})`}
        className={`flex h-9 w-9 items-center justify-center bg-white/85 backdrop-blur-sm transition-colors ${
          active
            ? "text-[var(--color-terracotta)]"
            : "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
        }`}
      >
        <GitCompare size={15} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Retirer du comparateur" : "Ajouter au comparateur"}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm transition-colors ${
        active
          ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)] text-white"
          : "border-white/40 bg-transparent text-white hover:border-white"
      }`}
    >
      <GitCompare size={12} />
      {active ? "Dans le comparateur" : "Comparer"}
    </button>
  );
}
