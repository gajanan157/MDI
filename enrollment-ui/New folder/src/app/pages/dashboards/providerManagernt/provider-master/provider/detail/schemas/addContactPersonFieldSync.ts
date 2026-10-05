import { ValidationError } from "yup";
import {
  getContactEmailCharValidationError,
  getContactPhoneCharValidationError,
} from "@/utils/contactFieldInput";
import {
  getContactPersonDesignationValidationError,
  getContactPersonNameValidationError,
} from "@/utils/contactPersonNameInput";
import {
  addContactPersonSchema,
  getMobileInputValidationError,
  type AddContactPersonFormValues,
} from "./viewHospitalSchemas";

export type AddContactPersonFieldErrors = {
  name: string;
  designation: string;
  mobile: string;
  telephone: string;
  email: string;
};

export type SyncAddContactPersonFieldErrorsOptions = {
  touchedFields?: Partial<Readonly<Record<keyof AddContactPersonFormValues, boolean>>>;
  /** After submit attempt, show required-field errors even when untouched. */
  showRequiredErrors?: boolean;
};

function shouldShowSchemaError(
  field: keyof AddContactPersonFormValues,
  value: string,
  options?: SyncAddContactPersonFieldErrorsOptions,
): boolean {
  if (options?.showRequiredErrors) return true;
  if (options?.touchedFields?.[field]) return true;
  return value.trim().length > 0;
}

function schemaFieldError(
  field: keyof AddContactPersonFormValues,
  values: AddContactPersonFormValues,
): string {
  try {
    addContactPersonSchema.validateSyncAt(field, values, { abortEarly: true });
    return "";
  } catch (error) {
    return error instanceof ValidationError ? error.message : "";
  }
}

function phoneCharError(value: string): string {
  return getContactPhoneCharValidationError(value) ?? "";
}

function emailCharError(value: string): string {
  return getContactEmailCharValidationError(value) ?? "";
}

export function syncAddContactPersonFieldErrors(
  values: AddContactPersonFormValues,
  options?: SyncAddContactPersonFieldErrorsOptions,
): AddContactPersonFieldErrors {
  const nameValue = values.providerContactPersonFullName ?? "";
  const designationValue = values.providerContactPersonDesignation ?? "";
  const mobileValue = values.providerContactPersonMobileNo ?? "";
  const telephoneValue = values.providerContactPersonTelephoneNo ?? "";
  const emailValue = values.providerContactPersonEmailId ?? "";

  const nameChar = getContactPersonNameValidationError(nameValue);
  const designationChar = getContactPersonDesignationValidationError(designationValue);
  const mobileChar = phoneCharError(mobileValue);
  const telephoneChar = phoneCharError(telephoneValue);
  const emailChar = emailCharError(emailValue);

  return {
    name:
      nameChar ??
      (shouldShowSchemaError("providerContactPersonFullName", nameValue, options)
        ? schemaFieldError("providerContactPersonFullName", values)
        : ""),
    designation:
      designationChar ??
      (shouldShowSchemaError("providerContactPersonDesignation", designationValue, options)
        ? schemaFieldError("providerContactPersonDesignation", values)
        : ""),
    mobile:
      mobileChar ||
      (shouldShowSchemaError("providerContactPersonMobileNo", mobileValue, options)
        ? getMobileInputValidationError(mobileValue) ||
          schemaFieldError("providerContactPersonMobileNo", values)
        : ""),
    telephone:
      telephoneChar ||
      (shouldShowSchemaError("providerContactPersonTelephoneNo", telephoneValue, options)
        ? schemaFieldError("providerContactPersonTelephoneNo", values)
        : ""),
    email:
      emailChar ||
      (shouldShowSchemaError("providerContactPersonEmailId", emailValue, options)
        ? schemaFieldError("providerContactPersonEmailId", values)
        : ""),
  };
}
