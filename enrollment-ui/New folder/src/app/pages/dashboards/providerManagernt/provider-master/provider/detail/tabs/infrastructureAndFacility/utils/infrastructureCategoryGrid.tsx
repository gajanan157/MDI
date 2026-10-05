import type { ICellRendererParams, ColDef } from "ag-grid-community";
import clsx from "clsx";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  INFRA_CATEGORY_NAME_CLASS,
  INFRA_CATEGORY_ROW_CLASS,
  INFRA_TYPE_TITLE_CLASS,
  INFRASTRUCTURE_GRID_ROW_HEIGHT,
} from "./infrastructureCategoryUiConfig";
import { InfrastructureCategoryIcon } from "../components/InfrastructureCategoryIcon";
import { getInfrastructureCategoryIconTheme } from "./infrastructureCategoryIcons";
import {
  infrastructureAvailabilityCell,
  infrastructureOperationalStatusCell,
  infrastructureTotalCountCell,
  infrastructureVerifiedByCell,
  infrastructureVerifiedCell,
  infrastructureVerifiedOnCell,
} from "./infrastructureCategoryGridCells";
import { InfrastructureBooleanToggleCellEditor } from "../components/InfrastructureBooleanToggleCellEditor";
import { InfrastructureOperationalStatusCellEditor } from "../components/InfrastructureOperationalStatusCellEditor";
import { InfrastructureVerifiedOnCellEditor } from "../components/InfrastructureVerifiedOnCellEditor";
import type { InfrastructureCategoryGroup } from "./infrastructureCategoryTypes";
import {
  countApiFilledItems,
  formatInfrastructureCount,
  formatInfrastructureDisplayValue,
  INFRASTRUCTURE_CATEGORY_FIELD_LABELS,
} from "./mergeInfrastructureCategoryItems";

export type InfrastructureGridRow = {
  rowKey: string;
  isCategory: boolean;
  categoryId: string;
  categoryName?: string;
  infraCategory?: string;
  typeCount?: number;
  apiFilledCount?: number;
  canExpand?: boolean;
  itemIndex?: number;
  infraType?: string;
  description?: string;
  fromApi?: boolean;
  availabilityFlag?: boolean;
  totalCount?: number | null;
  operationalStatus?: string;
  remarks?: string;
  verifiedFlag?: boolean;
  verifiedBy?: string;
  verifiedOn?: string;
};

export type InfrastructureColumnKey =
  | "infraType"
  | "availabilityFlag"
  | "totalCount"
  | "operationalStatus"
  | "verifiedFlag"
  | "verifiedBy"
  | "verifiedOn"
  | "remarks";

const INFRASTRUCTURE_CENTER_ALIGNED_COLUMNS = new Set<InfrastructureColumnKey>([
  "availabilityFlag",
  "totalCount",
  "operationalStatus",
  "verifiedFlag",
  "verifiedBy",
  "verifiedOn",
]);

export function getInfrastructureColumnAlign(
  field: InfrastructureColumnKey,
): "left" | "center" {
  return INFRASTRUCTURE_CENTER_ALIGNED_COLUMNS.has(field) ? "center" : "left";
}

export function getInfrastructureCellClass(field: string): string {
  return `infra-grid-cell-${getInfrastructureColumnAlign(field as InfrastructureColumnKey)}`;
}

export function buildInfrastructureDisplayRows(
  groups: InfrastructureCategoryGroup[],
  expandedCategoryIds: ReadonlySet<string>,
  isEditMode = false,
): InfrastructureGridRow[] {
  const rows: InfrastructureGridRow[] = [];
  let itemIndexOffset = 0;

  for (const group of groups) {
    const apiFilledCount = countApiFilledItems(group.items);

    rows.push({
      rowKey: `category-${group.categoryId}`,
      isCategory: true,
      categoryId: group.categoryId,
      categoryName: group.categoryName,
      typeCount: group.items.length,
      apiFilledCount,
      canExpand: group.items.length > 0 || isEditMode,
    });

    if (expandedCategoryIds.has(group.categoryId)) {
      group.items.forEach((item, rowIndex) => {
        rows.push({
          rowKey: `${group.categoryId}-${item.infraType}`,
          isCategory: false,
          categoryId: group.categoryId,
          infraCategory: group.categoryName,
          itemIndex: itemIndexOffset + rowIndex,
          infraType: item.infraType,
          description: item.description,
          fromApi: item.fromApi,
          availabilityFlag: item.availabilityFlag,
          totalCount: item.totalCount,
          operationalStatus: item.operationalStatus,
          remarks: item.remarks,
          verifiedFlag: item.verifiedFlag,
          verifiedBy: item.verifiedBy,
          verifiedOn: item.verifiedOn,
        });
      });
    }

    itemIndexOffset += group.items.length;
  }

  return rows;
}

export function getInfrastructureMasterColumns({
  expandedCategoryIds,
  onToggleExpand,
  isEditMode,
}: Readonly<{
  expandedCategoryIds: ReadonlySet<string>;
  onToggleExpand: (categoryId: string) => void;
  isEditMode: boolean;
}>): ColDef<InfrastructureGridRow>[] {
  const isChildRow = (row?: InfrastructureGridRow) => Boolean(row && !row.isCategory);

  return [
    {
      field: "infraType",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.infraType,
      flex: 1.2,
      minWidth: 200,
      sortable: true,
      editable: false,
      cellClass: getInfrastructureCellClass("infraType"),
      headerClass: getInfrastructureCellClass("infraType"),
      cellRenderer: (params: ICellRendererParams<InfrastructureGridRow>) => {
        const row = params.data;
        if (!row) return null;
        if (row.isCategory) {
          const expanded = expandedCategoryIds.has(row.categoryId);
          const expandTheme = getInfrastructureCategoryIconTheme(row.categoryId);
          return (
            <div className={INFRA_CATEGORY_ROW_CLASS}>
              {row.canExpand ? (
                <button
                  type="button"
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm ring-1 transition",
                    expandTheme.boxClass,
                    expandTheme.iconClass,
                    "hover:opacity-80",
                  )}
                  title={expanded ? "Collapse category" : "Expand category"}
                  aria-expanded={expanded}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleExpand(row.categoryId);
                  }}
                >
                  {expanded ? (
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : null}
              <InfrastructureCategoryIcon categoryId={row.categoryId} />
              <span className={INFRA_CATEGORY_NAME_CLASS}>{row.categoryName}</span>
            </div>
          );
        }
        return (
          <span className={`${INFRA_TYPE_TITLE_CLASS} block pl-6 leading-tight`}>
            {row.infraType}
          </span>
        );
      },
    },
    {
      field: "availabilityFlag",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.availabilityFlag,
      width: 100,
      sortable: true,
      cellClass: getInfrastructureCellClass("availabilityFlag"),
      headerClass: getInfrastructureCellClass("availabilityFlag"),
      editable: (params: { data?: InfrastructureGridRow }) =>
        isEditMode && isChildRow(params.data),
      ...(isEditMode
        ? {
            cellRenderer: infrastructureAvailabilityCell,
            cellEditor: InfrastructureBooleanToggleCellEditor,
            cellEditorPopup: true,
          }
        : {
            cellRenderer: infrastructureAvailabilityCell,
          }),
    },
    {
      field: "totalCount",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.totalCount,
      width: 100,
      sortable: true,
      cellClass: getInfrastructureCellClass("totalCount"),
      headerClass: getInfrastructureCellClass("totalCount"),
      editable: (params: { data?: InfrastructureGridRow }) =>
        isEditMode && isChildRow(params.data),
      cellEditor: "agNumberCellEditor",
      cellRenderer: infrastructureTotalCountCell,
      valueFormatter: (params: {
        value?: number | null;
        data?: InfrastructureGridRow;
      }) => {
        if (!isChildRow(params.data)) return "";
        return formatInfrastructureCount(params.value ?? null);
      },
    },
    {
      field: "operationalStatus",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.operationalStatus,
      width: 140,
      sortable: true,
      cellClass: getInfrastructureCellClass("operationalStatus"),
      headerClass: getInfrastructureCellClass("operationalStatus"),
      editable: (params: { data?: InfrastructureGridRow }) =>
        isEditMode && isChildRow(params.data),
      cellRenderer: infrastructureOperationalStatusCell,
      ...(isEditMode
        ? {
            cellEditor: InfrastructureOperationalStatusCellEditor,
            cellEditorPopup: true,
          }
        : {}),
      valueFormatter: (params: {
        value?: string;
        data?: InfrastructureGridRow;
      }) => {
        if (!params.data) return String(params.value ?? "");
        if (!isChildRow(params.data)) return "";
        return formatInfrastructureDisplayValue(String(params.value ?? ""));
      },
    },
    {
      field: "verifiedFlag",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.verifiedFlag,
      width: 90,
      sortable: true,
      cellClass: getInfrastructureCellClass("verifiedFlag"),
      headerClass: getInfrastructureCellClass("verifiedFlag"),
      editable: (params: { data?: InfrastructureGridRow }) =>
        isEditMode && isChildRow(params.data),
      ...(isEditMode
        ? {
            cellRenderer: infrastructureVerifiedCell,
            cellEditor: InfrastructureBooleanToggleCellEditor,
            cellEditorPopup: true,
          }
        : {
            cellRenderer: infrastructureVerifiedCell,
          }),
    },
    {
      field: "verifiedBy",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.verifiedBy,
      width: 120,
      sortable: true,
      cellClass: getInfrastructureCellClass("verifiedBy"),
      headerClass: getInfrastructureCellClass("verifiedBy"),
      editable: (params: { data?: InfrastructureGridRow }) =>
        isEditMode && isChildRow(params.data),
      cellRenderer: infrastructureVerifiedByCell,
      valueFormatter: (params: {
        value?: string;
        data?: InfrastructureGridRow;
      }) => {
        if (!isChildRow(params.data)) return "";
        return formatInfrastructureDisplayValue(String(params.value ?? ""));
      },
    },
    {
      field: "verifiedOn",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.verifiedOn,
      width: 140,
      sortable: true,
      cellClass: getInfrastructureCellClass("verifiedOn"),
      headerClass: getInfrastructureCellClass("verifiedOn"),
      editable: (params: { data?: InfrastructureGridRow }) =>
        isEditMode && isChildRow(params.data),
      ...(isEditMode
        ? {
            cellRenderer: infrastructureVerifiedOnCell,
            cellEditor: InfrastructureVerifiedOnCellEditor,
            cellEditorPopup: true,
            cellEditorPopupPosition: "under" as const,
            valueParser: (params: { newValue: string | null | undefined }) => {
              const next = String(params.newValue ?? "").trim();
              if (!next) return "";
              return next.split("T")[0].slice(0, 10);
            },
          }
        : {
            cellRenderer: infrastructureVerifiedOnCell,
          }),
      valueFormatter: (params: {
        value?: string;
        data?: InfrastructureGridRow;
      }) => {
        if (!isChildRow(params.data)) return "";
        return formatInfrastructureDisplayValue(String(params.value ?? ""));
      },
    },
    {
      field: "remarks",
      headerName: INFRASTRUCTURE_CATEGORY_FIELD_LABELS.remarks,
      flex: 1,
      minWidth: 140,
      sortable: true,
      cellClass: getInfrastructureCellClass("remarks"),
      headerClass: getInfrastructureCellClass("remarks"),
      editable: (params: { data?: InfrastructureGridRow }) =>
        isEditMode && isChildRow(params.data),
      valueFormatter: (params: {
        value?: string;
        data?: InfrastructureGridRow;
      }) => {
        if (!isChildRow(params.data)) return "";
        return formatInfrastructureDisplayValue(String(params.value ?? ""));
      },
    },
  ] satisfies ColDef<InfrastructureGridRow>[];
}

export function getInfrastructureGridRowHeight(): number {
  return INFRASTRUCTURE_GRID_ROW_HEIGHT;
}

export function getInfrastructureGridRowClass(params: {
  data?: InfrastructureGridRow;
}) {
  if (params.data?.isCategory) {
    return "infra-grid-category-row";
  }
  return "infra-grid-child-row";
}
