import {
  PROVIDER_DETAIL_IDENTIFIER_KEYS as KEYS,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_OLD_PROVIDER_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_PROVIDER_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY,
} from "./providerDetailIdentifierFieldKeys";

export type NormalizedProviderDetailIdentifier = {
  providerIdentifierId: string;
  identifierTypeName: string;
  identifierValue: string;
  identifierStatus: string;
  validFrom: string | null;
  validTo: string | null;
  isPrimary: boolean;
  issueDate: string | null;
  sourceSystem: string;
  identifierHolderName: string;
  issuingAuthorityName: string;
  verificationReferenceNo: string;
};

function isIdentifierRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readIdentifierString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readIdentifierNullableString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

export function normalizeProviderDetailIdentifier(
  raw: unknown,
): NormalizedProviderDetailIdentifier | null {
  if (!isIdentifierRecord(raw)) return null;

  const identifierTypeName = readIdentifierString(raw, KEYS.identifierTypeName);
  const identifierValue = readIdentifierString(raw, KEYS.identifierValue);
  if (!identifierTypeName || !identifierValue) return null;

  return {
    providerIdentifierId: readIdentifierString(raw, KEYS.providerIdentifierId),
    identifierTypeName,
    identifierValue,
    identifierStatus: readIdentifierString(raw, KEYS.identifierStatus),
    validFrom: readIdentifierNullableString(raw, KEYS.validFrom),
    validTo: readIdentifierNullableString(raw, KEYS.validTo),
    isPrimary: raw[KEYS.isPrimary] === true,
    issueDate: readIdentifierNullableString(raw, KEYS.issueDate),
    sourceSystem: readIdentifierString(raw, KEYS.sourceSystem),
    identifierHolderName: readIdentifierString(raw, KEYS.identifierHolderName),
    issuingAuthorityName: readIdentifierString(raw, KEYS.issuingAuthorityName),
    verificationReferenceNo: readIdentifierString(raw, KEYS.verificationReferenceNo),
  };
}

export function normalizeProviderDetailIdentifiers(
  identifiers: unknown,
): NormalizedProviderDetailIdentifier[] {
  if (!Array.isArray(identifiers)) return [];

  return identifiers
    .map(normalizeProviderDetailIdentifier)
    .filter((row): row is NormalizedProviderDetailIdentifier => row != null);
}

export function pickProviderDetailRohiniCode(
  identifiers: NormalizedProviderDetailIdentifier[],
): string {
  const rohiniRows = identifiers.filter(
    (row) =>
      row.identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE ||
      row.identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY,
  );
  if (rohiniRows.length === 0) return "";

  const preferred = rohiniRows.find((row) => row.isPrimary) ?? rohiniRows[0];
  return preferred.identifierValue;
}

export function buildProviderOldCodePayloadFromIdentifiers(
  identifiers: NormalizedProviderDetailIdentifier[],
): string | null {
  const providerCodeRows = identifiers.filter(
    (row) =>
      row.identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_PROVIDER_CODE ||
      row.identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_OLD_PROVIDER_CODE,
  );
  if (providerCodeRows.length === 0) return null;

  return JSON.stringify(
    providerCodeRows.map((row) => ({
      provider_old_code: row.identifierValue,
      provider_old_code_active_flag: row.identifierStatus.toUpperCase() === "ACTIVE",
    })),
  );
}
