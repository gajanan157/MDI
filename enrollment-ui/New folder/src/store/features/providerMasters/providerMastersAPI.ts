import {
  getApi,
  patchApi,
  postApi,
  providerApi,
  type ApiResponse,
} from "@/app/api/apiService";
import type { ProviderMasterKey } from "@/app/pages/dashboards/providerManagernt/masters/utils/masterConfig";
import type { ProviderMasterActivityLogEntry } from "@/app/pages/dashboards/providerManagernt/masters/utils/providerMasterActivityLogTypes";
import { getMockProviderMasterActivityLog } from "@/app/pages/dashboards/providerManagernt/masters/utils/providerMasterActivityLogMock";

export type ProviderIdentifierTypeMasterListParams = {
  page: number;
  size: number;
  download?: boolean;
};

export const fetchProviderIdentifierTypeMasterAPI = async ({
  page,
  size,
  download,
}: ProviderIdentifierTypeMasterListParams): Promise<unknown> => {
  const downloadQuery = download ? "&download=true" : "";
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider-identifier-type-master?page=${page}&size=${size}${downloadQuery}`,
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to load provider identifier types");
  }

  return response.data;
};

export const fetchProviderIdentifierTypeMasterByIdAPI = async (
  id: string,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider-identifier-type-master/${id}`,
  );

  if (!response.success) {
    console.log(
      response.error ?? "Failed to load provider identifier type details",
    );
  }

  return response.data;
};

export const createProviderIdentifierTypeMasterAPI = async (
  payload: Record<string, unknown>,
): Promise<unknown> => {
  const response = await postApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider-identifier-type-master`,
    payload,
  );

  if (!response.success) {
    console.log(
      response.error ??
        response.message ??
        "Failed to create provider identifier type",
    );
  }

  return response.data;
};

export const patchProviderIdentifierTypeMasterAPI = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> => {
  const response = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider-identifier-type-master/${id}`,
    payload,
  );

  if (!response.success) {
    console.log(
      response.error ?? "Failed to update provider identifier type",
    );
  }

  return response.data;
};

export const deleteProviderIdentifierTypeMasterAPI = async (
  id: string,
): Promise<unknown> => {
  const response = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider-identifier-type-master/${id}`,
    { recordStatus: "DELETED" },
  );

  if (!response.success) {
    console.log(
      response.error ?? "Failed to delete provider identifier type",
    );
  }

  return response.data;
};

export type ProviderDiscountTypeMasterListParams = {
  page: number;
  size: number;
  providerDiscountTypeCode?: string;
  providerServiceType?: string;
  providerDiscountTypeName?: string;
  isActive?: boolean;
  recordStatus?: string;
  download?: boolean;
};

function buildProviderDiscountTypeMasterQuery(
  params: ProviderDiscountTypeMasterListParams,
): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("size", String(params.size));

  if (params.providerDiscountTypeCode?.trim()) {
    search.set("providerDiscountTypeCode", params.providerDiscountTypeCode.trim());
  }
  if (params.providerServiceType?.trim()) {
    search.set("providerServiceType", params.providerServiceType.trim());
  }
  if (params.providerDiscountTypeName?.trim()) {
    search.set("providerDiscountTypeName", params.providerDiscountTypeName.trim());
  }
  if (params.isActive != null) search.set("isActive", String(params.isActive));
  if (params.recordStatus?.trim()) search.set("recordStatus", params.recordStatus.trim());
  if (params.download != null) search.set("download", String(params.download));

  return search.toString();
}

function throwIfApiFailed(
  response: { success: boolean; error?: string | null; message?: string | null },
  fallback: string,
) {
  if (response.success) return;
  throw new Error(response.message ?? response.error ?? fallback);
}

export type ProviderMasterApiRejectValue = {
  message: string;
  status?: number;
};

export function getProviderMasterApiRejectValue(
  response: ApiResponse<unknown>,
  fallback: string,
): ProviderMasterApiRejectValue {
  const message =
    (typeof response.message === "string" && response.message.trim()) ||
    (typeof response.error === "string" && response.error.trim()) ||
    fallback;
  return { message, status: response.status };
}

export const fetchProviderDiscountTypeMasterAPI = async (
  params: ProviderDiscountTypeMasterListParams,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider/discount-type-master?${buildProviderDiscountTypeMasterQuery(params)}`,
  );
  throwIfApiFailed(response, "Failed to load provider discount types");
  return response.data;
};

export const fetchProviderDiscountTypeMasterByIdAPI = async (
  id: string,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider/discount-type-master/${id}`,
  );
  throwIfApiFailed(response, "Failed to load provider discount type details");
  return response.data;
};

export const createProviderDiscountTypeMasterAPI = async (
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> => {
  return postApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-type-master`,
    payload,
  );
};

export const patchProviderDiscountTypeMasterAPI = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> => {
  return patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-type-master/${id}`,
    payload,
  );
};

export const deleteProviderDiscountTypeMasterAPI = async (
  id: string,
): Promise<ApiResponse<unknown>> => {
  return patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-type-master/${id}`,
    { recordStatus: "DELETED" },
  );
};

export type ProviderDiscountSubtypeMasterListParams = {
  page: number;
  size: number;
  providerDiscountTypeMasterId?: string;
  providerDiscountSubtypeCode?: string;
  providerDiscountSubtypeName?: string;
  isActive?: boolean;
  recordStatus?: string;
  download?: boolean;
};

function buildProviderDiscountSubtypeMasterQuery(
  params: ProviderDiscountSubtypeMasterListParams,
): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("size", String(params.size));

  if (params.providerDiscountTypeMasterId?.trim()) {
    search.set("providerDiscountTypeMasterId", params.providerDiscountTypeMasterId.trim());
  }
  if (params.providerDiscountSubtypeCode?.trim()) {
    search.set("providerDiscountSubtypeCode", params.providerDiscountSubtypeCode.trim());
  }
  if (params.providerDiscountSubtypeName?.trim()) {
    search.set("providerDiscountSubtypeName", params.providerDiscountSubtypeName.trim());
  }
  if (params.isActive != null) search.set("isActive", String(params.isActive));
  if (params.recordStatus?.trim()) search.set("recordStatus", params.recordStatus.trim());
  if (params.download != null) search.set("download", String(params.download));

  return search.toString();
}

export const fetchProviderDiscountSubtypeMasterAPI = async (
  params: ProviderDiscountSubtypeMasterListParams,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider/discount-subtype-master?${buildProviderDiscountSubtypeMasterQuery(params)}`,
  );
  throwIfApiFailed(response, "Failed to load provider discount subtypes");
  return response.data;
};

export const fetchProviderDiscountSubtypeMasterByIdAPI = async (
  id: string,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider/discount-subtype-master/${id}`,
  );
  throwIfApiFailed(response, "Failed to load provider discount subtype details");
  return response.data;
};

export const createProviderDiscountSubtypeMasterAPI = async (
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> => {
  return postApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-subtype-master`,
    payload,
  );
};

export const patchProviderDiscountSubtypeMasterAPI = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> => {
  return patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-subtype-master/${id}`,
    payload,
  );
};

export const deleteProviderDiscountSubtypeMasterAPI = async (
  id: string,
): Promise<ApiResponse<unknown>> => {
  return patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-subtype-master/${id}`,
    { recordStatus: "DELETED" },
  );
};

export type ProviderDiscountInclusionExclusionMasterListParams = {
  page: number;
  size: number;
  providerInclusionExclusionCode?: string;
  providerInclusionExclusionType?: string;
  providerInclusionExclusionName?: string;
  isActive?: boolean;
  recordStatus?: string;
  download?: boolean;
};

function buildProviderDiscountInclusionExclusionMasterQuery(
  params: ProviderDiscountInclusionExclusionMasterListParams,
): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("size", String(params.size));

  if (params.providerInclusionExclusionCode?.trim()) {
    search.set("providerInclusionExclusionCode", params.providerInclusionExclusionCode.trim());
  }
  if (params.providerInclusionExclusionType?.trim()) {
    search.set("providerInclusionExclusionType", params.providerInclusionExclusionType.trim());
  }
  if (params.providerInclusionExclusionName?.trim()) {
    search.set("providerInclusionExclusionName", params.providerInclusionExclusionName.trim());
  }
  if (params.isActive != null) search.set("isActive", String(params.isActive));
  if (params.recordStatus?.trim()) search.set("recordStatus", params.recordStatus.trim());
  if (params.download != null) search.set("download", String(params.download));

  return search.toString();
}

export const fetchProviderDiscountInclusionExclusionMasterAPI = async (
  params: ProviderDiscountInclusionExclusionMasterListParams,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider/discount-inclusion-exclusion-master?${buildProviderDiscountInclusionExclusionMasterQuery(params)}`,
  );
  throwIfApiFailed(response, "Failed to load provider discount inclusion/exclusion records");
  return response.data;
};

export const fetchProviderDiscountInclusionExclusionMasterByIdAPI = async (
  id: string,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider/discount-inclusion-exclusion-master/${id}`,
  );
  throwIfApiFailed(
    response,
    "Failed to load provider discount inclusion/exclusion details",
  );
  return response.data;
};

export const createProviderDiscountInclusionExclusionMasterAPI = async (
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> => {
  return postApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-inclusion-exclusion-master`,
    payload,
  );
};

export const patchProviderDiscountInclusionExclusionMasterAPI = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<ApiResponse<unknown>> => {
  return patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-inclusion-exclusion-master/${id}`,
    payload,
  );
};

export const deleteProviderDiscountInclusionExclusionMasterAPI = async (
  id: string,
): Promise<ApiResponse<unknown>> => {
  return patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider/discount-inclusion-exclusion-master/${id}`,
    { recordStatus: "DELETED" },
  );
};

export type ProviderTaxonomyMasterListParams = {
  page: number;
  size: number;
  typeCode?: string;
  classCode?: string;
  subclassCode?: string;
  displayName?: string;
  providerTypeScope?: string;
  isActive?: boolean;
  recordStatus?: string;
  sortBy?: string;
  download?: boolean;
};

function buildProviderTaxonomyQuery(params: ProviderTaxonomyMasterListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("size", String(params.size));

  if (params.typeCode?.trim()) search.set("typeCode", params.typeCode.trim());
  if (params.classCode?.trim()) search.set("classCode", params.classCode.trim());
  if (params.subclassCode?.trim()) search.set("subclassCode", params.subclassCode.trim());
  if (params.displayName?.trim()) search.set("displayName", params.displayName.trim());
  if (params.providerTypeScope?.trim()) {
    search.set("providerTypeScope", params.providerTypeScope.trim());
  }
  if (params.isActive != null) search.set("isActive", String(params.isActive));
  if (params.recordStatus?.trim()) search.set("recordStatus", params.recordStatus.trim());
  if (params.sortBy?.trim()) search.set("sortBy", params.sortBy.trim());
  if (params.download != null) search.set("download", String(params.download));

  return search.toString();
}

export const fetchProviderTaxonomyMasterAPI = async (
  params: ProviderTaxonomyMasterListParams,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/provider-type-master?${buildProviderTaxonomyQuery(params)}`,
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to load provider taxonomy records");
  }

  return response.data;
};

export const fetchProviderTaxonomyMasterByIdAPI = async (id: string): Promise<unknown> => {
  const response = await getApi<unknown>(providerApi, `/v1/provider-type-master/${id}`);

  if (!response.success) {
    console.log(response.error ?? "Failed to load provider taxonomy details");
  }

  return response.data;
};

export const createProviderTaxonomyMasterAPI = async (
  payload: Record<string, unknown>,
): Promise<unknown> => {
  const response = await postApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider-type-master`,
    payload,
  );

  if (!response.success) {
    console.log(
      response.error ?? response.message ?? "Failed to create provider taxonomy",
    );
  }

  return response.data;
};

export const patchProviderTaxonomyMasterAPI = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> => {
  const response = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider-type-master/${id}`,
    payload,
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to update provider taxonomy");
  }

  return response.data;
};

export const deleteProviderTaxonomyMasterAPI = async (id: string): Promise<unknown> => {
  const response = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/provider-type-master/${id}`,
    { recordStatus: "DELETED" },
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to delete provider taxonomy");
  }

  return response.data;
};

export type InsurerProviderNetworkModeListParams = {
  page: number;
  size: number;
  insurerId?: string;
  insurerProviderNetworkModeType?: string;
  insurerProviderNetworkTariffType?: string;
  insurerProviderNetworkActiveFlag?: boolean;
  insurerProviderNetworkModeEffectiveFrom?: string;
  insurerProviderNetworkModeEffectiveTo?: string;
  recordStatus?: string;
};

function buildInsurerProviderNetworkModeQuery(
  params: InsurerProviderNetworkModeListParams,
): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("size", String(params.size));

  if (params.insurerId?.trim()) search.set("insurerId", params.insurerId.trim());
  if (params.insurerProviderNetworkModeType?.trim()) {
    search.set("insurerProviderNetworkModeType", params.insurerProviderNetworkModeType.trim());
  }
  if (params.insurerProviderNetworkTariffType?.trim()) {
    search.set("insurerProviderNetworkTariffType", params.insurerProviderNetworkTariffType.trim());
  }
  if (params.insurerProviderNetworkActiveFlag != null) {
    search.set(
      "insurerProviderNetworkActiveFlag",
      String(params.insurerProviderNetworkActiveFlag),
    );
  }
  if (params.insurerProviderNetworkModeEffectiveFrom?.trim()) {
    search.set(
      "insurerProviderNetworkModeEffectiveFrom",
      params.insurerProviderNetworkModeEffectiveFrom.trim(),
    );
  }
  if (params.insurerProviderNetworkModeEffectiveTo?.trim()) {
    search.set(
      "insurerProviderNetworkModeEffectiveTo",
      params.insurerProviderNetworkModeEffectiveTo.trim(),
    );
  }
  if (params.recordStatus?.trim()) search.set("recordStatus", params.recordStatus.trim());

  return search.toString();
}

export const fetchInsurerProviderNetworkModeAPI = async (
  params: InsurerProviderNetworkModeListParams,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/insurer-provider-network-mode?${buildInsurerProviderNetworkModeQuery(params)}`,
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to load insurer provider network mode records");
  }

  return response.data;
};

export const fetchInsurerProviderNetworkModeByIdAPI = async (
  id: string,
): Promise<unknown> => {
  const response = await getApi<unknown>(
    providerApi,
    `/v1/insurer-provider-network-mode/${id}`,
  );

  if (!response.success) {
    console.log(
      response.error ?? "Failed to load insurer provider network mode details",
    );
  }

  return response.data;
};

export const createInsurerProviderNetworkModeAPI = async (
  payload: Record<string, unknown>,
): Promise<unknown> => {
  const response = await postApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/insurer-provider-network-mode`,
    payload,
  );

  if (!response.success) {
    console.log(
      response.error ??
        response.message ??
        "Failed to create insurer provider network mode",
    );
  }

  return response.data;
};

export const patchInsurerProviderNetworkModeAPI = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> => {
  const response = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/insurer-provider-network-mode/${id}`,
    payload,
  );

  if (!response.success) {
    console.log(
      response.error ?? "Failed to update insurer provider network mode",
    );
  }

  return response.data;
};

export const deleteInsurerProviderNetworkModeAPI = async (
  id: string,
): Promise<unknown> => {
  const response = await patchApi<unknown, Record<string, unknown>>(
    providerApi,
    `/v1/insurer-provider-network-mode/${id}`,
    { recordStatus: "DELETED" },
  );

  if (!response.success) {
    console.log(
      response.error ?? "Failed to delete insurer provider network mode",
    );
  }

  return response.data;
};

function sortActivityLogNewestFirst(
  entries: ProviderMasterActivityLogEntry[],
): ProviderMasterActivityLogEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );
}

function unwrapActivityLogList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data == null || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  for (const key of [
    "content",
    "items",
    "rows",
    "data",
    "activityLogs",
    "activity_logs",
    "auditLogs",
    "audit_logs",
  ]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function strActivity(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = item[key];
    if (value != null && String(value).trim() !== "") return String(value);
  }
  return "";
}

function mapApiItemToActivityLogEntry(
  item: Record<string, unknown>,
  index: number,
): ProviderMasterActivityLogEntry {
  return {
    id: strActivity(item, "id", "activityLogId", "activity_log_id") || `activity-${index}`,
    changedAt:
      strActivity(item, "changedAt", "changed_at", "createdAt", "created_at", "timestamp") ||
      new Date().toISOString(),
    changedBy:
      strActivity(item, "changedBy", "changed_by", "userName", "user_name", "updatedBy") ||
      "—",
    recordCode:
      strActivity(item, "recordCode", "record_code", "code", "identifierCode") || "—",
    recordName:
      strActivity(item, "recordName", "record_name", "name", "identifierName") || "—",
    fieldName: strActivity(item, "fieldName", "field_name", "field") || "—",
    oldValue: strActivity(item, "oldValue", "old_value", "previousValue") || "—",
    newValue: strActivity(item, "newValue", "new_value", "currentValue") || "—",
    action: strActivity(item, "action", "operation", "changeType") || "UPDATE",
  };
}

/** GET `/v1/provider-master/activity-log?masterKey=` */
export async function fetchProviderMasterActivityLogApi(
  masterKey: ProviderMasterKey,
): Promise<ProviderMasterActivityLogEntry[]> {
  try {
    const res = await getApi<unknown>(providerApi, "/v1/provider-master/activity-log", {
      params: { masterKey },
    });

    if (res.success && res.data != null) {
      const list = unwrapActivityLogList(res.data);
      if (list.length > 0) {
        return sortActivityLogNewestFirst(
          list.map((item, index) =>
            mapApiItemToActivityLogEntry(item as Record<string, unknown>, index),
          ),
        );
      }
    }
  } catch {
    // Fall back to mock data until API is available.
  }

  return sortActivityLogNewestFirst(getMockProviderMasterActivityLog(masterKey));
}
