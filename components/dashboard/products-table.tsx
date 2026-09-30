"use client";

import { Fragment, useMemo, useState } from "react";
import { formatPercent, formatSgd, type Product } from "@/lib/dashboard";

const fieldClass =
  "mt-1 w-full rounded-lg border border-[#d0dee1] bg-white px-3 py-2 text-sm text-[#12343c] outline-none focus:border-[#0f766e]";

export function ProductsTable({
  products,
  months,
  brands,
  revenueTotal,
}: {
  products: Product[];
  months: string[];
  brands: string[];
  revenueTotal: number;
}) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [category, setCategory] = useState("all");
  const [showZero, setShowZero] = useState(false);
  const [sortKey, setSortKey] = useState<"total" | "name">("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [open, setOpen] = useState<string | null>(null);

  const zeroCount = products.filter((product) => product.total === 0).length;

  const categoryOptions = useMemo(() => {
    const pool =
      brand === "all" ? products : products.filter((product) => product.brand === brand);
    return [...new Set(pool.map((product) => product.category))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [brand, products]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = products.filter((product) => {
      if (!showZero && product.total === 0) return false;
      if (brand !== "all" && product.brand !== brand) return false;
      if (category !== "all" && product.category !== category) return false;
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        product.brand.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle)
      );
    });
    rows.sort((a, b) => {
      const factor = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * factor;
      return (a.total - b.total) * factor;
    });
    return rows;
  }, [products, query, brand, category, showZero, sortKey, sortDir]);

  const visibleTotal = filtered.reduce((sum, product) => sum + product.total, 0);
  const filtersActive = query !== "" || brand !== "all" || category !== "all" || showZero;

  function toggleSort(next: "total" | "name") {
    if (sortKey === next) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(next);
    setSortDir(next === "name" ? "asc" : "desc");
  }

  function clearFilters() {
    setQuery("");
    setBrand("all");
    setCategory("all");
    setShowZero(false);
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-xs font-medium text-[#5c7178]">
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Product, brand, or category"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-medium text-[#5c7178]">
          Brand
          <select
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value);
              setCategory("all");
            }}
            className={fieldClass}
          >
            <option value="all">All brands</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-[#5c7178]">
          Category
          <select
            value={categoryOptions.includes(category) ? category : "all"}
            onChange={(event) => setCategory(event.target.value)}
            className={fieldClass}
          >
            <option value="all">All categories</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col justify-end gap-2">
          <label className="flex items-center gap-2 text-sm text-[#35555c]">
            <input
              type="checkbox"
              checked={showZero}
              onChange={(event) => setShowZero(event.target.checked)}
              className="h-4 w-4 accent-[#0f766e]"
            />
            Include zero-total lines ({zeroCount})
          </label>
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-sm font-medium text-[#0f766e] underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-sm text-[#4e656c]" aria-live="polite">
        Showing {filtered.length} of {products.length} lines · {formatSgd(visibleTotal)}
        {revenueTotal > 0 ? ` · ${formatPercent(visibleTotal / revenueTotal)} of product-line revenue` : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl bg-[#f4f7f7] px-4 py-8 text-center text-sm text-[#5c7178]">
          No product lines match these filters.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-3 md:hidden">
            {filtered.map((product) => {
              const expanded = open === product.name;
              return (
                <li key={product.name} className="rounded-xl border border-[#e1ebed] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#12343c]">{product.name}</p>
                      <p className="mt-1 text-xs text-[#5c7178]">
                        {product.brand} · {product.category}
                      </p>
                    </div>
                    <p className="text-right text-sm font-semibold tabular-nums text-[#0c3d4a]">
                      {formatSgd(product.total)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : product.name)}
                    className="mt-2 text-sm font-medium text-[#0f766e]"
                  >
                    {expanded ? "Hide months" : "Show months"}
                  </button>
                  {expanded ? <MonthGrid product={product} months={months} /> : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#d5e2e4] text-xs tracking-wide text-[#5c7178] uppercase">
                  <th className="px-2 py-2 font-semibold">
                    <button type="button" onClick={() => toggleSort("name")} className="hover:text-[#0c3d4a]">
                      Product {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="px-2 py-2 font-semibold">Brand</th>
                  <th className="px-2 py-2 font-semibold">Category</th>
                  <th className="px-2 py-2 text-right font-semibold">
                    <button type="button" onClick={() => toggleSort("total")} className="hover:text-[#0c3d4a]">
                      Total {sortKey === "total" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-right font-semibold">Share</th>
                  <th className="px-2 py-2 font-semibold">
                    <span className="sr-only">Months</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const expanded = open === product.name;
                  return (
                    <Fragment key={product.name}>
                      <tr className="border-b border-[#eef3f4]">
                        <td className="px-2 py-3 font-medium text-[#12343c]">{product.name}</td>
                        <td className="px-2 py-3 text-[#35555c]">{product.brand}</td>
                        <td className="px-2 py-3 text-[#35555c]">{product.category}</td>
                        <td className="px-2 py-3 text-right font-medium tabular-nums text-[#0c3d4a]">
                          {formatSgd(product.total)}
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums text-[#5c7178]">
                          {revenueTotal > 0 ? formatPercent(product.total / revenueTotal) : "—"}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => setOpen(expanded ? null : product.name)}
                            className="text-sm font-medium text-[#0f766e]"
                          >
                            {expanded ? "Hide months" : "Months"}
                          </button>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="border-b border-[#eef3f4] bg-[#f7fafa]">
                          <td colSpan={6} className="px-2 py-3">
                            <MonthGrid product={product} months={months} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function MonthGrid({ product, months }: { product: Product; months: string[] }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-9">
      {months.map((month) => {
        const value = product.monthly[month] ?? 0;
        return (
          <div key={month} className="rounded-lg bg-[#f4f7f7] px-2 py-1.5 md:bg-white">
            <p className="text-[11px] tracking-wide text-[#5c7178] uppercase">{month.slice(0, 3)}</p>
            <p className={`text-sm tabular-nums ${value < 0 ? "text-[#9b3d3d]" : "text-[#12343c]"}`}>
              {formatSgd(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
