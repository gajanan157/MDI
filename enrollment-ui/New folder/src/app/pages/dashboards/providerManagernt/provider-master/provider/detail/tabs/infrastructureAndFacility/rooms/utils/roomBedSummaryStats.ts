import type { RoomBedFormRow } from "./roomBedTypes";

export type RoomBedSummaryStats = {
  roomTypes: number;
  rooms: number;
  totalBeds: number;
  icuBeds: number;
  oxygenPoints: number;
};

function toNum(value: string): number {
  const numeric = Number(value.trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

export function buildRoomBedSummaryStats(
  rows: RoomBedFormRow[],
): RoomBedSummaryStats {
  const identified = rows.filter((row) => row.roomType.trim());
  const totalBeds = identified.reduce((sum, row) => sum + toNum(row.totalBedCount), 0);
  const icuBeds = identified
    .filter((row) => /icu|hdu|nicu|picu|iccu/i.test(row.roomType))
    .reduce((sum, row) => sum + toNum(row.totalBedCount), 0);

  return {
    roomTypes: identified.length,
    rooms: identified.reduce((sum, row) => sum + toNum(row.roomCount), 0),
    totalBeds,
    icuBeds,
    oxygenPoints: identified.filter((row) => row.oxygenPointFlag).length,
  };
}
