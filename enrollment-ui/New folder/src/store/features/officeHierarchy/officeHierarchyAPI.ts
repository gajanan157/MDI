import { insurerApi } from "@/app/api/apiService";
import {
  OfficeHierarchyResponse,
  OfficeHierarchySearchParams,
} from "./officeHierarchyTypes";

export const searchOfficeHierarchyAPI = async (
  queryObj: OfficeHierarchySearchParams,
): Promise<OfficeHierarchyResponse> => {
  const url = `/v1/insurer/insurer-office/hierarchy`;

  // 🔹 Remove null / undefined / empty values
  const params = Object.fromEntries(
    Object.entries(queryObj).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => value !== null && value !== undefined && value !== "",
    ),
  );

  const response = await insurerApi.get<OfficeHierarchyResponse>(url, {
    params, // ✅ query string params
  });

  // ✅ IMPORTANT: return response.data
  return response.data;
};
