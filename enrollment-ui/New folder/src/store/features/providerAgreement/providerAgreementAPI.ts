import { getApi, patchApi, postApi, providerApi } from "@/app/api/apiService";
import {
  normalizeProviderAgreement,
  normalizeProviderAgreementList,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/providerAgreementNormalizer";
import { normalizeCheckPpnStateCityValidationResponse } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/providerAgreementPpnCheckNormalizer";
import {
  normalizeProviderGipsaPpnCityOptions,
  normalizeProviderGipsaPpnStateOptions,
  type GipsaPpnDropdownOption,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/utils/agreementGipsaPpnNormalizer";
import type {
  CreateProviderAgreementBody,
  PatchProviderAgreementBody,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/providerAgreementSave";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import {
  isApiRecord,
  unwrapNestedApiPayload,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import {
  PROVIDER_AGREEMENT_LIST_FILTER_KEYS as FILTER_KEYS,
  type NormalizedCheckPpnStateCity,
  type NormalizedCheckPpnStateCityValidation,
  type NormalizedProviderAgreement,
  type ProviderAgreementListFilters,
} from "./providerAgreementTypes";

const PROVIDER_PATH = "/v1/provider";

export type FetchProviderAgreementListResult =
  | {
      ok: true;
      rows: NormalizedProviderAgreement[];
      totalRecords: number;
      listMessage?: string;
    }
  | { ok: false; message?: string };

export type FetchProviderAgreementByIdResult =
  | { ok: true; row: NormalizedProviderAgreement }
  | { ok: false; message?: string };

export type CreateProviderAgreementResult =
  | { ok: true; message?: string; data?: NormalizedProviderAgreement }
  | { ok: false; message?: string; status?: number };

export type UpdateProviderAgreementResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string; status?: number };

export type FetchProviderCheckPpnStateCityResult =
  | { ok: true; data: NormalizedCheckPpnStateCity }
  | { ok: false; message: string };

function buildProviderAgreementListQuery(filters?: ProviderAgreementListFilters): string {
  const search = new URLSearchParams();

  if (filters?.providerAgreementName?.trim()) {
    search.set(FILTER_KEYS.providerAgreementName, filters.providerAgreementName.trim());
  }
  if (filters?.providerAgreementType?.trim()) {
    search.set(FILTER_KEYS.providerAgreementType, filters.providerAgreementType.trim());
  }
  if (filters?.providerAgreementStatus?.trim()) {
    search.set(FILTER_KEYS.providerAgreementStatus, filters.providerAgreementStatus.trim());
  }
  if (filters?.applicableScope?.trim()) {
    search.set(FILTER_KEYS.applicableScope, filters.applicableScope.trim());
  }
  if (filters?.recordStatus?.trim()) {
    search.set(FILTER_KEYS.recordStatus, filters.recordStatus.trim());
  }
  if (filters?.download === true) {
    search.set(FILTER_KEYS.download, "true");
  } else if (filters?.download === false) {
    search.set(FILTER_KEYS.download, "false");
  }
  if (filters?.download !== true) {
    if (filters?.page != null) {
      search.set(FILTER_KEYS.page, String(filters.page));
    }
    if (filters?.size != null) {
      search.set(FILTER_KEYS.size, String(filters.size));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

function readTotalRecords(payload: unknown, rowCount: number): number {
  if (!isApiRecord(payload)) return rowCount;

  const dataNode = payload.data;
  if (isApiRecord(dataNode)) {
    const totalElements = dataNode.totalElements;
    if (typeof totalElements === "number") return totalElements;
    const totalRecords = dataNode.totalRecords;
    if (typeof totalRecords === "number") return totalRecords;
  }

  const totalElements = payload.totalElements;
  if (typeof totalElements === "number") return totalElements;

  return rowCount;
}

function extractRawProviderAgreementListItems(payload: unknown): unknown[] {
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

function parseProviderAgreementListBody(payload: unknown): {
  items: unknown[];
  totalRecords: number;
} {
  const items = extractRawProviderAgreementListItems(payload);
  return {
    items,
    totalRecords: readTotalRecords(payload, items.length),
  };
}

function extractProviderAgreementRecord(payload: unknown): unknown {
  const unwrapped = unwrapNestedApiPayload(payload);
  if (isApiRecord(unwrapped)) return unwrapped;
  return payload;
}

function readSanitizedMessage(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const sanitized = sanitizeApiErrorMessage(value).trim();
  return sanitized || undefined;
}

function extractAgreementApiMessage(response: {
  status?: number;
  error?: string | null;
  errorPayload?: unknown;
  message?: string | null;
}): string | undefined {
  if (
    response.status === 502 ||
    response.status === 503 ||
    response.status === 504
  ) {
    const statusMessage = readSanitizedMessage(response.error);
    if (statusMessage) return statusMessage;
  }

  const fromPayload = extractApiMessage(response.errorPayload);
  if (fromPayload) return fromPayload;

  const fromMessage = readSanitizedMessage(response.message);
  if (fromMessage) return fromMessage;

  const fromError = readSanitizedMessage(response.error);
  if (fromError) return fromError;

  const errorNode = response.errorPayload;
  if (errorNode == null || typeof errorNode !== "object") return undefined;

  const nestedError = (errorNode as Record<string, unknown>).error;
  if (nestedError == null || typeof nestedError !== "object") return undefined;

  return readSanitizedMessage((nestedError as Record<string, unknown>).message);
}

function isAgreementNotFoundError(status?: number, error?: string | null): boolean {
  if (status === 502 || status === 503 || status === 504) return false;
  if (status === 404) return true;
  const message = sanitizeApiErrorMessage(error ?? "", "").trim().toLowerCase();
  return message.includes("not found");
}

/** GET `/v1/provider/{providerId}/agreement` */
export async function fetchProviderAgreementList(
  providerId: string,
  filters?: ProviderAgreementListFilters,
): Promise<FetchProviderAgreementListResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/agreement${buildProviderAgreementListQuery(filters)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    if (isAgreementNotFoundError(response.status, response.error)) {
      return {
        ok: true,
        rows: [],
        totalRecords: 0,
        listMessage: extractAgreementApiMessage(response),
      };
    }
    return {
      ok: false,
      message: extractAgreementApiMessage(response),
    };
  }

  const parsed = parseProviderAgreementListBody(response.data);
  const envelope = response.data as { success?: boolean } | undefined;
  if (envelope && typeof envelope.success === "boolean" && envelope.success === false) {
    const listMessage = extractApiMessage(response.data);
    if (isAgreementNotFoundError(undefined, listMessage)) {
      return {
        ok: true,
        rows: [],
        totalRecords: 0,
        listMessage,
      };
    }
    return {
      ok: false,
      message: listMessage,
    };
  }

  const rows =
    parsed.items.length > 0
      ? parsed.items
          .map(normalizeProviderAgreement)
          .filter((row): row is NormalizedProviderAgreement => row != null)
      : normalizeProviderAgreementList(response.data);

  return {
    ok: true,
    rows,
    totalRecords: parsed.totalRecords > 0 ? parsed.totalRecords : rows.length,
  };
}

/** GET `/v1/provider/{providerId}/agreement/{agreementId}` */
export async function fetchProviderAgreementById(
  providerId: string,
  agreementId: string,
): Promise<FetchProviderAgreementByIdResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/agreement/${encodeURIComponent(agreementId)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return {
      ok: false,
      message: extractAgreementApiMessage(response),
    };
  }

  const record = extractProviderAgreementRecord(response.data);
  const row = normalizeProviderAgreement(record);
  if (!row) {
    return { ok: false, message: extractApiMessage(response.data) };
  }

  return { ok: true, row };
}

/** POST `/v1/provider/{providerId}/agreement` */
export async function createProviderAgreement(
  providerId: string,
  body: CreateProviderAgreementBody,
): Promise<CreateProviderAgreementResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/agreement`;
  const response = await postApi<unknown, CreateProviderAgreementBody>(
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

  const record = extractProviderAgreementRecord(response.data);
  const data = normalizeProviderAgreement(record) ?? undefined;

  return {
    ok: true,
    message: extractApiMessage(response.data),
    data,
  };
}

/** PATCH `/v1/provider/{providerId}/agreement` — send only changed fields. */
export async function patchProviderAgreement(
  providerId: string,
  body: PatchProviderAgreementBody,
): Promise<UpdateProviderAgreementResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/agreement`;
  const response = await patchApi<unknown, PatchProviderAgreementBody>(
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

  return { ok: true, message: extractApiMessage(response.data) };
}

/** GET `/v1/provider/{id}/check-ppn-state-city` — PPN state/city ids, names, and availability. */
export async function fetchProviderCheckPpnStateCity(
  providerId: string,
): Promise<FetchProviderCheckPpnStateCityResult> {
  const validationResult = await fetchProviderCheckPpnValidation(providerId);
  if (!validationResult.ok) {
    return { ok: false, message: validationResult.message };
  }

  return { ok: true, data: validationResult.data };
}

export type FetchProviderCheckPpnValidationResult =
  | { ok: true; data: NormalizedCheckPpnStateCityValidation }
  | { ok: false; message: string };

/** GET `/v1/provider/{id}/check-ppn-state-city` — validation only (no details fetch). */
export async function fetchProviderCheckPpnValidation(
  providerId: string,
): Promise<FetchProviderCheckPpnValidationResult> {
  const resolvedId = providerId.trim();
  if (!resolvedId) {
    return { ok: false, message: "" };
  }

  const url = `${PROVIDER_PATH}/${encodeURIComponent(resolvedId)}/check-ppn-state-city`;
  const checkResponse = await getApi<unknown>(providerApi, url);

  if (!checkResponse.success) {
    return {
      ok: false,
      message: extractAgreementApiMessage(checkResponse) ?? "",
    };
  }

  const validation = normalizeCheckPpnStateCityValidationResponse(checkResponse.data);
  if (!validation) {
    return { ok: false, message: "" };
  }

  return { ok: true, data: validation };
}

const PROVIDER_GIPSA_PPN_STATE_PATH = "/v1/provider-gipsa-ppn-state";
const PROVIDER_GIPSA_PPN_CITY_PATH = "/v1/provider-gipsa-ppn-city";

export type FetchGipsaPpnOptionsResult =
  | { ok: true; options: GipsaPpnDropdownOption[] }
  | { ok: false; message?: string };

export async function fetchProviderGipsaPpnStateOptionsApi(
  providerGipsaPpnStateName: string,
): Promise<FetchGipsaPpnOptionsResult> {
  const search = new URLSearchParams();
  search.set("providerGipsaPpnStateName", providerGipsaPpnStateName.trim());
  search.set("download", "true");

  const response = await getApi<unknown>(
    providerApi,
    `${PROVIDER_GIPSA_PPN_STATE_PATH}?${search.toString()}`,
  );

  if (!response.success) {
    return {
      ok: false,
      message: extractAgreementApiMessage(response),
    };
  }

  return { ok: true, options: normalizeProviderGipsaPpnStateOptions(response.data) };
}

export async function fetchProviderGipsaPpnCityOptionsApi(
  providerGipsaPpnCityName: string,
): Promise<FetchGipsaPpnOptionsResult> {
  const search = new URLSearchParams();
  search.set("providerGipsaPpnCityName", providerGipsaPpnCityName.trim());
  search.set("download", "true");

  const response = await getApi<unknown>(
    providerApi,
    `${PROVIDER_GIPSA_PPN_CITY_PATH}?${search.toString()}`,
  );

  if (!response.success) {
    return {
      ok: false,
      message: extractAgreementApiMessage(response),
    };
  }

  return { ok: true, options: normalizeProviderGipsaPpnCityOptions(response.data) };
}
