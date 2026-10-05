import { getApi, providerApi } from "@/app/api/apiService";
import type { ProviderClinicalSpecialtiesResponse } from "./providerClinicalSpecialtiesTypes";

export type FetchProviderClinicalSpecialtyParams = {
  page?: number;
  size?: number;
  onlyName?: boolean;
  providerClinicalSpecialtyName?: string;
};

const DEFAULT_CLINICAL_SPECIALTY_PARAMS: Required<
  Pick<FetchProviderClinicalSpecialtyParams, "page" | "size" | "onlyName">
> = {
  page: 1,
  size: 20,
  onlyName: true,
};

/** GET `/v1/provider-clinical-specialty` */
export const fetchProviderClinicalSpecialtiesAPI = async (
  params: FetchProviderClinicalSpecialtyParams = {},
): Promise<ProviderClinicalSpecialtiesResponse | null> => {
  const page = params.page ?? DEFAULT_CLINICAL_SPECIALTY_PARAMS.page;
  const size = params.size ?? DEFAULT_CLINICAL_SPECIALTY_PARAMS.size;
  const onlyName = params.onlyName ?? DEFAULT_CLINICAL_SPECIALTY_PARAMS.onlyName;
  const specialtyName = params.providerClinicalSpecialtyName?.trim();

  const response = await getApi<ProviderClinicalSpecialtiesResponse>(
    providerApi,
    "/v1/provider-clinical-specialty",
    {
      params: {
        page,
        size,
        onlyName,
        ...(specialtyName ? { providerClinicalSpecialtyName: specialtyName } : {}),
      },
    },
  );
  return response.data;
};

export const fetchProviderSystemOfMedicineAPI = async (
  onlyName = true,
): Promise<ProviderClinicalSpecialtiesResponse | null> => {
  const response = await getApi<ProviderClinicalSpecialtiesResponse>(
    providerApi,
    "/v1/provider-system-of-medicine",
    { params: { onlyName } },
  );
  if (!response.success) return null;
  return response.data;
};

export const fetchProviderBedTypesAPI = async (
  onlyName = true,
): Promise<ProviderClinicalSpecialtiesResponse | null> => {
  const response = await getApi<ProviderClinicalSpecialtiesResponse>(
    providerApi,
    "/v1/provider-bed-type",
    { params: { onlyName } },
  );
  return response.data;
};

export const fetchProviderContactPersonRolesAPI = async (
  onlyName = true,
): Promise<ProviderClinicalSpecialtiesResponse | null> => {
  const response = await getApi<ProviderClinicalSpecialtiesResponse>(
    providerApi,
    "/v1/provider-contact-person-role",
    { params: { onlyName } },
  );
  return response.data;
};
