/** Field keys for provider list `identifiers[]` items (GET `/v1/provider`). */
export const PROVIDER_LIST_IDENTIFIER_KEYS = {
  identifiers: "identifiers",
  identifierTypeName: "identifierTypeName",
  identifierValue: "identifierValue",
  validTo: "validTo",
  isPrimary: "isPrimary",
} as const;


export const PROVIDER_LIST_IDENTIFIER_TYPE_ROHINI_REGISTRY = "ROHINI Registry Code";

export function isProviderListRohiniIdentifierType(identifierTypeName: string): boolean {
  return (
    identifierTypeName === PROVIDER_LIST_IDENTIFIER_TYPE_ROHINI_REGISTRY
  );
}
