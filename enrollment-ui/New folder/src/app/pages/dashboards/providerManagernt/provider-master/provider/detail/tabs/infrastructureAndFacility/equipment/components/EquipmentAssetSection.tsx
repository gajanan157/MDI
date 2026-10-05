import { useMemo } from "react";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import Pagination from "@/components/shared/Pagination";
import { PROVIDER_GRID_PAGE_SIZE_OPTIONS } from "../../../../../../../shared/providerGridPagination.constants";
import { useSectionGridPagination } from "../../shared/useSectionGridPagination";
import { EquipmentAssetCard } from "./EquipmentAssetCard";
import { EquipmentAssetAddBar } from "./EquipmentAssetAddBar";
import { EquipmentAssetSummaryCards } from "./EquipmentAssetSummaryCards";
import { buildEquipmentAssetSummaryStats } from "../utils/equipmentAssetSummaryStats";
import type { EquipmentAssetFormRow } from "../utils/equipmentAssetTypes";

type EquipmentAssetSectionProps = {
  rows: EquipmentAssetFormRow[];
  isEditMode: boolean;
  onRowChange: (rowKey: string, patch: Partial<EquipmentAssetFormRow>) => void;
  onAddRow: (equipmentType: string) => void;
  onRemoveRow: (rowKey: string) => void;
};

export function EquipmentAssetSection({
  rows,
  isEditMode,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: Readonly<EquipmentAssetSectionProps>) {
  const stats = useMemo(() => buildEquipmentAssetSummaryStats(rows), [rows]);
  const { page, pageSize, pagedRows, totalItems, onPageChange, onPageSizeChange } =
    useSectionGridPagination(rows);

  return (
    <div className="mt-1 flex shrink-0 flex-col overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm ring-1 ring-slate-900/6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-slate-50/60 px-2.5 py-1">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
          <CpuChipIcon className="h-3.5 w-3.5 text-slate-500" />
          Equipment Assets
        </p>
        <EquipmentAssetSummaryCards stats={stats} />
      </div>

      <div className={`flex flex-col ${isEditMode ? "bg-slate-100/55" : "bg-white"}`}>
        {isEditMode ? <EquipmentAssetAddBar onAdd={onAddRow} /> : null}

        {pagedRows.length === 0 ? (
          <p className="px-2.5 py-6 text-center text-[11px] text-slate-400">
            No equipment assets recorded.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 p-2">
            {pagedRows.map((row) => (
              <EquipmentAssetCard
                key={row.rowKey}
                row={row}
                isEditMode={isEditMode}
                onChange={onRowChange}
                onRemove={onRemoveRow}
              />
            ))}
          </div>
        )}
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
