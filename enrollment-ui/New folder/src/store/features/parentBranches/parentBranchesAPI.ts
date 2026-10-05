import { getApi, masterApi } from "@/app/api/apiService";
import { API_BASE_URLS } from "@/app/api/apiService";
import { ParentBranchResponse } from "./parentBranchesTypes";


export const fetchParentBranchesAPI =
  async (): Promise<ParentBranchResponse | null> => {
    const url = `${API_BASE_URLS.MASTER}/v1/tpa-branch`;

    const params = new URLSearchParams({
      onlyNames: "true",
    });

    const response = await getApi<ParentBranchResponse>(
      masterApi,
      `${url}?${params.toString()}`,
    );

    return response.data;
  };
