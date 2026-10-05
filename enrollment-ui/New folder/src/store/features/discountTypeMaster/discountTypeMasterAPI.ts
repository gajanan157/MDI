import { getApi, providerApi } from "@/app/api/apiService";
import type {
  DiscountTypeMasterResponse,
  FetchDiscountTypeMasterParams,
} from "./discountTypeMasterTypes";

/** GET `/v1/provider/discount-type-master?download=true&providerServiceType=IPD|OPD` */
export const fetchDiscountTypeMasterAPI = async (
  params: FetchDiscountTypeMasterParams = {},
): Promise<DiscountTypeMasterResponse | null> => {
  const download = params.download ?? true;
  const providerServiceType = params.providerServiceType?.trim();
  const response = await getApi<DiscountTypeMasterResponse>(
    providerApi,
    "/v1/provider/discount-type-master",
    {
      params: {
        download,
        ...(providerServiceType ? { providerServiceType } : {}),
        ...(params.page != null ? { page: params.page } : {}),
        ...(params.size != null ? { size: params.size } : {}),
      },
    },
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to load discount types");
    return null;
  }

  return response.data;
};
