/** Exact field names from GET `/v1/provider/soc`. */
export const PROVIDER_SOC_KEYS = {
  providerSocId: "providerSocId",
  providerId: "providerId",
  providerSocName: "providerSocName",
  providerSocVersion: "providerSocVersion",
  providerSocCode: "providerSocCode",
  providerSocEffectiveFrom: "providerSocEffectiveFrom",
  providerSocEffectiveTo: "providerSocEffectiveTo",
  isActive: "isActive",
  recordStatus: "recordStatus",
  providerAgreementId: "providerAgreementId",
  providerAgreementName: "providerAgreementName",
  fileMetadataId: "fileMetadataId",
  supportingFileMetadataId: "supportingFileMetadataId",
} as const;

export const PROVIDER_SOC_LIST_FILTER_KEYS = {
  providerId: "providerId",
  isActive: "isActive",
  download: "download",
  page: "page",
  size: "size",
} as const;

export type ProviderSocInsurerMapping = {
  insurerId: string;
  insurerName: string;
  effectiveFrom: string;
};

export type NormalizedProviderSoc = {
  providerSocId: string;
  providerId: string;
  socIdVersion: string;
  socName: string;
  applicableIcs: string;
  insurerMappings: ProviderSocInsurerMapping[];
  lastUpdatedOn: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  status: "Active" | "Inactive";
  providerAgreementId: string;
  providerAgreementName: string;
  fileMetadataId: string;
  downloadUrl: string;
};

export type ProviderSocListFilters = {
  providerId: string;
  isActive?: boolean;
  download?: boolean;
  page?: number;
  size?: number;
};
