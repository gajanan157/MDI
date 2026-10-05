import { getApi, providerApi } from "@/app/api/apiService";
import type {
  DiscountInclusionExclusionMasterResponse,
  FetchDiscountInclusionExclusionMasterParams,
} from "./discountInclusionExclusionMasterTypes";

/** GET `/v1/provider/discount-inclusion-exclusion-master` — common category master. */
export const fetchDiscountInclusionExclusionMasterAPI = async (
  params: FetchDiscountInclusionExclusionMasterParams = {},
): Promise<DiscountInclusionExclusionMasterResponse | null> => {
  const response = await getApi<DiscountInclusionExclusionMasterResponse>(
    providerApi,
    "/v1/provider/discount-inclusion-exclusion-master",
    {
      params: {
        download: params.download ?? true,
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.providerInclusionExclusionCode?.trim()
          ? { providerInclusionExclusionCode: params.providerInclusionExclusionCode.trim() }
          : {}),
        ...(params.providerInclusionExclusionType?.trim()
          ? { providerInclusionExclusionType: params.providerInclusionExclusionType.trim() }
          : {}),
        ...(params.providerInclusionExclusionName?.trim()
          ? { providerInclusionExclusionName: params.providerInclusionExclusionName.trim() }
          : {}),
        ...(params.isActive?.trim() ? { isActive: params.isActive.trim() } : {}),
        ...(params.recordStatus?.trim()
          ? { recordStatus: params.recordStatus.trim() }
          : {}),
      },
    },
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to load inclusion/exclusion master");
    return null;
  }

  return response.data;
};
