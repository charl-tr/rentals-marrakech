"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mr:favorites";
const EVENT_NAME = "mr:favorites:change";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(list: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  // Sync across tabs + hooks on same page
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setHydrated(true);

    const onChange = (e: Event) => {
      const custom = e as CustomEvent<string[]>;
      setFavorites(custom.detail ?? readFavorites());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavorites(readFavorites());
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const has = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const toggle = useCallback((slug: string) => {
    const current = readFavorites();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [slug, ...current];
    writeFavorites(next);
  }, []);

  const remove = useCallback((slug: string) => {
    const current = readFavorites();
    writeFavorites(current.filter((s) => s !== slug));
  }, []);

  return {
    favorites,
    count: favorites.length,
    has,
    toggle,
    remove,
    hydrated,
  };
}
