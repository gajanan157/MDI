import { getApi, providerApi } from "@/app/api/apiService";
import type {
  DiscountSubtypeMasterResponse,
  FetchDiscountSubtypeMasterParams,
} from "./discountSubtypeMasterTypes";

/** GET `/v1/provider/discount-subtype-master` — subtypes for a discount type (e.g. Individual). */
export const fetchDiscountSubtypeMasterAPI = async (
  params: FetchDiscountSubtypeMasterParams,
): Promise<DiscountSubtypeMasterResponse | null> => {
  const masterId = params.providerDiscountTypeMasterId?.trim();
  if (!masterId) return null;

  const response = await getApi<DiscountSubtypeMasterResponse>(
    providerApi,
    "/v1/provider/discount-subtype-master",
    {
      params: {
        providerDiscountTypeMasterId: masterId,
        download: params.download ?? true,
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.providerDiscountSubtypeCode?.trim()
          ? { providerDiscountSubtypeCode: params.providerDiscountSubtypeCode.trim() }
          : {}),
        ...(params.providerDiscountSubtypeName?.trim()
          ? { providerDiscountSubtypeName: params.providerDiscountSubtypeName.trim() }
          : {}),
        ...(params.isActive?.trim() ? { isActive: params.isActive.trim() } : {}),
        ...(params.recordStatus?.trim()
          ? { recordStatus: params.recordStatus.trim() }
          : {}),
      },
    },
  );

  if (!response.success) {
    console.log(response.error ?? "Failed to load discount subtypes");
    return null;
  }

  return response.data;
};
