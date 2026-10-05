/** One manpower row from GET/PATCH `/v1/provider/{id}/manpower`. */
export interface ProviderManpowerRow {
  providerManpowerDetailId?: string | null;
  manpowerType: string;
  employmentType: string;
  totalCount: number | null;
  onDutyCount: number | null;
  onCallCount: number | null;
  trainedCount: number | null;
  qualificationType: string;
  experienceYears: number | null;
  isActive: boolean;
}

/** Normalized provider manpower record for Redux state. */
export interface ProviderManpower {
  providerManpowerId?: string | null;
  providerId?: string | null;
  manpowerList: ProviderManpowerRow[];
}

/** PATCH body for `/v1/provider/{id}/manpower`. */
export interface ProviderManpowerPatchPayload {
  manpowerList?: ProviderManpowerRow[];
}

export interface ProviderManpowerState {
  data: ProviderManpower | null;
  providerId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
}
