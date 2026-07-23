"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, GitCompare, Heart } from "lucide-react";
import { setSelectionLink } from "@/lib/selection-link";

// ════════════════════════════════════════════════════════════════════
// RestoreSelection — réinjecte une sélection (favoris/comparateur) dans le
// localStorage de l'appareil courant, puis confirme. Rendu sous le chrome
// privé du groupe (portal). Aucun compte : le token du lien EST l'identité.
// ════════════════════════════════════════════════════════════════════

const CONFIG = {
  favoris: {
    key: "mr:favorites",
    event: "mr:favorites:change",
    max: Infinity,
    href: "/favoris",
    cta: "Voir mes favoris",
    Icon: Heart,
    qualifier: "favori", // s'accorde : « biens favoris »
  },
  comparateur: {
    key: "mr:compare",
    event: "mr:compare:change",
    max: 3,
    href: "/comparer",
    cta: "Ouvrir le comparateur",
    Icon: GitCompare,
    qualifier: "à comparer", // invariable : « biens à comparer »
  },
} as const;

export default function RestoreSelection({
  token,
  email,
  kind,
  slugs,
}: {
  token: string;
  email: string;
  kind: "favoris" | "comparateur";
  slugs: string[];
}) {
  const cfg = CONFIG[kind];
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Lecture de l'existant sur CET appareil
    let existing: string[] = [];
    try {
      const raw = window.localStorage.getItem(cfg.key);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        existing = parsed.filter((s): s is string => typeof s === "string");
      }
    } catch {
      existing = [];
    }

    // Fusion : sélection restaurée d'abord, puis l'existant non dupliqué.
    // Le comparateur est plafonné (3) — les restaurés priment.
    const merged = [...slugs, ...existing.filter((s) => !slugs.includes(s))];
    const capped = Number.isFinite(cfg.max)
      ? merged.slice(0, cfg.max as number)
      : merged;

    window.localStorage.setItem(cfg.key, JSON.stringify(capped));
    window.dispatchEvent(new CustomEvent(cfg.event, { detail: capped }));
    setCount(capped.length);

    // Ce navigateur est désormais LIÉ à cette sélection : l'app le reconnaîtra
    // (plus de re-proposition de sauvegarde ; mise à jour du même enregistrement).
    // La sélection sauvegardée de référence reste celle du serveur (`slugs`).
    setSelectionLink(kind, { token, email, savedSlugs: slugs });
  }, [cfg, slugs, kind, token, email]);

  const Icon = cfg.Icon;
  const n = count ?? slugs.length;
  const p = n > 1 ? "s" : "";
  const qualifier = cfg.qualifier === "favori" ? `favori${p}` : cfg.qualifier;

  return (
    <div className="bg-[var(--color-cream)]">
      <section className="py-20 md:py-28">
        <div className="container-luxe max-w-xl">
          <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
              <Check size={22} strokeWidth={2.5} />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-accent)]">
              <Icon size={13} />
              {kind === "favoris" ? "Vos favoris" : "Votre comparateur"}
            </div>

            <h1 className="mt-4 font-serif text-3xl leading-tight text-[var(--color-charcoal)]">
              Votre sélection est de retour.
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-stone)]">
              {n} bien{p} {qualifier} {n > 1 ? "sont de nouveau disponibles" : "est de nouveau disponible"}{" "}
              sur cet appareil — vous pouvez reprendre là où vous en étiez.
            </p>

            <div className="mt-8">
              <Link href={cfg.href} className="btn-gold">
                {cfg.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-[var(--color-stone)]">
            Ce lien vous est personnel et fonctionne sur tous vos appareils.
            Inutile de créer un compte.
          </p>
        </div>
      </section>
    </div>
  );
}
