// src/components/shared/table/AgGridWrapper.tsx
import { Button } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  AllCommunityModule,
  type AutoSizeStrategy,
  type CellKeyDownEvent,
  type FullWidthCellKeyDownEvent,
  IGetRowsParams,
  ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type CSSProperties,
  type RefObject,
} from "react";
import { useNavigate } from "react-router";
import clsx from "clsx";

import Pagination from "@/components/shared/Pagination";

/* Register AG Grid community modules once */
ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  rowData?: any[]; // initial page rows (optional, used when not serverSide)
  columnDefs: any[];
  height?: number | string;
  width?: number | string;
  pagination?: boolean; // Show built-in pagination (default: true if totalItems/onPageChange provided)
  isSearch?: boolean;
  searchTitle?: string;
  title?: string;
  fetchThunk?: any;
  pageSize?: number; // block size for server
  isAddButton?: { label: string; path: string; isAdd: boolean };
  onRowClick?: (row: any) => void;
  /**
   * When false, `onRowClick` is only invoked on Enter (focused row/cell),
   * not on mouse row click. Default true.
   */
  openOnRowClick?: boolean;
  rowPointerOnClick?: boolean;
  serverSide?: boolean; // enable infinite server-side model (community -> "infinite")
  fetchRows?: (args: {
    page?: number;
    pageSize?: number;
    sortModel?: any;
    filterModel?: any;
  }) => Promise<{ rows: any[]; total: number }>;
  // External pagination control (for controlled mode)
  totalItems?: number; // Total items count from external source
  page?: number; // Current page from external source
  onPageChange?: (page: number) => void; // External page change handler
  onPageSizeChange?: (pageSize: number) => void; // External page size change handler
  pageSizeOptions?: number[]; // Options for page size dropdown
  domLayout?: "normal" | "autoHeight";
  /** Client-side grids: e.g. `{ type: 'fitCellContents' }` to size columns from cell text (no row height change). */
  autoSizeStrategy?: AutoSizeStrategy;
  getRowId?: (params: { data: unknown }) => string;
  context?: unknown;
  isFullWidthRow?: (params: import("ag-grid-community").IsFullWidthRowParams) => boolean;
  /** AG Grid full-width row renderer — typed loosely to match grid API and custom renderers. */
  fullWidthCellRenderer?: React.ComponentType<any> | ((params: any) => React.ReactNode);
  getRowHeight?: (params: import("ag-grid-community").RowHeightParams) => number | undefined | null;
  getRowClass?: (params: import("ag-grid-community").RowClassParams) => string | string[] | undefined;
  embedFullWidthRows?: boolean;
  /** AG Grid single-row selection with a checkbox column (no header select-all). */
  singleSelectCheckboxes?: boolean;
  /** AG Grid multi-row selection with checkbox column + header select-all (current page). */
  multiSelectCheckboxes?: boolean;
  /** Fired when the selected row changes (checkbox / click). `null` when cleared. */
  onRowSelected?: (row: any) => void;
  /** Fired when multi-select selection changes (current page selected rows). */
  onRowsSelected?: (rows: any[]) => void;
  /**
   * Row ids (from `getRowId`) to keep selected after data refresh / page change.
   * Used with `multiSelectCheckboxes` to preserve selection across pages.
   */
  syncSelectedRowIds?: string[];
};

const DEFAULT_COL_DEF = {
  sortable: true,
  filter: false,
  suppressMenu: false,
  resizable: true,
  minWidth: 50,
};

function resolveShowPagination(
  paginationProp: boolean | undefined,
  isControlledPagination: boolean,
): boolean {
  if (paginationProp !== undefined) return paginationProp;
  return isControlledPagination;
}

function getGridContainerStyle(height?: number | string): CSSProperties {
  if (height && height !== "100%") return { height, width: "100%" };
  if (height === "100%") return { width: "100%", minHeight: 280 };
  return { width: "100%", minHeight: 300 };
}

function getThemeHeightStyle(calculatedHeight?: number): CSSProperties {
  return {
    width: "100%",
    height: calculatedHeight != null ? `${calculatedHeight}px` : "100%",
  };
}

function shouldGrowInFlexParent(height?: number | string): boolean {
  return height === "100%" || height === undefined;
}

function resolveRowSelection(
  multiSelectCheckboxes: boolean,
  singleSelectCheckboxes: boolean,
) {
  if (multiSelectCheckboxes) {
    return {
      mode: "multiRow" as const,
      checkboxes: true,
      headerCheckbox: true,
      enableClickSelection: false,
    };
  }
  if (singleSelectCheckboxes) {
    return {
      mode: "singleRow" as const,
      checkboxes: true,
      enableClickSelection: true,
    };
  }
  return "single" as const;
}

type AgGridCellKeyDownEvent = CellKeyDownEvent<any> | FullWidthCellKeyDownEvent<any>;

function handleAgGridCellKeyDown(
  e: AgGridCellKeyDownEvent,
  onRowClick?: (row: any) => void,
): void {
  if (!onRowClick || e.data == null) return;
  const keyEvent = e.event;
  if (!(keyEvent instanceof KeyboardEvent) || keyEvent.key !== "Enter") return;
  if ((e.api?.getEditingCells?.() ?? []).length > 0) return;
  keyEvent.preventDefault();
  onRowClick(e.data);
}

function AgGridTitle({ title }: Readonly<{ title: string }>) {
  if (!title) return null;
  return <h1 className="mb-4 text-xl">{title}</h1>;
}

type AgGridPaginationFooterProps = {
  visible: boolean;
  currentPage: number;
  currentPageSize: number;
  totalItems: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  pageSizeOptions: number[];
};

function AgGridPaginationFooter({
  visible,
  currentPage,
  currentPageSize,
  totalItems,
  handlePageChange,
  handlePageSizeChange,
  pageSizeOptions,
}: Readonly<AgGridPaginationFooterProps>) {
  if (!visible) return null;

  return (
    <div className="mt-2 shrink-0">
      <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}

function sizeColumnsToFitSafely(api: { sizeColumnsToFit?: () => void } | null): void {
  if (!api?.sizeColumnsToFit) return;
  try {
    api.sizeColumnsToFit();
  } catch {
    // Grid may not be ready yet.
  }
}

function applyGridDatasource(gridApi: any, ds: unknown): void {
  try {
    gridApi.setDatasource(ds);
  } catch (err) {
    console.warn("Failed to set datasource on grid api:", err);
    try {
      gridApi.setDatasource?.(ds);
    } catch (err2) {
      console.error("setDatasource fallback failed:", err2);
    }
  }
}

function refreshServerSideGrid(
  gridApi: any,
  createDatasource: (pageSize: number, page: number) => unknown,
  pageSize: number,
  page: number,
): void {
  try {
    gridApi.purgeInfiniteCache();
    applyGridDatasource(gridApi, createDatasource(pageSize, page));
    gridApi.ensureIndexVisible(0, "top");
  } catch (err) {
    console.error("Failed to update datasource:", err);
  }
}

function useCalculatedGridHeight(
  height: number | string | undefined,
  containerRef: RefObject<HTMLDivElement | null>,
): number | undefined {
  const [calculatedHeight, setCalculatedHeight] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (height === "100%" && containerRef.current) {
      const updateHeight = () => {
        const el = containerRef.current;
        if (!el) return;
        const measured = el.clientHeight;
        if (measured > 0) setCalculatedHeight(measured);
      };

      updateHeight();
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }

    if (typeof height === "number") {
      setCalculatedHeight(height);
      return;
    }

    setCalculatedHeight(undefined);
  }, [height, containerRef]);

  return calculatedHeight;
}

function useFitGridWidthOnResize(
  autoSizeStrategy: AutoSizeStrategy | undefined,
  containerRef: RefObject<HTMLDivElement | null>,
  gridApiRef: RefObject<any>,
  computedColDefs: any[],
  rowData: any[] | undefined,
): void {
  useEffect(() => {
    if (autoSizeStrategy?.type !== "fitGridWidth") return;
    const el = containerRef.current;
    if (!el) return;

    const refitColumns = () => sizeColumnsToFitSafely(gridApiRef.current);
    refitColumns();
    const resizeObserver = new ResizeObserver(refitColumns);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [autoSizeStrategy, computedColDefs, rowData, containerRef, gridApiRef]);
}

type AgGridToolbarProps = {
  isSearch: boolean;
  searchTitle: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isAddButton?: { label: string; path: string; isAdd: boolean };
  onAddClick: () => void;
};

function AgGridToolbar({
  isSearch,
  searchTitle,
  searchTerm,
  onSearchTermChange,
  onSearch,
  onClear,
  isAddButton,
  onAddClick,
}: Readonly<AgGridToolbarProps>) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex w-full max-w-md items-center space-x-2">
        {isSearch && (
          <>
            <div className="relative grow">
              <MagnifyingGlassIcon className="absolute top-2.5 left-3 h-5 w-5 cursor-pointer text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder={searchTitle}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-9 pl-10 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {searchTerm && (
                <div
                  onClick={onClear}
                  className="absolute top-2.5 right-3 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div
              onClick={onSearch}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Search
            </div>
          </>
        )}
      </div>
      {isAddButton?.isAdd && (
        <div className="mb-2 flex justify-end">
          <Button color="primary" onClick={onAddClick}>
            {isAddButton.label}
          </Button>
        </div>
      )}
    </div>
  );
}

function AgGridToolbarSlot({
  visible,
  ...toolbarProps
}: Readonly<AgGridToolbarProps & { visible: boolean }>) {
  if (!visible) {
    return null;
  }
  return <AgGridToolbar {...toolbarProps} />;
}

function useAgGridSearch(fetchThunk?: any) {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const dispatchFetch = useCallback(
    (payload: Record<string, string>) => {
      if (fetchThunk) dispatch(fetchThunk(payload));
    },
    [dispatch, fetchThunk],
  );

  const handleSearch = useCallback(() => {
    if (!fetchThunk) return;
    const trimmed = searchTerm.trim();
    dispatchFetch(trimmed ? { query: trimmed } : { size: "50" });
  }, [dispatchFetch, fetchThunk, searchTerm]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    dispatchFetch({ size: "50" });
  }, [dispatchFetch]);

  return { searchTerm, setSearchTerm, handleSearch, handleClear };
}

type PaginationConfig = {
  isControlledPagination: boolean;
  pagination: boolean;
  currentPage: number;
  currentPageSize: number;
  totalItems: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  onGridReady: (params: any) => void;
};

function useAgGridPagination(config: {
  paginationProp: boolean | undefined;
  externalTotalItems?: number;
  externalPage?: number;
  externalOnPageChange?: (page: number) => void;
  externalOnPageSizeChange?: (pageSize: number) => void;
  pageSize: number;
  serverSide: boolean;
  fetchRows?: Props["fetchRows"];
  rowData?: any[];
  autoSizeStrategy?: AutoSizeStrategy;
  gridApiRef: RefObject<any>;
}): PaginationConfig {
  const {
    paginationProp,
    externalTotalItems,
    externalPage,
    externalOnPageChange,
    externalOnPageSizeChange,
    pageSize,
    serverSide,
    fetchRows,
    rowData,
    autoSizeStrategy,
    gridApiRef,
  } = config;

  const isControlledPagination =
    externalTotalItems !== undefined && externalOnPageChange !== undefined;
  const pagination = resolveShowPagination(paginationProp, isControlledPagination);

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const [internalTotalItems, setInternalTotalItems] = useState(0);

  const currentPage = externalPage ?? internalPage;
  const currentPageSize = isControlledPagination ? pageSize : internalPageSize;
  const totalItems = externalTotalItems ?? internalTotalItems;

  const createDatasource = useCallback(
    (pageSizeLocal: number, targetPage: number = 1) => {
      if (!fetchRows) return null;

      return {
        getRows: async (params: IGetRowsParams) => {
          try {
            const startRow = params.startRow ?? 0;
            const blockSize = pageSizeLocal;
            const calculatedPage = Math.floor(startRow / blockSize) + 1;
            const page =
              startRow === 0 || startRow % blockSize === 0
                ? targetPage
                : calculatedPage;

            const result = await fetchRows({
              page,
              pageSize: blockSize,
              sortModel: params.sortModel,
              filterModel: params.filterModel,
            });
            const rowsThisPage = result.rows ?? [];
            const total = result.total ?? rowsThisPage.length;

            if (!isControlledPagination) {
              setInternalTotalItems(total);
              setInternalPage(page);
            }
            params.successCallback(rowsThisPage, total);
          } catch (err) {
            console.error("Datasource getRows error:", err);
            params.failCallback();
          }
        },
      };
    },
    [fetchRows, isControlledPagination],
  );

  const onGridReady = useCallback(
    (params: any) => {
      gridApiRef.current = params.api;

      if (autoSizeStrategy?.type === "fitGridWidth") {
        sizeColumnsToFitSafely(params.api);
      }

      if (!serverSide && rowData && !isControlledPagination) {
        setInternalTotalItems(rowData.length);
      }
      if (!serverSide || !fetchRows) return;

      applyGridDatasource(gridApiRef.current, createDatasource(pageSize, 1));
    },
    [
      serverSide,
      fetchRows,
      createDatasource,
      pageSize,
      rowData,
      isControlledPagination,
      autoSizeStrategy,
      gridApiRef,
    ],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (isControlledPagination && externalOnPageChange) {
        externalOnPageChange(page);
      } else {
        setInternalPage(page);
      }

      const gridApi = gridApiRef.current;
      if (serverSide && gridApi && fetchRows) {
        refreshServerSideGrid(gridApi, createDatasource, currentPageSize, page);
        return;
      }

      if (!serverSide && gridApi && !isControlledPagination) {
        gridApi.paginationGoToPage(page - 1);
      }
    },
    [
      serverSide,
      currentPageSize,
      createDatasource,
      fetchRows,
      isControlledPagination,
      externalOnPageChange,
      gridApiRef,
    ],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      if (isControlledPagination && externalOnPageSizeChange) {
        externalOnPageSizeChange(size);
        externalOnPageChange?.(1);
      } else {
        setInternalPageSize(size);
        setInternalPage(1);
      }

      const gridApi = gridApiRef.current;
      if (serverSide && gridApi && fetchRows) {
        refreshServerSideGrid(gridApi, createDatasource, size, 1);
        return;
      }

      if (!serverSide && gridApi && !isControlledPagination) {
        gridApi.paginationSetPageSize(size);
        gridApi.paginationGoToPage(0);
      }
    },
    [
      serverSide,
      createDatasource,
      fetchRows,
      isControlledPagination,
      externalOnPageSizeChange,
      externalOnPageChange,
      gridApiRef,
    ],
  );

  useEffect(() => {
    if (!serverSide && rowData && !isControlledPagination) {
      setInternalTotalItems(rowData.length);
    }
  }, [rowData, serverSide, isControlledPagination]);

  return {
    isControlledPagination,
    pagination,
    currentPage,
    currentPageSize,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
    onGridReady,
  };
}

function toSyncSelectedKey(ids: string[] | undefined): string {
  if (!Array.isArray(ids)) {
    return "";
  }
  return [...ids]
    .map(String)
    .sort((left, right) => left.localeCompare(right))
    .join("\0");
}

function getNodeRowId(nodeId: string | null | undefined): string {
  if (nodeId == null) {
    return "";
  }
  return String(nodeId);
}

function applySyncedSelectionToApi(
  api: any,
  ids: string[] | undefined,
  syncingSelectionRef: { current: boolean },
): void {
  if (!api) {
    return;
  }
  if (!Array.isArray(ids)) {
    return;
  }
  const idSet = new Set(ids.map(String));
  syncingSelectionRef.current = true;
  try {
    api.forEachNode?.(
      (node: { id?: string | null; setSelected?: (v: boolean) => void }) => {
        node.setSelected?.(idSet.has(getNodeRowId(node.id)));
      },
    );
  } finally {
    syncingSelectionRef.current = false;
  }
}

function syncSelectionIfReady(
  multiSelectCheckboxes: boolean,
  api: any,
  applySyncedSelection: (api: any) => void,
): void {
  if (!multiSelectCheckboxes) {
    return;
  }
  if (!api) {
    return;
  }
  applySyncedSelection(api);
}

function applySelectionOnGridReady(
  multiSelectCheckboxes: boolean,
  applySyncedSelection: (api: any) => void,
  api: any,
): void {
  if (!multiSelectCheckboxes) {
    return;
  }
  applySyncedSelection(api);
}

function emitSelectionChange(
  api: { getSelectedRows?: () => any[] },
  isSyncing: boolean,
  onRowsSelected?: (rows: any[]) => void,
  onRowSelected?: (row: any) => void,
): void {
  if (isSyncing) {
    return;
  }
  const selectedRows = api.getSelectedRows?.() ?? [];
  if (onRowsSelected) {
    onRowsSelected(selectedRows);
    return;
  }
  onRowSelected?.(selectedRows[0] ?? null);
}

function resolveSelectionChangedHandler<T>(
  onRowsSelected: ((rows: any[]) => void) | undefined,
  onRowSelected: ((row: any) => void) | undefined,
  handler: T,
): T | undefined {
  if (!onRowsSelected && !onRowSelected) {
    return undefined;
  }
  return handler;
}

function resolveWhenTrue<T>(enabled: boolean, handler: T): T | undefined {
  if (!enabled) {
    return undefined;
  }
  return handler;
}

function resolveRowClickedHandler(
  onRowClick: ((row: any) => void) | undefined,
  openOnRowClick: boolean,
) {
  if (!onRowClick) {
    return undefined;
  }
  if (!openOnRowClick) {
    return undefined;
  }
  return (event: { data: any }) => onRowClick(event.data);
}

function resolveCellKeyDownHandler(
  onRowClick: ((row: any) => void) | undefined,
  handler: (event: AgGridCellKeyDownEvent) => void,
) {
  if (!onRowClick) {
    return undefined;
  }
  return handler;
}

function resolveColumnDefs(columnDefs: any[] | undefined): any[] {
  if (!columnDefs) {
    return [];
  }
  return columnDefs;
}

function resolveGetRowIdFn(
  getRowId?: (params: { data: unknown }) => string,
): ((params: { data: unknown }) => string) | undefined {
  if (!getRowId) {
    return undefined;
  }
  return (params: { data: unknown }) => getRowId({ data: params.data });
}

function shouldShowToolbar(
  isSearch: boolean,
  isAddButton?: { isAdd: boolean },
): boolean {
  if (isSearch) {
    return true;
  }
  return Boolean(isAddButton?.isAdd);
}

function isClientSidePagination(serverSide: boolean, pagination: boolean): boolean {
  if (serverSide) {
    return false;
  }
  return pagination;
}

function getRootClassName(fillParentHeight: boolean): string {
  if (fillParentHeight) {
    return "w-full flex min-h-0 flex-1 flex-col";
  }
  return "w-full";
}

function getRootStyle(width: number | string, fillParentHeight: boolean): CSSProperties {
  if (fillParentHeight) {
    return { width, minHeight: 0 };
  }
  return { width };
}

const GRID_SHELL_CLASS =
  "ag-grid-shell box-border flex w-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white dark:border-dark-500 dark:bg-dark-800";

function getShellClassName(growInFlexParent: boolean): string {
  if (growInFlexParent) {
    return clsx(GRID_SHELL_CLASS, "min-h-0 flex-1");
  }
  return GRID_SHELL_CLASS;
}

function getThemeClassName(rowPointerOnClick: boolean, openOnRowClick: boolean): string {
  if (rowPointerOnClick && openOnRowClick) {
    return "ag-theme-alpine h-full w-full ag-row-pointer-on-click";
  }
  return "ag-theme-alpine h-full w-full";
}

function getStaticRowHeight(
  getRowHeight?: Props["getRowHeight"],
): number | undefined {
  if (getRowHeight) {
    return undefined;
  }
  return 28;
}

type AgGridRowModelProps = {
  rowData: any[] | undefined;
  rowModelType: "infinite" | undefined;
  cacheBlockSize: number | undefined;
  maxBlocksInCache: number | undefined;
  infiniteInitialRowCount: number | undefined;
  pagination: boolean;
  paginationPageSize: number | undefined;
};

function getAgGridRowModelProps(
  serverSide: boolean,
  rowData: any[] | undefined,
  clientPagination: boolean,
  currentPageSize: number,
): AgGridRowModelProps {
  if (serverSide) {
    return {
      rowData: undefined,
      rowModelType: "infinite",
      cacheBlockSize: currentPageSize,
      maxBlocksInCache: 5,
      infiniteInitialRowCount: 1,
      pagination: false,
      paginationPageSize: undefined,
    };
  }
  if (clientPagination) {
    return {
      rowData,
      rowModelType: undefined,
      cacheBlockSize: undefined,
      maxBlocksInCache: undefined,
      infiniteInitialRowCount: undefined,
      pagination: true,
      paginationPageSize: currentPageSize,
    };
  }
  return {
    rowData,
    rowModelType: undefined,
    cacheBlockSize: undefined,
    maxBlocksInCache: undefined,
    infiniteInitialRowCount: undefined,
    pagination: false,
    paginationPageSize: undefined,
  };
}

function useAgGridSelectionSync(config: {
  multiSelectCheckboxes: boolean;
  onRowSelected?: (row: any) => void;
  onRowsSelected?: (rows: any[]) => void;
  syncSelectedRowIds?: string[];
  rowData?: any[];
  gridApiRef: RefObject<any>;
  onGridReady: (params: any) => void;
}) {
  const {
    multiSelectCheckboxes,
    onRowSelected,
    onRowsSelected,
    syncSelectedRowIds,
    rowData,
    gridApiRef,
    onGridReady,
  } = config;

  const syncSelectedRowIdsRef = useRef(syncSelectedRowIds);
  const syncingSelectionRef = useRef(false);
  syncSelectedRowIdsRef.current = syncSelectedRowIds;

  const applySyncedSelection = useCallback((api: any) => {
    applySyncedSelectionToApi(api, syncSelectedRowIdsRef.current, syncingSelectionRef);
  }, []);

  const syncSelectedKey = toSyncSelectedKey(syncSelectedRowIds);

  useEffect(() => {
    const api = gridApiRef.current?.api ?? gridApiRef.current;
    syncSelectionIfReady(multiSelectCheckboxes, api, applySyncedSelection);
  }, [applySyncedSelection, multiSelectCheckboxes, rowData, syncSelectedKey, gridApiRef]);

  const handleGridReady = useCallback(
    (params: any) => {
      onGridReady(params);
      applySelectionOnGridReady(multiSelectCheckboxes, applySyncedSelection, params.api);
    },
    [applySyncedSelection, multiSelectCheckboxes, onGridReady],
  );

  const handleSelectionChanged = useCallback(
    (event: { api: { getSelectedRows?: () => any[] } }) => {
      emitSelectionChange(
        event.api,
        syncingSelectionRef.current,
        onRowsSelected,
        onRowSelected,
      );
    },
    [onRowSelected, onRowsSelected],
  );

  const handleFirstDataRendered = useCallback(
    (event: { api: any }) => {
      applySyncedSelection(event.api);
    },
    [applySyncedSelection],
  );

  return {
    handleGridReady,
    onSelectionChanged: resolveSelectionChangedHandler(
      onRowsSelected,
      onRowSelected,
      handleSelectionChanged,
    ),
    onFirstDataRendered: resolveWhenTrue(multiSelectCheckboxes, handleFirstDataRendered),
  };
}

export function AgGridSuperWrapper({
  rowData,
  columnDefs,
  height,
  width = "100%",
  pagination: paginationProp,
  searchTitle = "",
  title = "",
  pageSize = 10,
  isAddButton,
  onRowClick,
  openOnRowClick = true,
  rowPointerOnClick = false,
  fetchThunk,
  serverSide = false,
  isSearch = false,
  fetchRows,
  totalItems: externalTotalItems,
  page: externalPage,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  domLayout = "normal",
  autoSizeStrategy,
  getRowId,
  context,
  isFullWidthRow,
  fullWidthCellRenderer,
  getRowHeight,
  getRowClass,
  embedFullWidthRows,
  singleSelectCheckboxes = false,
  multiSelectCheckboxes = false,
  onRowSelected,
  onRowsSelected,
  syncSelectedRowIds,
}: Readonly<Props>) {
  const gridApiRef = useRef<any>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const calculatedHeight = useCalculatedGridHeight(height, gridContainerRef);
  const computedColDefs = useMemo(() => resolveColumnDefs(columnDefs), [columnDefs]);

  useFitGridWidthOnResize(
    autoSizeStrategy,
    gridContainerRef,
    gridApiRef,
    computedColDefs,
    rowData,
  );

  const {
    pagination,
    currentPage,
    currentPageSize,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
    onGridReady,
  } = useAgGridPagination({
    paginationProp,
    externalTotalItems,
    externalPage,
    externalOnPageChange,
    externalOnPageSizeChange,
    pageSize,
    serverSide,
    fetchRows,
    rowData,
    autoSizeStrategy,
    gridApiRef,
  });

  const { handleGridReady, onSelectionChanged, onFirstDataRendered } =
    useAgGridSelectionSync({
      multiSelectCheckboxes,
      onRowSelected,
      onRowsSelected,
      syncSelectedRowIds,
      rowData,
      gridApiRef,
      onGridReady,
    });

  const { searchTerm, setSearchTerm, handleSearch, handleClear } =
    useAgGridSearch(fetchThunk);

  const fillParentHeight = height === "100%";
  const growInFlexParent = shouldGrowInFlexParent(height);
  const showToolbar = shouldShowToolbar(isSearch, isAddButton);
  const clientPagination = isClientSidePagination(serverSide, pagination);
  const rowModelProps = getAgGridRowModelProps(
    serverSide,
    rowData,
    clientPagination,
    currentPageSize,
  );

  const resolvedGetRowId = useMemo(() => resolveGetRowIdFn(getRowId), [getRowId]);

  const handleCellKeyDown = useCallback(
    (event: AgGridCellKeyDownEvent) => {
      handleAgGridCellKeyDown(event, onRowClick);
    },
    [onRowClick],
  );

  return (
    <div
      className={getRootClassName(fillParentHeight)}
      style={getRootStyle(width, fillParentHeight)}
    >
      <AgGridTitle title={title} />
      <AgGridToolbarSlot
        visible={showToolbar}
        isSearch={isSearch}
        searchTitle={searchTitle}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onClear={handleClear}
        isAddButton={isAddButton}
        onAddClick={() => navigate(isAddButton?.path ?? "")}
      />
      <div
        ref={gridContainerRef}
        className={getShellClassName(growInFlexParent)}
        style={getGridContainerStyle(height)}
      >
        <div className="min-h-0 w-full flex-1" style={{ minHeight: 0 }}>
          <div
            className={getThemeClassName(rowPointerOnClick, openOnRowClick)}
            style={getThemeHeightStyle(calculatedHeight)}
          >
            <AgGridReact
              onGridReady={handleGridReady}
              ref={gridApiRef}
              rowData={rowModelProps.rowData}
              columnDefs={computedColDefs}
              defaultColDef={DEFAULT_COL_DEF}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              autoSizeStrategy={autoSizeStrategy}
              rowSelection={resolveRowSelection(
                multiSelectCheckboxes,
                singleSelectCheckboxes,
              )}
              onSelectionChanged={onSelectionChanged}
              onFirstDataRendered={onFirstDataRendered}
              onRowClicked={resolveRowClickedHandler(onRowClick, openOnRowClick)}
              onCellKeyDown={resolveCellKeyDownHandler(onRowClick, handleCellKeyDown)}
              pagination={rowModelProps.pagination}
              paginationPageSize={rowModelProps.paginationPageSize}
              headerHeight={34}
              groupHeaderHeight={46}
              rowHeight={getStaticRowHeight(getRowHeight)}
              getRowHeight={getRowHeight}
              getRowClass={getRowClass}
              rowModelType={rowModelProps.rowModelType}
              cacheBlockSize={rowModelProps.cacheBlockSize}
              maxBlocksInCache={rowModelProps.maxBlocksInCache}
              suppressNoRowsOverlay={false}
              suppressPaginationPanel={true}
              infiniteInitialRowCount={rowModelProps.infiniteInitialRowCount}
              domLayout={domLayout}
              context={context}
              isFullWidthRow={isFullWidthRow}
              fullWidthCellRenderer={fullWidthCellRenderer}
              embedFullWidthRows={embedFullWidthRows}
              getRowId={resolvedGetRowId}
            />
          </div>
        </div>
      </div>
      <AgGridPaginationFooter
        visible={pagination}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        totalItems={totalItems}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
export default AgGridSuperWrapper;
