"use client";

import dynamic from "next/dynamic";

function DashboardFallback() {
  return (
    <div className="min-h-full bg-[#f3f6f6] text-[#12262c]">
      <header className="bg-[#0c3d4a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#9fd8c8]">
            DIATEC DIAGNOSTICS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Diagnostics sales
          </h1>
          <p className="mt-2 text-sm text-[#d5e6ea]">Private dashboard. Loading…</p>
        </div>
      </header>
    </div>
  );
}

// Client-only so sales figures are not written into the document HTML.
const DashboardApp = dynamic(
  () => import("@/components/dashboard/dashboard-app").then((mod) => mod.DashboardApp),
  { ssr: false, loading: () => <DashboardFallback /> },
);

export function DashboardGate({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  return (
    <>
      <noscript>
        <p className="bg-[#0c3d4a] px-4 py-3 text-sm text-white">
          This private dashboard needs JavaScript.
        </p>
      </noscript>
      <DashboardApp supabaseConfigured={supabaseConfigured} />
    </>
  );
}
