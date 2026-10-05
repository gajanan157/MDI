import type {
  BankComparisonFieldKey,
  BankComparisonFieldLabels,
  BankComparisonRow,
  BankComparisonStatus,
  BankDetailsSnapshot,
} from "./types";

function statusFromMatched(matched: boolean): BankComparisonStatus {
  return matched ? "match" : "mismatch";
}

const FIELD_KEYS: BankComparisonFieldKey[] = [
  "accountHolderName",
  "accountNumber",
  "ifscCode",
  "accountType",
  "branch",
  "pan",
];

const DEMO_PROVIDER_BANK: BankDetailsSnapshot = {
  accountHolderName: "Hospital A Trust",
  accountNumber: "000012345678",
  ifscCode: "HDFC000100",
  accountType: "Current",
  bankName: "HDFC Bank",
  branch: "Main Branch",
  pan: "ABCDE1234F",
};

const DEMO_INSURER_BANK: BankDetailsSnapshot = {
  accountHolderName: "Hospital Different Trust",
  accountNumber: "000012345678",
  ifscCode: "HDFC000101",
  accountType: "Current",
  bankName: "HDFC Bank",
  branch: "Main Branch",
  pan: "ABCDE1234F",
};

function getString(raw: Record<string, unknown>, key: string): string {
  const value = raw[key];
  if (value == null) return "";
  return String(value).trim();
}

function tweakAccountHolder(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEMO_INSURER_BANK.accountHolderName;
  if (trimmed.toLowerCase().includes("trust")) return "Hospital Different Trust";
  return `${trimmed} (IC)`;
}

function tweakAccountNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEMO_INSURER_BANK.accountNumber;
  if (trimmed.length < 2) return `${trimmed}9`;
  return `${trimmed.slice(0, -1)}9`;
}

function tweakIfscCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEMO_INSURER_BANK.ifscCode;
  if (trimmed.length < 2) return `${trimmed}5`;
  return `${trimmed.slice(0, -1)}1`;
}

function tweakBranch(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEMO_INSURER_BANK.branch;
  if (trimmed.toLowerCase() === "main branch") return "Central Branch";
  return "Metro Branch";
}

function valuesMatch(
  providerValue: string,
  insurerValue: string,
  fieldKey: BankComparisonFieldKey,
): boolean {
  const left = providerValue.trim();
  const right = insurerValue.trim();
  if (!left && !right) return true;
  if (fieldKey === "accountHolderName") {
    return left.localeCompare(right, undefined, { sensitivity: "accent" }) === 0;
  }
  return left === right;
}

function snapshotFromProviderBank(raw: Record<string, unknown> | null): BankDetailsSnapshot {
  if (!raw) return { ...DEMO_PROVIDER_BANK };

  return {
    accountHolderName:
      getString(raw, "providerBankHolderName") ||
      getString(raw, "providerBankBeneficiaryName") ||
      DEMO_PROVIDER_BANK.accountHolderName,
    accountNumber:
      getString(raw, "providerBankAccountNo") || DEMO_PROVIDER_BANK.accountNumber,
    ifscCode: getString(raw, "providerBankIfscCode") || DEMO_PROVIDER_BANK.ifscCode,
    accountType:
      getString(raw, "providerBankAccountType") || DEMO_PROVIDER_BANK.accountType,
    bankName: getString(raw, "providerBankName") || DEMO_PROVIDER_BANK.bankName,
    branch: getString(raw, "providerBankBranch") || DEMO_PROVIDER_BANK.branch,
    pan: getString(raw, "providerPanNo") || getString(raw, "providerPan") || DEMO_PROVIDER_BANK.pan,
  };
}

function buildInsurerSnapshot(provider: BankDetailsSnapshot): BankDetailsSnapshot {
  return {
    accountHolderName: tweakAccountHolder(provider.accountHolderName),
    accountNumber: tweakAccountNumber(provider.accountNumber),
    ifscCode: tweakIfscCode(provider.ifscCode),
    accountType: provider.accountType,
    bankName: provider.bankName,
    branch: tweakBranch(provider.branch),
    pan: provider.pan,
  };
}

export function buildBankComparisonRows(
  providerBank: Record<string, unknown> | null,
  fieldLabels: BankComparisonFieldLabels,
): BankComparisonRow[] {
  const provider = snapshotFromProviderBank(providerBank);
  const insurer = providerBank ? buildInsurerSnapshot(provider) : { ...DEMO_INSURER_BANK };

  return FIELD_KEYS.map((fieldKey) => {
    const providerValue = provider[fieldKey];
    const insurerValue = insurer[fieldKey];
    const matched = valuesMatch(providerValue, insurerValue, fieldKey);
    return {
      fieldKey,
      field: fieldLabels[fieldKey],
      provider: providerValue,
      insurer: insurerValue,
      matched,
      status: statusFromMatched(matched),
    };
  });
}

export function buildBankComparisonRowsFromSnapshots(
  provider: BankDetailsSnapshot,
  insurer: BankDetailsSnapshot,
  fieldLabels: BankComparisonFieldLabels,
): BankComparisonRow[] {
  return FIELD_KEYS.map((fieldKey) => {
    const providerValue = provider[fieldKey] ?? "";
    const insurerValue = insurer[fieldKey] ?? "";
    const matched = valuesMatch(providerValue, insurerValue, fieldKey);
    return {
      fieldKey,
      field: fieldLabels[fieldKey],
      provider: providerValue,
      insurer: insurerValue,
      matched,
      status: statusFromMatched(matched),
    };
  });
}

export type VerificationResultBankInput = {
  accountHolder: string;
  accountNo: string;
  ifsc: string;
  accountType: string;
  branch: string;
  pan: string;
  status: string;
};

export function buildBankComparisonRowsFromVerificationResult(
  row: VerificationResultBankInput,
  fieldLabels: BankComparisonFieldLabels,
): BankComparisonRow[] {
  const provider: BankDetailsSnapshot = {
    accountHolderName: row.accountHolder,
    accountNumber: row.accountNo,
    ifscCode: row.ifsc,
    accountType: row.accountType,
    bankName: "",
    branch: row.branch,
    pan: row.pan,
  };

  const insurer =
    row.status === "MATCHED"
      ? { ...provider }
      : buildInsurerSnapshot(provider);

  return buildBankComparisonRowsFromSnapshots(provider, insurer, fieldLabels);
}

export function getBankComparisonStatus(row: BankComparisonRow): BankComparisonStatus {
  if (row.status) return row.status;
  return statusFromMatched(row.matched);
}

export function countBankComparisonMismatches(rows: BankComparisonRow[]): number {
  return rows.filter((row) => getBankComparisonStatus(row) === "mismatch").length;
}

export function countBankComparisonMatches(rows: BankComparisonRow[]): number {
  return rows.filter((row) => getBankComparisonStatus(row) === "match").length;
}

export function buildBankMatchMismatchTooltip(
  rows: BankComparisonRow[],
  clickCompareHint: string,
): string {
  const mismatches = rows
    .filter((row) => getBankComparisonStatus(row) === "mismatch")
    .map((row) => `${row.field} mismatch`);
  if (!mismatches.length) return clickCompareHint;
  return `${mismatches.join("\n")}\n${clickCompareHint}`;
}
