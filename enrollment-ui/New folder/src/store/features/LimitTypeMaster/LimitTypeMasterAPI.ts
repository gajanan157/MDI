import { benefitsConfigurationApi, getApi } from "@/app/api/apiService";
import { LimitTypeMasterResponse, FetchLimitTypeMasterPayload, ApiResponse, MasterListResponse } from "./LimitTypeMasterTypes";
import { postApi } from "../../../app/api/apiService";

// export const fetchLimitTypeMasterAPI = async (payload) => {
//     return await postApi<LimitTypeMasterResponse>(
//         benefitsConfigurationApi,
//       "/api/LimitTypeMaster/GetAll",payload 
//     );
//     // const res = await postApi(policySearchApi, `v1/ocr/resolve-onboarding?${params.toString()}`,"");
// };

export const fetchMasterAPI = async <T>(
    url: string,
    payload: FetchLimitTypeMasterPayload
) => {
    return await postApi<ApiResponse<MasterListResponse<T>>>(benefitsConfigurationApi,url,payload);
};
export const fetchDropDownAPI = async <T>(
    url: string
) => {
    return await getApi<ApiResponse<T>>(benefitsConfigurationApi,url);
};