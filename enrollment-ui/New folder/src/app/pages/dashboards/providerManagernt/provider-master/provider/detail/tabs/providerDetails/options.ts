import { getApi, providerApi } from "@/app/api/apiService";
import {
  fetchProviderIdentifierTypeMasterAPI,
  fetchProviderTaxonomyMasterAPI,
} from "@/store/features/providerMasters/providerMastersAPI";
import { PROVIDER_TYPE_MASTER_API_KEYS as TAXONOMY_KEYS } from "@/store/features/providerMasters/providerTypeMasterFieldKeys";
import { formatProviderTaxonomyLabel } from "../../../utils/providerTypeConstants";
import {
  PROVIDER_DETAIL_IDENTIFIER_TYPE_OLD_PROVIDER_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_PROVIDER_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY,
} from "../../utils/sectionMerges/provider/providerDetailIdentifierFieldKeys";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function extractListRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload == null || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data;

  const nested = record.data;
  if (nested != null && typeof nested === "object" && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>;
    for (const key of ["data", "content", "items", "records"]) {
      if (Array.isArray(inner[key])) return inner[key] as unknown[];
    }
  }

  for (const key of ["content", "items", "records", "result", "payload"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }

  return [];
}

function readNameFromRow(item: unknown, ...keys: string[]): string {
  if (typeof item === "string") return item.trim();
  if (!isApiRecord(item)) return "";
  for (const key of keys) {
    const value = readString(item, key);
    if (value) return value;
  }
  return "";
}

// --- Provider taxonomy options ---

export type ProviderTypeOption = {
  providerTypeId: string;
  typeCode: string;
};

export type ProviderTaxonomyOption = {
  providerTypeId: string;
  classCode: string;
  subclassCode: string;
  displayName: string;
  isActive: boolean;
};

export const DEFAULT_PROVIDER_TYPE = "HOSPITAL";

export const PROVIDER_TYPE_DROPDOWN_OPTIONS = [
  { value: DEFAULT_PROVIDER_TYPE, label: formatProviderTaxonomyLabel(DEFAULT_PROVIDER_TYPE) },
];

/** Matches GET `/v1/provider-type-master?typeCode=HOSPITAL`. */
export const PROVIDER_CLASS_TYPE_CODE = "HOSPITAL";

export function normalizeProviderTypeOption(item: unknown): ProviderTypeOption | null {
  if (!isApiRecord(item)) return null;

  const typeCode = readString(item, TAXONOMY_KEYS.typeCode);
  if (!typeCode) return null;

  const providerTypeId = readString(item, TAXONOMY_KEYS.providerTypeId);

  return { providerTypeId, typeCode };
}

export function normalizeProviderTypeOptionList(items: unknown[]): ProviderTypeOption[] {
  return items
    .map((item) => normalizeProviderTypeOption(item))
    .filter((row): row is ProviderTypeOption => row != null);
}

export function normalizeProviderTaxonomyOption(item: unknown): ProviderTaxonomyOption | null {
  if (!isApiRecord(item)) return null;

  const classCode = readString(item, TAXONOMY_KEYS.classCode);
  if (!classCode) return null;

  // API may return subclassCode: null — category rows are class-level only.
  const subclassCode = readString(item, TAXONOMY_KEYS.subclassCode);
  const displayName = readString(item, TAXONOMY_KEYS.displayName);
  const providerTypeId = readString(item, TAXONOMY_KEYS.providerTypeId);
  const isActiveRaw = item[TAXONOMY_KEYS.isActive];
  const isActive = isActiveRaw !== false;

  return {
    providerTypeId,
    classCode,
    subclassCode,
    displayName: displayName || formatProviderTaxonomyLabel(classCode),
    isActive,
  };
}

export function normalizeProviderTaxonomyOptionList(
  items: unknown[],
): ProviderTaxonomyOption[] {
  return items
    .map((item) => normalizeProviderTaxonomyOption(item))
    .filter((row): row is ProviderTaxonomyOption => row != null);
}

export function toProviderTypeDropdownOptions(
  rows: ProviderTypeOption[],
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  const options: Array<{ label: string; value: string }> = [];

  for (const row of rows) {
    if (seen.has(row.typeCode)) continue;
    seen.add(row.typeCode);
    options.push({
      value: row.typeCode,
      label: formatProviderTaxonomyLabel(row.typeCode),
    });
  }

  return [{ value: "", label: "Select" }, ...options];
}

/** Add Provider: dropdown values are `providerTypeId` (POST body field). */
export function toProviderTypeIdDropdownOptions(
  rows: ProviderTypeOption[],
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  const options: Array<{ label: string; value: string }> = [];

  for (const row of rows) {
    const value = row.providerTypeId.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    options.push({
      value,
      label: formatProviderTaxonomyLabel(row.typeCode),
    });
  }

  return [{ value: "", label: "Select" }, ...options];
}

/** Resolves locked Hospital (or other) typeCode to the first matching providerTypeId. */
export function resolveDefaultProviderTypeId(
  rows: ProviderTypeOption[],
  lockedTypeCode?: string,
): string {
  const locked = String(lockedTypeCode ?? "").trim().toUpperCase();
  const match = locked
    ? rows.find(
        (row) =>
          row.typeCode.trim().toUpperCase() === locked &&
          row.providerTypeId.trim() !== "",
      )
    : rows.find((row) => row.providerTypeId.trim() !== "");
  return match?.providerTypeId?.trim() || "";
}

export function toProviderClassDropdownOptions(
  rows: ProviderTaxonomyOption[],
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  const options: Array<{ label: string; value: string }> = [];
  // Prefer active rows when the same category appears more than once.
  const ordered = [...rows].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive),
  );

  for (const row of ordered) {
    const value = row.providerTypeId.trim() || row.classCode;
    if (!value || seen.has(value)) continue;
    seen.add(value);
    options.push({
      value,
      label: row.displayName || formatProviderTaxonomyLabel(row.classCode),
    });
  }

  return [{ value: "", label: "Select" }, ...options];
}

/**
 * Multi-select options from provider-type-master category rows.
 * Uses `providerTypeId` + `displayName` — no empty "Select" placeholder.
 */
export function toProviderTypeMasterMultiSelectOptions(
  rows: ProviderTaxonomyOption[],
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  const options: Array<{ label: string; value: string }> = [];
  const ordered = [...rows].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive),
  );

  for (const row of ordered) {
    const value = row.providerTypeId.trim() || row.classCode;
    if (!value || seen.has(value)) continue;
    seen.add(value);
    options.push({
      value,
      label: row.displayName || formatProviderTaxonomyLabel(row.classCode),
    });
  }

  return options;
}

/** @deprecated Prefer `toProviderTypeMasterMultiSelectOptions` for multi-select. */
export function toProviderSubclassDropdownOptions(
  rows: ProviderTaxonomyOption[],
): Array<{ label: string; value: string }> {
  const withSubclass = rows.filter((row) => row.subclassCode.trim() !== "");
  if (withSubclass.length > 0) {
    return withSubclass.map((row) => ({
      value: row.subclassCode,
      label: row.displayName || row.subclassCode,
    }));
  }

  return toProviderTypeMasterMultiSelectOptions(rows);
}

export function toLockedProviderTypeDropdownOptions(): Array<{ label: string; value: string }> {
  return [...PROVIDER_TYPE_DROPDOWN_OPTIONS];
}

export function formatProviderTypeLabel(value: string | undefined): string | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;
  return formatProviderTaxonomyLabel(trimmed);
}

export function resolveProviderTypeLabel(
  typeCode: string | undefined,
  options: Array<{ label: string; value: string }>,
): string | undefined {
  const trimmed = String(typeCode ?? "").trim();
  if (!trimmed) return undefined;
  const match = options.find((option) => option.value === trimmed);
  return match?.label ?? formatProviderTaxonomyLabel(trimmed);
}

export function resolveProviderClassLabel(
  classCode: string | undefined,
  options: Array<{ label: string; value: string }>,
): string | undefined {
  const trimmed = String(classCode ?? "").trim();
  if (!trimmed) return undefined;
  const match = options.find((option) => option.value === trimmed);
  return match?.label ?? formatProviderTaxonomyLabel(trimmed);
}

/** True when category label/code indicates Single Specialty (clinical speciality is single-select). */
export function isSingleSpecialtyProviderCategory(
  categoryValue: string | undefined,
  categoryOptions: Array<{ label: string; value: string }> = [],
): boolean {
  const value = String(categoryValue ?? "").trim();
  if (!value) return false;

  const label =
    categoryOptions.find((option) => option.value === value)?.label?.trim() || value;
  const haystack = `${label} ${value}`.toLowerCase();

  return (
    /single[\s_-]*special/.test(haystack) ||
    haystack.replace(/[\s_-]/g, "").includes("singlespecial")
  );
}

export function resolveProviderSubclassLabel(
  subclassCode: string | undefined,
  options: Array<{ label: string; value: string }>,
): string | undefined {
  const trimmed = String(subclassCode ?? "").trim();
  if (!trimmed) return undefined;
  const match = options.find((option) => option.value === trimmed);
  return match?.label ?? formatProviderTaxonomyLabel(trimmed);
}

export function resolveClinicalSpecialtyLabels(
  specialtyCodes: string[] | undefined,
  options: Array<{ label: string; value: string }>,
): string | undefined {
  const codes = (specialtyCodes ?? []).map((code) => String(code ?? "").trim()).filter(Boolean);
  if (codes.length === 0) return undefined;

  const labels = codes.map((code) => resolveProviderSubclassLabel(code, options) ?? code);
  return labels.join(", ");
}

// --- Provider system of medicine options ---

export type ProviderSystemOfMedicineOption = {
  id: string;
  name: string;
};

function readIdFromRow(item: unknown, ...keys: string[]): string {
  if (!isApiRecord(item)) return "";
  for (const key of keys) {
    const value = readString(item, key);
    if (value) return value;
  }
  return "";
}

export function normalizeProviderSystemOfMedicineOptionList(
  items: unknown[],
): ProviderSystemOfMedicineOption[] {
  const seen = new Set<string>();
  const options: ProviderSystemOfMedicineOption[] = [];

  for (const item of items) {
    const name = readNameFromRow(
      item,
      "providerSystemOfMedicineName",
      "systemOfMedicineName",
      "medicineName",
      "name",
    );
    const id =
      readIdFromRow(
        item,
        "providerSystemOfMedicineId",
        "systemOfMedicineId",
        "id",
      ) || name;
    if (!name || !id || seen.has(id)) continue;
    seen.add(id);
    options.push({ id, name });
  }

  return options;
}

export function toProviderSystemOfMedicineDropdownOptions(
  rows: ProviderSystemOfMedicineOption[],
): Array<{ label: string; value: string }> {
  return [
    { value: "", label: "Select" },
    ...rows.map((row) => ({
      value: row.id,
      label: row.name,
    })),
  ];
}

/** GET `/v1/provider-system-of-medicine?onlyName=true` */
export async function fetchProviderSystemOfMedicineOptions(): Promise<
  ProviderSystemOfMedicineOption[] | { error: string }
> {
  try {
    const response = await getApi<unknown>(providerApi, "/v1/provider-system-of-medicine", {
      params: { onlyName: true },
    });
    if (!response.success || response.data == null) {
      return {
        error: response.error ?? "Failed to fetch system of medicine options",
      };
    }

    return normalizeProviderSystemOfMedicineOptionList(extractListRows(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

/** Matches GET `/v1/provider-type-master?page=1&size=20&download=true`. */
export async function fetchProviderTypeOptions(): Promise<
  ProviderTypeOption[] | { error: string }
> {
  try {
    const payload = await fetchProviderTaxonomyMasterAPI({
      page: 1,
      size: 20,
      download: true,
    });
    return normalizeProviderTypeOptionList(extractListRows(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

export async function fetchProviderClassOptions(): Promise<
  ProviderTaxonomyOption[] | { error: string }
> {
  try {
    const payload = await fetchProviderTaxonomyMasterAPI({
      page: 1,
      size: 20,
      typeCode: PROVIDER_CLASS_TYPE_CODE,
      download: true,
    });
    return normalizeProviderTaxonomyOptionList(extractListRows(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

export async function fetchProviderSubclassOptions(
  classCode: string,
): Promise<ProviderTaxonomyOption[] | { error: string }> {
  const trimmedClassCode = classCode.trim();
  if (!trimmedClassCode) return [];

  try {
    const payload = await fetchProviderTaxonomyMasterAPI({
      page: 1,
      size: 20,
      typeCode: PROVIDER_CLASS_TYPE_CODE,
      classCode: trimmedClassCode,
      download: true,
    });
    return normalizeProviderTaxonomyOptionList(extractListRows(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

// --- Provider identifier type options ---

/** Rohini types shown first in the top identifier block. */
export const PRIMARY_IDENTIFIER_TYPE_NAMES = [
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE,
] as const;

/** Field keys for GET `/v1/provider-identifier-type-master`. */
export const PROVIDER_IDENTIFIER_TYPE_MASTER_KEYS = {
  identifierTypeId: "identifierTypeId",
  identifierTypeCode: "identifierTypeCode",
  identifierTypeName: "identifierTypeName",
  issuingAuthorityName: "issuingAuthorityName",
  sourceSystem: "sourceSystem",
  appliesToProvider: "appliesToProvider",
  appliesToFacility: "appliesToFacility",
  appliesToPractitioner: "appliesToPractitioner",
  allowsMultiple: "allowsMultiple",
  supportsValidityPeriod: "supportsValidityPeriod",
  recordStatus: "recordStatus",
} as const;

const IDENTIFIER_KEYS = PROVIDER_IDENTIFIER_TYPE_MASTER_KEYS;

export type NormalizedIdentifierTypeOption = {
  identifierTypeId: string;
  identifierTypeCode: string;
  identifierTypeName: string;
  issuingAuthorityName: string;
  sourceSystem: string;
  appliesToProvider: boolean;
  appliesToFacility: boolean;
  allowsMultiple: boolean;
  supportsValidityPeriod: boolean;
};

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  return record[key] === true;
}

function isActiveRecord(record: Record<string, unknown>): boolean {
  return readString(record, IDENTIFIER_KEYS.recordStatus).toLowerCase() === "active";
}

export function normalizeIdentifierTypeOption(item: unknown): NormalizedIdentifierTypeOption | null {
  if (!isApiRecord(item)) return null;
  if (!isActiveRecord(item)) return null;

  const identifierTypeName = readString(item, IDENTIFIER_KEYS.identifierTypeName);
  if (!identifierTypeName) return null;

  return {
    identifierTypeId: readString(item, IDENTIFIER_KEYS.identifierTypeId),
    identifierTypeCode: readString(item, IDENTIFIER_KEYS.identifierTypeCode),
    identifierTypeName,
    issuingAuthorityName: readString(item, IDENTIFIER_KEYS.issuingAuthorityName),
    sourceSystem: readString(item, IDENTIFIER_KEYS.sourceSystem),
    appliesToProvider: readBoolean(item, IDENTIFIER_KEYS.appliesToProvider),
    appliesToFacility: readBoolean(item, IDENTIFIER_KEYS.appliesToFacility),
    allowsMultiple: readBoolean(item, IDENTIFIER_KEYS.allowsMultiple),
    supportsValidityPeriod: readBoolean(item, IDENTIFIER_KEYS.supportsValidityPeriod),
  };
}

export function normalizeIdentifierTypeOptionList(
  items: unknown[],
): NormalizedIdentifierTypeOption[] {
  return items
    .map((item) => normalizeIdentifierTypeOption(item))
    .filter((row): row is NormalizedIdentifierTypeOption => row != null);
}

export function filterHospitalIdentifierTypeOptions(
  rows: NormalizedIdentifierTypeOption[],
): NormalizedIdentifierTypeOption[] {
  return rows.filter((row) => row.appliesToProvider || row.appliesToFacility);
}

export function toIdentifierTypeDropdownOptions(
  rows: NormalizedIdentifierTypeOption[],
): Array<{ label: string; value: string }> {
  return [
    { value: "", label: "Select identifier type" },
    ...rows.map((row) => ({
      value: row.identifierTypeId,
      label: row.identifierTypeName,
    })),
  ];
}

export function findIdentifierTypeOptionById(
  rows: NormalizedIdentifierTypeOption[],
  identifierTypeId: string,
): NormalizedIdentifierTypeOption | null {
  const trimmed = identifierTypeId.trim();
  if (!trimmed) return null;
  return rows.find((row) => row.identifierTypeId === trimmed) ?? null;
}

const CHILD_IDENTIFIER_EXCLUDED_TYPE_NAMES = new Set<string>([
  PROVIDER_DETAIL_IDENTIFIER_TYPE_OLD_PROVIDER_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_PROVIDER_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY,
  ...PRIMARY_IDENTIFIER_TYPE_NAMES,
]);

export function filterChildIdentifierTypeOptions(
  rows: NormalizedIdentifierTypeOption[],
): NormalizedIdentifierTypeOption[] {
  return rows.filter((row) => !CHILD_IDENTIFIER_EXCLUDED_TYPE_NAMES.has(row.identifierTypeName));
}

export function toChildIdentifierTypeDropdownOptions(
  rows: NormalizedIdentifierTypeOption[],
): Array<{ label: string; value: string }> {
  return toIdentifierTypeDropdownOptions(filterChildIdentifierTypeOptions(rows));
}

/** Matches GET `/v1/provider-identifier-type-master?page=1&size=20&download=true`. */
export async function fetchProviderIdentifierTypeOptions(): Promise<
  NormalizedIdentifierTypeOption[] | { error: string }
> {
  try {
    const payload = await fetchProviderIdentifierTypeMasterAPI({
      page: 1,
      size: 20,
      download: true,
    });
    const rows = normalizeIdentifierTypeOptionList(extractListRows(payload));
    return filterHospitalIdentifierTypeOptions(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}
