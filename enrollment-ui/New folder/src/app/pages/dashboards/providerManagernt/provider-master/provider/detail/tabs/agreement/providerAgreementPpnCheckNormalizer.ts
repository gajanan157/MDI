import { unwrapProviderEntity } from "@/store/features/provider/providerAPI";
import {
  CHECK_PPN_STATE_CITY_KEYS,
  type NormalizedCheckPpnStateCityValidation,
} from "@/store/features/providerAgreement/providerAgreementTypes";
import { readFieldValue } from "../../utils/readFieldValue";
import { isApiRecord } from "../../utils/sectionMerges/apiPayloadHelpers";

const KEYS = CHECK_PPN_STATE_CITY_KEYS;

function readString(raw: Record<string, unknown>, key: string): string {
  const value = readFieldValue(raw, [key]);
  if (value == null) return "";
  return String(value).trim();
}

function readNullableString(raw: Record<string, unknown>, key: string): string | null {
  const value = readFieldValue(raw, [key]);
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function readBoolean(raw: Record<string, unknown>, key: string): boolean | null {
  const value = readFieldValue(raw, [key]);
  return typeof value === "boolean" ? value : null;
}

export const EMPTY_CHECK_PPN_STATE_CITY_VALIDATION: NormalizedCheckPpnStateCityValidation =
  {
    providerGipsaPpnStateId: null,
    providerGipsaPpnStateName: "",
    providerGipsaPpnStateAvailable: null,
    providerGipsaPpnStateMessage: "",
    providerGipsaPpnCityId: null,
    providerGipsaPpnCityName: "",
    providerGipsaPpnCityAvailable: null,
    providerGipsaPpnCityMessage: "",
    providerState: "",
    providerCity: "",
  };

/** Normalizes GET `/v1/provider/{id}/check-ppn-state-city` response. */
export function normalizeCheckPpnStateCityValidationResponse(
  raw: unknown,
): NormalizedCheckPpnStateCityValidation | null {
  const unwrapped = unwrapProviderEntity(raw);
  if (!isApiRecord(unwrapped)) return null;

  return {
    providerGipsaPpnStateId: readNullableString(
      unwrapped,
      KEYS.providerGipsaPpnStateId,
    ),
    providerGipsaPpnStateName: readString(
      unwrapped,
      KEYS.providerGipsaPpnStateName,
    ),
    providerGipsaPpnStateAvailable: readBoolean(
      unwrapped,
      KEYS.providerGipsaPpnStateAvailable,
    ),
    providerGipsaPpnStateMessage: readString(
      unwrapped,
      KEYS.providerGipsaPpnStateMessage,
    ),
    providerGipsaPpnCityId: readNullableString(unwrapped, KEYS.providerGipsaPpnCityId),
    providerGipsaPpnCityName: readString(unwrapped, KEYS.providerGipsaPpnCityName),
    providerGipsaPpnCityAvailable: readBoolean(
      unwrapped,
      KEYS.providerGipsaPpnCityAvailable,
    ),
    providerGipsaPpnCityMessage: readString(
      unwrapped,
      KEYS.providerGipsaPpnCityMessage,
    ),
    providerState: readString(unwrapped, KEYS.providerState),
    providerCity: readString(unwrapped, KEYS.providerCity),
  };
}
