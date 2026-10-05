import type { ProviderInwardRow } from "../../../dashboard/inward/providerInwardTypes";
import {
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
  EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
  isExcludedProviderListingType,
  type ExcludedProviderListingType,
} from "../config";

export const PROVIDER_DASHBOARD_PATH = "/provider-masters/dashboard";

export function buildProviderExclusionInwardPath(
  inwardNo: string,
  options?: {
    status?: string;
    documentType?: string;
    sourceEntity?: string;
    view?: "form" | "summary";
  },
): string {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.documentType) params.set("documentType", options.documentType);
  if (options?.sourceEntity) params.set("sourceEntity", options.sourceEntity);
  if (options?.view) params.set("view", options.view);
  const query = params.toString();
  return `/provider-masters/dashboard/inward/${encodeURIComponent(inwardNo.trim())}${
    query ? `?${query}` : ""
  }`;
}

export function resolveListingTypeFromDocumentType(
  documentType: string | null | undefined,
): ExcludedProviderListingType {
  const value = String(documentType ?? "").trim();
  if (value === EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST) {
    return EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST;
  }
  return EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION;
}

export function shouldOpenProviderExclusionInward(
  documentType: string | null | undefined,
): boolean {
  return isExcludedProviderListingType(String(documentType ?? "").trim());
}

export type ProviderExclusionInwardNavState = {
  row?: ProviderInwardRow;
};
