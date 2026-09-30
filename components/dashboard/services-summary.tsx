import { formatQty, formatSgd, type CategorySlice, type TotalGroup } from "@/lib/dashboard";

export function ServicesSummary({
  services,
  consumables,
  yearSlices,
}: {
  services: TotalGroup;
  consumables: TotalGroup;
  yearSlices: CategorySlice[];
}) {
  return (
    <div className="space-y-4">
      {yearSlices.length > 0 ? (
        <div className="rounded-xl bg-[#f4f7f7] px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#5c7178] uppercase">
            Same themes inside the 2026 product lines
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
            {yearSlices.map((slice) => (
              <li key={slice.category}>
                <p className="text-sm text-[#35555c]">{slice.category}</p>
                <p className="text-base font-semibold tabular-nums text-[#0c3d4a]">
                  {formatSgd(slice.total)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <TotalPanel title="Services" group={services} />
        <TotalPanel title="Consumables and parts" group={consumables} />
      </div>
    </div>
  );
}

function TotalPanel({ title, group }: { title: string; group: TotalGroup }) {
  const max = Math.max(...group.lines.map((line) => Math.abs(line.totalAmount)), 1);
  return (
    <div className="rounded-xl border border-[#e1ebed] p-4">
      <div className="flex items-end justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#12343c]">{title}</h3>
        {group.grand ? (
          <p className="text-right">
            <span className="block text-xs text-[#5c7178]">Reported total</span>
            <span className="text-lg font-semibold tabular-nums text-[#0c3d4a]">
              {formatSgd(group.grand.totalAmount)}
            </span>
            <span className="mt-0.5 block text-xs text-[#5c7178]">
              Qty {formatQty(group.grand.totalQty)}
            </span>
          </p>
        ) : null}
      </div>
      <ul className="mt-4 space-y-3">
        {group.lines.map((line) => {
          const width = Math.max(2, (Math.abs(line.totalAmount) / max) * 100);
          return (
            <li key={line.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-[#12343c]">{line.name}</span>
                <span className="shrink-0 text-right tabular-nums text-[#35555c]">
                  {formatSgd(line.totalAmount)}
                  <span className="ml-2 text-xs text-[#5c7178]">qty {formatQty(line.totalQty)}</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-[#e6eef0]">
                <div
                  className="h-1.5 rounded-full bg-[#1f8a70]"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
