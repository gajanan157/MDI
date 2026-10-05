export interface MasterProduct {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  insurer: string;
  status: string;
  createdDate: string;
  createdBy: string;
  data?: any; // Form data structure
  [key: string]: any; // For dynamic fields
}

export interface MasterProductPagination {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  recordPerPage: number;
}

export interface MasterProductResponse {
  statusCode: number;
  status: string;
  message: string;
  pagination: MasterProductPagination;
  data: MasterProduct[];
}

export interface FetchMasterProductsParams {
  page?: number;
  size?: number;
  queryObj?: Record<string, any>; // Search parameters
}

export interface FetchMasterProductByIdParams {
  id: string;
}

export interface ApplyChangesParams {
  id: string;
  masterProductJson?: Record<string, any>; // Updated form data
  documents?: File | File[];
  documentType?: string;
}

export interface ApproveProductParams {
  id: string;
  productId?: string;
}

export interface ApplyChangesResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: MasterProduct;
}

export interface ApproveProductResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: MasterProduct;
}

export interface MasterProductDocument {
  id: string;
  name: string;
  url: string;
  fileSize?: number;
  documentType?: string;
  uploadedAt?: string;
}

export interface FetchMasterProductDocumentsParams {
  id: string;
}

export interface CreateMasterProductParams {
  uin: string;
  insurerId: string;
  productName: string;
  file?: File;
}

export interface CreateMasterProductResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: MasterProduct;
}

/** Passed to `rejectWithValue` when create fails (e.g. 409 + `error.fields`). */
export interface CreateMasterProductRejectValue {
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}

export interface FetchMasterProductDocumentsResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: MasterProductDocument[];
}

/** Remark (chat message) for Master Product */
export interface MasterProductRemark {
  id?: string | number;
  remark?: string;
  message?: string;
  createdBy?: string;
  userName?: string;
  branch?: string;
  createdAt?: string;
  date?: string;
}

export interface FetchMasterProductRemarksParams {
  id: string;
}

export interface SendMasterProductRemarkParams {
  id: string;
  message: string;
  userId?: string;
  userName?: string;
}

export interface MasterProductRemarksResponse {
  statusCode?: number;
  status?: string;
  message?: string;
  data?: MasterProductRemark | MasterProductRemark[];
  pagination?: {
    totalRecords?: number;
    totalPages?: number;
    currentPage?: number;
    recordPerPage?: number;
    size?: number; // alternative to recordPerPage (e.g. Spring Pageable)
  };
}