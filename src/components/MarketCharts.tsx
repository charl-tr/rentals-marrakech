"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { NeighborhoodStat, MarketStats } from "@/lib/db";

// Palette ancrée aux tokens v7 (globals.css @theme) — recharts ne lit pas les
// vars CSS, donc on reproduit les hex des tokens.
const TERRACOTTA = "#9c7256"; // --color-accent
const STONE = "#877f73"; // --color-ink-muted
const CREAM = "#f7f5f0"; // --color-bg-alt
const CHARCOAL = "#23201b"; // --color-ink
const BORDER = "#e6e0d5"; // --color-border

// ── Formatter prix ────────────────────────────────────────────────────────────
const fmtEur = (v: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

// ── Bar chart — prix/m² par quartier ─────────────────────────────────────────
export function PricePerSqmChart({ data }: { data: NeighborhoodStat[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 64, left: 16 }}
        barCategoryGap="32%"
      >
        <CartesianGrid vertical={false} stroke={BORDER} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: STONE, fontFamily: "inherit" }}
          tickLine={false}
          axisLine={{ stroke: BORDER }}
          angle={-40}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
          tick={{ fontSize: 10, fill: STONE, fontFamily: "inherit" }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          formatter={(value) => [fmtEur(Number(value)), "Prix moyen / m²"]}
          contentStyle={{
            background: "white",
            border: "1px solid #e6e0d5",
            borderRadius: 12,
            fontSize: 12,
            fontFamily: "inherit",
          }}
          cursor={{ fill: CREAM }}
        />
        <Bar dataKey="avgPricePerSqm" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={entry.slug}
              fill={i === 0 ? TERRACOTTA : i < 3 ? "#7c5942" : "#b3927a"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Pie chart — répartition par type ─────────────────────────────────────────
// Rampe analogue tokenisée (accent → neutres chauds), sobre et cohérente.
const PIE_COLORS = [
  "#9c7256", "#7c5942", "#b3927a", "#5e7266", "#877f73",
  "#cabfad", "#d8c3ab",
];

export function TypeDistributionChart({
  data,
}: {
  data: MarketStats["byType"];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius="52%"
          outerRadius="72%"
          dataKey="count"
          nameKey="label"
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={entry.type} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: CHARCOAL, fontFamily: "inherit" }}>
              {value}
            </span>
          )}
        />
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{
            background: "white",
            border: "1px solid #e6e0d5",
            borderRadius: 12,
            fontSize: 12,
            fontFamily: "inherit",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
