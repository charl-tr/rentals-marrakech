"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "mr:consent";

type Consent = "accepted" | "essential-only" | null;

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Consent;
    setConsent(stored);
    setHydrated(true);
  }, []);

  const accept = (value: "accepted" | "essential-only") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  if (!hydrated || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[90] animate-fade-up"
    >
      <div className="container-luxe pb-6">
        <div className="relative border border-[var(--color-beige-warm)] bg-white shadow-[var(--shadow-luxe)]">
          <button
            type="button"
            onClick={() => accept("essential-only")}
            aria-label="Fermer (cookies essentiels uniquement)"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center text-[var(--color-stone)] transition-colors hover:text-[var(--color-charcoal)]"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col gap-6 p-6 pr-12 md:flex-row md:items-center md:gap-10 md:p-8 md:pr-14">
            <div className="flex-1">
              <div
                id="cookie-banner-title"
                className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]"
              >
                Cookies et confidentialité
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-charcoal)]">
                Nous utilisons des cookies <strong>essentiels</strong> au
                fonctionnement du site (favoris, préférences) et, avec votre
                accord, des cookies de <strong>mesure anonyme</strong> pour
                améliorer l&apos;expérience. Aucun cookie publicitaire tiers.{" "}
                <Link
                  href="/cookies"
                  className="text-[var(--color-terracotta)] underline-offset-2 hover:underline"
                >
                  En savoir plus
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:gap-3">
              <button
                type="button"
                onClick={() => accept("essential-only")}
                className="border border-[var(--color-charcoal)] bg-transparent px-5 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
              >
                Essentiels uniquement
              </button>
              <button
                type="button"
                onClick={() => accept("accepted")}
                className="bg-[var(--color-charcoal)] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
