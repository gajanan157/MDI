import { getApi, masterApi, policySearchApi } from "@/app/api/apiService";
import { showErrorMessage } from "@/utils/errorHandler";
import { buildQueryParams } from "../Broker/BrokerApi";

export const fetchTPABranchesAPI = async (
  payload?: Record<string, any>,
): Promise<any> => {
  // Set page to 0 if not provided or page <= 1 (first page)
  const page = payload?.page && payload.page > 1 ? payload.page - 1 : 0;
  const size = payload?.size ?? 20;

  // Build query params (exclude original page/size to avoid duplication)
  const params = buildQueryParams(payload, page, size);


  const res = await getApi(masterApi, `v1/tpa-branch?${params.toString()}`);

  if (!res.success) {
    // optional error handling
    showErrorMessage(res);
  }

  return res.data;
};
export const fetchTPABranchesAPIForSpoc = async (
): Promise<any> => {
  const res = await getApi(policySearchApi, `v1/enrolmentTpaBranches/dropdown`);
  if (!res.success) {
    // optional error handling
    showErrorMessage(res);
  }

  return res.data;
};

export const fetchTPASpocsDropdownAPI = async (branchId: string): Promise<any> => {
  const res = await getApi(policySearchApi, `v1/tpa-spocs/dropdown/${branchId}`);

  if (!res.success) {
    showErrorMessage(res);
  }

  return res.data;
};
