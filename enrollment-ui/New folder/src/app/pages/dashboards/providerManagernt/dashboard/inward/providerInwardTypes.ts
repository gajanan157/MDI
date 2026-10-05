export type ProviderInwardCardKey =
  | "TOTAL"
  | "TODAY"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED";

export type ProviderInwardApiStatus =
  | "PROCESSOR_PENDING"
  | "QC_PENDING"
  | "COMPLETED"
  | "REJECTED_INWARD";

export type ProviderInwardRow = {
  id: string;
  inwardNo: string;
  createdDate: string;
  sourceEntity: string;
  /** API `inwardSourceEntityId` — insurer/corporate id when present. */
  sourceEntityId: string;
  sourceEntityType: string;
  category: string;
  subcategory: string;
  documentType: string;
  status: ProviderInwardApiStatus;
  statusLabel: string;
  assignedTo: string;
  createdBy: string;
  s3BucketName: string;
  s3SubBucketName: string;
  departmentId: string;
};

export type ProviderInwardStatusCounts = Record<ProviderInwardCardKey, number>;

export type ProviderInwardTodayBreakup = {
  pending: number;
  processing: number;
  completed: number;
  rejected: number;
};

export type ProviderInwardSearchFilters = {
  query: string;
  inwardNo: string;
  sourceEntity: string;
  fromDate: string;
  toDate: string;
};
