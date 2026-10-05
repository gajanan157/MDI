import * as Yup from "yup";
import {
  ALPHABET_ONLY_PATTERN,
  ALPHABET_ONLY_VALIDATION_MESSAGE,
} from "@/utils/alphabetOnlyInput";
import {
  CONTACT_PERSON_DESIGNATION_NUMBER_ERROR,
  CONTACT_PERSON_NAME_NUMBER_ERROR,
} from "@/utils/contactPersonNameInput";
import { isProviderDateStrictlyBefore } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import type { BankFormApiFields } from "../utils/sectionMerges/bank/bankTypes";
import { isProviderRohiniIdentifierType } from "../utils/sectionMerges/provider/providerDetailIdentifierFieldKeys";

// --- Contact multi-value helpers (shared by contact + owner schemas) ---

const emailPartSchema = Yup.string().email("Invalid email");

/** Requires local@domain.tld — rejects incomplete domains like `user@gmai`. */
const EMAIL_WITH_TLD_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Split stored value (comma / semicolon) or API string array for display. */
type MultiValueContactRaw = string | string[] | null | undefined;

export function splitMultiValueContactParts(raw?: MultiValueContactRaw): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((part) => String(part).trim()).filter(Boolean);
  }
  if (!raw.trim()) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Single-line input value for mobile / telephone / email fields. */
export function contactMultiValueInputValue(raw?: string | string[] | null): string {
  return joinContactMultiValues(splitMultiValueContactParts(raw)) ?? "";
}

/** Editor: at least one row so users can type. */
export function splitMultiValueContactPartsForEdit(
  raw?: string | string[] | null,
): string[] {
  const s = splitMultiValueContactParts(raw);
  return s.length > 0 ? s : [""];
}

export function joinContactMultiValues(parts: string[]): string | undefined {
  const j = parts.map((p) => p.trim()).filter(Boolean).join(", ");
  return j || undefined;
}

/**
 * E.164 international phone format:
 * optional leading +, country code must not start with 0, max 15 digits, no separators.
 */
export const E164_PHONE_REGEX = /^\+?[1-9]\d{0,14}$/;

export const E164_PHONE_VALIDATION_MESSAGE =
  "Enter a valid phone number (e.g. +14155552671 or 919876543210)";

export const MOBILE_VALIDATION_MESSAGE =
  "Enter a valid mobile (e.g. 9876543210 or +919876543210)";

export function isValidE164Phone(value: string): boolean {
  return E164_PHONE_REGEX.test(value.trim());
}

export function getE164PhonePartsValidationMessage(
  parts: string[],
): string | undefined {
  for (const raw of parts) {
    const p = raw.trim();
    if (!p) continue;
    if (!isValidE164Phone(p)) {
      return E164_PHONE_VALIDATION_MESSAGE;
    }
  }
  return undefined;
}

function stripMobileSeparators(s: string): string {
  return s.replace(/[\s-]/g, "");
}

/** Placeholder numbers such as 6666666666 are rejected. */
const REPEATED_DIGIT_MOBILE_REGEX = /^(\d)\1{9}$/;

function isValidMobileCompact(c: string): boolean {
  const localNumber = c.replace(/^(?:\+91|0)/, "");
  if (!/^[6-9]\d{9}$/.test(localNumber)) return false;
  return !REPEATED_DIGIT_MOBILE_REGEX.test(localNumber);
}

export function getMobilePartsValidationMessage(parts: string[]): string | undefined {
  for (const raw of parts) {
    const p = raw.trim();
    if (!p) continue;
    const compact = stripMobileSeparators(p);
    if (!isValidMobileCompact(compact)) {
      return MOBILE_VALIDATION_MESSAGE;
    }
  }
  return undefined;
}

/** Validate a single-line mobile field (comma/semicolon separates multiples). */
export function getMobileInputValidationError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const parts = splitMultiValueContactParts(value);
  return getMobilePartsValidationMessage(parts.length > 0 ? parts : [value]);
}

export function getEmailPartsValidationMessage(parts: string[]): string | undefined {
  for (const raw of parts) {
    const p = raw.trim();
    if (!p) continue;
    if (!emailPartSchema.isValidSync(p) || !EMAIL_WITH_TLD_REGEX.test(p)) {
      return "Each email must be valid (e.g. name@example.com)";
    }
  }
  return undefined;
}

/** One telephone entry: digits only, length 6–15 (comma / semicolon separates multiple). */
export function getTelephonePartsValidationMessage(parts: string[]): string | undefined {
  for (const raw of parts) {
    const p = raw.trim();
    if (!p) continue;
    const digits = p.replace(/\D/g, "");
    if (digits.length >= 6 && digits.length <= 15) continue;
    return "Each telephone number must be 6–15 digits";
  }
  return undefined;
}

// --- Contact ---

export interface ContactFormValues {
  contactEmail: string;
  stdCode: string;
  contactNumber: string;
  faxNo: string;
  mobNo: string;
  isWebsiteAvailable: boolean;
  websiteUrl: string;
}

const singleEmailSchema = Yup.string()
  .email("Enter a valid email")
  .test(
    "email-tld",
    "Enter a valid email",
    (value) => !value?.trim() || EMAIL_WITH_TLD_REGEX.test(value.trim()),
  );

/** India pin code: exactly 6 digits when provided. */
const PIN_REGEX = /^\d{6}$/;

/** ROHINI identifiers from provider details API use a 13-digit numeric value. */
const ROHINI_IDENTIFIER_VALUE_REGEX = /^\d{13}$/;

function isValidEmailList(value: string | undefined): boolean {
  if (value == null || value.trim() === "") return true;
  const parts = value
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) return true;
  return parts.every((p) => singleEmailSchema.isValidSync(p));
}

export const contactSchema: Yup.ObjectSchema<ContactFormValues> = Yup.object().shape({
  contactEmail: Yup.string()
    .trim()
    .test(
      "emails",
      "Enter valid email(s), separated by commas or semicolons",
      (value) => isValidEmailList(value ?? ""),
    )
    .default("")
    .defined(),
  stdCode: Yup.string().trim().default("").defined(),
  contactNumber: Yup.string()
    .trim()
    .default("")
    .defined()
    .test(
      "telephone",
      "Enter valid telephone number(s), separated by commas or semicolons",
      function (value) {
        const parent = this.parent as ContactFormValues;
        const stdCode = (parent.stdCode ?? "").trim();
        const cn = (value ?? "").trim();
        if (!stdCode && !cn) return true;
        const combined = stdCode && cn ? `${stdCode}-${cn}` : stdCode || cn;
        const msg = getTelephonePartsValidationMessage(
          splitMultiValueContactParts(combined),
        );
        if (msg) return this.createError({ message: msg });
        return true;
      },
    ),
  faxNo: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("fax", "", function (value) {
      const parts = splitMultiValueContactParts(value ?? "");
      const msg = getTelephonePartsValidationMessage(parts);
      if (msg) {
        return this.createError({
          message: "Enter valid fax number(s), separated by commas or semicolons",
        });
      }
      return true;
    }),
  mobNo: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("mob", "", function (value) {
      const parts = splitMultiValueContactParts(value ?? "");
      const msg = getMobilePartsValidationMessage(parts);
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  isWebsiteAvailable: Yup.boolean().default(false).defined(),
  websiteUrl: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("website-url", "", function (value) {
      const avail = this.parent.isWebsiteAvailable;
      if (!avail) return true;
      const s = (value ?? "").trim();
      if (!s) {
        return this.createError({
          message: "Enter website URL when website is available",
        });
      }
      if (!Yup.string().url("Enter a valid URL").isValidSync(s)) {
        return this.createError({ message: "Enter a valid URL" });
      }
      return true;
    }),
});

// --- Add contact person ---

export interface AddContactPersonFormValues {
  providerContactPersonRole: string;
  providerContactPersonRoleId: string;
  providerContactPersonFullName: string;
  providerContactPersonDesignation: string;
  providerContactPersonMobileNo: string;
  providerContactPersonTelephoneNo: string;
  providerContactPersonEmailId: string;
}

export const addContactPersonSchema: Yup.ObjectSchema<AddContactPersonFormValues> = Yup.object({
  providerContactPersonRole: Yup.string().trim().required("Please select role"),
  providerContactPersonRoleId: Yup.string().trim().default("").defined(),
  providerContactPersonFullName: Yup.string()
    .trim()
    .required("Please enter name")
    .test("contact-person-name", function (value) {
      const v = value ?? "";
      if (/\d/.test(v)) {
        return this.createError({ message: CONTACT_PERSON_NAME_NUMBER_ERROR });
      }
      if (!ALPHABET_ONLY_PATTERN.test(v)) {
        return this.createError({ message: ALPHABET_ONLY_VALIDATION_MESSAGE });
      }
      return true;
    }),
  providerContactPersonDesignation: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("contact-person-designation", function (value) {
      const v = value?.trim() ?? "";
      if (!v) return true;
      if (/\d/.test(v)) {
        return this.createError({ message: CONTACT_PERSON_DESIGNATION_NUMBER_ERROR });
      }
      if (!ALPHABET_ONLY_PATTERN.test(v)) {
        return this.createError({ message: ALPHABET_ONLY_VALIDATION_MESSAGE });
      }
      return true;
    }),
  providerContactPersonMobileNo: Yup.string()
    .trim()
    .required("Please enter mobile no")
    .test("mobile-parts", "", function (value) {
      const parts = splitMultiValueContactParts(value ?? "");
      if (parts.length === 0 || parts.every((p) => !p.trim())) {
        return this.createError({ message: "Please enter mobile no" });
      }
      const msg = getMobilePartsValidationMessage(parts);
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  providerContactPersonTelephoneNo: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("telephone-parts", "", function (value) {
      const parts = splitMultiValueContactParts(value ?? "");
      if (parts.length === 0 || parts.every((p) => !p.trim())) return true;
      const msg = getTelephonePartsValidationMessage(parts);
      if (msg) return this.createError({ message: msg });
      return true;
    }),
  providerContactPersonEmailId: Yup.string()
    .trim()
    .required("Please enter email")
    .test("email-parts", "", function (value) {
      const parts = splitMultiValueContactParts(value ?? "");
      if (parts.length === 0 || parts.every((p) => !p.trim())) {
        return this.createError({ message: "Please enter email" });
      }
      const msg = getEmailPartsValidationMessage(parts);
      if (msg) return this.createError({ message: msg });
      return true;
    }),
});

// --- General info ---

export interface GeneralInfoFormValues {
  providerName: string;
  providerCode: string;
  providerIibRohiniCode: string;
  /** Legacy provider codes from API (`providerOldCode` JSON); edit toggles `active` only. */
  providerOldCodes: { code: string; active: boolean }[];
  providerRegistrationNo: string;
  providerRegistrationAuthority: string;
  providerOwnershipType: string;
  providerDayCareFlag: boolean;
  providerCareTier: string;
  providerInternalGrade: string;
  category: string;
  providerOwnerName: string;
  providerOwnerDesignation: string;
  providerSignatoryName: string;
  providerSignatoryDesignation: string;
  providerType: string;
  providerClass: string;
  providerSubclass: string;
  providerSystemOfMedicineId: string;
  tpaServicingBranchName: string;
  tpaServicingBranchEmail: string;
  clinicalSpecialties: string[];
  providerAddress: string;
  providerCity: string;
  providerDistrict: string;
  providerStateName: string;
  providerZone: string;
  providerPostalCode: string;
  providerLocationType: string;
}

export const generalInfoSchema: Yup.ObjectSchema<GeneralInfoFormValues> = Yup.object().shape({
  providerName: Yup.string().trim().notRequired(),
  providerCode: Yup.string().trim().notRequired(),
  providerIibRohiniCode: Yup.string().trim().notRequired(),
  providerOldCodes: Yup.array()
    .of(
      Yup.object({
        code: Yup.string().trim().notRequired(),
        active: Yup.boolean().notRequired(),
      }),
    )
    .default([]),
  providerRegistrationNo: Yup.string().trim().notRequired(),
  providerRegistrationAuthority: Yup.string().trim().notRequired(),
  providerOwnershipType: Yup.string().trim().notRequired(),
  providerDayCareFlag: Yup.boolean().notRequired(),
  providerCareTier: Yup.string().trim().notRequired(),
  providerInternalGrade: Yup.string().trim().notRequired(),
  category: Yup.string().trim().notRequired(),
  providerOwnerName: Yup.string().trim().notRequired(),
  providerOwnerDesignation: Yup.string().trim().notRequired(),
  providerSignatoryName: Yup.string().trim().notRequired(),
  providerSignatoryDesignation: Yup.string().trim().notRequired(),
  providerType: Yup.string().trim().notRequired(),
  providerClass: Yup.string().trim().notRequired(),
  providerSubclass: Yup.string().trim().notRequired(),
  providerSystemOfMedicineId: Yup.string().trim().notRequired(),
  tpaServicingBranchName: Yup.string().trim().notRequired(),
  tpaServicingBranchEmail: Yup.string()
    .trim()
    .default("")
    .defined()
    .test(
      "tpa-service-email",
      "Enter valid email(s), separated by commas or semicolons",
      (value) => isValidEmailList(value ?? ""),
    ),
  clinicalSpecialties: Yup.array().of(Yup.string().trim()).default([]),
  providerAddress: Yup.string().trim().notRequired(),
  providerCity: Yup.string().trim().notRequired(),
  providerDistrict: Yup.string().trim().notRequired(),
  providerStateName: Yup.string().trim().notRequired(),
  providerZone: Yup.string().trim().notRequired(),
  providerPostalCode: Yup.string()
    .trim()
    .default("")
    .defined()
    .test("pin-code", "Pin code must be a valid 6-digit number", (value) => {
      const pin = (value ?? "").trim();
      if (!pin) return true;
      return PIN_REGEX.test(pin);
    }),
  providerLocationType: Yup.string().trim().notRequired(),
});

// --- Bank ---

/** IFSC: 4 letters, literal 0, 6 alphanumeric (often shown uppercase). */
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** PAN: 5 letters + 4 digits + 1 letter. */
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;

/** TAN: 4 letters + 5 digits + 1 letter. */
const TAN_REGEX = /^[A-Z]{4}\d{5}[A-Z]$/;

function optionalUpperTrim(value: string | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export type BankFormValues = Record<BankFormApiFields, string>;

export const bankSchema = Yup.object().shape({
  providerAccountType: Yup.string().trim().required("Account Type is required"),
  providerBankAccountBeneficiaryType: Yup.string().trim().notRequired(),
  providerBankName: Yup.string().trim().required("Bank Name is required"),
  providerBankBranch: Yup.string().trim().required("Bank Branch is required"),
  providerBankIfscCode: Yup.string()
    .trim()
    .required("IFSC Code is required")
    .test(
      "ifsc-format",
      "Enter a valid 11-character IFSC (e.g. SBIN0000904)",
      (value) => IFSC_REGEX.test(optionalUpperTrim(value)),
    ),
  providerBankMicrCode: Yup.string()
    .trim()
    .required("MICR Code is required")
    .test("micr-format", "MICR must be exactly 9 digits", (value) =>
      /^\d{9}$/.test((value ?? "").trim()),
    ),
  providerBankHolderName: Yup.string()
    .trim()
    .required("Account Holder Name is required")
    .when("providerBankAccountBeneficiaryType", {
      is: (value: string | undefined) =>
        String(value ?? "").trim().toUpperCase() === "SELF",
      then: (schema) =>
        schema.test(
          "holder-name-alphabets",
          "Account Holder Name must contain only alphabets when Holder Type is SELF",
          (value) => {
            const trimmed = (value ?? "").trim();
            if (!trimmed) return false;
            return /^[A-Za-z\s]+$/.test(trimmed);
          },
        ),
      otherwise: (schema) => schema,
    }),
  providerBankAccountNo: Yup.string()
    .trim()
    .required("Account Number is required")
    .test(
      "account-no-spaces",
      "Account number cannot contain spaces",
      (value) => !/\s/.test(value ?? ""),
    )
    .test(
      "account-format",
      "Account number must be 6–18 digits only (e.g. 5645676), or a masked value using digits and X only (e.g. XXXX1234). Letters and other symbols are not allowed.",
      (value) => {
        const raw = (value ?? "").trim();
        if (!raw || /\s/.test(raw)) return false;
        if (/^\d{6,18}$/.test(raw)) return true;
        if (/^[\dXx*]{6,22}$/.test(raw) && /\d/.test(raw)) return true;
        return false;
      },
    ),
  providerBankAddress: Yup.string().trim().required("Bank Address is required"),
  providerPanNo: Yup.string()
    .trim()
    .required("PAN No is required")
    .test("pan-format", "Enter a valid PAN (e.g. ABCDE1234F)", (value) =>
      PAN_REGEX.test(optionalUpperTrim(value)),
    ),
  providerPanHolderName: Yup.string()
    .trim()
    .required("PAN Holder Name is required")
    .when("providerBankAccountBeneficiaryType", {
      is: (value: string | undefined) =>
        String(value ?? "").trim().toUpperCase() === "SELF",
      then: (schema) =>
        schema.test(
          "pan-holder-name-alphabets",
          "PAN Holder Name must contain only alphabets when Holder Type is SELF",
          (value) => {
            const trimmed = (value ?? "").trim();
            if (!trimmed) return false;
            return /^[A-Za-z\s]+$/.test(trimmed);
          },
        ),
      otherwise: (schema) => schema,
    }),
  providerTanNo: Yup.string()
    .trim()
    .test(
      "tan-format",
      "Enter a valid TAN (e.g. ABCD12345E)",
      (value) => {
        const v = optionalUpperTrim(value);
        if (!v) return true;
        return TAN_REGEX.test(v);
      },
    )
    .notRequired(),
});

// --- Infrastructure ---

export interface InfrastructureFormValues {
  totalBeds: string;
  icuBeds: string;
  ccuBeds: string;
  twinSharing: string;
  suite: string;
  labourRooms: string;
  majorOt: string;
  minorOt: string;
  generalBeds: string;
  singleBeds: string;
  nicuBeds: string;
}

export const infrastructureSchema = Yup.object().shape({
  totalBeds: Yup.string().trim().notRequired(),
  icuBeds: Yup.string().trim().notRequired(),
  ccuBeds: Yup.string().trim().notRequired(),
  twinSharing: Yup.string().trim().notRequired(),
  suite: Yup.string().trim().notRequired(),
  labourRooms: Yup.string().trim().notRequired(),
  majorOt: Yup.string().trim().notRequired(),
  minorOt: Yup.string().trim().notRequired(),
  generalBeds: Yup.string().trim().notRequired(),
  singleBeds: Yup.string().trim().notRequired(),
  nicuBeds: Yup.string().trim().notRequired(),
});

// --- Provider details dynamic (certificates + dynamic infrastructure) ---

export interface CertificateEditRowValues {
  certificateId?: string;
  type: string;
  status: string;
  validFrom: string;
  validTo: string;
  registrationNo: string;
  providerActName: string;
  fileMetadataId?: string;
}

export interface CertificatesEditFormValues {
  items: CertificateEditRowValues[];
}

export const VALID_FROM_MUST_BE_BEFORE_VALID_TO =
  "Valid From must be before Valid To.";

export const certificatesEditSchema = Yup.object({
  items: Yup.array().of(
    Yup.object({
      certificateId: Yup.string().trim().notRequired(),
      type: Yup.string().trim().required(),
      status: Yup.string().trim().notRequired(),
      validFrom: Yup.string()
        .trim()
        .notRequired()
        .test(
          "valid-from-before-valid-to",
          VALID_FROM_MUST_BE_BEFORE_VALID_TO,
          function (value) {
            return isProviderDateStrictlyBefore(value, this.parent.validTo);
          },
        ),
      validTo: Yup.string()
        .trim()
        .notRequired()
        .test(
          "valid-to-after-valid-from",
          VALID_FROM_MUST_BE_BEFORE_VALID_TO,
          function (value) {
            return isProviderDateStrictlyBefore(this.parent.validFrom, value);
          },
        ),
      registrationNo: Yup.string().trim().notRequired(),
      providerActName: Yup.string().trim().notRequired(),
      fileMetadataId: Yup.string().trim().notRequired(),
    }),
  ),
});

export interface DynamicInfrastructureFormValues {
  totalBeds: string;
  roomRows: Array<{ bedTypeName: string; bedCount: string }>;
}

export const dynamicInfrastructureSchema = Yup.object({
  totalBeds: Yup.string().trim().notRequired(),
  roomRows: Yup.array().of(
    Yup.object({
      bedTypeName: Yup.string().trim().notRequired(),
      bedCount: Yup.string().trim().notRequired(),
    }),
  ),
});

// --- Provider identifiers ---

export type IdentifierFormRow = {
  providerIdentifierId: string;
  identifierTypeName: string;
  identifierValue: string;
  identifierStatus: string;
  validFrom: string;
  validTo: string;
  identifierHolderName: string;
  issuingAuthorityName: string;
  issueDate: string;
  verificationReferenceNo: string;
  sourceSystem: string;
};

export type IdentifiersEditFormValues = {
  items: IdentifierFormRow[];
};

export const identifiersEditSchema = Yup.object({
  items: Yup.array().of(
    Yup.object({
      providerIdentifierId: Yup.string().trim().notRequired(),
      identifierTypeName: Yup.string().trim().required(),
      identifierValue: Yup.string()
        .trim()
        .required("Value is required")
        .test("identifier-value", "", function (value) {
          const typeName = String(
            (this.parent as IdentifierFormRow).identifierTypeName ?? "",
          ).trim();
          const identifierValue = (value ?? "").trim();
          if (!identifierValue) return true;

          if (isProviderRohiniIdentifierType(typeName)) {
            if (!ROHINI_IDENTIFIER_VALUE_REGEX.test(identifierValue)) {
              return this.createError({
                message: "Enter a valid 13-digit ROHINI number",
              });
            }
          }

          return true;
        }),
      identifierStatus: Yup.string().trim().notRequired(),
      validFrom: Yup.string().trim().notRequired(),
      validTo: Yup.string().trim().notRequired(),
      identifierHolderName: Yup.string().trim().notRequired(),
      issuingAuthorityName: Yup.string().trim().notRequired(),
      issueDate: Yup.string().trim().notRequired(),
      verificationReferenceNo: Yup.string().trim().notRequired(),
      sourceSystem: Yup.string().trim().notRequired(),
    }),
  ),
});

export const IDENTIFIERS_EDIT_DEFAULT_VALUES: IdentifiersEditFormValues = {
  items: [],
};
