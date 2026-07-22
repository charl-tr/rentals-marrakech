"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Check } from "lucide-react";

// ════════════════════════════════════════════════════════════════════
// HeroSearch — barre de recherche du hero avec dropdowns custom.
//
// Pourquoi custom : les <select> natifs ouvrent un menu système qui se
// fait couper en bas de viewport (la barre est posée bas dans le hero).
// Nos dropdowns s'ouvrent VERS LE HAUT, restent dans la DA, et ne sont
// jamais tronqués.
// ════════════════════════════════════════════════════════════════════

type Opt = { value: string; label: string };

const TYPES: Opt[] = [
  { value: "", label: "Tous les biens" },
  { value: "riad-renove", label: "Riad rénové" },
  { value: "riad-a-renover", label: "Riad à rénover" },
  { value: "villa", label: "Villa" },
  { value: "appartement", label: "Appartement" },
  { value: "programme-neuf", label: "Programme neuf" },
  { value: "terrain", label: "Terrain" },
];

const ZONES: Opt[] = [
  { value: "", label: "Toutes les zones" },
  { value: "medina", label: "Médina" },
  { value: "palmeraie", label: "Palmeraie" },
  { value: "hivernage", label: "Hivernage" },
  { value: "gueliz", label: "Guéliz" },
  { value: "targa", label: "Targa" },
  { value: "amelkis", label: "Amelkis" },
  { value: "ourika", label: "Route de l'Ourika" },
  { value: "diabat", label: "Diabat (Essaouira)" },
];

const BUDGETS: Opt[] = [
  { value: "", label: "Tous budgets" },
  { value: "300", label: "Jusqu'à 300 000 €" },
  { value: "600", label: "300 000 € – 600 000 €" },
  { value: "1000", label: "600 000 € – 1 M€" },
  { value: "2000", label: "1 M€ – 2 M€" },
  { value: "high", label: "Plus de 2 M€" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [budget, setBudget] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  function submit() {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (zone) params.set("quartier", zone);
    if (budget) params.set("budget", budget);
    const qs = params.toString();
    router.push(qs ? `/acheter?${qs}` : "/acheter");
  }

  return (
    <div className="max-w-4xl animate-fade-up border border-white/15 bg-[rgba(23,20,15,0.42)] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_1fr_1fr_auto]">
        <Field
          id="type"
          label="Type de bien"
          options={TYPES}
          value={type}
          onChange={setType}
          open={openKey === "type"}
          onToggle={() => setOpenKey((k) => (k === "type" ? null : "type"))}
          onClose={() => setOpenKey(null)}
          className="border-b border-white/10 md:border-b-0 md:border-r"
        />
        <Field
          id="zone"
          label="Quartier"
          options={ZONES}
          value={zone}
          onChange={setZone}
          open={openKey === "zone"}
          onToggle={() => setOpenKey((k) => (k === "zone" ? null : "zone"))}
          onClose={() => setOpenKey(null)}
          className="border-b border-white/10 md:border-b-0 md:border-r"
        />
        <Field
          id="budget"
          label="Budget"
          options={BUDGETS}
          value={budget}
          onChange={setBudget}
          open={openKey === "budget"}
          onToggle={() => setOpenKey((k) => (k === "budget" ? null : "budget"))}
          onClose={() => setOpenKey(null)}
          className="border-b border-white/10 md:border-b-0 md:border-r"
        />
        <button
          type="button"
          onClick={submit}
          className="flex items-center justify-center gap-2 bg-white/10 px-8 py-5 text-sm font-medium uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-[var(--color-charcoal)]"
        >
          <Search size={15} />
          Rechercher
        </button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  options,
  value,
  onChange,
  open,
  onToggle,
  onClose,
  className = "",
}: {
  id: string;
  label: string;
  options: Opt[];
  value: string;
  onChange: (v: string) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full flex-col items-start px-4 py-4 text-left md:px-5 md:py-5"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
          {label}
        </span>
        <span className="mt-1 flex w-full items-center justify-between gap-2">
          <span
            className={`text-sm font-medium ${
              value ? "text-white" : "text-white/85"
            }`}
          >
            {selected.label}
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-white/50 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-fade-in absolute bottom-full left-0 z-30 mb-2 max-h-72 w-full min-w-[220px] overflow-y-auto border border-[var(--color-border)] bg-[var(--color-cream)] py-1 shadow-[var(--shadow-luxe)]"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value || "all"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(o.value);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-white ${
                    active
                      ? "text-[var(--color-terracotta)]"
                      : "text-[var(--color-charcoal)]"
                  }`}
                >
                  {o.label}
                  {active && <Check size={13} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
