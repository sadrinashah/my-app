"use client";

import { BrandChart, PipelineChart, RevenueTrend } from "@/components/dashboard/charts";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PipelineTable } from "@/components/dashboard/pipeline-table";
import { ProductsTable } from "@/components/dashboard/products-table";
import { SectionCard } from "@/components/dashboard/section";
import { ServicesSummary } from "@/components/dashboard/services-summary";
import { buildDashboard, formatSgd } from "@/lib/dashboard";

export function DashboardApp({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const model = buildDashboard();
  const roundingGap = model.productRevenue - model.pipelineActual;

  return (
    <div className="min-h-full bg-[#f3f6f6] text-[#12262c]">
      <header className="bg-[#0c3d4a] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#9fd8c8]">
              DIATEC DIAGNOSTICS · DEMANT
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Diagnostics sales
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#d5e6ea]">
              Singapore external sales for Nur Sadrina. Calendar 2026 actuals run through September.
              October to December are budget only.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
            <p className="text-[#9fd8c8]">Reporting window</p>
            <p className="text-lg font-semibold">{model.periodLabel}</p>
            <p className="text-[#d5e6ea]">
              {model.futureMonthsLabel
                ? `${model.futureMonthsLabel} have revised budget and budget, no actual`
                : "All pipeline months have an actual"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <KpiCards cards={model.kpis} />

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionCard
              title="Actual vs revised budget"
              description={`${model.monthsAtOrAboveRevised} of ${model.monthsWithActual} months with an actual are at or above that month’s revised budget. The line is the original budget. Months without an actual are left blank.`}
            >
              <PipelineChart rows={model.pipeline} />
              <PipelineTable rows={model.pipeline} />
            </SectionCard>
          </div>
          <div className="lg:col-span-2">
            <SectionCard
              title="Revenue by brand"
              description="Share of 2026 product-line totals. Percentages are each brand divided by the sum of those lines."
            >
              <BrandChart brands={model.brands} />
            </SectionCard>
          </div>
        </div>

        <SectionCard
          title="Monthly revenue trend"
          description="Sum of every product line in the 2026 extract, including instruments, service, and parts rows."
        >
          <RevenueTrend rows={model.monthlyRevenue} />
          <p className="mt-3 text-sm text-[#4e656c]">
            Highest month is {model.peakMonth.fullMonth} at {formatSgd(model.peakMonth.revenue)}.
            Lowest month is {model.lowMonth.fullMonth} at {formatSgd(model.lowMonth.revenue)}.
            Pipeline actuals are rounded to the nearest dollar; product lines total{" "}
            {formatSgd(model.productRevenue)}, {formatSgd(Math.abs(roundingGap))}{" "}
            {roundingGap >= 0 ? "above" : "below"} the pipeline year-to-date.
          </p>
        </SectionCard>

        <SectionCard
          title="Product lines"
          description="Filter the 2026 extract by brand, category, or name. Totals are the line totals from the file. Open a row for the monthly amounts."
        >
          <ProductsTable
            products={model.products}
            months={model.months}
            brands={model.brandsList}
            revenueTotal={model.productRevenue}
          />
        </SectionCard>

        <SectionCard
          title="Services and consumables"
          description="Reported totals from the Services and Consumables sheets. Those sheets span more than calendar 2026, so these figures are not the January–September year-to-date."
        >
          <ServicesSummary
            services={model.services}
            consumables={model.consumables}
            yearSlices={model.yearServiceSlices}
          />
        </SectionCard>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs leading-5 text-[#5c7178] sm:px-6 lg:px-8">
        <p>
          Source: {model.source}. {model.currencyNote}. Amounts are formatted as SGD. Shares,
          progress, and the monthly pace are calculated from those figures. Live Supabase sync can
          replace this static extract later.
        </p>
        <p className="mt-1">
          Supabase:{" "}
          <span className={supabaseConfigured ? "text-[#0f766e]" : "text-[#9a6b2f]"}>
            {supabaseConfigured ? "configured" : "not configured yet"}
          </span>
          .
        </p>
      </footer>
    </div>
  );
}
