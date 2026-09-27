"use client";

import { useCallback, useEffect, useState } from "react";
import { readSelection, writeSelection } from "@/lib/local-selection-storage";
import { toast } from "sonner";

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
    return readSelection(STORAGE_KEY, MAX_ITEMS);
  } catch {
    return [];
  }
}

function write(list: string[]) {
  if (typeof window === "undefined") return;
  const capped = list.slice(0, MAX_ITEMS);
  if (!writeSelection(STORAGE_KEY, capped, MAX_ITEMS)) toast("Comparaison conservée pour cette page uniquement", { id: "storage-unavailable" });
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
        return false;
      } else {
        write([...current, slug]);
      }
    }
    return true;
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, count: items.length, has, toggle, remove, clear, hydrated, max: MAX_ITEMS };
}
