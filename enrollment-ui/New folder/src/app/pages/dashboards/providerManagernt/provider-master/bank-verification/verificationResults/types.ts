export type BankVerificationResultStatus =
  | "MATCHED"
  | "NOT_MATCHED"
  | "PENDING"
  | "BANK_DETAILS_MISSING"
  | "PROVIDER_NOT_FOUND"
  | "FAILED"
  | "VALIDATION_FAILED"
  | "PROCESSING_FAILED";

export type BankVerificationSummaryFilter = "all" | BankVerificationResultStatus;

export type BankVerificationResultRow = {
  id: string;
  inwardNo: string;
  insurerId: string;
  isValid: boolean;
  insurerProviderCode: string;
  providerName: string;
  providerStatus: string;
  providerIibRohiniCode: string;
  providerPanNumber: string;
  providerEffectiveFrom: string;
  providerBankAccountNumber: string;
  providerBankAccountType: string;
  providerBankAccountIfscCode: string;
  providerAddress: string;
  providerAddressCity: string;
  providerAddressStateName: string;
  providerAddressPostalCode: string;
  providerBankRemark: string;
  createdAt: string;
  updatedAt: string;
  status: BankVerificationResultStatus;
};

export type BankVerificationResultCounts = {
  total: number;
  processed: number;
  failed: number;
  providerNotFound: number;
  matched: number;
  notMatched: number;
  pending: number;
  bankDetailsMissing: number;
  validationFailedCount: number;
  processingFailedCount: number;
};
