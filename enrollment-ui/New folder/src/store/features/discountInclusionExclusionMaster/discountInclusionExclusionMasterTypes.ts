export type DiscountInclusionExclusionRecordStatus = "ACTIVE" | "INACTIVE";

export type DiscountInclusionExclusionType = "INCLUSION" | "EXCLUSION" | "";

/** Normalized row from GET `/v1/provider/discount-inclusion-exclusion-master`. */
export type DiscountInclusionExclusionMasterRecord = {
  id: string;
  code: string;
  name: string;
  description: string;
  /** Present on master rows but NOT used to split UI dropdowns. */
  type: DiscountInclusionExclusionType;
  recordStatus: DiscountInclusionExclusionRecordStatus;
};

export type DiscountInclusionExclusionMasterResponse = {
  status?: string;
  message?: string;
  statusCode?: number;
  data?: unknown;
};

export type FetchDiscountInclusionExclusionMasterParams = {
  providerInclusionExclusionCode?: string;
  providerInclusionExclusionType?: string;
  providerInclusionExclusionName?: string;
  isActive?: string;
  recordStatus?: string;
  download?: boolean;
  page?: number;
  size?: number;
};

/** Payload item derived from UI selection location (not master type). */
export type DiscountInclusionExclusionSaveItem = {
  providerInclusionExclusionCode: string;
  providerInclusionExclusionType: "INCLUSION" | "EXCLUSION";
  providerInclusionExclusionMasterId?: string;
  providerInclusionExclusionName?: string;
};
