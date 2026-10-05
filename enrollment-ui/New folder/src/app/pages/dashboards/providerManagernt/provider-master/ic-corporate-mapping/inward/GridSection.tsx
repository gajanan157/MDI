import { useMemo } from "react";
import { AgGridSuperWrapper } from "../../../shared/providerShell";
import type { BulkIcMappingInwardRow } from "./rows";
import { getBulkIcMappingInwardGridColumns } from "./grid";

type BulkIcMappingInwardGridSectionProps = {
  rowData: BulkIcMappingInwardRow[];
  onView: (row: BulkIcMappingInwardRow) => void;
  onViewDocuments: (row: BulkIcMappingInwardRow) => void;
  gridHeight?: number;
  loading?: boolean;
};

export function BulkIcMappingInwardGridSection({
  rowData,
  onView,
  onViewDocuments,
  gridHeight = 520,
  loading = false,
}: Readonly<BulkIcMappingInwardGridSectionProps>) {
  const columns = useMemo(
    () => getBulkIcMappingInwardGridColumns({ onView, onViewDocuments }),
    [onView, onViewDocuments],
  );

  return (
    <div className="bulk-ic-mapping-grid relative overflow-hidden rounded-md border border-gray-200 bg-white">
      {loading ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : null}
      <AgGridSuperWrapper
        rowData={rowData}
        columnDefs={columns}
        pagination={false}
        height={gridHeight}
        domLayout="normal"
        getRowId={({ data }) => String((data as BulkIcMappingInwardRow).id)}
        onRowClick={(row) => onView(row as BulkIcMappingInwardRow)}
        openOnRowClick={false}
      />
    </div>
  );
}
