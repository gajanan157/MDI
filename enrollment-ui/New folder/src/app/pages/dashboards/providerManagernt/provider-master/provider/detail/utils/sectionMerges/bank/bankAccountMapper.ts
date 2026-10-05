import type { BankTabFieldsFromApi } from "./bankTypes";

export const PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME = "PAN NO";
export const PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME = "TAN NO";

const IDENTIFIER_LIST_KEYS = [
  "providerIdentifiers",
  "identifiers",
  "providerBankIdentifiers",
  "providerIdentifierList",
] as const;

type ParsedIdentifier = {
  typeName: string;
  value: string;
  holderName: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readNullableBoolean(value: unknown): boolean | null {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

function normalizeIdentifierTypeName(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

function readIdentifierFromRow(row: Record<string, unknown>): ParsedIdentifier | null {
  const typeName = normalizeIdentifierTypeName(
    row.identifierTypeName ?? row.providerIdentifierTypeName ?? row.typeName,
  );
  if (!typeName) return null;

  const value = readString(row, "identifierValue") || readString(row, "providerIdentifierValue");
  const holderName =
    readString(row, "identifierHolderName") ||
    readString(row, "providerIdentifierHolderName") ||
    readString(row, "holderName");

  return { typeName, value, holderName };
}

function resolveNestedIdentifierKey(typeName: string): "panIdentifier" | "tanIdentifier" | null {
  const normalized = normalizeIdentifierTypeName(typeName);
  if (
    normalized === normalizeIdentifierTypeName(PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME)
  ) {
    return "panIdentifier";
  }
  if (
    normalized === normalizeIdentifierTypeName(PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME)
  ) {
    return "tanIdentifier";
  }
  return null;
}

function readNestedIdentifierField(
  record: Record<string, unknown>,
  nestedKey: "panIdentifier" | "tanIdentifier",
  fields: readonly string[],
): string {
  if (!isRecord(record[nestedKey])) return "";
  const nested = record[nestedKey] as Record<string, unknown>;
  for (const field of fields) {
    const value = readString(nested, field);
    if (value) return value;
  }
  return "";
}

function findIdentifierInLists(
  record: Record<string, unknown>,
  typeName: string,
): ParsedIdentifier | null {
  const normalizedTarget = normalizeIdentifierTypeName(typeName);

  for (const key of IDENTIFIER_LIST_KEYS) {
    const items = record[key];
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      if (!isRecord(item)) continue;
      const parsed = readIdentifierFromRow(item);
      if (parsed?.typeName === normalizedTarget) return parsed;
    }
  }

  return null;
}

function readIdentifierValueByTypeName(
  record: Record<string, unknown>,
  typeName: string,
): string {
  const nestedKey = resolveNestedIdentifierKey(typeName);
  if (nestedKey) {
    const nestedValue = readNestedIdentifierField(record, nestedKey, [
      "identifierValue",
      "providerIdentifierValue",
      "value",
    ]);
    if (nestedValue) return nestedValue;
  }

  return findIdentifierInLists(record, typeName)?.value ?? "";
}

function readIdentifierHolderByTypeName(
  record: Record<string, unknown>,
  typeName: string,
): string {
  const nestedKey = resolveNestedIdentifierKey(typeName);
  if (nestedKey === "panIdentifier") {
    const holder = readNestedIdentifierField(record, nestedKey, [
      "identifierHolderName",
      "providerIdentifierHolderName",
      "holderName",
    ]);
    if (holder) return holder;
  }

  return findIdentifierInLists(record, typeName)?.holderName ?? "";
}

function firstNonEmpty(...values: string[]): string {
  return values.find((value) => value.trim() !== "") ?? "";
}

/** Maps GET `/v1/provider/{id}/bank-account` row to bank tab form/view fields. */
export function mapProviderBankAccountToTabFields(
  raw: Record<string, unknown> | null,
): BankTabFieldsFromApi | null {
  if (!raw) return null;

  const providerPanNo = firstNonEmpty(
    readString(raw, "providerPanNo"),
    readString(raw, "panNo"),
    readIdentifierValueByTypeName(raw, PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME),
  );

  const providerTanNo = firstNonEmpty(
    readString(raw, "providerTanNo"),
    readString(raw, "tanNo"),
    readIdentifierValueByTypeName(raw, PROVIDER_BANK_ACCOUNT_TAN_IDENTIFIER_TYPE_NAME),
  );

  const providerPanHolderName = firstNonEmpty(
    readString(raw, "providerPanHolderName"),
    readString(raw, "panHolderName"),
    readIdentifierHolderByTypeName(raw, PROVIDER_BANK_ACCOUNT_PAN_IDENTIFIER_TYPE_NAME),
  );

  const kycDocuments =
    raw.providerBankKycDocuments ??
    raw.providerBankDocuments ??
    raw.kycDocuments ??
    raw.documents;

  const cancelChequeFileMetadataId =
    readString(raw, "cancelChequeFileMetadataId") || undefined;
  const panCardFileMetadataId =
    readString(raw, "panCardFileMetadataId") || undefined;

  return {
    providerBankId: firstNonEmpty(readString(raw, "providerBankId"), readString(raw, "id")),
    providerBankIfscIsVerified: readNullableBoolean(raw.providerBankIfscIsVerified),
    providerAccountType: readString(raw, "providerAccountType"),
    providerBankAccountBeneficiaryType: readString(raw, "providerBankAccountBeneficiaryType"),
    providerBankName: readString(raw, "providerBankName"),
    providerBankBranch: readString(raw, "providerBankBranch"),
    providerBankIfscCode: readString(raw, "providerBankIfscCode"),
    providerBankMicrCode: readString(raw, "providerBankMicrCode"),
    providerBankHolderName: firstNonEmpty(
      readString(raw, "providerBankHolderName"),
      readString(raw, "providerBankBeneficiaryName"),
    ),
    providerBankAccountNo: readString(raw, "providerBankAccountNo"),
    providerBankAccountNoMasked: readString(raw, "providerBankAccountNoMasked") || undefined,
    providerBankBeneficiaryName: readString(raw, "providerBankBeneficiaryName") || null,
    providerBankAddress: readString(raw, "providerBankAddress"),
    providerPanNo,
    providerPanHolderName,
    providerTanNo,
    cancelChequeFileMetadataId,
    panCardFileMetadataId,
    providerBankKycDocuments: kycDocuments,
  };
}
