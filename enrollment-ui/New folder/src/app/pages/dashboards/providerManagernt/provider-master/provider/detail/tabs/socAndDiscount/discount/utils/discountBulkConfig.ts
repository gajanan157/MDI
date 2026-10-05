import { OPD_LIST_OPTIONS } from "../../../../../../ic-corporate-mapping/discountOptions";
import type { BulkDiscountTypeConfig } from "../types/discountTypes";

/** IPD discount types shown in the IPD multi-select. */
export const IPD_SELECT_DISCOUNT_TYPE_IDS = [
  "individual",
  "netBill",
  "approvedAmountDiscount",
  "package",
] as const;

/** Non-individual IPD discount types that each get their own config panel. */
export const BULK_DISCOUNT_TYPE_IDS = [
  "netBill",
  "approvedAmountDiscount",
  "package",
] as const;

/** Only one of these IPD types may be selected at a time. */
export const EXCLUSIVE_IPD_DISCOUNT_TYPE_GROUP = [
  "netBill",
  "approvedAmountDiscount",
] as const;

const EXCLUSIVE_IPD_DISCOUNT_TYPE_SET = new Set<string>(EXCLUSIVE_IPD_DISCOUNT_TYPE_GROUP);

export function hasConflictingExclusiveIpdDiscountTypes(types: string[]): boolean {
  return new Set((types ?? []).filter((type) => EXCLUSIVE_IPD_DISCOUNT_TYPE_SET.has(type))).size > 1;
}

/** Keep at most one of Net Bill / Approved Amount. Prefers `preferredType` when it is in the exclusive group. */
export function enforceExclusiveIpdDiscountTypes(
  types: string[],
  preferredType?: string,
): string[] {
  const list = (types ?? []).filter(Boolean);
  const exclusiveInList = list.filter((type) => EXCLUSIVE_IPD_DISCOUNT_TYPE_SET.has(type));
  if (exclusiveInList.length <= 1) return list;

  const keep =
    preferredType && EXCLUSIVE_IPD_DISCOUNT_TYPE_SET.has(preferredType)
      ? preferredType
      : exclusiveInList[exclusiveInList.length - 1];

  let kept = false;
  return list.filter((type) => {
    if (!EXCLUSIVE_IPD_DISCOUNT_TYPE_SET.has(type)) return true;
    if (type !== keep || kept) return false;
    kept = true;
    return true;
  });
}

export type BulkDiscountTypeId = (typeof BULK_DISCOUNT_TYPE_IDS)[number];

/** OPD discount types from master (`OPD_LIST_OPTIONS`). */
export const OPD_MASTER_DISCOUNT_TYPE_IDS = OPD_LIST_OPTIONS.map((row) => row.value);

export function getOpdMasterDiscountTypeOptions(): { value: string; label: string }[] {
  return (OPD_LIST_OPTIONS ?? []).map((row) => ({ value: row.value, label: row.label }));
}

export function normalizeDiscountTypes(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  const trimmed = String(value ?? "").trim();
  return trimmed ? [trimmed] : [];
}

const OPD_MASTER_DISCOUNT_TYPE_SET = new Set(OPD_MASTER_DISCOUNT_TYPE_IDS);
const IPD_SELECT_DISCOUNT_TYPE_SET = new Set<string>(IPD_SELECT_DISCOUNT_TYPE_IDS);

export function isIpdSelectDiscountType(type: string, ipdTypeIds?: readonly string[]): boolean {
  if (IPD_SELECT_DISCOUNT_TYPE_SET.has(type)) return true;
  if (ipdTypeIds && ipdTypeIds.length > 0) return ipdTypeIds.includes(type);
  return false;
}

export function isOpdMasterDiscountType(type: string, opdTypeIds?: readonly string[]): boolean {
  if (OPD_MASTER_DISCOUNT_TYPE_SET.has(type)) return true;
  if (opdTypeIds && opdTypeIds.length > 0) return opdTypeIds.includes(type);
  return false;
}

export function isPackagePpnVariant(value: string | undefined): value is "ppn" | "nonPpn" {
  return value === "ppn" || value === "nonPpn";
}

export function toProviderPpnFlag(variant: string | undefined): boolean | undefined {
  if (variant === "ppn") return true;
  if (variant === "nonPpn") return false;
  return undefined;
}

export function fromProviderPpnFlag(flag: boolean | null | undefined): "" | "ppn" | "nonPpn" {
  if (flag === true) return "ppn";
  if (flag === false) return "nonPpn";
  return "";
}

export function isBulkDiscountType(type: string): boolean {
  return Boolean(type) && type !== "individual";
}

export function getSelectedBulkDiscountTypes(types: string[]): string[] {
  return (types ?? []).filter((type) => Boolean(type) && type !== "individual");
}

export const EMPTY_BULK_DISCOUNT_CONFIG: BulkDiscountTypeConfig = {
  discountPercent: "",
  applicableOn: "",
  ppnVariant: "",
};

export function createEmptyBulkDiscountByType(
  types: string[],
): Record<string, BulkDiscountTypeConfig> {
  const next: Record<string, BulkDiscountTypeConfig> = {};
  getSelectedBulkDiscountTypes(types).forEach((type) => {
    next[type] = { ...EMPTY_BULK_DISCOUNT_CONFIG };
  });
  return next;
}

export function syncBulkDiscountByType(
  selectedTypes: string[],
  current: Record<string, BulkDiscountTypeConfig> | undefined,
): Record<string, BulkDiscountTypeConfig> {
  const next: Record<string, BulkDiscountTypeConfig> = {};
  getSelectedBulkDiscountTypes(selectedTypes).forEach((type) => {
    next[type] = {
      discountPercent: current?.[type]?.discountPercent ?? "",
      applicableOn: type === "package" ? (current?.[type]?.applicableOn ?? "") : "",
      ppnVariant: type === "package" ? (current?.[type]?.ppnVariant ?? "") : "",
    };
  });
  return next;
}

export function migrateLegacyBulkDiscount(
  discountTypes: string[],
  discountPercentSingle?: string,
  discountApplicableOn?: string,
  existing?: Record<string, BulkDiscountTypeConfig>,
): Record<string, BulkDiscountTypeConfig> {
  if (existing && Object.keys(existing).length > 0) {
    return syncBulkDiscountByType(discountTypes, existing);
  }
  const next = createEmptyBulkDiscountByType(discountTypes);
  const legacyPercent = String(discountPercentSingle ?? "").trim();
  const legacyApplicableOn = String(discountApplicableOn ?? "").trim();
  if (!legacyPercent && !legacyApplicableOn) return next;
  getSelectedBulkDiscountTypes(discountTypes).forEach((type) => {
    next[type] = {
      discountPercent: legacyPercent,
      applicableOn: legacyApplicableOn,
      ppnVariant: "",
    };
  });
  return next;
}
