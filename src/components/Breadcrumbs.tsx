import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string; // no href = current page (not a link)
}

/**
 * Fil d'Ariane minimaliste type magazine luxe (Christie's, Knight Frank).
 *
 * Choix design :
 * - Séparateur typographique « / » (glyph), pas une icône SVG → poids visuel zéro
 * - Texte 10px, tracking 0.16em — légèrement plus serré que les eyebrows pour
 *   éviter le shouting
 * - Distinction page courante par opacité (pas par graisse) → visuel calme
 * - Hover discret vers terracotta
 */
export default function Breadcrumbs({
  items,
  variant = "light",
}: {
  items: Crumb[];
  variant?: "light" | "dark";
}) {
  const muted =
    variant === "dark" ? "text-white/85 hero-text-soft" : "text-[var(--color-stone)]";
  const current =
    variant === "dark"
      ? "text-white hero-text-soft"
      : "text-[var(--color-charcoal)]";
  const hover =
    variant === "dark"
      ? "hover:text-[var(--color-terracotta-light)]"
      : "hover:text-[var(--color-terracotta)]";
  const sep =
    variant === "dark"
      ? "text-white/55 hero-text-soft"
      : "text-[var(--color-stone)]/45";

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center text-[10px] uppercase tracking-[0.18em]"
    >
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center">
            {c.href && !isLast ? (
              <Link
                href={c.href}
                className={`${muted} ${hover} transition-colors duration-200`}
              >
                {c.label}
              </Link>
            ) : (
              <span className={current} aria-current={isLast ? "page" : undefined}>
                {c.label}
              </span>
            )}
            {!isLast && (
              <span aria-hidden className={`mx-3 ${sep} font-light select-none`}>
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
