"use client";

import Link from "next/link";
import { GitCompare } from "lucide-react";
import { useCompareList } from "@/hooks/useCompareList";

// Dock flottant bottom-right : apparaît dès qu'il y a au moins 1 bien
// dans le comparateur. Propose d'aller sur /comparer.

export default function CompareFloatingDock() {
  const { count, hydrated, max } = useCompareList();

  if (!hydrated || count === 0) return null;

  return (
    <Link
      href="/comparer"
      className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-5 py-3.5 text-white shadow-[var(--shadow-luxe)] transition-transform hover:-translate-y-0.5"
    >
      <GitCompare size={16} />
      <div className="text-left">
        <div className="text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
          Comparateur
        </div>
        <div className="text-sm">
          {count} bien{count > 1 ? "s" : ""}{" "}
          <span className="text-white/50">· voir →</span>
        </div>
      </div>
    </Link>
  );
}
