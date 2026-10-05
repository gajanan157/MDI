import {
  getApi,
  normalizeApiErrorBody,
  patchApi,
  postApi,
  providerApi,
  type ApiResponse,
} from "@/app/api/apiService";
import type { ProviderContactPersonDetail } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/hospitalData";
import {
  PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME,
  PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/bank/bankAccountMapper";
import type {
  CreateProviderBody,
  ProviderListQuery,
  ProviderPageResponse,
} from "./providerTypes";

const PROVIDER_LIST_PATH = "/v1/provider";

const CONTACT_PERSON_NOT_FOUND_PHRASES = [
  "owner not found",
  "contact person not found",
  "contact persons not found",
] as const;

const CONTACT_PERSON_OWNER_NOT_FOUND_CODE = "PROV-404-05";

function messageIndicatesContactPersonNotFound(message: string): boolean {
  const normalized = message.toLowerCase();
  if (CONTACT_PERSON_NOT_FOUND_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return true;
  }
  return normalized.includes("contact person") && normalized.includes("not found");
}

function isContactPersonNotFoundInErrorPayload(payload: unknown): boolean {
  if (payload == null || typeof payload !== "object") return false;

  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && messageIndicatesContactPersonNotFound(record.message)) {
    return true;
  }

  const inner = record.error;
  if (inner == null || typeof inner !== "object") return false;

  const innerRecord = inner as Record<string, unknown>;
  if (innerRecord.code === CONTACT_PERSON_OWNER_NOT_FOUND_CODE) return true;

  return messageIndicatesContactPersonNotFound(String(innerRecord.message ?? ""));
}

/** True when GET `/contact-person` returns 404 for missing provider owner (inline empty state, no legacy card). */
export function isProviderContactPersonOwnerNotFound(
  res: ApiResponse<unknown>,
): boolean {
  if (res.success || res.status !== 404) return false;
  if (messageIndicatesContactPersonNotFound(res.error ?? "")) return true;
  return isContactPersonNotFoundInErrorPayload(res.errorPayload);
}

function toRequestPage(uiPage: number): number {
  const n = Number(uiPage);
  if (Number.isNaN(n) || n <= 0) return 1;
  return n;
}

/**
 * GET `/v1/provider` with pagination and optional filters
 * (`providerName`, `providerIibRohiniCode`, `providerCode`,
 * `providerIibRohiniEffectiveToDate`, `providerRohiniStatus`,
 * `providerAgreementNames`, `insurerIds`, …).
 */
export async function getProviderList(
  query: ProviderListQuery,
): Promise<ApiResponse<ProviderPageResponse | null>> {
  const params: Record<string, string | number | boolean | undefined> = {
    page: toRequestPage(query.page),
    size: query.size,
    providerName: query.providerName?.trim() || undefined,
    providerIibRohiniCode: query.providerRohiniCode?.trim() || undefined,
    providerCode: query.providerCode?.trim() || undefined,
    providerNetworkType: query.providerNetworkType,
    providerType: query.providerType,
    expiringInDays: query.expiringInDays,
    providerIibRohiniEffectiveToDate: query.effectiveToDate?.trim() || undefined,
    providerRohiniStatus: query.rohiniExpiryStatus,
    providerAgreementNames:
      query.agreementTypes && query.agreementTypes.length > 0
        ? query.agreementTypes.join(",")
        : undefined,
    pincode: query.pincode?.trim() || undefined,
    state: query.state?.trim() || undefined,
    city: query.city?.trim() || undefined,
    insurerIds:
      query.insurerIds && query.insurerIds.length > 0
        ? query.insurerIds.join(",")
        : undefined,
    networkSource: query.networkSource,
    sortBy: query.sortBy?.trim() || undefined,
    ...(query.expiringProvidersView ? { expiringProvidersView: true } : {}),
  };

  const res = await getApi<ProviderPageResponse>(
    providerApi,
    PROVIDER_LIST_PATH,
    {
      params,
    },
  );
  if (!res.success) {
    return res;
  }

  const payload = res.data;
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    (payload as Record<string, unknown>).success === false
  ) {
    const body = payload as Record<string, unknown>;
    return {
      success: false,
      data: null,
      status: typeof body.status === "number" ? body.status : res.status,
      message: typeof body.message === "string" ? body.message : null,
      error: normalizeApiErrorBody(body),
      errorPayload: body,
    };
  }

  return res;
}

const PROVIDER_DOWNLOAD_EXCEL_PATH = `${PROVIDER_LIST_PATH}/download-excel`;

type ProviderListExcelDownloadQuery = Pick<
  ProviderListQuery,
  | "providerName"
  | "providerRohiniCode"
  | "providerCode"
  | "providerNetworkType"
  | "providerType"
  | "expiringInDays"
  | "effectiveToDate"
  | "rohiniExpiryStatus"
  | "agreementTypes"
  | "state"
  | "city"
  | "insurerIds"
  | "networkSource"
  | "expiringProvidersView"
>;

function setIfPresent(
  params: Record<string, string | number | boolean>,
  key: string,
  value: string | number | boolean | undefined | null,
): void {
  if (value == null || value === "") return;
  params[key] = value;
}

function setJoinedCsv(
  params: Record<string, string | number | boolean>,
  key: string,
  values: string[] | undefined,
): void {
  if (!values?.length) return;
  params[key] = values.join(",");
}

/** Excel export query params (download=true + same filters as list). */
export function buildProviderListExcelDownloadParams(
  query: ProviderListExcelDownloadQuery,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    download: true,
  };

  setIfPresent(params, "providerName", query.providerName?.trim());
  setIfPresent(params, "providerIibRohiniCode", query.providerRohiniCode?.trim());
  setIfPresent(params, "providerCode", query.providerCode?.trim());
  setIfPresent(params, "providerNetworkType", query.providerNetworkType);
  setIfPresent(params, "providerType", query.providerType);
  setIfPresent(
    params,
    "expiringInDays",
    query.expiringInDays != null && query.expiringInDays > 0
      ? query.expiringInDays
      : undefined,
  );
  setIfPresent(
    params,
    "providerIibRohiniEffectiveToDate",
    query.effectiveToDate?.trim(),
  );
  setIfPresent(params, "providerRohiniStatus", query.rohiniExpiryStatus);
  setJoinedCsv(params, "providerAgreementNames", query.agreementTypes);
  setIfPresent(params, "state", query.state?.trim());
  setIfPresent(params, "city", query.city?.trim());
  setJoinedCsv(params, "insurerIds", query.insurerIds);
  setIfPresent(params, "networkSource", query.networkSource);
  setIfPresent(
    params,
    "expiringProvidersView",
    query.expiringProvidersView ? true : undefined,
  );

  return params;
}

/** GET `/v1/provider/download-excel` — export with the same filters as the list API. */
export async function downloadProviderListExcel(
  query: ProviderListExcelDownloadQuery,
): Promise<Blob> {
  const res = await providerApi.get(PROVIDER_DOWNLOAD_EXCEL_PATH, {
    params: buildProviderListExcelDownloadParams(query),
    responseType: "blob",
  });

  const contentType =
    (res.headers?.["content-type"] as string | undefined) ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return new Blob([res.data], { type: contentType });
}

/** Unwrap nested `data` / `result` / `payload` envelopes from provider APIs. */
export function unwrapProviderEntity(data: unknown): unknown {
  if (data == null || typeof data !== "object") return data;
  const d = data as Record<string, unknown>;
  if (d.data != null && typeof d.data === "object" && !Array.isArray(d.data)) {
    return unwrapProviderEntity(d.data);
  }
  if (d.result != null && typeof d.result === "object") {
    return unwrapProviderEntity(d.result);
  }
  if (d.payload != null && typeof d.payload === "object") {
    return unwrapProviderEntity(d.payload);
  }
  return data;
}

const PROVIDER_DETAILS_IDENTIFIER_TYPES = "ROHINI_CODE,OLD_PROVIDER_CODE";

/** GET `/v1/provider/{id}/details` — single provider for detail view. */
export async function getProviderById(
  id: string,
): Promise<ApiResponse<unknown>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(id)}/details`;
  const res = await getApi<unknown>(providerApi, url, {
    params: { identifierTypes: PROVIDER_DETAILS_IDENTIFIER_TYPES },
  });
  if (!res.success) {
    console.log("Failed to load provider by id", res);
    return res;
  }
  return {
    success: true,
    data: unwrapProviderEntity(res.data),
    error: null,
  };
}

/** POST `/v1/provider` — create a new provider. */
export async function createProvider(
  payload: CreateProviderBody,
): Promise<ApiResponse<unknown>> {
  const res = await postApi<unknown, CreateProviderBody>(
    providerApi,
    PROVIDER_LIST_PATH,
    payload,
  );
  if (!res.success) {
    console.log("Failed to create provider", res);
  }
  return res;
}

/** PATCH `/v1/provider/{id}/details` */
export async function patchProviderDetails(
  providerId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/details`;
  const res = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    console.log("Failed to patch provider details", res);
  }
  return res;
}

/** PATCH `/v1/provider/{id}` — Overview update */
export async function patchProvider(
  providerId: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}`;
  const res = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    console.log("Failed to patch provider", res);
  }
  return res;
}

/** GET `/v1/provider/{id}/owner` */
export async function getProviderOwner(
  providerId: string,
): Promise<unknown | null> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/owner`;
  const res = await getApi<unknown>(providerApi, url);
  if (!res.success) {
    console.log("Failed to load provider owner", res);
    return null;
  }
  return unwrapProviderEntity(res.data);
}

function isContactPersonRecord(value: unknown): value is ProviderContactPersonDetail {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** Unwrap GET `/contact-person` and return the contact list as-is. */
export function resolveProviderContactPersonList(
  raw: unknown,
): ProviderContactPersonDetail[] {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    return raw.filter(isContactPersonRecord);
  }

  if (typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).data)) {
    return ((raw as Record<string, unknown>).data as unknown[]).filter(isContactPersonRecord);
  }

  return [];
}

/**
 * GET `/v1/provider/{id}/contact-person`.
 * On HTTP error, `success` is false and `error` / `status` are set for toasts (e.g. 404).
 */
export async function getProviderContactPerson(
  providerId: string,
): Promise<ApiResponse<ProviderContactPersonDetail[]>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/contact-person`;
  const res = await getApi<unknown>(providerApi, url);
  if (!res.success) {
    console.log("Failed to load provider contact person", res);
    return {
      success: false,
      data: null,
      error: res.error,
      status: res.status,
      errorPayload: res.errorPayload,
      message: res.message,
    };
  }
  return {
    success: true,
    data: resolveProviderContactPersonList(unwrapProviderEntity(res.data)),
    error: null,
  };
}

function isBankAccountRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** Pick primary bank row when GET `/bank-account` returns a list. */
function resolveProviderBankAccountRecord(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;

  let current: unknown = raw;
  if (isBankAccountRecord(current) && Array.isArray(current.data)) {
    current = current.data;
  }

  if (Array.isArray(current)) {
    const rows = current.filter(isBankAccountRecord);
    if (rows.length === 0) return null;
    const primary = rows.find((row) => row.providerBankIsPrimary === true);
    return primary ?? rows[0];
  }

  if (isBankAccountRecord(current)) return current;
  return null;
}

/**
 * GET `/v1/provider/{id}/bank-account`
 * Query: `panIdentifierTypeName`, `tanIdentifierTypeName` — resolves PAN/TAN on the bank row.
 * Response body typically: `{ success, message, data: [ { providerBankName, ... } ] }`.
 * Returns the primary bank row (`providerBankIsPrimary === true`), else the first row.
 */
export async function getProviderBankAccount(
  providerId: string,
): Promise<Record<string, unknown> | null> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/bank-account`;
  const res = await getApi<unknown>(providerApi, url, {
    params: {
      panIdentifierTypeName: PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME,
      tanIdentifierTypeName: PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME,
    },
  });
  if (!res.success) {
    console.log("Failed to load provider bank account", res);
    return null;
  }
  return resolveProviderBankAccountRecord(unwrapProviderEntity(res.data));
}

export interface ValidateBankIfscResponseData {
  IFSC?: string;
  BANK?: string;
  BRANCH?: string;
  [key: string]: unknown;
}

/** GET `/v1/provider/validate-bank-ifsc?ifsc=...` */
export async function validateProviderBankIfsc(
  ifsc: string,
): Promise<ApiResponse<ValidateBankIfscResponseData>> {
  const res = await getApi<{
    success?: boolean;
    status?: number;
    message?: string;
    data?: ValidateBankIfscResponseData;
  }>(providerApi, `${PROVIDER_LIST_PATH}/validate-bank-ifsc`, {
    params: { ifsc: ifsc.trim() },
  });
  if (!res.success) {
    console.log("Failed to validate provider bank IFSC", res);
    return {
      success: false,
      data: null,
      error: res.error,
      status: res.status,
      errorPayload: res.errorPayload,
    };
  }
  const payload = res.data ?? {};
  return {
    success: payload.success !== false,
    data: payload.data ?? null,
    error: null,
    status: payload.status ?? 200,
  };
}

export interface ProviderBankAccountWritePayload {
  providerBankId?: string;
  providerBankIfscIsVerified?: boolean;
  providerAccountType?: string;
  providerBankAccountBeneficiaryType?: string;
  providerBankName?: string;
  providerBankBranch?: string;
  providerBankIfscCode?: string;
  providerBankMicrCode?: string;
  providerBankHolderName?: string;
  providerBankAccountNo?: string;
  providerBankAddress?: string;
  providerPanNo?: string;
  providerPanHolderName?: string;
  providerTanNo?: string;
  panIdentifierTypeName?: string;
  tanIdentifierTypeName?: string;
  cancelChequeFileMetadataId?: string;
  panCardFileMetadataId?: string;
}

/** @deprecated Prefer `ProviderBankAccountWritePayload`. */
export type ProviderBankAccountPatchPayload = ProviderBankAccountWritePayload;

/** POST `/v1/provider/{id}/bank-account` — create when no bank id exists. */
export async function postProviderBankAccount(
  providerId: string,
  payload: ProviderBankAccountWritePayload,
): Promise<ApiResponse<unknown>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/bank-account`;
  const res = await postApi<unknown, ProviderBankAccountWritePayload>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    console.log("Failed to create provider bank account", res);
  }
  return res;
}

/** PATCH `/v1/provider/{id}/bank-account` — update when bank id exists. */
export async function patchProviderBankAccount(
  providerId: string,
  payload: ProviderBankAccountWritePayload,
): Promise<ApiResponse<unknown>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/bank-account`;
  const res = await patchApi<unknown, ProviderBankAccountWritePayload>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    console.log("Failed to patch provider bank account", res);
  }
  return res;
}

export interface ProviderContactPersonPatchItem {
  providerContactPersonId?: string;
  recordStatus?: string;
  providerContactPersonRoleId?: string;
  providerContactPersonRole?: string;
  providerContactPersonFullName?: string;
  providerContactPersonDesignation?: string;
  providerContactPersonTelephoneNo?: string[];
  providerContactPersonMobileNo?: string[];
  providerContactPersonEmailId?: string[];
}

export interface ProviderContactPersonsPatchPayload {
  contactPersons: ProviderContactPersonPatchItem[];
}

/** POST `/v1/provider/{id}/contact-persons` */
export async function postProviderContactPersons(
  providerId: string,
  payload: ProviderContactPersonsPatchPayload,
): Promise<ApiResponse<unknown>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/contact-persons`;
  const res = await postApi<unknown, ProviderContactPersonsPatchPayload>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    console.log("Failed to create provider contact person", res);
  }
  return res;
}

/** PATCH `/v1/provider/{id}/contact-persons` */
export async function patchProviderContactPersons(
  providerId: string,
  payload: ProviderContactPersonsPatchPayload,
): Promise<ApiResponse<unknown>> {
  const url = `${PROVIDER_LIST_PATH}/${encodeURIComponent(providerId)}/contact-persons`;
  const res = await patchApi<unknown, ProviderContactPersonsPatchPayload>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    console.log("Failed to patch provider contact persons", res);
  }
  return res;
}
