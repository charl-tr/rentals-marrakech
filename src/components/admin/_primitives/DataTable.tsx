"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { useKeyboard } from "@/lib/hooks/useKeyboard";

// ════════════════════════════════════════════════════════════════════
// <DataTable> — primitive de table admin.
//
// Features v1 :
// - Columns def déclaratif (header, cell renderer, sortable, align)
// - Navigation clavier j/k sur les rows + Enter pour ouvrir
// - Click header → sort asc/desc/none (si sortable)
// - Row href → navigation vers la fiche
// - Empty state custom
// - Focus visuel sur la row active clavier
//
// Pas encore v1 : pagination, bulk selection, inline editing — ajoutés
// quand un usage concret les appelle.
// ════════════════════════════════════════════════════════════════════

export type SortDir = "asc" | "desc" | null;

export interface DataTableColumn<T> {
  /** Clé unique — sert d'identifiant du tri et de key React. */
  key: string;
  /** En-tête visible (ou vide pour une col d'indicateur). */
  header: React.ReactNode;
  /** Renderer de la cellule. */
  cell: (row: T, ctx: { isActive: boolean }) => React.ReactNode;
  /** Largeur CSS (ex "minmax(160px,1.4fr)"). Obligatoire. */
  width: string;
  /** Activer le tri click header. Fournit la fonction de comparaison. */
  sortable?: (a: T, b: T) => number;
  /** Alignement visuel du header + cellule. Default "left". */
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Identifiant stable par row (pour keys React). */
  rowKey: (row: T) => string;
  /** URL à naviguer au click / Enter (sinon pas de navigation). */
  rowHref?: (row: T) => string;
  /** Tri initial (remplace le sort par défaut du parent). */
  defaultSort?: { columnKey: string; dir: "asc" | "desc" };
  /** État vide custom. */
  emptyState?: React.ReactNode;
  /** Afficher la chevron à droite de chaque row. */
  showChevron?: boolean;
  /** Activer la navigation clavier j/k. Default true. */
  keyboard?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  rowHref,
  defaultSort,
  emptyState,
  showChevron = true,
  keyboard = true,
}: DataTableProps<T>) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(-1); // -1 = aucune row active
  const [sortCol, setSortCol] = useState<string | null>(defaultSort?.columnKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSort?.dir ?? "asc");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.key === sortCol);
    if (!col?.sortable) return data;
    const sorted = [...data].sort(col.sortable);
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [data, sortCol, sortDir, columns]);

  // j / k navigation
  useKeyboard("j", () => {
    if (sortedData.length === 0) return;
    setActiveIdx((i) => Math.min(i + 1, sortedData.length - 1));
  }, { enabled: keyboard });

  useKeyboard("k", () => {
    if (sortedData.length === 0) return;
    setActiveIdx((i) => Math.max(i - 1, 0));
  }, { enabled: keyboard });

  useKeyboard("Enter", () => {
    if (activeIdx < 0 || activeIdx >= sortedData.length) return;
    const row = sortedData[activeIdx];
    if (rowHref) router.push(rowHref(row));
  }, { enabled: keyboard });

  useKeyboard("Escape", () => setActiveIdx(-1), { enabled: keyboard });

  // Scroll row active en vue
  useEffect(() => {
    if (activeIdx < 0 || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      `[data-row-idx="${activeIdx}"]`
    );
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx]);

  if (data.length === 0) {
    return (
      emptyState ?? (
        <div className="border border-dashed border-[var(--color-beige-warm)] bg-white px-8 py-16 text-center">
          <div className="font-serif text-xl text-[var(--color-charcoal)]">
            Aucune donnée.
          </div>
        </div>
      )
    );
  }

  // Grid template cols
  const gridCols =
    columns.map((c) => c.width).join(" ") + (showChevron ? " 20px" : "");

  function toggleSort(colKey: string) {
    if (sortCol === colKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(colKey);
      setSortDir("asc");
    }
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden border border-[var(--color-beige-warm)] bg-white"
    >
      {/* Header */}
      <div
        className="grid items-center gap-3 border-b border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]"
        style={{ gridTemplateColumns: gridCols }}
      >
        {columns.map((col) => {
          const isSorted = sortCol === col.key;
          const align = col.align ?? "left";
          return (
            <div
              key={col.key}
              className={`${
                align === "right"
                  ? "text-right"
                  : align === "center"
                  ? "text-center"
                  : ""
              }`}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className={`inline-flex items-center gap-1 hover:text-[var(--color-charcoal)] ${
                    isSorted ? "text-[var(--color-charcoal)]" : ""
                  }`}
                >
                  {col.header}
                  {isSorted &&
                    (sortDir === "asc" ? (
                      <ArrowUp size={10} />
                    ) : (
                      <ArrowDown size={10} />
                    ))}
                </button>
              ) : (
                col.header
              )}
            </div>
          );
        })}
        {showChevron && <div />}
      </div>

      {/* Rows */}
      <div className="divide-y divide-[var(--color-beige-warm)]">
        {sortedData.map((row, idx) => {
          const isActive = idx === activeIdx;
          const href = rowHref?.(row);
          const content = (
            <>
              {columns.map((col) => {
                const align = col.align ?? "left";
                return (
                  <div
                    key={col.key}
                    className={`min-w-0 ${
                      align === "right"
                        ? "text-right"
                        : align === "center"
                        ? "text-center"
                        : ""
                    }`}
                  >
                    {col.cell(row, { isActive })}
                  </div>
                );
              })}
              {showChevron && (
                <ChevronRight
                  size={14}
                  className={`transition-colors ${
                    isActive
                      ? "text-[var(--color-terracotta)]"
                      : "text-[var(--color-stone-soft)] group-hover:text-[var(--color-terracotta)]"
                  }`}
                />
              )}
            </>
          );

          const rowClass = `group grid items-center gap-3 px-4 py-3.5 transition-colors ${
            isActive
              ? "bg-[var(--color-cream)]"
              : "hover:bg-[var(--color-cream)]"
          }`;

          if (href) {
            return (
              <Link
                key={rowKey(row)}
                href={href}
                data-row-idx={idx}
                onMouseEnter={() => setActiveIdx(idx)}
                className={rowClass}
                style={{ gridTemplateColumns: gridCols }}
              >
                {content}
              </Link>
            );
          }
          return (
            <div
              key={rowKey(row)}
              data-row-idx={idx}
              onMouseEnter={() => setActiveIdx(idx)}
              className={rowClass}
              style={{ gridTemplateColumns: gridCols }}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Footer hint keyboard */}
      {keyboard && (
        <div className="flex items-center justify-between border-t border-[var(--color-beige-warm)] bg-[var(--color-cream)]/50 px-4 py-1.5 text-[10px] text-[var(--color-stone)]">
          <div className="flex items-center gap-2">
            <kbd className="inline-flex items-center border border-[var(--color-beige-warm)] bg-white px-1 py-px font-mono text-[9px]">
              j
            </kbd>
            <kbd className="inline-flex items-center border border-[var(--color-beige-warm)] bg-white px-1 py-px font-mono text-[9px]">
              k
            </kbd>
            <span>naviguer</span>
            <span className="mx-1">·</span>
            <kbd className="inline-flex items-center border border-[var(--color-beige-warm)] bg-white px-1 py-px font-mono text-[9px]">
              ↵
            </kbd>
            <span>ouvrir</span>
          </div>
          <span>{sortedData.length} lignes</span>
        </div>
      )}
    </div>
  );
}
