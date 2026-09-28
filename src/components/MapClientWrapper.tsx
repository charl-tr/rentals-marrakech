"use client";

import { MapLocale, useMapLocale } from "./MapLocale";
import { languagePath, type Locale } from "@/lib/i18n/routes";
import { englishTypes } from "@/lib/i18n/english";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronRight, X } from "lucide-react";
import type { PropertyPin } from "@/lib/db";
import PriceDisplay from "./PriceDisplay";
import { propertyTypeLabel } from "@/data/properties";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-cream)]">
      <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-stone)]">
        …
      </span>
    </div>
  ),
});

// ── Viewport hook ─────────────────────────────────────────────────────────────
function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
    const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true
  );
}

type Filter = "all" | "vente" | "location";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "vente", label: "Achat" },
  { value: "location", label: "Location" },
];

function isVente(pin: PropertyPin) {
  return pin.listing === "vente" || pin.type === "programme-neuf";
}


// ── Shared filter tab strip ───────────────────────────────────────────────────
function FilterTabs({
  filter,
  onChange,
  count,
}: {
  filter: Filter;
  onChange: (f: Filter) => void;
  count: number;
}) {
  const locale = useMapLocale();
  const en = locale === "en";
  return (
    <div className="flex items-center gap-2">
      <span className="font-serif text-sm text-[var(--color-charcoal)]">
        {count}
      </span>
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={`rounded-[10px] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors ${
            filter === f.value
              ? "bg-[var(--color-accent-deep)] text-white shadow-[var(--shadow-soft)]"
              : "text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
          }`}
        >
          {en ? ({ all: "All", vente: "Buy", location: "Rent" }[f.value]) : f.label}
        </button>
      ))}
    </div>
  );
}

// ── Property card (shared desktop panel + mobile list) ────────────────────────
function PropertyCard({
  pin,
  active,
  hovered,
  onClick,
  onHover,
  onLeave,
}: {
  pin: PropertyPin;
  active: boolean;
  hovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const locale = useMapLocale();
  const en = locale === "en";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [active]);

  const href = `/${isVente(pin) ? "acheter" : "louer"}/${pin.slug}`;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative m-2 flex cursor-pointer gap-3 rounded-[14px] border border-transparent p-3 transition-[background-color,border-color,box-shadow] sm:p-4 ${
        active
          ? "border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] shadow-[var(--shadow-card)]"
          : hovered
          ? "border-[var(--color-border)] bg-[var(--color-cream)]"
          : "bg-white hover:border-[var(--color-border)] hover:bg-[var(--color-cream)]/70"
      }`}
    >
      {active && (
        <div className="absolute bottom-3 left-0 top-3 w-0.5 rounded-full bg-[var(--color-terracotta)]" />
      )}
      {/* Image */}
      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-beige-warm)] sm:h-20 sm:w-24">
        {pin.image ? (
          <Image
            src={pin.image}
            alt={en ? `${englishTypes[pin.type]} · ${pin.city}` : pin.title}
            fill
            sizes="96px"
            quality={50}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full" />
        )}
        <div
          className={`absolute left-1.5 top-1.5 rounded-[6px] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-white ${
            isVente(pin) ? "bg-[var(--color-accent)]" : "bg-[var(--color-success)]"
          }`}
        >
          {isVente(pin) ? (en ? "Buy" : "Achat") : (en ? "Rent" : "Location")}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--color-terracotta)] sm:text-[10px]">
            {en ? englishTypes[pin.type] : propertyTypeLabel(pin.type)}
          </div>
          <div className="mt-0.5 truncate font-serif text-sm text-[var(--color-charcoal)]">
            {en ? `${englishTypes[pin.type]} · ${pin.city}` : pin.title}
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-[var(--color-charcoal)]"><PriceDisplay locale={locale} priceEur={pin.price} priceMad={pin.priceMad} sourcePriceEur={pin.sourcePriceEur} sourcePriceMad={pin.sourcePriceMad} listing={pin.listing} priceUnit={pin.priceUnit} /></div>
            {pin.surface > 0 && (
              <div className="text-[10px] text-[var(--color-stone)]">
                {pin.surface} m²
                {pin.bedrooms > 0 && ` · ${pin.bedrooms} ${en ? "beds" : "ch."}`}
              </div>
            )}
          </div>
          <Link
            href={languagePath(href, locale)}
            className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-[10px] border border-[var(--color-border-strong)] px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {en ? "Discover" : "Découvrir"} <ChevronRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Mobile floating active card ───────────────────────────────────────────────
function MobileActiveCard({
  pin,
  onClose,
}: {
  pin: PropertyPin;
  onClose: () => void;
}) {
  const locale = useMapLocale();
  const en = locale === "en";
  const href = `/${isVente(pin) ? "acheter" : "louer"}/${pin.slug}`;
  return (
    <div className="absolute bottom-[84px] left-3 right-3 z-[450] flex animate-fade-in items-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-luxe)]">
      {/* Image */}
      <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-beige-warm)]">
        {pin.image ? (
          <Image
            src={pin.image}
            alt={en ? `${englishTypes[pin.type]} · ${pin.city}` : pin.title}
            width={80}
            height={64}
            quality={50}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--color-terracotta)]">
          {en ? englishTypes[pin.type] : propertyTypeLabel(pin.type)}
        </div>
        <div className="truncate font-serif text-sm text-[var(--color-charcoal)]">
          {en ? `${englishTypes[pin.type]} · ${pin.city}` : pin.title}
        </div>
        <div className="mt-0.5 text-sm font-medium text-[var(--color-charcoal)]">
          <PriceDisplay locale={locale} priceEur={pin.price} priceMad={pin.priceMad} sourcePriceEur={pin.sourcePriceEur} sourcePriceMad={pin.sourcePriceMad} listing={pin.listing} priceUnit={pin.priceUnit} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
          aria-label={en ? "Close" : "Fermer"}
        >
          <X size={14} />
        </button>
        <Link
          href={languagePath(href, locale)}
          className="inline-flex items-center gap-1 rounded-[10px] bg-[var(--color-accent-deep)] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white"
        >
          {en ? "Discover" : "Découvrir"} <ChevronRight size={11} />
        </Link>
      </div>
    </div>
  );
}

// ── Mobile bottom sheet ───────────────────────────────────────────────────────
type SheetSnap = "peek" | "list";

function MobileSheet({
  pins,
  filter,
  setFilter,
  activeSlug,
  setActiveSlug,
  hoveredSlug,
  setHoveredSlug,
}: {
  pins: PropertyPin[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  activeSlug: string | null;
  setActiveSlug: (s: string | null) => void;
  hoveredSlug: string | null;
  setHoveredSlug: (s: string | null) => void;
}) {
  const locale = useMapLocale();
  const en = locale === "en";
  const [snap, setSnap] = useState<SheetSnap>("peek");
  const dragRef = useRef({ startY: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    dragRef.current.startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = dragRef.current.startY - e.changedTouches[0].clientY;
    if (dy > 40) setSnap("list");
    else if (dy < -40) setSnap("peek");
  };

  const handleHandleTap = () => setSnap((s) => (s === "peek" ? "list" : "peek"));

  return (
    <>
      {/* Floating active card — only when peeking */}
      {activeSlug && snap === "peek" && (
        <MobileActiveCard
          pin={pins.find((p) => p.slug === activeSlug) ?? pins[0]}
          onClose={() => setActiveSlug(null)}
        />
      )}

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-[400] flex flex-col overflow-hidden bg-white transition-[height] duration-300 ease-in-out ${
          snap === "peek" ? "h-[72px]" : "h-[58dvh]"
        }`}
        style={{ borderRadius: "14px 14px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
      >
        {/* Drag handle */}
        <div
          className="flex touch-none cursor-grab flex-col items-center pb-2 pt-3 active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleHandleTap}
          role="button"
          aria-label={snap === "peek" ? (en ? "Show list" : "Voir la liste") : (en ? "Collapse" : "Réduire")}
        >
          <div className="h-1 w-10 rounded-full bg-[var(--color-beige-warm)]" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 pb-3">
          <FilterTabs
            filter={filter}
            count={pins.length}
            onChange={(f) => { setFilter(f); setActiveSlug(null); }}
          />
          {snap === "list" && (
            <button
              type="button"
              onClick={() => setSnap("peek")}
              className="ml-2 text-[var(--color-stone)]"
              aria-label={en ? "Collapse" : "Réduire"}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Card list — visible only when list snap */}
        {snap === "list" && (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {pins.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-[11px] text-[var(--color-stone)]">
                {en ? "No properties match this filter." : "Aucun bien pour ce filtre."}
              </div>
            ) : (
              pins.map((pin) => (
                <PropertyCard
                  key={pin.slug}
                  pin={pin}
                  active={activeSlug === pin.slug}
                  hovered={hoveredSlug === pin.slug}
                  onClick={() => setActiveSlug(activeSlug === pin.slug ? null : pin.slug)}
                  onHover={() => setHoveredSlug(pin.slug)}
                  onLeave={() => setHoveredSlug(null)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── Desktop side panel ────────────────────────────────────────────────────────
function DesktopPanel({
  pins,
  filter,
  setFilter,
  activeSlug,
  setActiveSlug,
  hoveredSlug,
  setHoveredSlug,
  open,
  onClose,
}: {
  pins: PropertyPin[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  activeSlug: string | null;
  setActiveSlug: (s: string | null) => void;
  hoveredSlug: string | null;
  setHoveredSlug: (s: string | null) => void;
  open: boolean;
  onClose: () => void;
}) {
  const locale = useMapLocale();
  const en = locale === "en";
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-[width] duration-300 ease-in-out ${
        open ? "w-[340px] xl:w-[380px]" : "w-0 overflow-hidden"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b border-[var(--color-beige-warm)] px-4 py-3 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      >
        <FilterTabs
          filter={filter}
          count={pins.length}
          onChange={(f) => { setFilter(f); setActiveSlug(null); }}
        />
        <div className="flex items-center gap-3">
          <div className="hidden flex-col gap-1 text-[10px] text-[var(--color-stone)] xl:flex">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]" />{en ? "Buy" : "Achat"}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />{en ? "Rent" : "Location"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
            aria-label={en ? "Hide panel" : "Masquer le panneau"}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Card list */}
      <div
        className={`flex-1 overflow-y-auto transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      >
        {pins.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[11px] text-[var(--color-stone)]">
            {en ? "No properties match this filter." : "Aucun bien pour ce filtre."}
          </div>
        ) : (
          pins.map((pin) => (
            <PropertyCard
              key={pin.slug}
              pin={pin}
              active={activeSlug === pin.slug}
              hovered={hoveredSlug === pin.slug}
              onClick={() => setActiveSlug(activeSlug === pin.slug ? null : pin.slug)}
              onHover={() => setHoveredSlug(pin.slug)}
              onLeave={() => setHoveredSlug(null)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MapClientWrapper({ pins, locale = "fr" }: { pins: PropertyPin[]; locale?: Locale }) {
  return <MapLocale.Provider value={locale}><MapContents pins={pins} /></MapLocale.Provider>;
}

function MapContents({ pins }: { pins: PropertyPin[] }) {
  const en = useMapLocale() === "en";
  const isDesktop = useIsDesktop();

  const [filter, setFilter] = useState<Filter>("all");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const visible = useMemo(
    () =>
      filter === "all"
        ? pins
        : filter === "vente"
        ? pins.filter(isVente)
        : pins.filter((p) => !isVente(p)),
    [pins, filter]
  );

  const handlePinClick = useCallback(
    (slug: string) => {
      setActiveSlug((s) => (s === slug ? null : slug));
      if (isDesktop) setPanelOpen(true);
    },
    [isDesktop]
  );

  const handlePinHover = useCallback((slug: string) => setHoveredSlug(slug), []);
  const handlePinLeave = useCallback(() => setHoveredSlug(null), []);
  const handleMapClick = useCallback(() => setActiveSlug(null), []);

  const mapProps = {
    pins: visible,
    filterKey: filter,
    activeSlug,
    hoveredSlug,
    onPinClick: handlePinClick,
    onPinHover: handlePinHover,
    onPinLeave: handlePinLeave,
    onMapClick: handleMapClick,
  };

  if (!isDesktop) {
    return (
      <div className="relative h-full overflow-hidden bg-[var(--color-cream)] p-2">
        <div className="h-full overflow-hidden rounded-[16px] border border-[var(--color-border)]">
          <MapView {...mapProps} />
        </div>
        <MobileSheet
          pins={visible}
          filter={filter}
          setFilter={setFilter}
          activeSlug={activeSlug}
          setActiveSlug={setActiveSlug}
          hoveredSlug={hoveredSlug}
          setHoveredSlug={setHoveredSlug}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-3 bg-[var(--color-cream)] p-3">
      <DesktopPanel
        pins={visible}
        filter={filter}
        setFilter={setFilter}
        activeSlug={activeSlug}
        setActiveSlug={setActiveSlug}
        hoveredSlug={hoveredSlug}
        setHoveredSlug={setHoveredSlug}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />

      <div className="relative flex-1 overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-[var(--shadow-card)]">
        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="absolute left-4 top-1/2 z-[500] -translate-y-1/2 flex items-center gap-1.5 rounded-[10px] border border-[var(--color-border-strong)] bg-white px-3 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-charcoal)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-cream)]"
            aria-label={en ? "Show list" : "Afficher la liste"}
          >
            <ChevronRight size={14} />
            {en ? "List" : "Liste"}
          </button>
        )}
        <MapView {...mapProps} />
      </div>
    </div>
  );
}
