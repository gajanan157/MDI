import clsx from "clsx";
import type { RoomBedSummaryStats } from "../utils/roomBedSummaryStats";

type RoomBedSummaryCardsProps = {
  stats: RoomBedSummaryStats;
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

export function RoomBedSummaryCards({
  stats,
  className,
}: Readonly<RoomBedSummaryCardsProps>) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-700",
        className,
      )}
    >
      <InlineStat label="Room types" value={stats.roomTypes} />
      <Sep />
      <InlineStat label="Rooms" value={stats.rooms} />
      <Sep />
      <InlineStat label="Total beds" value={stats.totalBeds} />
      <Sep />
      <InlineStat label="ICU/HDU beds" value={stats.icuBeds} />
      <Sep />
      <InlineStat label="O₂ points" value={stats.oxygenPoints} />
    </div>
  );
}
