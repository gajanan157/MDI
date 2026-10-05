import * as Yup from "yup";
import {
  ApiResponse,
  corporateApi,
  patchApi,
  postApi,
} from "@/app/api/apiService";
import { pinRegex } from "@/app/pages/AdminDepartment/tpabranches/schema";

export const corporateType = [
  { "label": "Private Limited", "value": "PRIVATE LIMITED" },
  { "label": "Public Limited", "value": "PUBLIC LIMITED" },
  { "label": "Limited Liability Partnership (LLP)", "value": "LLP" },
  { "label": "Partnership", "value": "PARTNERSHIP" },
  { "label": "Proprietorship", "value": "PROPRIETORSHIP" },
  { "label": "Trust", "value": "TRUST" },
  { "label": "Society", "value": "SOCIETY" },
  { "label": "Government", "value": "GOVERNMENT" },
  { "label": "Public Sector Undertaking (PSU)", "value": "PSU" },
  { "label": "Non-Governmental Organization (NGO)", "value": "NGO" },
  { "label": "Educational Institution", "value": "EDU" },
  { "label": "Hospital", "value": "HOSPITAL" },
  { "label": "Other", "value": "OTHER" }
]
export const billingCycle = [
  { "label": "Monthly", "value": "MONTHLY" },
  { "label": "Quarterly", "value": "QUARTERLY" },
  { "label": "Annual", "value": "ANNUAL" },
  { "label": "Adhoc", "value": "ADHOC" }
]
export const riskTier = [
  { "label": "Low", "value": "LOW" },
  { "label": "Medium", "value": "MEDIUM" },
  { "label": "High", "value": "HIGH" }
]
export const tpaRelationshipType = [
  { "label": "Direct", "value": "DIRECT" },
  { "label": "Brokered", "value": "BROKERED" },
  { "label": "Mixed", "value": "MIXED" }
]
export const sizeBandOptions = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
];
export interface CorporateHr {
  corporateHrId?:  null;
  corporateHrName?: string | null;
  corporateHrContactMobile?: string | null; // comma-separated in UI
  corporateHrContactEmail?: string | null;  // comma-separated in UI
}
export interface CorporateFormValues {
  legalName: string;
  corporateType: string;
  corporateGroupId?: string | null;

  pan?: string | null;
  gstin?: string | null;
  cin?: string | null;

  corporateIndustrySectorId?: string | null;
  sizeBand?: string | null;
  employeeCount?: number | null;

  riskTier?: string | null;
  websiteUrl?: string | null;

  corporateHrs: CorporateHr[];


  effectiveFrom?: string | Date | null;
  effectiveTo?: string | Date | null;

contactEmail?: string | null;
contactPhone?: string | null;
  address?: {
    address?: string;
    city?: string;
    stateName?: string;
    postalCode?: string | null;
  } | null;
}





export const CorporateSchema = Yup.object().shape({
  legalName: Yup.string()
    .trim()
    .required("Legal name is required"),


  corporateType: Yup.string()
    .trim()
    .required("Corporate type is required"),

  pan: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .notRequired()
    .test(
      "pan-valid",
      "Enter a valid PAN",
      (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
    ),

  gstin: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .notRequired()
    .test(
      "gstin-valid",
      "Enter a valid GSTIN",
      (value) =>
        !value ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)
    ),

  cin: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .notRequired()
    .test(
      "cin-valid",
      "Enter a valid CIN",
      (value) =>
        !value ||
        /^([A-Z]{1})([0-9]{5})([A-Z]{2})([0-9]{4})([A-Z]{3})([0-9]{6})$/.test(value)
    ),

  corporateGroupId: Yup.string().trim().nullable().notRequired(),

  corporateIndustrySectorId: Yup.string().trim().nullable().notRequired(),

  sizeBand: Yup.string().trim().nullable().notRequired(),
  
  
corporateHrs: Yup.array().of(
  Yup.object({
    corporateHrName: Yup.string().trim().nullable().notRequired(),

    corporateHrContactMobile: Yup.string()
      .transform((value) => (value === "" ? undefined : value))
      .nullable()
      .notRequired()
      .test(
        "multiple-phones",
        "Enter valid phone numbers",
        (value) => {
          if (!value) return true;

          const phones = value
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);

          for (const phone of phones) {
            const digitsOnly = phone.replace(/\D/g, "");

            if (
              digitsOnly.length === 10 &&
              /^[6-9]\d{9}$/.test(digitsOnly)
            ) {
              continue;
            }

            if (/^\d{2,5}-\d{5,8}$/.test(phone)) {
              continue;
            }

            return false;
          }

          return true;
        }
      ),

    corporateHrContactEmail: Yup.string()
      .transform((value) => (value === "" ? undefined : value))
      .nullable()
      .notRequired()
      .test(
        "multiple-emails",
        "Enter valid email addresses",
        (value) => {
          if (!value) return true;

          const emails = value
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);

          return emails.every((email) =>
            Yup.string().email().isValidSync(email)
          );
        }
      ),
  })
),
  
  
  
  employeeCount: Yup.string().trim().nullable().notRequired(),
  riskTier: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "riskTier-valid",
      "riskTier must be one of the following values: LOW, MEDIUM, HIGH",
      (value) => !value || ["LOW", "MEDIUM", "HIGH"].includes(value)
    ),

  websiteUrl: Yup.string()
    .trim()
    .url("Enter a valid URL")
    .nullable()
    .notRequired(),



  effectiveFrom: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Enter a valid start date")
    .notRequired(),

  effectiveTo: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Enter a valid end date")
    .min(Yup.ref("effectiveFrom"),"Effective To date cannot be earlier than Effective From date")
    .notRequired(),

  contactEmail: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .test("multiple-emails", "Enter valid email addresses", (value) => {
      if (!value) return true;
      const emails = value
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      return emails.every((email) =>
        Yup.string().email().isValidSync(email)
      );
    }),
  contactPhone: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .test("multiple-phones", "Enter valid phone numbers", (value) => {
      if (!value) return true;

      const phones = value
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      if (phones.length === 0) return true;

      for (const phone of phones) {
        const digitsOnly = phone.replace(/\D/g, "");

        if (digitsOnly.length === 10 && /^[6-9]\d{9}$/.test(digitsOnly))
          continue;

        if (/^\d{2,5}-\d{5,8}$/.test(phone)) continue;

        return false;
      }
      return true;
    }),

  address: Yup.object({
    address: Yup.string().trim().required("Address is required"),
    city: Yup.string().trim().required("City is required"),
    stateName: Yup.string().trim().required("State name is required"),
    postalCode: Yup.string()
      .trim()
      .matches(pinRegex, "Postal code must be a valid 6-digit number")
      .required("Postal code is required"),
  }),

});
export const saveAndUpdateCorporate = async <T extends object>(
  payload: T,
  id?: string,
): Promise<ApiResponse<any>> => {
  try {
    const endpoint = id
      ? `/v1/corporates/${id}`
      : `/v1/corporates`;

    return id
      ? await patchApi<any, T>(corporateApi, endpoint, payload)
      : await postApi<any, T>(corporateApi, endpoint, payload);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};