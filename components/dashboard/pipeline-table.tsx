import { formatPercent, formatSgd, type PipelinePoint } from "@/lib/dashboard";

export function PipelineTable({ rows }: { rows: PipelinePoint[] }) {
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm font-medium text-[#0f766e]">
        View monthly pipeline figures
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d5e2e4] text-xs tracking-wide text-[#5c7178] uppercase">
              <th className="px-2 py-2 font-semibold">Month</th>
              <th className="px-2 py-2 text-right font-semibold">Actual</th>
              <th className="px-2 py-2 text-right font-semibold">Revised budget</th>
              <th className="px-2 py-2 text-right font-semibold">Budget</th>
              <th className="px-2 py-2 text-right font-semibold">% of revised</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month} className="border-b border-[#eef3f4]">
                <td className="px-2 py-2 text-[#12343c]">{row.month}</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {row.actual == null ? "—" : formatSgd(row.actual)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{formatSgd(row.revisedBudget)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatSgd(row.budget)}</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {row.pct == null ? "—" : formatPercent(row.pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
