import type { ReactNode } from "react";

type ProviderInwardChartTooltipCardProps = {
  label: string;
  value: ReactNode;
  color?: string;
  meta?: ReactNode;
};

export function ProviderInwardChartTooltipCard({
  label,
  value,
  color,
  meta,
}: Readonly<ProviderInwardChartTooltipCardProps>) {
  return (
    <div className="pointer-events-none min-w-[124px] rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-soft dark:border-dark-600 dark:bg-dark-700 dark:shadow-none">
      <div className="flex items-center gap-1.5">
        {color ? (
          <span
            className="inline-block h-2.5 w-3.5 shrink-0 rounded-[3px] ring-1 ring-inset ring-black/10 dark:ring-white/10"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        ) : (
          <span
            className="inline-block h-2.5 w-3.5 shrink-0 rounded-[3px] bg-primary-600 ring-1 ring-inset ring-black/10 dark:ring-white/10"
            aria-hidden="true"
          />
        )}
        <span className="truncate text-tiny-plus font-semibold text-gray-800 dark:text-dark-100">{label}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-bold tabular-nums leading-none text-gray-900 dark:text-dark-50">{value}</span>
        {meta ? (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-tiny font-semibold tabular-nums text-gray-600 dark:bg-dark-600 dark:text-dark-300">
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  );
}
