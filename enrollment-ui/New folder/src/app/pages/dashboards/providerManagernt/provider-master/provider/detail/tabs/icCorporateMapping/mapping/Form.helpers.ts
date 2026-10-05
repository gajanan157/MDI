import type { IcMappingFormState } from "../types";
import { getAlphanumericCodeValidationError } from "@/app/pages/dashboards/providerManagernt/shared/alphanumericCodeInput";
import { hasSupportingDocumentPresent, isRemarkFilled } from "../shared";

/** Required fields: entity dropdown(s), Empanelment Source, Network Mode, Tariff Type, Effective From, Remarks, Supporting Document. */
function hasNetworkModeAndTariffType(form: IcMappingFormState): boolean {
  return Boolean(form.networkMode.trim() && form.tariffType.trim());
}

function areRequiredFieldsFilled(
  form: IcMappingFormState,
  mappingVariant: "ic" | "corporate",
  isExistingMapping = false,
): boolean {
  if (!form.effectiveFrom.trim()) return false;
  if (!hasNetworkModeAndTariffType(form)) return false;
  if (!isRemarkFilled(form.remarks)) return false;
  if (!hasSupportingDocumentPresent(form)) return false;

  // Existing mappings lock IC / empanelment — only editable fields gate the button.
  if (isExistingMapping) {
    return true;
  }

  if (mappingVariant === "corporate") {
    const requiredValues = [form.icName, form.empanelmentSource];
    const hasCorporate = form.corporateIds.some((id) => id.trim() !== "");
    return hasCorporate && requiredValues.every((value) => value.trim() !== "");
  }

  const requiredValues = [form.icName, form.empanelmentSource];
  return requiredValues.every((value) => value.trim() !== "");
}

export function isIcMappingSaveDisabled(
  form: IcMappingFormState,
  mappingVariant: "ic" | "corporate",
  isExistingMapping: boolean,
  saving: boolean,
  detailLoading: boolean,
  networkModeLoading: boolean,
): boolean {
  const icProviderCodeInvalid = Boolean(
    getAlphanumericCodeValidationError(form.icProviderCode ?? ""),
  );

  return (
    saving ||
    detailLoading ||
    networkModeLoading ||
    icProviderCodeInvalid ||
    !areRequiredFieldsFilled(form, mappingVariant, isExistingMapping)
  );
}
