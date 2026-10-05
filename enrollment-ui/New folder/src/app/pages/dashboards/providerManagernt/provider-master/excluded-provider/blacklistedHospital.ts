import type { TFunction } from "i18next";
import type { FieldItem } from "@/components/shared/dialog/ViewDialog/ViewDialog.types";
import { formatToDDMMMYYYY } from "../../shared/dateFormat";

export type BlacklistedBy = "TPA" | "INSURER" | "GLOBAL";

export type BlacklistedRow = {
  id: string;
  /** Original API record used by the detail dialog. */
  raw: Record<string, unknown>;
  icName: string;
  providerName: string;
  providerCode: string;
  address: string;
  effectiveFrom: string;
  remarkCategory: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  /** Who blacklisted the provider */
  blacklistedBy: BlacklistedBy;
  /** Detail: `providerBlacklistSource` from API, or "-" when null */
  excludedByDisplay?: string;
  insurerId?: string;
  providerIcCode?: string;
  providerIibRohiniCode?: string;
  /** Free-text remark from API */
  providerStatusReason?: string;
  providerBlacklistStartDate?: string;
  providerBlacklistMappingId?: string;
  providerBlacklistReasonCode?: string;
  effectiveTo?: string;
  providerBlacklistStatus?: string;
  providerBlacklistClaimScope?: string;
  providerFacilities?: string;
  tpaId?: string;
  tenantId?: string;
};

const FIELD_LABELS: Readonly<Record<string, string>> = {
  providerName: "Provider Name",
  providerCity: "City",
  providerAddress: "Address",
  providerPincode: "Pincode",
  providerState: "State",
  providerDistrict: "District",
  providerIcCode: "Provider IC Code",
  providerIibRohiniCode: "Rohini Code",
  providerStatusReason: "Remarks",
  providerBlacklistStartDate: "Blacklist Start Date",
  providerCode: "Provider Code",
  insurerName: "Insurer Company Name",
  providerBlacklistSource: "Excluded By",
  providerBlacklistReasonCode: "Reason Code",
  providerBlacklistReasonDescription: "Reason Description",
  providerBlacklistStatus: "Status",
  providerBlacklistClaimScope: "Claim Scope",
  providerBlacklistEffectiveFrom: "Effective From",
  providerBlacklistEffectiveTo: "Effective To",
};

const DATE_FIELDS = new Set([
  "providerBlacklistStartDate",
  "providerBlacklistEffectiveFrom",
  "providerBlacklistEffectiveTo",
]);

function isDisplayValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return (
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function humanizeFieldName(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatFieldValue(key: string, value: unknown): string {
  if (DATE_FIELDS.has(key) && typeof value === "string") {
    return formatToDDMMMYYYY(value);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

/** All Provider-Blacklist API fields for the detail dialog. */
export function getBlacklistedHospitalViewDialogFields(
  viewRow: BlacklistedRow | null,
  t: TFunction,
): FieldItem[] {
  if (!viewRow) {
    return [{ label: t("providerMaster.excludedProvider.view.providerName"), value: "-" }];
  }

  return Object.entries(viewRow.raw)
    .filter(([key, value]) => !key.toLowerCase().endsWith("id") && isDisplayValue(value))
    .map(([key, value]) => ({
      label: FIELD_LABELS[key] ?? humanizeFieldName(key),
      value: formatFieldValue(key, value),
      ...(key === "providerAddress" ? { colSpan: 3 as const } : {}),
    }));
}
