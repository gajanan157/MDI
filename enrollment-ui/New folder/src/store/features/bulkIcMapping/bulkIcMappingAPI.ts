import {
  documentApi2,
  getApi,
  inwardGenerateApi,
  providerApi,
} from "@/app/api/apiService";
import { buildQueryParams } from "@/store/features/Broker/BrokerApi";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import {
  getPresignDownloadList,
  parsePresignListResponse,
} from "@/services/presignFilesApi";
import {
  BULK_IC_MAPPING_DOCUMENT_TYPE,
  BULK_IC_MAPPING_ERROR_FILE_DOCUMENT_TYPE,
  BULK_IC_MAPPING_S3_BUCKET,
  BULK_IC_MAPPING_S3_SUB_BUCKET,
} from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/upload";
import { normalizeBulkIcMappingInwardList } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/inward/normalizer";
import type { BulkIcMappingInwardRow } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/inward/rows";
import type { BulkIcMappingStatusFilter } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/inward/utils";
import {
  normalizeStagingProviderInsurerCounts,
  normalizeStagingProviderInsurerList,
  type NormalizedStagingProviderInsurerCounts,
  type NormalizedStagingProviderInsurerRow,
} from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/staging/normalizer";
import { normalizeProviderJobStatusFromEnvelope } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/job/statusNormalizer";
import type { NormalizedProviderJobStatus } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/job/statusTypes";

export const BULK_IC_MAPPING_INWARDS_PATH = "v1/files/inwards";
export const STAGING_PROVIDER_INSURER_PATH = "/v1/staging-provider-insurer";
export const PROVIDER_JOB_STATUS_PATH = "/v1/provider-job/status";

export type FetchBulkIcMappingInwardsParams = {
  page: number;
  size: number;
  inwardNo?: string;
  status?: BulkIcMappingStatusFilter;
};

export type FetchBulkIcMappingInwardsResult = {
  ok: true;
  rows: BulkIcMappingInwardRow[];
  totalRecords: number;
};

export type FetchBulkIcMappingInwardsError = {
  ok: false;
  message?: string;
};

export type FetchStagingProviderInsurerParams = {
  inwardNo: string;
  page: number;
  size: number;
  rowType?: "EMPANELMENT" | "DE_EMPANELMENT";
  providerStatus?: string;
  stagingStatus?: string;
  providerName?: string;
  providerIibRohiniCode?: string;
  state?: string;
  city?: string;
  pincode?: string;
};

export type FetchStagingProviderInsurerResult = {
  ok: true;
  rows: NormalizedStagingProviderInsurerRow[];
  totalRecords: number;
  counts: NormalizedStagingProviderInsurerCounts;
  message?: string;
};

export type FetchStagingProviderInsurerError = {
  ok: false;
  message?: string;
};

export type FetchProviderJobStatusResult =
  | { ok: true; job: NormalizedProviderJobStatus }
  | { ok: true; job: null; notFound: true }
  | { ok: false; message?: string; stopPolling: boolean };

export type DownloadBulkIcMappingInwardFileResult =
  | { ok: true }
  | { ok: false; message?: string };

function extractApiMessageLocal(payload: unknown): string | undefined {
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

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isEnvelopeFailure(payload: unknown): boolean {
  if (!isApiRecord(payload)) return false;
  if (payload.success === false) return true;
  const status = Number(payload.status);
  return status === 400;
}

/** True when status API reports no job for this inward (404 / PROV-BATCH-404-24). */
function isProviderJobNotFound(
  payload: unknown,
  httpStatus: number | undefined,
): boolean {
  if (httpStatus === 404) return true;

  if (!isApiRecord(payload)) return false;
  if (Number(payload.status) === 404) return true;

  const error = payload.error;
  if (error != null && typeof error === "object") {
    const code = String((error as Record<string, unknown>).code ?? "").trim();
    if (code === "PROV-BATCH-404-24") return true;
  }

  const message = extractApiMessageLocal(payload)?.toLowerCase() ?? "";
  return message.includes("no job found for the given inward number");
}

function parseInwardListBody(body: unknown): { items: unknown[]; totalRecords: number } {
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
    totalRecords: Number.isFinite(totalFromPagination) ? totalFromPagination : items.length,
  };
}

function parseStagingProviderInsurerBody(body: unknown): {
  items: unknown[];
  totalRecords: number;
  additionalData: unknown;
  message?: string;
} {
  if (body == null || typeof body !== "object") {
    return { items: [], totalRecords: 0, additionalData: null };
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
    totalRecords: Number.isFinite(totalFromPagination) ? totalFromPagination : items.length,
    additionalData: record.additionalData,
    message: extractApiMessageLocal(record),
  };
}

function readPresignedUrl(record: Record<string, unknown>): string {
  const url = record.presignedUrl ?? record.url ?? record.downloadUrl;
  return typeof url === "string" ? url.trim() : "";
}

function readFileName(record: Record<string, unknown>, inwardNo: string): string {
  const name = record.originalFileName ?? record.fileName ?? record.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  return inwardNo;
}

async function triggerPresignedDownload(url: string, fileName: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

export async function fetchBulkIcMappingInwardsApi(
  params: FetchBulkIcMappingInwardsParams,
): Promise<FetchBulkIcMappingInwardsResult | FetchBulkIcMappingInwardsError> {
  const queryPayload: Record<string, string> = {
    documentType: BULK_IC_MAPPING_DOCUMENT_TYPE,
  };

  const inwardNo = params.inwardNo?.trim();
  if (inwardNo) queryPayload.inwardNo = inwardNo;
  if (params.status && params.status !== "ALL") {
    queryPayload.status = params.status;
  }

  const apiPage = params.page > 0 ? params.page - 1 : 0;
  const query = buildQueryParams(queryPayload, apiPage, params.size);
  const response = await getApi<unknown>(inwardGenerateApi, `${BULK_IC_MAPPING_INWARDS_PATH}?${query}`);

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parseInwardListBody(response.data);
  return {
    ok: true,
    rows: normalizeBulkIcMappingInwardList(parsed.items),
    totalRecords: parsed.totalRecords,
  };
}

export async function fetchStagingProviderInsurerListApi(
  params: FetchStagingProviderInsurerParams,
): Promise<FetchStagingProviderInsurerResult | FetchStagingProviderInsurerError> {
  const queryPayload: Record<string, string | boolean> = {
    inwardNo: params.inwardNo,
    includeCounts: true,
  };

  if (params.providerStatus) {
    queryPayload.providerStatus = params.providerStatus;
  }

  if (params.stagingStatus) {
    queryPayload.stagingStatus = params.stagingStatus;
  }

  if (params.rowType) {
    queryPayload.rowType = params.rowType;
  }

  const providerName = params.providerName?.trim();
  if (providerName) {
    queryPayload.providerName = providerName;
  }

  const providerIibRohiniCode = params.providerIibRohiniCode?.trim();
  if (providerIibRohiniCode) {
    queryPayload.providerIibRohiniCode = providerIibRohiniCode;
  }

  const state = params.state?.trim();
  if (state) {
    queryPayload.state = state;
  }

  const city = params.city?.trim();
  if (city) {
    queryPayload.city = city;
  }

  const pincode = params.pincode?.trim();
  if (pincode) {
    queryPayload.pincode = pincode;
  }

  const apiPage = params.page > 0 ? params.page - 1 : 0;
  const query = buildQueryParams(queryPayload, apiPage, params.size);
  const response = await getApi<unknown>(providerApi, `${STAGING_PROVIDER_INSURER_PATH}?${query}`);

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parseStagingProviderInsurerBody(response.data);
  const envelope = response.data as { success?: boolean } | undefined;
  if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
    return {
      ok: false,
      message: parsed.message ?? extractApiMessage(response.data),
    };
  }

  return {
    ok: true,
    rows: normalizeStagingProviderInsurerList(parsed.items),
    totalRecords: parsed.totalRecords,
    counts: normalizeStagingProviderInsurerCounts(
      parsed.additionalData,
      params.rowType ?? "EMPANELMENT",
    ),
    message: parsed.message,
  };
}

export async function fetchProviderJobStatusApi(
  inwardNo: string,
): Promise<FetchProviderJobStatusResult> {
  const trimmedInwardNo = inwardNo.trim();
  if (!trimmedInwardNo) {
    return { ok: false, message: "Inward number is required.", stopPolling: true };
  }

  const query = new URLSearchParams({ inwardNo: trimmedInwardNo });
  const response = await getApi<unknown>(
    providerApi,
    `${PROVIDER_JOB_STATUS_PATH}?${query.toString()}`,
  );

  const payload = response.success
    ? response.data
    : response.errorPayload ?? response.data;

  // Prefer not-found over treating the envelope as a failed job / toast message.
  if (
    isProviderJobNotFound(payload, response.status) ||
    isProviderJobNotFound(response.errorPayload, response.status) ||
    (typeof response.error === "string" &&
      response.error.toLowerCase().includes("no job found for the given inward number"))
  ) {
    return { ok: true, job: null, notFound: true };
  }

  const job = normalizeProviderJobStatusFromEnvelope(payload);
  const message =
    extractApiMessageLocal(payload) ??
    extractApiMessage(response.errorPayload) ??
    extractApiMessage(response.error) ??
    (typeof response.message === "string" ? response.message : undefined);

  if (job) {
    return { ok: true, job };
  }

  return {
    ok: false,
    message: message ?? "Failed to load job status.",
    stopPolling: !response.success || isEnvelopeFailure(payload),
  };
}

export async function downloadBulkIcMappingInwardFileApi(
  inwardNo: string,
): Promise<DownloadBulkIcMappingInwardFileResult> {
  const trimmedInwardNo = inwardNo.trim();
  if (!trimmedInwardNo) {
    return { ok: false, message: "Inward number is required." };
  }

  const response = await getPresignDownloadList({
    s3BucketName: BULK_IC_MAPPING_S3_BUCKET,
    s3SubBucketName: BULK_IC_MAPPING_S3_SUB_BUCKET,
    inwardNo: trimmedInwardNo,
    page: 0,
    size: 20,
  });

  if (!response.success || response.data == null) {
    return {
      ok: false,
      message:
        (typeof response.error === "string" ? response.error : undefined) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parsePresignListResponse(response.data);
  const firstItem = parsed.items[0];
  if (!firstItem || typeof firstItem !== "object") {
    return { ok: false, message: "No file found for this inward number." };
  }

  const record = firstItem as Record<string, unknown>;
  const downloadUrl = readPresignedUrl(record);
  if (!downloadUrl) {
    return { ok: false, message: "Download URL not available for this inward." };
  }

  try {
    await triggerPresignedDownload(
      downloadUrl,
      readFileName(record, trimmedInwardNo),
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : undefined,
    };
  }
}

export async function downloadBulkIcMappingErrorFileApi(
  inwardNo: string,
): Promise<DownloadBulkIcMappingInwardFileResult> {
  const trimmedInwardNo = inwardNo.trim();
  if (!trimmedInwardNo) {
    return { ok: false, message: "Inward number is required." };
  }

  const query = new URLSearchParams({
    documentType: BULK_IC_MAPPING_ERROR_FILE_DOCUMENT_TYPE,
    inwardNo: trimmedInwardNo,
  });

  const response = await getApi<unknown>(
    documentApi2,
    `/v1/files/presigned-url?${query.toString()}`,
  );

  if (!response.success || response.data == null) {
    return {
      ok: false,
      message:
        (typeof response.error === "string" ? response.error : undefined) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parsePresignListResponse(response.data);
  const firstItem = parsed.items[0];
  if (!firstItem || typeof firstItem !== "object") {
    return { ok: false, message: "No error file found for this inward number." };
  }

  const record = firstItem as Record<string, unknown>;
  const downloadUrl = readPresignedUrl(record);
  if (!downloadUrl) {
    return { ok: false, message: "Download URL not available for this error file." };
  }

  try {
    await triggerPresignedDownload(
      downloadUrl,
      readFileName(record, `${trimmedInwardNo}-error-file`),
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : undefined,
    };
  }
}
