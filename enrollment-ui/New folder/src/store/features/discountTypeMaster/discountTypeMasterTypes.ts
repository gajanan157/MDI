export type DiscountTypeCategory = "IPD" | "OPD" | "";

export type DiscountTypeMasterRecordStatus = "ACTIVE" | "INACTIVE";

/** Normalized row from GET `/v1/provider/discount-type-master`. */
export type DiscountTypeMasterRecord = {
  id: string;
  code: string;
  name: string;
  /** Picker value: mapped known id, else code, else id. */
  value: string;
  category: DiscountTypeCategory;
  recordStatus: DiscountTypeMasterRecordStatus;
};

export type DiscountTypeMasterResponse = {
  status?: string;
  message?: string;
  statusCode?: number;
  data?: unknown;
};

export type FetchDiscountTypeMasterParams = {
  download?: boolean;
  page?: number;
  size?: number;
  providerServiceType?: DiscountTypeCategory;
};
