import { useCallback, useMemo } from "react";
import type {
  CellValueChangedEvent,
  ColDef,
  ValueSetterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  QUALIFICATION_TYPE_OPTIONS,
  type ManpowerFormRow,
} from "../utils/manpowerTypes";
import { manpowerRowWarning } from "../utils/manpowerFormMapper";

ModuleRegistry.registerModules([AllCommunityModule]);

type ManpowerGridProps = {
  rows: ManpowerFormRow[];
  isEditMode: boolean;
  onRowChange?: (rowKey: string, patch: Partial<ManpowerFormRow>) => void;
  onRemoveRow?: (rowKey: string) => void;
};

const NUMERIC_FIELDS: (keyof ManpowerFormRow)[] = [
  "totalCount",
  "onDutyCount",
  "onCallCount",
  "trainedCount",
  "experienceYears",
];

function sanitizeInt(raw: unknown): string {
  return String(raw ?? "").replace(/\D/g, "");
}

export function ManpowerGrid({
  rows,
  isEditMode,
  onRowChange,
  onRemoveRow,
}: Readonly<ManpowerGridProps>) {
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ManpowerFormRow>) => {
      if (!isEditMode || !onRowChange || !event.data) return;
      const field = event.colDef.field as keyof ManpowerFormRow | undefined;
      if (!field) return;
      const value = NUMERIC_FIELDS.includes(field)
        ? sanitizeInt(event.newValue)
        : String(event.newValue ?? "");
      onRowChange(event.data.rowKey, { [field]: value } as Partial<ManpowerFormRow>);
    },
    [isEditMode, onRowChange],
  );

  const columnDefs = useMemo<ColDef<ManpowerFormRow>[]>(() => {
    const numberCol = (
      field: "totalCount" | "onDutyCount" | "onCallCount" | "trainedCount" | "experienceYears",
      headerName: string,
    ): ColDef<ManpowerFormRow> => ({
      field,
      headerName,
      width: 108,
      editable: isEditMode,
      cellEditor: "agTextCellEditor",
      valueSetter: (params: ValueSetterParams<ManpowerFormRow>) => {
        params.data[field] = sanitizeInt(params.newValue);
        return true;
      },
      cellClass: "tabular-nums text-right",
    });

    const cols: ColDef<ManpowerFormRow>[] = [
      {
        field: "manpowerType",
        headerName: "Manpower Type",
        minWidth: 150,
        flex: 1,
        editable: false,
        cellClass: "font-semibold text-slate-800",
      },
      {
        field: "employmentType",
        headerName: "Employment Type",
        minWidth: 140,
        editable: false,
      },
      numberCol("totalCount", "Total"),
      numberCol("onDutyCount", "On duty"),
      numberCol("onCallCount", "On call"),
      numberCol("trainedCount", "Trained"),
      {
        field: "qualificationType",
        headerName: "Qualification",
        minWidth: 140,
        editable: isEditMode,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: ["", ...QUALIFICATION_TYPE_OPTIONS] },
      },
      numberCol("experienceYears", "Exp. yrs"),
      {
        headerName: "",
        colId: "__warn",
        width: 44,
        editable: false,
        sortable: false,
        cellRenderer: (params: { data?: ManpowerFormRow }) => {
          const warning = params.data ? manpowerRowWarning(params.data) : null;
          return warning ? (
            <span title={warning} className="text-amber-600" aria-label={warning}>
              ⚠
            </span>
          ) : null;
        },
      },
    ];

    if (isEditMode && onRemoveRow) {
      cols.push({
        headerName: "",
        colId: "__remove",
        width: 44,
        editable: false,
        sortable: false,
        cellRenderer: (params: { data?: ManpowerFormRow }) =>
          params.data ? (
            <button
              type="button"
              aria-label="Remove row"
              onClick={() => onRemoveRow(params.data!.rowKey)}
              className="text-slate-400 hover:text-rose-600"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          ) : null,
      });
    }

    return cols;
  }, [isEditMode, onRemoveRow]);

  return (
    <div className="ag-grid-shell box-border flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="ag-theme-alpine min-h-[160px] w-full flex-1">
        <AgGridReact<ManpowerFormRow>
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, minWidth: 60 }}
          headerHeight={28}
          rowHeight={30}
          domLayout="autoHeight"
          getRowId={(params) => params.data.rowKey}
          singleClickEdit
          stopEditingWhenCellsLoseFocus
          onCellValueChanged={handleCellValueChanged}
          enableCellTextSelection
        />
      </div>
    </div>
  );
}
