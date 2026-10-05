// stateCityAPI.ts
import { getApi, mainApi } from "@/app/api/apiService";
import { CityResponse, StateResponse } from "./stateCityTypes";

/**
 * -------------------------
 *   STATE LIST API
 * -------------------------
 */
export const fetchStateAPI = async (): Promise<StateResponse> => {
  const url = `/v1/pincode-master`;

  const res = await getApi<StateResponse>(mainApi, url);

  return res.data!;
};

/**
 * -------------------------
 *   CITY BY STATE API
 * -------------------------
 * Omit `page`/`size` to request the full unpaged list from the API.
 */
export const fetchCityByStateNameAPI = async (
  stateName: string,
  searchCity?: string,
  pinCode?: string,
  page?: number,
  size?: number
): Promise<CityResponse> => {
  const params = new URLSearchParams();

  const trimmedState = String(stateName ?? "").trim();
  if (trimmedState) {
    params.append("stateName", trimmedState);
  }
  if (searchCity) {
    params.append("searchCity", searchCity);
  }
  if (pinCode) {
    params.append("pinCode", pinCode);
  }
  if (page != null) {
    params.append("page", String(page));
  }
  if (size != null) {
    params.append("size", String(size));
  }

  const url = `/v1/pincode-master?${params.toString()}`;

  const res = await getApi<CityResponse>(mainApi, url);

  return res.data!;
};
