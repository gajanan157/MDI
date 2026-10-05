import { downloadBlobFile } from "@/utils/dom/downloadBlobFile";
import { encodeAgreementRouteSegmentFromInternalId } from "./agreementHelpers";
import type { ProviderAuditLogContext } from "../../../shared/providerAuditLog";
import type { ProviderAgreementListFilters } from "@/store/features/providerAgreement/providerAgreementTypes";
import { AGREEMENT_NAME_OPTIONS } from "./agreementFormConfig";
import { extractProviderIdFromPath } from "../../../utils/viewHospitalHelpers";

export { extractProviderIdFromPath };

export const AGREEMENT_AUDIT_TAB_ID = "agreement" as const;

export type AgreementHospitalSummary = {
  status?: string;
  blacklistedByIcNames?: string[];
  hospitalName?: string;
} | null;

export type AgreementStatusBarConfig = {
  providerStatus: string;
  blacklistedByIcs: string[];
  canWrite: boolean;
  canVerify?: boolean;
  verifyDisabled: boolean;
  verifyDisabledTitle?: string;
  auditLog: ProviderAuditLogContext;
};

export type BuildAgreementStatusBarConfigInput = {
  hospital: AgreementHospitalSummary;
  canWrite: boolean;
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  providerId?: string;
};

export function resolveAgreementBlacklistedByIcs(
  icNames: string[] | undefined,
): string[] {
  return icNames?.length ? icNames : ["No IC information available"];
}

export function buildAgreementStatusBarConfig(
  input: BuildAgreementStatusBarConfigInput,
): AgreementStatusBarConfig {
  const providerStatus = (input.hospital?.status ?? "").trim();

  return {
    providerStatus,
    blacklistedByIcs: resolveAgreementBlacklistedByIcs(
      input.hospital?.blacklistedByIcNames,
    ),
    canWrite: input.canWrite,
    canVerify: input.canVerify,
    verifyDisabled: input.verifyDisabled ?? false,
    verifyDisabledTitle: input.verifyDisabledTitle,
    auditLog: {
      providerId: input.providerId,
      tabId: AGREEMENT_AUDIT_TAB_ID,
    },
  };
}

export function buildAgreementNavState(
  hospitalName: string | undefined,
  pathname: string,
) {
  return {
    providerName: hospitalName ?? "",
    tpaName: "MDIndia",
    returnTo: pathname,
  };
}

/** Navigation state when opening New Agreement from a pending network-mapping row. */
export type NewAgreementFromMappingNavState = {
  insurerId: string;
  insurerName?: string;
  providerNetworkMode?: string;
  insurerType?: string;
  networkSource?: "IC" | "TPA";
  returnTo?: string;
};

export function isNewAgreementFromNetworkMapping(
  state: NewAgreementFromMappingNavState | null | undefined,
): boolean {
  return Boolean(state?.insurerId?.trim());
}

export function shouldDisableAgreementNameFromMapping(
  state: NewAgreementFromMappingNavState | null | undefined,
): boolean {
  if (!isNewAgreementFromNetworkMapping(state)) return false;
  const networkMode = String(state?.providerNetworkMode ?? "").trim().toLowerCase();
  return networkMode !== "hybrid";
}

export function buildNewAgreementFromMappingNavState(
  item: {
    insurerId?: string;
    name?: string;
    insurerName?: string;
    insuranceCompanyName?: string;
    networkMode?: string;
    insurerType?: string;
    networkSource?: string;
  },
  returnTo: string,
): NewAgreementFromMappingNavState | null {
  const insurerId = String(item.insurerId ?? "").trim();
  if (!insurerId) return null;

  const insurerName =
    String(item.name ?? item.insurerName ?? item.insuranceCompanyName ?? "").trim() ||
    undefined;

  return {
    insurerId,
    insurerName,
    providerNetworkMode: String(item.networkMode ?? "").trim() || undefined,
    insurerType: String(item.insurerType ?? "").trim() || undefined,
    networkSource: normalizeMappingNetworkSource(item.networkSource),
    returnTo,
  };
}

export function isPsuInsurerType(insurerType: string | undefined): boolean {
  return String(insurerType ?? "").trim().toUpperCase() === "PSU";
}

export function isPrivateInsurerType(insurerType: string | undefined): boolean {
  return String(insurerType ?? "").trim().toUpperCase() === "PRIVATE";
}

export function normalizeMappingNetworkSource(
  networkSource: string | undefined,
): "IC" | "TPA" | undefined {
  const value = String(networkSource ?? "").trim().toUpperCase();
  if (value === "TPA") return "TPA";
  if (value === "IC" || value === "INSURER") return "IC";
  return undefined;
}

/**
 * Hybrid network + Insurer source + private IC → Insurer–Provider bipartite;
 * skip PPN state/city validation for this mapping flow.
 */
export function shouldSkipPpnCheckForHybridInsurerBipartite(input: {
  networkMode?: string;
  networkSource?: string;
  insurerType?: string;
}): boolean {
  const networkMode = String(input.networkMode ?? "").trim().toLowerCase();
  const networkSource = normalizeMappingNetworkSource(input.networkSource);
  return (
    networkMode === "hybrid" &&
    networkSource === "IC" &&
    isPrivateInsurerType(input.insurerType)
  );
}

/**
 * TPA empanelment source + TPA or Hybrid network mode → TPA–Provider bipartite;
 * skip PPN state/city validation (only GIPSA / PSU tripartite use PPN).
 */
export function shouldSelectTpaBipartiteFromMapping(input: {
  networkMode?: string;
  networkSource?: string;
}): boolean {
  const networkMode = String(input.networkMode ?? "").trim().toLowerCase();
  const networkSource = normalizeMappingNetworkSource(input.networkSource);
  return (
    networkSource === "TPA" &&
    (networkMode === "tpa" || networkMode === "hybrid")
  );
}

const HYBRID_BIPARTITE_AGREEMENT_OPTIONS = AGREEMENT_NAME_OPTIONS.filter(
  (option) =>
    option.value === "TPA_PROVIDER_BIPARTITE_AGREEMENT" ||
    option.value === "INSURER_PROVIDER_BIPARTITE_AGREEMENT",
);

export function getHybridBipartiteAgreementNameOptions(): typeof AGREEMENT_NAME_OPTIONS {
  return HYBRID_BIPARTITE_AGREEMENT_OPTIONS;
}

export type MappingAgreementNameContext = {
  networkMode: string;
  networkSource?: string;
  insurerType: string;
  insurerName: string;
};

export type MappingAgreementNameSelection = {
  agreementName: string;
  restrictToHybridBipartiteOptions: boolean;
};

export async function resolveInsurerNetworkMode(
  insurerId: string,
  networkModeFromMapping: string,
): Promise<string> {
  const trimmedMode = networkModeFromMapping.trim().toLowerCase();
  if (trimmedMode) return trimmedMode;

  const trimmedInsurerId = insurerId.trim();
  if (!trimmedInsurerId) return "";

  const { fetchInsurerNetworkModeValues } = await import(
    "@/store/features/providerIcCorporateMapping/providerIcCorporateMappingAPI"
  );
  const mode = await fetchInsurerNetworkModeValues(trimmedInsurerId).catch(() => null);
  return String(mode?.networkMode ?? "").trim().toLowerCase();
}

export function resolveMappingAgreementNameBeforePpn(
  context: MappingAgreementNameContext,
): MappingAgreementNameSelection | null {
  const { networkMode, networkSource, insurerType } = context;

  if (
    shouldSkipPpnCheckForHybridInsurerBipartite({
      networkMode,
      networkSource,
      insurerType,
    })
  ) {
    return {
      agreementName: "INSURER_PROVIDER_BIPARTITE_AGREEMENT",
      restrictToHybridBipartiteOptions: true,
    };
  }

  if (shouldSelectTpaBipartiteFromMapping({ networkMode, networkSource })) {
    return {
      agreementName: "TPA_PROVIDER_BIPARTITE_AGREEMENT",
      restrictToHybridBipartiteOptions: networkMode === "hybrid",
    };
  }

  if (networkMode === "insurer") {
    return {
      agreementName: "INSURER_PROVIDER_BIPARTITE_AGREEMENT",
      restrictToHybridBipartiteOptions: false,
    };
  }

  if (networkMode === "tpa") {
    return {
      agreementName: "TPA_PROVIDER_BIPARTITE_AGREEMENT",
      restrictToHybridBipartiteOptions: false,
    };
  }

  return null;
}

export function resolveMappingAgreementNameFromPpn(
  context: MappingAgreementNameContext & {
    ppnCityAvailable: boolean;
    ppnStateAvailable: boolean;
    isPsuInsurerLabel: (label: string) => boolean;
  },
): MappingAgreementNameSelection | null {
  const { networkMode, insurerType, insurerName, ppnCityAvailable, ppnStateAvailable } =
    context;

  if (ppnCityAvailable) {
    return {
      agreementName: "GIPSA_PPN_TRIPARTITE_AGREEMENT",
      restrictToHybridBipartiteOptions: false,
    };
  }

  const isPsu =
    isPsuInsurerType(insurerType) ||
    (insurerName ? context.isPsuInsurerLabel(insurerName) : false);
  if (isPsu && ppnStateAvailable && !ppnCityAvailable) {
    return {
      agreementName: "PSU_TRIPARTITE_AGREEMENT",
      restrictToHybridBipartiteOptions: false,
    };
  }

  if (networkMode === "hybrid") {
    return {
      agreementName: "TPA_PROVIDER_BIPARTITE_AGREEMENT",
      restrictToHybridBipartiteOptions: true,
    };
  }

  return null;
}

export function buildProviderAgreementPath(
  suffix: "view" | "edit",
  internalId: string,
  options: {
    providerBasePath?: string;
    pathname: string;
  },
): string | null {
  const key = encodeAgreementRouteSegmentFromInternalId(internalId);

  if (options.providerBasePath) {
    return `${options.providerBasePath}/agreement/${key}/${suffix}`;
  }

  const providerId = extractProviderIdFromPath(options.pathname);
  if (!providerId) return null;

  return `/provider-masters/providers/${providerId}/agreement/${key}/${suffix}`;
}

export function openAgreementPdf(pdfUrl: string) {
  window.open(pdfUrl, "_blank", "noopener,noreferrer");
}

export async function downloadAgreementPdf(
  pdfUrl: string,
  documentName: string,
) {
  const name = documentName.trim() || "agreement.pdf";
  const filename = name.endsWith(".pdf") ? name : `${name}.pdf`;

  try {
    const res = await fetch(pdfUrl);
    if (
      !pdfUrl.startsWith("blob:") &&
      !pdfUrl.startsWith("data:") &&
      !res.ok
    ) {
      throw new Error(String(res.status));
    }
    const blob = await res.blob();
    downloadBlobFile({ blob, filename });
  } catch {
    openAgreementPdf(pdfUrl);
  }
}

/** Maps UI list-search values to API filter enums. */
export function mapListFilterAgreementTypeToApi(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === "bipartite") return "BIPARTITE";
  if (normalized === "tripartite") return "TRIPARTITE";
  return undefined;
}

export function mapListFilterStatusToApi(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === "active") return "ACTIVE";
  if (normalized === "terminated") return "TERMINATED";
  if (normalized === "expired") return "EXPIRED";
  if (normalized === "draft") return "DRAFT";
  return undefined;
}

/** Maps side-panel agreement name text to API `providerAgreementName`. */
export function mapColumnFilterAgreementNameToApi(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  const exactOption = AGREEMENT_NAME_OPTIONS.find(
    (option) => option.value.toLowerCase() === normalized,
  );
  if (exactOption) return exactOption.value;

  const partialOption = AGREEMENT_NAME_OPTIONS.find(
    (option) =>
      option.value.toLowerCase().includes(normalized) ||
      option.label.toLowerCase().includes(normalized),
  );
  if (partialOption) return partialOption.value;

  const raw = value.trim();
  if (/^[A-Z0-9_]+$/i.test(raw)) {
    return raw.toUpperCase();
  }

  return raw;
}

/** Maps side-panel text input to API enum for agreement type. */
export function mapColumnFilterTypeToApi(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized.includes("trip")) return "TRIPARTITE";
  if (normalized.includes("bi")) return "BIPARTITE";
  return mapListFilterAgreementTypeToApi(value);
}

/** Maps side-panel text input to API enum for agreement status. */
export function mapColumnFilterStatusToApi(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized.includes("draft")) return "DRAFT";
  if (normalized.includes("terminat")) return "TERMINATED";
  if (normalized.includes("expir")) return "EXPIRED";
  if (normalized.includes("active")) return "ACTIVE";
  return mapListFilterStatusToApi(value);
}

export function mapFormAgreementTypeToApi(value: string): string {
  return value.trim().toLowerCase() === "tripartite" ? "TRIPARTITE" : "BIPARTITE";
}

export function mapFormStatusToApi(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (normalized === "DRAFT") return "DRAFT";
  if (normalized === "INACTIVE") return "INACTIVE";
  return "ACTIVE";
}

export function mapApiAgreementTypeToDisplay(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (normalized === "TRIPARTITE") return "Tripartite";
  return "Bipartite";
}

export function mapApiStatusToDisplay(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (normalized === "TERMINATED") return "Terminated";
  if (normalized === "EXPIRED") return "Expired";
  if (normalized === "ACTIVE") return "Active";
  return value;
}

export function mapApiAgreementTypeToFormType(value: string): string {
  return value.trim().toUpperCase() === "TRIPARTITE" ? "tripartite" : "bipartite";
}

export type ProviderAgreementUiListFilters = {
  agreementType?: string;
  scope?: string;
  status?: string;
};

export type AgreementColumnFilterInput = Partial<
  Record<"type" | "scope" | "status" | "agreementName" | "applicableIcs" | "effectiveFromDisplay", string>
>;

export function buildProviderAgreementListFilters(
  _providerId: string,
  uiFilters: ProviderAgreementUiListFilters,
  columnFilters?: AgreementColumnFilterInput,
  page = 1,
  size = 20,
): ProviderAgreementListFilters {
  const filters: ProviderAgreementListFilters = {
    page,
    size,
  };

  const providerAgreementName = mapColumnFilterAgreementNameToApi(
    String(columnFilters?.agreementName ?? ""),
  );
  const providerAgreementType =
    mapColumnFilterTypeToApi(String(columnFilters?.type ?? "")) ??
    mapListFilterAgreementTypeToApi(String(uiFilters.agreementType ?? ""));
  const applicableScope =
    String(columnFilters?.scope ?? "").trim() ||
    String(uiFilters.scope ?? "").trim() ||
    undefined;
  const providerAgreementStatus =
    mapColumnFilterStatusToApi(String(columnFilters?.status ?? "")) ??
    mapListFilterStatusToApi(String(uiFilters.status ?? ""));

  if (providerAgreementName) filters.providerAgreementName = providerAgreementName;
  if (providerAgreementType) filters.providerAgreementType = providerAgreementType;
  if (applicableScope) filters.applicableScope = applicableScope;
  if (providerAgreementStatus) filters.providerAgreementStatus = providerAgreementStatus;

  return filters;
}

export function isUnfilteredProviderAgreementListRequest(
  filters?: ProviderAgreementListFilters,
): boolean {
  if (!filters) return true;
  return (
    !filters.providerAgreementName?.trim() &&
    !filters.providerAgreementType?.trim() &&
    !filters.providerAgreementStatus?.trim() &&
    !filters.applicableScope?.trim()
  );
}
