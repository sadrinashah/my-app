"use client";

import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAxisSgd, formatPercent, formatSgd, type BrandShare, type MonthlyPoint, type PipelinePoint } from "@/lib/dashboard";

type TooltipEntry = {
  name?: string;
  value?: number | string | null;
  color?: string;
  payload?: { fill?: string };
};

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#d5e2e4] bg-white px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-[#12343c]">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry) => {
          const numeric = typeof entry.value === "number" ? entry.value : null;
          return (
            <li key={entry.name} className="flex items-center justify-between gap-6 text-[#35555c]">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: entry.color ?? entry.payload?.fill ?? "#0c4a5c" }}
                />
                {entry.name}
              </span>
              <span className="font-medium tabular-nums">
                {numeric == null ? "—" : formatSgd(numeric)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const axisTick = { fill: "#5c7178", fontSize: 12 };

export function PipelineChart({ rows }: { rows: PipelinePoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Monthly actual sales compared with revised budget and original budget">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e6eef0" vertical={false} />
          <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} interval={0} />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={formatAxisSgd}
          />
          <Tooltip content={<MoneyTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="actual" name="Actual" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={18} />
          <Bar
            dataKey="revisedBudget"
            name="Revised budget"
            fill="#9fb4ba"
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
          />
          <Line
            type="monotone"
            dataKey="budget"
            name="Budget"
            stroke="#0c3d4a"
            strokeWidth={2}
            dot={{ r: 2, fill: "#0c3d4a" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueTrend({ rows }: { rows: MonthlyPoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Monthly revenue of 2026 diagnostic product lines">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0f766e" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e6eef0" vertical={false} />
          <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={formatAxisSgd}
            domain={[0, "auto"]}
          />
          <Tooltip content={<MoneyTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#0f766e"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BrandChart({ brands }: { brands: BrandShare[] }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,200px)_1fr]">
      <div className="h-52 w-full" role="img" aria-label="Share of 2026 product-line revenue by brand">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={brands}
              dataKey="total"
              nameKey="brand"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="#ffffff"
            >
              {brands.map((brand) => (
                <Cell key={brand.brand} fill={brand.color} />
              ))}
            </Pie>
            <Tooltip content={<MoneyTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="divide-y divide-[#e6eef0]">
        {brands.map((brand) => (
          <li key={brand.brand} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-[#12343c]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: brand.color }} />
              {brand.brand}
            </span>
            <span className="text-right tabular-nums text-[#35555c]">
              {formatSgd(brand.total)}
              <span className="ml-2 text-[#5c7178]">{formatPercent(brand.share)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
