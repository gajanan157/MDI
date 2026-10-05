import type {
  BankComparisonFieldKey,
  BankComparisonFieldLabels,
  BankComparisonRow,
  BankComparisonStatus,
  BankDetailsSnapshot,
} from "../../../shared/bankDetailsComparison";
import { buildBankComparisonRowsFromSnapshots } from "../../../shared/bankDetailsComparison";

export type NormalizedStagingBankComparison = {
  rows: BankComparisonRow[];
  providerName: string;
  insurerName: string;
  insurerCode: string;
  matchedCount: number;
  mismatchedCount: number;
};

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      continue;
    }
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}

function readBoolean(record: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "matched" || normalized === "match") {
        return true;
      }
      if (normalized === "false" || normalized === "not_matched" || normalized === "mismatch") {
        return false;
      }
    }
  }
  return undefined;
}

function unwrapComparisonPayload(body: unknown): unknown {
  if (!isApiRecord(body)) return body;
  const nested = body.data;
  if (nested != null && (isApiRecord(nested) || Array.isArray(nested))) {
    if (isApiRecord(nested) && nested.data != null && (isApiRecord(nested.data) || Array.isArray(nested.data))) {
      return nested.data;
    }
    return nested;
  }
  return body;
}

const FIELD_KEY_ALIASES: Record<string, BankComparisonFieldKey> = {
  accountholdername: "accountHolderName",
  accountholder: "accountHolderName",
  holdername: "accountHolderName",
  beneficiaryname: "accountHolderName",
  providerbankaccountholdername: "accountHolderName",
  accountnumber: "accountNumber",
  accountno: "accountNumber",
  bankaccountnumber: "accountNumber",
  providerbankaccountnumber: "accountNumber",
  ifsccode: "ifscCode",
  ifsc: "ifscCode",
  providerbankaccountifsccode: "ifscCode",
  accounttype: "accountType",
  bankaccounttype: "accountType",
  providerbankaccounttype: "accountType",
  bankname: "bankName",
  providerbankname: "bankName",
  branch: "branch",
  bankbranch: "branch",
  pan: "pan",
  pannumber: "pan",
  pannumberno: "pan",
};

const FIELD_KEY_ALIAS_ENTRIES = Object.entries(FIELD_KEY_ALIASES).sort(
  (left, right) => right[0].length - left[0].length,
);

function compactFieldToken(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function toFieldKey(value: string): BankComparisonFieldKey | null {
  const compact = compactFieldToken(value);
  if (!compact) return null;
  const direct = FIELD_KEY_ALIASES[compact];
  if (direct) return direct;

  for (const [alias, key] of FIELD_KEY_ALIAS_ENTRIES) {
    if (compact.endsWith(alias)) return key;
  }
  return null;
}

function snapshotFromRecord(
  record: Record<string, unknown>,
  prefixes: readonly string[],
): BankDetailsSnapshot {
  const keysFor = (names: string[]) => {
    const keys: string[] = [...names];
    for (const prefix of prefixes) {
      for (const name of names) {
        keys.push(`${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}`);
        keys.push(`${prefix}${name}`);
      }
    }
    return keys;
  };

  return {
    accountHolderName: readString(
      record,
      ...keysFor([
        "bankHolderName",
        "bankAccountHolderName",
        "accountHolderName",
        "bankBeneficiaryName",
        "holderName",
        "name",
      ]),
    ),
    accountNumber: readString(
      record,
      ...keysFor([
        "bankAccountNumber",
        "bankAccountNo",
        "accountNumber",
        "accountNo",
      ]),
    ),
    ifscCode: readString(
      record,
      ...keysFor(["bankAccountIfscCode", "bankIfscCode", "ifscCode", "ifsc"]),
    ),
    accountType: readString(
      record,
      ...keysFor(["bankAccountType", "accountType"]),
    ),
    bankName: readString(record, ...keysFor(["bankName"])),
    branch: readString(
      record,
      ...keysFor(["bankBranch", "bankAccountBranch", "branch", "addressCity"]),
    ),
    pan: readString(record, ...keysFor(["panNumber", "panNo", "pan"])),
  };
}

function nestedSideRecord(
  payload: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> | null {
  for (const key of keys) {
    const value = payload[key];
    if (isApiRecord(value)) return value;
  }
  return null;
}

function readComparisonStatus(
  item: Record<string, unknown>,
  provider: string,
  insurer: string,
): BankComparisonStatus {
  const rawStatus = readString(
    item,
    "status",
    "comparisonStatus",
    "fieldStatus",
    "matchStatus",
  ).toUpperCase().replace(/[\s-]+/g, "_");

  if (
    rawStatus === "NOT_APPLICABLE" ||
    rawStatus === "NOTAPPLICABLE" ||
    rawStatus === "NA" ||
    rawStatus === "N/A"
  ) {
    return "notApplicable";
  }
  if (
    rawStatus === "MISMATCH" ||
    rawStatus === "MISMATCHED" ||
    rawStatus === "NOT_MATCHED" ||
    rawStatus === "NOTMATCHED" ||
    rawStatus === "UNMATCHED"
  ) {
    return "mismatch";
  }
  if (rawStatus === "MATCH" || rawStatus === "MATCHED") {
    return "match";
  }

  const matched = readBoolean(item, "matched", "isMatched", "isMatch", "match");
  if (matched === true) return "match";
  if (matched === false) return "mismatch";

  return provider.trim().localeCompare(insurer.trim(), undefined, { sensitivity: "accent" }) === 0
    ? "match"
    : "mismatch";
}

function rowsFromComparisonArray(
  items: unknown[],
  fieldLabels: BankComparisonFieldLabels,
): BankComparisonRow[] | null {
  const rows: BankComparisonRow[] = [];

  for (const item of items) {
    if (!isApiRecord(item)) continue;
    const rawFieldKey = readString(item, "fieldKey", "field", "fieldName", "name", "key");
    const apiLabel = readString(item, "fieldLabel", "label");
    const fieldKey = toFieldKey(rawFieldKey) ?? toFieldKey(apiLabel);
    if (!fieldKey) continue;

    const provider = readString(
      item,
      "provider",
      "providerValue",
      "tpaValue",
      "mdIndiaValue",
      "leftValue",
    );
    const insurer = readString(
      item,
      "insurer",
      "insurerValue",
      "icValue",
      "rightValue",
    );
    const status = readComparisonStatus(item, provider, insurer);
    const matched = status === "match";

    rows.push({
      fieldKey,
      field: apiLabel || fieldLabels[fieldKey],
      provider,
      insurer,
      matched,
      status,
    });
  }

  return rows.length > 0 ? rows : null;
}

function withComparisonMeta(
  payload: Record<string, unknown> | null,
  rows: BankComparisonRow[],
): NormalizedStagingBankComparison {
  const matchedFromRows = rows.filter((row) => row.status === "match").length;
  const mismatchedFromRows = rows.filter((row) => row.status === "mismatch").length;

  return {
    rows,
    providerName: payload ? readString(payload, "providerName") : "",
    insurerName: payload ? readString(payload, "insurerName") : "",
    insurerCode: payload ? readString(payload, "insurerCode") : "",
    matchedCount: payload
      ? (readNumber(payload, "matchedCount") ?? matchedFromRows)
      : matchedFromRows,
    mismatchedCount: payload
      ? (readNumber(payload, "mismatchedCount") ?? mismatchedFromRows)
      : mismatchedFromRows,
  };
}

export function normalizeStagingBankComparison(
  body: unknown,
  fieldLabels: BankComparisonFieldLabels,
): NormalizedStagingBankComparison | null {
  const payload = unwrapComparisonPayload(body);

  if (Array.isArray(payload)) {
    const rows = rowsFromComparisonArray(payload, fieldLabels);
    return rows ? withComparisonMeta(null, rows) : null;
  }

  if (!isApiRecord(payload)) return null;

  const nestedList =
    payload.comparisons ?? payload.fields ?? payload.differences ?? payload.items;
  if (Array.isArray(nestedList)) {
    const fromList = rowsFromComparisonArray(nestedList, fieldLabels);
    if (fromList) return withComparisonMeta(payload, fromList);
  }

  const providerRecord =
    nestedSideRecord(payload, ["provider", "tpa", "mdIndia", "providerBank"]) ?? payload;
  const insurerRecord =
    nestedSideRecord(payload, ["insurer", "ic", "insuranceCompany", "insurerBank"]) ?? payload;

  const provider = snapshotFromRecord(providerRecord, ["provider", "tpa", "mdIndia"]);
  const insurer = snapshotFromRecord(insurerRecord, ["insurer", "ic"]);

  const rows = buildBankComparisonRowsFromSnapshots(provider, insurer, fieldLabels);

  const hasAnyValue = rows.some((row) => row.provider || row.insurer);
  return hasAnyValue ? withComparisonMeta(payload, rows) : null;
}
