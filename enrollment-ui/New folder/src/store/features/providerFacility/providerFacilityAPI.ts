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
  ProviderFacility,
  ProviderFacilityPatchPayload,
  ProviderFacilityRow,
} from "./providerFacilityTypes";

const PROVIDER_PATH = "/v1/provider";

function isNotFound(status?: number, error?: string | null): boolean {
  if (status === 404) return true;
  return (error ?? "").trim().toLowerCase().includes("not found");
}

function getString(raw: Record<string, unknown>, keys: readonly string[]): string {
  const value = readFieldValue(raw, keys);
  return value == null ? "" : String(value).trim();
}

function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(v)) return true;
    if (["false", "no", "n", "0"].includes(v)) return false;
  }
  return fallback;
}

function normalizeRow(raw: unknown): ProviderFacilityRow | null {
  if (!isApiRecord(raw)) return null;
  const facilityCategory = getString(raw, [
    "facilityCategory",
    "facility_category",
    "facilityCategoryName",
  ]);
  const facilityType = getString(raw, [
    "facilityType",
    "facility_type",
    "facilityTypeName",
  ]);
  if (!facilityCategory && !facilityType) return null;

  return {
    providerFacilityDetailId:
      getString(raw, ["providerFacilityDetailId", "provider_facility_detail_id"]) || null,
    facilityCategory,
    facilityType,
    availabilityFlag: toBool(
      readFieldValue(raw, ["availabilityFlag", "availability_flag"]),
    ),
    serviceMode: getString(raw, ["serviceMode", "service_mode", "serviceModeName"]),
    outsourcedVendor: getString(raw, ["outsourcedVendor", "outsourced_vendor"]),
    twentyFourBySevenFlag: toBool(
      readFieldValue(raw, [
        "twentyFourBySevenFlag",
        "twenty_four_by_seven_flag",
        "twentyFourBySeven",
      ]),
    ),
    emergencySupportFlag: toBool(
      readFieldValue(raw, ["emergencySupportFlag", "emergency_support_flag"]),
    ),
    operationalStatus: getString(raw, [
      "operationalStatus",
      "operational_status",
      "operationalStatusName",
    ]),
    registrationRequiredFlag: toBool(
      readFieldValue(raw, ["registrationRequiredFlag", "registration_required_flag"]),
    ),
    registrationNumber: getString(raw, ["registrationNumber", "registration_number"]),
    validFrom: getString(raw, ["validFrom", "valid_from"]),
    validUpto: getString(raw, ["validUpto", "valid_upto", "validTo", "valid_to"]),
    remarks: getString(raw, ["remarks", "remark"]),
    isActive: toBool(readFieldValue(raw, ["isActive", "active_flag", "activeFlag"]), true),
  };
}

/** Normalizes the facility API payload once at the boundary. */
export function normalizeProviderFacility(
  raw: unknown,
  providerId?: string,
): ProviderFacility | null {
  const entity = unwrapProviderEntity(raw);
  if (!isApiRecord(entity)) return null;

  const facilityList = toApiRecordArray(
    readFieldValue(entity, [
      "facilityList",
      "facility_list",
      "facilityDetails",
      "details",
    ]),
  )
    .map(normalizeRow)
    .filter((row): row is ProviderFacilityRow => row != null);

  if (facilityList.length === 0) return null;

  return {
    providerFacilityId:
      getString(entity, ["providerFacilityId", "provider_facility_id"]) || null,
    providerId: getString(entity, ["providerId", "provider_id"]) || providerId || null,
    facilityList,
  };
}

/** GET `/v1/provider/{providerId}/facility` */
export async function getProviderFacility(
  providerId: string,
): Promise<ApiResponse<ProviderFacility | null>> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/facility`;
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
    data: normalizeProviderFacility(res.data, providerId),
    error: null,
  };
}

/** PATCH `/v1/provider/{providerId}/facility` */
export async function patchProviderFacility(
  providerId: string,
  payload: ProviderFacilityPatchPayload,
): Promise<ApiResponse<ProviderFacility | null>> {
  const url = `${PROVIDER_PATH}/${encodeURIComponent(providerId)}/facility`;
  const res = await patchApi<unknown, ProviderFacilityPatchPayload>(
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
    data: normalizeProviderFacility(res.data, providerId),
    error: null,
  };
}
