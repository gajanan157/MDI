import { BULK_IC_MAPPING_INWARD_API_KEYS as KEYS } from "../../ic-corporate-mapping/inward/keys";
import type { BankVerificationInwardRow } from "../inwardTypes";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

/** Maps one `v1/files/inwards` row to the bank-verification inward grid shape. */
export function normalizeBankVerificationInwardRow(
  item: unknown,
  index: number,
): BankVerificationInwardRow | null {
  if (!isApiRecord(item)) return null;

  const inwardNo = readString(item, KEYS.inwardNo);
  if (!inwardNo) return null;

  const insurerId = readString(item, KEYS.inwardSourceEntityId);

  return {
    id: inwardNo || `bank-inward-${index}`,
    inwardNo,
    insurerName:
      readString(item, KEYS.sourceEntityName) || readString(item, KEYS.insurerName),
    insurerId,
    recordStatus: readString(item, KEYS.recordStatus) || "Active",
    createdAt:
      readString(item, KEYS.inwardReceivedAt) || readString(item, KEYS.createdAt),
    uploadedByName: readString(item, KEYS.createdBy),
    configuredIcId: insurerId,
    dataFileName:
      readString(item, KEYS.originalFileName) || readString(item, KEYS.fileName),
  };
}

export function normalizeBankVerificationInwardList(
  items: unknown[],
): BankVerificationInwardRow[] {
  return items
    .map((item, index) => normalizeBankVerificationInwardRow(item, index))
    .filter((row): row is BankVerificationInwardRow => row != null);
}
