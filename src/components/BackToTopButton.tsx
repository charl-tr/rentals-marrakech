"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

const CATALOGUE_PREFIXES = [
  "/acheter",
  "/louer",
  "/essaouira",
  "/quartiers",
  "/collections",
  "/favoris",
];

export default function BackToTopButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isPropertyJourney = CATALOGUE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    if (!isPropertyJourney) return;
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPropertyJourney]);

  if (!isPropertyJourney || !visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Revenir en haut de la page"
      className="fixed bottom-24 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/95 text-[var(--color-charcoal)] shadow-[var(--shadow-luxe)] backdrop-blur-md transition-transform hover:-translate-y-0.5 md:bottom-24 md:right-6"
    >
      <ArrowUp size={17} />
    </button>
  );
}
