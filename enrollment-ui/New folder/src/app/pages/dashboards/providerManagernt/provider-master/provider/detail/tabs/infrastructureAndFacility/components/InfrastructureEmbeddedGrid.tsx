import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellValueChangedEvent, ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import type { UseFormReturn } from "react-hook-form";
import Pagination from "@/components/shared/Pagination";
import {
  AgGridSuperWrapper,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../../../../../../shared/providerShell";
import type {
  InfrastructureCategoryFormValues,
  InfrastructureCategoryGroup,
} from "../utils/infrastructureCategoryTypes";
import { findInfrastructureFormItemIndex } from "../utils/mergeInfrastructureCategoryItems";
import {
  buildInfrastructureDisplayRows,
  getInfrastructureGridRowClass,
  getInfrastructureMasterColumns,
  type InfrastructureGridRow,
} from "../utils/infrastructureCategoryGrid";
import {
  INFRASTRUCTURE_GRID_PAGE_SIZE,
  INFRASTRUCTURE_GRID_ROW_HEIGHT,
} from "../utils/infrastructureCategoryUiConfig";

ModuleRegistry.registerModules([AllCommunityModule]);

export type InfrastructureEmbeddedGridProps = {
  readonly groups: InfrastructureCategoryGroup[];
  readonly isEditMode?: boolean;
  readonly form?: UseFormReturn<InfrastructureCategoryFormValues>;
};

type InfrastructureEditableGridProps = {
  readonly rowData: InfrastructureGridRow[];
  readonly columnDefs: ColDef<InfrastructureGridRow>[];
  readonly form: UseFormReturn<InfrastructureCategoryFormValues>;
  readonly onCellValueChanged: (
    event: CellValueChangedEvent<InfrastructureGridRow>,
  ) => void;
  readonly getRowHeight: (params: { data?: InfrastructureGridRow }) => number;
};

function InfrastructureEditableGrid({
  rowData,
  columnDefs,
  form,
  onCellValueChanged,
  getRowHeight,
}: Readonly<InfrastructureEditableGridProps>) {
  const gridApiRef = useRef<AgGridReact<InfrastructureGridRow> | null>(null);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: false,
      suppressMenu: false,
      resizable: true,
      minWidth: 50,
    }),
    [],
  );

  return (
    <div className="ag-grid-shell box-border flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="ag-theme-alpine min-h-0 w-full flex-1">
        <AgGridReact<InfrastructureGridRow>
          ref={gridApiRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          enableCellTextSelection
          ensureDomOrder
          rowSelection="single"
          suppressRowClickSelection
          headerHeight={28}
          domLayout="normal"
          getRowId={(params) => params.data.rowKey}
          getRowClass={getInfrastructureGridRowClass}
          getRowHeight={getRowHeight}
          onCellValueChanged={onCellValueChanged}
          context={{ isEditMode: true, form }}
          singleClickEdit
          stopEditingWhenCellsLoseFocus
        />
      </div>
    </div>
  );
}

export function InfrastructureEmbeddedGrid({
  groups,
  isEditMode = false,
  form,
}: Readonly<InfrastructureEmbeddedGridProps>) {
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => {
      const firstCategoryId = groups[0]?.categoryId;
      return firstCategoryId ? new Set([firstCategoryId]) : new Set();
    },
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(INFRASTRUCTURE_GRID_PAGE_SIZE);

  const toggleCategoryExpand = useCallback((categoryId: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  const displayRows = useMemo(
    () => buildInfrastructureDisplayRows(groups, expandedCategoryIds, isEditMode),
    [expandedCategoryIds, groups, isEditMode],
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayRows.slice(start, start + pageSize);
  }, [displayRows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [displayRows.length, pageSize]);

  const columns = useMemo(
    () =>
      getInfrastructureMasterColumns({
        expandedCategoryIds,
        onToggleExpand: toggleCategoryExpand,
        isEditMode,
      }),
    [expandedCategoryIds, isEditMode, toggleCategoryExpand],
  );

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<InfrastructureGridRow>) => {
      if (!isEditMode || !form) return;

      const row = event.data;
      const field = event.colDef.field as keyof InfrastructureGridRow | undefined;
      if (!row || row.isCategory || field == null || !row.infraCategory || !row.infraType) {
        return;
      }

      const formFieldMap: Partial<
        Record<
          keyof InfrastructureGridRow,
          keyof InfrastructureCategoryFormValues["items"][number]
        >
      > = {
        availabilityFlag: "availabilityFlag",
        totalCount: "totalCount",
        operationalStatus: "operationalStatus",
        remarks: "remarks",
        verifiedFlag: "verifiedFlag",
        verifiedBy: "verifiedBy",
        verifiedOn: "verifiedOn",
      };

      const formField = formFieldMap[field];
      if (!formField) return;

      const itemIndex = findInfrastructureFormItemIndex(
        form.getValues("items"),
        row.infraCategory,
        row.infraType,
      );
      if (itemIndex < 0) return;

      form.setValue(`items.${itemIndex}.${formField}`, event.newValue, {
        shouldDirty: true,
      });
    },
    [form, isEditMode],
  );

  const rowHeightGetter = useCallback(() => INFRASTRUCTURE_GRID_ROW_HEIGHT, []);

  return (
    <div className="infrastructure-master-grid relative flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {isEditMode && form ? (
          <InfrastructureEditableGrid
            rowData={paginatedRows}
            columnDefs={columns}
            form={form}
            onCellValueChanged={handleCellValueChanged}
            getRowHeight={rowHeightGetter}
          />
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AgGridSuperWrapper
              rowData={paginatedRows}
              columnDefs={columns}
              pagination={false}
              height="100%"
              domLayout="normal"
              getRowId={(params) => (params.data as InfrastructureGridRow).rowKey}
              getRowHeight={() => INFRASTRUCTURE_GRID_ROW_HEIGHT}
              getRowClass={(params) =>
                getInfrastructureGridRowClass({
                  data: params.data as InfrastructureGridRow | undefined,
                })
              }
              context={{ isEditMode: false }}
            />
          </div>
        )}
      </div>

      <div className="relative z-10 shrink-0 border-t border-slate-200 bg-white pt-1">
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={displayRows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
        />
      </div>
    </div>
  );
}
