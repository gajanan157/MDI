import { useCallback, useMemo } from "react";
import type {
  CellClassParams,
  CellValueChangedEvent,
  ColDef,
  EditableCallbackParams,
  ValueGetterParams,
  ValueSetterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  FACILITY_OPERATIONAL_STATUS_OPTIONS,
  SERVICE_MODE_OPTIONS,
  type FacilityFormRow,
} from "../utils/facilityTypes";
import {
  facilityFieldEditable,
  facilityRowWarning,
} from "../utils/facilityFormMapper";

ModuleRegistry.registerModules([AllCommunityModule]);

type FacilityGridProps = {
  rows: FacilityFormRow[];
  isEditMode: boolean;
  onRowChange?: (rowKey: string, patch: Partial<FacilityFormRow>) => void;
  onRemoveRow?: (rowKey: string) => void;
};

const YES_NO = ["Yes", "No"];
const BOOL_FIELDS: (keyof FacilityFormRow)[] = [
  "availabilityFlag",
  "twentyFourBySevenFlag",
  "emergencySupportFlag",
  "registrationRequiredFlag",
];

export function FacilityGrid({
  rows,
  isEditMode,
  onRowChange,
  onRemoveRow,
}: Readonly<FacilityGridProps>) {
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<FacilityFormRow>) => {
      if (!isEditMode || !onRowChange || !event.data) return;
      const field = event.colDef.field as keyof FacilityFormRow | undefined;
      if (!field) return;
      let value: unknown = event.newValue;
      if (BOOL_FIELDS.includes(field)) value = event.newValue === "Yes";
      else value = String(event.newValue ?? "");
      onRowChange(event.data.rowKey, { [field]: value } as Partial<FacilityFormRow>);
    },
    [isEditMode, onRowChange],
  );

  const columnDefs = useMemo<ColDef<FacilityFormRow>[]>(() => {
    const boolCol = (
      field:
        | "availabilityFlag"
        | "twentyFourBySevenFlag"
        | "emergencySupportFlag"
        | "registrationRequiredFlag",
      headerName: string,
    ): ColDef<FacilityFormRow> => ({
      field,
      headerName,
      width: 96,
      editable: isEditMode,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: YES_NO },
      valueGetter: (params: ValueGetterParams<FacilityFormRow>) =>
        params.data?.[field] ? "Yes" : "No",
      valueSetter: (params: ValueSetterParams<FacilityFormRow>) => {
        (params.data[field] as boolean) = params.newValue === "Yes";
        return true;
      },
      cellClass: (params: CellClassParams<FacilityFormRow>) =>
        params.value === "Yes" ? "text-emerald-700 font-semibold" : "text-slate-500",
    });

    const textCol = (
      field:
        | "outsourcedVendor"
        | "registrationNumber"
        | "validFrom"
        | "validUpto"
        | "remarks",
      headerName: string,
      width = 130,
    ): ColDef<FacilityFormRow> => ({
      field,
      headerName,
      width,
      editable: (params: EditableCallbackParams<FacilityFormRow>) =>
        isEditMode && !!params.data && facilityFieldEditable(field, params.data),
      cellClass: (params: CellClassParams<FacilityFormRow>) =>
        params.data && !facilityFieldEditable(field, params.data)
          ? "bg-slate-50 text-slate-300"
          : "",
    });

    const cols: ColDef<FacilityFormRow>[] = [
      {
        field: "facilityCategory",
        headerName: "Category",
        minWidth: 150,
        editable: false,
        rowGroup: false,
        cellClass: "font-semibold text-slate-800",
      },
      {
        field: "facilityType",
        headerName: "Facility / Service",
        minWidth: 160,
        flex: 1,
        editable: false,
      },
      boolCol("availabilityFlag", "Available"),
      {
        field: "serviceMode",
        headerName: "Service mode",
        width: 120,
        editable: isEditMode,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: ["", ...SERVICE_MODE_OPTIONS] },
      },
      textCol("outsourcedVendor", "Outsourced vendor", 150),
      boolCol("twentyFourBySevenFlag", "24x7"),
      boolCol("emergencySupportFlag", "Emergency"),
      {
        field: "operationalStatus",
        headerName: "Status",
        width: 140,
        editable: isEditMode,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: ["", ...FACILITY_OPERATIONAL_STATUS_OPTIONS] },
      },
      boolCol("registrationRequiredFlag", "Reg. required"),
      textCol("registrationNumber", "Reg. number", 130),
      textCol("validFrom", "Valid from", 110),
      textCol("validUpto", "Valid upto", 110),
      textCol("remarks", "Remarks", 160),
      {
        headerName: "",
        colId: "__warn",
        width: 44,
        editable: false,
        sortable: false,
        cellRenderer: (params: { data?: FacilityFormRow }) => {
          const warning = params.data ? facilityRowWarning(params.data) : null;
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
        cellRenderer: (params: { data?: FacilityFormRow }) =>
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
      <div className="ag-theme-alpine min-h-40 w-full flex-1 overflow-x-auto">
        <AgGridReact<FacilityFormRow>
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
          suppressMovableColumns
        />
      </div>
    </div>
  );
}
