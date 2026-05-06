"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import type { PropertyPin } from "@/lib/db";

// ── Constants ─────────────────────────────────────────────────────────────────
const CLUSTER_THRESHOLD = 13;   // below this zoom → clusters
const GOLDEN_ANGLE = 2.399963;  // ≈ 137.5° — Fibonacci/sunflower spiral

// ── Cluster logic ─────────────────────────────────────────────────────────────
type Cluster = {
  key: string;
  pins: PropertyPin[];
  center: { lat: number; lng: number };
};

function clusterPins(
  pins: PropertyPin[],
  zoom: number
): { clusters: Cluster[]; singles: PropertyPin[] } {
  if (zoom >= CLUSTER_THRESHOLD) return { clusters: [], singles: pins };

  const cellDeg = 0.025 * Math.pow(2, 12 - zoom);
  const groups = new Map<string, PropertyPin[]>();

  for (const pin of pins) {
    const key = `${Math.floor(pin.coordinates.lat / cellDeg)},${Math.floor(
      pin.coordinates.lng / cellDeg
    )}`;
    const arr = groups.get(key) ?? [];
    arr.push(pin);
    groups.set(key, arr);
  }

  const clusters: Cluster[] = [];
  const singles: PropertyPin[] = [];

  for (const [key, group] of groups) {
    if (group.length === 1) {
      singles.push(group[0]);
    } else {
      clusters.push({
        key,
        pins: group,
        center: {
          lat: group.reduce((s, p) => s + p.coordinates.lat, 0) / group.length,
          lng: group.reduce((s, p) => s + p.coordinates.lng, 0) / group.length,
        },
      });
    }
  }

  return { clusters, singles };
}

// ── Golden-angle spread (sunflower pattern — no cross, no grid) ───────────────
function spreadPins(pins: PropertyPin[]): PropertyPin[] {
  // Group pins that share the same base coordinate
  const groups = new Map<string, PropertyPin[]>();
  for (const pin of pins) {
    const key = `${pin.coordinates.lat.toFixed(4)},${pin.coordinates.lng.toFixed(4)}`;
    const arr = groups.get(key) ?? [];
    arr.push(pin);
    groups.set(key, arr);
  }

  const result: PropertyPin[] = [];
  for (const group of groups.values()) {
    group.forEach((pin, idx) => {
      if (idx === 0) {
        result.push(pin);
        return;
      }
      // Fibonacci spiral: r grows with sqrt(idx), angle by golden ratio
      const r = 0.00075 * Math.sqrt(idx);
      const theta = idx * GOLDEN_ANGLE;
      result.push({
        ...pin,
        coordinates: {
          lat: pin.coordinates.lat + r * Math.cos(theta),
          lng: pin.coordinates.lng + r * Math.sin(theta) * 1.35,
        },
      });
    });
  }
  return result;
}

// ── Cluster badge ─────────────────────────────────────────────────────────────
function makeClusterBadge(count: number) {
  const inner = count > 30 ? 50 : count > 10 ? 42 : 34;
  const outer = inner + 14;
  const fontSize = count > 30 ? 15 : count > 10 ? 13 : 12;
  return L.divIcon({
    html: `
      <div style="
        position:relative;
        width:${outer}px;height:${outer}px;
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="
          position:absolute;inset:0;
          border-radius:50%;
          background:rgba(28,24,21,0.12);
          animation:pulse 2s ease-in-out infinite;
        "></div>
        <div style="
          position:relative;
          width:${inner}px;height:${inner}px;
          border-radius:50%;
          background:#1c1815;
          color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:${fontSize}px;font-weight:600;
          font-family:-apple-system,sans-serif;
          box-shadow:0 3px 16px rgba(0,0,0,0.28);
          cursor:pointer;
        ">${count}</div>
      </div>
      <style>
        @keyframes pulse {
          0%,100%{transform:scale(1);opacity:.6}
          50%{transform:scale(1.25);opacity:0}
        }
      </style>`,
    className: "",
    iconSize: [outer, outer] as L.PointExpression,
    iconAnchor: [outer / 2, outer / 2] as L.PointExpression,
  });
}

// ── Price-badge marker ────────────────────────────────────────────────────────
function makeBadge(pin: PropertyPin, state: "default" | "hover" | "active") {
  const isVente = pin.listing === "vente" || pin.type === "programme-neuf";
  const price =
    pin.price >= 1_000_000
      ? `${(pin.price / 1_000_000).toFixed(pin.price % 1_000_000 === 0 ? 0 : 1)}M`
      : pin.price >= 1_000
      ? `${Math.round(pin.price / 1_000)}k`
      : String(pin.price);

  const base  = isVente ? "#b8694f" : "#4e6e62";
  const dark  = isVente ? "#9a5438" : "#3a5a4e";
  const black = "#1c1815";

  const bg     = state === "active" ? black : state === "hover" ? dark : base;
  const scale  = state === "active" ? 1.22 : state === "hover" ? 1.1 : 1;
  const shadow =
    state === "active"
      ? "0 6px 20px rgba(0,0,0,0.4),0 2px 6px rgba(0,0,0,0.2)"
      : state === "hover"
      ? "0 4px 12px rgba(0,0,0,0.28)"
      : "0 1px 5px rgba(0,0,0,0.2)";

  const tip = `<span style="
    position:absolute;bottom:-4px;left:50%;
    transform:translateX(-50%);
    width:0;height:0;
    border-left:4px solid transparent;
    border-right:4px solid transparent;
    border-top:4px solid ${bg};
  "></span>`;

  return L.divIcon({
    html: `<span style="
      position:relative;display:inline-block;
      background:${bg};color:#fff;
      padding:4px 7px;
      font:600 10px/1 -apple-system,sans-serif;
      letter-spacing:.03em;white-space:nowrap;
      border-radius:2px;
      transform:scale(${scale});transform-origin:center bottom;
      transition:transform .18s cubic-bezier(.34,1.56,.64,1),background .14s,box-shadow .14s;
      box-shadow:${shadow};cursor:pointer;
    ">${price}€${pin.priceUnit ? `<span style="font-size:8px;opacity:.65">/${pin.priceUnit}</span>` : ""}${tip}</span>`,
    className: "",
    iconSize: undefined as unknown as L.PointExpression,
    iconAnchor: [0, 0],
  });
}

// ── Fly to active pin ─────────────────────────────────────────────────────────
function FlyToActive({ pins, activeSlug }: { pins: PropertyPin[]; activeSlug: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!activeSlug) return;
    const pin = pins.find((p) => p.slug === activeSlug);
    if (!pin) return;
    // Zoom to 14 so the golden-angle spread around the pin is visible
    const targetZoom = Math.max(map.getZoom(), 14);
    map.flyTo([pin.coordinates.lat, pin.coordinates.lng], targetZoom, {
      animate: true,
      duration: 0.85,
      easeLinearity: 0.08,
    });
  }, [activeSlug]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ── Fit bounds on filter change ───────────────────────────────────────────────
function FitBounds({ pins, filterKey }: { pins: PropertyPin[]; filterKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (!pins.length) return;
    const bounds = L.latLngBounds(pins.map((p) => [p.coordinates.lat, p.coordinates.lng]));
    map.flyToBounds(bounds, { padding: [64, 64], maxZoom: 12, duration: 0.75, easeLinearity: 0.08 });
  }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ── Single pin marker ─────────────────────────────────────────────────────────
function PinMarker({
  pin, state, onClick, onHover, onLeave,
}: {
  pin: PropertyPin;
  state: "default" | "hover" | "active";
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const icon = useMemo(() => makeBadge(pin, state), [pin, state]);
  return (
    <Marker
      position={[pin.coordinates.lat, pin.coordinates.lng]}
      icon={icon}
      eventHandlers={{ click: onClick, mouseover: onHover, mouseout: onLeave }}
    />
  );
}

// ── Map click (tap on blank area) ────────────────────────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick?: () => void }) {
  useMapEvents({ click: () => onMapClick?.() });
  return null;
}

// ── Zoom-aware cluster + pin layer ────────────────────────────────────────────
function ClusterLayer({
  pins, activeSlug, hoveredSlug, onPinClick, onPinHover, onPinLeave,
}: {
  pins: PropertyPin[];
  activeSlug: string | null;
  hoveredSlug: string | null;
  onPinClick: (slug: string) => void;
  onPinHover: (slug: string) => void;
  onPinLeave: () => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const { clusters, singles } = useMemo(() => clusterPins(pins, zoom), [pins, zoom]);
  const spread = useMemo(() => spreadPins(singles), [singles]);

  return (
    <>
      {clusters.map((c) => (
        <Marker
          key={c.key}
          position={[c.center.lat, c.center.lng]}
          icon={makeClusterBadge(c.pins.length)}
          eventHandlers={{
            click: () => {
              // Fly to the actual bounds of this cluster's pins
              const bounds = L.latLngBounds(
                c.pins.map((p) => [p.coordinates.lat, p.coordinates.lng])
              );
              map.flyToBounds(bounds, {
                padding: [80, 80],
                maxZoom: CLUSTER_THRESHOLD,
                duration: 0.85,
                easeLinearity: 0.08,
              });
            },
          }}
        />
      ))}

      {spread.map((pin) => (
        <PinMarker
          key={pin.slug}
          pin={pin}
          state={
            activeSlug === pin.slug ? "active" : hoveredSlug === pin.slug ? "hover" : "default"
          }
          onClick={() => onPinClick(pin.slug)}
          onHover={() => onPinHover(pin.slug)}
          onLeave={onPinLeave}
        />
      ))}
    </>
  );
}

// ── Custom zoom controls ──────────────────────────────────────────────────────
function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: 28, marginRight: 16 }}>
      <div className="flex flex-col gap-1">
        {[
          { label: "+", fn: () => map.zoomIn() },
          { label: "−", fn: () => map.zoomOut() },
        ].map(({ label, fn }) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            aria-label={label === "+" ? "Zoomer" : "Dézoomer"}
            className="flex h-9 w-9 items-center justify-center border border-[var(--color-beige-warm)] bg-white font-serif text-lg leading-none text-[var(--color-charcoal)] shadow-md transition-colors hover:bg-[var(--color-cream)]"
            style={{ outline: "none" }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MapView ───────────────────────────────────────────────────────────────────
export default function MapView({
  pins, filterKey, activeSlug, hoveredSlug, onPinClick, onPinHover, onPinLeave, onMapClick,
}: {
  pins: PropertyPin[];
  filterKey: string;
  activeSlug: string | null;
  hoveredSlug: string | null;
  onPinClick: (slug: string) => void;
  onPinHover: (slug: string) => void;
  onPinLeave: () => void;
  onMapClick?: () => void;
}) {
  return (
    <MapContainer
      center={[31.63, -7.99]}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <FitBounds pins={pins} filterKey={filterKey} />
      <FlyToActive pins={pins} activeSlug={activeSlug} />
      <CustomZoomControl />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      <ClusterLayer
        pins={pins}
        activeSlug={activeSlug}
        hoveredSlug={hoveredSlug}
        onPinClick={onPinClick}
        onPinHover={onPinHover}
        onPinLeave={onPinLeave}
      />
    </MapContainer>
  );
}
