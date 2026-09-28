"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, Heart } from "lucide-react";
import FavoriteCounter from "@/components/FavoriteCounter";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { languagePath } from "@/lib/i18n/routes";

const EN_LABELS: Record<string, string> = {
  Acheter: "Buy", Louer: "Rent", Vendre: "Sell", "Programmes neufs": "New developments",
  "Biens vendus": "Sold properties", "Riads rénovés": "Renovated riads", "Riads à rénover": "Riads to renovate",
  Autres: "Other properties", Appartements: "Apartments", "Maisons d'hôtes": "Guesthouses", Terrains: "Land", Commerces: "Commercial",
  Outils: "Tools", "Vue carte": "Map view", "Rapport marché": "Market report", "Estimation gratuite": "Property valuation", "Calculette de frais": "Buying costs calculator",
  "Locations saisonnières": "Holiday rentals", "Vente villa": "Villas for sale", "Vente riad": "Riads for sale", "Vente terrain": "Land for sale", "Location villa": "Villas to rent",
};

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
      { href: "/acheter/maison-hotes", label: "Maisons d'hôtes" },
      { href: "/acheter/terrain", label: "Terrains" },
      { href: "/acheter/autre", label: "Commerces" },
    ],
  },
  {
    heading: "Outils",
    links: [
      { href: "/biens-vendus", label: "Biens vendus" },
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


// Only the home photo uses an overlay. Interior pages share a legible sand header.

export default function Navbar({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const t = (label: string) => en ? EN_LABELS[label] ?? label : label;
  const href = (path: string) => languagePath(path, locale);
  const localLinks = (links: { href: string; label: string }[]) => links.map((link) => ({ href: href(link.href), label: t(link.label) }));
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<
    "acheter" | "louer" | "essaouira" | "vendre" | null
  >(null);
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "/en";
  const hasDarkTop = isHome;
  const solid = scrolled || mobileOpen || !hasDarkTop;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      setMobileOpen(false);
      setOpenMenu(null);
    }, 0);
    return () => window.clearTimeout(closeTimer);
  }, [pathname]);

  const textColor = solid
    ? "text-[var(--color-charcoal)]"
    : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]";
  const underline = solid ? "bg-[var(--color-accent)]" : "bg-white";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? "border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      {/* Voile dégradé — lisibilité du nav blanc sur toute image */}
      {!solid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 via-black/15 to-transparent"
        />
      )}

      <div className="container-luxe relative flex h-14 items-center justify-between lg:h-16">
        <Link href={href("/")} aria-label={en ? "Marrakech Realty — Home" : "Marrakech Realty — Accueil"} className="block">
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

        <nav className="hidden items-center xl:flex">
          <NavDropdown
            label={t("Acheter")}
            open={openMenu === "acheter"}
            onEnter={() => setOpenMenu("acheter")}
            onLeave={() => setOpenMenu(null)}
            textColor={textColor}
            underline={underline}
            align="left"
            width="w-[840px]"
          >
            <MegaPanel columns={ACHETER_MEGA.map((column) => ({ heading: t(column.heading), links: localLinks(column.links) }))} footerHref={href("/acheter")} footerLabel={en ? "All properties for sale" : "Tous les biens à vendre"} />
          </NavDropdown>

          <NavDropdown
            label={t("Louer")}
            open={openMenu === "louer"}
            onEnter={() => setOpenMenu("louer")}
            onLeave={() => setOpenMenu(null)}
            textColor={textColor}
            underline={underline}
          >
            <SimplePanel links={localLinks(LOUER_LINKS)} footerHref={href("/louer")} footerLabel={en ? "All rentals" : "Toutes les locations"} />
          </NavDropdown>

          <NavLink href={href("/acheter/programmes-neufs")} label={t("Programmes neufs")} textColor={textColor} underline={underline} />
          <NavDropdown
            label="Essaouira"
            open={openMenu === "essaouira"}
            onEnter={() => setOpenMenu("essaouira")}
            onLeave={() => setOpenMenu(null)}
            textColor={textColor}
            underline={underline}
          >
            <SimplePanel links={localLinks(ESSAOUIRA_LINKS)} footerHref={href("/essaouira")} footerLabel={en ? "By the sea" : "Bord de mer"} />
          </NavDropdown>

          <NavLink href={href("/deposer-un-bien")} label={t("Vendre")} textColor={textColor} underline={underline} />

          <NavLink href={href("/journal")} label="Journal" textColor={textColor} underline={underline} />
          <NavLink href={href("/contact")} label="Contact" textColor={textColor} underline={underline} />

          <span
            aria-hidden
            className={`mx-4 h-3 w-px ${solid ? "bg-[var(--color-border)]" : "bg-white/30"}`}
          />
          <FavoriteCounter locale={locale} variant={solid ? "dark" : "light"} />
          <span
            aria-hidden
            className={`mx-3 h-3 w-px ${solid ? "bg-[var(--color-border)]" : "bg-white/30"}`}
          />
          <CurrencySwitcher locale={locale} />
        </nav>

        <div className="flex shrink-0 items-center gap-3">
        <LanguageSwitcher light={!solid} />
        <button
          onClick={() => setMobileOpen((s) => !s)}
          className={`xl:hidden ${solid ? "text-[var(--color-charcoal)]" : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"}`}
          aria-label={en ? mobileOpen ? "Close menu" : "Open menu" : mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-[var(--color-border)] bg-[var(--color-bg-alt)] xl:hidden">
          <div className="container-luxe py-7">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <span className="text-xs text-[var(--color-stone)]">{en ? "Display currency · MAD always shown" : "Devise d’affichage · MAD toujours affiché"}</span>
              <CurrencySwitcher locale={locale} />
            </div>
            <nav aria-label={en ? "Mobile navigation" : "Navigation mobile"} className="space-y-1">
              {[
                ["/acheter", "Acheter"],
                ["/acheter/programmes-neufs", "Programmes neufs"],
                ["/biens-vendus", "Biens vendus"],
                ["/louer", "Louer"],
                ["/essaouira", "Essaouira"],
                ["/deposer-un-bien", "Vendre"],
                ["/journal", "Journal"],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  href={href(path)}
                  className="group flex items-center justify-between border-b border-[var(--color-border)] py-4 font-serif text-[1.65rem] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-accent)]"
                >
                  {t(label)}
                  <ChevronRight size={17} strokeWidth={1.4} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </nav>

            <div className="mt-7 grid gap-3">
              <Link href={href("/contact")} className="btn-primary w-full">
                {en ? "Talk to an advisor" : "Parler à un conseiller"}
              </Link>
              <Link href={href("/estimer")} className="btn-outline w-full">
                {en ? "Value my property" : "Estimer mon bien"}
              </Link>
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-[var(--color-border)] pt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-stone)]">
              <Link href={href("/favoris")} className="inline-flex items-center gap-2 transition-colors hover:text-[var(--color-accent)]">
                <Heart size={15} strokeWidth={1.5} /> {en ? "Saved properties" : "Mes favoris"}
              </Link>
              <Link href={href("/contact")} className="transition-colors hover:text-[var(--color-accent)]">Contact</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

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
    <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-luxe)] ring-1 ring-black/[0.03]">
      <div className="grid grid-cols-4 gap-x-6 gap-y-2 p-7">
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="px-3 text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--color-accent)]">
              {col.heading}
            </div>
            <ul className="mt-3 space-y-0.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group/item flex items-center justify-between rounded-[10px] px-3 py-2 text-[13px] text-[var(--color-ink-soft)] transition-colors duration-200 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-charcoal)]"
                  >
                    <span>{l.label}</span>
                    <ChevronRight
                      size={13}
                      className="-translate-x-1 text-[var(--color-accent)] opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link
        href={footerHref}
        className="flex items-center justify-center gap-1.5 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)] px-8 py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)] transition-colors duration-200 hover:bg-[var(--color-charcoal)] hover:text-white"
      >
        {footerLabel}
        <ChevronRight size={12} />
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
    <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-luxe)] ring-1 ring-black/[0.03]">
      <ul className="p-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group/item flex items-center justify-between rounded-[10px] px-3.5 py-2.5 text-[13px] text-[var(--color-ink-soft)] transition-colors duration-200 hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-charcoal)]"
            >
              <span>{l.label}</span>
              <ChevronRight
                size={13}
                className="-translate-x-1 text-[var(--color-accent)] opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={footerHref}
        className="flex items-center justify-center gap-1.5 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)] transition-colors duration-200 hover:bg-[var(--color-charcoal)] hover:text-white"
      >
        {footerLabel}
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}
