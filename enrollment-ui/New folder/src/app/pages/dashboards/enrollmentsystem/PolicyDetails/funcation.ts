import { inwardGenerateApi, ApiResponse, patchApi, postApi } from "@/app/api/apiService";

export const saveAndUpdateInward = async <T extends object>(
    payload: T,
    id?: string,
): Promise<ApiResponse<any>> => {
    try {
        const endpoint = id ? `/v1/generateId/inwardno/${id}` : `/v1/generateId/inwardno`;
        return id
            ? await patchApi<any, T>(inwardGenerateApi, endpoint, payload)
            : await postApi<any, T>(inwardGenerateApi, endpoint, payload);
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
};