import { ApiResponse, getApi, masterApi, patchApi, postApi } from "@/app/api/apiService";
import { AxiosInstance } from "axios";
export interface PostAndPutResponse {
  status?: number;
  success: boolean;
  data?: any;
  error?: any;
  message?: string | null;
}
interface TpaSaveResponse {
  message: string;
}
export const saveTpa = async <T extends object>(
  payload: T,
  id?: string,
): Promise<ApiResponse<TpaSaveResponse>> => {
  try {
    const endpoint = id ? `/v1/tpa/${id}` : `/v1/tpa/`;
    return id
      ? await patchApi<TpaSaveResponse, T>(masterApi, endpoint, payload)
      : await postApi<TpaSaveResponse, T>(masterApi, endpoint, payload);
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
};
export const fetchUser = async (mainUrl: AxiosInstance, url: string) => {
  const response = await getApi<any>(mainUrl, url);
  return response;
};

export function getRouteByRole(roleName: string): string {
    switch (roleName) {
        case "inward_team":
        case "corporate_enrolment_processor":
        case "corporate_enrolment_qc":
        case "corporate_endorsement_processor":
        case "corporate_endorsement_qc":
            return "/enrolment-system/dashboard";

        case "corporate_enrolment_admin":
        case "enrolment_super_admin":
            return "/enrolment-system/admin-dashboard";

        case "tpa.read":
        case "tpa.write":
            return "/tpa-management/tpa";

        case "enrolment_e_card_admin":
            return "/enrolment-system/e-cards";

        case "enrolment_e_card_processor":
            return "/enrolment-system/e-card-configuration";

        case "manager_administration.read":
        case "manager_administration.write":
            return "/user-management/users";

        case "branch.read":
        case "branch.write":
            return "/tpa-management/branches";

        case "master-product.read":
        case "master-product.write":
            return "/master-management/master-product";

        case "insurer.read":
        case "insurer.write":
            return "/insurer-management/insurer";

        case "insurer-office.read":
        case "insurer-office.write":
            return "/insurer-management/office";

        case "insurer-office-hierarchy.write":
            return "/insurer-management/office-hierarchy";

        case "inward.read":
        case "inward.write":
            return "/inward-management/inward";

        case "provider.admin":
            return "/provider-masters/providers";
        case "bank-details.processor":
            return "/provider-masters/providers";
        case "bank-details.qc":
            return "/provider-masters/providers";
        case "discount.processor":
            return "/provider-masters/providers";
        case "discount.qc":
            return "/provider-masters/providers";

        default:
            return "/enrolment-system/dashboard";
    }
}
