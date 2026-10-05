export type InfrastructureOperationalStatus =
  | "Active"
  | "Inactive"
  | "Under Maintenance"
  | "";

export type InfrastructureApiItem = {
  infraCategory: string;
  infraType: string;
  availabilityFlag: boolean | null;
  totalCount: number | null;
  operationalStatus: string | null;
  remarks: string | null;
  verifiedFlag: boolean | null;
  verifiedBy: string | null;
  verifiedOn: string | null;
};

export type NormalizedInfrastructureCategoryItem = {
  infraCategory: string;
  infraType: string;
  description: string;
  availabilityFlag: boolean;
  totalCount: number | null;
  operationalStatus: InfrastructureOperationalStatus;
  remarks: string;
  verifiedFlag: boolean;
  verifiedBy: string;
  verifiedOn: string;
  /** True when values came from API; false when seeded from the master list. */
  fromApi: boolean;
};

export type InfrastructureCategoryGroup = {
  categoryId: string;
  categoryName: string;
  items: NormalizedInfrastructureCategoryItem[];
};

export type InfrastructureCategoryFormValues = {
  items: NormalizedInfrastructureCategoryItem[];
};
