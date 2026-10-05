import type { BankFormValues } from "../../../schemas";

export const BANK_DOCUMENT_UPLOAD_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

export const BANK_DOCUMENT_UPLOAD_HINT = "PDF, JPG, JPEG, or PNG";

export const BANK_DETAILS_AUDIT_TAB_ID = "bank-details" as const;

export const EMPTY_BANK_FORM: BankFormValues = {
  providerAccountType: "",
  providerBankAccountBeneficiaryType: "",
  providerBankName: "",
  providerBankBranch: "",
  providerBankIfscCode: "",
  providerBankMicrCode: "",
  providerBankHolderName: "",
  providerBankAccountNo: "",
  providerBankAddress: "",
  providerPanNo: "",
  providerPanHolderName: "",
  providerTanNo: "",
};

export const ACCOUNT_TYPE_OPTIONS = [
  { value: "CURRENT", label: "CURRENT" },
  { value: "SAVING", label: "SAVING" },
];

export const ACCOUNT_HOLDER_TYPE_OPTIONS = [
//   { value: "SELF", label: "SELF" },
  { value: "PROVIDER", label: "PROVIDER" },
];
