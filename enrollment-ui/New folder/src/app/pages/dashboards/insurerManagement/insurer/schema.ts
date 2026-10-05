import { pinRegex } from "@/app/pages/AdminDepartment/tpabranches/schema";
import * as Yup from "yup";

export type DocumentType = | "PRINCIPLE_AGGREMENT"  | "ADDENDUM" | "RENEWAL" | "OTHERS";

export interface InsurerFormValues {
  panCard?: string;
  officeCode?: string;
  insOfficeName?: string;
  insurerType?: string;
  irdaiInsurerCode?: string;
  insurerCode?: string;
  gstin?: string;
  email?: string | undefined;
  phone?: string | null;
  uploadDocument?: DocumentType;
  documentDates: {
    PRINCIPAL_AGGREMENT: {
      startDate: string;
      endDate: string;
      signedByTPA?: boolean;
      signedByInsurer?: boolean;
      effectivePeriod?: number;
    };
    ADDENDUM: {
      startDate: string;
      endDate: string;
      signedByTPA?: boolean;
      signedByInsurer?: boolean;
      effectivePeriod?: number;
    };
    RENEWAL: {
      startDate: string;
      endDate: string;
      signedByTPA?: boolean;
      signedByInsurer?: boolean;
      effectivePeriod?: number;
    };
    OTHERS: {
      startDate: string;
      endDate: string;
      effectivePeriod?: number;
      signedByTPA?: boolean;
      signedByInsurer?: boolean;
    };
  };

  documentStartDate?: string;
  documentEndDate?: string;
  signedByTPA?: boolean;
  effectivePeriod?: number;
  signedByInsurer?: boolean;

  address?: {
    address?: string | null;
    city?: string | null;
    stateName?: string | null;
    addressType?: string | null;
    postalCode?: string | null;
  };
}

// export const insurerSchema = Yup.object().shape({
export const insurerSchema= (isEdit:boolean)=> Yup.object().shape({
  email: Yup.string().trim().email("Enter a valid email").notRequired(),
  phone: Yup.string()
  .trim()
  .nullable()
  .matches(
    /^(\d{10}|\d{12}|\d{3}-\d{8}|\d{3}\d{8})$/,
    {
      message:
        "Enter valid phone number (10/12 digit mobile or landline like 022-62799505)",
      excludeEmptyString: true,
    }
  )
  .notRequired(),

  gst: Yup.string()
    .trim()
    .matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, {
      message: "Enter a valid GST number",
      excludeEmptyString: true,
    })
    .notRequired(),
  panCard: Yup.string()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, {
      message: "Enter a valid PAN number (e.g., ABCDE1234F)",
      excludeEmptyString: true,
    })
    .notRequired(),
  insurerCode: Yup.string().trim().notRequired(), 
  irdaiInsurerCode: Yup.string().trim().required("IRDAI Code is required"),
  insOfficeName: Yup.string().trim().required("Legal Name is required"),
  insurerType: Yup.string().required("Insurer Type is required"),
      officeCode: isEdit
      ? Yup.string().notRequired()
       :Yup.string().required("Office Code is required").matches(/^[0-9]*$/, "Office Code must be numeric."),
      

  uploadDocument: Yup.string().nonNullable(),
  address: Yup.object({
      address: Yup.string().trim().required("Address is required"),
      city: Yup.string().trim().required("City is required"),
      stateName: Yup.string().trim().required("State name is required"),
      postalCode: Yup.string().trim().matches(pinRegex, "Pin code must be a 6-digit number").required("Postal code is required"),
    }).required(),
});
