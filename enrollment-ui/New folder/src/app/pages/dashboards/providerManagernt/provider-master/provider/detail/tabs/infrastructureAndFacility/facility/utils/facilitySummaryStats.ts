import type { FacilityFormRow } from "./facilityTypes";

export type FacilitySummaryStats = {
  categories: number;
  available: number;
  outsourced: number;
  emergency: number;
  aroundTheClock: number;
  total: number;
};

export function buildFacilitySummaryStats(
  rows: FacilityFormRow[],
): FacilitySummaryStats {
  const identified = rows.filter(
    (row) => row.facilityCategory.trim() && row.facilityType.trim(),
  );
  return {
    categories: new Set(
      identified.map((row) => row.facilityCategory.trim().toLowerCase()),
    ).size,
    total: identified.length,
    available: identified.filter((row) => row.availabilityFlag).length,
    outsourced: identified.filter(
      (row) => row.serviceMode.trim().toLowerCase() === "outsourced",
    ).length,
    emergency: identified.filter((row) => row.emergencySupportFlag).length,
    aroundTheClock: identified.filter((row) => row.twentyFourBySevenFlag).length,
  };
}
