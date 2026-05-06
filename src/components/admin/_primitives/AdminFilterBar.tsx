"use client";

// ════════════════════════════════════════════════════════════════════
// AdminFilterBar — primitive composable pour toute barre de filtres admin.
//
// Remplace LeadsFilterBar + BiensFilterBar + (futurs) EquipeFilterBar etc.
// URL-driven (router.replace), debounce recherche, reset automatique.
//
// Usage :
//   <AdminFilterBar>
//     <AdminFilterBar.Tabs param="intent" tabs={[...]} counts={...} />
//     <AdminFilterBar.Row>
//       <AdminFilterBar.Search placeholder="..." />
//       <AdminFilterBar.Toggle param="scope" options={[...]} />
//       <AdminFilterBar.Toggle param="view" options={[...]} icons />
//     </AdminFilterBar.Row>
//     <AdminFilterBar.Pills>
//       <AdminFilterBar.Pill param="status" label="Statut" options={...} />
//       <AdminFilterBar.Reset preserve={["view", "scope"]} />
//     </AdminFilterBar.Pills>
//   </AdminFilterBar>
// ════════════════════════════════════════════════════════════════════

import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { Search, X } from "lucide-react";

// ── Wrapper ─────────────────────────────────────────────────────────

function AdminFilterBarRoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col border-b border-[var(--color-beige-warm)] bg-white">
      {children}
    </div>
  );
}

// ── Ligne horizontale (search + toggles) ───────────────────────────

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4 md:px-8">
      {children}
    </div>
  );
}

// ── Pills container (2e ligne) ──────────────────────────────────────

function Pills({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-beige-warm)] px-5 py-3 md:px-8">
      {children}
    </div>
  );
}

// ── Hook partagé : setParam URL-driven ─────────────────────────────

function useSetParam() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  return function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "" || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  };
}

function useCurrentParam(key: string): string | null {
  const params = useSearchParams();
  return params.get(key);
}

// ── Search input ──────────────────────────────────────────────────

function SearchInput({
  placeholder = "Rechercher…",
  paramKey = "q",
  debounceMs = 250,
}: {
  placeholder?: string;
  paramKey?: string;
  debounceMs?: number;
}) {
  const setParam = useSetParam();
  const currentValue = useCurrentParam(paramKey) ?? "";

  return (
    <div className="relative flex-1 min-w-[220px] max-w-md">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-stone)]"
      />
      <input
        type="search"
        placeholder={placeholder}
        defaultValue={currentValue}
        onChange={(e) => {
          const v = e.target.value;
          const target = e.target;
          setTimeout(() => {
            if (target.value === v) setParam(paramKey, v);
          }, debounceMs);
        }}
        className="w-full border border-[var(--color-beige-warm)] bg-[var(--color-cream)] py-2 pl-9 pr-3 text-sm focus:border-[var(--color-charcoal)] focus:bg-white focus:outline-none"
      />
    </div>
  );
}

// ── Toggle (mini boutons inline, ex Scope, View) ───────────────────

interface ToggleOption<T extends string | null> {
  value: T;
  label?: string;
  icon?: ReactNode;
  title?: string;
}

function Toggle<T extends string | null>({
  param,
  options,
  defaultValue,
  iconOnly = false,
}: {
  param: string;
  options: ToggleOption<T>[];
  defaultValue: T;
  iconOnly?: boolean;
}) {
  const setParam = useSetParam();
  const current = (useCurrentParam(param) ?? defaultValue) as T;

  return (
    <div className="flex border border-[var(--color-beige-warm)] bg-white">
      {options.map((opt, i) => {
        const active = current === opt.value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => setParam(param, opt.value)}
            title={opt.title ?? opt.label}
            aria-label={opt.title ?? opt.label}
            className={`${
              iconOnly ? "flex h-8 w-8 items-center justify-center" : "px-3 py-1.5"
            } ${
              i > 0 ? "border-l border-[var(--color-beige-warm)]" : ""
            } text-[10px] font-medium uppercase tracking-[0.22em] transition-colors ${
              active
                ? "bg-[var(--color-charcoal)] text-white"
                : "text-[var(--color-charcoal)] hover:bg-[var(--color-cream)]"
            }`}
          >
            {opt.icon}
            {!iconOnly && opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Pill dropdown (select stylisé) ────────────────────────────────

interface PillOption {
  value: string | null;
  label: string;
}

function Pill({
  param,
  label,
  options,
}: {
  param: string;
  label: string;
  options: PillOption[];
}) {
  const setParam = useSetParam();
  const current = useCurrentParam(param);
  const isActive = current !== null;

  return (
    <div className="relative inline-block">
      <select
        value={current ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          setParam(param, v === "" ? null : v);
        }}
        className={`appearance-none border px-3 py-1.5 pr-7 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors focus:outline-none ${
          isActive
            ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white"
            : "border-[var(--color-beige-warm)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
        }`}
      >
        {options.map((o, i) => (
          <option key={i} value={o.value ?? ""}>
            {i === 0 ? o.label : `${label} · ${o.label}`}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] ${
          isActive ? "text-white" : "text-[var(--color-stone)]"
        }`}
      >
        ▾
      </span>
    </div>
  );
}

// ── Tabs métier (Intent, Segment...) avec compteurs ───────────────

interface Tab {
  value: string | null;
  label: string;
  count?: number;
}

function Tabs({
  param,
  tabs,
}: {
  param: string;
  tabs: Tab[];
}) {
  const setParam = useSetParam();
  const current = useCurrentParam(param);

  return (
    <nav className="flex overflow-x-auto border-b border-[var(--color-beige-warm)] px-5 md:px-8">
      {tabs.map((tab) => {
        const active = current === tab.value || (current === null && tab.value === null);
        return (
          <button
            key={tab.value ?? "__all"}
            type="button"
            onClick={() => setParam(param, tab.value)}
            className={`relative flex items-baseline gap-1.5 whitespace-nowrap px-4 py-3 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors ${
              active
                ? "text-[var(--color-charcoal)]"
                : "text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] ${
                  active ? "text-[var(--color-terracotta)]" : "text-[var(--color-stone-soft)]"
                }`}
              >
                {tab.count}
              </span>
            )}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-0.5 bg-[var(--color-terracotta)]"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ── Reset — efface tout sauf les params préservés ─────────────────

function Reset({ preserve = [] }: { preserve?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  // Affiche le bouton seulement si au moins un param non-préservé est présent
  const hasActive = Array.from(params.entries()).some(
    ([k]) => !preserve.includes(k)
  );
  if (!hasActive) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const next = new URLSearchParams();
        for (const key of preserve) {
          const v = params.get(key);
          if (v !== null) next.set(key, v);
        }
        startTransition(() => {
          router.replace(`${pathname}?${next.toString()}`);
        });
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-terracotta)]"
    >
      <X size={11} />
      Réinitialiser
    </button>
  );
}

// ── Spacer (pour pousser les éléments suivants à droite) ──────────

function Spacer() {
  return <div className="flex-1" />;
}

// ── Export composite ──────────────────────────────────────────────

export const AdminFilterBar = Object.assign(AdminFilterBarRoot, {
  Row,
  Pills,
  Tabs,
  Search: SearchInput,
  Toggle,
  Pill,
  Reset,
  Spacer,
});

export default AdminFilterBar;
