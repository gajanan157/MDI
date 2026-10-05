import type {
  ProviderInfrastructure,
  ProviderInfrastructureRoomDetail,
} from "@/store/features/providerInfrastructure/providerInfrastructureTypes";
import { readFieldValue } from "../../readFieldValue";
import { isApiRecord, toApiRecordArray } from "../apiPayloadHelpers";
import {
  INFRASTRUCTURE_KEYS,
  INFRASTRUCTURE_ROOM_KEYS,
} from "./infrastructureFieldKeys";

function getString(item: Record<string, unknown>, keys: readonly string[]): string {
  const value = readFieldValue(item, keys);
  if (value == null) return "";
  return String(value).trim();
}

function toNumberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeRoomDetail(raw: unknown): ProviderInfrastructureRoomDetail | null {
  if (!isApiRecord(raw)) return null;

  const providerBedTypeName =
    getString(raw, INFRASTRUCTURE_ROOM_KEYS.providerBedTypeName) || undefined;
  const providerBedCount = toNumberOrNull(
    readFieldValue(raw, INFRASTRUCTURE_ROOM_KEYS.providerBedCount),
  );

  if (!providerBedTypeName && providerBedCount == null) return null;

  return {
    providerInfrastructureDetailId:
      getString(raw, INFRASTRUCTURE_ROOM_KEYS.providerInfrastructureDetailId) || null,
    providerBedTypeId: getString(raw, INFRASTRUCTURE_ROOM_KEYS.providerBedTypeId) || null,
    providerBedTypeName: providerBedTypeName ?? null,
    providerBedCount,
  };
}

/** Normalizes infrastructure API payload once at the boundary. */
export function normalizeProviderInfrastructure(
  raw: unknown,
  providerId?: string,
): ProviderInfrastructure | null {
  if (!isApiRecord(raw)) return null;

  const totalBedCount = toNumberOrNull(
    readFieldValue(raw, INFRASTRUCTURE_KEYS.totalBedCount),
  );

  const roomDetailList = toApiRecordArray(
    readFieldValue(raw, INFRASTRUCTURE_KEYS.roomDetailList),
  )
    .map((row) => normalizeRoomDetail(row))
    .filter((row): row is ProviderInfrastructureRoomDetail => row != null);

  const hasData = totalBedCount != null || roomDetailList.length > 0;
  if (!hasData) return null;

  return {
    providerInfrastructureId:
      getString(raw, INFRASTRUCTURE_KEYS.providerInfrastructureId) || null,
    providerId: getString(raw, INFRASTRUCTURE_KEYS.providerId) || providerId || null,
    totalBedCount,
    roomDetailList,
  };
}
