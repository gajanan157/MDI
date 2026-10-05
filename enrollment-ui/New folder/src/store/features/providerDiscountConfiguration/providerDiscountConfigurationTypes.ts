/** Exact field names from GET `/v1/provider/configuration`. */
export const PROVIDER_DISCOUNT_CONFIGURATION_KEYS = {
  providerDiscountConfigurationId: "providerDiscountConfigurationId",
  providerId: "providerId",
  providerName: "providerName",
  providerAgreementId: "providerAgreementId",
  providerAgreementName: "providerAgreementName",
  providerAgreementType: "providerAgreementType",
  corporateSpecificFlag: "corporateSpecificFlag",
  providerDiscountStatus: "providerDiscountStatus",
  providerDiscountEffectiveFrom: "providerDiscountEffectiveFrom",
  providerDiscountEffectiveTo: "providerDiscountEffectiveTo",
  remark: "remark",
  supportingFileMetadataId: "supportingFileMetadataId",
  supportingDocumentName: "supportingDocumentName",
  insurerApplicability: "insurerApplicability",
  insurerLevel: "insurerLevel",
  insurerIds: "insurerIds",
  corporateApplicability: "corporateApplicability",
  corporateLevel: "corporateLevel",
  insurerCorporateMappings: "insurerCorporateMappings",
  discountTypeDetails: "discountTypeDetails",
} as const;

export const PROVIDER_DISCOUNT_CONFIGURATION_MAPPING_KEYS = {
  providerInsurerCorporateDiscountId: "providerInsurerCorporateDiscountId",
  insurerCorporateDiscountMappingLevel: "insurerCorporateDiscountMappingLevel",
  insurerId: "insurerId",
  insurerName: "insurerName",
  corporateId: "corporateId",
  corporateName: "corporateName",
} as const;

export const PROVIDER_DISCOUNT_CONFIGURATION_TYPE_KEYS = {
  providerDiscountTypeDetailId: "providerDiscountTypeDetailId",
  providerDiscountTypeMasterId: "providerDiscountTypeMasterId",
  providerDiscountTypeName: "providerDiscountTypeName",
  providerServiceType: "providerServiceType",
  providerDiscountPercentage: "providerDiscountPercentage",
  providerDiscountAmount: "providerDiscountAmount",
  providerSocId: "providerSocId",
  providerSocName: "providerSocName",
  providerSocCode: "providerSocCode",
  isActive: "isActive",
  subtypeDetails: "subtypeDetails",
  inclusions: "inclusions",
  exclusions: "exclusions",
  providerPpnFlag: "providerPpnFlag",
} as const;

export const PROVIDER_DISCOUNT_CONFIGURATION_LIST_FILTER_KEYS = {
  providerId: "providerId",
  insurerIds: "insurerIds",
  corporateIds: "corporateIds",
  corporateSpecificFlag: "corporateSpecificFlag",
  providerDiscountStatus: "providerDiscountStatus",
  page: "page",
  size: "size",
} as const;

export type ProviderDiscountInsurerCorporateMapping = {
  providerInsurerCorporateDiscountId: string;
  insurerCorporateDiscountMappingLevel: string;
  insurerId: string;
  insurerName: string;
  corporateId: string;
  corporateName: string;
};

export type ProviderDiscountSubtypeDetail = {
  providerDiscountSubtypeDetailId: string;
  providerDiscountSubtypeMasterId: string;
  providerDiscountSubtypeName: string;
  providerDiscountPercentage: number | null;
  providerDiscountAmount: number | null;
};

export type ProviderDiscountInclusionExclusion = {
  providerDiscountInclusionTypeId: string;
  providerDiscountExclusionTypeId: string;
  providerInclusionExclusionMasterId: string;
  providerInclusionExclusionName: string;
};

export type ProviderDiscountTypeDetail = {
  providerDiscountTypeDetailId: string;
  providerDiscountTypeMasterId: string;
  providerDiscountTypeName: string;
  providerServiceType: string;
  providerDiscountPercentage: number | null;
  providerDiscountAmount: number | null;
  providerSocId: string;
  providerSocName: string;
  providerSocCode: string;
  isActive: boolean;
  subtypeDetails: ProviderDiscountSubtypeDetail[];
  inclusions: ProviderDiscountInclusionExclusion[];
  exclusions: ProviderDiscountInclusionExclusion[];
  providerPpnFlag?: boolean | null;
};

export type NormalizedProviderDiscountConfiguration = {
  providerDiscountConfigurationId: string;
  providerId: string;
  providerName: string;
  providerAgreementId: string;
  providerAgreementName: string;
  providerAgreementType: string;
  corporateSpecificFlag: boolean;
  providerDiscountStatus: string;
  providerDiscountEffectiveFrom: string;
  providerDiscountEffectiveTo: string;
  remark: string;
  supportingFileMetadataId: string;
  supportingDocumentName: string;
  insurerLevel: string;
  insurerIds: string[];
  corporateLevel: string;
  insurerCorporateMappings: ProviderDiscountInsurerCorporateMapping[];
  discountTypeDetails: ProviderDiscountTypeDetail[];
};

export type ProviderDiscountConfigurationListFilters = {
  providerId?: string;
  insurerIds?: string | string[];
  corporateIds?: string | string[];
  corporateSpecificFlag?: boolean;
  providerDiscountStatus?: string;
  page?: number;
  size?: number;
};

export type ProviderDiscountConfigurationListState = {
  providerId: string | null;
  rows: NormalizedProviderDiscountConfiguration[];
  totalRecords: number;
  loading: boolean;
  error: string | null;
  requestId: string | null;
};

export type ProviderDiscountConfigurationDetailState = {
  configurationId: string | null;
  row: NormalizedProviderDiscountConfiguration | null;
  loading: boolean;
  error: string | null;
  requestId: string | null;
};

export type ProviderDiscountConfigurationState = {
  list: ProviderDiscountConfigurationListState;
  detail: ProviderDiscountConfigurationDetailState;
  create: {
    saving: boolean;
    error: string | null;
  };
  update: {
    saving: boolean;
    error: string | null;
  };
};

export type ProviderIndividualDiscountRequestDto = {
  providerDiscountSubTypeMasterId: string;
  providerDiscountPercentage: number | null;
};

export type ProviderIpdDiscountRequestDto = {
  providerDiscountTypeMasterId: string;
  providerDiscountPercentage: number | null;
  providerSocId: string | null;
  providerIndividualDiscountRequestDtoList: ProviderIndividualDiscountRequestDto[];
  providerDiscountInclusionIds?: string[];
  providerDiscountExclusionIds?: string[];
  providerPpnFlag?: boolean;
};

export type ProviderOpdDiscountRequestDto = {
  providerDiscountTypeMasterId: string;
  providerDiscountPercentage: number | null;
  providerSocId: string | null;
  providerIndividualDiscountRequestDtoList: ProviderIndividualDiscountRequestDto[];
  providerDiscountInclusionIds?: string[];
  providerDiscountExclusionIds?: string[];
};

export type ProviderInsurerCorporateDiscountRequestDto = {
  insurerId: string;
  corporateIds: string[];
};

export type PatchProviderDiscountConfigurationInsurerCorporateMapping =
  | {
      // Deactivate an existing mapping (insurer-level or corporate-level).
      providerInsurerCorporateDiscountId: string;
      insurerId: null;
      corporateId: null;
      isActive: boolean;
    }
  | {
      // Add a corporate-level mapping (insurer + specific corporate).
      providerInsurerCorporateDiscountId: null;
      insurerId: string;
      corporateId: string;
      isActive: boolean;
    }
  | {
      // Add an insurer-level mapping (insurer only, no specific corporate).
      providerInsurerCorporateDiscountId: null;
      insurerId: string;
      corporateId: null;
      isActive: boolean;
    };

export type PatchProviderDiscountConfigurationSubtypeDetail =
  | {
      providerDiscountSubtypeDetailId: string;
      providerDiscountSubTypeMasterId: null;
      providerDiscountPercentage: number;
    }
  | {
      providerDiscountSubtypeDetailId: null;
      providerDiscountSubTypeMasterId: string;
      providerDiscountPercentage: number;
    };

export type PatchProviderDiscountConfigurationInclusionExclusion = {
  providerDiscountInclusionTypeId?: string | null;
  providerDiscountExclusionTypeId?: string | null;
  providerInclusionExclusionMasterId?: string | null;
  isActive: boolean;
};

export type PatchProviderDiscountConfigurationTypeDetail =
  | {
      providerDiscountTypeDetailId: string;
      providerDiscountTypeMasterId: null;
      providerDiscountPercentage?: number | null;
      providerSocId?: string | null;
      isActive?: boolean;
      subtypeDetails?: PatchProviderDiscountConfigurationSubtypeDetail[] | null;
      inclusions?: PatchProviderDiscountConfigurationInclusionExclusion[] | null;
      exclusions?: PatchProviderDiscountConfigurationInclusionExclusion[] | null;
      providerPpnFlag?: boolean;
    }
  | {
      providerDiscountTypeDetailId: null;
      providerDiscountTypeMasterId: string;
      providerDiscountPercentage?: number | null;
      providerSocId?: string | null;
      isActive?: boolean;
      subtypeDetails?: PatchProviderDiscountConfigurationSubtypeDetail[] | null;
      inclusions?: PatchProviderDiscountConfigurationInclusionExclusion[] | null;
      exclusions?: PatchProviderDiscountConfigurationInclusionExclusion[] | null;
      providerPpnFlag?: boolean;
    };

/** PATCH `/v1/provider/configuration/{configurationId}` — only changed fields. */
export type PatchProviderDiscountConfigurationBody = {
  providerDiscountEffectiveFrom?: string;
  providerDiscountEffectiveTo?: string;
  remark?: string;
  supportingFileMetadataId?: string | null;
  insurerApplicability?: string;
  corporateApplicability?: string | null;
  insurerCorporateMappings?: PatchProviderDiscountConfigurationInsurerCorporateMapping[];
  discountTypeDetails?: PatchProviderDiscountConfigurationTypeDetail[];
};

/** POST `/v1/provider/{providerId}/discount-configuration` */
export type CreateProviderDiscountConfigurationBody = {
  providerId: string;
  providerAgreementId: string | null;
  discountServiceType: string;
  insurerApplicability: string;
  insurerIds: string[];
  corporateApplicability: string | null;
  providerInsurerCorporateDiscount: ProviderInsurerCorporateDiscountRequestDto[];
  providerIpdDiscountRequestDtoList: ProviderIpdDiscountRequestDto[];
  providerOpdDiscountRequestDto: ProviderOpdDiscountRequestDto | null;
  providerDiscountInclusionIds?: string[];
  providerDiscountExclusionIds?: string[];
  providerDiscountEffectiveFrom: string;
  providerDiscountEffectiveTo: string;
  creditPeriodDays: number;
  remark: string;
  supportingFileMetadataId?: string | null;
};
