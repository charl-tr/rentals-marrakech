"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export default function PropertyGallery({
  images,
  title,
  locale = "fr",
}: {
  images: string[];
  title: string;
  locale?: "fr" | "en";
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loadedIndex, setLoadedIndex] = useState<number | null>(null);
  const [failedIndex, setFailedIndex] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState<Set<number>>(() => new Set([0, 1]));

  // Mount only the strip images within roughly one photo of the viewport.
  // Native lazy loading alone can fetch many horizontal slides in advance.
  useEffect(() => {
    const root = stripRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(entries => {
      const indexes = entries.filter(e => e.isIntersecting).map(e => Number((e.target as HTMLElement).dataset.slide));
      if (indexes.length) setNearby(previous => {
        if (indexes.every(i => previous.has(i))) return previous;
        return new Set([...previous, ...indexes]);
      });
    }, { root, rootMargin: "0px 100% 0px 100%" });
    root.querySelectorAll("[data-slide]").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [images]);

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
      <div ref={stripRef} className="snap-x snap-mandatory flex gap-4 overflow-x-auto scroll-smooth px-6 pb-6 lg:px-10">
        {images.map((img, i) => (
          <button
            key={i}
            data-slide={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={locale === "en" ? `Open image ${i + 1} full screen` : `Ouvrir l'image ${i + 1} en plein écran`}
            className="group relative aspect-[4/3] w-[calc(100vw-48px)] flex-shrink-0 snap-start overflow-hidden rounded-[16px] bg-[var(--color-beige)] md:h-[520px] md:w-auto"
          >
            {nearby.has(i) && <Image
              src={img}
              alt={`${title} — vue ${i + 1}`}
              fill
              sizes="(max-width: 767px) calc(100vw - 48px), 700px"
              loading="eager"
              quality={68}
              className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.02]"
            />}
            {/* Hover overlay — fullscreen hint */}
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-charcoal)]/0 opacity-0 transition-all duration-300 group-hover:bg-[var(--color-charcoal)]/20 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-[10px] border border-white/60 bg-[var(--color-charcoal)]/60 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                <Maximize2 size={12} />
                {locale === "en" ? "Enlarge" : "Agrandir"}
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
          aria-label={locale === "en" ? "Full-screen photo gallery" : "Galerie photo plein écran"}
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
              aria-label={locale === "en" ? "Close gallery" : "Fermer"}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-[var(--color-terracotta-light)]"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main image area */}
          <div className="relative flex-1 overflow-hidden">
            {loadedIndex !== null && loadedIndex !== openIndex && images[loadedIndex] && <Image
              src={images[loadedIndex]} alt="" fill sizes="100vw" quality={68}
              className="object-contain" aria-hidden
            />}
            <Image
              key={openIndex}
              src={images[openIndex]}
              alt={`${title} — vue ${openIndex + 1}`}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              quality={68}
              onLoad={() => { setLoadedIndex(openIndex); setFailedIndex(null); }}
              onError={() => setFailedIndex(openIndex)}
              className={`object-contain ${loadedIndex === openIndex ? "opacity-100" : "opacity-0"}`}
            />
            {loadedIndex !== openIndex && <div role="status" className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white">
              {failedIndex === openIndex ? locale === "en" ? "Photo unavailable. Try another image." : "Photo indisponible. Essayez une autre image." : locale === "en" ? "Loading photo…" : "Chargement de la photo…"}
            </div>}
            {/* Same srcset and quality as the displayed photo: reuse browser cache.
                Wait for the current photo before warming only its two neighbours. */}
            {loadedIndex === openIndex && images.length > 1 && [...new Set([(openIndex + 1) % images.length, (openIndex - 1 + images.length) % images.length])].filter(i => i !== openIndex).map(i =>
              <Image key={`warm-${i}`} src={images[i]} alt="" fill sizes="100vw" quality={68} loading="eager" fetchPriority="low" aria-hidden className="pointer-events-none opacity-0" />
            )}

            {/* Prev / next buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label={locale === "en" ? "Previous image" : "Image précédente"}
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[var(--color-charcoal)] md:left-8 md:h-14 md:w-14"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label={locale === "en" ? "Next image" : "Image suivante"}
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
                    aria-label={locale === "en" ? `View image ${i + 1}` : `Voir image ${i + 1}`}
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
                      quality={50}
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
