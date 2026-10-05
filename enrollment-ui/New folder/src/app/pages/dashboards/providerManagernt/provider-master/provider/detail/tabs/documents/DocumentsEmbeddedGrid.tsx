import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridSuperWrapper, PROVIDER_GRID_DEFAULT_PAGE_SIZE, PROVIDER_GRID_PAGE_SIZE_OPTIONS } from "../../../../../shared/providerShell";
import {
  buildDocumentDisplayRows,
  createDocumentHeaderRenderer,
  DOCUMENT_COLUMN_OPTIONS,
  documentVersionFullWidthCell,
  getDocumentGridRowHeight,
  getDocumentMasterColumns,
  isDocumentVersionFullWidthRow,
  openDocumentHeaderMenu,
  pinDocumentMasterColumn,
  rowMatchesDocumentColumnFilters,
  toggleDocumentMasterColumn,
  updateDocumentMasterColumnFilter,
  type DocumentColumnFilter,
  type DocumentColumnKey,
  type DocumentColumnPin,
  type DocumentGridContext,
  type DocumentGridRow,
  type DocumentHeaderMenu,
  type DocumentListItem,
  type DocumentPreview,
  type DocumentSampleFile,
} from "./utils/documentMasterGrid";

function resolveDocumentPinMenuLabel(pin: DocumentColumnPin): string {
  if (pin === "none") return "No Pin";
  if (pin === "left") return "Pin Left";
  return "Pin Right";
}

function isDocumentPinMenuSelected(
  pin: DocumentColumnPin,
  field: string,
  pinnedDocumentColumns: Partial<Record<DocumentColumnKey, DocumentColumnPin>>,
): boolean {
  if (pin === "none" && pinnedDocumentColumns[field as DocumentColumnKey] == null) {
    return true;
  }
  return pinnedDocumentColumns[field as DocumentColumnKey] === pin;
}

export type DocumentsEmbeddedGridProps = {
  documentList: DocumentListItem[];
  documentSampleFiles: Record<number, DocumentSampleFile>;
  canWrite: boolean;
  gridHeight?: number;
  resolvePreview: (row: DocumentGridRow) => DocumentPreview | null;
  onView: (row: DocumentGridRow, preview: DocumentPreview | null) => void;
};

export function DocumentsEmbeddedGrid({
  documentList,
  documentSampleFiles,
  canWrite,
  gridHeight = 360,
  resolvePreview,
  onView,
}: Readonly<DocumentsEmbeddedGridProps>) {
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const [expandedDocumentNos, setExpandedDocumentNos] = useState<Set<number>>(
    () => new Set(),
  );
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<DocumentColumnFilter>({});
  const [pinnedDocumentColumns, setPinnedDocumentColumns] = useState<
    Partial<Record<DocumentColumnKey, DocumentColumnPin>>
  >({});
  const [headerMenu, setHeaderMenu] = useState<DocumentHeaderMenu>(null);
  const [visibleDocumentColumns, setVisibleDocumentColumns] = useState<
    DocumentColumnKey[]
  >(DOCUMENT_COLUMN_OPTIONS.map((column) => column.field));

  const toggleDocumentExpand = useCallback((documentNo: number) => {
    setExpandedDocumentNos((prev) => {
      const next = new Set(prev);
      if (next.has(documentNo)) next.delete(documentNo);
      else next.add(documentNo);
      return next;
    });
  }, []);

  const displayRows = useMemo(
    () =>
      buildDocumentDisplayRows(
        documentList,
        documentSampleFiles,
        expandedDocumentNos,
      ),
    [documentList, documentSampleFiles, expandedDocumentNos],
  );

  const filteredRows = useMemo(() => {
    const matchingParents = new Set(
      displayRows
        .filter(
          (row) => !row.isVersion && rowMatchesDocumentColumnFilters(row, columnFilters),
        )
        .map((row) => row.documentNo),
    );

    return displayRows.filter((row) => {
      if (!row.isVersion) return rowMatchesDocumentColumnFilters(row, columnFilters);
      return matchingParents.has(row.documentNo);
    });
  }, [columnFilters, displayRows]);

  const openHeaderMenu = useCallback(
    (field: DocumentColumnKey, event: React.MouseEvent<HTMLButtonElement>) => {
      openDocumentHeaderMenu(field, event, setHeaderMenu);
    },
    [],
  );

  const createHeaderRenderer = useCallback(
    (field: DocumentColumnKey, label: string) =>
      createDocumentHeaderRenderer(field, label, openHeaderMenu),
    [openHeaderMenu],
  );

  const gridContext = useMemo<DocumentGridContext>(
    () => ({
      canWrite,
      resolvePreview,
      onView,
    }),
    [canWrite, onView, resolvePreview],
  );

  const documentColumns = useMemo(
    () =>
      getDocumentMasterColumns({
        canWrite,
        resolvePreview,
        onView,
        expandedDocumentNos,
        onToggleExpand: toggleDocumentExpand,
        pinnedDocumentColumns,
        createHeaderRenderer,
      }),
    [
      canWrite,
      createHeaderRenderer,
      expandedDocumentNos,
      onView,
      pinnedDocumentColumns,
      resolvePreview,
      toggleDocumentExpand,
    ],
  );

  const columns = useMemo(
    () =>
      documentColumns.filter(
        (column) =>
          column.field === "expand" ||
          column.field === "actions" ||
          column.field === "no" ||
          visibleDocumentColumns.includes(column.field as DocumentColumnKey),
      ),
    [documentColumns, visibleDocumentColumns],
  );

  const sidePanelColumns = useMemo(() => {
    const search = columnSearch.trim().toLowerCase();
    if (!search) return DOCUMENT_COLUMN_OPTIONS;
    return DOCUMENT_COLUMN_OPTIONS.filter((column) =>
      column.label.toLowerCase().includes(search),
    );
  }, [columnSearch]);

  useEffect(() => {
    if (!headerMenu) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (headerMenuRef.current?.contains(event.target as Node)) return;
      setHeaderMenu(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [headerMenu]);

  return (
    <div className="documents-master-grid relative overflow-hidden rounded-md border border-gray-200 bg-white">
      {headerMenu ? (
        <div
          ref={headerMenuRef}
          className="fixed z-[100] w-52 rounded-md border border-gray-200 bg-white text-xs shadow-xl"
          style={{ left: headerMenu.x, top: headerMenu.y }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
            onClick={() => setHeaderMenu(null)}
          >
            <span>↑</span>
            <span>Sort Ascending</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
            onClick={() => setHeaderMenu(null)}
          >
            <span>↓</span>
            <span>Sort Descending</span>
          </button>
          <div className="border-t border-gray-100" />
          <div className="group relative">
            <div className="flex w-full items-center justify-between bg-blue-50 px-3 py-2 text-left text-gray-800">
              <span>Pin Column</span>
              <span>›</span>
            </div>
            <div className="absolute top-0 right-full z-[110] hidden w-32 overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl group-hover:block">
              {(["none", "left", "right"] as const).map((pin) => (
                <button
                  key={pin}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
                  onClick={() =>
                    pinDocumentMasterColumn(
                      headerMenu.field,
                      pin,
                      setPinnedDocumentColumns,
                      setHeaderMenu,
                    )
                  }
                >
                  <span className="w-3">
                    {isDocumentPinMenuSelected(
                      pin,
                      headerMenu.field,
                      pinnedDocumentColumns,
                    )
                      ? "✓"
                      : ""}
                  </span>
                  <span>{resolveDocumentPinMenuLabel(pin)}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setColumnsOpen(true);
              setHeaderMenu(null);
            }}
          >
            <span>▦</span>
            <span>Choose Columns</span>
          </button>
        </div>
      ) : null}

      <div className="pr-8">
        <AgGridSuperWrapper
          rowData={filteredRows}
          columnDefs={columns}
          pagination
          pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
          pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
          height={gridHeight}
          domLayout="normal"
          getRowId={(params) => (params.data as DocumentGridRow).rowKey}
          context={gridContext}
          isFullWidthRow={isDocumentVersionFullWidthRow}
          fullWidthCellRenderer={documentVersionFullWidthCell}
          getRowHeight={getDocumentGridRowHeight}
          embedFullWidthRows
          onRowClick={(row) => {
            const docRow = row as DocumentGridRow;
            if (docRow.isVersion) return;
            onView(docRow, resolvePreview(docRow));
          }}
          openOnRowClick={false}
        />
      </div>

      {columnsOpen ? (
        <aside className="absolute top-0 right-8 bottom-0 z-20 flex w-64 flex-col border-l border-gray-200 bg-white text-xs shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
            <span className="font-semibold text-gray-800">Columns</span>
            <button
              type="button"
              onClick={() => setColumnFilters({})}
              className="font-medium text-blue-600 hover:underline"
            >
              Reset
            </button>
          </div>
          <div className="border-b border-gray-100 p-2">
            <input
              value={columnSearch}
              onChange={(event) => setColumnSearch(event.target.value)}
              placeholder="Search..."
              className="h-7 w-full rounded border border-gray-300 px-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {sidePanelColumns.map((column) => (
                <div key={column.field} className="rounded px-1 py-1 hover:bg-gray-50">
                  <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={visibleDocumentColumns.includes(column.field)}
                      onChange={() =>
                        toggleDocumentMasterColumn(column.field, setVisibleDocumentColumns)
                      }
                      className="h-3.5 w-3.5"
                    />
                    <span className="min-w-0 flex-1 truncate">{column.label}</span>
                  </label>
                  <input
                    value={columnFilters[column.field] ?? ""}
                    onChange={(event) =>
                      updateDocumentMasterColumnFilter(
                        column.field,
                        event.target.value,
                        setColumnFilters,
                      )
                    }
                    placeholder={`Filter ${column.label}`}
                    className="mt-1 h-6 w-full rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      ) : null}

      <button
        type="button"
        onClick={() => setColumnsOpen((open) => !open)}
        className="absolute top-0 right-0 bottom-0 z-30 flex w-8 items-center justify-center border-l border-gray-200 bg-white text-xs text-gray-800 hover:bg-gray-50"
        title="Columns"
        aria-pressed={columnsOpen}
      >
        <span className="[writing-mode:vertical-rl]">Columns</span>
      </button>
    </div>
  );
}
