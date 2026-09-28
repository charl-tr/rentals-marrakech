"use client";

import Link from "next/link";
import { GitCompare } from "lucide-react";
import { useCompareList } from "@/hooks/useCompareList";

// Dock flottant bottom-right : apparaît dès qu'il y a au moins 1 bien
// dans le comparateur. Propose d'aller sur /comparer.

export default function CompareFloatingDock({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const { count, hydrated } = useCompareList();

  if (!hydrated || count === 0) return null;

  return (
    <Link
      href={en ? "/en/compare" : "/comparer"}
      className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-[14px] border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-5 py-3.5 text-white shadow-[var(--shadow-luxe)] transition-transform hover:-translate-y-0.5"
    >
      <GitCompare size={16} />
      <div className="text-left">
        <div className="text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
          {en ? "Compare" : "Comparateur"}
        </div>
        <div className="text-sm">
          {count} {en ? (count === 1 ? "property" : "properties") : (count === 1 ? "bien" : "biens")}{" "}
          <span className="text-white/50">{en ? "· view →" : "· voir →"}</span>
        </div>
      </div>
    </Link>
  );
}
