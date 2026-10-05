import { benefitsConfigurationApi, patchApi, postApi } from "@/app/api/apiService";
import { showErrorMessage } from "@/utils/errorHandler";
import { putApi, deleteApi } from "../../../api/apiService";
import { NavigateFunction } from "react-router-dom";


interface BenefitsMasterResponse {
  responseCode: number;
    responseMessage: string;
    success: boolean;
    responseObject?: any;
}
export const saveMasters = async <T extends object>(
  payload: T,
  endpoint: string,
  id?: string,
): Promise<BenefitsMasterResponse> => {
  try {
    const method = id ? "put" : "post";
    const response =
      method === "put"
        ? await putApi<any, T>(benefitsConfigurationApi, endpoint, payload)
        : await postApi<any, T>(benefitsConfigurationApi, endpoint, payload);
    
    if (!response.success) {
      showErrorMessage(response);
    }

    return response;
  } catch (error: any) {
    showErrorMessage(error.response);
    return { responseCode: 500,success: false, responseMessage: error.message || "An error occurred" };
  }
};

export const deleteMasters = async <T extends object>(
    endpoint: string,
    id: string | number,
    // payload?: T
  ): Promise<BenefitsMasterResponse> => {
    try {
      const response = await deleteApi<any, T>(
        benefitsConfigurationApi,
        `${endpoint}/${id}`
      );
  
      if (!response.success) {
        showErrorMessage(response);
      }
  
      return response;
    } catch (error: any) {
      showErrorMessage(error.response);
  
      return {
        responseCode: 500,
        success: false,
        responseMessage: error.message || "An error occurred",
      };
    }
  };

  export const MASTER_PATH =
    "/benefits-configuration/benefits-master";

    export const navigateFromMaster = (
      navigate: NavigateFunction,
      targetPath: string,
      activeTab: string
  ) => {
      navigate(targetPath, {
          state: {
              fromMaster: true,
              activeTab,
          },
      });
  };

  export const navigateBackToMaster = (
    navigate: NavigateFunction,
    activeTab: string
) => {
    navigate(MASTER_PATH, {
        state: {
            activeTab,
        },
    });
};

export const getMasterBreadcrumb = (
    title: string,
    activeTab: string
) => ({
    title,
    path: MASTER_PATH,
    state: {
        activeTab,
    },
});