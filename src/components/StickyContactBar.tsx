"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import type { Advisor } from "@/data/properties";

// ════════════════════════════════════════════════════════════════════
// StickyContactBar — barre de contact flottante sur fiche bien.
//
// Apparaît après que le hero est scrollé hors viewport (600px).
// Desktop : sticky en haut, subtile
// Mobile : sticky en bas, action-first
// ════════════════════════════════════════════════════════════════════

export default function StickyContactBar({
  propertyTitle,
  propertyReference,
  priceLabel,
  advisor,
  demanderHref,
}: {
  propertyTitle: string;
  propertyReference: string;
  priceLabel: string;
  advisor: Advisor | null;
  demanderHref: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop — top bar subtile */}
      <div
        className={`fixed left-0 right-0 top-0 z-40 hidden border-b border-[var(--color-beige-warm)] bg-white/95 backdrop-blur-md transition-transform duration-300 md:block ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!visible}
      >
        <div className="container-luxe flex h-14 items-center gap-6">
          {/* Réf + titre */}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
              Réf. {propertyReference}
            </div>
            <div className="truncate text-sm font-medium text-[var(--color-charcoal)]">
              {propertyTitle}
            </div>
          </div>

          {/* Prix */}
          <div className="hidden text-right lg:block">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
              Prix
            </div>
            <div className="font-serif text-lg text-[var(--color-charcoal)]">
              {priceLabel}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {advisor?.phone && (
              <a
                href={`tel:${advisor.phone.replace(/\s/g, "")}`}
                className="inline-flex h-9 items-center gap-2 border border-[var(--color-beige-warm)] bg-white px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
                aria-label="Appeler"
              >
                <Phone size={12} />
                <span className="hidden xl:inline">Appeler</span>
              </a>
            )}
            {advisor?.whatsapp && (
              <a
                href={`https://wa.me/${advisor.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 border border-[var(--color-beige-warm)] bg-white px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
                aria-label="WhatsApp"
              >
                <MessageCircle size={12} />
                <span className="hidden xl:inline">WhatsApp</span>
              </a>
            )}
            <Link
              href={demanderHref}
              className="inline-flex h-9 items-center gap-2 bg-[var(--color-charcoal)] px-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
            >
              Demander ce bien
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile — bottom bar action-first */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-beige-warm)] bg-white/98 p-3 shadow-[0_-4px_20px_rgba(28,24,21,0.08)] backdrop-blur-md transition-transform duration-300 md:hidden ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!visible}
      >
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] text-[var(--color-stone)]">
              {priceLabel}
            </div>
            <div className="truncate text-xs font-medium text-[var(--color-charcoal)]">
              {propertyTitle}
            </div>
          </div>
          {advisor?.phone && (
            <a
              href={`tel:${advisor.phone.replace(/\s/g, "")}`}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[var(--color-beige-warm)] bg-white text-[var(--color-charcoal)]"
              aria-label="Appeler"
            >
              <Phone size={14} />
            </a>
          )}
          <Link
            href={demanderHref}
            className="flex h-10 items-center bg-[var(--color-charcoal)] px-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white"
          >
            Demander
          </Link>
        </div>
      </div>
    </>
  );
}
