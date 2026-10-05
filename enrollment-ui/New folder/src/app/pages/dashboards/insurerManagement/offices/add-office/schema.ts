import { pinRegex } from "@/app/pages/AdminDepartment/tpabranches/schema";
import * as yup from "yup";

export const officeSchema = yup.object().shape({
  tenantId: yup.string().nullable(),
  icName: yup.string().required("Insurance company is required"),
  active: yup.string().nullable(),
  officeType: yup.string().required("Office type is required"),
    superiorOfficeType: yup
    .string()
    .nullable()
    .when("officeType", ([officeType], schema) =>
      officeType === "DO" || officeType === "UO"
        ? schema.required("Superior office type is required")
        : schema.nullable(),
    ),

  superiorOffice: yup
    .string()
    .nullable()
    .when("superiorOfficeType", ([value], schema) =>
      value
        ? schema.required("Superior office is required")
        : schema.nullable(),
    ),

  officeName: yup.string().required("Office Name is required"),
  officeCode: yup.string().required("Office Code is required").matches(/^[0-9]*$/, "Office Code must be numeric."),
  underwritingCenter: yup.boolean().nullable(),
  effectiveFrom: yup.date().nullable().max(yup.ref("effectiveTo"), "Start Date must be smaller than End Date"),
  effectiveTo: yup.date().nullable().min(yup.ref("effectiveFrom"), "End Date must be greater than End Date"),
  serviceTypes:yup.object(),
  address: yup.object({
    address: yup.string().trim().required("Address is required"),
    city: yup.string().trim().required("City is required"),
    stateName: yup.string().trim().required("State name is required"),
    addressType: yup.string().trim().required("Address type is required"),
    postalCode: yup.string().trim().matches(pinRegex, "Pin code must be a 6-digit number").required("Postal code is required"),
  }).required(),
  });


export type OfficeFormValues = yup.InferType<typeof officeSchema>;

export const servicingAllocationFor = [
  { label: "Corporate", value: "corporate" },
  { label: "Retail", value: "retail" },
  { label: "Both ( Corporate,Retail )", value: "both" },
  { label: "Government", value: "government" },
];

export const officeTypes = [
  { label: "HO (Head Office)", value: "HO" },
  { label: "RO (Regional Office)", value: "RO" },
  { label: "DO (Divisional Office)", value: "DO" },
  { label: "UO (Under Writting Office)", value: "UO" },
];

export const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];
