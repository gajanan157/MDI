import clsx from "clsx";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { InfrastructureSummaryStats } from "../utils/infrastructureSummaryStats";

type InfrastructureSummaryCardsProps = {
  stats: InfrastructureSummaryStats;
  className?: string;
};

function StatSeparator() {
  return <span className="hidden text-slate-300 sm:inline" aria-hidden>|</span>;
}

function InlineStat({
  label,
  value,
  title,
}: Readonly<{
  label: string;
  value: string | number;
  title?: string;
}>) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap" title={title}>
      <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-[11px] font-bold tabular-nums text-slate-900">{value}</span>
    </span>
  );
}

type ProgressTone = {
  badge: string;
  text: string;
  track: string;
  bar: string;
};

function resolveProgressTone(percent: number): ProgressTone {
  if (percent >= 100) {
    return {
      badge: "border-emerald-300 bg-emerald-50",
      text: "text-emerald-700",
      track: "bg-emerald-200/70",
      bar: "bg-emerald-500",
    };
  }
  if (percent > 0) {
    return {
      badge: "border-amber-300 bg-amber-50",
      text: "text-amber-700",
      track: "bg-amber-200/70",
      bar: "bg-amber-500",
    };
  }
  return {
    badge: "border-rose-300 bg-rose-50",
    text: "text-rose-700",
    track: "bg-rose-200/70",
    bar: "bg-rose-500",
  };
}

function VerificationProgressBadge({
  percent,
  verifiedCategories,
  activeCategories,
}: Readonly<{
  percent: number;
  verifiedCategories: number;
  activeCategories: number;
}>) {
  const tone = resolveProgressTone(percent);
  const complete = percent >= 100 && activeCategories > 0;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 shadow-sm",
        tone.badge,
      )}
      title={`${verifiedCategories} of ${activeCategories} infrastructure categories fully verified`}
    >
      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        Progress
      </span>
      {complete ? (
        <CheckBadgeIcon className={clsx("h-3.5 w-3.5", tone.text)} aria-hidden />
      ) : null}
      <span className={clsx("text-[12px] font-extrabold leading-none tabular-nums", tone.text)}>
        {percent}%
      </span>
      <span
        className={clsx(
          "hidden h-1.5 w-16 overflow-hidden rounded-full sm:block",
          tone.track,
        )}
      >
        <span
          className={clsx("block h-full rounded-full transition-[width]", tone.bar)}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="text-[10px] font-semibold tabular-nums text-slate-500">
        {verifiedCategories}/{activeCategories}
      </span>
    </span>
  );
}

export function InfrastructureSummaryCards({
  stats,
  className,
}: Readonly<InfrastructureSummaryCardsProps>) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-700",
        className,
      )}
    >
      <InlineStat label="Beds" value={stats.totalBeds} />
      <StatSeparator />
      <InlineStat label="ICU" value={stats.icuBeds} />
      <StatSeparator />
      <InlineStat
        label="Verified"
        value={`${stats.verifiedInfraCount}/${stats.activeCategoryCount}`}
        title={`${stats.verifiedInfraCount} infra items verified`}
      />
      <StatSeparator />
      <InlineStat label="Pending" value={stats.pendingInfraCount} />
      <VerificationProgressBadge
        percent={stats.verificationProgressPercent}
        verifiedCategories={stats.verifiedCategoryCount}
        activeCategories={stats.activeCategoryCount}
      />
    </div>
  );
}
