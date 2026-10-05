import clsx from "clsx";
import { providerJobDashboardClass } from "./theme.constants";

export function JobChip({ label, className }: Readonly<{ label: string; className: string }>) {
  return <span className={clsx(providerJobDashboardClass.chip, className)}>{label}</span>;
}

export function JobLinearProgress({
  value,
  barClassName,
  indeterminate,
  trackClassName,
  className,
}: Readonly<{
  value: number;
  barClassName: string;
  indeterminate?: boolean;
  trackClassName?: string;
  className?: string;
}>) {
  return (
    <div
      className={clsx(
        "h-2.5 w-full overflow-hidden rounded-full bg-slate-100",
        trackClassName,
        className,
      )}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-500 ease-out",
          barClassName,
          indeterminate ? "w-1/3 animate-pulse" : "",
        )}
        style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export function JobSummaryField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0">
      <p className={providerJobDashboardClass.label}>{label}</p>
      <p className={clsx(providerJobDashboardClass.value, "mt-1 break-words")} title={value}>
        {value}
      </p>
    </div>
  );
}

export function JobMetricChip({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

/** @deprecated Use JobMetricChip */
export function JobMetric({
  label,
  value,
  className,
}: Readonly<{
  label: string;
  value: string | number;
  className?: string;
}>) {
  return (
    <div className={clsx("min-w-0", className)}>
      <p className={providerJobDashboardClass.label}>{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
