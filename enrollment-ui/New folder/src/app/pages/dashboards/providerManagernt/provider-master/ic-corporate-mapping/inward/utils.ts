import type { BulkIcMappingInwardRow, BulkIcMappingInwardStatus } from "./rows";

export type BulkIcMappingStatusFilter = "ALL" | BulkIcMappingInwardStatus;

export type BulkIcMappingStatusCounts = Record<BulkIcMappingInwardStatus, number> & {
  total: number;
};

export function countBulkIcMappingInwardStatuses(
  rows: BulkIcMappingInwardRow[],
): BulkIcMappingStatusCounts {
  const counts: BulkIcMappingStatusCounts = {
    total: rows.length,
    COMPLETED: 0,
    QC_PENDING: 0,
    PROCESSOR_PENDING: 0,
    REJECTED_INWARD: 0,
  };

  for (const row of rows) {
    counts[row.status] += 1;
  }

  return counts;
}

export function filterBulkIcMappingRowsByStatus(
  rows: BulkIcMappingInwardRow[],
  statusFilter: BulkIcMappingStatusFilter,
): BulkIcMappingInwardRow[] {
  if (statusFilter === "ALL") return rows;
  return rows.filter((row) => row.status === statusFilter);
}
