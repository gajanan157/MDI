import { PROVIDER_GRID_DEFAULT_PAGE_SIZE } from "../../../../../../shared/providerGridPagination.constants";

export const INFRA_BADGE_SHAPE_CLASS = "rounded-sm";

/** Re-exports shared default so infrastructure grids stay aligned with list pages. */
export const INFRASTRUCTURE_GRID_PAGE_SIZE = PROVIDER_GRID_DEFAULT_PAGE_SIZE;
export const INFRASTRUCTURE_GRID_HEADER_HEIGHT = 28;
export const INFRASTRUCTURE_GRID_ROW_HEIGHT = 24;

/** Grid body height from actual visible rows (caps at page size). */
export function getInfrastructureGridBodyHeight(
  visibleRowCount: number,
  pageSize = INFRASTRUCTURE_GRID_PAGE_SIZE,
  headerHeight = INFRASTRUCTURE_GRID_HEADER_HEIGHT,
): number {
  const rows =
    visibleRowCount === 0 ? 1 : Math.min(Math.max(visibleRowCount, 1), pageSize);
  return headerHeight + rows * INFRASTRUCTURE_GRID_ROW_HEIGHT;
}

/** AG Grid SuperWrapper default header height in view mode. */
export const INFRASTRUCTURE_GRID_VIEW_HEADER_HEIGHT = 34;

export const INFRA_TYPE_TITLE_CLASS = "text-[11px] font-semibold text-slate-800";

export const INFRA_CATEGORY_ROW_CLASS =
  "flex min-w-0 items-center gap-2";

export const INFRA_CATEGORY_NAME_CLASS =
  "truncate text-[11px] font-bold tracking-tight text-slate-800";
