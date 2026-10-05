import type { NormalizedCheckPpnStateCityValidation } from "@/store/features/providerAgreement/providerAgreementTypes";
import type { AgreementFullFormValues } from "./agreementFormConfig";
import type { GipsaPpnDropdownOption } from "./agreementGipsaPpnNormalizer";

export type AgreementPpnHydration = {
  ppnState: string;
  ppnCity: string;
  ppnStateName: string;
  ppnCityName: string;
  stateOptions: GipsaPpnDropdownOption[];
  cityOptions: GipsaPpnDropdownOption[];
};

function buildPpnOption(
  id: string | null,
  ppnName: string,
  providerLocationName = "",
): GipsaPpnDropdownOption[] {
  const label = ppnName.trim() || providerLocationName.trim();
  if (!label) return [];
  const value = String(id ?? "").trim() || label;
  return [{ value, label }];
}

function resolvePpnFormValue(
  id: string | null,
  ppnName: string,
  providerLocationName = "",
): string {
  const idValue = String(id ?? "").trim();
  if (idValue) return idValue;
  return ppnName.trim() || providerLocationName.trim();
}

export function mapCheckPpnToFormHydration(
  data: NormalizedCheckPpnStateCityValidation,
): AgreementPpnHydration {
  const stateName = String(data.providerGipsaPpnStateName ?? "").trim();
  const cityName = String(data.providerGipsaPpnCityName ?? "").trim();
  const providerState = String(data.providerState ?? "").trim();
  const providerCity = String(data.providerCity ?? "").trim();

  const ppnState = resolvePpnFormValue(
    data.providerGipsaPpnStateId,
    stateName,
    providerState,
  );
  const ppnCity = resolvePpnFormValue(
    data.providerGipsaPpnCityId,
    cityName,
    providerCity,
  );

  return {
    ppnState,
    ppnCity,
    ppnStateName: stateName || providerState,
    ppnCityName: cityName || providerCity,
    stateOptions: buildPpnOption(data.providerGipsaPpnStateId, stateName, providerState),
    cityOptions: buildPpnOption(data.providerGipsaPpnCityId, cityName, providerCity),
  };
}

export function resolvePpnHydrationForForm(
  hydration: AgreementPpnHydration,
  existing: Pick<
    AgreementFullFormValues,
    "ppnState" | "ppnCity" | "ppnStateName" | "ppnCityName"
  >,
  preserveExisting: boolean,
): AgreementPpnHydration {
  if (!preserveExisting) return hydration;

  return {
    ppnState: existing.ppnState.trim() || hydration.ppnState,
    ppnCity: existing.ppnCity.trim() || hydration.ppnCity,
    ppnStateName: existing.ppnStateName.trim() || hydration.ppnStateName,
    ppnCityName: existing.ppnCityName.trim() || hydration.ppnCityName,
    stateOptions: hydration.stateOptions,
    cityOptions: hydration.cityOptions,
  };
}
