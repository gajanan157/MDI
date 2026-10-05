import type { ManpowerFormRow } from "./manpowerTypes";

export type ManpowerSummaryStats = {
  categories: number;
  totalStaff: number;
  onDuty: number;
  onCall: number;
  trained: number;
  trainedPercent: number;
};

function toNum(value: string): number {
  const numeric = Number(value.trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

export function buildManpowerSummaryStats(
  rows: ManpowerFormRow[],
): ManpowerSummaryStats {
  const identified = rows.filter(
    (row) => row.manpowerType.trim() && row.employmentType.trim(),
  );
  const totalStaff = identified.reduce((sum, row) => sum + toNum(row.totalCount), 0);
  const onDuty = identified.reduce((sum, row) => sum + toNum(row.onDutyCount), 0);
  const onCall = identified.reduce((sum, row) => sum + toNum(row.onCallCount), 0);
  const trained = identified.reduce((sum, row) => sum + toNum(row.trainedCount), 0);
  const categories = new Set(
    identified.map((row) => row.manpowerType.trim().toLowerCase()),
  ).size;

  return {
    categories,
    totalStaff,
    onDuty,
    onCall,
    trained,
    trainedPercent: totalStaff > 0 ? Math.round((trained / totalStaff) * 100) : 0,
  };
}
