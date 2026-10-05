/** Field keys for `GET /v1/staging-provider-blacklist`. */
const STAGING_PROVIDER_BLACKLIST_API_KEYS = {
  providerBlacklistStagingId: "providerBlacklistStagingId",
  providerBlacklistMasterId: "providerBlacklistMasterId",
  id: "id",
  providerName: "providerName",
  providerIibRohiniCode: "providerIibRohiniCode",
  stagingStatus: "stagingStatus",
  providerStatus: "providerStatus",
  providerStatusReason: "providerStatusReason",
  providerAddress: "providerAddress",
  providerCity: "providerCity",
  providerState: "providerState",
  providerDistrict: "providerDistrict",
  providerPincode: "providerPincode",
  providerBlacklistStartDate: "providerBlacklistStartDate",
  providerBlacklistEffectiveFrom: "providerBlacklistEffectiveFrom",
  insurerName: "insurerName",
  insurerCompanyName: "insurerCompanyName",
  isValid: "isValid",
  restrictionType: "restrictionType",
  matchSimilarityScore: "matchSimilarityScore",
} as const;

const STAGING_PROVIDER_BLACKLIST_COUNT_KEYS = {
  totalReceived: "totalReceived",
  validCount: "validCount",
  invalidCount: "invalidCount",
  pendingCount: "pendingCount",
  notFoundCount: "notFoundCount",
  processedNewCount: "processedNewCount",
  processedExistingCount: "processedExistingCount",
  failedCount: "failedCount",
  processedCount: "processedCount",
  convertedToInactiveCount: "convertedToInactiveCount",
  partialMatchCount: "partialMatchCount",
  partialMatch50To70Count: "partialMatch50To70Count",
  partialMatch70To90Count: "partialMatch70To90Count",
  overallTotalReceived: "overallTotalReceived",
} as const;

const STAGING_BLACKLIST_ADDITIONAL_DATA_KEYS = {
  blacklisted: "blacklisted",
  watchlisted: "watchlisted",
} as const;

const KEYS = STAGING_PROVIDER_BLACKLIST_API_KEYS;
const COUNT_KEYS = STAGING_PROVIDER_BLACKLIST_COUNT_KEYS;
const BUCKET_KEYS = STAGING_BLACKLIST_ADDITIONAL_DATA_KEYS;

export type ExclusionStagingListingMode = "blacklisted" | "watchlisted";

export type NormalizedStagingBlacklistRow = {
  id: string;
  providerBlacklistStagingId: string;
  providerName: string;
  insurerName: string;
  providerIibRohiniCode: string;
  providerAddress: string;
  providerStatus: string;
  /** API `providerStatusReason` (Partial Match detail / failure reason text). */
  providerStatusReason: string;
  providerAddressCity: string;
  providerAddressState: string;
  providerAddressDistrict: string;
  providerAddressPostalCode: string;
  providerBlacklistStartDate: string;
  providerBlacklistEffectiveFrom: string;
  /** Decimal similarity 0–1 when present (Partial Match). */
  matchSimilarityScore: number | null;
};

export type ExclusionStagingGridRow = NormalizedStagingBlacklistRow & {
  uiSerialNo: number;
};

export type NormalizedStagingBlacklistCounts = {
  totalReceived: number;
  validCount: number;
  invalidCount: number;
  pendingCount: number;
  notFoundCount: number;
  processedNewCount: number;
  processedExistingCount: number;
  failedCount: number;
  processedCount: number;
  convertedToInactiveCount: number;
  partialMatchCount: number;
  partialMatch50To70Count: number;
  partialMatch70To90Count: number;
};

export type NormalizedStagingBlacklistAdditionalData = {
  overallTotalReceived: number;
  blacklisted: NormalizedStagingBlacklistCounts;
  watchlisted: NormalizedStagingBlacklistCounts;
};

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value != null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

/** API may send placeholder text when Rohini is missing — show blank instead. */
function normalizeRohiniCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^no\s+rohini(\s+id)?$/i.test(trimmed)) return "";
  return trimmed;
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

/** Reads matchSimilarityScore as 0–1 decimal (accepts percent values > 1). */
export function readMatchSimilarityScore(
  record: Record<string, unknown>,
): number | null {
  for (const key of [
    KEYS.matchSimilarityScore,
    "match_similarity_score",
    "similarityScore",
  ]) {
    const raw = record[key];
    if (raw == null || String(raw).trim() === "") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    if (value > 1) return value / 100;
    return value;
  }

  const remark = readString(
    record,
    KEYS.providerStatusReason
  );
  const scoreFromRemark = remark.match(/score\s*=\s*([0-9]*\.?[0-9]+)/i);
  if (scoreFromRemark?.[1]) {
    const value = Number(scoreFromRemark[1]);
    if (Number.isFinite(value)) {
      return value > 1 ? value / 100 : value;
    }
  }

  return null;
}

const EMPTY_COUNTS: NormalizedStagingBlacklistCounts = {
  totalReceived: 0,
  validCount: 0,
  invalidCount: 0,
  pendingCount: 0,
  notFoundCount: 0,
  processedNewCount: 0,
  processedExistingCount: 0,
  failedCount: 0,
  processedCount: 0,
  convertedToInactiveCount: 0,
  partialMatchCount: 0,
  partialMatch50To70Count: 0,
  partialMatch70To90Count: 0,
};

function normalizeCountBucket(value: unknown): NormalizedStagingBlacklistCounts {
  if (!isApiRecord(value)) return { ...EMPTY_COUNTS };

  return {
    totalReceived: readNumber(value, COUNT_KEYS.totalReceived),
    validCount: readNumber(value, COUNT_KEYS.validCount),
    invalidCount: readNumber(value, COUNT_KEYS.invalidCount),
    pendingCount: readNumber(value, COUNT_KEYS.pendingCount),
    notFoundCount: readNumber(value, COUNT_KEYS.notFoundCount),
    processedNewCount: readNumber(value, COUNT_KEYS.processedNewCount),
    processedExistingCount: readNumber(value, COUNT_KEYS.processedExistingCount),
    failedCount: readNumber(value, COUNT_KEYS.failedCount),
    processedCount: readNumber(value, COUNT_KEYS.processedCount),
    convertedToInactiveCount: readNumber(
      value,
      COUNT_KEYS.convertedToInactiveCount,
    ),
    partialMatchCount: readNumber(value, COUNT_KEYS.partialMatchCount),
    partialMatch50To70Count: readNumber(
      value,
      COUNT_KEYS.partialMatch50To70Count,
    ),
    partialMatch70To90Count: readNumber(
      value,
      COUNT_KEYS.partialMatch70To90Count,
    ),
  };
}

export function normalizeStagingBlacklistRow(
  item: unknown,
  index: number,
): NormalizedStagingBlacklistRow | null {
  if (!isApiRecord(item)) return null;

  const stagingId = readString(item, KEYS.providerBlacklistStagingId);
  const id = stagingId || readString(item, KEYS.providerBlacklistMasterId, KEYS.id);
  if (!id && !readString(item, KEYS.providerName)) return null;

  return {
    id: id || `staging-blacklist-${index}`,
    providerBlacklistStagingId: stagingId,
    providerName: readString(item, KEYS.providerName),
    insurerName: readString(
      item,
      KEYS.insurerName,
      KEYS.insurerCompanyName,
      "insurer_company_name",
      "icName",
    ),
    providerIibRohiniCode: normalizeRohiniCode(
      readString(item, KEYS.providerIibRohiniCode),
    ),
    providerAddress: readString(
      item,
      KEYS.providerAddress,
      "address",
      "provider_address",
    ),
    providerStatus: readString(item, KEYS.stagingStatus, KEYS.providerStatus),
    providerStatusReason: readString(
      item,
      KEYS.providerStatusReason
    ),
    providerAddressCity: readString(item, KEYS.providerCity, "city"),
    providerAddressState: readString(item, KEYS.providerState, "state", "stateName"),
    providerAddressDistrict: readString(
      item,
      KEYS.providerDistrict,
      "district",
      "provider_district",
    ),
    providerAddressPostalCode: readString(
      item,
      KEYS.providerPincode,
      "pincode",
    ),
    providerBlacklistStartDate: readString(item, KEYS.providerBlacklistStartDate),
    providerBlacklistEffectiveFrom: readString(
      item,
      KEYS.providerBlacklistEffectiveFrom,
    ),
    matchSimilarityScore: readMatchSimilarityScore(item),
  };
}

export function normalizeStagingBlacklistList(
  items: unknown[],
): NormalizedStagingBlacklistRow[] {
  return items
    .map((item, index) => normalizeStagingBlacklistRow(item, index))
    .filter((row): row is NormalizedStagingBlacklistRow => row != null);
}

export function normalizeStagingBlacklistAdditionalData(
  additionalData: unknown,
): NormalizedStagingBlacklistAdditionalData {
  if (!isApiRecord(additionalData)) {
    return {
      overallTotalReceived: 0,
      blacklisted: { ...EMPTY_COUNTS },
      watchlisted: { ...EMPTY_COUNTS },
    };
  }

  return {
    overallTotalReceived: readNumber(
      additionalData,
      COUNT_KEYS.overallTotalReceived,
    ),
    blacklisted: normalizeCountBucket(additionalData[BUCKET_KEYS.blacklisted]),
    watchlisted: normalizeCountBucket(additionalData[BUCKET_KEYS.watchlisted]),
  };
}

export function selectStagingBlacklistCounts(
  additionalData: NormalizedStagingBlacklistAdditionalData,
  mode: ExclusionStagingListingMode,
): NormalizedStagingBlacklistCounts {
  return mode === "watchlisted"
    ? additionalData.watchlisted
    : additionalData.blacklisted;
}

export function parseStagingBlacklistBody(body: unknown): {
  items: unknown[];
  totalRecords: number;
  additionalData: unknown;
} {
  if (body == null || typeof body !== "object") {
    return { items: [], totalRecords: 0, additionalData: null };
  }

  const record = body as Record<string, unknown>;
  const nested = isApiRecord(record.data) ? record.data : null;

  let items: unknown[] = [];
  if (Array.isArray(record.data)) {
    items = record.data;
  } else if (nested && Array.isArray(nested.data)) {
    items = nested.data;
  } else if (Array.isArray(record.content)) {
    items = record.content;
  }

  const paginationSource =
    (isApiRecord(record.pagination) && record.pagination) ||
    (nested && isApiRecord(nested.pagination) && nested.pagination) ||
    null;

  const totalFromPagination =
    paginationSource != null
      ? Number(
          (paginationSource as Record<string, unknown>).totalRecords ??
            (paginationSource as Record<string, unknown>).totalElements,
        )
      : Number.NaN;

  const additionalData =
    record.additionalData ?? nested?.additionalData ?? null;

  return {
    items,
    totalRecords: Number.isFinite(totalFromPagination)
      ? totalFromPagination
      : items.length,
    additionalData,
  };
}

const PARTIAL_MATCH_CANDIDATE_KEYS = {
  providerId: "providerId",
  providerName: "providerName",
  providerAddress: "providerAddress",
  providerCity: "providerCity",
  providerState: "providerState",
  providerPincode: "providerPincode",
  providerRohiniCode: "providerRohiniCode",
  matchSimilarityScore: "matchSimilarityScore",
} as const;

export type NormalizedPartialMatchCandidate = {
  providerId: string;
  providerName: string;
  providerAddress: string;
  providerCity: string;
  providerState: string;
  providerPincode: string;
  providerRohiniCode: string;
  matchSimilarityScore: number | null;
};

function extractPartialMatchCandidateItems(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (!isApiRecord(body)) return [];
  if (Array.isArray(body.data)) return body.data;
  const nested = isApiRecord(body.data) ? body.data : null;
  if (nested && Array.isArray(nested.data)) return nested.data;
  return [];
}

export function normalizePartialMatchCandidate(
  item: unknown,
  index: number,
): NormalizedPartialMatchCandidate | null {
  if (!isApiRecord(item)) return null;
  const providerId = readString(item, PARTIAL_MATCH_CANDIDATE_KEYS.providerId);
  const providerName = readString(item, PARTIAL_MATCH_CANDIDATE_KEYS.providerName);
  if (!providerId && !providerName) return null;

  return {
    providerId: providerId || `partial-match-${index}`,
    providerName,
    providerAddress: readString(item, PARTIAL_MATCH_CANDIDATE_KEYS.providerAddress),
    providerCity: readString(item, PARTIAL_MATCH_CANDIDATE_KEYS.providerCity),
    providerState: readString(item, PARTIAL_MATCH_CANDIDATE_KEYS.providerState),
    providerPincode: readString(item, PARTIAL_MATCH_CANDIDATE_KEYS.providerPincode),
    providerRohiniCode: normalizeRohiniCode(
      readString(item, PARTIAL_MATCH_CANDIDATE_KEYS.providerRohiniCode),
    ),
    matchSimilarityScore: readMatchSimilarityScore(item),
  };
}

export function normalizePartialMatchCandidates(
  body: unknown,
): NormalizedPartialMatchCandidate[] {
  return extractPartialMatchCandidateItems(body)
    .map((item, index) => normalizePartialMatchCandidate(item, index))
    .filter((row): row is NormalizedPartialMatchCandidate => row != null);
}

export function formatMatchSimilarityPercent(score: number | null | undefined): string {
  if (score == null || !Number.isFinite(score)) return "";
  return `${Math.round(score * 100)}%`;
}
