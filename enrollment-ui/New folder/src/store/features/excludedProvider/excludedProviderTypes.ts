/**
 * Aligns with provider-management-service `Provider-Blacklist` request DTO.
 */
export type ProviderBlacklistSource = "TPA" | "INSURER" | "GLOBAL" | string;
export type ProviderMatchingStatus =
  | "MATCHED_WITH_TPA"
  | "NOT_MATCHED_WITH_TPA";

export interface ExcludedProviderQuery {
  providerName?: string;
  insurerId?: string | null;
  providerBlacklistSource?: ProviderBlacklistSource | null;
  providerMatchingStatus?: ProviderMatchingStatus;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  /** 1-based page index for Provider-Blacklist (first page = 1). */
  page: number;
  size: number;
  download?: boolean;
  /** List/export; export falls back to `createdAt` when omitted (see download-excel API). */
  sortBy?: string;
}

/** Spring-style page payload (flexible keys for varying backends). */
export interface ProviderBlacklistPageResponse {
  content?: unknown[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}
