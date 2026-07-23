"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export default function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);
  const prev = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, next, prev]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Horizontal scroll gallery — thumbnails grandeur nature */}
      <div className="snap-x snap-mandatory flex gap-4 overflow-x-auto scroll-smooth px-6 pb-6 lg:px-10">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`Ouvrir l'image ${i + 1} en plein écran`}
            className="group relative aspect-[4/3] h-[420px] flex-shrink-0 snap-start overflow-hidden rounded-[16px] bg-[var(--color-charcoal)] md:h-[520px]"
          >
            <Image
              src={img}
              alt={`${title} — vue ${i + 1}`}
              fill
              sizes="700px"
              className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.02]"
            />
            {/* Hover overlay — fullscreen hint */}
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-charcoal)]/0 opacity-0 transition-all duration-300 group-hover:bg-[var(--color-charcoal)]/20 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-[10px] border border-white/60 bg-[var(--color-charcoal)]/60 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                <Maximize2 size={12} />
                Agrandir
              </span>
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-[var(--color-charcoal)]/75 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
              {i + 1} / {images.length}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[var(--color-charcoal)] animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie photo plein écran"
        >
          {/* Top bar : compteur + keyboard hint + close */}
          <div className="flex items-center justify-between px-5 py-5 md:px-10">
            <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/70">
              {openIndex + 1} / {images.length}
            </div>
            <div className="hidden items-center gap-3 text-[10px] text-white/50 md:flex">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center rounded-[4px] border border-white/20 bg-white/5 px-1.5 py-px font-mono text-[9px]">
                  ←
                </kbd>
                <kbd className="inline-flex items-center rounded-[4px] border border-white/20 bg-white/5 px-1.5 py-px font-mono text-[9px]">
                  →
                </kbd>
                naviguer
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center rounded-[4px] border border-white/20 bg-white/5 px-1.5 py-px font-mono text-[9px]">
                  Esc
                </kbd>
                fermer
              </span>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-[var(--color-terracotta-light)]"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main image area */}
          <div className="relative flex-1 overflow-hidden">
            <Image
              key={openIndex}
              src={images[openIndex]}
              alt={`${title} — vue ${openIndex + 1}`}
              fill
              priority
              sizes="100vw"
              className="animate-fade-in object-contain"
            />

            {/* Prev / next buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Image précédente"
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[var(--color-charcoal)] md:left-8 md:h-14 md:w-14"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Image suivante"
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[var(--color-charcoal)] md:right-8 md:h-14 md:w-14"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="border-t border-white/10 px-5 py-4 md:px-10">
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-label={`Voir image ${i + 1}`}
                    className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-[8px] transition-opacity ${
                      i === openIndex
                        ? "opacity-100 ring-2 ring-[var(--color-terracotta)]"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
