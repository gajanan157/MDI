import { getApi, postApi, inwardGenerateApi, providerApi } from "@/app/api/apiService";
import { buildQueryParams } from "@/store/features/Broker/BrokerApi";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import { normalizeProviderJobStatusFromEnvelope } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/job/statusNormalizer";
import type { NormalizedProviderJobStatus } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/job/statusTypes";
import { normalizeBulkIcMappingInwardList } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/inward/normalizer";
import type { BulkIcMappingInwardRow } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/inward/rows";
import {
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
  EXCLUDED_PROVIDER_S3_BUCKET,
  EXCLUDED_PROVIDER_S3_SUB_BUCKET,
} from "@/app/pages/dashboards/providerManagernt/provider-master/excluded-provider/config";
import {
  normalizeStagingBlacklistAdditionalData,
  normalizeStagingBlacklistList,
  parseStagingBlacklistBody,
  selectStagingBlacklistCounts,
  normalizePartialMatchCandidates,
  type ExclusionStagingListingMode,
  type NormalizedPartialMatchCandidate,
  type NormalizedStagingBlacklistAdditionalData,
  type NormalizedStagingBlacklistCounts,
  type NormalizedStagingBlacklistRow,
} from "./exclusionStagingNormalizer";
import type {
  ExcludedProviderQuery,
  ProviderBlacklistPageResponse,
} from "./excludedProviderTypes";

const PROVIDER_BLACKLIST_PATH = "/v1/Provider-Blacklist";
const PROVIDER_BLACKLIST_DOWNLOAD_EXCEL_PATH = `${PROVIDER_BLACKLIST_PATH}/download-excel`;
/** Staging results after blacklist job launch (exclusion inward summary). */
export const STAGING_PROVIDER_BLACKLIST_PATH = "/v1/staging-provider-blacklist";
export const BULK_EXCLUDE_INWARDS_PATH = "v1/files/inwards";

/** Provider-Blacklist API expects 1-based `page` (first page = 1). */
function toRequestPage(uiPage: number): number {
  const n = Number(uiPage);
  if (Number.isNaN(n) || n <= 0) return 1;
  return n;
}

/** GET with query params — matches provider-management `Provider-Blacklist` contract. */
export async function getProviderBlacklist(
  query: ExcludedProviderQuery,
): Promise<ProviderBlacklistPageResponse | null> {
  const params: Record<string, string | number | boolean | undefined> = {
    providerName: query.providerName?.trim() || undefined,
    insurerId: query.insurerId || undefined,
    providerBlacklistSource: query.providerBlacklistSource || undefined,
    providerMatchingStatus: query.providerMatchingStatus,
    stateName: query.state?.trim() || undefined,
    district: query.district?.trim() || undefined,
    city: query.city?.trim() || undefined,
    pincode: query.pincode?.trim() || undefined,
    page: toRequestPage(query.page),
    size: query.size,
  };
  if (query.download === true) {
    params.download = true;
  }
  if (query.sortBy?.trim()) {
    params.sortBy = query.sortBy.trim();
  }

  const res = await getApi<ProviderBlacklistPageResponse>(
    providerApi,
    PROVIDER_BLACKLIST_PATH,
    {
      params,
    },
  );
  if (!res.success) {
    throw new Error(
      res.error?.trim() || "Failed to load excluded providers",
    );
  }
  return res.data;
}

export type StagingProviderBlacklistQuery = {
  inwardNo?: string;
  /** Document type, e.g. PROVIDER_EXCLUSION_RECORDS / PROVIDER_WATCHLIST_RECORDS. */
  restrictionType?: string;
  stagingStatus?: string;
  providerStatus?: string;
  providerName?: string;
  state?: string;
  city?: string;
  pincode?: string;
  providerIibRohiniCode?: string;
  includeCounts?: boolean;
  /** Include rows converted to inactive (Removed from Exclusions). */
  includeConvertedToInactiveRecords?: boolean;
  isValid?: boolean;
  /** Partial-match band filter (e.g. 0.50–0.70 / 0.70–0.90). */
  minMatchSimilarityScore?: number;
  maxMatchSimilarityScore?: number;
  page: number;
  size: number;
};

/**
 * GET `/v1/staging-provider-blacklist`
 * Exclusion inward staging (e.g. restrictionType + stagingStatus / isValid + includeCounts).
 */
export async function getStagingProviderBlacklist(
  query: StagingProviderBlacklistQuery,
): Promise<ProviderBlacklistPageResponse | null> {
  const params: Record<string, string | number | boolean | undefined> = {
    restrictionType: query.restrictionType?.trim() || undefined,
    stagingStatus: query.stagingStatus?.trim() || undefined,
    providerStatus: query.providerStatus?.trim() || undefined,
    inwardNo: query.inwardNo?.trim() || undefined,
    providerName: query.providerName?.trim() || undefined,
    state: query.state?.trim() || undefined,
    city: query.city?.trim() || undefined,
    pincode: query.pincode?.trim() || undefined,
    providerIibRohiniCode: query.providerIibRohiniCode?.trim() || undefined,
    includeCounts: query.includeCounts === true ? true : undefined,
    includeConvertedToInactiveRecords:
      query.includeConvertedToInactiveRecords === true ? true : undefined,
    isValid: typeof query.isValid === "boolean" ? query.isValid : undefined,
    minMatchSimilarityScore: Number.isFinite(query.minMatchSimilarityScore)
      ? query.minMatchSimilarityScore
      : undefined,
    maxMatchSimilarityScore: Number.isFinite(query.maxMatchSimilarityScore)
      ? query.maxMatchSimilarityScore
      : undefined,
    page: toRequestPage(query.page),
    size: query.size,
  };

  const res = await getApi<ProviderBlacklistPageResponse>(
    providerApi,
    STAGING_PROVIDER_BLACKLIST_PATH,
    { params },
  );
  if (!res.success) {
    throw new Error(
      res.error?.trim() || "Failed to load staging provider blacklist",
    );
  }
  return res.data;
}

/**
 * GET `/v1/staging-provider-blacklist/{providerBlacklistStagingId}`
 * Partial-match candidate providers for one staging row.
 */
export async function getStagingBlacklistPartialMatchCandidates(
  stagingId: string,
): Promise<NormalizedPartialMatchCandidate[]> {
  const id = stagingId.trim();
  if (!id) {
    throw new Error("Staging id is missing");
  }

  const res = await getApi<unknown>(
    providerApi,
    `${STAGING_PROVIDER_BLACKLIST_PATH}/${encodeURIComponent(id)}`,
  );
  if (!res.success) {
    throw new Error(
      res.error?.trim() || "Failed to load matching records",
    );
  }
  return normalizePartialMatchCandidates(res.data);
}

export type StagingBlacklistActionResult =
  | { ok: true; message?: string; data?: unknown }
  | { ok: false; message?: string; status?: number };

function isEnvelopeFailure(payload: unknown): boolean {
  if (payload == null || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;
  if (record.success === false) return true;
  const status = Number(record.status);
  return status === 400;
}

function resolveStagingActionMessage(payload: unknown, fallback?: string): string | undefined {
  return (
    extractApiMessage(payload) ??
    (typeof fallback === "string" && fallback.trim() ? fallback.trim() : undefined)
  );
}

/**
 * POST `/v1/staging-provider-blacklist/{stagingId}/confirm-match`
 * - Match: `{ action: "CONFIRM", selectedProviderId }`
 * - Not Found: `{ action: "NOT_FOUND" }`
 */
export type StagingBlacklistConfirmMatchBody =
  | { action: "CONFIRM"; selectedProviderId: string }
  | { action: "NOT_FOUND" };

export async function confirmStagingProviderBlacklistMatch(
  stagingId: string,
  body: StagingBlacklistConfirmMatchBody,
): Promise<StagingBlacklistActionResult> {
  const id = stagingId.trim();
  if (!id) {
    return { ok: false, message: "Staging id is missing" };
  }

  if (body.action === "CONFIRM") {
    const selectedProviderId = body.selectedProviderId.trim();
    if (!selectedProviderId) {
      return { ok: false, message: "Provider id is missing" };
    }
  }

  const payload: StagingBlacklistConfirmMatchBody =
    body.action === "CONFIRM"
      ? {
          action: "CONFIRM",
          selectedProviderId: body.selectedProviderId.trim(),
        }
      : { action: "NOT_FOUND" };

  const res = await postApi<unknown, StagingBlacklistConfirmMatchBody>(
    providerApi,
    `${STAGING_PROVIDER_BLACKLIST_PATH}/${encodeURIComponent(id)}/confirm-match`,
    payload,
  );

  const fallbackError =
    body.action === "CONFIRM"
      ? "Failed to match provider"
      : "Failed to process Not Found";
  const fallbackSuccess =
    body.action === "CONFIRM"
      ? "Provider matched successfully"
      : "Provider Not Found processed successfully";

  if (!res.success || isEnvelopeFailure(res.data)) {
    return {
      ok: false,
      message:
        resolveStagingActionMessage(res.errorPayload) ??
        resolveStagingActionMessage(res.data) ??
        resolveStagingActionMessage(res.error) ??
        (typeof res.message === "string" ? res.message : undefined) ??
        fallbackError,
      status: res.status,
    };
  }

  return {
    ok: true,
    data: res.data,
    message: resolveStagingActionMessage(res.data) ?? fallbackSuccess,
  };
}

/** Confirm Match — `CONFIRM` + selected Provider Master id. */
export async function matchStagingProviderBlacklist(
  stagingId: string,
  selectedProviderId: string,
): Promise<StagingBlacklistActionResult> {
  return confirmStagingProviderBlacklistMatch(stagingId, {
    action: "CONFIRM",
    selectedProviderId,
  });
}

/** Not Found — same confirm-match endpoint with `NOT_FOUND`. */
export async function postStagingProviderBlacklistNotFound(
  stagingId: string,
): Promise<StagingBlacklistActionResult> {
  return confirmStagingProviderBlacklistMatch(stagingId, {
    action: "NOT_FOUND",
  });
}

export type StagingBlacklistCreateItem = {
  stagingId: string;
  status: string;
  providerId?: string;
};

export type StagingBlacklistCreateResult =
  | {
      ok: true;
      message?: string;
      items: StagingBlacklistCreateItem[];
      createdCount: number;
      failedCount: number;
    }
  | { ok: false; message?: string; status?: number };

function parseStagingBlacklistCreateItems(payload: unknown): StagingBlacklistCreateItem[] {
  if (payload == null || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const raw = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  return raw
    .map((item) => {
      if (item == null || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const stagingId = String(row.stagingId ?? "").trim();
      if (!stagingId) return null;
      const status = String(row.status ?? "").trim();
      const providerId = String(row.providerId ?? "").trim();
      return {
        stagingId,
        status,
        ...(providerId ? { providerId } : {}),
      };
    })
    .filter((item): item is StagingBlacklistCreateItem => item != null);
}

/**
 * POST `/v1/staging-provider-blacklist`
 * Bulk create providers from Not Found staging rows (`stagingIds`).
 */
export async function createProvidersFromStagingBlacklist(
  stagingIds: string[],
): Promise<StagingBlacklistCreateResult> {
  const ids = [...new Set(stagingIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false, message: "No staging ids selected" };
  }

  const res = await postApi<unknown, { stagingIds: string[] }>(
    providerApi,
    STAGING_PROVIDER_BLACKLIST_PATH,
    { stagingIds: ids },
  );

  if (!res.success || isEnvelopeFailure(res.data)) {
    return {
      ok: false,
      message:
        resolveStagingActionMessage(res.errorPayload) ??
        resolveStagingActionMessage(res.data) ??
        resolveStagingActionMessage(res.error) ??
        (typeof res.message === "string" ? res.message : undefined) ??
        "Unable to submit the selected records. Please try again.",
      status: res.status,
    };
  }

  const items = parseStagingBlacklistCreateItems(res.data);
  const createdCount = items.filter((item) =>
    /^(CREATED|SUCCESS|PROCESSED)$/i.test(item.status),
  ).length;
  const failedCount = items.filter((item) => /FAIL/i.test(item.status)).length;

  return {
    ok: true,
    items,
    createdCount:
      items.length === 0 && failedCount === 0 ? ids.length : createdCount,
    failedCount,
    message:
      resolveStagingActionMessage(res.data) ??
      "Selected Not Found records submitted successfully.",
  };
}

/**
 * GET `/v1/Provider-Blacklist/download-excel` — Excel export with the same query DTO as the list
 * (providerName, insurerId, providerBlacklistSource, state, district, city, pincode, page, size, download, sortBy).
 */
export async function downloadProviderBlacklistExport(
  query: ExcludedProviderQuery,
): Promise<Blob> {
  const params: Record<string, string | number | boolean | undefined> = {
    providerName: query.providerName?.trim() || undefined,
    insurerId: query.insurerId || undefined,
    providerBlacklistSource: query.providerBlacklistSource || undefined,
    providerMatchingStatus: query.providerMatchingStatus,
    state: query.state?.trim() || undefined,
    district: query.district?.trim() || undefined,
    city: query.city?.trim() || undefined,
    pincode: query.pincode?.trim() || undefined,
    page: toRequestPage(query.page),
    size: query.size,
    download: true,
    sortBy: query.sortBy?.trim() || "createdAt",
  };

  const res = await providerApi.get(PROVIDER_BLACKLIST_DOWNLOAD_EXCEL_PATH, {
    params,
    responseType: "blob",
  });

  const contentType =
    (res.headers?.["content-type"] as string | undefined) ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return new Blob([res.data], { type: contentType });
}

export const BLACKLIST_JOB_LAUNCH_PATH = "/v1/blacklist-job/launch";
export const BLACKLIST_JOB_STATUS_PATH = "/v1/blacklist-job/status";
/** Staging restriction after bulk exclude document upload (OCR processing). */
export const PROVIDER_BLACKLIST_RESTRICTION_TEMP_PATH = `${PROVIDER_BLACKLIST_PATH}/restriction-temp`;

export type FetchBlacklistJobStatusResult =
  | { ok: true; job: NormalizedProviderJobStatus }
  | { ok: true; job: null; notFound: true }
  | { ok: false; message?: string; stopPolling: boolean };

function extractBlacklistStatusMessage(payload: unknown): string | undefined {
  if (payload == null) return undefined;
  if (typeof payload === "string") {
    const value = payload.trim();
    return value || undefined;
  }
  if (typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim();
  }
  if (
    record.error != null &&
    typeof record.error === "object" &&
    typeof (record.error as Record<string, unknown>).message === "string"
  ) {
    const nested = String((record.error as Record<string, unknown>).message).trim();
    if (nested) return nested;
  }
  return undefined;
}

function isBlacklistStatusEnvelopeFailure(payload: unknown): boolean {
  if (payload == null || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;
  return typeof record.success === "boolean" && record.success === false;
}

/** True when status API reports no job for this inward (expected until launch). */
function isBlacklistJobNotFound(
  payload: unknown,
  httpStatus: number | undefined,
): boolean {
  if (httpStatus === 404) return true;

  if (payload == null || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;

  if (Number(record.status) === 404) return true;

  const error = record.error;
  if (error != null && typeof error === "object") {
    const code = String((error as Record<string, unknown>).code ?? "").trim();
    if (code === "PROV-BATCH-404-30") return true;
  }

  const message = extractBlacklistStatusMessage(payload)?.toLowerCase() ?? "";
  return message.includes("no blacklist job found");
}

/**
 * GET `/v1/blacklist-job/status?inwardNo=` on provider-management-service.
 * Reuses the shared job-status normalizer used by the processing panel UI.
 * Missing job (404 / PROV-BATCH-404-30) is returned as `{ ok: true, job: null }` — not an error.
 */
export async function fetchBlacklistJobStatusApi(
  inwardNo: string,
): Promise<FetchBlacklistJobStatusResult> {
  const trimmedInwardNo = inwardNo.trim();
  if (!trimmedInwardNo) {
    return { ok: false, message: "Inward number is required.", stopPolling: true };
  }

  const query = new URLSearchParams({ inwardNo: trimmedInwardNo });
  const response = await getApi<unknown>(
    providerApi,
    `${BLACKLIST_JOB_STATUS_PATH}?${query.toString()}`,
  );

  const payload = response.success
    ? response.data
    : response.errorPayload ?? response.data;

  // Prefer not-found over treating the envelope as a failed job / toast message.
  if (
    isBlacklistJobNotFound(payload, response.status) ||
    isBlacklistJobNotFound(response.errorPayload, response.status) ||
    (typeof response.error === "string" &&
      response.error.toLowerCase().includes("no blacklist job found"))
  ) {
    return { ok: true, job: null, notFound: true };
  }

  const job = normalizeProviderJobStatusFromEnvelope(payload);
  const message =
    extractBlacklistStatusMessage(payload) ??
    extractApiMessage(response.errorPayload) ??
    extractApiMessage(response.error) ??
    (typeof response.message === "string" ? response.message : undefined);

  if (job) {
    return { ok: true, job };
  }

  return {
    ok: false,
    message: message ?? "Failed to load blacklist job status.",
    stopPolling: !response.success || isBlacklistStatusEnvelopeFailure(payload),
  };
}

export type BlacklistJobLaunchPayload = {
  inwardNo: string;
  fileMetadataId: string;
  /** Restriction type (e.g. PROVIDER_EXCLUSION_RECORDS / PROVIDER_WATCHLIST_RECORDS). */
  restrictionType: string;
  /** Restricted by: TPA | INSURER | GLOBAL. */
  blacklistedBy: string;
  effectiveFrom: string;
  /** Optional for TPA-restricted inwards. */
  insurerId?: string;
  insurerName?: string;
  remark?: string;
};

export type BlacklistJobLaunchResult =
  | { ok: true; data: unknown; message?: string }
  | { ok: false; message?: string; data?: unknown };

/** POST `/v1/Provider-Blacklist/restriction-temp` body after scan upload. */
export type ProviderBlacklistRestrictionTempPayload = {
  providerBlacklistRestrictionType: string;
  providerBlacklistRestrictedBy: string;
  providerBlacklistRestrictionEffectiveFrom: string;
  inwardNo: string;
  fileMetadataId: string;
  supportingFileMetadataId: string;
  providerRestrictionApplicableFor: string;
  investigationRequiredFlag: string;
  emergencyExceptionAllowedFlag?: string;
  investigationApplicableFor?: string;
  remark: string;
};

export type ProviderBlacklistRestrictionTempResult =
  | { ok: true; data: unknown; message?: string }
  | { ok: false; message?: string; data?: unknown };

function extractLaunchApiMessage(payload: unknown): string | undefined {
  if (payload == null) return undefined;
  if (typeof payload === "string") {
    const value = payload.trim();
    return value || undefined;
  }
  if (typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim();
  }
  if (record.error && typeof record.error === "object") {
    return extractLaunchApiMessage(record.error);
  }
  if (record.data && typeof record.data === "object") {
    return extractLaunchApiMessage(record.data);
  }
  return undefined;
}

function appendIfPresent(
  body: Record<string, string>,
  key: string,
  value: string | undefined,
): void {
  const trimmed = String(value ?? "").trim();
  if (trimmed) body[key] = trimmed;
}

/**
 * POST `/v1/blacklist-job/launch` on provider-management-service.
 * Includes Provider Details form fields from the exclusion inward Save flow.
 */
export async function postBlacklistJobLaunch(
  input: BlacklistJobLaunchPayload,
): Promise<BlacklistJobLaunchResult> {
  const inwardNo = input.inwardNo.trim();
  const fileMetadataId = input.fileMetadataId.trim();
  const restrictionType = input.restrictionType.trim();
  const blacklistedBy = input.blacklistedBy.trim().toUpperCase();
  const effectiveFrom = input.effectiveFrom.trim();

  if (!inwardNo || !fileMetadataId) {
    return {
      ok: false,
      message: "inwardNo and fileMetadataId are required to launch blacklist job.",
    };
  }
  if (!restrictionType || !blacklistedBy || !effectiveFrom) {
    return {
      ok: false,
      message:
        "restrictionType, blacklistedBy and effectiveFrom are required to launch blacklist job.",
    };
  }

  const body: Record<string, string> = {
    inwardNo,
    fileMetadataId,
    restrictionType,
    blacklistedBy,
    effectiveFrom,
  };
  appendIfPresent(body, "insurerId", input.insurerId);
  appendIfPresent(body, "insurerName", input.insurerName);
  appendIfPresent(body, "remark", input.remark);

  try {
    const { data } = await providerApi.post<unknown>(BLACKLIST_JOB_LAUNCH_PATH, body);
    const envelope = data as { success?: boolean; message?: string } | undefined;
    if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
      return {
        ok: false,
        message: extractLaunchApiMessage(envelope),
        data,
      };
    }
    return {
      ok: true,
      data,
      message: extractLaunchApiMessage(data),
    };
  } catch (error) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return {
      ok: false,
      message:
        extractLaunchApiMessage(axiosError.response?.data) ??
        (typeof axiosError.message === "string" ? axiosError.message : undefined),
      data: axiosError.response?.data,
    };
  }
}

/**
 * POST `/v1/Provider-Blacklist/restriction-temp` on provider-management-service.
 * Called after primary + supporting document scan upload for bulk exclude.
 */
export async function postProviderBlacklistRestrictionTemp(
  input: ProviderBlacklistRestrictionTempPayload,
): Promise<ProviderBlacklistRestrictionTempResult> {
  const providerBlacklistRestrictionType =
    input.providerBlacklistRestrictionType.trim().toUpperCase();
  const providerBlacklistRestrictedBy =
    input.providerBlacklistRestrictedBy.trim().toUpperCase();
  const providerBlacklistRestrictionEffectiveFrom =
    input.providerBlacklistRestrictionEffectiveFrom.trim();
  const inwardNo = input.inwardNo.trim();
  const fileMetadataId = input.fileMetadataId.trim();
  const supportingFileMetadataId = input.supportingFileMetadataId.trim();
  const providerRestrictionApplicableFor =
    input.providerRestrictionApplicableFor.trim().toUpperCase();
  const investigationRequiredFlag = input.investigationRequiredFlag.trim();
  const emergencyExceptionAllowedFlag = String(
    input.emergencyExceptionAllowedFlag ?? "",
  ).trim();
  const remark = input.remark.trim();

  if (!inwardNo || !fileMetadataId || !supportingFileMetadataId) {
    return {
      ok: false,
      message:
        "inwardNo, fileMetadataId and supportingFileMetadataId are required.",
    };
  }
  if (
    !providerBlacklistRestrictionType ||
    !providerBlacklistRestrictedBy ||
    !providerBlacklistRestrictionEffectiveFrom
  ) {
    return {
      ok: false,
      message:
        "restriction type, restricted by and effective from are required.",
    };
  }
  if (!providerRestrictionApplicableFor || !investigationRequiredFlag || !remark) {
    return {
      ok: false,
      message:
        "applicable for, investigation flag and remark are required.",
    };
  }

  const body: ProviderBlacklistRestrictionTempPayload = {
    providerBlacklistRestrictionType,
    providerBlacklistRestrictedBy,
    providerBlacklistRestrictionEffectiveFrom,
    inwardNo,
    fileMetadataId,
    supportingFileMetadataId,
    providerRestrictionApplicableFor,
    investigationRequiredFlag,
    remark,
  };
  if (emergencyExceptionAllowedFlag) {
    body.emergencyExceptionAllowedFlag = emergencyExceptionAllowedFlag;
  }
  const investigationApplicableFor = String(
    input.investigationApplicableFor ?? "",
  ).trim().toUpperCase();
  if (investigationApplicableFor) {
    body.investigationApplicableFor = investigationApplicableFor;
  }

  try {
    const { data } = await providerApi.post<unknown>(
      PROVIDER_BLACKLIST_RESTRICTION_TEMP_PATH,
      body,
    );
    const envelope = data as { success?: boolean; message?: string } | undefined;
    if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
      return {
        ok: false,
        message:
          extractLaunchApiMessage(envelope) ??
          "Failed to create blacklist restriction.",
        data,
      };
    }
    return {
      ok: true,
      data,
      message: extractLaunchApiMessage(data),
    };
  } catch (error) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return {
      ok: false,
      message:
        extractLaunchApiMessage(axiosError.response?.data) ??
        (typeof axiosError.message === "string" ? axiosError.message : undefined) ??
        "Failed to create blacklist restriction.",
      data: axiosError.response?.data,
    };
  }
}

export type FetchBulkExcludeInwardsParams = {
  page: number;
  size: number;
  inwardNo?: string;
  departmentId?: string;
  /**
   * Optional single document type.
   * When omitted, exclusion and watchlist are fetched in two separate calls and merged.
   */
  documentType?: string;
};

export type FetchBulkExcludeInwardsResult =
  | { ok: true; rows: BulkIcMappingInwardRow[]; totalRecords: number }
  | { ok: false; message?: string };

function parseBulkExcludeInwardListBody(body: unknown): {
  items: unknown[];
  totalRecords: number;
} {
  if (body == null || typeof body !== "object") {
    return { items: [], totalRecords: 0 };
  }

  const record = body as Record<string, unknown>;
  const items = Array.isArray(record.data) ? record.data : [];
  const pagination = record.pagination;
  const totalFromPagination =
    pagination != null && typeof pagination === "object"
      ? Number((pagination as Record<string, unknown>).totalRecords)
      : Number.NaN;

  return {
    items,
    totalRecords: Number.isFinite(totalFromPagination)
      ? totalFromPagination
      : items.length,
  };
}

const BULK_EXCLUDE_MERGED_FETCH_SIZE = 500;

async function fetchBulkExcludeInwardsForDocumentType(
  params: FetchBulkExcludeInwardsParams,
  documentType: string,
): Promise<FetchBulkExcludeInwardsResult> {
  const queryPayload: Record<string, string> = {
    s3BucketName: EXCLUDED_PROVIDER_S3_BUCKET,
    s3SubBucketName: EXCLUDED_PROVIDER_S3_SUB_BUCKET,
    documentType,
  };

  const inwardNo = params.inwardNo?.trim();
  if (inwardNo) queryPayload.inwardNo = inwardNo;

  const departmentId = params.departmentId?.trim();
  if (departmentId) queryPayload.departmentId = departmentId;

  const apiPage = params.page > 0 ? params.page - 1 : 0;
  const query = buildQueryParams(queryPayload, apiPage, params.size);
  const response = await getApi<unknown>(
    inwardGenerateApi,
    `${BULK_EXCLUDE_INWARDS_PATH}?${query}`,
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

  const parsed = parseBulkExcludeInwardListBody(response.data);

  return {
    ok: true,
    rows: normalizeBulkIcMappingInwardList(parsed.items),
    totalRecords: parsed.totalRecords,
  };
}

function mergeBulkExcludeInwardRows(
  exclusionRows: BulkIcMappingInwardRow[],
  watchlistRows: BulkIcMappingInwardRow[],
): BulkIcMappingInwardRow[] {
  const byInwardNo = new Map<string, BulkIcMappingInwardRow>();
  for (const row of [...exclusionRows, ...watchlistRows]) {
    const key = row.inwardNo.trim();
    if (!key || byInwardNo.has(key)) continue;
    byInwardNo.set(key, row);
  }

  return Array.from(byInwardNo.values()).sort((left, right) => {
    const leftTime = Date.parse(left.createdAt) || 0;
    const rightTime = Date.parse(right.createdAt) || 0;
    return rightTime - leftTime;
  });
}

/**
 * Loads bulk-exclude / watchlist inwards from `GET v1/files/inwards`.
 * Calls exclusion and watchlist document types as separate requests (one type each),
 * then merges rows for the list. A single `documentType` still uses one call.
 */
export async function fetchBulkExcludeInwardsApi(
  params: FetchBulkExcludeInwardsParams,
): Promise<FetchBulkExcludeInwardsResult> {
  const singleDocumentType = params.documentType?.trim();
  if (singleDocumentType) {
    return fetchBulkExcludeInwardsForDocumentType(params, singleDocumentType);
  }

  const listParams: FetchBulkExcludeInwardsParams = {
    ...params,
    // Load a wide first page from each type, then paginate the merged list.
    page: 1,
    size: Math.max(params.size, BULK_EXCLUDE_MERGED_FETCH_SIZE),
  };

  const [exclusionResult, watchlistResult] = await Promise.all([
    fetchBulkExcludeInwardsForDocumentType(
      listParams,
      EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
    ),
    fetchBulkExcludeInwardsForDocumentType(
      listParams,
      EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
    ),
  ]);

  if (!exclusionResult.ok && !watchlistResult.ok) {
    return {
      ok: false,
      message:
        exclusionResult.message ??
        watchlistResult.message ??
        "Failed to load bulk exclude inwards.",
    };
  }

  const mergedRows = mergeBulkExcludeInwardRows(
    exclusionResult.ok ? exclusionResult.rows : [],
    watchlistResult.ok ? watchlistResult.rows : [],
  );

  const page = params.page > 0 ? params.page : 1;
  const size = params.size > 0 ? params.size : 20;
  const start = (page - 1) * size;

  return {
    ok: true,
    rows: mergedRows.slice(start, start + size),
    totalRecords: mergedRows.length,
  };
}

export type FetchExclusionStagingListParams = {
  inwardNo: string;
  restrictionType: string;
  listingMode: ExclusionStagingListingMode;
  page: number;
  size: number;
  stagingStatus?: string;
  providerStatus?: string;
  isValid?: boolean;
  providerName?: string;
  state?: string;
  city?: string;
  pincode?: string;
  minMatchSimilarityScore?: number;
  maxMatchSimilarityScore?: number;
  /** Only for Removed from Exclusions (`convertedToInactive`) tab. */
  includeConvertedToInactiveRecords?: boolean;
};

export type FetchExclusionStagingListResult =
  | {
      ok: true;
      rows: NormalizedStagingBlacklistRow[];
      totalRecords: number;
      counts: NormalizedStagingBlacklistCounts;
      additionalData: NormalizedStagingBlacklistAdditionalData;
    }
  | {
      ok: false;
      message?: string;
    };

/**
 * GET `/v1/staging-provider-blacklist`
 * Exclusion inward staging list with counts (normalized for Bulk Exclude staging UI).
 */
export async function fetchExclusionStagingListApi(
  params: FetchExclusionStagingListParams,
): Promise<FetchExclusionStagingListResult> {
  try {
    const response = await getStagingProviderBlacklist({
      inwardNo: params.inwardNo,
      restrictionType: params.restrictionType,
      includeCounts: true,
      includeConvertedToInactiveRecords:
        params.includeConvertedToInactiveRecords === true ? true : undefined,
      page: params.page,
      size: params.size,
      stagingStatus: params.stagingStatus,
      providerStatus: params.providerStatus,
      isValid: params.isValid,
      providerName: params.providerName,
      state: params.state,
      city: params.city,
      pincode: params.pincode,
      minMatchSimilarityScore: params.minMatchSimilarityScore,
      maxMatchSimilarityScore: params.maxMatchSimilarityScore,
    });

    if (response == null) {
      return { ok: false, message: "Failed to load staging provider blacklist." };
    }

    const envelope = response as { success?: boolean; message?: string };
    if (typeof envelope.success === "boolean" && envelope.success === false) {
      return {
        ok: false,
        message:
          extractApiMessage(response) ??
          envelope.message ??
          "Failed to load staging provider blacklist.",
      };
    }

    const parsed = parseStagingBlacklistBody(response);
    const additionalData = normalizeStagingBlacklistAdditionalData(
      parsed.additionalData,
    );

    return {
      ok: true,
      rows: normalizeStagingBlacklistList(parsed.items),
      totalRecords: parsed.totalRecords,
      counts: selectStagingBlacklistCounts(additionalData, params.listingMode),
      additionalData,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        extractApiMessage(error) ??
        (error instanceof Error ? error.message : undefined) ??
        "Failed to load staging provider blacklist.",
    };
  }
}
