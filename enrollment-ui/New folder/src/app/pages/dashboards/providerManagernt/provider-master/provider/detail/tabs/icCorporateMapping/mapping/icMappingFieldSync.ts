import {
  ALPHANUMERIC_CODE_VALIDATION_MESSAGE,
  getAlphanumericCodeValidationError,
} from "@/app/pages/dashboards/providerManagernt/shared/alphanumericCodeInput";
import type { IcMappingFormState } from "../types";

export type IcMappingSyncedField = "icProviderCode" | "effectiveFrom";

export type IcMappingFieldErrors = {
  icProviderCode: string;
  effectiveFrom: string;
};

export type SyncIcMappingFieldErrorsOptions = {
  touchedFields?: Partial<Readonly<Record<IcMappingSyncedField, boolean>>>;
  showRequiredErrors?: boolean;
  icProviderCodeInvalidMessage?: string;
};

const EFFECTIVE_FROM_REQUIRED_MESSAGE = "Effective From is required";

function shouldShowFieldError(
  field: IcMappingSyncedField,
  value: string,
  options?: SyncIcMappingFieldErrorsOptions,
): boolean {
  if (options?.showRequiredErrors) return true;
  if (options?.touchedFields?.[field]) return true;
  return value.trim().length > 0;
}

export function syncIcMappingFieldErrors(
  form: IcMappingFormState,
  options?: SyncIcMappingFieldErrorsOptions,
): IcMappingFieldErrors {
  const icProviderCodeValue = form.icProviderCode ?? "";
  const effectiveFromValue = form.effectiveFrom ?? "";

  const icProviderCodeChar = getAlphanumericCodeValidationError(
    icProviderCodeValue,
    options?.icProviderCodeInvalidMessage ?? ALPHANUMERIC_CODE_VALIDATION_MESSAGE,
  );

  let effectiveFromError = "";
  if (
    !effectiveFromValue.trim() &&
    shouldShowFieldError("effectiveFrom", effectiveFromValue, options)
  ) {
    effectiveFromError = EFFECTIVE_FROM_REQUIRED_MESSAGE;
  }

  const showIcProviderCodeError = shouldShowFieldError(
    "icProviderCode",
    icProviderCodeValue,
    options,
  );

  return {
    icProviderCode: showIcProviderCodeError && icProviderCodeChar ? icProviderCodeChar : "",
    effectiveFrom: effectiveFromError,
  };
}
