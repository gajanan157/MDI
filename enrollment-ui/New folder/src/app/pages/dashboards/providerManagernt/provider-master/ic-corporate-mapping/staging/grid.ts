import type { ColDef } from "ag-grid-community";
import { applyBulkIcMappingGridCellStyle } from "../config";

export function getBulkIcMappingStagingGridColumns(showReasonColumn = false) {
  const columns: ColDef[] = [
    {
      field: "uiSerialNo",
      headerName: "Sr. No.",
      flex: 0.5,
      minWidth: 70,
      sortable: false,
      filter: false,
    },
    {
      field: "providerName",
      headerName: "Provider Name",
      flex: 1.2,
      minWidth: 180,
      sortable: true,
      filter: false,
    },
    {
      field: "providerIibRohiniCode",
      headerName: "Rohini Code",
      flex: 0.9,
      minWidth: 130,
      sortable: true,
      filter: false,
    },
    {
      field: "providerAddressCity",
      headerName: "City",
      flex: 0.7,
      minWidth: 100,
      sortable: true,
      filter: false,
    },
    {
      field: "providerAddressState",
      headerName: "State",
      flex: 0.7,
      minWidth: 100,
      sortable: true,
      filter: false,
    },
    {
      field: "providerAddressPostalCode",
      headerName: "Pincode",
      flex: 0.7,
      minWidth: 90,
      sortable: true,
      filter: false,
    },
    {
      field: "providerStatus",
      headerName: "Status",
      flex: 0.8,
      minWidth: 130,
      sortable: true,
      filter: false,
      valueFormatter: (params) =>
        String(params.value ?? "").replaceAll("_", " "),
    },
  ];

  if (showReasonColumn) {
    columns.push({
      field: "providerStatusReason",
      headerName: "Reason",
      flex: 1.4,
      minWidth: 220,
      sortable: false,
      filter: false,
      tooltipField: "providerStatusReason",
      wrapText: false,
      autoHeight: false,
      valueFormatter: (params) => {
        const reason = String(params.value ?? "").trim();
        return reason || "—";
      },
    });
  }

  return applyBulkIcMappingGridCellStyle(columns);
}
