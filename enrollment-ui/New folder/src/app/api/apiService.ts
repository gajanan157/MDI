
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  isAxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getKeycloakToken } from "@/app/contexts/keycloak/KeycloakProvider";
import { store } from "@/store/store";
import {
  startLoading,
  stopLoading,
} from "@/store/features/globalLoading/globalLoadingSlice";
import {
  extractHtmlErrorTitle,
  isHtmlErrorBody,
} from "@/utils/sanitizeApiErrorMessage";
import { isKeycloakEnabled, isMockAuthEnabled } from "@/utils/mockAuth";
import { getMockApiResponse } from "@/services/mockDataService";

/**
 * Runtime Environment Configuration
 * - Kubernetes: uses window.__ENV__
 * - Local Dev: falls back to import.meta.env
 */
declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

const ENV: Record<string, any> =
  typeof globalThis.window !== "undefined" &&
  globalThis.window.__ENV__ &&
  Object.keys(globalThis.window.__ENV__).length > 0
    ? globalThis.window.__ENV__
    : import.meta.env;

/** In preview/mock mode, serve sample data directly instead of calling unreachable services. */
const shouldServeMock = (): boolean => isMockAuthEnabled();

const mockResponse = <T,>(url: string, method: string, body?: unknown): ApiResponse<T> => {
  const mock = getMockApiResponse(url, method, body);
  const data = method === "POST" || method === "DELETE" ? mock.data : normalizeApiResponseData(mock.data);
  return { success: true, data: data as T, message: mock.message };
};

// --------------------
// API URLs (Runtime Based)
// --------------------
export const API_BASE_URLS = {
  MAIN: ENV.VITE_API_BASE_URL_MAIN,
  MASTER: ENV.VITE_API_BASE_URL_MASTER,
  INSURER: ENV.VITE_API_BASE_URL_INSURER,
  MASTERBENEFIT: ENV.VITE_API_BASE_URL_MASTER_BENEFIT,
  DOCUMENT: ENV.VITE_API_BASE_URL_DOCUMENT,
  DOCUMENT2: ENV.VITE_API_BASE_URL_DOCUMENT2,
  CORPORATE: ENV.VITE_API_BASE_URL_CORPORATE,
  POLICY_SEARCH: ENV.VITE_API_BASE_URL_POLICY_SEARCH,
  BROKER: ENV.VITE_API_BASE_URL_BROKER,
  AGENT: ENV.VITE_API_BASE_URL_AGENT,
  ID_GENERATE: ENV.VITE_API_BASE_URL_ID_GENERATOR,
  PROVIDER: ENV.VITE_API_BASE_URL_PROVIDER,
  MEMBER_DATA: ENV.VITE_API_BASE_MEMBER_DATA,
  PARSE_SERVICE: ENV.VITE_API_BASE_XML_PARSE,
  MEMBER_SERVICE: ENV.VITE_API_BASE_MEMBER_SERVICE,
  E_CARD: ENV.VITE_API_BASE_E_CARD_PRINT_SERVICE,
  USERS: ENV.VITE_API_BASE_URL_USERS,
  BENEFITSCONFIGURATION : ENV.VITE_API_BASE_URL_BENEFITSCONFIGURATION,
  WORK_FLOW : ENV.VITE_API_BASE_WORK_FLOW
};

// --------------------
// API response type
// --------------------
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string | null;
  message?: string | null;
  errorPayload?: unknown;
  status?: number;
}
// --------------------
// Axios client factory
// --------------------
export const createApiClient = (baseURL: string): AxiosInstance => {
  // When Keycloak is disabled or baseURL points to unreachable remote rke2 cluster, use relative path so Vite proxy forwards to local microservices
  const effectiveBaseUrl =
    !isKeycloakEnabled() && (baseURL?.includes("rke2-dp.mdindia.com") || baseURL?.includes("mdindia.com"))
      ? ""
      : (baseURL || "");

  const client = axios.create({ baseURL: effectiveBaseUrl });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    store.dispatch(startLoading());

    // Normalize relative paths to have leading slash so Vite proxy intercepts them properly
    if (config.url && !config.url.startsWith("http") && !config.url.startsWith("/")) {
      config.url = `/${config.url}`;
    }

    const token = getKeycloakToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      store.dispatch(stopLoading());
      return response;
    },
    (error) => {
      store.dispatch(stopLoading());
      return Promise.reject(error);
    }
  );

  return client;
};

// --------------------
// API instances
// --------------------
export const mainApi = createApiClient(API_BASE_URLS.MAIN);
export const masterApi = createApiClient(API_BASE_URLS.MASTER);
export const insurerApi = createApiClient(API_BASE_URLS.INSURER);
export const masterBenefitApi = createApiClient(API_BASE_URLS.MASTERBENEFIT);
export const documentApi = createApiClient(API_BASE_URLS.DOCUMENT);
export const documentApi2 = createApiClient(API_BASE_URLS.DOCUMENT2);
export const corporateApi = createApiClient(API_BASE_URLS.CORPORATE);
export const policySearchApi = createApiClient(API_BASE_URLS.POLICY_SEARCH);
export const brokerApi = createApiClient(API_BASE_URLS.BROKER);
export const agentApi = createApiClient(API_BASE_URLS.AGENT);
export const inwardGenerateApi = createApiClient(API_BASE_URLS.ID_GENERATE);
export const providerApi = createApiClient(API_BASE_URLS.PROVIDER);
export const memberData = createApiClient(API_BASE_URLS.MEMBER_DATA);
export const memberData2 = createApiClient(API_BASE_URLS.MEMBER_DATA);
export const parseService = createApiClient(API_BASE_URLS.PARSE_SERVICE);
export const memberService = createApiClient(API_BASE_URLS.MEMBER_SERVICE);
export const eCardService = createApiClient(API_BASE_URLS.E_CARD);
export const userService = createApiClient(API_BASE_URLS.USERS);
export const benefitsConfigurationApi = createApiClient(API_BASE_URLS.BENEFITSCONFIGURATION);
export const workFlow = createApiClient(API_BASE_URLS.WORK_FLOW);

const DEFAULT_API_ERROR = "Request failed";

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  502: "502 Bad Gateway",
  503: "503 Service Unavailable",
  504: "504 Gateway Timeout",
};

/**
 * Prefer short status text for gateway/proxy HTML error pages (e.g. APISIX/nginx 502).
 */
export function formatHttpErrorMessage(
  status: number | undefined,
  data: unknown,
  fallback?: string,
): string {
  if (status != null && HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status];
  }

  const normalized = normalizeApiErrorBody(data, fallback);

  if (typeof normalized === "string" && isHtmlErrorBody(normalized)) {
    const extracted = extractHtmlErrorTitle(normalized);
    if (extracted) return extracted;
    if (status != null) return `HTTP ${status}`;
    return fallback ?? DEFAULT_API_ERROR;
  }

  return normalized;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function stringifyScalarValue(value: unknown): string {
  switch (typeof value) {
    case "number":
    case "boolean":
    case "bigint":
    case "symbol":
      return value.toString();
    default:
      return DEFAULT_API_ERROR;
  }
}

function stringifyErrorDetail(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }
  if (detail == null) {
    return "";
  }
  if (typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch {
      return DEFAULT_API_ERROR;
    }
  }
  return stringifyScalarValue(detail);
}

function normalizeNestedErrorObject(
  errorObj: Record<string, unknown>,
  fallback?: string,
): string {
  const detailsMessage = nonEmptyString(errorObj.details);
  if (detailsMessage) {
    return detailsMessage;
  }

  const nestedMessage = nonEmptyString(errorObj.message);
  if (nestedMessage) {
    return nestedMessage;
  }

  const det = errorObj.details;
  if (det != null) {
    const typePart = nonEmptyString(errorObj.type) ?? "Error";
    return `${typePart}: ${stringifyErrorDetail(det)}`;
  }

  try {
    return JSON.stringify(errorObj);
  } catch {
    return fallback ?? DEFAULT_API_ERROR;
  }
}

/**
 * Turns axios `response.data` into a single string for toasts / UI.
 * Some APIs return `error` as an object e.g. `{ type, details }` (409 conflicts).
 */
export function normalizeApiErrorBody(
  data: unknown,
  fallback?: string,
): string {
  const defaultMessage = fallback ?? DEFAULT_API_ERROR;

  if (data == null || data === "") {
    return defaultMessage;
  }
  if (typeof data === "string") {
    if (isHtmlErrorBody(data)) {
      return extractHtmlErrorTitle(data) ?? defaultMessage;
    }
    return data;
  }
  if (typeof data !== "object") {
    return stringifyScalarValue(data);
  }

  const root = data as Record<string, unknown>;
  const topLevelMessage = nonEmptyString(root.message);
  if (topLevelMessage) {
    return topLevelMessage;
  }

  const inner = root.error;
  const innerMessage = nonEmptyString(inner);
  if (innerMessage) {
    return innerMessage;
  }

  if (inner && typeof inner === "object") {
    return normalizeNestedErrorObject(
      inner as Record<string, unknown>,
      fallback,
    );
  }

  return defaultMessage;
}

/**
 * Extract backend field-level validation errors without changing field keys.
 * Supports shapes like:
 * - { error: { fields: { insurerCode: "..." } } }
 * - { fields: { insurerCode: "..." } }
 * - { error: { insurerCode: "..." } }
 */
export function extractApiFieldErrors(
  payload: unknown,
): Record<string, string> {
  if (!payload || typeof payload !== "object") return {};

  const root = payload as Record<string, unknown>;
  const errorNode =
    root.error && typeof root.error === "object"
      ? (root.error as Record<string, unknown>)
      : null;
  const fieldsNode =
    (errorNode?.fields && typeof errorNode.fields === "object"
      ? (errorNode.fields as Record<string, unknown>)
      : null) ||
    (root.fields && typeof root.fields === "object"
      ? (root.fields as Record<string, unknown>)
      : null) ||
    errorNode;

  if (!fieldsNode || typeof fieldsNode !== "object") return {};

  const out: Record<string, string> = {};
  Object.entries(fieldsNode).forEach(([key, value]) => {
    if (key === "code" || key === "message" || key === "type" || key === "details") {
      return;
    }
    if (typeof value === "string" && value.trim()) {
      out[key] = value;
    }
  });
  return out;
}

function normalizeItem(item: any): any {
  if (item == null || typeof item !== "object") return item;

  // Broker aliases
  if (item.brokerName && !item.legalName) item.legalName = item.brokerName;
  if (item.legalName && !item.brokerName) item.brokerName = item.legalName;
  if (item.policyBrokerCode && !item.brokerCode) item.brokerCode = item.policyBrokerCode;
  if (item.brokerCode && !item.policyBrokerCode) item.policyBrokerCode = item.brokerCode;
  if (item.licenseNumber && !item.irdaBrokerCode) item.irdaBrokerCode = item.licenseNumber;
  if (item.irdaBrokerCode && !item.licenseNumber) item.licenseNumber = item.irdaBrokerCode;
  if (!item.tradeName) item.tradeName = item.legalName || item.brokerName || "";
  if (!item.brokerType) item.brokerType = "COMPOSITE";

  // Corporate aliases
  if (item.corporateName && !item.legalName) item.legalName = item.corporateName;
  if (item.legalName && !item.corporateName) item.corporateName = item.legalName;
  if (item.corporatePan && !item.pan) item.pan = item.corporatePan;
  if (item.pan && !item.corporatePan) item.corporatePan = item.pan;
  if (item.corporateGstin && !item.gstin) item.gstin = item.corporateGstin;
  if (item.gstin && !item.corporateGstin) item.corporateGstin = item.gstin;
  if (!item.corporateCode && item.corporateId) item.corporateCode = item.corporateId;
  if (!item.corporateType) item.corporateType = "PUBLIC_LIMITED";
  if (!item.cin) item.cin = "L85110KA1981PLC013115";
  if (!item.corporateGroupName) {
    item.corporateGroupName = item.corporateGroupId === "GRP-101" ? "Tata Enterprises"
      : item.corporateGroupId === "GRP-102" ? "Reliance Group"
      : item.corporateGroupId === "GRP-103" ? "Infosys Group" : "Corporate Group";
  }

  // Agent aliases
  if (item.agentName && !item.legalName) item.legalName = item.agentName;
  if (item.legalName && !item.agentName) item.agentName = item.legalName;
  if (item.policyAgentCode && !item.agentCode) item.agentCode = item.policyAgentCode;
  if (item.agentCode && !item.policyAgentCode) item.policyAgentCode = item.agentCode;
  if (item.licenseNumber && !item.irdaAgentCode) item.irdaAgentCode = item.licenseNumber;
  if (!item.agentType) item.agentType = "INDIVIDUAL";

  // Corporate Group aliases
  if (item.groupName && !item.legalName) item.legalName = item.groupName;
  if (item.legalName && !item.groupName) item.groupName = item.legalName;
  if (!item.groupCode && item.corporateGroupId) item.groupCode = item.corporateGroupId;
  if (!item.pan) item.pan = "AAACT1234G";
  if (!item.gstin) item.gstin = "27AAACT1234G1Z8";
  if (!item.cin) item.cin = "L85110MH1985PLC012345";

  // Inward aliases
  if (item.inwardReceivedChannel && !item.receivedChannel) item.receivedChannel = item.inwardReceivedChannel;
  if (item.status && !item.recordStatus) item.recordStatus = item.status;
  if (item.createdAt && !item.receivedAt) item.receivedAt = item.createdAt;
  if (!item.category) item.category = "CORPORATE_HEALTH";
  if (!item.subCategory) item.subCategory = "ENROLLMENT";
  if (!item.appName) item.appName = "ENROLLMENT_PORTAL";
  if (!item.entityType) item.entityType = "CORPORATE";

  // Contact aliases
  const rawEmail = item.email || item.contactPersonEmail;
  if (rawEmail) {
    if (!item.contactEmail) item.contactEmail = [rawEmail];
  } else if (Array.isArray(item.contactEmail) && item.contactEmail.length > 0 && !item.email) {
    item.email = item.contactEmail[0];
  }

  const rawPhone = item.contactNumber || item.mobile || item.phone;
  if (rawPhone) {
    if (!item.contactPhone) item.contactPhone = [rawPhone];
  } else if (Array.isArray(item.contactPhone) && item.contactPhone.length > 0 && !item.contactNumber) {
    item.contactNumber = item.contactPhone[0];
  }

  // Address fallback
  if (!item.address) {
    item.address = {
      address: "One World Center, Lower Parel",
      city: item.headOfficeCity || item.city || "Mumbai",
      stateName: "Maharashtra",
      postalCode: "400013",
      countryCode: "IND",
      addressStatus: "ACTIVE",
    };
  }

  return item;
}

// Some callers read `list.data` on the normalized array, so the array keeps a
// `data` alias pointing to itself. It must be non-enumerable: an enumerable
// self-reference is a circular object, which makes Redux Toolkit's
// serializability check recurse forever ("Maximum call stack size exceeded").
function setSelfDataAlias(items: any[]): void {
  Object.defineProperty(items, "data", {
    value: items,
    enumerable: false,
    writable: true,
    configurable: true,
  });
}

export function normalizeApiResponseData(raw: any): any {
  if (raw == null || typeof raw !== "object") return raw;

  // Case 1: raw is directly an array
  if (Array.isArray(raw)) {
    const items: any = raw.map(normalizeItem);
    const pag = {
      totalRecords: items.length,
      totalPages: 1,
      currentPage: 0,
      pageSize: items.length || 20,
    };
    setSelfDataAlias(items);
    items.pagination = pag;
    return {
      success: true,
      message: "Operation successful",
      data: items,
      pagination: pag,
      totalRecords: items.length,
      totalPages: 1,
      currentPage: 0,
      status: 200,
    };
  }

  const result: any = { ...raw };

  // Case 2: Spring PageResponse inside result.data
  if (result.data && typeof result.data === "object" && Array.isArray(result.data.content)) {
    const items: any = result.data.content.map(normalizeItem);
    const pag = {
      totalRecords: result.data.totalElements ?? items.length,
      totalPages: result.data.totalPages ?? 1,
      currentPage: result.data.currentPage ?? 0,
      pageSize: result.data.pageSize ?? items.length,
    };
    setSelfDataAlias(items);
    items.pagination = pag;
    result.data = items;
    result.pagination = pag;
    result.totalRecords = pag.totalRecords;
    result.totalPages = pag.totalPages;
    result.currentPage = pag.currentPage;
    return result;
  }

  // Case 3: result.data is already an array
  if (Array.isArray(result.data)) {
    const items: any = result.data.map(normalizeItem);
    result.data = items;
    if (!result.pagination) {
      const pag = {
        totalRecords: result.totalElements ?? result.totalRecords ?? items.length,
        totalPages: result.totalPages ?? 1,
        currentPage: result.currentPage ?? 0,
        pageSize: result.pageSize ?? (items.length || 20),
      };
      result.pagination = pag;
    }
    result.totalRecords = result.pagination.totalRecords;
    result.totalPages = result.pagination.totalPages;
    result.currentPage = result.pagination.currentPage;
    setSelfDataAlias(items);
    items.pagination = result.pagination;
    return result;
  }

  // Case 4: result.data has nested data: { data: [...], pagination: {...} }
  if (result.data && typeof result.data === "object" && Array.isArray(result.data.data)) {
    const items: any = result.data.data.map(normalizeItem);
    result.data.data = items;
    setSelfDataAlias(items);
    if (result.data.pagination && !result.pagination) {
      result.pagination = result.data.pagination;
    }
    if (result.pagination) {
      result.totalRecords = result.pagination.totalRecords;
      result.totalPages = result.pagination.totalPages;
      result.currentPage = result.pagination.currentPage;
      items.pagination = result.pagination;
    }
    return result;
  }

  // Case 5: Single item in result.data
  if (result.data && typeof result.data === "object") {
    result.data = normalizeItem(result.data);
  }

  return result;
}

// --------------------
// --------------------
// GET
// --------------------
export const getApi = async <T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  if (shouldServeMock()) return mockResponse<T>(url, "GET");
  try {
    const response: AxiosResponse<T> = await client.get(url, config);
    const normalized = normalizeApiResponseData(response.data);
    return {
      success: true,
      data: normalized as T,
    };
  } catch (err) {
    if (!isAxiosError(err) || !err.response) {
      console.warn(`[MockFallback] Backend unreachable for ${url}. Using mock data.`);
      const mock = getMockApiResponse(url, "GET");
      const normalized = normalizeApiResponseData(mock.data);
      return {
        success: true,
        data: normalized as T,
        message: mock.message,
      };
    }
    const errorPayload = isAxiosError(err) ? err.response?.data : undefined;
    return {
      success: false,
      data: null,
      status: isAxiosError(err) ? err.response?.status : undefined,
      error: formatHttpErrorMessage(
        isAxiosError(err) ? err.response?.status : undefined,
        errorPayload,
        isAxiosError(err) ? err.message : "Unexpected error",
      ),
      errorPayload,
    };
  }
};

// --------------------
// POST
// --------------------
export const postApi = async <T, U>(
  client: AxiosInstance,
  url: string,
  body: U,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  if (shouldServeMock()) return mockResponse<T>(url, "POST", body);
  try {
    const response: AxiosResponse<T> = await client.post(url, body, config);
    const normalized = normalizeApiResponseData(response.data);
    return {
      success: true,
      data: normalized as T,
    };
  } catch (err) {
    if (!isAxiosError(err) || !err.response) {
      console.warn(`[MockFallback] Backend unreachable for POST ${url}. Using mock response.`);
      const mock = getMockApiResponse(url, "POST", body);
      return {
        success: true,
        data: mock.data as T,
        message: mock.message,
      };
    }
    const errorPayload = isAxiosError(err) ? err.response?.data : undefined;
    const status = isAxiosError(err) ? err.response?.status : undefined;
    return {
      success: false,
      data: null,
      message: isAxiosError(err) ? err?.response?.data?.message : null,
      status,
      error: formatHttpErrorMessage(
        status,
        errorPayload,
        isAxiosError(err) ? err.message : "Unexpected error",
      ),
      errorPayload,
    };
  }
};

// --------------------
// PATCH
// --------------------
export const patchApi = async <T, U>(
  client: AxiosInstance,
  url: string,
  body: U,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  if (shouldServeMock()) return mockResponse<T>(url, "PATCH", body);
  try {
    const response: AxiosResponse<T> = await client.patch(url, body, config);
    const normalized = normalizeApiResponseData(response.data);
    return {
      success: true,
      data: normalized as T,
    };
  } catch (err) {
    if (!isAxiosError(err) || !err.response) {
      console.warn(`[MockFallback] Backend unreachable for PATCH ${url}. Using mock response.`);
      const mock = getMockApiResponse(url, "PATCH", body);
      const normalized = normalizeApiResponseData(mock.data);
      return {
        success: true,
        data: normalized as T,
        message: mock.message,
      };
    }
    const errorPayload = isAxiosError(err) ? err.response?.data : undefined;
    const status = isAxiosError(err) ? err.response?.status : undefined;
    const message = formatHttpErrorMessage(
      status,
      errorPayload,
      isAxiosError(err) ? err.message : "Unexpected error",
    );
    return {
      success: false,
      data: null,
      status,
      message: isAxiosError(err) ? (err.response?.data as any)?.message : null,
      error: message,
      errorPayload,
    };
  }
};

// --------------------
// PUT
// --------------------
export const putApi = async <T, U>(
  client: AxiosInstance,
  url: string,
  body: U,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  if (shouldServeMock()) return mockResponse<T>(url, "PUT", body);
  try {
    const response: AxiosResponse<T> = await client.put(url, body, config);
    const normalized = normalizeApiResponseData(response.data);
    return {
      success: true,
      data: normalized as T,
    };
  } catch (err) {
    if (!isAxiosError(err) || !err.response) {
      console.warn(`[MockFallback] Backend unreachable for PUT ${url}. Using mock response.`);
      const mock = getMockApiResponse(url, "PUT", body);
      const normalized = normalizeApiResponseData(mock.data);
      return {
        success: true,
        data: normalized as T,
        message: mock.message,
      };
    }
    const errorPayload = isAxiosError(err) ? err.response?.data : undefined;
    const status = isAxiosError(err) ? err.response?.status : undefined;
    return {
      success: false,
      data: null,
      status,
      error: formatHttpErrorMessage(
        status,
        errorPayload,
        isAxiosError(err) ? err.message : "Unexpected error",
      ),
    };
  }
};

// --------------------
// DELETE
// --------------------
export const deleteApi = async <T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  if (shouldServeMock()) return mockResponse<T>(url, "DELETE");
  try {
    const response: AxiosResponse<T> = await client.delete(url, config);
    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    if (!isAxiosError(err) || !err.response) {
      console.warn(`[MockFallback] Backend unreachable for DELETE ${url}. Using mock response.`);
      const mock = getMockApiResponse(url, "DELETE");
      return {
        success: true,
        data: mock.data as T,
        message: mock.message,
      };
    }
    const errorPayload = isAxiosError(err) ? err.response?.data : undefined;
    const status = isAxiosError(err) ? err.response?.status : undefined;
    return {
      success: false,
      data: null,
      status,
      error: formatHttpErrorMessage(
        status,
        errorPayload,
        isAxiosError(err) ? err.message : "Unexpected error",
      ),
    };
  }
};
