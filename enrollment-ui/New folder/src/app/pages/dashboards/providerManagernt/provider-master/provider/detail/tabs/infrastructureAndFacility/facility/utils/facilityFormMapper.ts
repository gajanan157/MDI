import type {
  ProviderFacility,
  ProviderFacilityPatchPayload,
  ProviderFacilityRow,
} from "@/store/features/providerFacility/providerFacilityTypes";
import {
  facilityRowKey,
  facilityTypeDescription,
  type FacilityFormRow,
} from "./facilityTypes";

function rowFromApi(row: ProviderFacilityRow): FacilityFormRow {
  return {
    rowKey: facilityRowKey(row.facilityCategory, row.facilityType),
    providerFacilityDetailId: row.providerFacilityDetailId ?? null,
    facilityCategory: row.facilityCategory,
    facilityType: row.facilityType,
    description: facilityTypeDescription(row.facilityCategory, row.facilityType),
    availabilityFlag: row.availabilityFlag,
    serviceMode: row.serviceMode,
    outsourcedVendor: row.outsourcedVendor,
    twentyFourBySevenFlag: row.twentyFourBySevenFlag,
    emergencySupportFlag: row.emergencySupportFlag,
    operationalStatus: row.operationalStatus,
    registrationRequiredFlag: row.registrationRequiredFlag,
    registrationNumber: row.registrationNumber,
    validFrom: row.validFrom,
    validUpto: row.validUpto,
    remarks: row.remarks,
    isActive: row.isActive,
    fromApi: true,
  };
}

/** Demo rows shown until the facility API is live. */
const DUMMY_FACILITY: Partial<ProviderFacilityRow>[] = [
  {
    facilityCategory: "Diagnostic Services",
    facilityType: "Radiology / Imaging",
    availabilityFlag: true,
    serviceMode: "In-house",
    twentyFourBySevenFlag: true,
    emergencySupportFlag: true,
    operationalStatus: "Active",
  },
  {
    facilityCategory: "Diagnostic Services",
    facilityType: "Ultrasound",
    availabilityFlag: true,
    serviceMode: "In-house",
    operationalStatus: "Active",
  },
  {
    facilityCategory: "Laboratory Services",
    facilityType: "Clinical Pathology",
    availabilityFlag: true,
    serviceMode: "In-house",
    twentyFourBySevenFlag: true,
    emergencySupportFlag: true,
    operationalStatus: "Active",
    registrationRequiredFlag: true,
    registrationNumber: "LAB/MH/2024/00918",
    validFrom: "2024-04-01",
    validUpto: "2027-03-31",
  },
  {
    facilityCategory: "Laboratory Services",
    facilityType: "Histopathology",
    availabilityFlag: true,
    serviceMode: "Outsourced",
    outsourcedVendor: "Metropolis Healthcare Ltd.",
    operationalStatus: "Active",
  },
  {
    facilityCategory: "Pharmacy Services",
    facilityType: "24x7 Pharmacy",
    availabilityFlag: true,
    serviceMode: "In-house",
    twentyFourBySevenFlag: true,
    operationalStatus: "Active",
    registrationRequiredFlag: true,
    registrationNumber: "DL/PH/20B-21B/4471",
    validFrom: "2023-06-15",
    validUpto: "2028-06-14",
  },
  {
    facilityCategory: "Blood Bank Services",
    facilityType: "Blood Storage Centre",
    availabilityFlag: true,
    serviceMode: "In-house",
    emergencySupportFlag: true,
    operationalStatus: "Active",
    registrationRequiredFlag: true,
    registrationNumber: "BB/STG/2022/0071",
    validFrom: "2022-01-01",
    validUpto: "2026-12-31",
  },
  {
    facilityCategory: "Emergency & Transport",
    facilityType: "Ambulance - ALS",
    availabilityFlag: true,
    serviceMode: "Outsourced",
    outsourcedVendor: "Ziqitza Health Care Ltd.",
    twentyFourBySevenFlag: true,
    emergencySupportFlag: true,
    operationalStatus: "Active",
  },
  {
    facilityCategory: "Therapy & Rehabilitation",
    facilityType: "Dialysis",
    availabilityFlag: true,
    serviceMode: "In-house",
    operationalStatus: "Active",
  },
  {
    facilityCategory: "Support Services",
    facilityType: "Biomedical Waste Management",
    availabilityFlag: true,
    serviceMode: "Outsourced",
    outsourcedVendor: "Enviro Waste Management",
    operationalStatus: "Active",
    registrationRequiredFlag: true,
    registrationNumber: "BMW/AUTH/2023/2210",
    validFrom: "2023-04-01",
    validUpto: "2026-03-31",
  },
  {
    facilityCategory: "Support Services",
    facilityType: "CSSD",
    availabilityFlag: true,
    serviceMode: "In-house",
    operationalStatus: "Temporarily Closed",
    remarks: "Under equipment upgrade",
  },
];

function dummyFacilityFormRows(): FacilityFormRow[] {
  return DUMMY_FACILITY.map((partial) =>
    rowFromApi({
      providerFacilityDetailId: null,
      facilityCategory: "",
      facilityType: "",
      availabilityFlag: false,
      serviceMode: "In-house",
      outsourcedVendor: "",
      twentyFourBySevenFlag: false,
      emergencySupportFlag: false,
      operationalStatus: "Active",
      registrationRequiredFlag: false,
      registrationNumber: "",
      validFrom: "",
      validUpto: "",
      remarks: "",
      isActive: true,
      ...partial,
    }),
  ).map((row) => ({ ...row, fromApi: false }));
}

/** API rows → RHF form rows. Falls back to demo rows when the API has none. */
export function facilityFormRowsFromApi(
  facility: ProviderFacility | null | undefined,
): FacilityFormRow[] {
  const apiRows = (facility?.facilityList ?? []).map(rowFromApi);
  return apiRows.length > 0 ? apiRows : dummyFacilityFormRows();
}

export function createEmptyFacilityFormRow(
  facilityCategory: string,
  facilityType: string,
): FacilityFormRow {
  return {
    rowKey: facilityRowKey(facilityCategory, facilityType),
    providerFacilityDetailId: null,
    facilityCategory,
    facilityType,
    description: facilityTypeDescription(facilityCategory, facilityType),
    availabilityFlag: true,
    serviceMode: "In-house",
    outsourcedVendor: "",
    twentyFourBySevenFlag: false,
    emergencySupportFlag: false,
    operationalStatus: "Active",
    registrationRequiredFlag: false,
    registrationNumber: "",
    validFrom: "",
    validUpto: "",
    remarks: "",
    isActive: true,
    fromApi: false,
  };
}

function isOutsourced(row: FacilityFormRow): boolean {
  return row.serviceMode.trim().toLowerCase() === "outsourced";
}

/** RHF form rows → PATCH payload (drops incompletely-identified rows, clears inapplicable fields). */
export function facilityPatchPayloadFromForm(
  rows: FacilityFormRow[],
): ProviderFacilityPatchPayload {
  const facilityList: ProviderFacilityRow[] = rows
    .filter((row) => row.facilityCategory.trim() && row.facilityType.trim())
    .map((row) => ({
      providerFacilityDetailId: row.providerFacilityDetailId ?? null,
      facilityCategory: row.facilityCategory.trim(),
      facilityType: row.facilityType.trim(),
      availabilityFlag: row.availabilityFlag,
      serviceMode: row.serviceMode.trim(),
      outsourcedVendor: isOutsourced(row) ? row.outsourcedVendor.trim() : "",
      twentyFourBySevenFlag: row.twentyFourBySevenFlag,
      emergencySupportFlag: row.emergencySupportFlag,
      operationalStatus: row.operationalStatus.trim(),
      registrationRequiredFlag: row.registrationRequiredFlag,
      registrationNumber: row.registrationRequiredFlag
        ? row.registrationNumber.trim()
        : "",
      validFrom: row.registrationRequiredFlag ? row.validFrom.trim() : "",
      validUpto: row.registrationRequiredFlag ? row.validUpto.trim() : "",
      remarks: row.remarks.trim(),
      isActive: row.isActive,
    }));
  return { facilityList };
}

/** Row-level validation message, or null. */
export function facilityRowWarning(row: FacilityFormRow): string | null {
  if (isOutsourced(row) && !row.outsourcedVendor.trim()) {
    return "Outsourced vendor is required for an outsourced service";
  }
  if (row.registrationRequiredFlag && !row.registrationNumber.trim()) {
    return "Registration number is required";
  }
  return null;
}

export function facilityFieldEditable(
  field: keyof FacilityFormRow,
  row: FacilityFormRow,
): boolean {
  if (field === "outsourcedVendor") return isOutsourced(row);
  if (
    field === "registrationNumber" ||
    field === "validFrom" ||
    field === "validUpto"
  ) {
    return row.registrationRequiredFlag;
  }
  return true;
}
