"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import FavoriteCounter from "@/components/FavoriteCounter";
import CurrencySwitcher from "@/components/CurrencySwitcher";

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

const VENDRE_LINKS = [
  { href: "/deposer-un-bien", label: "Déposer un bien" },
  { href: "/estimer", label: "Estimation en ligne" },
  { href: "/marche", label: "Rapport marché" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<
    "acheter" | "louer" | "essaouira" | "vendre" | null
  >(null);
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

  // Texte : charcoal sur fond clair, blanc + ombre défensive sur image
  const textColor = solid
    ? "text-[var(--color-charcoal)]"
    : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]";
  // Filet : terracotta sur fond clair, blanc crisp sur image (max lisibilité)
  const underline = solid ? "bg-[var(--color-terracotta)]" : "bg-white";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? "border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      {/* Voile dégradé — garantit la lisibilité du nav blanc sur toute image */}
      {!solid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 via-black/15 to-transparent"
        />
      )}

      <div className="container-luxe relative flex h-14 items-center justify-between lg:h-16">
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
                : "brightness-0 invert drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
            }`}
          />
        </Link>

        <nav className="hidden items-center lg:flex">
          <NavDropdown
            label="Acheter"
            open={openMenu === "acheter"}
            onEnter={() => setOpenMenu("acheter")}
            onLeave={() => setOpenMenu(null)}
            textColor={textColor}
            underline={underline}
            align="left"
            width="w-[840px]"
          >
            <MegaPanel columns={ACHETER_MEGA} footerHref="/acheter" footerLabel="Tous les biens à vendre" />
          </NavDropdown>

          <NavDropdown
            label="Louer"
            open={openMenu === "louer"}
            onEnter={() => setOpenMenu("louer")}
            onLeave={() => setOpenMenu(null)}
            textColor={textColor}
            underline={underline}
          >
            <SimplePanel links={LOUER_LINKS} footerHref="/louer" footerLabel="Toutes les locations" />
          </NavDropdown>

          <NavDropdown
            label="Essaouira"
            open={openMenu === "essaouira"}
            onEnter={() => setOpenMenu("essaouira")}
            onLeave={() => setOpenMenu(null)}
            textColor={textColor}
            underline={underline}
          >
            <SimplePanel links={ESSAOUIRA_LINKS} footerHref="/essaouira" footerLabel="Bord de mer" />
          </NavDropdown>

          <NavDropdown
            label="Vendre"
            open={openMenu === "vendre"}
            onEnter={() => setOpenMenu("vendre")}
            onLeave={() => setOpenMenu(null)}
            textColor={textColor}
            underline={underline}
          >
            <SimplePanel links={VENDRE_LINKS} footerHref="/deposer-un-bien" footerLabel="Déposer un bien →" />
          </NavDropdown>

          <NavLink href="/journal" label="Journal" textColor={textColor} underline={underline} />
          <NavLink href="/contact" label="Contact" textColor={textColor} underline={underline} />

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

        <button
          onClick={() => setMobileOpen((s) => !s)}
          className={`lg:hidden ${solid ? "text-[var(--color-charcoal)]" : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"}`}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-[var(--color-beige-warm)] bg-[var(--color-cream)] lg:hidden">
          <div className="container-luxe py-6">
            <MobileSection heading="Acheter" links={ACHETER_MEGA.flatMap((c) => c.links)} />
            <MobileSection heading="Louer" links={LOUER_LINKS} />
            <MobileSection heading="Essaouira" links={ESSAOUIRA_LINKS} />
            <MobileSection heading="Vendre" links={VENDRE_LINKS} />

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-beige-warm)] pt-6">
              <Link href="/journal" className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">Journal</Link>
              <Link href="/contact" className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">Contact</Link>
              <Link href="/carte" className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">Vue carte</Link>
              <Link href="/marche" className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">Rapport marché</Link>
              <Link href="/favoris" className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">Mes favoris</Link>
              <Link href="/a-propos" className="font-serif text-xl text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">À propos</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Underline signature (Barnes/Aman) : texte crisp, filet qui croît ──
function Underline({ color, active }: { color: string; active: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-x-4 bottom-[0.35rem] h-px origin-center transition-transform duration-300 ease-out ${color} ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );
}

function NavLink({
  href,
  label,
  textColor,
  underline,
}: {
  href: string;
  label: string;
  textColor: string;
  underline: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] ${textColor}`}
    >
      {label}
      <Underline color={underline} active={false} />
    </Link>
  );
}

function NavDropdown({
  label,
  open,
  onEnter,
  onLeave,
  textColor,
  underline,
  align = "center",
  width = "w-[280px]",
  children,
}: {
  label: string;
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
  textColor: string;
  underline: string;
  align?: "center" | "left";
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        className={`group relative px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] ${textColor}`}
      >
        {label}
        <Underline color={underline} active={open} />
      </button>
      {open && (
        <div
          className={`absolute top-full pt-3 ${width} ${
            align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="animate-mega-in">{children}</div>
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
    <div className="overflow-hidden border border-white/40 bg-[rgba(250,248,244,0.78)] shadow-[var(--shadow-luxe)] backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-x-8 gap-y-2 p-8">
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
              {col.heading}
            </div>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
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
        className="block border-t border-white/40 bg-[rgba(242,237,228,0.6)] px-8 py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
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
    <div className="overflow-hidden border border-white/40 bg-[rgba(250,248,244,0.78)] shadow-[var(--shadow-luxe)] backdrop-blur-2xl">
      <ul className="p-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block px-4 py-2.5 text-[13px] text-[var(--color-charcoal)] transition-colors hover:bg-white/60 hover:text-[var(--color-terracotta)]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={footerHref}
        className="block border-t border-white/40 bg-[rgba(242,237,228,0.6)] px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
      >
        {footerLabel}
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
