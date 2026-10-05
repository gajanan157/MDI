import {
  getApi,
  insurerApi,
  masterApi,
  patchApi,
  postApi,
} from "@/app/api/apiService";

interface InsurerOfficesResponse {
  status?: number;
  success: boolean;
  data?: any;
  error?: any;
}

export const saveInsurerOffice = async <T extends object>(
  payload: T,
  id?: string,
  insurerId?: string
): Promise<InsurerOfficesResponse> => {
  try {
    const endpoint = id
      ? `/v1/insurer/insurer-office/${id}`
     :`/v1/insurer/${insurerId}/insurer-office`
    const method = id ? "patch" : "post";

    const response =
      method === "patch"
        ? await patchApi<any, T>(insurerApi, endpoint, payload)
        : await postApi<any, T>(insurerApi, endpoint, payload);

    return response;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const fetchUser = async () => {
  const response = await getApi<any>(masterApi, `/tpa`);
  return response;
};
