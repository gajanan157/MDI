import * as Yup from "yup";
import { ValidationError } from "yup";
import {
  ALPHABET_ONLY_PATTERN,
  ALPHABET_ONLY_VALIDATION_MESSAGE,
} from "../../../../../shared/alphabetOnlyInput";
import {
  CONTACT_PERSON_DESIGNATION_NUMBER_ERROR,
  CONTACT_PERSON_NAME_NUMBER_ERROR,
  getContactPersonDesignationValidationError,
  getContactPersonNameValidationError,
} from "@/utils/contactPersonNameInput";
import {
  getContactEmailCharValidationError,
  getContactPhoneCharValidationError,
} from "@/utils/contactFieldInput";
import {
  getEmailPartsValidationMessage,
  getMobileInputValidationError,
  getMobilePartsValidationMessage,
  getTelephonePartsValidationMessage,
  splitMultiValueContactParts,
} from "../../schemas";
import { providerRootPath } from "../../../utils/providersPaths";
import {
  PROVIDER_OWNER_KEYS as K,
  type CreateProviderOwnerBody,
  type NormalizedProviderOwner,
  type PatchProviderOwnerBody,
} from "@/store/features/providerOwner/providerOwnerTypes";

const OWNER_QUALIFICATION_NUMBER_ERROR = "Numbers are not allowed in qualification";

export type ProviderOwnerFormValues = {
  [K.providerOwnerName]: string;
  [K.providerOwnerDesignation]: string;
  [K.providerOwnerPanNo]: string;
  [K.providerOwnerQualification]: string;
  [K.providerOwnerTelephone]: string;
  [K.providerOwnerMobile]: string;
  [K.providerOwnerEmailId]: string;
  [K.providerOwnerGender]: string;
  [K.providerOwnerAddress]: string;
  [K.providerOwnerState]: string;
  [K.providerOwnerCity]: string;
  [K.providerOwnerPincode]: string;
};

export const PROVIDER_OWNER_FORM_DEFAULTS: ProviderOwnerFormValues = {
  [K.providerOwnerName]: "",
  [K.providerOwnerDesignation]: "",
  [K.providerOwnerPanNo]: "",
  [K.providerOwnerQualification]: "",
  [K.providerOwnerTelephone]: "",
  [K.providerOwnerMobile]: "",
  [K.providerOwnerEmailId]: "",
  [K.providerOwnerGender]: "",
  [K.providerOwnerAddress]: "",
  [K.providerOwnerState]: "",
  [K.providerOwnerCity]: "",
  [K.providerOwnerPincode]: "",
};

export const providerOwnerFormSchema = Yup.object({
  [K.providerOwnerName]: Yup.string()
    .trim()
    .required("Owner name is required")
    .test("owner-name", function (value = "") {
      if (/\d/.test(value)) {
        return this.createError({ message: CONTACT_PERSON_NAME_NUMBER_ERROR });
      }
      if (!ALPHABET_ONLY_PATTERN.test(value)) {
        return this.createError({ message: ALPHABET_ONLY_VALIDATION_MESSAGE });
      }
      return true;
    }),
  [K.providerOwnerDesignation]: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("owner-designation", function (value = "") {
      const v = value.trim();
      if (!v) return true;
      if (/\d/.test(v)) {
        return this.createError({ message: CONTACT_PERSON_DESIGNATION_NUMBER_ERROR });
      }
      if (!ALPHABET_ONLY_PATTERN.test(v)) {
        return this.createError({ message: ALPHABET_ONLY_VALIDATION_MESSAGE });
      }
      return true;
    }),
  [K.providerOwnerPanNo]: Yup.string()
    .trim()
    .notRequired()
    .test(
      "pan-validation",
      "Enter a valid PAN No (e.g. ABCDE1234F)",
      (value) => {
        if (!value) return true;
        return /^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase());
      },
    ),
  [K.providerOwnerQualification]: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("owner-qualification", function (value = "") {
      const v = value.trim();
      if (!v) return true;
      if (/\d/.test(v)) {
        return this.createError({ message: OWNER_QUALIFICATION_NUMBER_ERROR });
      }
      if (!ALPHABET_ONLY_PATTERN.test(v)) {
        return this.createError({ message: ALPHABET_ONLY_VALIDATION_MESSAGE });
      }
      return true;
    }),
  [K.providerOwnerTelephone]: Yup.string()
    .trim()
    .notRequired()
    .test("telephone-parts", "", function (value = "") {
      const msg = getTelephonePartsValidationMessage(splitMultiValueContactParts(value));
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  [K.providerOwnerMobile]: Yup.string()
    .trim()
    .required("Please enter mobile no")
    .test("mobile-parts", "", function (value = "") {
      const msg = getMobilePartsValidationMessage(splitMultiValueContactParts(value));
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  [K.providerOwnerEmailId]: Yup.string()
    .trim()
    .required("Please enter email")
    .test("email-parts", "", function (value = "") {
      const msg = getEmailPartsValidationMessage(splitMultiValueContactParts(value));
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  [K.providerOwnerGender]: Yup.string()
    .trim()
    .notRequired()
    .oneOf(["", "Male", "Female"], "Select Male or Female"),
  [K.providerOwnerAddress]: Yup.string().trim().required("Address is required"),
  [K.providerOwnerState]: Yup.string().trim().required("State is required"),
  [K.providerOwnerCity]: Yup.string().trim().required("City is required"),
  [K.providerOwnerPincode]: Yup.string().trim().required("Pincode is required"),
});

export type ProviderOwnerFieldErrors = {
  name: string;
  designation: string;
  qualification: string;
  telephone: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export type SyncProviderOwnerFieldErrorsOptions = {
  touchedFields?: Partial<Readonly<Record<keyof ProviderOwnerFormValues, boolean>>>;
  showRequiredErrors?: boolean;
};

function getOwnerQualificationValidationError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  if (/\d/.test(value)) return OWNER_QUALIFICATION_NUMBER_ERROR;
  if (!ALPHABET_ONLY_PATTERN.test(value)) return ALPHABET_ONLY_VALIDATION_MESSAGE;
  return undefined;
}

function shouldShowSchemaError(
  field: keyof ProviderOwnerFormValues,
  value: string,
  options?: SyncProviderOwnerFieldErrorsOptions,
): boolean {
  if (options?.showRequiredErrors) return true;
  if (options?.touchedFields?.[field]) return true;
  return value.trim().length > 0;
}

function schemaFieldError(
  field: keyof ProviderOwnerFormValues,
  values: ProviderOwnerFormValues,
): string {
  try {
    providerOwnerFormSchema.validateSyncAt(field, values, { abortEarly: true });
    return "";
  } catch (error) {
    return error instanceof ValidationError ? error.message : "";
  }
}

export function syncProviderOwnerFieldErrors(
  values: ProviderOwnerFormValues,
  options?: SyncProviderOwnerFieldErrorsOptions,
): ProviderOwnerFieldErrors {
  const nameValue = values[K.providerOwnerName] ?? "";
  const designationValue = values[K.providerOwnerDesignation] ?? "";
  const qualificationValue = values[K.providerOwnerQualification] ?? "";
  const telephoneValue = values[K.providerOwnerTelephone] ?? "";
  const mobileValue = values[K.providerOwnerMobile] ?? "";
  const emailValue = values[K.providerOwnerEmailId] ?? "";
  const addressValue = values[K.providerOwnerAddress] ?? "";
  const pincodeValue = values[K.providerOwnerPincode] ?? "";
  const cityValue = values[K.providerOwnerCity] ?? "";
  const stateValue = values[K.providerOwnerState] ?? "";

  const nameChar = getContactPersonNameValidationError(nameValue);
  const designationChar = getContactPersonDesignationValidationError(designationValue);
  const qualificationChar = getOwnerQualificationValidationError(qualificationValue);
  const telephoneChar = getContactPhoneCharValidationError(telephoneValue) ?? "";
  const mobileChar = getContactPhoneCharValidationError(mobileValue) ?? "";
  const emailChar = getContactEmailCharValidationError(emailValue) ?? "";

  return {
    name:
      nameChar ??
      (shouldShowSchemaError(K.providerOwnerName, nameValue, options)
        ? schemaFieldError(K.providerOwnerName, values)
        : ""),
    designation:
      designationChar ??
      (shouldShowSchemaError(K.providerOwnerDesignation, designationValue, options)
        ? schemaFieldError(K.providerOwnerDesignation, values)
        : ""),
    qualification:
      qualificationChar ??
      (shouldShowSchemaError(K.providerOwnerQualification, qualificationValue, options)
        ? schemaFieldError(K.providerOwnerQualification, values)
        : ""),
    telephone:
      telephoneChar ||
      (shouldShowSchemaError(K.providerOwnerTelephone, telephoneValue, options)
        ? schemaFieldError(K.providerOwnerTelephone, values)
        : ""),
    mobile:
      mobileChar ||
      (shouldShowSchemaError(K.providerOwnerMobile, mobileValue, options)
        ? getMobileInputValidationError(mobileValue) ||
          schemaFieldError(K.providerOwnerMobile, values)
        : ""),
    email:
      emailChar ||
      (shouldShowSchemaError(K.providerOwnerEmailId, emailValue, options)
        ? schemaFieldError(K.providerOwnerEmailId, values)
        : ""),
    address: shouldShowSchemaError(K.providerOwnerAddress, addressValue, options)
      ? schemaFieldError(K.providerOwnerAddress, values)
      : "",
    pincode: shouldShowSchemaError(K.providerOwnerPincode, pincodeValue, options)
      ? schemaFieldError(K.providerOwnerPincode, values)
      : "",
    city: shouldShowSchemaError(K.providerOwnerCity, cityValue, options)
      ? schemaFieldError(K.providerOwnerCity, values)
      : "",
    state: shouldShowSchemaError(K.providerOwnerState, stateValue, options)
      ? schemaFieldError(K.providerOwnerState, values)
      : "",
  };
}

function readPincodeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function mapProviderOwnerToFormValues(
  owner: NormalizedProviderOwner,
): ProviderOwnerFormValues {
  return {
    [K.providerOwnerName]: owner.providerOwnerName,
    [K.providerOwnerPanNo]: owner.providerOwnerPanNo,
    [K.providerOwnerDesignation]: owner.providerOwnerDesignation,
    [K.providerOwnerQualification]: owner.providerOwnerQualification,
    [K.providerOwnerTelephone]: owner.providerOwnerTelephone.join(", "),
    [K.providerOwnerMobile]: owner.providerOwnerMobile.join(", "),
    [K.providerOwnerEmailId]: owner.providerOwnerEmailId.join(", "),
    [K.providerOwnerGender]: owner.providerOwnerGender,
    [K.providerOwnerAddress]: owner.providerOwnerAddress,
    [K.providerOwnerState]: owner.providerOwnerState,
    [K.providerOwnerCity]: owner.providerOwnerCity,
    [K.providerOwnerPincode]: owner.providerOwnerPincode,
  };
}

export function buildProviderOwnerCreateBody(
  form: ProviderOwnerFormValues,
): CreateProviderOwnerBody {
  return {
    providerOwnerName: form[K.providerOwnerName].trim(),
    providerOwnerPanNo: form[K.providerOwnerPanNo].trim(),
    providerOwnerQualification: form[K.providerOwnerQualification].trim(),
    providerOwnerDesignation: form[K.providerOwnerDesignation].trim(),
    providerOwnerTelephone: splitMultiValueContactParts(form[K.providerOwnerTelephone]),
    providerOwnerMobile: splitMultiValueContactParts(form[K.providerOwnerMobile]),
    providerOwnerEmailId: splitMultiValueContactParts(form[K.providerOwnerEmailId]),
    providerOwnerGender: form[K.providerOwnerGender].trim(),
    providerOwnerAddress: form[K.providerOwnerAddress].trim(),
    providerOwnerState: form[K.providerOwnerState].trim(),
    providerOwnerCity: form[K.providerOwnerCity].trim(),
    providerOwnerPincode: readPincodeNumber(form[K.providerOwnerPincode]),
  };
}

export function buildProviderOwnerPatchBody(
  form: ProviderOwnerFormValues,
  owner: NormalizedProviderOwner,
  providerId: string,
): PatchProviderOwnerBody {
  return {
    ...buildProviderOwnerCreateBody(form),
    providerOwnerId: owner.providerOwnerId,
    providerId: owner.providerId || providerId,
    recordStatus: owner.recordStatus || "Active",
  };
}

export function providerOwnerListPath(providerId: string): string {
  return `${providerRootPath(providerId)}/owner`;
}

export function providerOwnerNewPath(providerId: string): string {
  return `${providerRootPath(providerId)}/owner/new`;
}

export function providerOwnerEditPath(providerId: string, ownerId: string): string {
  return `${providerRootPath(providerId)}/owner/${encodeURIComponent(ownerId)}/edit`;
}

export { PROVIDER_OWNER_KEYS } from "@/store/features/providerOwner/providerOwnerTypes";
export type { NormalizedProviderOwner } from "@/store/features/providerOwner/providerOwnerTypes";
