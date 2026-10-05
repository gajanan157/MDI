import clsx from "clsx";
import type { ManpowerSummaryStats } from "../utils/manpowerSummaryStats";

type ManpowerSummaryCardsProps = {
  stats: ManpowerSummaryStats;
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
  title,
}: Readonly<{ label: string; value: string | number; title?: string }>) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap" title={title}>
      <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-[11px] font-bold tabular-nums text-slate-900">{value}</span>
    </span>
  );
}

export function ManpowerSummaryCards({
  stats,
  className,
}: Readonly<ManpowerSummaryCardsProps>) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-700",
        className,
      )}
    >
      <InlineStat label="Categories" value={stats.categories} />
      <Sep />
      <InlineStat label="Total staff" value={stats.totalStaff} />
      <Sep />
      <InlineStat label="On duty" value={stats.onDuty} />
      <Sep />
      <InlineStat label="On call" value={stats.onCall} />
      <Sep />
      <span className="inline-flex min-w-0 items-center gap-1.5" title={`${stats.trained} trained`}>
        <InlineStat label="Trained" value={`${stats.trainedPercent}%`} />
        <span className="hidden h-1 w-10 overflow-hidden rounded-full bg-slate-200 sm:block">
          <span
            className="block h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${stats.trainedPercent}%` }}
          />
        </span>
      </span>
    </div>
  );
}
