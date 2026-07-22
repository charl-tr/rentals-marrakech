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

  return (
    <a
      href={fallbackHref}
      onClick={handleClick}
      className={variant === "dark" ? "btn-back-dark" : "btn-back"}
    >
      <ArrowLeft size={12} />
      {hasHistory ? "Retour" : fallbackLabel}
    </a>
  );
}
