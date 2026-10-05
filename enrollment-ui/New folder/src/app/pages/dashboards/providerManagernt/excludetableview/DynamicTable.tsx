import { useEffect, useMemo, useState } from "react";
import type { ColumnType } from "./useDynamicTable";
import type { ColumnMeta, RowData } from "../excludetableview/useDynamicTable";
import { Textarea } from "@/components/ui";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PROVIDER_DATE_PICKER_FORMAT, formatProviderDateTimeDisplay } from "../shared/dateFormat";
import {
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../shared/providerGridPagination.constants";

type DynamicTableProps = {
  columns: ColumnMeta[];
  rows: RowData[];
  errors: Record<string, Record<string, string>>;
  isBulkEditMode: boolean;
  isRowEditable: (rowId: string) => boolean;
  onToggleBulkEdit: () => void;
  onSetSingleRowEdit: (rowId: string | null) => void;
  onCancelSingleRowEdit: () => void;
  onCellChange: (rowId: string, columnKey: string, value: string) => void;
  onAddRow: (index?: number) => void;
  onAddColumn: (label: string, position?: number, type?: ColumnType) => void;
  onRenameColumn: (columnKey: string, label: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
};

function parseFlexibleDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const dmy = new RegExp(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/).exec(trimmed);
  if (dmy) {
    const date = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  return null;
}

function formatStoredDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string): string {
  if (!value?.trim()) return "-";
  return formatProviderDateTimeDisplay(value);
}

export function DynamicTable({
  columns,
  rows,
  errors,
  isBulkEditMode,
  isRowEditable,
  onToggleBulkEdit,
  onSetSingleRowEdit,
  onCancelSingleRowEdit,
  onCellChange,
  onAddRow,
  onAddColumn,
  onRenameColumn,
  onSubmit,
  isSubmitting = false,
}: Readonly<DynamicTableProps>) {
  const [newColumnLabel, setNewColumnLabel] = useState("");
  const [newColumnIndex, setNewColumnIndex] = useState(0);
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(PROVIDER_GRID_DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingHeaderKey, setEditingHeaderKey] = useState<string | null>(null);
  const [editingHeaderLabel, setEditingHeaderLabel] = useState("");

  const canAddColumn = newColumnLabel.trim().length > 0;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, pageSize, rows],
  );

  /** UI-only Sr. No — continuous across all rows; never taken from row data. */
  const serialNoByRowId = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((row, index) => {
      map[row.id] = index + 1;
    });
    return map;
  }, [rows]);

  const columnTypeChoices = useMemo(
    () =>
      [
        { value: "text", label: "Text" },
        { value: "number", label: "Number" },
        { value: "date", label: "Date" }
      ] as const,
    [],
  );
  const [newColumnType, setNewColumnType] = useState<ColumnType>("text");

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!openActionRowId) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-row-action-root='true']")) return;
      setOpenActionRowId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [openActionRowId]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const renderEditableCell = (row: RowData, column: ColumnMeta, error?: string) => {
    const value = row.values[column.key] ?? "";

    if (column.type === "date") {
      return (
        <div className="space-y-0.5">
          <DatePicker
            selected={parseFlexibleDate(value)}
            onChange={(date: Date | null) =>
              onCellChange(row.id, column.key, date ? formatStoredDate(date) : "")
            }
            dateFormat={PROVIDER_DATE_PICKER_FORMAT}
            placeholderText="Select date"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            className={`h-6 w-full min-w-[7.5rem] rounded border px-1 text-[10px] leading-none ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-slate-300 focus:border-sky-500"
            }`}
          />
          {error ? <p className="text-[9px] leading-tight text-red-600">{error}</p> : null}
        </div>
      );
    }

    return (
      <div className="space-y-0.5">
        <Textarea
          value={value}
          onChange={(e) => onCellChange(row.id, column.key, e.target.value)}
          rows={1}
          error={error}
          classNames={{ root: "m-0", wrapper: "mt-0" }}
          className="min-h-6 w-full resize-y px-1 py-0.5 text-[10px] leading-snug"
        />
      </div>
    );
  };

  const isCompactColumn = (column: ColumnMeta) =>
    column.type === "date" ||
    column.type === "pincode" ||
    column.type === "number" ||
    /^(state|city|rohini|pin|id)$/i.test(column.key.trim()) ||
    /id|code|pin|state|city|date/i.test(column.key);

  const renderDataCell = (row: RowData, column: ColumnMeta, editable: boolean) => {
    const value = row.values[column.key] ?? "";
    const error = errors[row.id]?.[column.key];
    const compact = isCompactColumn(column);
    const display =
      column.type === "date" ? formatDisplayDate(value) : value || "-";

    return (
      <td
        key={column.key}
        className={`align-middle px-1.5 py-0.5 ${compact ? "whitespace-nowrap" : ""}`}
      >
        {editable ? (
          renderEditableCell(row, column, error)
        ) : (
          <span
            className={`block text-[10px] leading-snug text-slate-800 ${
              compact ? "whitespace-nowrap" : "line-clamp-2 break-words"
            }`}
            title={display}
          >
            {display}
          </span>
        )}
      </td>
    );
  };

  const commitHeaderRename = (columnKey: string) => {
    onRenameColumn(columnKey, editingHeaderLabel);
    setEditingHeaderKey(null);
    setEditingHeaderLabel("");
  };

  const renderHeaderCell = (column: ColumnMeta) => (
    <th
      key={column.key}
      className="border-b border-sky-700/30 px-1.5 py-1 font-semibold tracking-wide text-white"
    >
      {editingHeaderKey === column.key ? (
        <input
          autoFocus
          value={editingHeaderLabel}
          onChange={(e) => setEditingHeaderLabel(e.target.value)}
          onBlur={() => commitHeaderRename(column.key)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitHeaderRename(column.key);
            if (e.key === "Escape") {
              setEditingHeaderKey(null);
              setEditingHeaderLabel("");
            }
          }}
          className="h-5 w-full min-w-[5rem] rounded border border-sky-200 px-1 text-[10px] font-semibold text-slate-800"
          title="Rename header"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditingHeaderKey(column.key);
            setEditingHeaderLabel(column.label);
          }}
          className="group inline-flex max-w-full items-center gap-0.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white/95 hover:text-white"
          title="Click to rename header"
        >
          <span className="truncate">{column.label}</span>
          <span className="shrink-0 text-[9px] text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
            ✎
          </span>
        </button>
      )}
    </th>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-sky-50/60 px-2 py-1">
        <button
          type="button"
          onClick={onToggleBulkEdit}
          className="h-6 rounded border border-sky-600 bg-sky-600 px-2 text-[10px] font-semibold text-white hover:bg-sky-700"
        >
          {isBulkEditMode ? "Exit Bulk Edit" : "Edit All Rows"}
        </button>
        {onSubmit ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-6 rounded border border-emerald-700 bg-emerald-600 px-2.5 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-1">
          <label className="inline-flex items-center gap-1 text-[10px] text-slate-600">
            Page
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const nextSize = Number(e.target.value) || PROVIDER_GRID_DEFAULT_PAGE_SIZE;
                    setPageSize(nextSize);
                    setCurrentPage(1);
                  }}
                  className="h-6 rounded border border-slate-300 bg-white px-1 text-[10px]"
                >
                  {[...PROVIDER_GRID_PAGE_SIZE_OPTIONS].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
          </label>
          <input
            value={newColumnLabel}
            onChange={(e) => setNewColumnLabel(e.target.value)}
            placeholder="Column name"
            className="h-6 w-28 rounded border border-slate-300 px-1.5 text-[10px]"
          />
          <select
            value={newColumnType}
            onChange={(e) => setNewColumnType(e.target.value as ColumnType)}
            className="h-6 rounded border border-slate-300 bg-white px-1 text-[10px]"
          >
            {columnTypeChoices.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={columns.length}
            value={newColumnIndex}
            onChange={(e) => setNewColumnIndex(Number(e.target.value) || 0)}
            className="h-6 w-10 rounded border border-slate-300 px-1 text-[10px]"
            title="Insert column index"
          />
          <button
            type="button"
            disabled={!canAddColumn}
            onClick={() => {
              onAddColumn(newColumnLabel, newColumnIndex, newColumnType);
              setNewColumnLabel("");
            }}
            className="h-6 rounded bg-emerald-600 px-2 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Column
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-sky-800">
            <tr>
              <th className="w-10 whitespace-nowrap border-b border-sky-700/30 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Sr. No
              </th>
              {columns.map((column) => renderHeaderCell(column))}
              <th className="sticky right-0 w-14 border-b border-sky-700/30 bg-sky-800 px-1.5 py-1 text-right text-[10px] font-semibold uppercase tracking-wide text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => {
              const editable = isRowEditable(row.id);
              const serialNo = serialNoByRowId[row.id] ?? rowIndex + 1;
              const zebra = rowIndex % 2 === 1;
              return (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-sky-50/80 ${
                    editable
                      ? "bg-amber-50/70"
                      : zebra
                        ? "bg-slate-50/80"
                        : "bg-white"
                  }`}
                >
                  <td className="whitespace-nowrap px-1.5 py-0.5 align-middle text-[10px] font-medium tabular-nums text-slate-600">
                    {serialNo}
                  </td>
                  {columns.map((column) => renderDataCell(row, column, editable))}
                  <td
                    className={`sticky right-0 px-1 py-0.5 text-right align-middle ${
                      editable ? "bg-amber-50/70" : zebra ? "bg-slate-50/80" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-end gap-0.5">
                      {editable && !isBulkEditMode ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onSetSingleRowEdit(null)}
                            className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-[10px] text-white hover:bg-emerald-700"
                            title="Done editing row"
                            aria-label="Done editing row"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={onCancelSingleRowEdit}
                            className="inline-flex h-5 w-5 items-center justify-center rounded bg-red-600 text-[10px] text-white hover:bg-red-700"
                            title="Cancel editing row"
                            aria-label="Cancel editing row"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <div data-row-action-root="true" className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionRowId((current) => (current === row.id ? null : row.id))
                            }
                            className="inline-flex h-5 w-5 items-center justify-center rounded bg-sky-600 text-white hover:bg-sky-700"
                            title="Row actions"
                            aria-label="Row actions"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-2.5 w-2.5"
                              aria-hidden="true"
                            >
                              <circle cx="10" cy="4" r="1.7" />
                              <circle cx="10" cy="10" r="1.7" />
                              <circle cx="10" cy="16" r="1.7" />
                            </svg>
                          </button>
                          {openActionRowId === row.id ? (
                            <div className="absolute right-0 top-6 z-[100] w-28 overflow-hidden rounded border border-slate-200 bg-white py-0.5 shadow-lg ring-1 ring-sky-100">
                              <button
                                type="button"
                                onClick={() => {
                                  onAddRow((currentPage - 1) * pageSize + rowIndex + 1);
                                  setOpenActionRowId(null);
                                }}
                                className="block w-full px-2 py-1 text-left text-[10px] font-medium text-slate-700 hover:bg-sky-50"
                              >
                                Insert Row
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onSetSingleRowEdit(row.id);
                                  setOpenActionRowId(null);
                                }}
                                className="block w-full px-2 py-1 text-left text-[10px] font-medium text-sky-700 hover:bg-sky-50"
                              >
                                Edit
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
        <span>
          Page {currentPage}/{totalPages} · {visibleRows.length}/{rows.length} rows
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="h-5 rounded border border-slate-300 bg-white px-2 text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="h-5 rounded border border-slate-300 bg-white px-2 text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

