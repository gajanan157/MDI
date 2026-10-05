import { insurerApi, postApi, patchApi } from "@/app/api/apiService";
import { PostAndPutResponse } from "@/app/pages/AdminDepartment/tpa/funcation";

export const createAndUpdateContactPersonApi = async <T extends object>(
  payload: T,
  id?: string,
  insurerId?: string
): Promise<PostAndPutResponse> => {
  try {
    const endpoint = id ? `/v1/insurer/contact-person/${id}` : `/v1/insurer/${insurerId}/contact-person`;
    const method = id ? "patch" : "post"; 
    const response = method === "patch" ? 
    await patchApi<any, T>(insurerApi, endpoint, payload)   : 
    await postApi<any, T>(insurerApi, endpoint, payload);
    return response;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};