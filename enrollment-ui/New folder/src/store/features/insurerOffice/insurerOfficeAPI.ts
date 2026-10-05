// src/redux/insurer/insurerOfficeAPI.ts
import { insurerApi, getApi } from "@/app/api/apiService";
import { InsurerOfficeResponse } from "./insurerOfficeType";
import { showErrorMessage } from "@/utils/errorHandler";
export interface FetchInsurerOfficeParams {
  insurerId: string;
  officeCode?: string;
  officeName?: string;
  officeType?: string;
  officeId?: string;
  serviceType?: string;
  onlyNames?: boolean;
  contactPersonName?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
}

/**
 * Helper to build a query string for page/size and any extra params
 */
const buildQuery = (params?: Record<string, any>): string => {
  const q = new URLSearchParams();
  if (!params) return "";
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
  });
  const qs = q.toString();
  return qs ? `?${qs}` : "";
};
const cleanParams = (params: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
};

export const fetchInsurerOfficeAPI = async (
  params: FetchInsurerOfficeParams,
): Promise<InsurerOfficeResponse> => {
  const url = `/v1/insurer/insurer-office`;
  const queryParams = cleanParams({
    insurerId: params.insurerId,
    officeCode: params.officeCode,
    officeName: params.officeName,
    officeType: params.officeType,
    officeId: params.officeId,
    serviceType: params.serviceType,
    onlyNames: params.onlyNames,
    contactPersonName: params.contactPersonName,
    page: params.page,
    size: params.size,
    sortBy: params.sortBy,
  });

  const res = await getApi<InsurerOfficeResponse>(insurerApi, url, {
    params: queryParams,
  });

  if (!res.success) {
    showErrorMessage(res);
    // throw new Error(res.error ?? "Failed to fetch insurer offices");
  }

  return res.data!;
};

/**
 * Fetch single insurer office by id (v1 endpoint)
 */
export const fetchInsurerOfficeByIdAPI = async (
  id: string | number,
): Promise<InsurerOfficeResponse> => {
  const url = `/v1/insurer/insurer-offices/${id}`;
  const res = await getApi<InsurerOfficeResponse>(insurerApi, url);
  if (!res.success) showErrorMessage(res);
  // throw new Error(res.error ?? "Failed to fetch insurer office by id");
  return res.data!;
};

export const fetchInsurerOfficeSearchAPI = async (
  query: string,
  options?: { page?: number; size?: number },
): Promise<InsurerOfficeResponse> => {
  const params: Record<string, any> = { search: query, ...options };
  const qs = buildQuery(params);
  const url = `/insurer/v1/search${qs}`; // note: kept original path from your code

  const res = await getApi<InsurerOfficeResponse>(insurerApi, url);
  if (!res.success) showErrorMessage(res);
  // throw new Error(res.error ?? "Failed to search insurer offices");
  return res.data!;
};
