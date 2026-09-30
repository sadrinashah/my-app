import type { KpiCard } from "@/lib/dashboard";

const toneBar: Record<KpiCard["tone"], string> = {
  positive: "bg-[#0f766e]",
  negative: "bg-[#9b4d3a]",
  neutral: "bg-[#0c4a5c]",
};

export function KpiCards({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.id}
          className="relative overflow-hidden rounded-2xl border border-[#d5e2e4] bg-white p-4 pl-5 shadow-[0_1px_2px_rgba(12,61,74,0.05)]"
        >
          <span className={`absolute inset-y-0 left-0 w-1 ${toneBar[card.tone]}`} aria-hidden />
          <h2 className="text-xs font-semibold tracking-[0.12em] text-[#5c7178] uppercase">
            {card.label}
          </h2>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0c3d4a] tabular-nums">
            {card.value}
          </p>
          <p className="mt-2 text-sm leading-5 text-[#4e656c]">{card.detail}</p>
        </article>
      ))}
    </div>
  );
}
