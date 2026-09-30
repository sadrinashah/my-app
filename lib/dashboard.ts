import raw from "@/data/dashboard-data.json";

export type Product = {
  name: string;
  brand: string;
  category: string;
  monthly: Record<string, number>;
  total: number;
};

export type NamedTotal = {
  name: string;
  totalAmount: number;
  totalQty: number;
};

export type PipelineRow = {
  month: string;
  actual: number | null;
  revisedBudget: number;
  pct: number;
  budget: number;
};

export type DashboardData = {
  source: string;
  currencyNote: string;
  instruments2026: {
    months: string[];
    products: Product[];
  };
  servicesTotals: NamedTotal[];
  consumablesTotals: NamedTotal[];
  pipeline2026: PipelineRow[];
};

export const dashboardData = raw as DashboardData;

export const BRAND_COLORS: Record<string, string> = {
  Amplivox: "#0c4a5c",
  Interacoustics: "#1f8a70",
  Maico: "#c4a35a",
};

const FALLBACK_COLORS = ["#3d6f8a", "#6b8f71", "#8d6e4c", "#4f6f8f"];

const sgdWhole = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const sgdCents = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const qtyFormat = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 1,
});

export function formatSgd(value: number): string {
  const hasCents = Math.abs(value - Math.round(value)) > 0.001;
  return (hasCents ? sgdCents : sgdWhole).format(value);
}

export function formatPercent(ratio: number, digits = 1): string {
  return new Intl.NumberFormat("en-SG", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(ratio);
}

export function formatQty(value: number): string {
  return qtyFormat.format(value);
}

export function formatAxisSgd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return String(Math.round(value));
}

export function brandColor(brand: string, index: number): string {
  return BRAND_COLORS[brand] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export type KpiCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "positive" | "negative" | "neutral";
};

export type PipelinePoint = {
  month: string;
  actual: number | null;
  revisedBudget: number;
  budget: number;
  pct: number | null;
};

export type MonthlyPoint = {
  month: string;
  fullMonth: string;
  revenue: number;
};

export type BrandShare = {
  brand: string;
  total: number;
  share: number;
  color: string;
};

export type TotalGroup = {
  grand: NamedTotal | null;
  lines: NamedTotal[];
};

export type CategorySlice = {
  category: string;
  total: number;
};

export type DashboardModel = {
  source: string;
  currencyNote: string;
  periodLabel: string;
  futureMonthsLabel: string;
  kpis: KpiCard[];
  pipeline: PipelinePoint[];
  monthsAtOrAboveRevised: number;
  monthsWithActual: number;
  monthlyRevenue: MonthlyPoint[];
  peakMonth: MonthlyPoint;
  lowMonth: MonthlyPoint;
  productRevenue: number;
  pipelineActual: number;
  brands: BrandShare[];
  products: Product[];
  months: string[];
  brandsList: string[];
  services: TotalGroup;
  consumables: TotalGroup;
  yearServiceSlices: CategorySlice[];
};

function splitTotals(rows: NamedTotal[]): TotalGroup {
  const grand = rows.find((row) => row.name === "Grand Total") ?? null;
  const lines = rows
    .filter((row) => row.name !== "Grand Total")
    .slice()
    .sort((a, b) => b.totalAmount - a.totalAmount);
  return { grand, lines };
}

function sumBy(products: Product[], key: "brand" | "category"): Map<string, number> {
  const totals = new Map<string, number>();
  for (const product of products) {
    totals.set(product[key], (totals.get(product[key]) ?? 0) + product.total);
  }
  return totals;
}

export function buildDashboard(data: DashboardData = dashboardData): DashboardModel {
  const elapsed = data.pipeline2026.filter((row) => row.actual != null);
  const future = data.pipeline2026.filter((row) => row.actual == null);
  const pipelineActual = elapsed.reduce((sum, row) => sum + (row.actual ?? 0), 0);
  const ytdRevised = elapsed.reduce((sum, row) => sum + row.revisedBudget, 0);
  const ytdBudget = elapsed.reduce((sum, row) => sum + row.budget, 0);
  const fullYearRevised = data.pipeline2026.reduce((sum, row) => sum + row.revisedBudget, 0);
  const variance = pipelineActual - ytdRevised;
  const remaining = fullYearRevised - pipelineActual;
  const monthlyGoal = future.length > 0 ? remaining / future.length : null;
  const progress = ytdRevised === 0 ? 0 : pipelineActual / ytdRevised;
  const budgetProgress = ytdBudget === 0 ? 0 : pipelineActual / ytdBudget;

  const products = data.instruments2026.products;
  const months = data.instruments2026.months;
  const productRevenue = products.reduce((sum, product) => sum + product.total, 0);
  const roundingGap = productRevenue - pipelineActual;

  const brandTotals = [...sumBy(products, "brand").entries()].sort((a, b) => b[1] - a[1]);
  const brands: BrandShare[] = brandTotals.map(([brand, total], index) => ({
    brand,
    total,
    share: productRevenue === 0 ? 0 : total / productRevenue,
    color: brandColor(brand, index),
  }));
  const topBrand = brands[0];

  const monthlyRevenue: MonthlyPoint[] = months.map((fullMonth) => ({
    month: fullMonth.slice(0, 3),
    fullMonth,
    revenue: products.reduce((sum, product) => sum + (product.monthly[fullMonth] ?? 0), 0),
  }));
  const peakMonth = monthlyRevenue.reduce((best, point) =>
    point.revenue > best.revenue ? point : best,
  );
  const lowMonth = monthlyRevenue.reduce((best, point) =>
    point.revenue < best.revenue ? point : best,
  );

  const periodLabel =
    elapsed.length > 0 ? `${elapsed[0].month}–${elapsed[elapsed.length - 1].month} 2026` : "2026";
  const futureMonthsLabel = future.map((row) => row.month).join(", ");

  const ahead = variance >= 0;
  const paceDetail =
    monthlyGoal == null
      ? "Every pipeline month already has an actual."
      : remaining <= 0
        ? `Year-to-date actuals already cover the full-year revised budget of ${formatSgd(fullYearRevised)}.`
        : `${formatSgd(monthlyGoal)} per month across ${futureMonthsLabel} (${future.length} months with no actual yet) reaches the full-year revised budget of ${formatSgd(fullYearRevised)}. ${formatSgd(remaining)} is still open.`;

  const kpis: KpiCard[] = [
    {
      id: "ytd",
      label: "YTD actual sales",
      value: formatSgd(pipelineActual),
      detail: `Pipeline actuals, ${periodLabel}. Product lines sum to ${formatSgd(productRevenue)} (${formatSgd(Math.abs(roundingGap))} ${roundingGap >= 0 ? "above" : "below"} the rounded pipeline total).`,
      tone: "neutral",
    },
    {
      id: "progress",
      label: "Revised budget progress",
      value: formatPercent(progress),
      detail: `${formatSgd(pipelineActual)} against ${formatSgd(ytdRevised)} revised, ${periodLabel}. ${formatPercent(budgetProgress)} of the original budget for those months (${formatSgd(ytdBudget)}).`,
      tone: progress >= 1 ? "positive" : "negative",
    },
    {
      id: "pace",
      label: ahead ? "Ahead of revised budget" : "Shortfall vs revised budget",
      value: `${formatSgd(Math.abs(variance))} ${ahead ? "ahead" : "short"}`,
      detail: `${ahead ? "No shortfall" : "Shortfall"} versus the ${periodLabel} revised budget of ${formatSgd(ytdRevised)}. ${paceDetail}`,
      tone: ahead ? "positive" : "negative",
    },
    {
      id: "brand",
      label: "Top brand",
      value: topBrand?.brand ?? "—",
      detail: topBrand
        ? `${formatSgd(topBrand.total)} · ${formatPercent(topBrand.share)} of 2026 product-line revenue (${formatSgd(productRevenue)}).`
        : "No product lines in the extract.",
      tone: "neutral",
    },
  ];

  const serviceCategoryNames = [
    "Diagnostics Calibration Services",
    "Diagnostics Repair Services",
    "Diagnostics Commercial Parts",
  ];
  const categoryTotals = sumBy(products, "category");
  const yearServiceSlices = serviceCategoryNames
    .filter((category) => categoryTotals.has(category))
    .map((category) => ({ category, total: categoryTotals.get(category) ?? 0 }));

  return {
    source: data.source,
    currencyNote: data.currencyNote,
    periodLabel,
    futureMonthsLabel,
    kpis,
    pipeline: data.pipeline2026.map((row) => ({
      month: row.month,
      actual: row.actual,
      revisedBudget: row.revisedBudget,
      budget: row.budget,
      pct: row.actual == null ? null : row.pct,
    })),
    monthsAtOrAboveRevised: elapsed.filter((row) => (row.actual ?? 0) >= row.revisedBudget).length,
    monthsWithActual: elapsed.length,
    monthlyRevenue,
    peakMonth,
    lowMonth,
    productRevenue,
    pipelineActual,
    brands,
    products,
    months,
    brandsList: [...sumBy(products, "brand").keys()].sort((a, b) => a.localeCompare(b)),
    services: splitTotals(data.servicesTotals),
    consumables: splitTotals(data.consumablesTotals),
    yearServiceSlices,
  };
}
