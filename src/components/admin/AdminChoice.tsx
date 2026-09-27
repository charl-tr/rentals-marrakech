"use client";
import { useRef } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function AdminChoice({ label, value, options, onChange, disabled = false }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; disabled?: boolean;
}) {
  const root = useRef<HTMLDetailsElement>(null);
  return <details ref={root} className="relative min-w-36" onKeyDown={(event) => { if (event.key === "Escape" && root.current) { root.current.open = false; root.current.querySelector("summary")?.focus(); } }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node) && root.current) root.current.open = false; }}>
    <summary aria-label={label} aria-disabled={disabled} onClick={(event) => { if (disabled) event.preventDefault(); }} className={`flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden ${disabled ? "opacity-50" : "hover:border-[#795238]"}`}>
      <span>{options.find((option) => option.value === value)?.label ?? label}</span><ChevronDown size={16} />
    </summary>
    <div className="absolute left-0 top-full z-40 mt-1 max-h-64 min-w-full overflow-auto rounded-xl border border-[var(--color-beige-warm)] bg-white p-1.5 shadow-xl" role="group" aria-label={label}>
      {options.map((option) => <button type="button" key={option.value} disabled={disabled} aria-pressed={option.value === value} onClick={() => { if (root.current) { root.current.open = false; root.current.querySelector("summary")?.focus(); } onChange(option.value); }} className={`flex min-h-10 w-full items-center justify-between gap-4 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${option.value === value ? "bg-[#f0e7dc] text-[#795238]" : "hover:bg-[#f7f4ee]"}`}>{option.label}{option.value === value && <Check size={14} />}</button>)}
    </div>
  </details>;
}
