import { daysUntil } from "./equipmentAssetFormMapper";
import type { EquipmentAssetFormRow } from "./equipmentAssetTypes";

export type EquipmentAssetSummaryStats = {
  assetTypes: number;
  totalUnits: number;
  underAmc: number;
  calibrationDue: number;
  maintenanceDue: number;
};

function toNum(value: string): number {
  const numeric = Number(value.trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

export function buildEquipmentAssetSummaryStats(
  rows: EquipmentAssetFormRow[],
  now: Date = new Date(),
): EquipmentAssetSummaryStats {
  const identified = rows.filter((row) => row.equipmentType.trim());
  const soon = 30;

  return {
    assetTypes: identified.length,
    totalUnits: identified.reduce(
      (sum, row) => sum + Math.max(toNum(row.quantity), row.serialNumber.trim() ? 1 : 0),
      0,
    ),
    underAmc: identified.filter((row) => row.amcFlag).length,
    calibrationDue: identified.filter((row) => {
      if (!row.calibrationRequiredFlag) return false;
      const days = daysUntil(row.nextCalibrationDate, now);
      return days != null && days <= soon;
    }).length,
    maintenanceDue: identified.filter((row) => {
      const days = daysUntil(row.maintenanceDueDate, now);
      return days != null && days <= soon;
    }).length,
  };
}
