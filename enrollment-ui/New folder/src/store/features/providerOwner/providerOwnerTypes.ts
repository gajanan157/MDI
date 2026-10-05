/** GET/POST/PATCH `/v1/provider/{providerId}/owner` field keys. */
export const PROVIDER_OWNER_KEYS = {
  providerOwnerId: "providerOwnerId",
  providerId: "providerId",
  providerOwnerName: "providerOwnerName",
  providerOwnerPanNo: "providerOwnerPanNo",
  providerOwnerDesignation: "providerOwnerDesignation",
  providerOwnerQualification: "providerOwnerQualification",
  providerOwnerTelephone: "providerOwnerTelephone",
  providerOwnerMobile: "providerOwnerMobile",
  providerOwnerEmailId: "providerOwnerEmailId",
  providerOwnerGender: "providerOwnerGender",
  providerOwnerAddress: "providerOwnerAddress",
  providerOwnerState: "providerOwnerState",
  providerOwnerCity: "providerOwnerCity",
  providerOwnerPincode: "providerOwnerPincode",
  recordStatus: "recordStatus",
} as const;

/** GET list query filters. */
export const PROVIDER_OWNER_LIST_FILTER_KEYS = {
  providerOwnerName: "providerOwnerName",
  providerOwnerPanNo: "providerOwnerPanNo",
  providerOwnerDesignation: "providerOwnerDesignation",
  providerOwnerQualification: "providerOwnerQualification",
} as const;

export type NormalizedProviderOwner = {
  providerOwnerId: string;
  providerId: string;
  providerOwnerName: string;
  providerOwnerPanNo: string;
  providerOwnerDesignation: string;
  providerOwnerQualification: string;
  providerOwnerTelephone: string[];
  providerOwnerMobile: string[];
  providerOwnerEmailId: string[];
  providerOwnerGender: string;
  providerOwnerAddress: string;
  providerOwnerState: string;
  providerOwnerCity: string;
  providerOwnerPincode: string;
  recordStatus: string;
};

export type ProviderOwnerListFilters = {
  providerOwnerName?: string;
  providerOwnerPanNo?: string;
  providerOwnerDesignation?: string;
  providerOwnerQualification?: string;
};

export type CreateProviderOwnerBody = {
  providerOwnerName: string;
  providerOwnerPanNo: string;
  providerOwnerDesignation: string;
  providerOwnerQualification: string;
  providerOwnerTelephone: string[];
  providerOwnerMobile: string[];
  providerOwnerEmailId: string[];
  providerOwnerGender: string;
  providerOwnerAddress: string;
  providerOwnerState: string;
  providerOwnerCity: string;
  providerOwnerPincode: number | null;
};

export type PatchProviderOwnerBody = CreateProviderOwnerBody & {
  providerOwnerId: string;
  providerId: string;
  recordStatus: string;
};

export type ProviderOwnerApiFailure = {
  ok: false;
  message?: string;
  status?: number;
};

export type FetchProviderOwnerListResult =
  | { ok: true; rows: NormalizedProviderOwner[] }
  | ProviderOwnerApiFailure;

export type FetchProviderOwnerByIdResult =
  | { ok: true; row: NormalizedProviderOwner }
  | ProviderOwnerApiFailure;

export type MutateProviderOwnerResult =
  | { ok: true; message?: string }
  | ProviderOwnerApiFailure;

export type ProviderOwnerRejectPayload = {
  message: string;
  status?: number;
};

export type ProviderOwnerListState = {
  providerId: string | null;
  rows: NormalizedProviderOwner[];
  loading: boolean;
  error: string | null;
};

export type ProviderOwnerDetailState = {
  providerId: string | null;
  ownerId: string | null;
  row: NormalizedProviderOwner | null;
  loading: boolean;
  error: string | null;
};

export type ProviderOwnerMutateState = {
  saving: boolean;
  error: string | null;
};

export type ProviderOwnerState = {
  list: ProviderOwnerListState;
  detail: ProviderOwnerDetailState;
  mutate: ProviderOwnerMutateState;
};
