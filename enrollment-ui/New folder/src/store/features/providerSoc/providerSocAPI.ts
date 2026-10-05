import { getApi, providerApi } from "@/app/api/apiService";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import {
  extractNestedApiRows,
  isApiRecord,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import {
  PROVIDER_SOC_KEYS as KEYS,
  PROVIDER_SOC_LIST_FILTER_KEYS as FILTER_KEYS,
  type NormalizedProviderSoc,
  type ProviderSocInsurerMapping,
  type ProviderSocListFilters,
} from "./providerSocTypes";

const SOC_PATH = "/v1/provider/soc";

export type FetchProviderSocListResult =
  | {
      ok: true;
      rows: NormalizedProviderSoc[];
      totalRecords: number;
    }
  | { ok: false; message?: string };

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

function getBoolean(raw: Record<string, unknown>, key: string): boolean | null {
  const value = raw[key];
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return null;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isApiRecord);
}

function readTotalRecords(payload: unknown, rowCount: number): number {
  if (!isApiRecord(payload)) return rowCount;
  const pagination = payload.pagination;
  if (isApiRecord(pagination) && typeof pagination.totalRecords === "number") {
    return pagination.totalRecords;
  }
  if (typeof payload.totalRecords === "number") return payload.totalRecords;
  if (typeof payload.totalElements === "number") return payload.totalElements;
  const dataNode = payload.data;
  if (isApiRecord(dataNode)) {
    if (typeof dataNode.totalElements === "number") return dataNode.totalElements;
    if (typeof dataNode.totalRecords === "number") return dataNode.totalRecords;
  }
  return rowCount;
}

function buildListQuery(filters: ProviderSocListFilters): string {
  const search = new URLSearchParams();
  const providerId = filters.providerId.trim();
  if (providerId) search.set(FILTER_KEYS.providerId, providerId);
  if (filters.isActive === true) search.set(FILTER_KEYS.isActive, "true");
  if (filters.isActive === false) search.set(FILTER_KEYS.isActive, "false");
  if (filters.download === true) {
    search.set(FILTER_KEYS.download, "true");
  } else {
    if (filters.page != null) search.set(FILTER_KEYS.page, String(filters.page));
    if (filters.size != null) search.set(FILTER_KEYS.size, String(filters.size));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function extractListMessage(response: {
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

function formatSocIdVersion(raw: Record<string, unknown>): string {
  const combined = pickFirstString(raw, ["socIdVersion", "providerSocIdVersion"]);
  if (combined) return combined;
  const code = pickFirstString(raw, [KEYS.providerSocCode, "socCode", "socId"]);
  const version = pickFirstString(raw, [KEYS.providerSocVersion, "socVersion", "version"]);
  if (code && version) return `${code} / ${version}`;
  return code || version;
}

function normalizeInsurerMappings(raw: Record<string, unknown>): ProviderSocInsurerMapping[] {
  const nested = asRecordArray(
    raw.insurerMappings ?? raw.applicableIcs ?? raw.providerSocInsurerMappings,
  );
  return nested
    .map((item) => {
      const insurerId = pickFirstString(item, ["insurerId", "id"]);
      const insurerName = pickFirstString(item, ["insurerName", "name"]);
      const effectiveFrom = pickFirstString(item, [
        "effectiveFrom",
        "mappingEffectiveFrom",
        "providerSocEffectiveFrom",
      ]);
      if (!insurerId && !insurerName) return null;
      return {
        insurerId,
        insurerName: insurerName || insurerId,
        effectiveFrom,
      };
    })
    .filter((item): item is ProviderSocInsurerMapping => item != null);
}

function formatApplicableIcsSummary(
  raw: Record<string, unknown>,
  mappings: ProviderSocInsurerMapping[],
): string {
  const summary = pickFirstString(raw, [
    "applicableIcs",
    "applicableIcsSummary",
    "providerSocApplicableIcs",
  ]);
  if (summary) return summary;
  const names = mappings.map((item) => item.insurerName).filter(Boolean);
  if (names.length === 0) return "";
  return names.join(", ");
}

function resolveSocStatus(raw: Record<string, unknown>, isActive: boolean): "Active" | "Inactive" {
  const recordStatus = pickFirstString(raw, [
    KEYS.recordStatus,
    "providerSocStatus",
    "status",
  ]).toUpperCase();
  if (recordStatus === "INACTIVE") return "Inactive";
  if (recordStatus === "ACTIVE") return "Active";
  return isActive ? "Active" : "Inactive";
}

export function normalizeProviderSoc(raw: unknown): NormalizedProviderSoc | null {
  if (!isApiRecord(raw)) return null;
  const providerSocId = pickFirstString(raw, [
    KEYS.providerSocId,
    "socId",
    "id",
  ]);
  if (!providerSocId) return null;

  const explicitActive = getBoolean(raw, KEYS.isActive);
  const isActive = explicitActive ?? true;
  const mappings = normalizeInsurerMappings(raw);

  return {
    providerSocId,
    providerId: pickFirstString(raw, [KEYS.providerId]),
    socIdVersion: formatSocIdVersion(raw),
    socName: pickFirstString(raw, [
      KEYS.providerSocName,
      "socName",
      "originalFileName",
      "fileName",
      "supportingDocumentName",
    ]),
    applicableIcs: formatApplicableIcsSummary(raw, mappings),
    insurerMappings: mappings,
    lastUpdatedOn: pickFirstString(raw, [
      "lastUpdatedOn",
      "updatedAt",
      "modifiedAt",
      "updatedOn",
      "lastModifiedDate",
    ]),
    effectiveFrom: pickFirstString(raw, [
      KEYS.providerSocEffectiveFrom,
      "effectiveFrom",
      "startDate",
      "validFrom",
    ]),
    effectiveTo: pickFirstString(raw, [
      KEYS.providerSocEffectiveTo,
      "effectiveTo",
      "endDate",
      "validTo",
    ]),
    isActive,
    status: resolveSocStatus(raw, isActive),
    providerAgreementId: pickFirstString(raw, [KEYS.providerAgreementId, "agreementId"]),
    providerAgreementName: pickFirstString(raw, [
      KEYS.providerAgreementName,
      "agreementName",
    ]),
    fileMetadataId: pickFirstString(raw, [
      KEYS.fileMetadataId,
      KEYS.supportingFileMetadataId,
      "providerSupportingFileMetadataId",
    ]),
    downloadUrl: pickFirstString(raw, ["downloadUrl", "fileUrl", "documentUrl"]),
  };
}

/** GET `/v1/provider/soc?providerId=...&isActive=true&download=true` */
export async function fetchProviderSocList(
  filters: ProviderSocListFilters,
): Promise<FetchProviderSocListResult> {
  const providerId = filters.providerId.trim();
  if (!providerId) {
    return { ok: false, message: "Provider id is required to load SOC records." };
  }

  const response = await getApi<unknown>(
    providerApi,
    `${SOC_PATH}${buildListQuery({ ...filters, providerId })}`,
  );

  if (!response.success) {
    return { ok: false, message: extractListMessage(response) };
  }

  const payload = response.data;
  if (isApiRecord(payload) && payload.success === false) {
    return { ok: false, message: extractApiMessage(payload) };
  }

  const rows = extractNestedApiRows(payload)
    .map(normalizeProviderSoc)
    .filter((row): row is NormalizedProviderSoc => row != null);

  return {
    ok: true,
    rows,
    totalRecords: readTotalRecords(payload, rows.length),
  };
}
