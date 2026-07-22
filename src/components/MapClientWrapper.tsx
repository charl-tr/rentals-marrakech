"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import type { PropertyPin } from "@/lib/db";
import { formatPrice, propertyTypeLabel } from "@/data/properties";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-cream)]">
      <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-stone)]">
        Chargement…
      </span>
    </div>
  ),
});

// ── Viewport hook ─────────────────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true); // SSR-safe default
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const fn = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return isDesktop;
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

function fmt(pin: PropertyPin) {
  return formatPrice(pin.price, pin.listing, "EUR", pin.priceUnit ?? "semaine");
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
          className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors ${
            filter === f.value
              ? "bg-[var(--color-charcoal)] text-white"
              : "text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
          }`}
        >
          {f.label}
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
      className={`group relative flex cursor-pointer gap-3 border-b border-[var(--color-beige-warm)] p-3 transition-colors sm:p-4 ${
        active
          ? "bg-[var(--color-cream)]"
          : hovered
          ? "bg-[var(--color-cream)]/60"
          : "bg-white hover:bg-[var(--color-cream)]/40"
      }`}
    >
      {active && (
        <div className="absolute left-0 top-0 h-full w-0.5 bg-[var(--color-terracotta)]" />
      )}
      {/* Image */}
      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden bg-[var(--color-beige-warm)] sm:h-20 sm:w-24">
        {pin.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pin.image}
            alt={pin.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full" />
        )}
        <div
          className={`absolute left-0 top-0 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-white ${
            isVente(pin) ? "bg-[var(--color-accent)]" : "bg-[var(--color-success)]"
          }`}
        >
          {isVente(pin) ? "Achat" : "Location"}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--color-terracotta)] sm:text-[10px]">
            {propertyTypeLabel(pin.type)}
          </div>
          <div className="mt-0.5 truncate font-serif text-sm text-[var(--color-charcoal)]">
            {pin.title}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-medium text-[var(--color-charcoal)]">{fmt(pin)}</div>
            {pin.surface > 0 && (
              <div className="text-[10px] text-[var(--color-stone)]">
                {pin.surface} m²
                {pin.bedrooms > 0 && ` · ${pin.bedrooms} ch.`}
              </div>
            )}
          </div>
          <Link
            href={href}
            className="ml-2 shrink-0 border border-[var(--color-charcoal)] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            Voir
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
  const href = `/${isVente(pin) ? "acheter" : "louer"}/${pin.slug}`;
  return (
    <div className="absolute bottom-[76px] left-3 right-3 z-[450] flex animate-fade-in items-center gap-3 bg-white p-3 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
      {/* Image */}
      <div className="h-16 w-20 flex-shrink-0 overflow-hidden bg-[var(--color-beige-warm)]">
        {pin.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pin.image} alt={pin.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--color-terracotta)]">
          {propertyTypeLabel(pin.type)}
        </div>
        <div className="truncate font-serif text-sm text-[var(--color-charcoal)]">
          {pin.title}
        </div>
        <div className="mt-0.5 text-sm font-medium text-[var(--color-charcoal)]">
          {fmt(pin)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
        <Link
          href={href}
          className="bg-[var(--color-charcoal)] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white"
        >
          Voir
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
          aria-label={snap === "peek" ? "Voir la liste" : "Réduire"}
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
              aria-label="Réduire"
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
                Aucun bien pour ce filtre.
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
  return (
    <div
      className={`relative flex flex-col border-r border-[var(--color-beige-warm)] bg-white transition-[width] duration-300 ease-in-out ${
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
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]" />Achat
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />Location
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
            aria-label="Masquer le panneau"
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
            Aucun bien pour ce filtre.
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
export default function MapClientWrapper({ pins }: { pins: PropertyPin[] }) {
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
      <div className="relative h-full overflow-hidden">
        <MapView {...mapProps} />
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
    <div className="flex h-full">
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

      <div className="relative flex-1">
        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="absolute left-4 top-1/2 z-[500] -translate-y-1/2 flex items-center gap-1.5 border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-charcoal)] shadow-md transition-colors hover:bg-[var(--color-cream)]"
            aria-label="Afficher la liste"
          >
            <ChevronRight size={14} />
            Liste
          </button>
        )}
        <MapView {...mapProps} />
      </div>
    </div>
  );
}
