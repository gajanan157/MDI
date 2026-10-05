import { getApi, patchApi, postApi, providerApi } from "@/app/api/apiService";
import {
  extractNestedApiRows,
  isApiRecord,
  unwrapNestedApiPayload,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import {
  normalizeProviderOwnerList,
  normalizeProviderOwnerRow,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/providerOwner/providerOwnerNormalizer";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import type {
  CreateProviderOwnerBody,
  FetchProviderOwnerByIdResult,
  FetchProviderOwnerListResult,
  MutateProviderOwnerResult,
  NormalizedProviderOwner,
  PatchProviderOwnerBody,
  ProviderOwnerApiFailure,
  ProviderOwnerListFilters,
} from "./providerOwnerTypes";
import { PROVIDER_OWNER_LIST_FILTER_KEYS as FILTER_KEYS } from "./providerOwnerTypes";

const PROVIDER_PATH = "/v1/provider";

function buildOwnerListQuery(filters?: ProviderOwnerListFilters): string {
  const search = new URLSearchParams();
  const name = filters?.[FILTER_KEYS.providerOwnerName]?.trim();
  const designation = filters?.[FILTER_KEYS.providerOwnerDesignation]?.trim();
  const qualification = filters?.[FILTER_KEYS.providerOwnerQualification]?.trim();
  if (name) search.set(FILTER_KEYS.providerOwnerName, name);
  if (designation) search.set(FILTER_KEYS.providerOwnerDesignation, designation);
  if (qualification) search.set(FILTER_KEYS.providerOwnerQualification, qualification);
  const query = search.toString();
  return query ? `?${query}` : "";
}

function isOwnerNotFoundError(status?: number, error?: string | null): boolean {
  if (status === 404) return true;
  const message = (error ?? "").trim().toLowerCase();
  return message.includes("not found");
}

function extractOwnerRecord(payload: unknown): unknown {
  const unwrapped = unwrapNestedApiPayload(payload);
  if (isApiRecord(unwrapped)) return unwrapped;
  return payload;
}

/** GET `/v1/provider/{providerId}/owner` */
export async function fetchProviderOwnerList(
  providerId: string,
  filters?: ProviderOwnerListFilters,
): Promise<FetchProviderOwnerListResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/owner${buildOwnerListQuery(filters)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    if (isOwnerNotFoundError(response.status, response.error)) {
      return { ok: true, rows: [] };
    }
    return {
      ok: false,
      status: response.status,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const rows = extractNestedApiRows(response.data);
  if (rows.length > 0) {
    return {
      ok: true,
      rows: rows
        .map(normalizeProviderOwnerRow)
        .filter((row): row is NormalizedProviderOwner => row != null),
    };
  }

  return { ok: true, rows: normalizeProviderOwnerList(response.data) };
}

/** GET `/v1/provider/{providerId}/owner/{ownerId}` */
export async function fetchProviderOwnerById(
  providerId: string,
  ownerId: string,
): Promise<FetchProviderOwnerByIdResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/owner/${encodeURIComponent(ownerId)}`;
  const response = await getApi<unknown>(providerApi, url);

  if (!response.success) {
    return {
      ok: false,
      status: response.status,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const row = normalizeProviderOwnerRow(extractOwnerRecord(response.data));
  if (!row) {
    return { ok: false, message: extractApiMessage(response.data) };
  }

  return { ok: true, row };
}

function mutateOwnerFailure(
  response: {
    status?: number;
    errorPayload?: unknown;
    error?: unknown;
    message?: unknown;
  },
): ProviderOwnerApiFailure {
  const message =
    extractApiMessage(response.errorPayload) ??
    (typeof response.message === "string" && response.message.trim()
      ? response.message.trim()
      : undefined) ??
    (typeof response.error === "string" && response.error.trim()
      ? response.error.trim()
      : undefined) ??
    extractApiMessage(response.error) ??
    "Request failed.";

  return {
    ok: false,
    status: response.status,
    message,
  };
}

/** POST `/v1/provider/{providerId}/owner` */
export async function createProviderOwner(
  providerId: string,
  body: CreateProviderOwnerBody,
): Promise<MutateProviderOwnerResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/owner`;
  const response = await postApi<unknown, CreateProviderOwnerBody>(providerApi, url, body);

  if (!response.success) {
    return mutateOwnerFailure(response);
  }

  return { ok: true, message: extractApiMessage(response.data) };
}

/** PATCH `/v1/provider/{providerId}/owner` */
export async function patchProviderOwner(
  providerId: string,
  body: PatchProviderOwnerBody,
): Promise<MutateProviderOwnerResult> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/owner`;
  const response = await patchApi<unknown, PatchProviderOwnerBody>(providerApi, url, body);

  if (!response.success) {
    return mutateOwnerFailure(response);
  }

  return { ok: true, message: extractApiMessage(response.data) };
}
