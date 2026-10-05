/** GET `/v1/provider/{id}/bank-account` record — same field names as API. */
export interface BankTabFieldsFromApi {
  providerBankId: string;
  providerBankIfscIsVerified: boolean | null;
  providerAccountType: string;
  providerBankAccountBeneficiaryType: string;
  providerBankName: string;
  providerBankBranch: string;
  providerBankIfscCode: string;
  providerBankMicrCode: string;
  providerBankHolderName: string;
  providerBankAccountNo: string;
  providerBankAccountNoMasked?: string;
  providerBankBeneficiaryName?: string | null;
  providerBankAddress: string;
  providerPanNo: string;
  providerPanHolderName: string;
  providerTanNo: string;
  cancelChequeFileMetadataId?: string;
  panCardFileMetadataId?: string;
  providerBankKycDocuments?: unknown;
}

export const BANK_FORM_API_FIELDS = [
  "providerAccountType",
  "providerBankAccountBeneficiaryType",
  "providerBankName",
  "providerBankBranch",
  "providerBankIfscCode",
  "providerBankMicrCode",
  "providerBankHolderName",
  "providerBankAccountNo",
  "providerBankAddress",
  "providerPanNo",
  "providerPanHolderName",
  "providerTanNo",
] as const;

export type BankFormApiFields = (typeof BANK_FORM_API_FIELDS)[number];
