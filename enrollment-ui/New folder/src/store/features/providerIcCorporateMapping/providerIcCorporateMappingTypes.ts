import type { IcWiseGridRow } from "@/app/pages/dashboards/providerManagernt/provider-master/ic-corporate-mapping/types";
import type { NormalizedProviderNetworkMapping } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/network";
import type { NormalizedProviderRestriction } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/restriction";

export type ProviderMappingType = "INSURER" | "CORPORATE";

export const PROVIDER_MAPPING_TYPE_INSURER: ProviderMappingType = "INSURER";
export const PROVIDER_MAPPING_TYPE_CORPORATE: ProviderMappingType = "CORPORATE";

export type FetchProviderNetworkMappingResult =
  | { ok: true; rows: NormalizedProviderNetworkMapping[]; totalRecords: number }
  | { ok: false; message?: string };

export type FetchProviderNetworkMappingByIdResult =
  | { ok: true; row: NormalizedProviderNetworkMapping }
  | { ok: false; message?: string };

/** Search filters use the same field names as the GET response contract. */
export type ProviderNetworkMappingSearchFilters = {
  insurerId?: string;
  insurerProviderCode?: string;
  /** API casing: "Pending" | "Matched" | "Mismatch". */
  providerBankMatchWithIC?: string;
  /** IC tab → INSURER, Corporate tab → CORPORATE. */
  providerMappingType?: ProviderMappingType;
  /** 1-based page sent to API as `page` (first page = 1). */
  page?: number;
  size?: number;
};

/** Request body for `POST /v1/provider/{providerId}/network-mapping` (Insurance Company tab). */
export type CreateInsurerNetworkMappingBody = {
  providerId: string;
  insurerId: string | null;
  providerMappingType: "INSURER";
  providerNetworkSource: string;
  providerNetworkEffectiveFrom: string;
  providerNetworkEffectiveTo: string | null;
  insurerProviderCode: string | null;
  identifierTypeCode: string;
  remark: string | null;
  inwardNo: string | null;
  supportingFileMetadataId: string | null;
};

/** Request body for `POST /v1/provider/{providerId}/network-mapping` (Corporate tab). */
export type CreateCorporateNetworkMappingBody = {
  providerId: string;
  insurerId: string | null;
  providerMappingType: "CORPORATE";
  corporateIds: string[];
  providerNetworkSource: string;
  providerNetworkEffectiveFrom: string;
  providerNetworkEffectiveTo: string | null;
  insurerProviderCode: string | null;
  identifierTypeCode: string;
  remark: string | null;
  inwardNo: string | null;
  supportingFileMetadataId: string | null;
};

export type CreateProviderNetworkMappingBody =
  | CreateInsurerNetworkMappingBody
  | CreateCorporateNetworkMappingBody;

export type CreateProviderNetworkMappingResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

/** Request body for `PATCH /v1/provider/{providerId}/network-mapping` (update or unmap). */
export type PatchProviderNetworkMappingBody = {
  providerNetworkMappingId: string;
  providerNetworkIsActive?: boolean;
  providerMappingType?: ProviderMappingType;
  insurerId?: string | null;
  corporateIds?: string[];
  providerNetworkSource?: string;
  providerNetworkEffectiveFrom?: string | null;
  providerNetworkEffectiveTo?: string | null;
  insurerProviderCode?: string | null;
  identifierTypeCode?: string;
  remark?: string | null;
  supportingFileMetadataId?: string | null;
  inwardNo?: string | null;
  providerRestrictionId?: string | null;
  providerRestrictionApplicableFor?: string | null;
};

export type PatchProviderNetworkMappingResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

/** Request body for `POST /v1/provider-restriction`. */
export type CreateProviderRestrictionBody = {
  providerId: string;
  insurerId: string;
  providerRestrictionType?: string;
  providerRestrictionApplicableFor: string;
  providerRestrictionEffectiveFrom: string;
  providerRestrictionEffectiveTo: string | null;
  providerRestrictionLevel: string;
  providerRestrictionReasonCode: string;
  providerRestrictionReasonDescription: string;
  remark: string | null;
  emergencyExceptionAllowedFlag?: boolean;
  investigationRequiredFlag?: boolean;
  inwardNo?: string | null;
  supportingFileMetadataId?: string | null;
  corporateIds?: string[];
  policyIds?: string[];
  insurerOfficeIds?: string[];
  ccnNumbers?: string[];
};

export type CreateProviderRestrictionResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

export type PatchProviderRestrictionResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

export type InactivateProviderRestrictionBody = {
  providerRestrictionStatus: string;
};

export type InactivateProviderRestrictionResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

export type FetchProviderRestrictionResult =
  | { ok: true; row: NormalizedProviderRestriction }
  | { ok: false; message?: string };

export type FetchProviderRestrictionListResult =
  | { ok: true; rows: NormalizedProviderRestriction[]; totalRecords: number }
  | { ok: false; message?: string };

export type InsurerNetworkModeValues = {
  networkMode: string;
  tariffType: string;
};

export const EMPTY_INSURER_NETWORK_MODE_VALUES: InsurerNetworkModeValues = {
  networkMode: "",
  tariffType: "",
};

/** Filters for GET `/v1/provider/network-mapping` (IC & Corp landing grid). */
export type GlobalNetworkMappingListFilters = {
  page: number;
  size: number;
  providerName?: string;
  rohiniRegistryCode?: string;
  insurerId?: string;
};

export type FetchGlobalNetworkMappingListResult =
  | { ok: true; rows: IcWiseGridRow[]; totalRecords: number }
  | { ok: false; message?: string; status?: number };
