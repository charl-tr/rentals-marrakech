"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import FavoriteCounter from "@/components/FavoriteCounter";
import CurrencySwitcher from "@/components/CurrencySwitcher";

// ══════════════════════════════════════════════════════════════════════
// Mega-menus — structure simplifiée (max 3 colonnes, pas de surcharge)
// ══════════════════════════════════════════════════════════════════════

type MegaColumn = {
  heading: string;
  links: { href: string; label: string }[];
};

const ACHETER_MEGA: MegaColumn[] = [
  {
    heading: "Riads",
    links: [
      { href: "/acheter/riad-renove", label: "Riads rénovés" },
      { href: "/acheter/riad-a-renover", label: "Riads à rénover" },
    ],
  },
  {
    heading: "Villas",
    links: [
      { href: "/acheter/villa/palmeraie", label: "Palmeraie" },
      { href: "/acheter/villa/hivernage", label: "Hivernage" },
      { href: "/acheter/villa/targa", label: "Targa" },
      { href: "/acheter/villa/amelkis", label: "Amelkis" },
      { href: "/acheter/villa/gueliz", label: "Guéliz" },
      { href: "/acheter/villa/ourika", label: "Route de l'Ourika" },
    ],
  },
  {
    heading: "Autres",
    links: [
      { href: "/acheter/appartement", label: "Appartements" },
      { href: "/acheter/programmes-neufs", label: "Programmes neufs" },
      { href: "/acheter/terrain", label: "Terrains" },
      { href: "/deposer-un-bien", label: "Déposer un bien" },
    ],
  },
  {
    heading: "Outils",
    links: [
      { href: "/carte", label: "Vue carte" },
      { href: "/marche", label: "Rapport marché" },
      { href: "/estimer", label: "Estimation gratuite" },
      { href: "/savoir-acheter/calculette", label: "Calculette de frais" },
    ],
  },
];

const LOUER_LINKS = [
  { href: "/louer/villa", label: "Villas" },
  { href: "/louer/appartement", label: "Appartements" },
  { href: "/louer/saisonnier", label: "Locations saisonnières" },
];

const ESSAOUIRA_LINKS = [
  { href: "/essaouira/vente-villa", label: "Vente villa" },
  { href: "/essaouira/vente-riad", label: "Vente riad" },
  { href: "/essaouira/vente-terrain", label: "Vente terrain" },
  { href: "/essaouira/location-villa", label: "Location villa" },
];

// ══════════════════════════════════════════════════════════════════════
// Navbar — DA unique : thin, typographique, zéro bouton coloré
// ══════════════════════════════════════════════════════════════════════

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"acheter" | "louer" | "essaouira" | null>(
    null
  );
  const pathname = usePathname();

  const isHome = pathname === "/";
  const solid = scrolled || !isHome || mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  // Couleur texte selon contexte — ultra-minimal
  const linkText = solid ? "text-[var(--color-charcoal)]" : "text-white";
  const linkHover = solid
    ? "hover:text-[var(--color-terracotta)]"
    : "hover:text-[var(--color-terracotta-light)]";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? "border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-luxe flex h-14 items-center justify-between lg:h-16">
        {/* Logo */}
        <Link href="/" aria-label="Marrakech Realty — Accueil" className="block">
          <Image
            src="/logo-complete.png"
            alt="Marrakech Realty"
            width={331}
            height={70}
            priority
            className={`h-7 w-auto object-contain transition-[filter] duration-500 lg:h-8 ${
              solid
                ? ""
                : "brightness-0 invert drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
            }`}
          />
        </Link>

        {/* Nav principale — desktop */}
        <nav className="hidden items-center lg:flex">
          <NavDropdown
            label="Acheter"
            open={openMenu === "acheter"}
            onEnter={() => setOpenMenu("acheter")}
            onLeave={() => setOpenMenu(null)}
            linkClass={`${linkText} ${linkHover}`}
            wide
          >
            <MegaPanel columns={ACHETER_MEGA} footerHref="/acheter" footerLabel="Tous les biens à vendre" />
          </NavDropdown>

          <NavDropdown
            label="Louer"
            open={openMenu === "louer"}
            onEnter={() => setOpenMenu("louer")}
            onLeave={() => setOpenMenu(null)}
            linkClass={`${linkText} ${linkHover}`}
          >
            <SimplePanel links={LOUER_LINKS} footerHref="/louer" footerLabel="Toutes les locations" />
          </NavDropdown>

          <NavDropdown
            label="Essaouira"
            open={openMenu === "essaouira"}
            onEnter={() => setOpenMenu("essaouira")}
            onLeave={() => setOpenMenu(null)}
            linkClass={`${linkText} ${linkHover}`}
          >
            <SimplePanel links={ESSAOUIRA_LINKS} footerHref="/essaouira" footerLabel="Bord de mer" />
          </NavDropdown>

          <NavLink href="/journal" label="Journal" className={`${linkText} ${linkHover}`} />
          <NavLink href="/contact" label="Contact" className={`${linkText} ${linkHover}`} />

          {/* Séparateur micro + favoris icône seule */}
          <span
            aria-hidden
            className={`mx-4 h-3 w-px ${solid ? "bg-[var(--color-beige-warm)]" : "bg-white/30"}`}
          />
          <FavoriteCounter variant={solid ? "dark" : "light"} />
          <span
            aria-hidden
            className={`mx-3 h-3 w-px ${solid ? "bg-[var(--color-beige-warm)]" : "bg-white/30"}`}
          />
          <CurrencySwitcher />
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((s) => !s)}
          className={`lg:hidden ${solid ? "text-[var(--color-charcoal)]" : "text-white"}`}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-[var(--color-beige-warm)] bg-[var(--color-cream)] lg:hidden">
          <div className="container-luxe py-6">
            <MobileSection heading="Acheter" links={ACHETER_MEGA.flatMap((c) => c.links)} />
            <MobileSection heading="Louer" links={LOUER_LINKS} />
            <MobileSection heading="Essaouira" links={ESSAOUIRA_LINKS} />

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-beige-warm)] pt-6">
              <Link
                href="/journal"
                className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
              >
                Journal
              </Link>
              <Link
                href="/contact"
                className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
              >
                Contact
              </Link>
              <Link
                href="/carte"
                className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
              >
                Vue carte
              </Link>
              <Link
                href="/marche"
                className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
              >
                Rapport marché
              </Link>
              <Link
                href="/favoris"
                className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
              >
                Mes favoris
              </Link>
              <Link
                href="/a-propos"
                className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
              >
                À propos
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Sous-composants
// ══════════════════════════════════════════════════════════════════════

function NavLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors ${className}`}
    >
      {label}
    </Link>
  );
}

function NavDropdown({
  label,
  open,
  onEnter,
  onLeave,
  linkClass,
  wide = false,
  children,
}: {
  label: string;
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
  linkClass: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        className={`px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors ${linkClass}`}
      >
        {label}
      </button>
      {open && (
        <div
          className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 ${
            wide ? "w-[720px]" : "w-[280px]"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MegaPanel({
  columns,
  footerHref,
  footerLabel,
}: {
  columns: MegaColumn[];
  footerHref: string;
  footerLabel: string;
}) {
  return (
    <div className="border border-[var(--color-beige-warm)] bg-[var(--color-cream)] shadow-[var(--shadow-luxe)]">
      <div className="grid grid-cols-3 divide-x divide-[var(--color-beige-warm)]">
        {columns.map((col) => (
          <div key={col.heading} className="p-6">
            <div className="text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
              {col.heading}
            </div>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link
        href={footerHref}
        className="block border-t border-[var(--color-beige-warm)] bg-white px-6 py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
      >
        {footerLabel} →
      </Link>
    </div>
  );
}

function SimplePanel({
  links,
  footerHref,
  footerLabel,
}: {
  links: { href: string; label: string }[];
  footerHref: string;
  footerLabel: string;
}) {
  return (
    <div className="border border-[var(--color-beige-warm)] bg-[var(--color-cream)] shadow-[var(--shadow-luxe)]">
      <ul className="p-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block px-4 py-2.5 text-[13px] text-[var(--color-charcoal)] transition-colors hover:bg-white hover:text-[var(--color-terracotta)]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={footerHref}
        className="block border-t border-[var(--color-beige-warm)] bg-white px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
      >
        {footerLabel} →
      </Link>
    </div>
  );
}

function MobileSection({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="mb-6 border-t border-[var(--color-beige-warm)] pt-6 first:border-t-0 first:pt-0">
      <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
        {heading}
      </div>
      <div className="flex flex-col gap-2.5">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="font-serif text-base text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
