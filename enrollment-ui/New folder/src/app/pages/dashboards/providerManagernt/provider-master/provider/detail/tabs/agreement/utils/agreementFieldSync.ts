import { ValidationError } from "yup";
import type { FieldNamesMarkedBoolean } from "react-hook-form";
import { CONTACT_PHONE_NUMBERS_ONLY_MESSAGE } from "@/utils/contactFieldInput";
import {
  getContactPersonDesignationValidationError,
  getContactPersonNameValidationError,
} from "@/utils/contactPersonNameInput";
import {
  agreementFullFormSchema,
  type AgreementFullFormValues,
} from "./agreementFormConfig";

export type AgreementSignatoryFieldErrors = {
  providerSignatoryName: string;
  providerSignatoryDesignation: string;
  agreementDurationDays: string;
};

export type SyncAgreementSignatoryFieldErrorsOptions = {
  touchedFields?: Partial<
    Readonly<FieldNamesMarkedBoolean<AgreementFullFormValues>>
  >;
  showRequiredErrors?: boolean;
};

function getAgreementDurationValidationError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  if (!/^\d+$/.test(value.trim())) return CONTACT_PHONE_NUMBERS_ONLY_MESSAGE;
  return undefined;
}

function shouldShowFieldError(
  field: keyof AgreementFullFormValues,
  value: string,
  options?: SyncAgreementSignatoryFieldErrorsOptions,
): boolean {
  if (options?.showRequiredErrors) return true;
  if (options?.touchedFields?.[field]) return true;
  return value.trim().length > 0;
}

function schemaFieldError(
  field: keyof AgreementFullFormValues,
  values: AgreementFullFormValues,
): string {
  try {
    agreementFullFormSchema.validateSyncAt(field, values, { abortEarly: true });
    return "";
  } catch (error) {
    return error instanceof ValidationError ? error.message : "";
  }
}

export function syncAgreementSignatoryFieldErrors(
  values: AgreementFullFormValues,
  options?: SyncAgreementSignatoryFieldErrorsOptions,
): AgreementSignatoryFieldErrors {
  const signatoryNameValue = values.providerSignatoryName ?? "";
  const signatoryDesignationValue = values.providerSignatoryDesignation ?? "";
  const durationValue = values.agreementDurationDays ?? "";

  const signatoryNameChar = getContactPersonNameValidationError(signatoryNameValue);
  const signatoryDesignationChar =
    getContactPersonDesignationValidationError(signatoryDesignationValue);
  const durationChar = getAgreementDurationValidationError(durationValue);

  return {
    providerSignatoryName:
      signatoryNameChar ??
      (shouldShowFieldError("providerSignatoryName", signatoryNameValue, options)
        ? schemaFieldError("providerSignatoryName", values)
        : ""),
    providerSignatoryDesignation:
      signatoryDesignationChar ??
      (shouldShowFieldError(
        "providerSignatoryDesignation",
        signatoryDesignationValue,
        options,
      )
        ? schemaFieldError("providerSignatoryDesignation", values)
        : ""),
    agreementDurationDays:
      durationChar ||
      (shouldShowFieldError("agreementDurationDays", durationValue, options)
        ? schemaFieldError("agreementDurationDays", values)
        : ""),
  };
}
