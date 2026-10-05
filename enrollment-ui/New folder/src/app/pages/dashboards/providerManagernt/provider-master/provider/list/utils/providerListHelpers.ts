import type {
  NetworkProviderRow,
  ProviderListQuery,
  ProviderTaxonomyType,
} from "@/store/features/provider/providerTypes";
import type { ProviderGridRow, ProviderNetworkType } from "./providerGridColumns";

export type ProviderNetworkTypeFilter = ProviderNetworkType | "BOTH";

export type ProviderNetworkSourceFilter = "TPA" | "INSURER" | "BOTH";

/** UI/API values for filtering providers by Rohini expiry state. */
export type RohiniExpiryStatusFilter = "ALL" | "ACTIVE" | "EXPIRED";

export type ProviderSearchFilters = {
  hospitalName?: string;
  rohiniCode?: string;
  providerCode?: string;
  providerNetworkType?: ProviderNetworkTypeFilter;
  providerType?: ProviderTaxonomyType;
  networkSource?: ProviderNetworkSourceFilter;
  expiringInDays?: string;
  /** Rohini registration expiry date (`yyyy-MM-dd`) → API `providerIibRohiniEffectiveToDate`. */
  rohiniExpiryDate?: string;
  /** All / Active / Expired Rohini → API `providerRohiniStatus`. */
  rohiniExpiryStatus?: RohiniExpiryStatusFilter | string;
  /** Multiselect agreement name keys → API `providerAgreementNames`. */
  agreementTypes?: string | string[];
  pincode?: string;
  state?: string;
  city?: string;
  /** Multiselect insurer company ids when Network Source is Insurer. */
  insurerIds?: string | string[];
};

export function validateOptionalDigitsOnly(
  value: unknown,
  fieldLabel: string,
): true | string {
  const raw = String(value ?? "").trim();
  if (!raw) return true;
  return /^\d+$/.test(raw) ? true : `${fieldLabel} must contain numbers only`;
}

export function validateOptionalPositiveDays(value: unknown): true | string {
  const raw = String(value ?? "").trim();
  if (!raw) return true;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? true : "Enter a valid number of days";
}

export function resolveApiNetworkType(
  value?: ProviderNetworkTypeFilter,
): ProviderNetworkType | undefined {
  if (value === "NETWORK" || value === "NON_NETWORK") return value;
  return undefined;
}

export function parsePositiveDays(value: unknown): number | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function resolveApiNetworkSource(
  value?: ProviderNetworkSourceFilter,
): "TPA" | "INSURER" | undefined {
  if (value === "TPA" || value === "INSURER") return value;
  return undefined;
}

export function resolveApiRohiniExpiryStatus(
  value?: RohiniExpiryStatusFilter | string,
): "ROHINI_ACTIVE" | "ROHINI_EXPIRED" | undefined {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "ACTIVE" || normalized === "ROHINI_ACTIVE") {
    return "ROHINI_ACTIVE";
  }
  if (normalized === "EXPIRED" || normalized === "ROHINI_EXPIRED") {
    return "ROHINI_EXPIRED";
  }
  return undefined;
}

export function parseIsoDateOnly(value: unknown): string | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  // CommonSearch date fields store `yyyy-MM-dd`.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  return raw;
}

/** Normalize multiselect / single / CSV agreement type values for the list API. */
export function parseAgreementTypeFilters(value: unknown): string[] | undefined {
  const values = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((entry) => entry.trim());
  const cleaned = values
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

export function parseIdListFilters(value: unknown): string[] | undefined {
  return parseAgreementTypeFilters(value);
}

export function buildProviderListQuery(
  filters: ProviderSearchFilters,
  page: number,
  pageSize: number,
): Partial<ProviderListQuery> {
  const networkSource = resolveApiNetworkSource(filters.networkSource);
  return {
    page,
    size: pageSize,
    providerName: String(filters.hospitalName ?? "").trim(),
    providerRohiniCode: String(filters.rohiniCode ?? "")
      .replace(/\D/g, "")
      .trim(),
    providerCode: String(filters.providerCode ?? "").trim(),
    providerNetworkType: resolveApiNetworkType(filters.providerNetworkType),
    providerType: filters.providerType,
    networkSource,
    expiringInDays: parsePositiveDays(filters.expiringInDays),
    effectiveToDate: parseIsoDateOnly(filters.rohiniExpiryDate),
    rohiniExpiryStatus: resolveApiRohiniExpiryStatus(filters.rohiniExpiryStatus),
    agreementTypes: parseAgreementTypeFilters(filters.agreementTypes),
    pincode:
      String(filters.pincode ?? "")
        .replace(/\D/g, "")
        .trim() || undefined,
    state: String(filters.state ?? "").trim() || undefined,
    city: String(filters.city ?? "").trim() || undefined,
    insurerIds:
      networkSource === "INSURER"
        ? parseIdListFilters(filters.insurerIds)
        : undefined,
  };
}

export function resolveDisplayProviderNetworkType(
  row: NetworkProviderRow,
  networkSourceFilter?: ProviderNetworkSourceFilter,
): ProviderNetworkType | undefined {
  if (networkSourceFilter === "TPA") {
    return row.tpaProviderNetwork;
  }
  if (networkSourceFilter === "INSURER") {
    return row.insurerProviderNetwork;
  }
  return row.globalProviderNetwork;
}

export function toProviderGridRow(
  row: NetworkProviderRow,
  networkSourceFilter?: ProviderNetworkSourceFilter,
): ProviderGridRow {
  return {
    ...row,
    providerNetworkType: resolveDisplayProviderNetworkType(row, networkSourceFilter),
  };
}
