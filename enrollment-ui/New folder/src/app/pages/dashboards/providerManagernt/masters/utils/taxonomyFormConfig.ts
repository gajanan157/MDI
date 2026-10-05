import type {
  ProviderMasterExtraValue,
  ProviderMasterRecord,
  ProviderMasterRecordStatus,
} from "./masterConfig";
import { Tenent_Id } from "@/utils/tenent";

export const DEFAULT_TAXONOMY_IS_ACTIVE: ProviderMasterRecordStatus = "ACTIVE";

export const TAXONOMY_ACTIVE_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
] as const;

export const PROVIDER_TYPE_SCOPE_OPTIONS = [
  { label: "ORGANIZATION", value: "ORGANIZATION" },
  { label: "PRACTITIONER", value: "PRACTITIONER" },
  { label: "BOTH", value: "BOTH" },
] as const;

export type TaxonomyFieldType = "text" | "dropdown";

export type TaxonomyField = {
  name: string;
  label: string;
  type: TaxonomyFieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

export const TAXONOMY_FIELDS: TaxonomyField[] = [
  { name: "type_code", label: "Provider Type", type: "text", required: true },
  { name: "class_code", label: "Category", type: "text", required: true },
  { name: "subclass_code", label: "Subcategory", type: "text", required: true },
  { name: "display_name", label: "Display Name", type: "text", required: true },
  {
    name: "provider_type_scope",
    label: "Provider Type Scope",
    type: "dropdown",
    required: true,
    options: [...PROVIDER_TYPE_SCOPE_OPTIONS],
  },
  // { name: "sort_order", label: "Sort Order", type: "text" },
  {
    name: "is_active",
    label: "Status",
    type: "dropdown",
    required: true,
    options: [...TAXONOMY_ACTIVE_OPTIONS],
  },
];

const TAXONOMY_FORM_TO_API: Record<string, string> = {
  type_code: "typeCode",
  class_code: "classCode",
  subclass_code: "subclassCode",
  display_name: "displayName",
  provider_type_scope: "providerTypeScope",
  sort_order: "sortOrder",
};

export function createTaxonomyFormDefaults(): Record<string, ProviderMasterExtraValue> {
  return TAXONOMY_FIELDS.reduce<Record<string, ProviderMasterExtraValue>>(
    (acc, field) => {
      if (field.name === "is_active") {
        acc[field.name] = DEFAULT_TAXONOMY_IS_ACTIVE;
        return acc;
      }
      acc[field.name] = "";
      return acc;
    },
    {},
  );
}

export function mapRecordToTaxonomyFormExtra(
  record: ProviderMasterRecord,
): Record<string, ProviderMasterExtraValue> {
  return {
    ...createTaxonomyFormDefaults(),
    type_code: record.code,
    class_code: String(record.extra?.class_code ?? record.extra?.classCode ?? ""),
    subclass_code: String(record.extra?.subclass_code ?? record.extra?.subclassCode ?? ""),
    display_name: record.name,
    provider_type_scope: record.description,
    sort_order: String(record.extra?.sort_order ?? record.extra?.sortOrder ?? ""),
    is_active: record.recordStatus,
  };
}

export function getTaxonomyFormValidationError(
  extra: Record<string, ProviderMasterExtraValue>,
): string | null {
  for (const field of TAXONOMY_FIELDS) {
    if (!field.required) continue;
    if (!String(extra[field.name] ?? "").trim()) {
      return `${field.label} is required.`;
    }
  }
  return null;
}

export function isTaxonomyFormValid(
  extra: Record<string, ProviderMasterExtraValue>,
): boolean {
  return getTaxonomyFormValidationError(extra) === null;
}

function taxonomyIsActiveValue(value: ProviderMasterExtraValue | undefined): boolean {
  if (typeof value === "boolean") return value;
  return String(value ?? DEFAULT_TAXONOMY_IS_ACTIVE).trim().toLowerCase() === "active";
}

function taxonomyRecordStatus(
  value: ProviderMasterExtraValue | undefined,
): ProviderMasterRecordStatus {
  return taxonomyIsActiveValue(value) ? "ACTIVE" : "INACTIVE";
}

export function buildTaxonomyListParams(
  page: number,
  size: number,
  filters: Record<string, unknown>,
): {
  page: number;
  size: number;
  typeCode?: string;
  displayName?: string;
  recordStatus?: string;
} {
  const params: {
    page: number;
    size: number;
    typeCode?: string;
    displayName?: string;
    recordStatus?: string;
  } = { page, size };

  const typeCode = String(filters.code ?? "").trim();
  const displayName = String(filters.name ?? "").trim();
  const recordStatus = String(filters.status ?? "").trim();

  if (typeCode) params.typeCode = typeCode;
  if (displayName) params.displayName = displayName;
  if (recordStatus) params.recordStatus = recordStatus;

  return params;
}

export function buildTaxonomyCreatePayload(
  extra: Record<string, ProviderMasterExtraValue>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    tenantId: Tenent_Id,
    typeCode: String(extra.type_code ?? "").trim(),
    classCode: String(extra.class_code ?? "").trim(),
    subclassCode: String(extra.subclass_code ?? "").trim(),
    displayName: String(extra.display_name ?? "").trim(),
    providerTypeScope: String(extra.provider_type_scope ?? "").trim(),
    isActive: taxonomyIsActiveValue(extra.is_active),
  };

  const sortOrder = String(extra.sort_order ?? "").trim();
  if (sortOrder) payload.sortOrder = sortOrder;

  return payload;
}

export function buildTaxonomyPatchPayload(
  current: Record<string, ProviderMasterExtraValue>,
  original: Record<string, ProviderMasterExtraValue>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = { tenantId: Tenent_Id };

  for (const field of TAXONOMY_FIELDS) {
    const currentValue = current[field.name];
    const originalValue = original[field.name];

    if (field.name === "is_active") {
      if (taxonomyIsActiveValue(currentValue) !== taxonomyIsActiveValue(originalValue)) {
        payload.isActive = taxonomyIsActiveValue(currentValue);
        payload.recordStatus = taxonomyRecordStatus(currentValue);
      }
      continue;
    }

    const currentStr = String(currentValue ?? "").trim();
    const originalStr = String(originalValue ?? "").trim();
    if (currentStr !== originalStr) {
      const apiKey = TAXONOMY_FORM_TO_API[field.name] ?? field.name;
      payload[apiKey] = currentStr;
    }
  }

  if (Object.keys(payload).length === 1) {
    return {};
  }

  return payload;
}
