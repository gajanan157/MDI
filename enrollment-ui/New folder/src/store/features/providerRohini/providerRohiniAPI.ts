import { API_BASE_URLS, providerApi } from "@/app/api/apiService";
import type {
  RohiniApiItem,
  RohiniInwardNoItem,
  RohiniListApiResponse,
  RohiniListFilters,
  RohiniPageEnvelope,
  RohiniRegisterUploadApiBody,
  RohiniValidateApiBody,
  RohiniValidateUploadPayload,
  ProviderRohiniRow,
  RohiniDetailApiEnvelope,
} from "./providerRohiniTypes";

export const ROHINI_MASTER_BASE_PATH = "/v1/provider-rohini-master";
export const ROHINI_MASTER_DOWNLOAD_EXCEL_PATH = `${ROHINI_MASTER_BASE_PATH}/download-excel`;

function getTotalRecordsFromPagination(
  b: Record<string, unknown>,
): number | undefined {
  const p = b.pagination;
  if (!p || typeof p !== "object") return undefined;
  const pag = p as Record<string, unknown>;
  const n = Number(pag.totalRecords);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function resolveRohiniListTotalItems(
  b: Record<string, unknown>,
  items: RohiniApiItem[],
  page?: RohiniPageEnvelope,
): number {
  const fromPagination = getTotalRecordsFromPagination(b);
  if (fromPagination !== undefined) return fromPagination;

  const fromTop = Number(b.totalElements ?? b.totalCount ?? b.count);
  if (Number.isFinite(fromTop) && fromTop > 0) return fromTop;

  if (page) {
    const fromPage = Number(page.totalElements ?? page.total);
    if (Number.isFinite(fromPage) && fromPage > 0) return fromPage;
  }

  const topTotalRecords = (b as { totalRecords?: number }).totalRecords;
  if (topTotalRecords !== undefined) {
    const n = Number(topTotalRecords);
    if (Number.isFinite(n) && n > 0) return n;
  }

  return items.length;
}

/**
 * Normalizes list API bodies: supports `data: T[]`, `pagination.totalRecords`,
 * `data: { content, totalElements }`, or top-level `{ content, totalElements }`.
 */
export function extractRohiniListFromEnvelope(
  body: RohiniListApiResponse | Record<string, unknown> | null | undefined,
): { items: RohiniApiItem[]; totalItems: number } {
  if (!body || typeof body !== "object") {
    return { items: [], totalItems: 0 };
  }

  const b = body as Record<string, unknown>;
  let items: RohiniApiItem[] = [];
  let pageEnvelope: RohiniPageEnvelope | undefined;

  const rawData = b.data;

  if (Array.isArray(rawData)) {
    items = rawData as RohiniApiItem[];
  } else if (rawData && typeof rawData === "object") {
    const page = rawData as RohiniPageEnvelope & Record<string, unknown>;
    pageEnvelope = page;
    if (Array.isArray(page.content)) {
      items = page.content as RohiniApiItem[];
    } else if (Array.isArray(page.data)) {
      items = page.data as RohiniApiItem[];
    }
  }

  if (items.length === 0 && Array.isArray(b.content)) {
    items = b.content as RohiniApiItem[];
  }

  const totalItems = resolveRohiniListTotalItems(b, items, pageEnvelope);

  return { items, totalItems };
}

export function extractRohiniAdditionalData(
  body: RohiniListApiResponse | Record<string, unknown> | null | undefined,
): {
  inwardNos: RohiniInwardNoItem[];
  countExpiringInDays: number | null;
} {
  if (!body || typeof body !== "object") {
    return { inwardNos: [], countExpiringInDays: null };
  }
  const add = (body as RohiniListApiResponse).additionalData;
  if (!add || typeof add !== "object") {
    return { inwardNos: [], countExpiringInDays: null };
  }
  const inwardNos = Array.isArray(add.inwardNos) ? add.inwardNos : [];
  const n = Number(add.countExpiringInDays);
  const countExpiringInDays = Number.isFinite(n) && n >= 0 ? n : null;
  return { inwardNos, countExpiringInDays };
}

export function mapRohiniApiItemToRow(
  item: RohiniApiItem,
  index: number,
): ProviderRohiniRow {
  const email = Array.isArray(item.providerEmailId)
    ? item.providerEmailId.join(", ")
    : "";
  const contactNumber = Array.isArray(item.providerMobileNo)
    ? item.providerMobileNo.join(", ")
    : "";

  const id =
    item.providerRohiniId ??
    (item as { id?: string }).id ??
    item.rohiniCode ??
    `row-${index}`;

  return {
    id: String(id),
    providerName: item.providerName ?? "—",
    providerRohiniCode: item.rohiniCode ?? "—",
    address: item.providerAddress ?? "—",
    email,
    contactPerson: "—",
    contactNumber,
    state: item.stateName ?? "—",
    district: item.district ?? "—",
    city: item.city ?? "—",
    pincode: item.postalCode ?? "—",
    beds: item.bedCount ?? 0,
    latitude: String(item.latitude ?? "—"),
    longitude: String(item.longitude ?? "—"),
    rohiniExpiryDate: item.effectiveToDate ?? "",
    rohiniNextRenewalDate: item.nextRenewalDueDate ?? "",
    registrationStatus: item.registrationStatus ?? "—",
    providerStatus: item.providerStatus ?? "—",
    networkType: item.networkType ?? "—",
    recordStatus: item.recordStatus ?? "—",
  };
}

/**
 * List: always send page, size, sortBy, download.
 * `page` here is **0-based** as required by the provider-rohini-master API.
 */
export function buildRohiniMasterQueryParams(
  page: number,
  size: number,
  download: boolean,
  filters: RohiniListFilters,
  countExpiringInDays?: boolean,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    page,
    size,
    sortBy: "createdAt",
    download,
  };

  if (countExpiringInDays) {
    params.expiringProvidersView = true;
  }

  const rohiniCode = (filters.providerRohiniCode ?? "").trim();
  if (rohiniCode) params.rohiniCode = rohiniCode;

  const state = (filters.state ?? "").trim();
  if (state) params.state = state;

  const city = (filters.city ?? "").trim();
  if (city) params.city = city;

  const district = (filters.district ?? "").trim();
  if (district) params.district = district;

  const pincode = (filters.pincode ?? "").trim();
  if (pincode) params.pincode = pincode;

  const providerName = (filters.providerName ?? "").trim();
  if (providerName) params.providerName = providerName;

  const filterStatus = (filters.filterStatus ?? "").trim().toUpperCase();
  if (filterStatus === "ACTIVE" || filterStatus === "INACTIVE") {
    params.filterStatus = filterStatus;
  }

  return params;
}

/** Excel export query params (download=true + filters). */
export function buildRohiniExcelDownloadParams(
  filters: RohiniListFilters,
  countExpiringInDays?: boolean,
): Record<string, string | boolean> {
  const params: Record<string, string | boolean> = {
    download: true,
  };

  if (countExpiringInDays) {
    params.expiringProvidersView = true;
  }

  const rohiniCode = (filters.providerRohiniCode ?? "").trim();
  if (rohiniCode) params.rohiniCode = rohiniCode;

  const state = (filters.state ?? "").trim();
  if (state) params.state = state;

  const city = (filters.city ?? "").trim();
  if (city) params.city = city;

  const district = (filters.district ?? "").trim();
  if (district) params.district = district;

  const pincode = (filters.pincode ?? "").trim();
  if (pincode) params.pincode = pincode;

  const providerName = (filters.providerName ?? "").trim();
  if (providerName) params.providerName = providerName;

  const filterStatus = (filters.filterStatus ?? "").trim().toUpperCase();
  if (filterStatus === "ACTIVE" || filterStatus === "INACTIVE") {
    params.filterStatus = filterStatus;
  }

  return params;
}

/** GET `/v1/provider-rohini-master` */
export async function getProviderRohiniMasterList(
  params: Record<string, string | number | boolean>,
): Promise<RohiniListApiResponse> {
  const { data } = await providerApi.get<RohiniListApiResponse>(
    ROHINI_MASTER_BASE_PATH,
    { params },
  );
  return data;
}

/** GET `/v1/provider-rohini-master/:id` */
export async function getProviderRohiniMasterDetail(
  id: string,
): Promise<RohiniDetailApiEnvelope> {
  const { data } = await providerApi.get<RohiniDetailApiEnvelope>(
    `${ROHINI_MASTER_BASE_PATH}/${id}`,
  );
  return data;
}

/** GET `/v1/provider-rohini-master/download-excel` */
export async function downloadProviderRohiniMasterExcel(
  params: Record<string, string | boolean>,
): Promise<Blob> {
  const res = await providerApi.get(ROHINI_MASTER_DOWNLOAD_EXCEL_PATH, {
    params,
    responseType: "blob",
  });

  const contentType =
    (res.headers?.["content-type"] as string | undefined) ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return new Blob([res.data], { type: contentType });
}

/** POST `/v1/provider-rohini-master/upload` — query: inwardNo, fileMetadataId */
export async function postProviderRohiniMasterRegisterUpload(
  inwardNo: string,
  fileMetadataId: string,
): Promise<RohiniRegisterUploadApiBody> {
  const { data } = await providerApi.post<RohiniRegisterUploadApiBody>(
    `${ROHINI_MASTER_BASE_PATH}/upload`,
    {},
    { params: { inwardNo, fileMetadataId } },
  );
  return data;
}

/** POST `/v1/provider-rohini-master/validate` */
export async function postProviderRohiniMasterValidate(
  inwardNo: string,
): Promise<RohiniValidateApiBody> {
  const { data } = await providerApi.post<RohiniValidateApiBody>(
    `${ROHINI_MASTER_BASE_PATH}/validate`,
    { inwardNo },
  );
  return data;
}

export function parseRohiniValidateResponse(
  data: RohiniValidateApiBody | undefined,
): RohiniValidateUploadPayload {
  const raw = (data?.data ?? data) as Record<string, unknown> | undefined;
  const counts =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? raw
      : ({} as Record<string, unknown>);

  const alreadyExist = Number(
    counts.alreadyExist ?? counts.alreadyExisting ?? counts.existingCount ?? 0,
  );
  const newAdded = Number(
    counts.newAdded ?? counts.newRecords ?? counts.newCount ?? 0,
  );

  return {
    alreadyExist: Number.isFinite(alreadyExist) ? alreadyExist : 0,
    newAdded: Number.isFinite(newAdded) ? newAdded : 0,
    message: typeof data?.message === "string" ? data.message : undefined,
  };
}

/** Top-level `message` from register-upload response (also `error.message` when helpful). */
export function extractMessageFromRegisterResponse(
  body: unknown,
): string | undefined {
  if (body == null || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  if (typeof b.message === "string" && b.message.trim() !== "") {
    return b.message.trim();
  }
  const err = b.error;
  if (err && typeof err === "object" && !Array.isArray(err)) {
    const em = (err as { message?: unknown }).message;
    if (typeof em === "string" && em.trim() !== "") {
      return em.trim();
    }
  }
  return undefined;
}

/** `data.errorFileName` from register-upload response */
export function extractErrorFileNameFromRegisterResponse(
  body: unknown,
): string | undefined {
  if (body == null || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  const nested = b.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const d = nested as Record<string, unknown>;
    const n = d.errorFileName;
    if (typeof n === "string" && n.trim() !== "") return n.trim();
  }
  return undefined;
}

/** Pulls a downloadable URL from register-upload API responses (nested shapes supported). */
export function extractDownloadUrlFromRegisterResponse(
  body: unknown,
): string | undefined {
  const walk = (o: unknown): string | undefined => {
    if (o == null || typeof o !== "object") return undefined;
    const r = o as Record<string, unknown>;
    const keys = [
      "downloadUrl",
      "presignedUrl",
      "fileUrl",
      "documentUrl",
      "url",
    ] as const;
    for (const k of keys) {
      const v = r[k];
      if (typeof v === "string" && v.trim() !== "") {
        const t = v.trim();
        if (t.startsWith("http://") || t.startsWith("https://")) return t;
        if (t.startsWith("/")) return `${API_BASE_URLS.PROVIDER}${t}`;
      }
    }
    const nested = r.data;
    if (nested !== undefined) return walk(nested);
    return undefined;
  };
  return walk(body);
}

function pickFileMetadataIdFromObject(
  o: Record<string, unknown>,
): string | undefined {
  const keys = [
    "fileMetadataId",
    "documentId",
    "fileId",
    "attachmentId",
    "id",
  ] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return undefined;
}

/** Parses scan upload response body for the file id (common envelope shapes). */
export function extractFileMetadataIdFromScanUpload(
  body: unknown,
): string | undefined {
  if (body == null || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;

  const nested = b.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const d = nested as Record<string, unknown>;
    const fromNested = pickFileMetadataIdFromObject(d);
    if (fromNested) return fromNested;
    const inner = d.data;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const fromInner = pickFileMetadataIdFromObject(
        inner as Record<string, unknown>,
      );
      if (fromInner) return fromInner;
    }
  }

  return pickFileMetadataIdFromObject(b);
}

function pickInwardNoFromObject(o: Record<string, unknown>): string | undefined {
  const keys = ["inwardNo", "inwardNumber", "inward_no"] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return undefined;
}

/** Parses scan upload (`v1/scan/files/upload`) response when inward is created with the file. */
export function extractInwardNoFromScanUpload(body: unknown): string | undefined {
  if (body == null || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;

  const nested = b.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const d = nested as Record<string, unknown>;
    const fromNested = pickInwardNoFromObject(d);
    if (fromNested) return fromNested;
    const inner = d.data;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const fromInner = pickInwardNoFromObject(inner as Record<string, unknown>);
      if (fromInner) return fromInner;
    }
  }

  return pickInwardNoFromObject(b);
}
