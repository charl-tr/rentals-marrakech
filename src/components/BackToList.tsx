"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Bouton retour : tente d'utiliser l'historique navigateur (préserve les
 * filtres du listing d'origine), fallback vers fallbackHref si absent.
 */
export default function BackToList({
  fallbackHref,
  fallbackLabel = "Retour aux biens",
  variant = "dark",
}: {
  fallbackHref: string;
  fallbackLabel?: string;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // window.history.length > 2 = on a une page précédente dans cet onglet
    setHasHistory(typeof window !== "undefined" && window.history.length > 2);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (hasHistory) {
      e.preventDefault();
      router.back();
    }
    // sinon : navigation normale via le href
  };

  const colorClasses =
    variant === "dark"
      ? "text-white/85 hover:text-[var(--color-terracotta-light)] border-white/30 hover:border-white/60"
      : "text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)] border-[var(--color-charcoal)]/30 hover:border-[var(--color-charcoal)]";

  return (
    <a
      href={fallbackHref}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 border bg-transparent px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm transition-colors ${colorClasses}`}
    >
      <ArrowLeft size={12} />
      {hasHistory ? "Retour" : fallbackLabel}
    </a>
  );
}
