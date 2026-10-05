import {
  getApi,
  patchApi,
  providerApi,
  type ApiResponse,
} from "@/app/api/apiService";
import { unwrapProviderEntity } from "@/store/features/provider/providerAPI";
import {
  isApiRecord,
  toApiRecordArray,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";
import { readFieldValue } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/readFieldValue";
import type {
  ProviderManpower,
  ProviderManpowerPatchPayload,
  ProviderManpowerRow,
} from "./providerManpowerTypes";

const PROVIDER_PATH = "/v1/provider";

function isNotFound(status?: number, error?: string | null): boolean {
  if (status === 404) return true;
  return (error ?? "").trim().toLowerCase().includes("not found");
}

function getString(raw: Record<string, unknown>, keys: readonly string[]): string {
  const value = readFieldValue(raw, keys);
  return value == null ? "" : String(value).trim();
}

function toNumberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toBool(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(v)) return true;
    if (["false", "no", "n", "0"].includes(v)) return false;
  }
  return fallback;
}

function normalizeRow(raw: unknown): ProviderManpowerRow | null {
  if (!isApiRecord(raw)) return null;
  const manpowerType = getString(raw, ["manpowerType", "manpower_type", "manpowerTypeName"]);
  const employmentType = getString(raw, [
    "employmentType",
    "employment_type",
    "employmentTypeName",
  ]);
  if (!manpowerType && !employmentType) return null;

  return {
    providerManpowerDetailId:
      getString(raw, ["providerManpowerDetailId", "provider_manpower_detail_id"]) || null,
    manpowerType,
    employmentType,
    totalCount: toNumberOrNull(readFieldValue(raw, ["totalCount", "total_count"])),
    onDutyCount: toNumberOrNull(readFieldValue(raw, ["onDutyCount", "on_duty_count"])),
    onCallCount: toNumberOrNull(readFieldValue(raw, ["onCallCount", "on_call_count"])),
    trainedCount: toNumberOrNull(readFieldValue(raw, ["trainedCount", "trained_count"])),
    qualificationType: getString(raw, [
      "qualificationType",
      "qualification_type",
      "qualificationTypeName",
    ]),
    experienceYears: toNumberOrNull(
      readFieldValue(raw, ["experienceYears", "experience_years"]),
    ),
    isActive: toBool(readFieldValue(raw, ["isActive", "active_flag", "activeFlag"])),
  };
}

/** Normalizes the manpower API payload once at the boundary. */
export function normalizeProviderManpower(
  raw: unknown,
  providerId?: string,
): ProviderManpower | null {
  const entity = unwrapProviderEntity(raw);
  if (!isApiRecord(entity)) return null;

  const manpowerList = toApiRecordArray(
    readFieldValue(entity, ["manpowerList", "manpower_list", "manpowerDetails", "details"]),
  )
    .map(normalizeRow)
    .filter((row): row is ProviderManpowerRow => row != null);

  if (manpowerList.length === 0) return null;

  return {
    providerManpowerId:
      getString(entity, ["providerManpowerId", "provider_manpower_id"]) || null,
    providerId: getString(entity, ["providerId", "provider_id"]) || providerId || null,
    manpowerList,
  };
}

/** GET `/v1/provider/{providerId}/manpower` */
export async function getProviderManpower(
  providerId: string,
): Promise<ApiResponse<ProviderManpower | null>> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/manpower`;
  const res = await getApi<unknown>(providerApi, url);
  if (!res.success) {
    if (isNotFound(res.status, res.error)) {
      return { success: true, data: null, error: null, status: res.status };
    }
    return {
      success: false,
      data: null,
      error: res.error,
      status: res.status,
      errorPayload: res.errorPayload,
    };
  }
  return {
    success: true,
    data: normalizeProviderManpower(res.data, providerId),
    error: null,
  };
}

/** PATCH `/v1/provider/{providerId}/manpower` */
export async function patchProviderManpower(
  providerId: string,
  payload: ProviderManpowerPatchPayload,
): Promise<ApiResponse<ProviderManpower | null>> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/manpower`;
  const res = await patchApi<unknown, ProviderManpowerPatchPayload>(
    providerApi,
    url,
    payload,
  );
  if (!res.success) {
    return {
      success: false,
      data: null,
      error: res.error,
      status: res.status,
      errorPayload: res.errorPayload,
    };
  }
  return {
    success: true,
    data: normalizeProviderManpower(res.data, providerId),
    error: null,
  };
}
