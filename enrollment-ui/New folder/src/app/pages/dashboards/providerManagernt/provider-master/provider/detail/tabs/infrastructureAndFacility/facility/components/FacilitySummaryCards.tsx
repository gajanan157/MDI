import clsx from "clsx";
import type { FacilitySummaryStats } from "../utils/facilitySummaryStats";

type FacilitySummaryCardsProps = {
  stats: FacilitySummaryStats;
  className?: string;
};

function Sep() {
  return (
    <span className="hidden text-slate-300 sm:inline" aria-hidden>
      |
    </span>
  );
}

function InlineStat({
  label,
  value,
}: Readonly<{ label: string; value: string | number }>) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-[11px] font-bold tabular-nums text-slate-900">{value}</span>
    </span>
  );
}

export function FacilitySummaryCards({
  stats,
  className,
}: Readonly<FacilitySummaryCardsProps>) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-700",
        className,
      )}
    >
      <InlineStat label="Categories" value={stats.categories} />
      <Sep />
      <InlineStat label="Available" value={`${stats.available}/${stats.total}`} />
      <Sep />
      <InlineStat label="Outsourced" value={stats.outsourced} />
      <Sep />
      <InlineStat label="24x7" value={stats.aroundTheClock} />
      <Sep />
      <InlineStat label="Emergency" value={stats.emergency} />
    </div>
  );
}
