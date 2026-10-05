export type ProviderTaxonomyType =
  | "AMBULANCE"
  | "BLOOD_BANK"
  | "CLINIC"
  | "DENTAL"
  | "DIALYSIS"
  | "EYE_CARE"
  | "HOMECARE"
  | "HOSPITAL"
  | "IMAGING"
  | "LAB"
  | "ONCO_CENTER"
  | "PHARMACY"
  | "PRACTITIONER_ALLIED"
  | "PRACTITIONER_DENTAL"
  | "PRACTITIONER_MEDICAL"
  | "PRACTITIONER_NURSING"
  | "PRACTITIONER_PHARMACY"
  | "REHAB"
  | "SPECIALTY_GROUP";

/**
 * Query for GET `/v1/provider` — list + search (Apply/Reset in UI).
 * Uses 1-based `page` to match typical grid URLs (`?page=1&size=20`).
 * `providerRohiniCode` is sent as query param `providerIibRohiniCode` on the wire.
 */
export interface ProviderListQuery {
  providerName: string;
  providerRohiniCode: string;
  providerCode: string;
  /** Backend network filter for provider list API. */
  providerNetworkType?: "NETWORK" | "NON_NETWORK";
  /** Taxonomy provider type filter (e.g. HOSPITAL, CLINIC). */
  providerType?: ProviderTaxonomyType;
  /** Filter providers whose Rohini expiry falls within the next N days. */
  expiringInDays?: number;
  /** Filter by exact Rohini expiry date (`yyyy-MM-dd` → wire `providerIibRohiniEffectiveToDate`). */
  effectiveToDate?: string;
  /** Rohini status filter → wire `providerRohiniStatus` (`ROHINI_ACTIVE` | `ROHINI_EXPIRED`). */
  rohiniExpiryStatus?: "ROHINI_ACTIVE" | "ROHINI_EXPIRED";
  /** Multiselect agreement name keys → wire `providerAgreementNames`. */
  agreementTypes?: string[];
  /** Provider address postal code filter. */
  pincode?: string;
  /** Provider address state name filter. */
  state?: string;
  /** Provider address city name filter. */
  city?: string;
  /** Multiselect insurer ids when filtering by Insurer network source. */
  insurerIds?: string[];
  /** Network source filter (`TPA`, `INSURER`; omit when Both). */
  networkSource?: "TPA" | "INSURER";
  page: number;
  size: number;
  sortBy?: string;
  /** When true, request only providers with Rohini expiry in the next 30 days (`?expiringProvidersView=true`). */
  expiringProvidersView?: boolean;
}

/** Normalized row for Network Provider grid. */
export interface NetworkProviderRow {
  id: string;
  providerName: string;
  providerRohiniCode: string;
  address: string;
  city: string;
  state: string;
  providerCode: string;
  noOfBeds?: number | null;
  /** Taxonomy type from API (e.g. `HOSPITAL`, `CLINIC`). */
  providerType?: ProviderTaxonomyType;
  /** Network segmentation from API when present (`NETWORK` / `NON_NETWORK`). */
  providerNetworkType?: "NETWORK" | "NON_NETWORK";
  /** Default list network status from API. */
  globalProviderNetwork?: "NETWORK" | "NON_NETWORK";
  /** Network status when filtered by TPA source. */
  tpaProviderNetwork?: "NETWORK" | "NON_NETWORK";
  /** Network status when filtered by Insurer source. */
  insurerProviderNetwork?: "NETWORK" | "NON_NETWORK";
  networkSource?: string;
  effectiveToDate?: string | null;
  nextRenewalDueDate?: string | null;
}

/** Raw API page envelope — Spring `Page` or wrapped payloads. */
export type ProviderPageResponse = unknown;

/** POST `/v1/provider` — create provider body. */
export type CreateProviderBody = {
  providerName: string;
  providerTypeId: string;
  providerNetworkType: "NETWORK" | "NON_NETWORK";
  empanelmentSource?: "TPA" | "INSURER" | "HYBRID";
  insurerIds?: string[];
  providerRohiniNumber?: string;
  providerClinicalSpecialityIds?: string[];
  providerOwnershipType?: string;
  providerPanNo?: string;
  providerWebsiteUrl?: string;
  providerOfficialContactMobileNo?: string[];
  providerOfficialContactTelephoneNo?: string[];
  providerOfficialFaxNo?: string[];
  providerOfficialContactEmailId?: string[];
  providerAddress?: string;
  providerCity?: string;
  providerStateName?: string;
  providerDistrict?: string;
  providerPostalCode?: string;
};

export type CreateProviderResult = {
  data: unknown;
  message?: string;
};
