/** Field keys for `GET /v1/staging-provider-insurer`. */
export const STAGING_PROVIDER_INSURER_API_KEYS = {
  stagingProviderInsurerId: "stagingProviderInsurerId",
  inwardNo: "inwardNo",
  insurerId: "insurerId",
  rowType: "rowType",
  isValid: "isValid",
  stagingStatus: "stagingStatus",
  providerStatus: "providerStatus",
  providerStatusReason: "providerStatusReason",
  insurerProviderSrNo: "insurerProviderSrNo",
  providerIibRohiniCode: "providerIibRohiniCode",
  providerName: "providerName",
  providerAddress: "providerAddress",
  providerAddressCity: "providerAddressCity",
  providerAddressState: "providerAddressState",
  providerAddressPostalCode: "providerAddressPostalCode",
  providerNetworkEffectiveFrom: "providerNetworkEffectiveFrom",
} as const;

export const STAGING_PROVIDER_INSURER_ADDITIONAL_DATA_KEYS = {
  inwardNo: "inwardNo",
  insurerCode: "insurerCode",
  totalReceived: "totalReceived",
  validCount: "validCount",
  invalidCount: "invalidCount",
  transformationFailedCount: "transformationFailedCount",
  validationFailedCount: "validationFailedCount",
  pendingCount: "pendingCount",
  processedCount: "processedCount",
  skippedCount: "skippedCount",
  failedCount: "failedCount",
  createdCount: "createdCount",
  mappedCount: "mappedCount",
  convertedToNetworkCount: "convertedToNetworkCount",
  alreadyMappedCount: "alreadyMappedCount",
  processingFailedCount: "processingFailedCount",
  deEmpanelledCount: "deEmpanelledCount",
  alreadyDeEmpanelledCount: "alreadyDeEmpanelledCount",
  notFoundForDeEmpanelmentCount: "notFoundForDeEmpanelmentCount",
} as const;

export const STAGING_ADDITIONAL_DATA_ROW_TYPE_KEYS = {
  empanelment: "empanelment",
  deEmpanelment: "deEmpanelment",
} as const;
