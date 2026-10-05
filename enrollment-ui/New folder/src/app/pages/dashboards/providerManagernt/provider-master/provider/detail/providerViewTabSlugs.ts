import { PROVIDER_DETAILS_URL_SEGMENT } from "../utils/providersPaths";

/** Internal tab id → URL segment (after /providers/:id/) */
export const PROVIDER_TAB_ID_TO_SLUG: Record<string, string> = {
  "hospital-details": PROVIDER_DETAILS_URL_SEGMENT,
  agreement: "agreement",
  "provider-owner": "owner",
  "infrastructure-facility": "infrastructure-facility",
  "owners-info": "owners-info",
  "ic-corporate": "network-mapping",
  "bank-details": "bank-details",
  "hospital-document": "documents",
  soc: "soc",
  "hospital-discount": "discount",
};

export const PROVIDER_TAB_SLUG_TO_ID: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(PROVIDER_TAB_ID_TO_SLUG).map(([tabId, slug]) => [slug, tabId]),
  ),
  // Legacy URLs still open the combined tab.
  infrastructure: "infrastructure-facility",
  "facility-management": "infrastructure-facility",
};
