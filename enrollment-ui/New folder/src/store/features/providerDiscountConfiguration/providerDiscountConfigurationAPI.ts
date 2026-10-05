import { getApi, patchApi, postApi, providerApi } from "@/app/api/apiService";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import {
  isApiRecord,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import {
  PROVIDER_DISCOUNT_CONFIGURATION_KEYS as KEYS,
  PROVIDER_DISCOUNT_CONFIGURATION_LIST_FILTER_KEYS as FILTER_KEYS,
  PROVIDER_DISCOUNT_CONFIGURATION_MAPPING_KEYS as MAPPING_KEYS,
  PROVIDER_DISCOUNT_CONFIGURATION_TYPE_KEYS as TYPE_KEYS,
  type NormalizedProviderDiscountConfiguration,
  type ProviderDiscountConfigurationListFilters,
  type CreateProviderDiscountConfigurationBody,
  type PatchProviderDiscountConfigurationBody,
  type ProviderDiscountInclusionExclusion,
  type ProviderDiscountInsurerCorporateMapping,
  type ProviderDiscountSubtypeDetail,
  type ProviderDiscountTypeDetail,
} from "./providerDiscountConfigurationTypes";

const CONFIGURATION_PATH = "/v1/provider/configuration";
const PROVIDER_PATH = "/v1/provider";

export type FetchProviderDiscountConfigurationListResult =
  | {
      ok: true;
      rows: NormalizedProviderDiscountConfiguration[];
      totalRecords: number;
    }
  | { ok: false; message?: string };

export type FetchProviderDiscountConfigurationByIdResult =
  | { ok: true; row: NormalizedProviderDiscountConfiguration }
  | { ok: false; message?: string };

export type CreateProviderDiscountConfigurationResult =
  | {
      ok: true;
      row: NormalizedProviderDiscountConfiguration;
      message?: string;
    }
  | { ok: false; message?: string; status?: number };

export type PatchProviderDiscountConfigurationResult =
  | {
      ok: true;
      row: NormalizedProviderDiscountConfiguration;
      message?: string;
    }
  | { ok: false; message?: string; status?: number };

function getString(raw: Record<string, unknown>, key: string): string {
  const value = raw[key];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

function pickFirstString(raw: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = getString(raw, key);
    if (value) return value;
  }
  return "";
}

function getStringArray(raw: Record<string, unknown>, key: string): string[] {
  const value = raw[key];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" || typeof item === "number" ? String(item).trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getBoolean(raw: Record<string, unknown>, key: string): boolean {
  const value = raw[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return false;
}

function getNumberOrNull(raw: Record<string, unknown>, key: string): number | null {
  const value = raw[key];
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toJoinedCsv(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean).join(",");
  }
  return value?.trim() ?? "";
}

function buildListQuery(filters?: ProviderDiscountConfigurationListFilters): string {
  const search = new URLSearchParams();
  const providerId = filters?.providerId?.trim();
  if (providerId) search.set(FILTER_KEYS.providerId, providerId);

  const insurerIds = toJoinedCsv(filters?.insurerIds);
  if (insurerIds) search.set(FILTER_KEYS.insurerIds, insurerIds);

  const corporateIds = toJoinedCsv(filters?.corporateIds);
  if (corporateIds) search.set(FILTER_KEYS.corporateIds, corporateIds);

  if (filters?.corporateSpecificFlag === true) {
    search.set(FILTER_KEYS.corporateSpecificFlag, "true");
  } else if (filters?.corporateSpecificFlag === false) {
    search.set(FILTER_KEYS.corporateSpecificFlag, "false");
  }

  if (filters?.providerDiscountStatus?.trim()) {
    search.set(FILTER_KEYS.providerDiscountStatus, filters.providerDiscountStatus.trim());
  }
  if (filters?.page != null) search.set(FILTER_KEYS.page, String(filters.page));
  if (filters?.size != null) search.set(FILTER_KEYS.size, String(filters.size));

  const query = search.toString();
  return query ? `?${query}` : "";
}

function readTotalRecords(payload: unknown, rowCount: number): number {
  if (!isApiRecord(payload)) return rowCount;
  const pagination = payload.pagination;
  if (isApiRecord(pagination) && typeof pagination.totalRecords === "number") {
    return pagination.totalRecords;
  }
  if (typeof payload.totalRecords === "number") return payload.totalRecords;
  if (typeof payload.totalElements === "number") return payload.totalElements;
  return rowCount;
}

function extractRawListItems(payload: unknown): unknown[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (!isApiRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  const dataNode = payload.data;
  if (isApiRecord(dataNode)) {
    if (Array.isArray(dataNode.content)) return dataNode.content;
    if (Array.isArray(dataNode.items)) return dataNode.items;
    if (Array.isArray(dataNode.list)) return dataNode.list;
  }
  return [];
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isApiRecord);
}

function normalizeInclusionExclusion(
  raw: Record<string, unknown>,
): ProviderDiscountInclusionExclusion {
  return {
    providerDiscountInclusionTypeId: getString(raw, "providerDiscountInclusionTypeId"),
    providerDiscountExclusionTypeId: getString(raw, "providerDiscountExclusionTypeId"),
    providerInclusionExclusionMasterId: getString(raw, "providerInclusionExclusionMasterId"),
    providerInclusionExclusionName: getString(raw, "providerInclusionExclusionName"),
  };
}

function normalizeSubtype(raw: Record<string, unknown>): ProviderDiscountSubtypeDetail {
  return {
    providerDiscountSubtypeDetailId:
      getString(raw, "providerDiscountSubtypeDetailId") ||
      getString(raw, "providerDiscountSubTypeDetailId"),
    providerDiscountSubtypeMasterId:
      getString(raw, "providerDiscountSubtypeMasterId") ||
      getString(raw, "providerDiscountSubTypeMasterId"),
    providerDiscountSubtypeName:
      getString(raw, "providerDiscountSubtypeName") ||
      getString(raw, "providerDiscountSubTypeName"),
    providerDiscountPercentage: getNumberOrNull(raw, "providerDiscountPercentage"),
    providerDiscountAmount: getNumberOrNull(raw, "providerDiscountAmount"),
  };
}

function normalizeMapping(raw: Record<string, unknown>): ProviderDiscountInsurerCorporateMapping {
  return {
    providerInsurerCorporateDiscountId: getString(
      raw,
      MAPPING_KEYS.providerInsurerCorporateDiscountId,
    ),
    insurerCorporateDiscountMappingLevel: getString(
      raw,
      MAPPING_KEYS.insurerCorporateDiscountMappingLevel,
    ),
    insurerId: getString(raw, MAPPING_KEYS.insurerId),
    insurerName: getString(raw, MAPPING_KEYS.insurerName),
    corporateId: getString(raw, MAPPING_KEYS.corporateId),
    corporateName: getString(raw, MAPPING_KEYS.corporateName),
  };
}

function normalizeTypeDetail(raw: Record<string, unknown>): ProviderDiscountTypeDetail {
  return {
    providerDiscountTypeDetailId: getString(raw, TYPE_KEYS.providerDiscountTypeDetailId),
    providerDiscountTypeMasterId: getString(raw, TYPE_KEYS.providerDiscountTypeMasterId),
    providerDiscountTypeName: getString(raw, TYPE_KEYS.providerDiscountTypeName),
    providerServiceType: getString(raw, TYPE_KEYS.providerServiceType),
    providerDiscountPercentage: getNumberOrNull(raw, TYPE_KEYS.providerDiscountPercentage),
    providerDiscountAmount: getNumberOrNull(raw, TYPE_KEYS.providerDiscountAmount),
    providerSocId: getString(raw, TYPE_KEYS.providerSocId),
    providerSocName: pickFirstString(raw, [
      TYPE_KEYS.providerSocName,
      "socName",
    ]),
    providerSocCode: pickFirstString(raw, [
      TYPE_KEYS.providerSocCode,
      "socCode",
    ]),
    isActive:
      raw[TYPE_KEYS.isActive] == null || raw[TYPE_KEYS.isActive] === ""
        ? true
        : getBoolean(raw, TYPE_KEYS.isActive),
    subtypeDetails: asRecordArray(raw[TYPE_KEYS.subtypeDetails]).map(normalizeSubtype),
    inclusions: asRecordArray(raw[TYPE_KEYS.inclusions]).map(normalizeInclusionExclusion),
    exclusions: asRecordArray(raw[TYPE_KEYS.exclusions]).map(normalizeInclusionExclusion),
    providerPpnFlag: raw[TYPE_KEYS.providerPpnFlag] == null
      ? null
      : getBoolean(raw, TYPE_KEYS.providerPpnFlag),
  };
}

export function normalizeProviderDiscountConfiguration(
  raw: unknown,
): NormalizedProviderDiscountConfiguration | null {
  if (!isApiRecord(raw)) return null;
  const id = getString(raw, KEYS.providerDiscountConfigurationId);
  if (!id) return null;

  return {
    providerDiscountConfigurationId: id,
    providerId: getString(raw, KEYS.providerId),
    providerName: getString(raw, KEYS.providerName),
    providerAgreementId: getString(raw, KEYS.providerAgreementId),
    providerAgreementName: pickFirstString(raw, [
      KEYS.providerAgreementName,
      "providerAgreementName",
    ]),
    providerAgreementType: getString(raw, KEYS.providerAgreementType),
    corporateSpecificFlag: getBoolean(raw, KEYS.corporateSpecificFlag),
    providerDiscountStatus: getString(raw, KEYS.providerDiscountStatus),
    providerDiscountEffectiveFrom: getString(raw, KEYS.providerDiscountEffectiveFrom),
    providerDiscountEffectiveTo: getString(raw, KEYS.providerDiscountEffectiveTo),
    remark: getString(raw, KEYS.remark),
    supportingFileMetadataId: pickFirstString(raw, [
      KEYS.supportingFileMetadataId,
      "providerSupportingFileMetadataId",
      "providerDiscountSupportingFileMetadataId",
      "supplementaryFileMetadataId",
      "fileMetadataId",
    ]),
    supportingDocumentName: pickFirstString(raw, [
      KEYS.supportingDocumentName,
      "providerSupportingDocumentName",
      "originalFileName",
      "fileName",
      "supportingDocumentFileName",
    ]),
    insurerLevel: pickFirstString(raw, [
      KEYS.insurerApplicability,
      KEYS.insurerLevel,
      "providerInsurerApplicability",
      "providerInsurerLevel",
    ]),
    insurerIds: getStringArray(raw, KEYS.insurerIds),
    corporateLevel: pickFirstString(raw, [
      KEYS.corporateApplicability,
      KEYS.corporateLevel,
      "providerCorporateApplicability",
      "providerCorporateLevel",
    ]),
    insurerCorporateMappings: asRecordArray(raw[KEYS.insurerCorporateMappings]).map(
      normalizeMapping,
    ),
    discountTypeDetails: asRecordArray(raw[KEYS.discountTypeDetails]).map(normalizeTypeDetail),
  };
}

function extractAgreementApiMessage(response: {
  status?: number;
  error?: string | null;
  errorPayload?: unknown;
  message?: string | null;
}): string | undefined {
  const fromPayload = extractApiMessage(response.errorPayload);
  if (fromPayload) return fromPayload;
  if (typeof response.message === "string" && response.message.trim()) {
    return sanitizeApiErrorMessage(response.message).trim() || undefined;
  }
  if (typeof response.error === "string" && response.error.trim()) {
    return sanitizeApiErrorMessage(response.error).trim() || undefined;
  }
  return undefined;
}

/** GET `/v1/provider/configuration` */
export async function fetchProviderDiscountConfigurationList(
  filters: ProviderDiscountConfigurationListFilters,
): Promise<FetchProviderDiscountConfigurationListResult> {
  const url = `${CONFIGURATION_PATH}${buildListQuery(filters)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return { ok: false, message: extractAgreementApiMessage(response) };
  }

  const payload = response.data;
  if (isApiRecord(payload) && payload.success === false) {
    return { ok: false, message: extractApiMessage(payload) };
  }

  const items = extractRawListItems(payload);
  const rows = items
    .map(normalizeProviderDiscountConfiguration)
    .filter((row): row is NormalizedProviderDiscountConfiguration => row != null);

  return {
    ok: true,
    rows,
    totalRecords: readTotalRecords(payload, rows.length),
  };
}

function extractDetailRecord(payload: unknown): unknown {
  if (!isApiRecord(payload)) return payload;
  const dataNode = payload.data;
  if (isApiRecord(dataNode) && !Array.isArray(dataNode)) return dataNode;
  if (getString(payload, KEYS.providerDiscountConfigurationId)) return payload;
  return payload;
}

/** GET `/v1/provider/configuration/{configurationId}` */
export async function fetchProviderDiscountConfigurationById(
  configurationId: string,
): Promise<FetchProviderDiscountConfigurationByIdResult> {
  const id = configurationId.trim();
  if (!id) return { ok: false, message: "" };

  const url = `${CONFIGURATION_PATH}/${encodeURIComponent(id)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return { ok: false, message: extractAgreementApiMessage(response) };
  }

  const payload = response.data;
  if (isApiRecord(payload) && payload.success === false) {
    return { ok: false, message: extractApiMessage(payload) };
  }

  const row = normalizeProviderDiscountConfiguration(extractDetailRecord(payload));
  if (!row) {
    return { ok: false, message: extractApiMessage(payload) };
  }
  return { ok: true, row };
}

/** POST `/v1/provider/{providerId}/discount-configuration` */
export async function createProviderDiscountConfiguration(
  providerId: string,
  body: CreateProviderDiscountConfigurationBody,
): Promise<CreateProviderDiscountConfigurationResult> {
  const resolvedProviderId = providerId.trim();
  if (!resolvedProviderId) return { ok: false, message: "" };

  const url = `${PROVIDER_PATH}/${encodeURIComponent(resolvedProviderId)}/discount-configuration`;
  const response = await postApi<unknown, CreateProviderDiscountConfigurationBody>(
    providerApi,
    url,
    body,
  );

  if (!response.success) {
    return {
      ok: false,
      message: extractAgreementApiMessage(response),
      status: response.status,
    };
  }

  const payload = response.data;
  if (isApiRecord(payload) && payload.success === false) {
    return { ok: false, message: extractApiMessage(payload) };
  }

  const row = normalizeProviderDiscountConfiguration(extractDetailRecord(payload));
  if (!row) {
    return { ok: false, message: extractApiMessage(payload) };
  }

  return {
    ok: true,
    row,
    message: extractApiMessage(payload),
  };
}

/** PATCH `/v1/provider/configuration/{configurationId}` — only changed fields. */
export async function patchProviderDiscountConfiguration(
  configurationId: string,
  body: PatchProviderDiscountConfigurationBody,
): Promise<PatchProviderDiscountConfigurationResult> {
  const id = configurationId.trim();
  if (!id) return { ok: false, message: "" };

  const url = `${CONFIGURATION_PATH}/${encodeURIComponent(id)}`;
  const response = await patchApi<unknown, PatchProviderDiscountConfigurationBody>(
    providerApi,
    url,
    body,
  );

  if (!response.success) {
    return {
      ok: false,
      message: extractAgreementApiMessage(response),
      status: response.status,
    };
  }

  const payload = response.data;
  if (isApiRecord(payload) && payload.success === false) {
    return { ok: false, message: extractApiMessage(payload) };
  }

  const row = normalizeProviderDiscountConfiguration(extractDetailRecord(payload));
  if (!row) {
    return { ok: false, message: extractApiMessage(payload) };
  }

  return {
    ok: true,
    row,
    message: extractApiMessage(payload),
  };
}
