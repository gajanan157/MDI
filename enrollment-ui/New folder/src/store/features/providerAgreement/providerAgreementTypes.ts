/** Exact field names from provider agreement API contract. */
export const PROVIDER_AGREEMENT_KEYS = {
  providerAgreementId: "providerAgreementId",
  providerId: "providerId",
  providerGipsaPpnCity: "providerGipsaPpnCity",
  providerGipsaPpnState: "providerGipsaPpnState",
  providerGipsaPpnCityName: "providerGipsaPpnCityName",
  providerGipsaPpnStateName: "providerGipsaPpnStateName",
  tpaId: "tpaId",
  providerAgreementName: "providerAgreementName",
  providerAgreementType: "providerAgreementType",
  applicableScope: "applicableScope",
  providerAgreementStatus: "providerAgreementStatus",
  providerAgreementEffectiveFrom: "providerAgreementEffectiveFrom",
  providerAgreementEffectiveTo: "providerAgreementEffectiveTo",
  providerEmpanellmentDate: "providerEmpanellmentDate",
  providerAgreementSignedDate: "providerAgreementSignedDate",
  providerSignatoryName: "providerSignatoryName",
  providerSignatoryDesignation: "providerSignatoryDesignation",
  providerAgreementCreditPeriod: "providerAgreementCreditPeriod",
  providerAgreementServicePeriod: "providerAgreementServicePeriod",
  providerAgreementDuration: "providerAgreementDuration",
  providerAgreementVersion: "providerAgreementVersion",
  providerAgreementCopyAvailableFlag: "providerAgreementCopyAvailableFlag",
  infraAuditDoneFlag: "infraAuditDoneFlag",
  remark: "remark",
  fileMetadataId: "fileMetadataId",
  supportingFileMetadataId: "supportingFileMetadataId",
  inwardNo: "inwardNo",
  insurerMappings: "insurerMappings",
  insurerId: "insurerId",
  /** Optional — SOC & Discount completion for the agreement row. */
  socDiscountStatus: "socDiscountStatus",
} as const;

export const PROVIDER_AGREEMENT_LIST_FILTER_KEYS = {
  providerAgreementName: "providerAgreementName",
  providerAgreementType: "providerAgreementType",
  providerAgreementStatus: "providerAgreementStatus",
  applicableScope: "applicableScope",
  recordStatus: "recordStatus",
  download: "download",
  page: "page",
  size: "size",
} as const;

/** Nested objects inside GET agreement `insurerMappings[]`. */
export const PROVIDER_AGREEMENT_INSURER_MAPPING_KEYS = {
  providerAgreementInsurerMappingId: "providerAgreementInsurerMappingId",
  insurerId: "insurerId",
  insurerName: "insurerName",
  mappingEffectiveFrom: "mappingEffectiveFrom",
  mappingEffectiveTo: "mappingEffectiveTo",
  mappingIsActive: "mappingIsActive",
} as const;

export type ProviderAgreementInsurerMapping = {
  insurerId: string;
  insurerName?: string;
  mappingEffectiveFrom?: string;
  mappingEffectiveTo?: string | null;
  providerAgreementInsurerMappingId?: string;
  mappingIsActive?: boolean;
};

export type NormalizedProviderAgreement = {
  providerAgreementId: string;
  providerId: string;
  providerGipsaPpnCity: string;
  providerGipsaPpnState: string;
  providerGipsaPpnCityName: string;
  providerGipsaPpnStateName: string;
  tpaId: string;
  providerAgreementName: string;
  providerAgreementType: string;
  applicableScope: string;
  providerAgreementStatus: string;
  providerAgreementEffectiveFrom: string;
  providerAgreementEffectiveTo: string;
  providerEmpanellmentDate: string;
  providerAgreementSignedDate: string;
  providerSignatoryName: string;
  providerSignatoryDesignation: string;
  providerAgreementCreditPeriod: number;
  providerAgreementServicePeriod: number;
  providerAgreementDuration: number;
  providerAgreementVersion: string;
  providerAgreementCopyAvailableFlag: boolean;
  infraAuditDoneFlag: boolean;
  remark: string;
  fileMetadataId: string;
  supportingFileMetadataId: string;
  inwardNo: string;
  insurerMappings: ProviderAgreementInsurerMapping[];
  /** Display status for Soc & Discount column: Pending | Complete */
  socDiscountStatus: string;
};

export type ProviderAgreementListFilters = {
  providerAgreementName?: string;
  providerAgreementType?: string;
  providerAgreementStatus?: string;
  applicableScope?: string;
  recordStatus?: string;
  download?: boolean;
  page?: number;
  size?: number;
};

export type ProviderAgreementListState = {
  providerId: string | null;
  rows: NormalizedProviderAgreement[];
  totalRecords: number;
  loading: boolean;
  error: string | null;
  listMessage: string | null;
  /** Latest in-flight list request id — ignore stale fulfill/reject. */
  requestId: string | null;
};

export type ProviderAgreementDetailState = {
  providerId: string | null;
  agreementId: string | null;
  row: NormalizedProviderAgreement | null;
  loading: boolean;
  error: string | null;
  /** Latest in-flight detail request id — ignore stale fulfill/reject. */
  requestId: string | null;
};

export type ProviderAgreementSummaryState = {
  providerId: string | null;
  typeLabels: string[];
  loading: boolean;
};

export type ProviderAgreementCreateState = {
  saving: boolean;
  error: string | null;
};

/** GET `/v1/provider/{id}/check-ppn-state-city` — exact API field keys. */
export const CHECK_PPN_STATE_CITY_KEYS = {
  providerGipsaPpnStateId: "providerGipsaPpnStateId",
  providerGipsaPpnStateName: "providerGipsaPpnStateName",
  providerGipsaPpnStateAvailable: "providerGipsaPpnStateAvailable",
  providerGipsaPpnStateMessage: "providerGipsaPpnStateMessage",
  providerGipsaPpnCityId: "providerGipsaPpnCityId",
  providerGipsaPpnCityName: "providerGipsaPpnCityName",
  providerGipsaPpnCityAvailable: "providerGipsaPpnCityAvailable",
  providerGipsaPpnCityMessage: "providerGipsaPpnCityMessage",
  providerState: "providerState",
  providerCity: "providerCity",
} as const;

export type NormalizedCheckPpnStateCityValidation = {
  providerGipsaPpnStateId: string | null;
  providerGipsaPpnStateName: string;
  providerGipsaPpnStateAvailable: boolean | null;
  providerGipsaPpnStateMessage: string;
  providerGipsaPpnCityId: string | null;
  providerGipsaPpnCityName: string;
  providerGipsaPpnCityAvailable: boolean | null;
  providerGipsaPpnCityMessage: string;
  providerState: string;
  providerCity: string;
};

/** GET `/v1/provider/{id}/check-ppn-state-city` — validation and PPN state/city ids + names. */
export type NormalizedCheckPpnStateCity = NormalizedCheckPpnStateCityValidation;

export type ProviderAgreementPpnCheckState = {
  providerId: string | null;
  data: NormalizedCheckPpnStateCity | null;
  loading: boolean;
  error: string | null;
};

export type ProviderAgreementState = {
  list: ProviderAgreementListState;
  detail: ProviderAgreementDetailState;
  summary: ProviderAgreementSummaryState;
  create: ProviderAgreementCreateState;
  ppnCheck: ProviderAgreementPpnCheckState;
};
