export type {
  BankComparisonFieldKey,
  BankComparisonFieldLabels,
  BankComparisonFilter,
  BankComparisonRow,
  BankDetailsSnapshot,
} from "../../../shared/bankDetailsComparison/types";

export {
  buildBankComparisonRows,
  buildBankComparisonRowsFromSnapshots,
  buildBankComparisonRowsFromVerificationResult,
  buildBankMatchMismatchTooltip,
  countBankComparisonMatches,
  countBankComparisonMismatches,
} from "../../../shared/bankDetailsComparison/utils";

export type { VerificationResultBankInput } from "../../../shared/bankDetailsComparison/utils";
