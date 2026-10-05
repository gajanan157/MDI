import { mainApi, getApi } from "@/app/api/apiService";
import { MbmDashboardResponse, MbmDashboardItem } from "./mbmDashboardTypes";

/**
 * Fetch MBM Dashboard list with pagination
 */
export const fetchMbmDashboardAPI = async (
  page?: number,
  size?: number,
  queryObj?: Record<string, any>
): Promise<MbmDashboardResponse> => {
  const params = new URLSearchParams();
  
  if (typeof page !== "undefined" && page !== null) {
    const serverPage = Number(page) > 0 ? Number(page) - 1 : 0;
    params.append("page", String(serverPage));
  }
  
  if (size !== undefined && size !== null && size !== 0) {
    params.append("size", String(size));
  }

  // Add query parameters if provided
  if (queryObj && Object.keys(queryObj).length > 0) {
    Object.entries(queryObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }

  const url = params.toString()
    ? `/mbm/v1/dashboard?${params.toString()}`
    : `/mbm/v1/dashboard`;

  const res = await getApi<MbmDashboardResponse>(mainApi, url);

  if (!res.success) {
    console.error("Failed to fetch MBM Dashboard:", res.error);
  }

  return res.data!;
};

/**
 * Fetch MBM Dashboard item by ID
 */
export const fetchMbmDashboardByIdAPI = async (
  id: string
): Promise<MbmDashboardItem> => {
  const url = `/mbm/v1/dashboard/${id}`;

  const res = await getApi<MbmDashboardItem>(mainApi, url);

  if (!res.success) {
    throw new Error(res.error || "Failed to fetch item");
  }

  return res.data!;
};

