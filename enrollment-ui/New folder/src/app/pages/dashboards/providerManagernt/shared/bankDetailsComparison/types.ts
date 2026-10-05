export type BankComparisonFieldKey =
  | "accountHolderName"
  | "accountNumber"
  | "ifscCode"
  | "accountType"
  | "bankName"
  | "branch"
  | "pan";

/** Field-level comparison outcome from API / local compare. */
export type BankComparisonStatus = "match" | "mismatch" | "notApplicable";

export type BankComparisonRow = {
  fieldKey: BankComparisonFieldKey;
  field: string;
  provider: string;
  insurer: string;
  /** True only when status is `match` (not for `notApplicable`). */
  matched: boolean;
  status: BankComparisonStatus;
};

export type BankComparisonFieldLabels = Record<BankComparisonFieldKey, string>;

export type BankComparisonFilter = "all" | "matched" | "mismatched";

export type BankDetailsSnapshot = Record<BankComparisonFieldKey, string>;
