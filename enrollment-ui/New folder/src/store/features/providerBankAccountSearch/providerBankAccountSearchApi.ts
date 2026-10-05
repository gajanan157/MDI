import { getApi, providerApi, type ApiResponse } from "@/app/api/apiService";
import {
  extractNestedApiRows,
  isApiRecord,
  toApiRecordArray,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import { readFieldValue } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/readFieldValue";
import type { IcWiseGridRow } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/types";

const BANK_ACCOUNT_SEARCH_PATH = "/v1/provider/bank-account/search";

/** Match-status options for the IC-Provider Bank Details search. */
export const BANK_MATCH_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "MATCHED", label: "Matched" },
  { value: "NOT_MATCHED", label: "Not Matched" },
] as const;

export type BankAccountSearchFilters = {
  page: number;
  size: number;
  insurerRecord?: boolean | null;
  providerName?: string;
  rohiniCode?: string;
  insurerId?: string;
  panNumber?: string;
  matchStatus?: string;
};

/**
 * Landing grid row for the IC-Provider Bank Details search. Extends the shared
 * IC-wise row with the bank / PAN fields this screen also filters on.
 */
export type BankAccountSearchRow = IcWiseGridRow & {
  bankAccountNo: string;
  bankIfscCode: string;
  bankHolderName: string;
  panNo: string;
  panHolderName: string;
  recordSource: string;
};

export type BankAccountSearchResult =
  | { ok: true; rows: BankAccountSearchRow[]; totalRecords: number }
  | { ok: false; status?: number; message?: string };

function readString(raw: Record<string, unknown>, keys: readonly string[]): string {
  const value = readFieldValue(raw, keys);
  return value == null ? "" : String(value).trim();
}

function toBankMatch(value: string): IcWiseGridRow["bankMatch"] {
  const v = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (v === "MATCHED" || v === "MATCH") return "matched";
  if (v === "NOT_MATCHED" || v === "MISMATCH" || v === "UNMATCHED") return "mismatch";
  return "pending";
}

function readRecordSource(raw: Record<string, unknown>): string {
  const explicit = readString(raw, [
    "recordSource",
    "record_source",
    "providerBankRecordSource",
    "source",
    "dataSource",
  ]);
  if (explicit) {
    const v = explicit.trim().toUpperCase();
    if (v === "INSURER" || v === "IC") return "Insurer record";
    if (v === "PROVIDER") return "Provider record";
    return explicit;
  }
  const flag = readFieldValue(raw, ["isInsurerRecord", "insurerRecord"]);
  if (flag === true || String(flag).trim().toLowerCase() === "true") {
    return "Insurer record";
  }
  if (flag === false || String(flag).trim().toLowerCase() === "false") {
    return "Provider record";
  }
  return "";
}

/** Exported for tests — maps one raw `/bank-account/search` record to a grid row. */
export function normalizeRow(raw: unknown, index: number): BankAccountSearchRow | null {
  if (!isApiRecord(raw)) return null;
  const providerId = readString(raw, ["providerId", "provider_id"]);
  const insurerId = readString(raw, ["insurerId", "insurer_id", "icId"]);

  return {
    id:
      readString(raw, ["id", "providerBankAccountId", "bankAccountId", "providerBankId"]) ||
      `${providerId || "row"}-${insurerId || index}`,
    providerId,
    icId: insurerId,
    icName: readString(raw, ["insurerName", "insurer_name", "icName", "insuranceCompany"]),
    providerName: readString(raw, ["providerName", "provider_name"]),
    providerCode: readString(raw, ["providerCode", "provider_code", "providerRegistryCode"]),
    rohiniRegistryCode: readString(raw, [
      "rohiniCode",
      "rohini_code",
      "rohiniNumber",
      "rohiniRegistryCode",
      "providerRohiniNo",
      "providerRohiniNumber",
    ]),
    category: readString(raw, ["category", "networkCategory"]),
    providerNetworkSource: readString(raw, ["providerNetworkSource", "networkSource"]),
    providerNetworkIsActive: readString(raw, ["providerNetworkIsActive", "isActive"]),
    providerNetworkMode: readString(raw, ["providerNetworkMode", "networkMode"]),
    bankMatch: toBankMatch(
      readString(raw, [
        "matchStatus",
        "match_status",
        "bankMatch",
        "bankMatchStatus",
        "providerBankMatchStatus",
      ]),
    ),
    bankAccountNo: readString(raw, [
      "providerBankAccountNo",
      "bankAccountNo",
      "accountNo",
      "accountNumber",
    ]),
    bankIfscCode: readString(raw, [
      "providerBankIfscCode",
      "bankIfscCode",
      "ifscCode",
      "ifsc",
    ]),
    bankHolderName: readString(raw, [
      "providerBankHolderName",
      "bankHolderName",
      "accountHolderName",
    ]),
    panNo: readString(raw, ["providerPanNo", "panNo", "panNumber", "pan"]),
    panHolderName: readString(raw, ["providerPanHolderName", "panHolderName"]),
    recordSource: readRecordSource(raw),
  };
}

function readTotalRecords(payload: unknown, fallback: number): number {
  if (!isApiRecord(payload)) return fallback;
  const pagination = payload.pagination;
  if (isApiRecord(pagination)) {
    const total = Number(pagination.totalRecords ?? pagination.totalElements);
    if (Number.isFinite(total)) return total;
  }
  const flat = Number(payload.totalRecords ?? payload.totalElements);
  return Number.isFinite(flat) ? flat : fallback;
}

function extractRows(body: unknown): { items: unknown[]; totalRecords: number } {
  const nested = extractNestedApiRows(body);
  if (nested.length > 0) {
    return { items: nested, totalRecords: readTotalRecords(body, nested.length) };
  }
  if (!isApiRecord(body)) return { items: [], totalRecords: 0 };
  const items = Array.isArray(body.data)
    ? toApiRecordArray(body.data)
    : Array.isArray(body.content)
      ? toApiRecordArray(body.content)
      : [];
  return { items, totalRecords: readTotalRecords(body, items.length) };
}

/** GET `/v1/provider/bank-account/search` — IC-Provider Bank Details landing grid. */
export async function searchProviderBankAccounts(
  filters: BankAccountSearchFilters,
): Promise<BankAccountSearchResult> {
  const search = new URLSearchParams();
  search.set("page", String(filters.page > 0 ? filters.page : 1));
  search.set("size", String(filters.size));

  if (typeof filters.insurerRecord === "boolean") {
    search.set("insurerRecord", String(filters.insurerRecord));
  }
  const setIfPresent = (key: string, value?: string) => {
    const trimmed = value?.trim();
    if (trimmed) search.set(key, trimmed);
  };
  setIfPresent("providerName", filters.providerName);
  setIfPresent("rohiniCode", filters.rohiniCode);
  setIfPresent("insurerId", filters.insurerId);
  setIfPresent("panNumber", filters.panNumber);
  setIfPresent("matchStatus", filters.matchStatus);

  const url = `${BANK_ACCOUNT_SEARCH_PATH}?${search.toString()}`;
  const response: ApiResponse<unknown> = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return {
      ok: false,
      status: response.status,
      message:
        (typeof response.error === "string" ? response.error : undefined) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const { items, totalRecords } = extractRows(response.data);
  const rows = items
    .map((item, index) => normalizeRow(item, index))
    .filter((row): row is BankAccountSearchRow => row != null);

  return { ok: true, rows, totalRecords: totalRecords > 0 ? totalRecords : rows.length };
}
