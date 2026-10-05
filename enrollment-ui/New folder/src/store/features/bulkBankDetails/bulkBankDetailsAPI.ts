import {
  getApi,
  inwardGenerateApi,
  providerApi,
} from "@/app/api/apiService";
import { buildQueryParams } from "@/store/features/Broker/BrokerApi";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import {
  BANK_VERIFICATION_DOCUMENT_TYPE,
  BANK_VERIFICATION_PROVIDER_JOB_STATUS_PATH,
} from "@/app/pages/dashboards/providerManagernt/provider-master/bank-verification/config";
import { normalizeBankVerificationInwardList } from "@/app/pages/dashboards/providerManagernt/provider-master/bank-verification/inward/normalizer";
import type { BankVerificationInwardRow } from "@/app/pages/dashboards/providerManagernt/provider-master/bank-verification/inwardTypes";
import {
  extractBankJobStatusCounts,
  normalizeBankVerificationResultStatus,
  normalizeStagingBankProviderInsurerCounts,
  normalizeStagingBankProviderInsurerList,
} from "@/app/pages/dashboards/providerManagernt/provider-master/bank-verification/verificationResults/normalizer";
import { normalizeProviderJobStatusFromEnvelope } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/job/statusNormalizer";
import type { NormalizedProviderJobStatus } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/job/statusTypes";
import type {
  BankVerificationResultCounts,
  BankVerificationResultRow,
} from "@/app/pages/dashboards/providerManagernt/provider-master/bank-verification/verificationResults/types";
import {
  normalizeStagingBankComparison,
  type NormalizedStagingBankComparison,
} from "@/app/pages/dashboards/providerManagernt/provider-master/bank-verification/verificationResults/comparisonNormalizer";
import type {
  BankComparisonFieldLabels,
} from "@/app/pages/dashboards/providerManagernt/shared/bankDetailsComparison";

export const BULK_BANK_DETAILS_INWARDS_PATH = "v1/files/inwards";
export const STAGING_BANK_PROVIDER_INSURER_PATH = "/v1/staging-bank-provider-insurer";

export type FetchBulkBankDetailsInwardsParams = {
  page: number;
  size: number;
  inwardNo?: string;
};

export type FetchBulkBankDetailsInwardsResult = {
  ok: true;
  rows: BankVerificationInwardRow[];
  totalRecords: number;
};

export type FetchBulkBankDetailsInwardsError = {
  ok: false;
  message?: string;
};

export type FetchStagingBankProviderInsurerParams = {
  inwardNo: string;
  page: number;
  size: number;
  insurerId?: string;
  includeCounts?: boolean;
  providerStagingStatus?: string;
};

export type FetchStagingBankProviderInsurerResult = {
  ok: true;
  rows: BankVerificationResultRow[];
  totalRecords: number;
  counts: BankVerificationResultCounts;
  hasSummaryCounts: boolean;
  message?: string;
};

export type FetchStagingBankProviderInsurerError = {
  ok: false;
  message?: string;
};

export type FetchStagingBankComparisonError = {
  ok: false;
  message?: string;
};

export type FetchStagingBankComparisonResult = {
  ok: true;
} & NormalizedStagingBankComparison;

export async function fetchStagingBankComparisonApi(
  stagingBankProviderInsurerId: string,
  fieldLabels: BankComparisonFieldLabels,
): Promise<FetchStagingBankComparisonResult | FetchStagingBankComparisonError> {
  const id = stagingBankProviderInsurerId.trim();
  if (!id) {
    return { ok: false, message: "Staging bank provider insurer id is required." };
  }

  const response = await getApi<unknown>(
    providerApi,
    `${STAGING_BANK_PROVIDER_INSURER_PATH}/${encodeURIComponent(id)}/comparison`,
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

  const envelope = isApiRecord(response.data) ? response.data : null;
  if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
    return {
      ok: false,
      message: extractApiMessage(response.data),
    };
  }

  const comparison = normalizeStagingBankComparison(response.data, fieldLabels);
  if (!comparison) {
    return { ok: false, message: "Comparison details were not returned." };
  }

  return { ok: true, ...comparison };
}

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
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

function parseStagingListBody(body: unknown): {
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
    message: extractApiMessage(record),
  };
}

export async function fetchBulkBankDetailsInwardsApi(
  params: FetchBulkBankDetailsInwardsParams,
): Promise<FetchBulkBankDetailsInwardsResult | FetchBulkBankDetailsInwardsError> {
  const queryPayload: Record<string, string> = {
    documentType: BANK_VERIFICATION_DOCUMENT_TYPE,
  };

  const inwardNo = params.inwardNo?.trim();
  if (inwardNo) queryPayload.inwardNo = inwardNo;

  const apiPage = params.page > 0 ? params.page - 1 : 0;
  const query = buildQueryParams(queryPayload, apiPage, params.size);
  const response = await getApi<unknown>(
    inwardGenerateApi,
    `${BULK_BANK_DETAILS_INWARDS_PATH}?${query}`,
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

  const parsed = parseInwardListBody(response.data);
  return {
    ok: true,
    rows: normalizeBankVerificationInwardList(parsed.items),
    totalRecords: parsed.totalRecords,
  };
}

export async function fetchStagingBankProviderInsurerListApi(
  params: FetchStagingBankProviderInsurerParams,
): Promise<FetchStagingBankProviderInsurerResult | FetchStagingBankProviderInsurerError> {
  const inwardNo = params.inwardNo.trim();
  if (!inwardNo) {
    return { ok: false, message: "Inward number is required." };
  }

  const queryPayload: Record<string, string | boolean> = {
    inwardNo,
    includeCounts: params.includeCounts ?? true,
  };

  const insurerId = params.insurerId?.trim();
  if (insurerId) {
    queryPayload.insurerId = insurerId;
  }

  const providerStagingStatus = params.providerStagingStatus?.trim();
  if (providerStagingStatus) {
    queryPayload.providerStagingStatus = providerStagingStatus;
  }

  const apiPage = params.page > 0 ? params.page - 1 : 0;
  const query = buildQueryParams(queryPayload, apiPage, params.size);
  const response = await getApi<unknown>(
    providerApi,
    `${STAGING_BANK_PROVIDER_INSURER_PATH}?${query}`,
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

  const parsed = parseStagingListBody(response.data);
  const envelope = isApiRecord(response.data) ? response.data : null;
  if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
    return {
      ok: false,
      message: parsed.message ?? extractApiMessage(response.data),
    };
  }

  const normalizedCounts = normalizeStagingBankProviderInsurerCounts(parsed.additionalData);
  const fallbackStatus = normalizeBankVerificationResultStatus(
    params.providerStagingStatus ?? "",
  );

  return {
    ok: true,
    rows: normalizeStagingBankProviderInsurerList(parsed.items, fallbackStatus ?? undefined),
    totalRecords: parsed.totalRecords,
    counts: {
      ...normalizedCounts,
      total: normalizedCounts.total || parsed.totalRecords,
    },
    hasSummaryCounts: Boolean(
      isApiRecord(parsed.additionalData) &&
        (parsed.additionalData.totalReceived != null ||
          parsed.additionalData.matchedCount != null ||
          parsed.additionalData.providerNotFoundCount != null ||
          parsed.additionalData.validationFailedCount != null ||
          parsed.additionalData.processingFailedCount != null),
    ),
    message: parsed.message,
  };
}

export type FetchProviderBankJobStatusResult =
  | { ok: true; job: NormalizedProviderJobStatus }
  | { ok: true; job: null; notFound: true }
  | { ok: false; message?: string; stopPolling: boolean };

function extractBankJobStatusMessage(payload: unknown): string | undefined {
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

function isBankJobStatusEnvelopeFailure(payload: unknown): boolean {
  if (!isApiRecord(payload)) return false;
  return typeof payload.success === "boolean" && payload.success === false;
}

/** True when status API reports no job for this inward (expected until launch). */
function isProviderBankJobNotFound(
  payload: unknown,
  httpStatus: number | undefined,
): boolean {
  if (httpStatus === 404) return true;
  if (!isApiRecord(payload)) return false;
  if (Number(payload.status) === 404) return true;

  const error = payload.error;
  if (error != null && typeof error === "object") {
    const rawCode = (error as Record<string, unknown>).code;
    const code = typeof rawCode === "string" ? rawCode.trim() : "";
    if (code.startsWith("PROV-BATCH-404")) return true;
  }

  const message = extractBankJobStatusMessage(payload)?.toLowerCase() ?? "";
  return message.includes("no job found") || message.includes("no bank job found");
}

/**
 * GET `/v1/provider-bank-job/status?inwardNo=` on provider-management-service.
 * Missing job (404) is returned as `{ ok: true, job: null }` — not an error.
 */
export async function fetchProviderBankJobStatusApi(
  inwardNo: string,
): Promise<FetchProviderBankJobStatusResult> {
  const trimmedInwardNo = inwardNo.trim();
  if (!trimmedInwardNo) {
    return { ok: false, message: "Inward number is required.", stopPolling: true };
  }

  const query = new URLSearchParams({ inwardNo: trimmedInwardNo });
  const response = await getApi<unknown>(
    providerApi,
    `${BANK_VERIFICATION_PROVIDER_JOB_STATUS_PATH}?${query.toString()}`,
  );

  const payload = response.success
    ? response.data
    : response.errorPayload ?? response.data;

  if (
    isProviderBankJobNotFound(payload, response.status) ||
    isProviderBankJobNotFound(response.errorPayload, response.status) ||
    (typeof response.error === "string" &&
      response.error.toLowerCase().includes("no job found"))
  ) {
    return { ok: true, job: null, notFound: true };
  }

  const job = normalizeProviderJobStatusFromEnvelope(payload);
  const jobCounts = extractBankJobStatusCounts(payload);
  const message =
    extractBankJobStatusMessage(payload) ??
    extractApiMessage(response.errorPayload) ??
    extractApiMessage(response.error) ??
    (typeof response.message === "string" ? response.message : undefined);

  if (job) {
    return {
      ok: true,
      job: {
        ...job,
        validationFailedCount: jobCounts.validationFailedCount,
        processingFailedCount: jobCounts.processingFailedCount,
      },
    };
  }

  return {
    ok: false,
    message: message ?? "Failed to load bank job status.",
    stopPolling: !response.success || isBankJobStatusEnvelopeFailure(payload),
  };
}
