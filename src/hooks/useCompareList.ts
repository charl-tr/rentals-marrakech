"use client";

import { useCallback, useEffect, useState } from "react";

// ════════════════════════════════════════════════════════════════════
// useCompareList — slugs à comparer (max 3), persisté en localStorage.
// Sync cross-onglet via storage event (même pattern que favoris).
// ════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "mr:compare";
const EVENT_NAME = "mr:compare:change";
const MAX_ITEMS = 3;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  if (typeof window === "undefined") return;
  const capped = list.slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: capped }));
}

export function useCompareList() {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);

    const onChange = (e: Event) => {
      const custom = e as CustomEvent<string[]>;
      setItems(custom.detail ?? read());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(read());
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const has = useCallback((slug: string) => items.includes(slug), [items]);

  const toggle = useCallback((slug: string) => {
    const current = read();
    if (current.includes(slug)) {
      write(current.filter((s) => s !== slug));
    } else {
      if (current.length >= MAX_ITEMS) {
        // Oust le plus ancien (position 0) pour insérer le nouveau
        write([...current.slice(1), slug]);
      } else {
        write([...current, slug]);
      }
    }
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, count: items.length, has, toggle, remove, clear, hydrated, max: MAX_ITEMS };
}
