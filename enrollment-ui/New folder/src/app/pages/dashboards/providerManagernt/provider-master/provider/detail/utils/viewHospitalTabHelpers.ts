import type { HospitalDetailRecord } from "../../hospitalData";
import { buildBlacklistedByIcs } from "../components/viewHospitalDetailPlaceholder.helpers";
import {
  PROVIDER_DETAILS_URL_SEGMENT,
} from "../../utils/providersPaths";
import { PROVIDER_TAB_SLUG_TO_ID } from "../providerViewTabSlugs";
import { getNetworkMappingRedirectPath } from "../utils/icMappingSubTabPaths";

export type ViewHospitalVerifyProps = {
  verifyDisabled: boolean;
  verifyDisabledTitle: string;
};

export function buildVerifyProps(
  canVerifyProvider: boolean,
  isNetworkRoute: boolean,
  networkProviderDetailsFetchOk: boolean,
): ViewHospitalVerifyProps {
  const verifyDisabled = !canVerifyProvider || (isNetworkRoute && !networkProviderDetailsFetchOk);
  const verifyDisabledTitle = !canVerifyProvider
    ? "No verify permission."
    : "Load provider details before verifying.";
  return { verifyDisabled, verifyDisabledTitle };
}

export function getTabProviderStatus(
  providerProfile: HospitalDetailRecord | null,
  hospital: HospitalDetailRecord | null,
  recordStatus?: string,
): string {
  return (recordStatus ?? providerProfile?.status ?? hospital?.status ?? "").trim();
}

export function buildTabStatusBarProps(
  providerProfile: HospitalDetailRecord | null,
  hospital: HospitalDetailRecord | null,
  recordStatus?: string,
) {
  const providerStatus = getTabProviderStatus(providerProfile, hospital, recordStatus);
  return {
    providerStatus,
    blacklistedByIcs: buildBlacklistedByIcs(providerProfile, hospital),
  };
}

/**
 * Resolves the active tab ID from a deep-link URL pathname.
 * Used in both `useViewHospitalPage` and `useViewHospitalTabNavigation` to avoid duplicating regex patterns.
 * Returns undefined when no deep-link sub-path is detected (caller falls back to tab slug).
 */
export function resolveActiveTabFromPath(pathname: string): string | undefined {
  if (
    /\/provider-mapped-with-ic-and-corporate\/provider-mapped-with-ic\/add-restriction\/?$/.test(pathname) ||
    /\/provider-mapped-with-ic-and-corporate\/provider-mapped-with-ic\/new-ic-mapping\/?$/.test(pathname)
  ) {
    return "ic-corporate";
  }
  if (
    /\/network-mapping(?:\/|$)/.test(pathname) ||
    /\/provider-restriction(?:\/|$)/.test(pathname)
  ) {
    return "ic-corporate";
  }
  if (
    /\/agreement\/[^/]+\/(view|edit)(?:\/?$)/.test(pathname) ||
    /\/agreement\/new-agreement(?:\/?$)/.test(pathname)
  ) {
    return "agreement";
  }
  if (/\/soc\/[^/]+\/(view|edit)(?:\/?$)/.test(pathname)) {
    return "soc";
  }
  if (/\/discount\/[^/]+\/(view|edit)(?:\/?$)/.test(pathname)) {
    return "hospital-discount";
  }
  if (/\/owner\/[^/]+(?:\/edit)?(?:\/?$)/.test(pathname)) {
    return "provider-owner";
  }
  return undefined;
}

export type ProviderTabNavigationSync = {
  tabId?: string;
  redirectPath?: string;
};

/** Resolves tab activation and optional redirect from provider detail URL. */
export function resolveProviderTabNavigationSync(
  pathname: string,
  providerBasePath: string,
  tabSlug: string | undefined,
): ProviderTabNavigationSync {
  if (!providerBasePath) return {};

  const fromDeep = resolveActiveTabFromPath(pathname);
  if (fromDeep) return { tabId: fromDeep };

  let remainder = "";
  if (pathname.startsWith(providerBasePath)) {
    remainder = pathname.slice(providerBasePath.length).replace(/^\//, "");
  }
  const firstSeg = remainder.split("/")[0] ?? "";

  if (
    firstSeg === "ic-mapping-details" ||
    firstSeg === "provider-mapped-with-ic-and-corporate" ||
    firstSeg === "provider-restriction"
  ) {
    return { tabId: "ic-corporate" };
  }

  const networkMappingRedirectPath = getNetworkMappingRedirectPath(pathname, providerBasePath);
  if (networkMappingRedirectPath) {
    return { tabId: "ic-corporate", redirectPath: networkMappingRedirectPath };
  }

  if (firstSeg && PROVIDER_TAB_SLUG_TO_ID[firstSeg]) {
    return { tabId: PROVIDER_TAB_SLUG_TO_ID[firstSeg]! };
  }

  if (tabSlug && PROVIDER_TAB_SLUG_TO_ID[tabSlug]) {
    if (tabSlug === "infrastructure" || tabSlug === "facility-management") {
      return {
        tabId: "infrastructure-facility",
        redirectPath: `${providerBasePath}/infrastructure-facility`,
      };
    }
    return { tabId: PROVIDER_TAB_SLUG_TO_ID[tabSlug]! };
  }

  if (remainder && firstSeg && !PROVIDER_TAB_SLUG_TO_ID[firstSeg]) {
    return { redirectPath: `${providerBasePath}/${PROVIDER_DETAILS_URL_SEGMENT}` };
  }

  return {};
}

export function getAgreementViewMode(
  agreementUrlSuffix: "view" | "edit" | undefined,
  isAgreementViewMode: boolean,
): boolean {
  if (agreementUrlSuffix === "edit") return false;
  if (agreementUrlSuffix === "view") return true;
  return isAgreementViewMode;
}
