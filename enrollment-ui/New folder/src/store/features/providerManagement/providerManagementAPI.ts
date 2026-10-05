import { getApi } from "@/app/api/apiService";
import { ProviderListResponse } from "./providerManagementTypes";
import { insurerApi } from "@/app/api/apiService";

export const fetchNonNetworkProvidersAPI =
  async (): Promise<ProviderListResponse | null> => {
    const url = "/v1/provider/non-network?page=0&size=100&sortBy=createdAt";
    const response = await getApi<ProviderListResponse>(insurerApi, url);

    return response.data;
  };

