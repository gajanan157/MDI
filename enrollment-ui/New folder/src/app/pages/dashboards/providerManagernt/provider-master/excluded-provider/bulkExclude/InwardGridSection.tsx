import { useMemo } from "react";
import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { AgGridSuperWrapper } from "../../../shared/providerShell";
import { LoadingState } from "@/components/shared/LoadingState";
import type { BulkIcMappingInwardRow } from "../../ic-corporate-mapping/inward/rows";
import { applyBulkIcMappingGridCellStyle } from "../../ic-corporate-mapping/config";
import { formatProviderDateTimeDisplay } from "../../../shared/dateFormat";

type BulkExcludeInwardGridSectionProps = {
  rowData: BulkIcMappingInwardRow[];
  onView: (row: BulkIcMappingInwardRow) => void;
  onViewDocuments: (row: BulkIcMappingInwardRow) => void;
  loading?: boolean;
};

function getBulkExcludeInwardGridColumns({
  onView,
  onViewDocuments,
  t,
}: Readonly<{
  onView: (row: BulkIcMappingInwardRow) => void;
  onViewDocuments: (row: BulkIcMappingInwardRow) => void;
  t: TFunction;
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
      field: "documentType",
      headerName: t("providerMaster.excludedProvider.uploadDialog.restrictionType"),
      flex: 1.3,
      minWidth: 180,
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

export function BulkExcludeInwardGridSection({
  rowData,
  onView,
  onViewDocuments,
  loading = false,
}: Readonly<BulkExcludeInwardGridSectionProps>) {
  const { t } = useTranslation();

  const columnDefs = useMemo(
    () => getBulkExcludeInwardGridColumns({ onView, onViewDocuments, t }),
    [onView, onViewDocuments, t],
  );

  return (
    <div className="bulk-exclude-inward-grid relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          <LoadingState
            message={t("providerMaster.excludedProvider.bulkExclude.loadingInwards", {
              defaultValue: "Loading bulk exclude inwards…",
            })}
          />
        </div>
      ) : null}
      <AgGridSuperWrapper
        rowData={rowData}
        columnDefs={columnDefs}
        height="100%"
        pagination={false}
        domLayout="normal"
        getRowId={({ data }) => String((data as BulkIcMappingInwardRow).id)}
        onRowClick={(row) => onView(row as BulkIcMappingInwardRow)}
        openOnRowClick={false}
      />
    </div>
  );
}
