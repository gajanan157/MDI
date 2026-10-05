import { ApiResponse, patchApi, policySearchApi, postApi } from "@/app/api/apiService";

export const saveAndUpdateEndorsment = async <T extends object>(
    payload: T,
    id?: string,
): Promise<ApiResponse<any>> => {
    try {
        const endpoint = id ? `/v1/policy-endorsements/process` : `v1/policy-endorsements/process`;
        return id
            ? await patchApi<any, T>(policySearchApi, endpoint, payload)
            : await postApi<any, T>(policySearchApi, endpoint, payload);
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
};
export const saveEnrollment = async <T extends object>(
    payload: T,
): Promise<ApiResponse<any>> => {
    try {
        const endpoint = `v1/enroll/policy/QC`;
        return await postApi<any, T>(policySearchApi, endpoint, payload);
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
};