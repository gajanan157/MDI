import { getApi, patchApi, postApi, providerApi } from "@/app/api/apiService";
import {
  extractNestedApiRows,
  isApiRecord,
  toApiRecordArray,
  unwrapNestedApiPayload,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import {
  normalizeProviderNetworkMappingList,
  normalizeProviderNetworkMappingRow,
  PROVIDER_IDENTIFIER_KEYS,
  PROVIDER_IDENTIFIER_TYPE_INSURER_PROVIDER_CODE,
  PROVIDER_RESTRICTION_LIST_FILTER_KEYS as FILTER_KEYS,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/network";
import { normalizeGlobalNetworkMappingList } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/networkMapping/normalizer";
import {
  normalizeProviderRestriction,
  normalizeProviderRestrictionList,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/restriction";
import type { ProviderRestrictionListFilters } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/restriction";
import type { NormalizedProviderRestriction } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/restriction";
import { fetchInsurerProviderNetworkModeAPI } from "@/store/features/providerMasters/providerMastersAPI";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import type {
  CreateProviderNetworkMappingBody,
  CreateProviderRestrictionBody,
  FetchGlobalNetworkMappingListResult,
  FetchProviderNetworkMappingByIdResult,
  FetchProviderNetworkMappingResult,
  FetchProviderRestrictionListResult,
  FetchProviderRestrictionResult,
  GlobalNetworkMappingListFilters,
  InactivateProviderRestrictionBody,
  InactivateProviderRestrictionResult,
  InsurerNetworkModeValues,
  PatchProviderNetworkMappingBody,
  PatchProviderNetworkMappingResult,
  PatchProviderRestrictionResult,
  ProviderNetworkMappingSearchFilters,
  CreateProviderNetworkMappingResult,
  CreateProviderRestrictionResult,
} from "./providerIcCorporateMappingTypes";
import { EMPTY_INSURER_NETWORK_MODE_VALUES } from "./providerIcCorporateMappingTypes";

const PROVIDER_PATH = "/v1/provider";
const GLOBAL_NETWORK_MAPPING_PATH = "/v1/provider/network-mapping";
const PROVIDER_RESTRICTION_PATH = "/v1/provider-restriction";

const INSURER_NETWORK_MODE_KEYS = {
  insurerProviderNetworkModeType: "insurerProviderNetworkModeType",
  insurerProviderNetworkTariffType: "insurerProviderNetworkTariffType",
} as const;

function isNetworkMappingNotFoundError(status?: number, error?: string | null): boolean {
  if (status === 404) return true;
  const message = (error ?? "").trim().toLowerCase();
  return message.includes("not found");
}

function extractProviderNetworkMappingRecord(payload: unknown): unknown {
  const unwrapped = unwrapNestedApiPayload(payload);
  if (isApiRecord(unwrapped)) return unwrapped;
  return payload;
}

function readTotalRecords(payload: unknown, rowCount: number): number {
  if (!isApiRecord(payload)) return rowCount;
  const pagination = payload.pagination;
  if (pagination != null && typeof pagination === "object") {
    const total = Number((pagination as Record<string, unknown>).totalRecords);
    if (Number.isFinite(total)) return total;
  }
  if (Array.isArray(payload.data)) {
    const totalElements = payload.totalElements;
    if (typeof totalElements === "number") return totalElements;
    const totalRecords = payload.totalRecords;
    if (typeof totalRecords === "number") return totalRecords;
  }
  return rowCount;
}

function parseProviderNetworkMappingListBody(body: unknown): {
  items: unknown[];
  totalRecords: number;
} {
  const nestedRows = extractNestedApiRows(body);
  if (nestedRows.length > 0) {
    return {
      items: nestedRows,
      totalRecords: readTotalRecords(body, nestedRows.length),
    };
  }

  if (body == null || typeof body !== "object") {
    return { items: [], totalRecords: 0 };
  }

  const record = body as Record<string, unknown>;
  const items = Array.isArray(record.data) ? toApiRecordArray(record.data) : [];

  return {
    items,
    totalRecords: readTotalRecords(body, items.length),
  };
}

function buildNetworkMappingQuery(filters?: ProviderNetworkMappingSearchFilters): string {
  const search = new URLSearchParams();
  if (filters?.insurerId?.trim()) search.set("insurerId", filters.insurerId.trim());
  if (filters?.insurerProviderCode?.trim()) {
    search.set("insurerProviderCode", filters.insurerProviderCode.trim());
  }
  if (filters?.providerBankMatchWithIC?.trim()) {
    search.set("providerBankMatchWithIC", filters.providerBankMatchWithIC.trim());
  }
  if (filters?.providerMappingType?.trim()) {
    search.set("providerMappingType", filters.providerMappingType.trim());
  }
  const page = filters?.page != null && filters.page > 0 ? filters.page : 1;
  const size = filters?.size != null && filters.size > 0 ? filters.size : 20;
  search.set("page", String(page));
  search.set("size", String(size));
//   search.set("providerNetworkIsActive", "true");
  search.set("identifierTypeCode", PROVIDER_IDENTIFIER_TYPE_INSURER_PROVIDER_CODE);
  const query = search.toString();
  return query ? `?${query}` : "";
}

/** GET `/v1/provider/{providerId}/network-mapping?providerNetworkIsActive=true&identifierTypeCode=INSURER_PROVIDER_CODE` */
export async function fetchProviderNetworkMappingList(
  providerId: string,
  filters?: ProviderNetworkMappingSearchFilters,
): Promise<FetchProviderNetworkMappingResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/network-mapping${buildNetworkMappingQuery(filters)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    if (isNetworkMappingNotFoundError(response.status, response.error)) {
      return { ok: true, rows: [], totalRecords: 0 };
    }
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parseProviderNetworkMappingListBody(response.data);
  return {
    ok: true,
    rows: normalizeProviderNetworkMappingList(parsed.items),
    totalRecords: parsed.totalRecords,
  };
}

/** GET `/v1/provider/{providerId}/network-mapping/{providerNetworkMappingId}` */
export async function fetchProviderNetworkMappingById(
  providerId: string,
  providerNetworkMappingId: string,
): Promise<FetchProviderNetworkMappingByIdResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/network-mapping/${encodeURIComponent(providerNetworkMappingId)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const row = normalizeProviderNetworkMappingRow(
    extractProviderNetworkMappingRecord(response.data),
    0,
  );
  if (!row) {
    return { ok: false, message: extractApiMessage(response.data) };
  }

  return { ok: true, row };
}

/** POST `/v1/provider/{providerId}/network-mapping` — create only. */
export async function createProviderNetworkMapping(
  providerId: string,
  body: CreateProviderNetworkMappingBody | Partial<CreateProviderNetworkMappingBody>,
): Promise<CreateProviderNetworkMappingResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/network-mapping`;
  const response = await postApi<
    unknown,
    CreateProviderNetworkMappingBody | Partial<CreateProviderNetworkMappingBody>
  >(providerApi, url, body);

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  return { ok: true, message: extractApiMessage(response.data) };
}

/** PATCH `/v1/provider/{providerId}/network-mapping` */
export async function patchProviderNetworkMapping(
  providerId: string,
  body: PatchProviderNetworkMappingBody,
): Promise<PatchProviderNetworkMappingResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/network-mapping`;
  const response = await patchApi<unknown, PatchProviderNetworkMappingBody>(
    providerApi,
    url,
    body,
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  return { ok: true, message: extractApiMessage(response.data) };
}

function buildProviderRestrictionListQuery(filters: ProviderRestrictionListFilters): string {
  const search = new URLSearchParams();

  const providerId = filters.providerId?.trim();
  const insurerId = filters.insurerId?.trim();
  const corporateId = filters.corporateId?.trim();
  const policyId = filters.policyId?.trim();
  const tpaId = filters.tpaId?.trim();
  const providerRestrictionZoneId = filters.providerRestrictionZoneId?.trim();
  const providerRestrictionType = filters.providerRestrictionType?.trim();
  const providerRestrictionStatus = filters.providerRestrictionStatus?.trim();

  if (providerId) search.set(FILTER_KEYS.providerId, providerId);
  if (insurerId) search.set(FILTER_KEYS.insurerId, insurerId);
  if (corporateId) search.set(FILTER_KEYS.corporateId, corporateId);
  if (policyId) search.set(FILTER_KEYS.policyId, policyId);
  if (tpaId) search.set(FILTER_KEYS.tpaId, tpaId);
  if (providerRestrictionZoneId) {
    search.set(FILTER_KEYS.providerRestrictionZoneId, providerRestrictionZoneId);
  }
  if (providerRestrictionType) {
    search.set(FILTER_KEYS.providerRestrictionType, providerRestrictionType);
  }
  if (providerRestrictionStatus) {
    search.set(FILTER_KEYS.providerRestrictionStatus, providerRestrictionStatus);
  }
  if (filters.page != null) {
    const apiPage = filters.page > 0 ? filters.page - 1 : 0;
    search.set(FILTER_KEYS.page, String(apiPage));
  }
  if (filters.size != null) search.set(FILTER_KEYS.size, String(filters.size));

  const query = search.toString();
  return query ? `?${query}` : "";
}

function parseProviderRestrictionListBody(body: unknown): {
  items: Record<string, unknown>[];
  totalRecords: number;
} {
  const nestedRows = extractNestedApiRows(body);
  if (nestedRows.length > 0) {
    return {
      items: nestedRows,
      totalRecords: readTotalRecords(body, nestedRows.length),
    };
  }

  if (body == null || typeof body !== "object") {
    return { items: [], totalRecords: 0 };
  }

  const record = body as Record<string, unknown>;
  const items = Array.isArray(record.data) ? toApiRecordArray(record.data) : [];

  return {
    items,
    totalRecords: readTotalRecords(body, items.length),
  };
}

function extractProviderRestrictionRecord(payload: unknown): unknown {
  const unwrapped = unwrapNestedApiPayload(payload);
  if (isApiRecord(unwrapped)) return unwrapped;
  return payload;
}

/** GET `/v1/provider-restriction/{providerRestrictionId}` */
export async function fetchProviderRestrictionById(
  providerRestrictionId: string,
): Promise<FetchProviderRestrictionResult> {
  const url = `${PROVIDER_RESTRICTION_PATH}/${encodeURIComponent(providerRestrictionId)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const row = normalizeProviderRestriction(extractProviderRestrictionRecord(response.data));
  if (!row) {
    return { ok: false, message: extractApiMessage(response.data) };
  }

  return { ok: true, row };
}

/** GET `/v1/provider-restriction` */
export async function fetchProviderRestrictionList(
  filters: ProviderRestrictionListFilters,
): Promise<FetchProviderRestrictionListResult> {
  const url = `${PROVIDER_RESTRICTION_PATH}${buildProviderRestrictionListQuery(filters)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parseProviderRestrictionListBody(response.data);
  const envelope = response.data as { success?: boolean } | undefined;
  if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
    return {
      ok: false,
      message: extractApiMessage(response.data),
    };
  }

  const rows =
    parsed.items.length > 0
      ? parsed.items
          .map(normalizeProviderRestriction)
          .filter((row): row is NormalizedProviderRestriction => row != null)
      : normalizeProviderRestrictionList(response.data);

  return {
    ok: true,
    rows,
    totalRecords: parsed.totalRecords > 0 ? parsed.totalRecords : rows.length,
  };
}

/** POST `/v1/provider-restriction` */
export async function createProviderRestriction(
  body: CreateProviderRestrictionBody,
): Promise<CreateProviderRestrictionResult> {
  const response = await postApi<unknown, CreateProviderRestrictionBody>(
    providerApi,
    PROVIDER_RESTRICTION_PATH,
    body,
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  return { ok: true, message: extractApiMessage(response.data) };
}

/** PATCH `/v1/provider-restriction/{providerRestrictionId}` */
export async function patchProviderRestriction(
  providerRestrictionId: string,
  body: CreateProviderRestrictionBody,
): Promise<PatchProviderRestrictionResult> {
  const url = `${PROVIDER_RESTRICTION_PATH}/${encodeURIComponent(providerRestrictionId)}`;
  const response = await patchApi<unknown, CreateProviderRestrictionBody>(
    providerApi,
    url,
    body,
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  return { ok: true, message: extractApiMessage(response.data) };
}

/** PATCH `/v1/provider-restriction/{providerRestrictionId}` — sets status to Inactive. */
export async function inactivateProviderRestriction(
  providerRestrictionId: string,
): Promise<InactivateProviderRestrictionResult> {
  const url = `${PROVIDER_RESTRICTION_PATH}/${encodeURIComponent(providerRestrictionId)}`;
  const response = await patchApi<unknown, InactivateProviderRestrictionBody>(
    providerApi,
    url,
    { providerRestrictionStatus: "Inactive" },
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  return { ok: true, message: extractApiMessage(response.data) };
}

function readIdentifierValue(record: Record<string, unknown>): string {
  return String(record[PROVIDER_IDENTIFIER_KEYS.identifierValue] ?? "").trim();
}

/**
 * GET `/v1/provider/{providerId}/identifier?referenceEntityId={insurerId}&identifierTypeCode=INSURER_PROVIDER_CODE&download=true`.
 */
export async function fetchInsurerProviderCode(
  providerId: string,
  referenceEntityId: string,
): Promise<string> {
  const search = new URLSearchParams();
  search.set("referenceEntityId", referenceEntityId.trim());
  search.set("identifierTypeCode", PROVIDER_IDENTIFIER_TYPE_INSURER_PROVIDER_CODE);
  search.set("download", "true");

  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/identifier?${search.toString()}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    if (response.status === 404) return "";
    throw new Error(
      extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    );
  }

  const firstRow = extractNestedApiRows(response.data).find(isApiRecord);
  if (firstRow) return readIdentifierValue(firstRow);

  const single = unwrapNestedApiPayload(response.data);
  if (isApiRecord(single)) return readIdentifierValue(single);

  return "";
}

/**
 * GET `/v1/insurer-provider-network-mode?page=1&size=20&insurerId={insurerId}`.
 * Network Mode and Tariff Type are read-only on the New IC mapping form.
 */
function readInsurerNetworkModeValues(
  row: Record<string, unknown>,
): InsurerNetworkModeValues {
  return {
    networkMode: String(
      row[INSURER_NETWORK_MODE_KEYS.insurerProviderNetworkModeType] ?? "",
    ).trim(),
    tariffType: String(
      row[INSURER_NETWORK_MODE_KEYS.insurerProviderNetworkTariffType] ?? "",
    ).trim(),
  };
}

export async function fetchInsurerNetworkModeValues(
  insurerId: string,
): Promise<InsurerNetworkModeValues> {
  const payload = await fetchInsurerProviderNetworkModeAPI({
    page: 1,
    size: 20,
    insurerId,
  });

  const rows =
    isApiRecord(payload) && Array.isArray(payload.data)
      ? toApiRecordArray(payload.data)
      : extractNestedApiRows(payload);
  const firstRow = rows.find((row) => {
    const values = readInsurerNetworkModeValues(row);
    return Boolean(values.networkMode || values.tariffType);
  });

  if (!firstRow) return EMPTY_INSURER_NETWORK_MODE_VALUES;

  return readInsurerNetworkModeValues(firstRow);
}

/** GET `/v1/provider/network-mapping` — IC & Corp Provider Mapping landing grid. */
export async function fetchGlobalProviderNetworkMappingListApi(
  filters: GlobalNetworkMappingListFilters,
): Promise<FetchGlobalNetworkMappingListResult> {
  const search = new URLSearchParams();
  const apiPage = filters.page > 0 ? filters.page : 1;
  search.set("page", String(apiPage));
  search.set("size", String(filters.size));

  const providerName = filters.providerName?.trim();
  const rohiniRegistryCode = filters.rohiniRegistryCode?.trim();
  const insurerId = filters.insurerId?.trim();
  if (providerName) search.set("providerName", providerName);
  if (rohiniRegistryCode) search.set("rohiniRegistryCode", rohiniRegistryCode);
  if (insurerId) search.set("insurerId", insurerId);

  const query = search.toString();
  const url = query
    ? `${GLOBAL_NETWORK_MAPPING_PATH}?${query}`
    : GLOBAL_NETWORK_MAPPING_PATH;

  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return {
      ok: false,
      status: response.status,
      message:
        (typeof response.error === "string" ? response.error : undefined) ??
        extractApiMessage(response.errorPayload) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parseProviderNetworkMappingListBody(response.data);
  return {
    ok: true,
    rows: normalizeGlobalNetworkMappingList(parsed.items),
    totalRecords: parsed.totalRecords,
  };
}
