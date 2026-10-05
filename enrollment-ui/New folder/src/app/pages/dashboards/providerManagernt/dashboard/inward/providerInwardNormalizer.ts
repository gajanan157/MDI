import { BULK_IC_MAPPING_INWARD_API_KEYS as KEYS } from "../../provider-master/ic-corporate-mapping/inward/keys";
import {
  PROVIDER_INWARD_STATUS_LABEL,
} from "./providerInwardDashboardConfig";
import type { ProviderInwardApiStatus, ProviderInwardRow } from "./providerInwardTypes";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

const KNOWN_STATUSES: ProviderInwardApiStatus[] = [
  "PROCESSOR_PENDING",
  "QC_PENDING",
  "COMPLETED",
  "REJECTED_INWARD",
];

function readStatus(record: Record<string, unknown>): ProviderInwardApiStatus {
  const status = readString(record, KEYS.status);
  if (KNOWN_STATUSES.includes(status as ProviderInwardApiStatus)) {
    return status as ProviderInwardApiStatus;
  }

  const recordStatus = readString(record, KEYS.recordStatus).toLowerCase();
  if (recordStatus.includes("reject")) return "REJECTED_INWARD";
  if (recordStatus.includes("complete")) return "COMPLETED";
  if (recordStatus.includes("process") || recordStatus.includes("qc")) {
    return "QC_PENDING";
  }
  if (recordStatus.includes("pending")) return "PROCESSOR_PENDING";

  return "PROCESSOR_PENDING";
}

function formatLabel(value: string): string {
  if (!value) return "—";
  const trimmed = value.trim();
  if (
    trimmed === "IC_PROVIDER_MAPPING" ||
    trimmed.toUpperCase() === "IC_PROVIDER_MAPPING"
  ) {
    return "Maintenance Network & Mapping Records";
  }
  return trimmed
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCreatedBy(value: string): string {
  if (!value) return "—";
  return value
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeProviderInwardRow(
  item: unknown,
  index: number,
): ProviderInwardRow | null {
  if (!isApiRecord(item)) return null;

  const inwardNo = readString(item, KEYS.inwardNo);
  if (!inwardNo) return null;

  const status = readStatus(item);
  const createdDate =
    readString(item, KEYS.inwardReceivedAt) ||
    readString(item, KEYS.createdAt);

  return {
    id: inwardNo || `provider-inward-${index}`,
    inwardNo,
    createdDate,
    sourceEntity: readString(item, KEYS.sourceEntityName) || "—",
    sourceEntityId: readString(item, KEYS.inwardSourceEntityId),
    sourceEntityType: readString(item, KEYS.inwardSourceEntityType),
    category: readString(item, "departmentName") || "Provider Management",
    subcategory: formatLabel(readString(item, KEYS.s3SubBucketName)),
    documentType: readString(item, KEYS.documentType) || "—",
    status,
    statusLabel: PROVIDER_INWARD_STATUS_LABEL[status],
    assignedTo: readString(item, "assignedTo") || "Unassigned",
    createdBy: formatCreatedBy(readString(item, KEYS.createdBy)),
    s3BucketName: readString(item, "s3BucketName"),
    s3SubBucketName: readString(item, KEYS.s3SubBucketName),
    departmentId: readString(item, KEYS.departmentId),
  };
}

export function normalizeProviderInwardList(items: unknown[]): ProviderInwardRow[] {
  return items
    .map((item, index) => normalizeProviderInwardRow(item, index))
    .filter((row): row is ProviderInwardRow => row != null);
}
