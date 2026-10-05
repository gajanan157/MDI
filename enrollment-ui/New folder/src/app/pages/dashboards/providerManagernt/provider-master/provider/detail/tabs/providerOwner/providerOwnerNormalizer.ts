import {
  PROVIDER_OWNER_KEYS as KEYS,
  type NormalizedProviderOwner,
} from "@/store/features/providerOwner/providerOwnerTypes";

function isOwnerRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string | number => typeof entry === "string" || typeof entry === "number")
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

export function normalizeProviderOwnerRow(raw: unknown): NormalizedProviderOwner | null {
  if (!isOwnerRecord(raw)) return null;

  const providerOwnerName = readString(raw, KEYS.providerOwnerName);
  if (!providerOwnerName) return null;

  return {
    providerOwnerId: readString(raw, KEYS.providerOwnerId),
    providerId: readString(raw, KEYS.providerId),
    providerOwnerName,
    providerOwnerPanNo: readString(raw, KEYS.providerOwnerPanNo),
    providerOwnerDesignation: readString(raw, KEYS.providerOwnerDesignation),
    providerOwnerQualification: readString(raw, KEYS.providerOwnerQualification),
    providerOwnerTelephone: readStringArray(raw[KEYS.providerOwnerTelephone]),
    providerOwnerMobile: readStringArray(raw[KEYS.providerOwnerMobile]),
    providerOwnerEmailId: readStringArray(raw[KEYS.providerOwnerEmailId]),
    providerOwnerGender: readString(raw, KEYS.providerOwnerGender),
    providerOwnerAddress: readString(raw, KEYS.providerOwnerAddress),
    providerOwnerState: readString(raw, KEYS.providerOwnerState),
    providerOwnerCity: readString(raw, KEYS.providerOwnerCity),
    providerOwnerPincode: readString(raw, KEYS.providerOwnerPincode),
    recordStatus: readString(raw, KEYS.recordStatus),
  };
}

export function normalizeProviderOwnerList(raw: unknown): NormalizedProviderOwner[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map(normalizeProviderOwnerRow)
      .filter((row): row is NormalizedProviderOwner => row != null);
  }
  if (!isOwnerRecord(raw)) return [];

  const nested = raw.data ?? raw.result ?? raw.payload;
  if (Array.isArray(nested)) {
    return nested
      .map(normalizeProviderOwnerRow)
      .filter((row): row is NormalizedProviderOwner => row != null);
  }
  return [];
}
