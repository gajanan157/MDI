/** One facility row from GET/PATCH `/v1/provider/{id}/facility`. */
export interface ProviderFacilityRow {
  providerFacilityDetailId?: string | null;
  facilityCategory: string;
  facilityType: string;
  availabilityFlag: boolean;
  serviceMode: string;
  outsourcedVendor: string;
  twentyFourBySevenFlag: boolean;
  emergencySupportFlag: boolean;
  operationalStatus: string;
  registrationRequiredFlag: boolean;
  registrationNumber: string;
  validFrom: string;
  validUpto: string;
  remarks: string;
  isActive: boolean;
}

/** Normalized provider facility record for Redux state. */
export interface ProviderFacility {
  providerFacilityId?: string | null;
  providerId?: string | null;
  facilityList: ProviderFacilityRow[];
}

/** PATCH body for `/v1/provider/{id}/facility`. */
export interface ProviderFacilityPatchPayload {
  facilityList?: ProviderFacilityRow[];
}

export interface ProviderFacilityState {
  data: ProviderFacility | null;
  providerId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
}
