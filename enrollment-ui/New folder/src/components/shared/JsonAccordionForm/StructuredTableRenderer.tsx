// Search working
// Component to render structured tables (with headers + rows) using react-table
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Table, THead, Th, Tr } from "@/components/ui";
import clsx from "clsx";
import { toBracketPath } from "./utils";
import type { Comment } from "@/hooks/useComments";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";
import type { StructuredTable } from "./structuredTableHelpers";
import {
  buildStructuredTableColumns,
  StructuredTableBody,
  StructuredTableSectionMeta,
  StructuredTableTitleButton,
  useStructuredTableSearchEffects,
} from "./structuredTableRendererComponents";

interface StructuredTableRendererProps {
  table: StructuredTable;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  path?: Array<string | number>;
  isEditing?: boolean;
  onValueChange?: (path: Array<string | number>, newValue: StructuredTable) => void;
  shouldEnableStatus?: boolean;
  shouldEnableComments?: boolean;
  shouldEnableSectionComments?: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  fieldPath?: string;
  fieldStatus?: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment?: (
    fieldPath: string,
    comment: string,
    userId: string,
    userRole?: "maker1" | "maker2" | "checker" | "superadmin",
  ) => void;
  userId?: string;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  rootData?: unknown;
  /** When true, skip inner title toggle — parent CollapsibleSection already provides it */
  hideTitle?: boolean;
}

const INITIAL_ROW_LIMIT = 10;

export function StructuredTableRenderer({
  table,
  onSourceClick,
  path = [],
  isEditing = false,
  onValueChange,
  shouldEnableStatus = false,
  shouldEnableComments = false,
  shouldEnableSectionComments = false,
  fieldPath,
  fieldStatus = {},
  onFieldStatusChange,
  getComments,
  onAddComment,
  searchText,
  activeMatchPath,
  matchedPaths = [],
  userId: userIdProp,
  userRole,
  rootData,
  hideTitle = false,
}: Readonly<StructuredTableRendererProps>) {
  const keycloakUser = useKeycloakUser();
  const userId = userIdProp || keycloakUser.userId || "unknown";

  const handleAddCommentForField = useCallback(
    (commentFieldPath: string, comment: string) => {
      if (!onAddComment) return;

      const userRoleValue = Array.isArray(userRole)
        ? userRole[0] || "unknown"
        : userRole || "unknown";
      onAddComment(commentFieldPath, comment, userId, userRoleValue);
    },
    [onAddComment, userId, userRole],
  );

  const [isTableCollapsed, setIsTableCollapsed] = useState(true);
  const [tableExpanded, setTableExpanded] = useState(false);
  const tableFieldPath =
    path.length > 0 ? toBracketPath(path) : fieldPath || "";
  const hasAutoExpandedRef = useRef<string>("");
  const localCellValuesRef = useRef<Record<string, string>>({});
  const isAddingRowRef = useRef(false);
  const newRowRef = useRef<HTMLTableRowElement | null>(null);

  useStructuredTableSearchEffects({
    searchText,
    activeMatchPath,
    matchedPaths,
    tableFieldPath,
    tableRowCount: table.rows.length,
    tableExpanded,
    hasAutoExpandedRef,
    setIsTableCollapsed,
    setTableExpanded,
  });

  useEffect(() => {
    const newLocalValues: Record<string, string> = {};
    table.rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, cellIndex) => {
        newLocalValues[`${rowIndex}-${cellIndex}`] = cell || "";
      });
    });
    localCellValuesRef.current = newLocalValues;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.rows.length, table.headers.length]);

  const previousRowCountRef = useRef(table.rows.length);

  useEffect(() => {
    isAddingRowRef.current = false;

    if (
      table.rows.length > previousRowCountRef.current &&
      table.rows.length > INITIAL_ROW_LIMIT
    ) {
      setTableExpanded(true);
      setTimeout(() => {
        newRowRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
    previousRowCountRef.current = table.rows.length;
  }, [table.rows.length, table.headers.length]);

  const tableData = useMemo(() => {
    if (!table.rows?.length || !table.headers?.length) {
      return [];
    }

    return table.rows.map((row) => {
      if (!row?.cells) {
        return {};
      }

      const rowData: Record<string, string> = {};
      table.headers.forEach((_header, colIndex) => {
        rowData[`col_${colIndex}`] = row.cells[colIndex] || "";
      });
      return rowData;
    });
  }, [table.headers, table.rows]);

  const columns = useMemo(
    () =>
      buildStructuredTableColumns({
        table,
        tableFieldPath,
        fieldPath,
        path,
        isEditing,
        shouldEnableStatus,
        shouldEnableComments,
        fieldStatus,
        onFieldStatusChange,
        userRole,
        getComments,
        onAddComment: handleAddCommentForField,
        userId,
        searchText,
        activeMatchPath,
        matchedPaths,
        localCellValuesRef,
        onValueChange,
        onSourceClick,
        rootData,
      }),
    [
      table,
      isEditing,
      onValueChange,
      path,
      shouldEnableStatus,
      shouldEnableComments,
      tableFieldPath,
      fieldStatus,
      onFieldStatusChange,
      userRole,
      getComments,
      userId,
      searchText,
      activeMatchPath,
      matchedPaths,
      fieldPath,
      handleAddCommentForField,
      onSourceClick,
      rootData,
    ],
  );

  const reactTable = useReactTable({
    data: tableData,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 180,
      minSize: 100,
      maxSize: 500,
    },
  });

  const toggleTableCollapsed = useCallback(() => {
    setIsTableCollapsed((previous) => !previous);
  }, []);

  const stopPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const showTableContent = hideTitle || !isTableCollapsed;

  return (
    <div
      data-component-name="StructuredTableRenderer"
      data-field-path={tableFieldPath}
      className="relative w-full min-w-0"
    >
      <StructuredTableSectionMeta
        tableFieldPath={tableFieldPath}
        shouldEnableStatus={shouldEnableStatus}
        shouldEnableSectionComments={shouldEnableSectionComments}
        fieldStatus={fieldStatus}
        onFieldStatusChange={onFieldStatusChange}
        userRole={userRole}
        isEditing={isEditing}
        getComments={getComments}
        onAddComment={handleAddCommentForField}
        userId={userId}
      />

      {!hideTitle && (
        <StructuredTableTitleButton
          table={table}
          tableFieldPath={tableFieldPath}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          isTableCollapsed={isTableCollapsed}
          onToggle={toggleTableCollapsed}
        />
      )}

      {showTableContent && tableData.length > 0 && (
        <>
          <div
            className="dark:border-dark-600 dark:bg-dark-800 w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"
            style={{
              minHeight: tableData.length > 0 ? "auto" : "200px",
              height: "auto",
              maxHeight: "none",
            }}
            onClick={stopPropagation}
          >
            <Table
              className="w-full min-w-full text-left"
              style={{
                width: reactTable.getCenterTotalSize(),
                height: "auto",
                minHeight: "auto",
              }}
              onClick={stopPropagation}
            >
              <THead>
                {reactTable.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className="group dark:bg-dark-700 relative bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200"
                        style={{
                          width: header.getSize(),
                          position: "relative",
                          justifyItems: "center",
                          lineHeight: "1.25",
                        }}
                      >
                        <div className="flex items-center">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </div>

                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={clsx(
                            "absolute top-0 right-0 bottom-0 cursor-col-resize touch-none rounded-sm transition-all select-none",
                            header.column.getIsResizing()
                              ? "bg-primary-500 w-1"
                              : "w-0.5 bg-transparent group-hover:bg-gray-400",
                          )}
                          style={{
                            width: header.column.getIsResizing() ? "4px" : "2px",
                          }}
                        />
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>

              <StructuredTableBody
                reactTable={reactTable}
                table={table}
                tableData={tableData}
                tableFieldPath={tableFieldPath}
                tableExpanded={tableExpanded}
                setTableExpanded={setTableExpanded}
                isEditing={isEditing}
                searchText={searchText}
                activeMatchPath={activeMatchPath}
                path={path}
                isAddingRowRef={isAddingRowRef}
                newRowRef={newRowRef}
                onValueChange={onValueChange}
              />
            </Table>
          </div>

          {table.sources && table.sources.length > 0 && (
            <div className="mt-2 space-y-1">
              {table.sources.map((source, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSourceClick?.(source)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  data-source-button
                  data-page-number={source.page_number}
                >
                  {source.page_number && `Page ${source.page_number}`}
                  {source.snippet && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {source.snippet.substring(0, 100)}
                      {source.snippet.length > 100 ? "..." : ""}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

StructuredTableRenderer.displayName = "StructuredTableRenderer";
