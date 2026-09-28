"use client";

import { GitCompare } from "lucide-react";
import { toast } from "sonner";
import { useCompareList } from "@/hooks/useCompareList";

export default function CompareToggleButton({
  slug,
  variant = "hero",
  locale = "fr",
}: {
  slug: string;
  variant?: "hero" | "card";
  locale?: "fr" | "en";
}) {
  const en = locale === "en";
  const actionLabel = (active: boolean) => en ? active ? "Remove from comparison" : "Add to comparison" : active ? "Retirer du comparateur" : "Ajouter au comparateur";
  const { has, toggle, hydrated, count, max } = useCompareList();
  const active = hydrated && has(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggle(slug) === false) {
      toast(en ? "You are already comparing 3 properties." : "Votre comparateur contient déjà 3 biens.", { description: en ? "Remove a property before adding another. Your selection is saved." : "Retirez un bien avant d’en ajouter un autre. Votre sélection est conservée." });
    }
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={actionLabel(active)}
        aria-pressed={active}
        title={active ? en ? "In comparison" : "Dans le comparateur" : `${en ? "Compare" : "Comparer"} (${count}/${max})`}
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition-colors ${
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
      aria-label={actionLabel(active)}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm transition-colors ${
        active
          ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)] text-white"
          : "border-white/40 bg-transparent text-white hover:border-white"
      }`}
    >
      <GitCompare size={12} />
      {en ? active ? "In comparison" : "Compare" : active ? "Dans le comparateur" : "Comparer"}
    </button>
  );
}
