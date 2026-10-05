import { useMemo } from "react";
import Pagination from "@/components/shared/Pagination";
import { PROVIDER_GRID_PAGE_SIZE_OPTIONS } from "../../../../../../../shared/providerGridPagination.constants";
import { useSectionGridPagination } from "../../shared/useSectionGridPagination";
import { RoomBedGrid } from "./RoomBedGrid";
import { RoomBedAddRowBar } from "./RoomBedAddRowBar";
import { RoomBedSummaryCards } from "./RoomBedSummaryCards";
import { roomBedRowKey, type RoomBedFormRow } from "../utils/roomBedTypes";
import { buildRoomBedSummaryStats } from "../utils/roomBedSummaryStats";

type RoomBedSectionProps = {
  rows: RoomBedFormRow[];
  isEditMode: boolean;
  onRowChange: (rowKey: string, patch: Partial<RoomBedFormRow>) => void;
  onAddRow: (roomType: string) => void;
  onRemoveRow: (rowKey: string) => void;
};

export function RoomBedSection({
  rows,
  isEditMode,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: Readonly<RoomBedSectionProps>) {
  const existingKeys = useMemo(
    () =>
      new Set(
        rows
          .filter((row) => row.roomType.trim())
          .map((row) => roomBedRowKey(row.roomType)),
      ),
    [rows],
  );

  const stats = useMemo(() => buildRoomBedSummaryStats(rows), [rows]);
  const { page, pageSize, pagedRows, totalItems, onPageChange, onPageSizeChange } =
    useSectionGridPagination(rows);

  return (
    <div className="mt-1 flex shrink-0 flex-col overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-sm ring-1 ring-slate-900/[0.06]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-slate-50/60 px-2.5 py-1">
        <p className="text-[11px] font-semibold text-slate-800">Rooms &amp; Beds</p>
        <RoomBedSummaryCards stats={stats} />
      </div>
      <div
        className={`flex flex-col overflow-x-auto ${
          isEditMode ? "bg-slate-100/55" : "bg-white"
        }`}
      >
        {isEditMode ? (
          <RoomBedAddRowBar existingKeys={existingKeys} onAdd={onAddRow} />
        ) : null}
        <RoomBedGrid
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
