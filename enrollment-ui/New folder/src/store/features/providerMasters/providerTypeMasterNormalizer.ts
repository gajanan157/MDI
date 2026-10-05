import type { ProviderMasterRecord } from "@/app/pages/dashboards/providerManagernt/masters/utils/masterConfig";
import { PROVIDER_TYPE_MASTER_API_KEYS as KEYS } from "./providerTypeMasterFieldKeys";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readRecordStatus(
  record: Record<string, unknown>,
): ProviderMasterRecord["recordStatus"] {
  const status = readString(record, KEYS.recordStatus).toLowerCase();
  if (status === "inactive") return "INACTIVE";
  if (status === "active") return "ACTIVE";

  const isActive = record[KEYS.isActive];
  if (isActive === false) return "INACTIVE";
  if (isActive === true) return "ACTIVE";

  return "ACTIVE";
}

/** Maps one `GET /v1/provider-type-master` row to the masters grid shape. */
export function normalizeProviderTypeMasterRow(
  item: unknown,
): ProviderMasterRecord | null {
  if (!isApiRecord(item)) return null;

  const id = readString(item, KEYS.providerTypeId);
  if (!id) return null;

  const typeCode = readString(item, KEYS.typeCode);
  const displayName = readString(item, KEYS.displayName);
  if (!typeCode && !displayName) return null;

  return {
    id,
    code: typeCode,
    name: displayName,
    description: readString(item, KEYS.providerTypeScope),
    recordStatus: readRecordStatus(item),
    extra: {
      classCode: readString(item, KEYS.classCode),
      subclassCode: readString(item, KEYS.subclassCode),
      sortOrder: readString(item, KEYS.sortOrder),
    },
  };
}

export function normalizeProviderTypeMasterList(
  items: unknown[],
): ProviderMasterRecord[] {
  return items
    .map((item) => normalizeProviderTypeMasterRow(item))
    .filter((row): row is ProviderMasterRecord => row != null);
}
