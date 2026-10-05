import type { BreadcrumbItem } from "@/components/shared/Breadcrumbs";
import type { CellStyle } from "ag-grid-community";

export const BULK_IC_MAPPING_LIST_PATH = "/provider-masters/ic-corporate-mapping";
export const BULK_IC_MAPPING_ADD_PATH = `${BULK_IC_MAPPING_LIST_PATH}/add-new-network`;
export const BULK_IC_MAPPING_STAGING_PATH_PREFIX = `${BULK_IC_MAPPING_ADD_PATH}/inward`;

export function buildBulkIcMappingStagingPath(inwardNo: string): string {
  return `${BULK_IC_MAPPING_STAGING_PATH_PREFIX}/${encodeURIComponent(inwardNo.trim())}`;
}

/** Process form for an existing inward (dashboard Pending PROVIDER_IC_NETWORK_RECORDS). */
export function buildBulkIcMappingProcessPath(inwardNo: string): string {
  return `${buildBulkIcMappingStagingPath(inwardNo)}/process`;
}

export function isBulkIcMappingProcessPath(pathname: string): boolean {
  const prefix = `${BULK_IC_MAPPING_STAGING_PATH_PREFIX}/`;
  if (!pathname.startsWith(prefix)) return false;
  const rest = pathname.slice(prefix.length);
  const parts = rest.split("/").filter(Boolean);
  return parts.length >= 2 && parts[1] === "process";
}

export function parseBulkIcMappingInwardNoFromPath(pathname: string): string | null {
  const prefix = `${BULK_IC_MAPPING_STAGING_PATH_PREFIX}/`;
  if (!pathname.startsWith(prefix)) return null;

  const segment = pathname.slice(prefix.length).split("/")[0]?.trim();
  if (!segment) return null;

  return decodeURIComponent(segment);
}

const BULK_IC_MAPPING_BASE_BREADCRUMBS: BreadcrumbItem[] = [
  { title: "Provider Management" },
  { title: "Provider Master" },
  { title: "IC & Corp Provider Mapping", path: BULK_IC_MAPPING_LIST_PATH },
];

export const BULK_IC_MAPPING_INWARD_DOCUMENT_VIEW_PATH_PREFIX =
  "/inward-management/view-inward-document";

export function buildBulkIcMappingInwardDocumentViewPath(inwardNo: string): string {
  return `${BULK_IC_MAPPING_INWARD_DOCUMENT_VIEW_PATH_PREFIX}/${encodeURIComponent(inwardNo.trim())}`;
}

export type BulkIcMappingInwardDocumentNavState = {
  returnPath: string;
};

export function buildBulkIcMappingStagingBreadcrumbs(
  inwardNo: string,
  onBackFromStaging: () => void,
): BreadcrumbItem[] {
  return [
    ...BULK_IC_MAPPING_BASE_BREADCRUMBS,
    { title: "Bulk Ic Mapping", onClick: onBackFromStaging },
    { title: inwardNo },
  ];
}


/** Matches provider-module AG Grid typography (`layouts.css` → 11px cells). */
export const BULK_IC_MAPPING_GRID_CELL_STYLE: CellStyle = {
  fontSize: "11px",
  lineHeight: "1.25rem",
};

export const BULK_IC_MAPPING_GRID_TEXT_CELL_STYLE: CellStyle = {
  fontSize: "11px",
  lineHeight: "1.25rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

type ColumnWithCellStyle = {
  field?: string;
  /** AG Grid allows a style object or a style function; we only merge objects. */
  cellStyle?: CellStyle | ((...args: never[]) => unknown);
};

function isPlainCellStyle(value: unknown): value is CellStyle {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

export function applyBulkIcMappingGridCellStyle<T extends ColumnWithCellStyle>(
  columns: T[],
): T[] {
  return columns.map((column) => {
    const isActionsColumn = column.field === "actions";
    const baseStyle = isActionsColumn
      ? BULK_IC_MAPPING_GRID_CELL_STYLE
      : BULK_IC_MAPPING_GRID_TEXT_CELL_STYLE;
    const existingStyle = isPlainCellStyle(column.cellStyle)
      ? column.cellStyle
      : undefined;

    return {
      ...column,
      cellStyle: existingStyle ? { ...baseStyle, ...existingStyle } : baseStyle,
    };
  });
}
