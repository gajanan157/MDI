import { useMemo } from "react";
import type { BankComparisonFieldLabels } from "./types";

export type {
  BankComparisonFieldKey,
  BankComparisonFieldLabels,
  BankComparisonFilter,
  BankComparisonRow,
  BankComparisonStatus,
  BankDetailsSnapshot,
};

export {
  buildBankComparisonRows,
  buildBankComparisonRowsFromSnapshots,
  buildBankComparisonRowsFromVerificationResult,
  buildBankMatchMismatchTooltip,
  countBankComparisonMatches,
  countBankComparisonMismatches,
  getBankComparisonStatus,
} from "./utils";

export type { VerificationResultBankInput } from "./utils";

export { BankDetailsComparisonModal } from "./BankDetailsComparisonModal";
export type { BankDetailsComparisonModalProps } from "./BankDetailsComparisonModal";

export function useBankComparisonFieldLabels(t: (key: string) => string): BankComparisonFieldLabels {
  return useMemo(
    () => ({
      accountHolderName: t("providerMaster.bankDetailsComparison.fields.accountHolderName"),
      accountNumber: t("providerMaster.bankDetailsComparison.fields.accountNumber"),
      ifscCode: t("providerMaster.bankDetailsComparison.fields.ifscCode"),
      accountType: t("providerMaster.bankDetailsComparison.fields.accountType"),
      bankName: t("providerMaster.bankDetailsComparison.fields.bankName"),
      branch: t("providerMaster.bankDetailsComparison.fields.branch"),
      pan: t("providerMaster.bankDetailsComparison.fields.pan"),
    }),
    [t],
  );
}
