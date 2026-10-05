/** Grid row for Rohini Master (normalized for UI). */
export type ProviderRohiniRow = {
  id: string;
  providerName: string;
  providerRohiniCode: string;
  address: string;
  email: string;
  contactPerson: string;
  contactNumber: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  beds: number;
  latitude: string;
  longitude: string;
  rohiniExpiryDate: string;
  rohiniNextRenewalDate: string;
  registrationStatus?: string;
  providerStatus?: string;
  networkType?: string;
  recordStatus?: string;
};

/** Single item from provider-rohini-master list/detail APIs. */
export type RohiniApiItem = {
  providerRohiniId: string;
  providerName?: string;
  providerAddress?: string;
  rohiniCode?: string;
  providerEmailId?: string[];
  providerMobileNo?: string[];
  stateName?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  bedCount?: number;
  latitude?: number | string;
  longitude?: number | string;
  effectiveToDate?: string;
  nextRenewalDueDate?: string;
  registrationStatus?: string;
  providerStatus?: string;
  networkType?: string;
  recordStatus?: string;
};

/** Common wrapper: `{ success, pagination: { totalRecords, ... }, data: [] }` */
export type RohiniPaginationBlock = {
  totalRecords?: number;
  totalPages?: number;
  currentPage?: number;
  recordPerPage?: number;
};

/** Inward rows returned on list API under `additionalData.inwardNos` */
export type RohiniInwardNoItem = {
  inwardNo: string;
  fileMetadataId?: string;
  docUrl?: string | null;
  supportingDocUrl?: string | null;
  documentType?: string | null;
  fileName?: string | null;
  objectKey?: string | null;
  uploadedBy?: string | null;
  createdByUserName?: string | null;
  createdAt?: string | null;
};

export type RohiniApiAdditionalData = {
  inwardNos?: RohiniInwardNoItem[];
  countExpiringInDays?: number;
};

export type RohiniListApiResponse = {
  success?: boolean;
  status?: number;
  message?: string;
  pagination?: RohiniPaginationBlock;
  /** Either a plain array or a Spring Data–style page object */
  data?: RohiniApiItem[] | RohiniPageEnvelope;
  totalElements?: number;
  totalCount?: number;
  count?: number;
  additionalData?: RohiniApiAdditionalData;
};

/** Spring `Page<T>` shape often nested under `data` */
export type RohiniPageEnvelope = {
  content?: RohiniApiItem[];
  totalElements?: number;
  total?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  data?: RohiniApiItem[];
};

/** List/search filters (UI → query params). */
export type RohiniListFilters = {
  providerName?: string;
  providerRohiniCode?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  /** Matches `RecordStatusFilter`: ACTIVE | INACTIVE | ALL (omit param when ALL). */
  filterStatus?: string;
};

/** Response from validate-after-upload (normalized for UI). */
export type RohiniValidateUploadPayload = {
  alreadyExist: number;
  newAdded: number;
  message?: string;
};

export type RohiniValidateApiBody = {
  success?: boolean;
  message?: string;
  data?: {
    alreadyExist?: number;
    newAdded?: number;
    alreadyExisting?: number;
    existingCount?: number;
    newCount?: number;
    newRecords?: number;
  };
};

/** Response envelope from POST `/v1/provider-rohini-master/upload` (typical success shape). */
export type RohiniRegisterUploadApiBody = {
  success?: boolean;
  status?: number;
  message?: string;
  data?: {
    downloadUrl?: string;
    errorFileName?: string;
  };
};

export type RohiniDetailApiEnvelope = {
  success: boolean;
  status: number;
  message: string;
  data: RohiniApiItem;
};

export type ProviderRohiniState = {
  rows: ProviderRohiniRow[];
  totalItems: number;
  inwardNos: RohiniInwardNoItem[];
  countExpiringInDays: number | null;
  loading: boolean;
  exportLoading: boolean;
  validateLoading: boolean;
  error: string | null;
};
