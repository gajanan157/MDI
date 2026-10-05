import { fetchProviderCheckPpnValidation } from "@/store/features/providerAgreement/providerAgreementAPI";
import { shouldSendProviderGipsaPpnFields } from "./agreementHelpers";
import {
  mapCheckPpnToFormHydration,
  type AgreementPpnHydration,
} from "./agreementPpnHydration";

export type AgreementPpnDisplayNames = {
  ppnStateName: string;
  ppnCityName: string;
};

/** Resolves PPN state/city from `GET /v1/provider/{id}/check-ppn-state-city`. */
export async function fetchAgreementPpnHydration(
  providerId: string,
): Promise<AgreementPpnHydration | null> {
  const trimmedProviderId = providerId.trim();
  if (!trimmedProviderId) return null;

  const result = await fetchProviderCheckPpnValidation(trimmedProviderId);
  if (!result.ok) return null;

  return mapCheckPpnToFormHydration(result.data);
}

/** @deprecated Use fetchAgreementPpnHydration for ids + labels. */
export async function fetchAgreementPpnDisplayNames(
  providerId: string,
): Promise<AgreementPpnDisplayNames> {
  const hydration = await fetchAgreementPpnHydration(providerId);
  return {
    ppnStateName: hydration?.ppnStateName ?? "",
    ppnCityName: hydration?.ppnCityName ?? "",
  };
}

export function agreementUsesPpnDisplayNames(agreementName: string | undefined): boolean {
  return shouldSendProviderGipsaPpnFields(agreementName);
}
