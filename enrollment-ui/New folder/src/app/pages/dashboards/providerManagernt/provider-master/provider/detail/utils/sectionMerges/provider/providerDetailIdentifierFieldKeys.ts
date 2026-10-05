/** Field keys for `identifiers[]` on GET `/v1/provider/{id}/details`. */
export const PROVIDER_DETAIL_IDENTIFIER_KEYS = {
  identifiers: "identifiers",
  identifierTypeName: "identifierTypeName",
  identifierValue: "identifierValue",
  identifierStatus: "identifierStatus",
  validFrom: "validFrom",
  validTo: "validTo",
  isPrimary: "isPrimary",
  issueDate: "issueDate",
  sourceSystem: "sourceSystem",
  identifierHolderName: "identifierHolderName",
  issuingAuthorityName: "issuingAuthorityName",
  providerIdentifierId: "providerIdentifierId",
  verificationReferenceNo: "verificationReferenceNo",
} as const;

export const PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE = "ROHINI_CODE";
export const PROVIDER_DETAIL_IDENTIFIER_TYPE_PROVIDER_CODE = "PROVIDER_CODE";
export const PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY = "ROHINI Registry Code";
export const PROVIDER_DETAIL_IDENTIFIER_TYPE_OLD_PROVIDER_CODE = "Old Provider Code";
export const PROVIDER_DETAIL_IDENTIFIER_TYPE_PAN_NO = "PAN NO";
export const PROVIDER_DETAIL_IDENTIFIER_TYPE_TAN_NO = "TAN NO";

/** Holder name applies only to PAN and TAN identifiers from the API. */
export const PROVIDER_DETAIL_IDENTIFIER_HOLDER_TYPE_NAMES = [
  PROVIDER_DETAIL_IDENTIFIER_TYPE_PAN_NO,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_TAN_NO,
] as const;

export function showsIdentifierHolderField(identifierTypeName: string): boolean {
  return PROVIDER_DETAIL_IDENTIFIER_HOLDER_TYPE_NAMES.includes(
    identifierTypeName as (typeof PROVIDER_DETAIL_IDENTIFIER_HOLDER_TYPE_NAMES)[number],
  );
}

/** Identifier Details overview — only Rohini and Old Provider Code rows. */
export const PROVIDER_OVERVIEW_IDENTIFIER_TYPE_NAMES = [
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_OLD_PROVIDER_CODE,
  PROVIDER_DETAIL_IDENTIFIER_TYPE_PROVIDER_CODE,
] as const;

export function isProviderOverviewIdentifierType(identifierTypeName: string): boolean {
  return PROVIDER_OVERVIEW_IDENTIFIER_TYPE_NAMES.includes(
    identifierTypeName as (typeof PROVIDER_OVERVIEW_IDENTIFIER_TYPE_NAMES)[number],
  );
}

export function isProviderRohiniIdentifierType(identifierTypeName: string): boolean {
  return (
    identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_CODE ||
    identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_ROHINI_REGISTRY
  );
}

export function isProviderOldCodeIdentifierType(identifierTypeName: string): boolean {
  return (
    identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_OLD_PROVIDER_CODE ||
    identifierTypeName === PROVIDER_DETAIL_IDENTIFIER_TYPE_PROVIDER_CODE
  );
}
