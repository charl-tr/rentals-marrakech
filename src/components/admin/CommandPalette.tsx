"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Home,
  LayoutDashboard,
  ScrollText,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useKeyboard } from "@/lib/hooks/useKeyboard";
import Kbd from "./_primitives/Kbd";

// ════════════════════════════════════════════════════════════════════
// CommandPalette — overlay cmd+K.
//
// Déclenché par cmd/ctrl+K, affiche une modal fuzzy-searchable avec :
// - Navigation admin (6 items)
// - Recent leads (fournis via props)
// - Recent biens (fournis via props)
//
// Navigation clavier 100% : arrow up/down, enter, escape.
// ════════════════════════════════════════════════════════════════════

interface LeadItem {
  id: string;
  name: string;
  status: string;
}

interface PropertyItem {
  slug: string;
  title: string;
  reference: string;
}

interface AdvisorItem {
  slug: string;
  name: string;
}

export interface CommandPaletteData {
  leads: LeadItem[];
  properties: PropertyItem[];
  advisors: AdvisorItem[];
}

const NAV_ITEMS: {
  href: string;
  label: string;
  group: string;
  icon: React.ElementType;
}[] = [
  { href: "/admin", label: "Tableau de bord", group: "Navigation", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", group: "Navigation", icon: Users },
  { href: "/admin/biens", label: "Biens", group: "Navigation", icon: Home },
  { href: "/admin/equipe", label: "Équipe", group: "Navigation", icon: Users },
  { href: "/admin/matching", label: "Matching", group: "Navigation", icon: Sparkles },
  { href: "/", label: "Retour au site public", group: "Navigation", icon: ArrowRight },
];

interface Item {
  kind: "nav" | "lead" | "property" | "advisor";
  group: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ElementType;
}

export default function CommandPalette({ data }: { data: CommandPaletteData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // cmd+K → toggle + reset au passage à open=true
  const togglePalette = () => {
    setOpen((prev) => {
      if (!prev) {
        // On passe à open — reset local state avant le render (evite warnings lint)
        setQuery("");
        setActiveIdx(0);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
      return !prev;
    });
  };
  useKeyboard("k", togglePalette, { mod: true, allowInInput: true });

  // Escape → close
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  // Compile items (tous + filtrés par query)
  const items = useMemo<Item[]>(() => {
    const all: Item[] = [
      ...NAV_ITEMS.map((n) => ({
        kind: "nav" as const,
        group: n.group,
        label: n.label,
        href: n.href,
        icon: n.icon,
      })),
      ...data.leads.map((l) => ({
        kind: "lead" as const,
        group: "Leads récents",
        label: l.name,
        sublabel: l.status,
        href: `/admin/leads/${l.id}`,
        icon: Users,
      })),
      ...data.properties.map((p) => ({
        kind: "property" as const,
        group: "Biens",
        label: p.title,
        sublabel: `Réf. ${p.reference}`,
        href: `/admin/biens/${p.slug}`,
        icon: Home,
      })),
      ...data.advisors.map((a) => ({
        kind: "advisor" as const,
        group: "Équipe",
        label: a.name,
        href: `/admin/equipe/${a.slug}`,
        icon: ScrollText,
      })),
    ];

    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.sublabel ?? "").toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q)
    );
  }, [query, data]);

  // Nav clavier dans la liste
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[activeIdx];
        if (item) {
          setOpen(false);
          router.push(item.href);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, activeIdx, router]);

  // Scroll l'item actif en vue
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-cmd-idx="${activeIdx}"]`
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!open) return null;

  // Group items
  const grouped: Record<string, { items: Item[]; startIdx: number }> = {};
  let globalIdx = 0;
  for (const it of items) {
    if (!grouped[it.group]) {
      grouped[it.group] = { items: [], startIdx: globalIdx };
    }
    grouped[it.group].items.push(it);
    globalIdx++;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[var(--color-charcoal)]/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[16px] border border-[var(--color-beige-warm)] bg-white shadow-[var(--shadow-luxe)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-beige-warm)] px-4 py-3.5">
          <Search size={16} className="text-[var(--color-stone)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            placeholder="Tape pour chercher — lead, bien, conseiller, navigation…"
            className="flex-1 bg-transparent text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-stone-soft)] focus:outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto"
        >
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--color-stone)]">
              Aucun résultat.
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, { items: groupItems, startIdx }]) => (
              <div key={groupName}>
                <div className="px-4 pb-1.5 pt-3 text-[9px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  {groupName}
                </div>
                {groupItems.map((item, i) => {
                  const idx = startIdx + i;
                  const Icon = item.icon;
                  const active = idx === activeIdx;
                  return (
                    <Link
                      key={`${item.kind}-${idx}`}
                      href={item.href}
                      data-cmd-idx={idx}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-[var(--color-cream)] text-[var(--color-charcoal)]"
                          : "text-[var(--color-charcoal)]"
                      }`}
                    >
                      <Icon
                        size={14}
                        className={
                          active
                            ? "text-[var(--color-terracotta)]"
                            : "text-[var(--color-stone)]"
                        }
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.sublabel && (
                        <span className="text-xs text-[var(--color-stone)]">
                          {item.sublabel}
                        </span>
                      )}
                      {active && (
                        <Kbd className="ml-2">↵</Kbd>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-4 py-2 text-[10px] text-[var(--color-stone)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              ouvrir
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd>
              fermer
            </span>
          </div>
          <span>{items.length} résultat{items.length > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
