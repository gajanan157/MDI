import { useMemo } from "react";
import Pagination from "@/components/shared/Pagination";
import { ProviderTabLoadingState } from "../../../../shared/ProviderTabLoadingState";
import { InfraFacilityEmptyState } from "../../components/InfraFacilityEmptyState";
import { useSectionGridPagination } from "../../shared/useSectionGridPagination";
import { PROVIDER_GRID_PAGE_SIZE_OPTIONS } from "../../../../../../../shared/providerGridPagination.constants";
import { ManpowerGrid } from "./ManpowerGrid";
import { ManpowerAddRowBar } from "./ManpowerAddRowBar";
import type { ManpowerFormRow } from "../utils/manpowerTypes";
import { manpowerRowKey } from "../utils/manpowerTypes";

type ManpowerSectionProps = {
  rows: ManpowerFormRow[];
  isEditMode: boolean;
  loading?: boolean;
  onRowChange: (rowKey: string, patch: Partial<ManpowerFormRow>) => void;
  onAddRow: (manpowerType: string, employmentType: string) => void;
  onRemoveRow: (rowKey: string) => void;
};

export function ManpowerSection({
  rows,
  isEditMode,
  loading = false,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: Readonly<ManpowerSectionProps>) {
  const existingKeys = useMemo(
    () =>
      new Set(
        rows
          .filter((row) => row.manpowerType.trim() && row.employmentType.trim())
          .map((row) => manpowerRowKey(row.manpowerType, row.employmentType)),
      ),
    [rows],
  );

  const { page, pageSize, pagedRows, totalItems, onPageChange, onPageSizeChange } =
    useSectionGridPagination(rows);

  if (loading) {
    return <ProviderTabLoadingState fillHeight={false} compact />;
  }

  const hasRows = rows.some(
    (row) => row.manpowerType.trim() && row.employmentType.trim(),
  );

  if (!hasRows && !isEditMode) {
    return <InfraFacilityEmptyState variant="manpower" />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm ring-1 ring-slate-900/[0.06]">
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-auto ${
          isEditMode ? "bg-slate-100/55" : "bg-white"
        }`}
      >
        {isEditMode ? (
          <ManpowerAddRowBar existingKeys={existingKeys} onAdd={onAddRow} />
        ) : null}
        <ManpowerGrid
          rows={pagedRows}
          isEditMode={isEditMode}
          onRowChange={onRowChange}
          onRemoveRow={onRemoveRow}
        />
      </div>
      <Pagination
        className="shrink-0 border-t border-gray-100 px-2 py-1"
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
