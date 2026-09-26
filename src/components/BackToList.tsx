"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Bouton retour : tente d'utiliser l'historique navigateur (préserve les
 * filtres du listing d'origine), fallback vers fallbackHref si absent.
 */
export default function BackToList({
  fallbackHref,
  fallbackLabel = "Retour aux biens",
  variant = "dark",
  compactOnMobile = false,
}: {
  fallbackHref: string;
  fallbackLabel?: string;
  variant?: "light" | "dark";
  compactOnMobile?: boolean;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (window.history.length > 2) {
      e.preventDefault();
      router.back();
    }
    // sinon : navigation normale via le href
  };

  return (
    <a
      href={fallbackHref}
      onClick={handleClick}
      className={`${variant === "dark" ? "btn-back-dark" : "btn-back"} ${
        compactOnMobile ? "max-sm:border-0 max-sm:p-0 max-sm:backdrop-blur-none" : ""
      }`}
    >
      <ArrowLeft size={12} />
      {compactOnMobile ? (
        <>
          <span className="sm:hidden">Retour</span>
          <span className="hidden sm:inline">{fallbackLabel}</span>
        </>
      ) : (
        fallbackLabel
      )}
    </a>
  );
}
