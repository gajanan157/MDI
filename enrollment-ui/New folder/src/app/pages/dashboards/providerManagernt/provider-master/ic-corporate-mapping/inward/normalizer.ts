import type { BulkIcMappingInwardRow, BulkIcMappingInwardStatus } from "./rows";
import { BULK_IC_MAPPING_INWARD_API_KEYS as KEYS } from "./keys";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

const BULK_IC_MAPPING_INWARD_STATUSES: BulkIcMappingInwardStatus[] = [
  "COMPLETED",
  "QC_PENDING",
  "PROCESSOR_PENDING",
  "REJECTED_INWARD",
];

function readStatus(record: Record<string, unknown>): BulkIcMappingInwardStatus {
  const status = readString(record, KEYS.status);
  if (BULK_IC_MAPPING_INWARD_STATUSES.includes(status as BulkIcMappingInwardStatus)) {
    return status as BulkIcMappingInwardStatus;
  }
  return "PROCESSOR_PENDING";
}

/** Maps one `v1/files/inwards` row to the bulk IC mapping grid shape. */
export function normalizeBulkIcMappingInwardRow(
  item: unknown,
  index: number,
): BulkIcMappingInwardRow | null {
  if (!isApiRecord(item)) return null;

  const inwardNo = readString(item, KEYS.inwardNo);
  if (!inwardNo) return null;

  return {
    id: inwardNo || `bulk-inward-${index}`,
    inwardNo,
    policyNo: readString(item, KEYS.inwardSourceReferenceNo),
    insurerName: readString(item, KEYS.sourceEntityName),
    corporateName: readString(item, KEYS.corporateName),
    fileName: readString(item, KEYS.originalFileName),
    createdAt: readString(item, KEYS.inwardReceivedAt),
    documentType: readString(item, KEYS.documentType),
    inwardType: readString(item, KEYS.s3SubBucketName),
    uploadedByName: readString(item, KEYS.createdBy),
    recordStatus: readString(item, KEYS.recordStatus),
    status: readStatus(item),
    inwardSourceEntityId: readString(item, KEYS.inwardSourceEntityId),
    inwardSourceEntityType: readString(item, KEYS.inwardSourceEntityType),
    inwardReceivedTpaBranchId: readString(item, KEYS.inwardReceivedTpaBranchId),
    departmentId: readString(item, KEYS.departmentId),
  };
}

export function normalizeBulkIcMappingInwardList(items: unknown[]): BulkIcMappingInwardRow[] {
  return items
    .map((item, index) => normalizeBulkIcMappingInwardRow(item, index))
    .filter((row): row is BulkIcMappingInwardRow => row != null);
}
