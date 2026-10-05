/** API / form field keys for provider infrastructure category items. */
export const INFRASTRUCTURE_CATEGORY_ITEM_KEYS = {
  infraCategory: "infraCategory",
  infraType: "infraType",
  availabilityFlag: "availabilityFlag",
  totalCount: "totalCount",
  operationalStatus: "operationalStatus",
  remarks: "remarks",
  verifiedFlag: "verifiedFlag",
  verifiedBy: "verifiedBy",
  verifiedOn: "verifiedOn",
} as const;

export const INFRASTRUCTURE_OPERATIONAL_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Under Maintenance", label: "Under Maintenance" },
] as const;
