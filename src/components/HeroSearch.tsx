"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { languagePath } from "@/lib/i18n/routes";
import { useCurrency } from "@/hooks/useCurrency";
import { budgetLabel } from "@/lib/fx";
import { saleBudgets } from "@/lib/i18n/catalogue";

// ════════════════════════════════════════════════════════════════════
// HeroSearch — barre de recherche du hero avec dropdowns custom.
// Dropdowns qui s'ouvrent VERS LE HAUT (jamais tronqués), angles doux.
// ════════════════════════════════════════════════════════════════════

export type HeroSearchOption = { value: string; label: string };


export default function HeroSearch({
  typeOptions,
  zoneOptions,
  resultCount,
  locale = "fr",
}: {
  typeOptions: HeroSearchOption[];
  zoneOptions: HeroSearchOption[];
  resultCount: number;
  locale?: "fr" | "en";
}) {
  const en = locale === "en";
  const { currency, rates } = useCurrency();
  const router = useRouter();
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [budget, setBudget] = useState("");
  const [step, setStep] = useState(0);
  const [openKey, setOpenKey] = useState<string | null>(null);

  function submit() {
    const params = new URLSearchParams();
    if (type && type !== "programme-neuf") params.set("type", type);
    if (zone) params.set("quartier", zone);
    if (budget) params.set("budget", budget);
    const qs = params.toString();
    const base = type === "programme-neuf" ? "/acheter/programmes-neufs" : "/acheter";
    router.push(languagePath(qs ? `${base}?${qs}` : base, locale));
  }

  return (
    <div className="relative z-20 max-w-4xl animate-fade-up overflow-visible rounded-[16px] border border-white/15 bg-[rgba(23,20,15,0.42)] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="flex items-center gap-1 md:hidden">
        {step > 0 && <button type="button" aria-label={en ? "Previous filter" : "Filtre précédent"} onClick={() => { setStep(step - 1); setOpenKey(null); }} className="grid h-11 w-8 shrink-0 place-items-center rounded-lg text-white/80"><ArrowLeft size={16} /></button>}
        <Field
          className="min-w-0 flex-1"
          label={step === 0 ? en ? "Property type" : "Type de bien" : step === 1 ? en ? "Area" : "Quartier" : "Budget"}
          options={step === 0 ? [{ value: "", label: en ? "All properties" : "Tous les biens" }, ...typeOptions] : step === 1 ? [{ value: "", label: en ? "All areas" : "Tous les quartiers" }, ...zoneOptions] : [{ value: "", label: en ? "Any budget" : "Tous budgets" }, ...saleBudgets.map(b => ({ value: b.key, label: budgetLabel(b, currency, rates, locale) }))]}
          value={step === 0 ? type : step === 1 ? zone : budget}
          onChange={value => {
            if (step === 0) setType(value);
            else if (step === 1) setZone(value);
            else setBudget(value);
          }}
          open={openKey === "mobile"}
          onToggle={() => setOpenKey(openKey === "mobile" ? null : "mobile")}
          onClose={() => setOpenKey(null)}
        />

        <button type="button"
          aria-label={step === 2 ? en ? "Show properties" : "Voir les biens" : step === 0 ? en ? "Next: area" : "Suivant : quartier" : en ? "Next: budget" : "Suivant : budget"}
          onClick={() => { setOpenKey(null); if (step < 2) setStep(step + 1); else submit(); }}
          className="mr-2 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[var(--color-accent-deep)]">
          {step === 2 ? <Search size={20} /> : <ArrowRight size={20} />}
        </button>
        <span className="sr-only" aria-live="polite">{step + 1} / 3 · {resultCount} {en ? "properties before filtering" : "biens avant filtrage"}</span>
      </div>

      <div className="hidden grid-cols-[1fr_1fr_1fr_auto] md:grid">
        <Field
          label={en ? "Property type" : "Type de bien"}
          options={[{ value: "", label: en ? "All properties" : "Tous les biens" }, ...typeOptions]}
          value={type}
          onChange={setType}
          open={openKey === "type"}
          onToggle={() => setOpenKey((k) => (k === "type" ? null : "type"))}
          onClose={() => setOpenKey(null)}
          className="border-b border-white/10 md:border-b-0 md:border-r"
        />
        <Field
          label={en ? "Area" : "Quartier"}
          options={[{ value: "", label: en ? "All areas" : "Toutes les zones" }, ...zoneOptions]}
          value={zone}
          onChange={setZone}
          open={openKey === "zone"}
          onToggle={() => setOpenKey((k) => (k === "zone" ? null : "zone"))}
          onClose={() => setOpenKey(null)}
          className="border-b border-white/10 md:border-b-0 md:border-r"
        />
        <Field
          label="Budget"
          options={[{ value: "", label: en ? "Any budget" : "Tous budgets" }, ...saleBudgets.map((b) => ({ value: b.key, label: budgetLabel(b, currency, rates, locale) }))]}
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
          className="flex items-center justify-center gap-2 rounded-[10px] bg-white/10 px-8 py-5 text-sm font-medium uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-[var(--color-charcoal)]"
        >
          <Search size={15} />
          {en ? "Search" : "Rechercher"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  options,
  value,
  onChange,
  open,
  onToggle,
  onClose,
  className = "",
}: {
  label: string;
  options: HeroSearchOption[];
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
          className="animate-fade-in absolute bottom-full left-0 z-30 mb-2 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-[12px] border border-[var(--color-border)] bg-[var(--color-cream)] py-1 shadow-[var(--shadow-luxe)]"
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
                      ? "text-[var(--color-accent)]"
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
