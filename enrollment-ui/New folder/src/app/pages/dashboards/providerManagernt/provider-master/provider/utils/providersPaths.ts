/** Provider list route (network + non-network use the same page). */
export const PROVIDERS_LIST_PATH = "/provider-masters/providers";

/** Add provider full-page route. */
export const PROVIDERS_ADD_PATH = `${PROVIDERS_LIST_PATH}/new`;

/** Default tab segment for detail view (`:tabSlug` in router). */
export const PROVIDER_DETAILS_URL_SEGMENT = "provider-details";

/** `/provider-masters/providers/{id}` (no trailing tab). */
export function providerRootPath(providerId: string): string {
  return `/provider-masters/providers/${encodeURIComponent(providerId)}`;
}

export function providerBankDetailsPath(providerId: string): string {
  return `${providerRootPath(providerId)}/bank-details`;
}

export type ProviderBankDetailsNavState = {
  startBankDetailsEdit?: boolean;
};

/**
 * Listing → Provider Details tab, e.g.
 * `/provider-masters/providers/{uuid}/provider-details`
 */
export function providerDetailDefaultPath(providerId: string): string {
  return `${providerRootPath(providerId)}/${PROVIDER_DETAILS_URL_SEGMENT}`;
}
