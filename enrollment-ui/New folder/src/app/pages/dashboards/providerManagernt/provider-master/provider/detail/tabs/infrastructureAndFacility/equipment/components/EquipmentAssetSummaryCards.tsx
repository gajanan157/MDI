import clsx from "clsx";
import type { EquipmentAssetSummaryStats } from "../utils/equipmentAssetSummaryStats";

type EquipmentAssetSummaryCardsProps = {
  stats: EquipmentAssetSummaryStats;
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
  tone,
}: Readonly<{ label: string; value: string | number; tone?: "warn" }>) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span
        className={clsx(
          "text-[11px] font-bold tabular-nums",
          tone === "warn" && Number(value) > 0 ? "text-amber-600" : "text-slate-900",
        )}
      >
        {value}
      </span>
    </span>
  );
}

export function EquipmentAssetSummaryCards({
  stats,
  className,
}: Readonly<EquipmentAssetSummaryCardsProps>) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-700",
        className,
      )}
    >
      <InlineStat label="Asset types" value={stats.assetTypes} />
      <Sep />
      <InlineStat label="Total units" value={stats.totalUnits} />
      <Sep />
      <InlineStat label="Under AMC" value={stats.underAmc} />
      <Sep />
      <InlineStat label="Calibration due" value={stats.calibrationDue} tone="warn" />
      <Sep />
      <InlineStat label="Maintenance due" value={stats.maintenanceDue} tone="warn" />
    </div>
  );
}
