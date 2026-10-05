import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { BulkIcMappingInwardRow } from "./rows";
import { applyBulkIcMappingGridCellStyle } from "../config";
import { formatProviderDateTimeDisplay } from "../../../shared/dateFormat";

export function getBulkIcMappingInwardGridColumns({
  onView,
  onViewDocuments,
}: Readonly<{
  onView: (row: BulkIcMappingInwardRow) => void;
  onViewDocuments: (row: BulkIcMappingInwardRow) => void;
}>) {
  return applyBulkIcMappingGridCellStyle([
    {
      field: "actions",
      headerName: "Actions",
      width: 104,
      pinned: "left" as const,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: BulkIcMappingInwardRow }) => {
        const row = params.data;
        if (!row) return null;
        return (
          <div className="flex h-full items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100"
              onClick={(event) => {
                event.stopPropagation();
                onView(row);
              }}
              aria-label={`View inward ${row.inwardNo}`}
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="cursor-pointer rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 hover:bg-emerald-100"
              onClick={(event) => {
                event.stopPropagation();
                onViewDocuments(row);
              }}
              aria-label={`View documents for ${row.inwardNo}`}
              title="View inward documents"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      field: "inwardNo",
      headerName: "Inward Number",
      flex: 1,
      minWidth: 130,
      sortable: true,
      filter: false,
    },
    {
      field: "insurerName",
      headerName: "Insurer Name",
      flex: 1.1,
      minWidth: 130,
      sortable: true,
      filter: false,
    },
    {
      field: "recordStatus",
      headerName: "Status",
      flex: 1.1,
      minWidth: 130,
      sortable: true,
      filter: false,
    },
    {
      field: "createdAt",
      headerName: "Uploaded Date & Time",
      flex: 1,
      minWidth: 148,
      sortable: true,
      filter: false,
      valueFormatter: (params: { value?: string }) =>
        formatProviderDateTimeDisplay(params.value),
    },
    {
      field: "uploadedByName",
      headerName: "Uploaded By",
      flex: 1.1,
      minWidth: 130,
      sortable: true,
      filter: false,
    },
  ]);
}
