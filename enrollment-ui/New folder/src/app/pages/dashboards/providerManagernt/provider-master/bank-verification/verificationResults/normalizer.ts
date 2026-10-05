import type { BankVerificationResultCounts, BankVerificationResultRow, BankVerificationResultStatus } from "./types";
import {
  STAGING_BANK_PROVIDER_INSURER_API_KEYS as KEYS,
  STAGING_BANK_PROVIDER_INSURER_COUNT_KEYS as COUNT_KEYS,
} from "./keys";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
    return "";
  }
  return String(value).trim();
}

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return false;
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

const STATUS_ALIASES: Record<string, BankVerificationResultStatus> = {
  MATCHED: "MATCHED",
  MATCH: "MATCHED",
  SUCCESS: "MATCHED",
  NOT_MATCHED: "NOT_MATCHED",
  NOTMATCHED: "NOT_MATCHED",
  MISMATCH: "NOT_MATCHED",
  PENDING: "PENDING",
  PENDING_FROM_IC: "PENDING",
  PENDINGFROMIC: "PENDING",
  BANK_DETAILS_MISSING: "BANK_DETAILS_MISSING",
  BANKDETAILSMISSING: "BANK_DETAILS_MISSING",
  MISSING_FROM_IC: "BANK_DETAILS_MISSING",
  MISSING_BANK_IC: "BANK_DETAILS_MISSING",
  PROVIDER_NOT_FOUND: "PROVIDER_NOT_FOUND",
  PROVIDERNOTFOUND: "PROVIDER_NOT_FOUND",
  NOT_FOUND: "PROVIDER_NOT_FOUND",
  NOTFOUND: "PROVIDER_NOT_FOUND",
  FAILED: "FAILED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  VALIDATIONFAILED: "VALIDATION_FAILED",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  PROCESSINGFAILED: "PROCESSING_FAILED",
};

export function normalizeBankVerificationResultStatus(
  value: string,
): BankVerificationResultStatus | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase().replace(/[\s-]+/g, "_");
  return STATUS_ALIASES[upper] ?? STATUS_ALIASES[upper.replaceAll("_", "")] ?? null;
}

/** Wire values for `GET /v1/staging-bank-provider-insurer?providerStagingStatus=`. */
export const STAGING_BANK_PROVIDER_API_STATUS = {
  MATCHED: "MATCHED",
  NOT_MATCHED: "NOT_MATCHED",
  PENDING: "PENDING",
  BANK_DETAILS_MISSING: "BANK_DETAILS_MISSING",
  PROVIDER_NOT_FOUND: "PROVIDER_NOT_FOUND",
  FAILED: "FAILED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  PROCESSING_FAILED: "PROCESSING_FAILED",
} as const;

export function toProviderStagingStatusParam(
  status: BankVerificationResultStatus,
): string {
  return STAGING_BANK_PROVIDER_API_STATUS[status];
}

export function normalizeStagingBankProviderInsurerRow(
  item: unknown,
  fallbackStatus?: BankVerificationResultStatus,
): BankVerificationResultRow | null {
  if (!isApiRecord(item)) return null;

  const id = readString(item, KEYS.stagingBankProviderInsurerId);
  if (!id) return null;

  return {
    id,
    inwardNo: readString(item, KEYS.inwardNo),
    insurerId: readString(item, KEYS.insurerId),
    isValid: readBoolean(item, KEYS.isValid),
    insurerProviderCode: readString(item, KEYS.insurerProviderCode),
    providerName: readString(item, KEYS.providerName),
    providerStatus: readString(item, KEYS.providerStatus),
    providerIibRohiniCode: readString(item, KEYS.providerIibRohiniCode),
    providerPanNumber: readString(item, KEYS.providerPanNumber),
    providerEffectiveFrom: readString(item, KEYS.providerEffectiveFrom),
    providerBankAccountNumber: readString(item, KEYS.providerBankAccountNumber),
    providerBankAccountType: readString(item, KEYS.providerBankAccountType),
    providerBankAccountIfscCode: readString(item, KEYS.providerBankAccountIfscCode),
    providerAddress: readString(item, KEYS.providerAddress),
    providerAddressCity: readString(item, KEYS.providerAddressCity),
    providerAddressStateName: readString(item, KEYS.providerAddressStateName),
    providerAddressPostalCode: readString(item, KEYS.providerAddressPostalCode),
    providerBankRemark: readString(item, KEYS.providerBankRemark),
    createdAt: readString(item, KEYS.createdAt),
    updatedAt: readString(item, KEYS.updatedAt),
    status:
      normalizeBankVerificationResultStatus(
        readString(item, KEYS.providerStagingStatus),
      ) ?? fallbackStatus ?? "PENDING",
  };
}

export function normalizeStagingBankProviderInsurerList(
  items: unknown[],
  fallbackStatus?: BankVerificationResultStatus,
): BankVerificationResultRow[] {
  return items
    .map((item) => normalizeStagingBankProviderInsurerRow(item, fallbackStatus))
    .filter((row): row is BankVerificationResultRow => row != null);
}

export function normalizeStagingBankProviderInsurerCounts(
  additionalData: unknown,
): BankVerificationResultCounts {
  const empty: BankVerificationResultCounts = {
    total: 0,
    processed: 0,
    failed: 0,
    providerNotFound: 0,
    matched: 0,
    notMatched: 0,
    pending: 0,
    bankDetailsMissing: 0,
    validationFailedCount: 0,
    processingFailedCount: 0,
  };

  if (!isApiRecord(additionalData)) {
    return empty;
  }

  return {
    total: readNumber(additionalData, COUNT_KEYS.totalReceived, COUNT_KEYS.total),
    processed: readNumber(additionalData, COUNT_KEYS.processedCount, COUNT_KEYS.processed),
    failed: readNumber(additionalData, COUNT_KEYS.failedCount, COUNT_KEYS.failed),
    providerNotFound: readNumber(
      additionalData,
      COUNT_KEYS.providerNotFoundCount,
      COUNT_KEYS.providerNotFound,
    ),
    matched: readNumber(additionalData, COUNT_KEYS.matchedCount, COUNT_KEYS.matched),
    notMatched: readNumber(additionalData, COUNT_KEYS.notMatchedCount, COUNT_KEYS.notMatched),
    pending: readNumber(
      additionalData,
      COUNT_KEYS.pendingFromIc,
      COUNT_KEYS.pendingCount,
      COUNT_KEYS.pending,
    ),
    bankDetailsMissing: readNumber(
      additionalData,
      COUNT_KEYS.bankDetailsMissingCount,
      COUNT_KEYS.bankDetailsMissing,
    ),
    validationFailedCount: readNumber(additionalData, COUNT_KEYS.validationFailedCount),
    processingFailedCount: readNumber(additionalData, COUNT_KEYS.processingFailedCount),
  };
}

/** Reads bank-job status envelope (`data` or `additionalData`) for summary tiles. */
export function extractBankJobStatusCounts(
  payload: unknown,
): Pick<BankVerificationResultCounts, "validationFailedCount" | "processingFailedCount"> {
  const empty = { validationFailedCount: 0, processingFailedCount: 0 };
  if (!isApiRecord(payload)) return empty;

  const data = isApiRecord(payload.data) ? payload.data : payload;
  const additionalData = isApiRecord(data.additionalData) ? data.additionalData : null;

  return {
    validationFailedCount:
      (additionalData ? readNumber(additionalData, COUNT_KEYS.validationFailedCount) : 0) ||
      readNumber(data, COUNT_KEYS.validationFailedCount),
    processingFailedCount:
      (additionalData ? readNumber(additionalData, COUNT_KEYS.processingFailedCount) : 0) ||
      readNumber(data, COUNT_KEYS.processingFailedCount),
  };
}
