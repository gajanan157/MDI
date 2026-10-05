import {
  PROVIDER_LIST_IDENTIFIER_KEYS as KEYS,
  isProviderListRohiniIdentifierType,
} from "./providerListIdentifierFieldKeys";

export type NormalizedProviderListRohiniIdentifier = {
  identifierValue: string;
  validTo: string | null;
};

function isIdentifierRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readIdentifierString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readIdentifierValidTo(record: Record<string, unknown>): string | null {
  const value = record[KEYS.validTo];
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

/** Picks ROHINI_CODE from list API `identifiers`; prefers `isPrimary` when set. */
export function normalizeProviderListRohiniIdentifier(
  identifiers: unknown,
): NormalizedProviderListRohiniIdentifier | null {
  if (!Array.isArray(identifiers)) return null;

  const rohiniIdentifiers = identifiers.filter(isIdentifierRecord).filter((record) =>
    isProviderListRohiniIdentifierType(
      readIdentifierString(record, KEYS.identifierTypeName),
    ),
  );

  if (rohiniIdentifiers.length === 0) return null;

  const preferred =
    rohiniIdentifiers.find((record) => record[KEYS.isPrimary] === true) ??
    rohiniIdentifiers[0];

  const identifierValue = readIdentifierString(preferred, KEYS.identifierValue);
  if (!identifierValue) return null;

  return {
    identifierValue,
    validTo: readIdentifierValidTo(preferred),
  };
}
