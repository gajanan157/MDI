import { useCallback, useMemo } from "react";
import type {
  CellClassParams,
  CellValueChangedEvent,
  ColDef,
  ValueGetterParams,
  ValueSetterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { RoomBedFormRow } from "../utils/roomBedTypes";
import {
  floorAreaPerBed,
  isValidRatio,
  roomBedRowWarning,
} from "../utils/roomBedFormMapper";

ModuleRegistry.registerModules([AllCommunityModule]);

type RoomBedGridProps = {
  rows: RoomBedFormRow[];
  isEditMode: boolean;
  onRowChange?: (rowKey: string, patch: Partial<RoomBedFormRow>) => void;
  onRemoveRow?: (rowKey: string) => void;
};

const YES_NO = ["Yes", "No"];
const NUMERIC_FIELDS = [
  "roomCount",
  "bedsPerRoom",
  "totalBedCount",
  "maleBedCount",
  "femaleBedCount",
  "otherBedCount",
  "roomFloorArea",
] as const;
const BOOL_FIELDS: (keyof RoomBedFormRow)[] = [
  "oxygenPointFlag",
  "suctionPointFlag",
  "nurseCallFlag",
];

function sanitizeInt(raw: unknown): string {
  return String(raw ?? "").replace(/\D/g, "");
}

export function RoomBedGrid({
  rows,
  isEditMode,
  onRowChange,
  onRemoveRow,
}: Readonly<RoomBedGridProps>) {
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<RoomBedFormRow>) => {
      if (!isEditMode || !onRowChange || !event.data) return;
      const field = event.colDef.field as keyof RoomBedFormRow | undefined;
      if (!field) return;
      let value: unknown = String(event.newValue ?? "");
      if (BOOL_FIELDS.includes(field)) value = event.newValue === "Yes";
      else if ((NUMERIC_FIELDS as readonly string[]).includes(field)) {
        value = sanitizeInt(event.newValue);
      }
      onRowChange(event.data.rowKey, { [field]: value } as Partial<RoomBedFormRow>);
    },
    [isEditMode, onRowChange],
  );

  const columnDefs = useMemo<ColDef<RoomBedFormRow>[]>(() => {
    const numberCol = (
      field: (typeof NUMERIC_FIELDS)[number],
      headerName: string,
      width = 96,
    ): ColDef<RoomBedFormRow> => ({
      field,
      headerName,
      width,
      editable: isEditMode,
      cellEditor: "agTextCellEditor",
      valueSetter: (params: ValueSetterParams<RoomBedFormRow>) => {
        params.data[field] = sanitizeInt(params.newValue);
        return true;
      },
      cellClass: "tabular-nums text-right",
    });

    const boolCol = (
      field: "oxygenPointFlag" | "suctionPointFlag" | "nurseCallFlag",
      headerName: string,
    ): ColDef<RoomBedFormRow> => ({
      field,
      headerName,
      width: 92,
      editable: isEditMode,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: YES_NO },
      valueGetter: (params: ValueGetterParams<RoomBedFormRow>) =>
        params.data?.[field] ? "Yes" : "No",
      valueSetter: (params: ValueSetterParams<RoomBedFormRow>) => {
        (params.data[field] as boolean) = params.newValue === "Yes";
        return true;
      },
      cellClass: (params: CellClassParams<RoomBedFormRow>) =>
        params.value === "Yes" ? "text-emerald-700 font-semibold" : "text-slate-500",
    });

    const ratioCol = (
      field: "nursePatientRatio" | "doctorPatientRatio",
      headerName: string,
    ): ColDef<RoomBedFormRow> => ({
      field,
      headerName,
      width: 120,
      editable: isEditMode,
      cellEditor: "agTextCellEditor",
      cellClass: (params: CellClassParams<RoomBedFormRow>) =>
        isValidRatio(String(params.value ?? "")) ? "" : "text-rose-600",
    });

    const cols: ColDef<RoomBedFormRow>[] = [
      {
        field: "roomType",
        headerName: "Room Type",
        minWidth: 150,
        flex: 1,
        editable: false,
        cellClass: "font-semibold text-slate-800",
      },
      numberCol("roomCount", "Rooms"),
      numberCol("bedsPerRoom", "Beds / room", 104),
      numberCol("totalBedCount", "Total beds", 100),
      numberCol("maleBedCount", "Male"),
      numberCol("femaleBedCount", "Female"),
      numberCol("otherBedCount", "Other"),
      numberCol("roomFloorArea", "Floor area (sq ft)", 130),
      {
        colId: "floorAreaPerBed",
        headerName: "Floor area / bed",
        width: 120,
        editable: false,
        sortable: false,
        valueGetter: (params: ValueGetterParams<RoomBedFormRow>) =>
          params.data ? floorAreaPerBed(params.data) || "—" : "",
        cellClass: "tabular-nums text-right bg-slate-50 text-slate-500",
      },
      ratioCol("nursePatientRatio", "Nurse : patient"),
      ratioCol("doctorPatientRatio", "Doctor : patient"),
      boolCol("oxygenPointFlag", "O₂ point"),
      boolCol("suctionPointFlag", "Suction"),
      boolCol("nurseCallFlag", "Nurse call"),
      {
        field: "remarks",
        headerName: "Remarks",
        width: 160,
        editable: isEditMode,
      },
      {
        headerName: "",
        colId: "__warn",
        width: 44,
        editable: false,
        sortable: false,
        cellRenderer: (params: { data?: RoomBedFormRow }) => {
          const warning = params.data ? roomBedRowWarning(params.data) : null;
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
        cellRenderer: (params: { data?: RoomBedFormRow }) =>
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
    <div className="ag-grid-shell box-border flex w-full flex-col overflow-hidden">
      <div className="ag-theme-alpine min-h-40 w-full overflow-x-auto">
        <AgGridReact<RoomBedFormRow>
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
