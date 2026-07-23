"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  detectCountry,
  formatNational,
  type CountryPhone,
} from "@/lib/phone-format";

interface Props {
  /** Valeur complète stockée par le parent, ex. "+33612345678" ou "". */
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const PhoneField = forwardRef<HTMLInputElement, Props>(function PhoneField(
  { value, onChange, onKeyDown, placeholder },
  ref
) {
  const [country, setCountry] = useState<CountryPhone>(DEFAULT_COUNTRY);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const nationalDigits = value.startsWith(country.dial)
    ? value.slice(country.dial.length)
    : value.replace(/\D/g, "");

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleChange = (raw: string) => {
    // Un numéro international collé/tapé (+33…, 0033…) bascule le pays
    // automatiquement — plus intuitif que de forcer l'utilisateur à
    // sélectionner d'abord le bon indicatif.
    const trimmed = raw.trim();
    if (trimmed.startsWith("+") || trimmed.startsWith("00")) {
      const detected = detectCountry(trimmed);
      if (detected) {
        setCountry(detected.country);
        const digits = detected.nationalDigits
          .replace(/\D/g, "")
          .slice(0, detected.country.maxLength);
        onChange(digits ? `${detected.country.dial}${digits}` : "");
        return;
      }
    }
    const digits = raw.replace(/\D/g, "");
    const cleaned =
      digits.startsWith("0") && country.code !== "US" && country.code !== "CA"
        ? digits.slice(1)
        : digits;
    const capped = cleaned.slice(0, country.maxLength);
    onChange(capped ? `${country.dial}${capped}` : "");
  };

  const displayValue = formatNational(nationalDigits, country);

  return (
    <div ref={wrapRef} className="relative flex gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choisir l'indicatif pays"
        aria-expanded={open}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[14px] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="text-[13px] text-[var(--color-stone)]">{country.dial}</span>
        <ChevronDown size={13} className="text-[var(--color-stone)]" />
      </button>

      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className="field flex-1"
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 max-h-72 w-72 overflow-y-auto rounded-[14px] border border-[var(--color-border)] bg-white p-1.5 shadow-[var(--shadow-luxe)]">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCountry(c);
                setOpen(false);
                onChange(
                  nationalDigits
                    ? `${c.dial}${nationalDigits.slice(0, c.maxLength)}`
                    : ""
                );
              }}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[13px] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-charcoal)]"
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-[var(--color-stone)]">{c.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default PhoneField;
