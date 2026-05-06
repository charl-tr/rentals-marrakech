"use client";

import { useEffect, useRef, type ReactNode } from "react";

// ════════════════════════════════════════════════════════════════════
// FadeInOnScroll — wrapper qui fait apparaître ses enfants quand
// l'élément entre dans le viewport via IntersectionObserver.
//
// S'appuie sur les CSS [data-fade-in][data-visible] définis dans
// globals.css. Le JS toggle juste data-visible="true" au bon moment.
//
// Respect automatique de prefers-reduced-motion (CSS override).
// ════════════════════════════════════════════════════════════════════

export default function FadeInOnScroll({
  children,
  delay = 0,
  as: Element = "div",
  className = "",
  threshold = 0.15,
  rootMargin = "0px 0px -80px 0px",
}: {
  children: ReactNode;
  /** 0 à 4, delay incrémental en multiples de 80ms */
  delay?: 0 | 1 | 2 | 3 | 4;
  as?: "div" | "section" | "article" | "span";
  className?: string;
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si IntersectionObserver pas dispo, afficher direct
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-visible", "true");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  const props = {
    ref,
    "data-fade-in": true,
    "data-delay": delay > 0 ? String(delay) : undefined,
    className,
  };

  return <Element {...props}>{children}</Element>;
}
