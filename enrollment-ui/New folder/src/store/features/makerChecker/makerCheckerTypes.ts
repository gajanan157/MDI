export interface MakerChecker {
  id: string;
  requestId: string;
  requestType: string;
  corporateName: string;
  policyNumber: string;
  policyNo?: string;
  uinNo?: string;
  insurerName?: string;
  productName?: string;
  policyName?: string;
  priority?: string;
  status: string;
  createdDate: string;
  createdBy: string;
  data?: any; // Form data structure
  comments?: Record<string, any[]>;
  statusMetadata?: Record<string, string | null>;
  [key: string]: any; // For dynamic fields
}

export interface MakerCheckerPagination {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  recordPerPage: number;
}

export interface MakerCheckerResponse {
  statusCode: number;
  status: string;
  message: string;
  pagination?: MakerCheckerPagination;
  data: MakerChecker[];
}

export interface FetchMakerCheckersParams {
  page?: number;
  size?: number;
  queryObj?: Record<string, any>; // Search parameters
}

export interface FetchMakerCheckerByIdParams {
  id: string;
}

export interface ApplyChangesParams {
  id: string;
  requestId: string;
  data: Record<string, any>; // Updated form data (includes comments under data object)
  files?: File[]; // Optional files to upload
}

/**
 * Approval action types
 */
export type ApprovalActionType = 
  | "reversetomaker1"
  | "approvebymaker1"
  | "approvebymaker2"
  | "approvebychecker";

export interface ApprovalActionParams {
  requestId: string;
  action: ApprovalActionType;
  role?: string;
  userId?: string;
  userName?: string; // User name from Keycloak token
}

export interface ApplyChangesResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: MakerChecker;
}

export interface ApprovalResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: MakerChecker;
}

/**
 * Chat message types
 */
export interface ChatMessage {
  id?: string;
  remark: string;
  createdBy: string;
  branch: string;
  createdAt: string;
}

export interface SendChatMessageParams {
  requestId: string;
  message: string;
  userId?: string;
  userName?: string;
}

export interface ChatMessageResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: ChatMessage;
}

