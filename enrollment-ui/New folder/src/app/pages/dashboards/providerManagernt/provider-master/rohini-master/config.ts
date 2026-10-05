import type { TFunction } from "i18next";
import type { FetchRohiniListArgs } from "@/store/features/providerRohini/providerRohiniSlice";
import type { ProviderRohiniRow as RohiniRow } from "@/store/features/providerRohini/providerRohiniTypes";
import { msUntilExpiry } from "../../shared/providerAgGrid";
import { formatToDDMMMYYYY } from "../../shared/dateFormat";

export type { ProviderRohiniRow as RohiniRow } from "@/store/features/providerRohini/providerRohiniTypes";

export { PROVIDER_GRID_PAGE_SIZE_OPTIONS as ROHINI_PAGE_SIZE_OPTIONS } from "../../shared/providerGridPagination.constants";


/** Scan-upload document type for Rohini hospital list inward. */
export const ROHINI_DOCUMENT_TYPE = "PROVIDER_ROHINI_RECORDS";

/** S3 sub-bucket for Rohini inward upload and activity-log downloads. */
export const ROHINI_S3_SUB_BUCKET = "MAINTENANCE NETWORK & MAPPING RECORDS";

export function normalizeRohiniSearchFilters(
  data: Record<string, unknown>,
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [key, raw] of Object.entries(data)) {
    if (raw === undefined || raw === null) continue;
    const value = String(raw).trim();
    if (value !== "") next[key] = value;
  }
  return next;
}

export function buildRohiniExportFilters(filters: Record<string, string>) {
  const trim = (value: unknown) => String(value ?? "").trim();
  return {
    providerName: trim(filters.providerName),
    providerRohiniCode: trim(filters.providerRohiniCode),
    state: trim(filters.state),
    district: trim(filters.district),
    city: trim(filters.city),
    pincode: trim(filters.pincode),
    filterStatus: trim(filters.filterStatus),
  };
}

export type RohiniListQuery = FetchRohiniListArgs;

export function buildRohiniListQuery(
  page: number,
  pageSize: number,
  filters: Record<string, string>,
  filterExpiring30Days: boolean,
): RohiniListQuery {
  return {
    page,
    size: pageSize,
    filters: buildRohiniExportFilters(filters),
    countExpiringInDays: filterExpiring30Days ? true : undefined,
  };
}

export function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const numberValue =
    typeof value === "number" ? value : Number.parseFloat(String(value).trim());
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function sortRohiniRowsByExpiry(rows: RohiniRow[]): RohiniRow[] {
  return [...rows].sort((a, b) => {
    const aMs = msUntilExpiry(a.rohiniExpiryDate);
    const bMs = msUntilExpiry(b.rohiniExpiryDate);
    const aExpired = aMs < 0 ? 1 : 0;
    const bExpired = bMs < 0 ? 1 : 0;

    if (aExpired !== bExpired) return aExpired - bExpired;
    return aMs - bMs;
  });
}

export function buildRohiniViewFields(row: RohiniRow | null, t: TFunction) {
  if (!row) return [];

  return [
    { label: t("providerMaster.table.providerName"), value: row.providerName },
    { label: t("providerMaster.rohiniMaster.rohiniCode"), value: row.providerRohiniCode },
    { label: t("providerMaster.table.address"), value: row.address, colSpan: 3 as const },
    { label: t("providerMaster.addForm.state"), value: row.state },
    { label: t("providerMaster.addForm.district"), value: row.district },
    { label: t("providerMaster.rohiniMaster.cityVillageTown"), value: row.city },
    { label: t("providerMaster.rohiniMaster.pinCode"), value: row.pincode },
    {
      label: t("providerMaster.rohiniMaster.registrationStatus"),
      value: row.registrationStatus ?? "—",
    },
    { label: t("providerMaster.rohiniMaster.networkType"), value: row.networkType ?? "—" },
    {
      label: t("providerMaster.rohiniMaster.recordStatusField"),
      value: row.recordStatus ?? "—",
    },
    { label: t("providerMaster.rohiniMaster.emailId"), value: row.email },
    { label: t("providerMaster.rohiniMaster.contactNumber"), value: row.contactNumber },
    { label: t("providerMaster.table.noOfBeds"), value: row.beds },
    { label: t("providerMaster.rohiniMaster.latitude"), value: row.latitude },
    { label: t("providerMaster.rohiniMaster.longitude"), value: row.longitude },
    {
      label: t("providerMaster.rohiniMaster.rohiniExpiredDate"),
      value: formatToDDMMMYYYY(row.rohiniExpiryDate),
    },
    {
      label: t("providerMaster.rohiniMaster.rohiniNextRenewalDueDate"),
      value: formatToDDMMMYYYY(row.rohiniNextRenewalDate),
    },
  ];
}
