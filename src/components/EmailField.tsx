"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

// Domaines les plus courants côté clientèle FR/international de l'agence.
const DOMAINS = [
  "gmail.com",
  "yahoo.fr",
  "yahoo.com",
  "hotmail.com",
  "hotmail.fr",
  "outlook.com",
  "outlook.fr",
  "icloud.com",
  "orange.fr",
  "free.fr",
  "wanadoo.fr",
  "laposte.net",
  "live.fr",
  "sfr.fr",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const EmailField = forwardRef<HTMLInputElement, Props>(function EmailField(
  { value, onChange, onKeyDown, placeholder, required },
  ref
) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const atIndex = value.indexOf("@");
  const localPart = atIndex >= 0 ? value.slice(0, atIndex) : value;
  const domainTyped = atIndex >= 0 ? value.slice(atIndex + 1) : null;

  const suggestions =
    domainTyped !== null && localPart.length > 0
      ? DOMAINS.filter((d) => d.startsWith(domainTyped) && d !== domainTyped).slice(0, 6)
      : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const applySuggestion = (domain: string) => {
    onChange(`${localPart}@${domain}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (open && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySuggestion(suggestions[activeIndex]);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={ref}
        type="email"
        className="field"
        placeholder={placeholder}
        required={required}
        autoComplete="email"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-full overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-luxe)]">
          {suggestions.map((d, i) => (
            <button
              key={d}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applySuggestion(d)}
              className={`flex w-full items-center px-4 py-2.5 text-left text-[13px] transition-colors ${
                i === activeIndex
                  ? "bg-[var(--color-bg-alt)] text-[var(--color-charcoal)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-bg-alt)]"
              }`}
            >
              <span className="text-[var(--color-ink-hint)]">{localPart}@</span>
              <span className="font-medium">{d}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default EmailField;
