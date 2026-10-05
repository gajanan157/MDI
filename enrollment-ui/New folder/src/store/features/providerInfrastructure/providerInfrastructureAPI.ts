import {
  getApi,
  patchApi,
  providerApi,
  type ApiResponse,
} from "@/app/api/apiService";
import { unwrapProviderEntity } from "@/store/features/provider/providerAPI";
import { normalizeProviderInfrastructure } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/infrastructure/infrastructureNormalizer";
import type {
  ProviderInfrastructure,
  ProviderInfrastructurePatchPayload,
} from "./providerInfrastructureTypes";

const PROVIDER_PATH = "/v1/provider";

function isInfrastructureNotFoundError(status?: number, error?: string | null): boolean {
  if (status === 404) return true;
  const message = (error ?? "").trim().toLowerCase();
  return message.includes("not found");
}

/** Maps API payload into normalized infrastructure for Redux state. */
export function mapProviderInfrastructureApiResponse(
  raw: unknown,
  providerId?: string,
): ProviderInfrastructure | null {
  const entity = unwrapProviderEntity(raw);
  return normalizeProviderInfrastructure(entity, providerId);
}

/** GET `/v1/provider/{providerId}/infrastructure` */
export async function getProviderInfrastructure(
  providerId: string,
): Promise<ApiResponse<ProviderInfrastructure | null>> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/infrastructure`;
  const res = await getApi<unknown>(providerApi, url);
  if (!res.success) {
    if (isInfrastructureNotFoundError(res.status, res.error)) {
      return {
        success: true,
        data: null,
        error: null,
        status: res.status,
      };
    }
    return {
      success: false,
      data: null,
      error: res.error,
      status: res.status,
      errorPayload: res.errorPayload,
    };
  }

  return {
    success: true,
    data: mapProviderInfrastructureApiResponse(res.data, providerId),
    error: null,
  };
}

/** PATCH `/v1/provider/{providerId}/infrastructure` */
export async function patchProviderInfrastructure(
  providerId: string,
  payload: ProviderInfrastructurePatchPayload,
): Promise<ApiResponse<ProviderInfrastructure | null>> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/infrastructure`;
  const res = await patchApi<unknown, ProviderInfrastructurePatchPayload>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    return {
      success: false,
      data: null,
      error: res.error,
      status: res.status,
      errorPayload: res.errorPayload,
    };
  }

  return {
    success: true,
    data: mapProviderInfrastructureApiResponse(res.data, providerId),
    error: null,
  };
}
