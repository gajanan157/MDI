import type { BreadcrumbItem } from "@/components/shared/Breadcrumbs";

export const EXCLUDED_PROVIDER_LIST_PATH = "/provider-masters/excluded-hospitals";
export const BULK_EXCLUDE_PATH = `${EXCLUDED_PROVIDER_LIST_PATH}/bulk-exclude`;
export const BULK_EXCLUDE_STAGING_PATH_PREFIX = `${BULK_EXCLUDE_PATH}/inward`;

export function buildBulkExcludeStagingPath(inwardNo: string): string {
  return `${BULK_EXCLUDE_STAGING_PATH_PREFIX}/${encodeURIComponent(inwardNo.trim())}`;
}

export function parseBulkExcludeInwardNoFromPath(pathname: string): string | null {
  const prefix = `${BULK_EXCLUDE_STAGING_PATH_PREFIX}/`;
  if (!pathname.startsWith(prefix)) return null;

  const segment = pathname.slice(prefix.length).split("/")[0]?.trim();
  if (!segment) return null;

  return decodeURIComponent(segment);
}

const BULK_EXCLUDE_BASE_BREADCRUMBS: BreadcrumbItem[] = [
  { title: "Provider Management" },
  { title: "Provider Master" },
  { title: "Excluded Providers", path: EXCLUDED_PROVIDER_LIST_PATH },
];

export function buildBulkExcludeListBreadcrumbs(): BreadcrumbItem[] {
  return [
    ...BULK_EXCLUDE_BASE_BREADCRUMBS,
    { title: "Bulk Exclude" },
  ];
}

export function buildBulkExcludeStagingBreadcrumbs(
  inwardNo: string,
  onBackFromStaging: () => void,
): BreadcrumbItem[] {
  return [
    ...BULK_EXCLUDE_BASE_BREADCRUMBS,
    { title: "Bulk Exclude", onClick: onBackFromStaging },
    { title: inwardNo },
  ];
}

export function isBulkExcludePathname(pathname: string): boolean {
  return (
    pathname === BULK_EXCLUDE_PATH ||
    pathname.startsWith(`${BULK_EXCLUDE_PATH}/`)
  );
}
