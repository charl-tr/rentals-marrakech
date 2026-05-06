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

const TERRACOTTA = "#c0735a";
const STONE = "#7a7468";
const CREAM = "#f5f0e8";
const CHARCOAL = "#2a2a28";

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
        <CartesianGrid vertical={false} stroke="#e8e2d8" strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: STONE, fontFamily: "inherit" }}
          tickLine={false}
          axisLine={{ stroke: "#e8e2d8" }}
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
            border: "1px solid #e8e2d8",
            borderRadius: 0,
            fontSize: 12,
            fontFamily: "inherit",
          }}
          cursor={{ fill: CREAM }}
        />
        <Bar dataKey="avgPricePerSqm" radius={0}>
          {data.map((entry, i) => (
            <Cell
              key={entry.slug}
              fill={i === 0 ? TERRACOTTA : i < 3 ? "#b86a52" : "#d4a090"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Pie chart — répartition par type ─────────────────────────────────────────
const PIE_COLORS = [
  "#c0735a", "#8a6e5f", "#5a7a6e", "#7a9e94", "#b8a898",
  "#d4b8a8", "#a89080",
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
            border: "1px solid #e8e2d8",
            borderRadius: 0,
            fontSize: 12,
            fontFamily: "inherit",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
