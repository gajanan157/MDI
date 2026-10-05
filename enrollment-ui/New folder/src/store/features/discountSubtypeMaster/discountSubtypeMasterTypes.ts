export type DiscountSubtypeMasterRecordStatus = "ACTIVE" | "INACTIVE";

/** Normalized row from GET `/v1/provider/discount-subtype-master`. */
export type DiscountSubtypeMasterRecord = {
  id: string;
  code: string;
  name: string;
  /** Option value for component multi-select. */
  value: string;
  providerDiscountTypeMasterId: string;
  recordStatus: DiscountSubtypeMasterRecordStatus;
};

export type DiscountSubtypeMasterResponse = {
  status?: string;
  message?: string;
  statusCode?: number;
  data?: unknown;
};

export type FetchDiscountSubtypeMasterParams = {
  providerDiscountTypeMasterId: string;
  providerDiscountSubtypeCode?: string;
  providerDiscountSubtypeName?: string;
  isActive?: string;
  recordStatus?: string;
  download?: boolean;
  page?: number;
  size?: number;
};
