import { providerRootPath } from "../../utils/providersPaths";

export const NETWORK_MAPPING_URL_SEGMENT = "network-mapping";
export const PROVIDER_RESTRICTION_URL_SEGMENT = "provider-restriction";

export type MappingSubTab = "ic" | "corporate";

export const MAPPING_SUB_TAB_SLUGS: Record<MappingSubTab, string> = {
  ic: "insurer",
  corporate: "corporate",
};

export const MAPPING_SUB_TAB_LABELS: Record<MappingSubTab, string> = {
  ic: "Insurance Company",
  corporate: "Corporate",
};

export type MappingDetailMode = "view" | "edit";

const MAPPING_DETAIL_PATH_PATTERN =
  /\/network-mapping\/(insurer|corporate)\/([^/]+)\/(view|edit)(?:\/|$)/;

const MAPPING_LIST_PATH_PATTERN =
  /\/network-mapping\/(insurer|corporate)\/?$/;

const RESTRICTION_DETAIL_PATH_PATTERN =
  /\/provider-restriction\/(insurer|corporate)\/([^/]+)\/(view|edit)(?:\/|$)/;

const RESTRICTION_LIST_PATH_PATTERN =
  /\/provider-restriction\/(insurer|corporate)\/([^/]+)\/?$/;

const RESTRICTION_CREATE_PATH_PATTERN =
  /\/provider-restriction\/(insurer|corporate)\/([^/]+)\/add(?:\/|$)/;

/** Network-mapping list or view/edit detail — not other provider tabs. */
export function isMappingDeepRoute(pathname: string): boolean {
  return (
    MAPPING_DETAIL_PATH_PATTERN.test(pathname) ||
    MAPPING_LIST_PATH_PATTERN.test(pathname) ||
    isLegacyNetworkMappingListPath(pathname)
  );
}

/** Restriction list, create, or detail URL — not the network-mapping grid. */
export function isRestrictionDeepRoute(pathname: string): boolean {
  return (
    RESTRICTION_DETAIL_PATH_PATTERN.test(pathname) ||
    RESTRICTION_CREATE_PATH_PATTERN.test(pathname) ||
    RESTRICTION_LIST_PATH_PATTERN.test(pathname)
  );
}

/** View/edit mapping detail — `GET /v1/provider/{id}/network-mapping/{mappingId}`. */
export function parseMappingDetailFromPath(pathname: string): {
  mappingId: string;
  mode: MappingDetailMode;
  subTab: MappingSubTab;
} | null {
  const match = pathname.match(MAPPING_DETAIL_PATH_PATTERN);
  if (!match) return null;
  const subTabSlug = match[1];
  const mappingId = match[2]?.trim() ?? "";
  const mode = match[3] as MappingDetailMode;
  const subTab: MappingSubTab = subTabSlug === "corporate" ? "corporate" : "ic";
  if (!mappingId || (mode !== "view" && mode !== "edit")) return null;
  return { mappingId, mode, subTab };
}

/** View/edit restriction detail — `GET /v1/provider-restriction/{providerRestrictionId}`. */
export function parseRestrictionDetailFromPath(pathname: string): {
  restrictionId: string;
  mode: MappingDetailMode;
  subTab: MappingSubTab;
} | null {
  const match = pathname.match(RESTRICTION_DETAIL_PATH_PATTERN);
  if (!match) return null;
  const subTabSlug = match[1];
  const restrictionId = match[2]?.trim() ?? "";
  const mode = match[3] as MappingDetailMode;
  const subTab: MappingSubTab = subTabSlug === "corporate" ? "corporate" : "ic";
  if (!restrictionId || (mode !== "view" && mode !== "edit")) return null;
  return { restrictionId, mode, subTab };
}

/** Restriction list for a mapped insurer/corporate — `GET /v1/provider-restriction`. */
export function parseRestrictionListFromPath(pathname: string): {
  entityId: string;
  subTab: MappingSubTab;
} | null {
  if (RESTRICTION_DETAIL_PATH_PATTERN.test(pathname)) return null;
  if (RESTRICTION_CREATE_PATH_PATTERN.test(pathname)) return null;
  const match = pathname.match(RESTRICTION_LIST_PATH_PATTERN);
  if (!match) return null;
  const subTabSlug = match[1];
  const entityId = match[2]?.trim() ?? "";
  const subTab: MappingSubTab = subTabSlug === "corporate" ? "corporate" : "ic";
  if (!entityId) return null;
  return { entityId, subTab };
}

export function buildRestrictionListPath(
  providerBasePath: string,
  subTab: MappingSubTab,
  entityId: string,
): string {
  return `${providerBasePath}/${PROVIDER_RESTRICTION_URL_SEGMENT}/${MAPPING_SUB_TAB_SLUGS[subTab]}/${encodeURIComponent(entityId)}`;
}

export function buildRestrictionListPathForProviderId(
  providerId: string,
  subTab: MappingSubTab,
  entityId: string,
): string {
  return buildRestrictionListPath(providerRootPath(providerId), subTab, entityId);
}

/** Add restriction under a mapped insurer/corporate — form shown on the list page. */
export function parseRestrictionCreateFromPath(pathname: string): {
  entityId: string;
  subTab: MappingSubTab;
} | null {
  const match = pathname.match(RESTRICTION_CREATE_PATH_PATTERN);
  if (!match) return null;
  const subTabSlug = match[1];
  const entityId = match[2]?.trim() ?? "";
  const subTab: MappingSubTab = subTabSlug === "corporate" ? "corporate" : "ic";
  if (!entityId) return null;
  return { entityId, subTab };
}

export function buildRestrictionCreatePath(
  providerBasePath: string,
  subTab: MappingSubTab,
  entityId: string,
): string {
  return `${providerBasePath}/${PROVIDER_RESTRICTION_URL_SEGMENT}/${MAPPING_SUB_TAB_SLUGS[subTab]}/${encodeURIComponent(entityId)}/add`;
}

export function buildRestrictionCreatePathForProviderId(
  providerId: string,
  subTab: MappingSubTab,
  entityId: string,
): string {
  return buildRestrictionCreatePath(providerRootPath(providerId), subTab, entityId);
}

export function buildMappingDetailPath(
  providerBasePath: string,
  subTab: MappingSubTab,
  mappingId: string,
  mode: MappingDetailMode,
): string {
  return `${providerBasePath}/${NETWORK_MAPPING_URL_SEGMENT}/${MAPPING_SUB_TAB_SLUGS[subTab]}/${encodeURIComponent(mappingId)}/${mode}`;
}

export function buildMappingDetailPathForProviderId(
  providerId: string,
  subTab: MappingSubTab,
  mappingId: string,
  mode: MappingDetailMode,
): string {
  return buildMappingDetailPath(providerRootPath(providerId), subTab, mappingId, mode);
}

export function buildRestrictionDetailPath(
  providerBasePath: string,
  subTab: MappingSubTab,
  restrictionId: string,
  mode: MappingDetailMode,
): string {
  return `${providerBasePath}/${PROVIDER_RESTRICTION_URL_SEGMENT}/${MAPPING_SUB_TAB_SLUGS[subTab]}/${encodeURIComponent(restrictionId)}/${mode}`;
}

export function buildRestrictionDetailPathForProviderId(
  providerId: string,
  subTab: MappingSubTab,
  restrictionId: string,
  mode: MappingDetailMode,
): string {
  return buildRestrictionDetailPath(
    providerRootPath(providerId),
    subTab,
    restrictionId,
    mode,
  );
}

/** List views only — detail/create/restriction deep routes keep in-memory sub-tab. */
export function isIcCorporateListPath(pathname: string): boolean {
  if (MAPPING_DETAIL_PATH_PATTERN.test(pathname)) return false;
  if (RESTRICTION_DETAIL_PATH_PATTERN.test(pathname)) return false;
  if (RESTRICTION_CREATE_PATH_PATTERN.test(pathname)) return false;
  if (RESTRICTION_LIST_PATH_PATTERN.test(pathname)) return false;
  return new RegExp(
    `/${NETWORK_MAPPING_URL_SEGMENT}(?:/(?:insurer|corporate))?/?$`,
  ).test(pathname);
}

export function isLegacyNetworkMappingListPath(pathname: string): boolean {
  return new RegExp(`/${NETWORK_MAPPING_URL_SEGMENT}/?$`).test(pathname);
}

export function isIcCorporateNetworkTabPath(pathname: string): boolean {
  return (
    isIcCorporateListPath(pathname) ||
    isLegacyNetworkMappingListPath(pathname) ||
    MAPPING_DETAIL_PATH_PATTERN.test(pathname) ||
    RESTRICTION_DETAIL_PATH_PATTERN.test(pathname) ||
    RESTRICTION_CREATE_PATH_PATTERN.test(pathname) ||
    RESTRICTION_LIST_PATH_PATTERN.test(pathname) ||
    /\/ic-corporate(?:\/|$)/.test(pathname) ||
    /\/provider-mapped-with-ic-and-corporate\//.test(pathname)
  );
}

export function parseMappingSubTabFromPath(pathname: string): MappingSubTab {
  if (
    /\/(?:ic-corporate|network-mapping|provider-restriction)\/corporate(?:\/|$)/.test(
      pathname,
    )
  ) {
    return "corporate";
  }
  return "ic";
}

export function buildMappingSubTabPath(
  providerBasePath: string,
  subTab: MappingSubTab,
): string {
  return `${providerBasePath}/${NETWORK_MAPPING_URL_SEGMENT}/${MAPPING_SUB_TAB_SLUGS[subTab]}`;
}

export function buildMappingSubTabPathForProviderId(
  providerId: string,
  subTab: MappingSubTab,
): string {
  return buildMappingSubTabPath(providerRootPath(providerId), subTab);
}

export function buildDefaultIcCorporateListPath(providerBasePath: string): string {
  return buildMappingSubTabPath(providerBasePath, "ic");
}

/** Redirect old `/ic-corporate` bookmarks to the new network-mapping URLs. */
export function getNetworkMappingRedirectPath(
  pathname: string,
  providerBasePath: string,
): string | null {
  if (/\/ic-corporate\/corporate\/?$/.test(pathname)) {
    return buildMappingSubTabPath(providerBasePath, "corporate");
  }
  if (/\/ic-corporate(?:\/insurer)?\/?$/.test(pathname)) {
    return buildMappingSubTabPath(providerBasePath, "ic");
  }
  if (isLegacyNetworkMappingListPath(pathname)) {
    return buildDefaultIcCorporateListPath(providerBasePath);
  }
  return null;
}
