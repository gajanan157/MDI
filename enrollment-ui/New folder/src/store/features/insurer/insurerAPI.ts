import { insurerApi, getApi, parseService } from "@/app/api/apiService";
import { InsurerResponse } from "./insurerTypes";
import { ContactPersonResponse } from "./contactPersonTypes";
import { showErrorMessage } from "@/utils/errorHandler";
import { buildQueryParams } from "../Broker/BrokerApi";

/**
 * Fetch all insurers (with optional size param)
 */
// Fetch all insurers (with optional size & page)
export const fetchInsurersAPI = async (
  size?: string | number,
  page?: number,
): Promise<InsurerResponse> => {
  const params = new URLSearchParams();
  if (size !== undefined && size !== null && size !== "") {
    params.append("size", String(size));
  }
  if (typeof page !== "undefined" && page !== null) {
    // convert UI 1-based page -> server 0-based page; remove -1 if your API expects 1-based
    const serverPage = Number(page) > 0 ? Number(page) - 1 : 0;
    params.append("page", String(serverPage));
  }

  const url = params.toString()
    ? `/v1/insurer?${params.toString()}`
    : `/v1/insurer`;

  const res = await getApi<InsurerResponse>(insurerApi, url);

  if (!res.success) {
    showErrorMessage(res);
  }

  return res.data!;
};

/**
 * Search insurers with dynamic query parameters and optional page/size
 */
export const fetchInsurersSearchAPI = async (
  queryObj: Record<string, any>,
  page?: number,
  size?: string | number,
): Promise<InsurerResponse> => {
  const queryParams = new URLSearchParams();

  Object.entries(queryObj).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => queryParams.append(key, String(v)));
    } else {
      queryParams.append(key, String(value));
    }
  });

  

  // pagination (convert to server page if provided)
  if (typeof page !== "undefined" && page !== null) {
    const serverPage = Number(page) > 0 ? Number(page) - 1 : 0;
    queryParams.append("page", String(serverPage));
  }
  if (size !== undefined && size !== null && size !== "") {
    queryParams.append("size", String(size));
  }

  const url = `/v1/insurer?${queryParams.toString()}`;

  const res = await getApi<InsurerResponse>(insurerApi, url);

  if (!res.success) {
    showErrorMessage(res);
  }

  return res.data!;
};

export const createOrUpdateContactPersonAPI = async (payload?: {
  query?: Record<string, any>;
}): Promise<ContactPersonResponse> => {
  const url = `/v1/insurer/contact-person`;

  const params = payload?.query ?? payload;

  const queryString = params
    ? "?" +
      Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("&")
    : "";

  const res = await getApi<any>(insurerApi, url + queryString);

  if (!res.success) {
    return res.data as ContactPersonResponse;
  }

  return res.data!;
};
