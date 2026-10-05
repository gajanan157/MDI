import facilityMaster from "./facility-master.json";

export type FacilityMasterType = { name: string; description: string };
export type FacilityMasterCategory = {
  id: string;
  name: string;
  types: FacilityMasterType[];
};

export const FACILITY_CATEGORY_MASTER = facilityMaster as FacilityMasterCategory[];

export const SERVICE_MODE_OPTIONS = ["In-house", "Outsourced"] as const;

export const FACILITY_OPERATIONAL_STATUS_OPTIONS = [
  "Active",
  "Inactive",
  "Temporarily Closed",
] as const;

/** RHF row for the facility grid. */
export type FacilityFormRow = {
  rowKey: string;
  providerFacilityDetailId: string | null;
  facilityCategory: string;
  facilityType: string;
  description: string;
  availabilityFlag: boolean;
  serviceMode: string;
  outsourcedVendor: string;
  twentyFourBySevenFlag: boolean;
  emergencySupportFlag: boolean;
  operationalStatus: string;
  registrationRequiredFlag: boolean;
  registrationNumber: string;
  validFrom: string;
  validUpto: string;
  remarks: string;
  isActive: boolean;
  /** True when the row came from the API. */
  fromApi: boolean;
};

export function facilityRowKey(category: string, type: string): string {
  return `${category.trim().toLowerCase()}::${type.trim().toLowerCase()}`;
}

export function facilityCategoryOptions(): { value: string; label: string }[] {
  return FACILITY_CATEGORY_MASTER.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

/** Facility types under a category that are not already in the grid. */
export function availableFacilityTypes(
  categoryId: string,
  existingKeys: Set<string>,
): { value: string; label: string }[] {
  const category = FACILITY_CATEGORY_MASTER.find((entry) => entry.id === categoryId);
  if (!category) return [];
  return category.types
    .filter(
      (type) => !existingKeys.has(facilityRowKey(category.name, type.name)),
    )
    .map((type) => ({ value: type.name, label: type.name }));
}

export function facilityTypeDescription(category: string, type: string): string {
  const masterCategory = FACILITY_CATEGORY_MASTER.find(
    (entry) => entry.name.trim().toLowerCase() === category.trim().toLowerCase(),
  );
  return (
    masterCategory?.types.find(
      (entry) => entry.name.trim().toLowerCase() === type.trim().toLowerCase(),
    )?.description ?? ""
  );
}

export function facilityCategoryNameById(categoryId: string): string {
  return FACILITY_CATEGORY_MASTER.find((entry) => entry.id === categoryId)?.name ?? "";
}
