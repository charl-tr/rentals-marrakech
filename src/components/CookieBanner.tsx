"use client";

import Link from "next/link";
import { useSyncExternalStore, useEffect, useRef } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "mr:consent";

type Consent = "accepted" | "essential-only" | "loading" | null;

const CONSENT_EVENT = "mr:consent-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getConsentSnapshot(): Consent {
  const choice = window.localStorage.getItem(STORAGE_KEY) as Consent;
  // Re-ask when the measurement purpose changes; do not reuse old anonymous consent.
  return choice === "accepted" && localStorage.getItem("mr:measurement-consent") !== "v1" ? null : choice;
}

export default function CookieBanner({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const consent = useSyncExternalStore(subscribe, getConsentSnapshot, () => "loading");
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = bannerRef.current;
    if (!node) return;
    const measure = () => document.documentElement.style.setProperty("--cookie-banner-height", node.getBoundingClientRect().height + "px");
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--cookie-banner-height");
    };
  }, [consent]);

  const accept = (value: "accepted" | "essential-only") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    if (value === "accepted") localStorage.setItem("mr:measurement-consent", "v1");
    else localStorage.removeItem("mr:measurement-consent");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  if (consent !== null) return null;

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[90] animate-fade-up"
    >
      <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:container-luxe md:pb-3">
        <div className="relative rounded-[14px] border border-[var(--color-beige-warm)] bg-white shadow-[var(--shadow-luxe)]">
          <button
            type="button"
            onClick={() => accept("essential-only")}
            aria-label={en ? "Close (essential cookies only)" : "Fermer (cookies essentiels uniquement)"}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-stone)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-charcoal)] md:right-3 md:top-3"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col gap-3 p-4 pr-11 md:flex-row md:items-center md:gap-5 md:px-5 md:py-3 md:pr-12">
            <div className="flex-1">
              <div
                id="cookie-banner-title"
                className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]"
              >
                {en ? "Cookies and privacy" : "Cookies et confidentialité"}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-charcoal)] md:mt-1">
                {en ? <>Essential cookies keep the site working. Optional analytics link your visits to your enquiries. No advertising cookies. </> : <>Cookies essentiels au fonctionnement. Avec votre accord, la mesure du parcours relie vos visites à vos demandes. Aucun cookie publicitaire.{" "}</>}
                <Link
                  href="/cookies"
                  className="text-[var(--color-terracotta)] underline-offset-2 hover:underline"
                >
                  {en ? "Read the policy (French)" : "En savoir plus"}
                </Link>
                .
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0 md:gap-2">
              <button
                type="button"
                onClick={() => accept("essential-only")}
                aria-label={en ? "Continue with essential cookies only" : "Continuer avec les cookies essentiels uniquement"}
                className="rounded-[10px] border border-[var(--color-charcoal)] bg-transparent px-3 py-3 text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white md:px-5 md:text-[11px] md:tracking-[0.22em]"
              >
                {en ? "Essential only" : "Essentiels"}
              </button>
              <button
                type="button"
                onClick={() => accept("accepted")}
                className="rounded-[10px] bg-[var(--color-charcoal)] px-3 py-3 text-[9px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--color-terracotta)] md:px-6 md:text-[11px] md:tracking-[0.22em]"
              >
                {en ? "Accept" : "Accepter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
