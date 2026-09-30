import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-[#d5e2e4] bg-white p-4 shadow-[0_1px_2px_rgba(12,61,74,0.05)] sm:p-5"
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-[#12343c]">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-[#5c7178]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
