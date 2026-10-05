
import { insurerApi, getApi } from "@/app/api/apiService";
import { InsurerListResponse } from "./insurerListTypes";

export const fetchInsurerListAPI =
  async (): Promise<InsurerListResponse | null> => {
    const url = "/v1/insurer?page=0&size=100&sortBy=createdAt&activeList=true";
    const response = await getApi<InsurerListResponse>(insurerApi, url);

    return response.data;
  };
