import React, { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import {
  flexRender,
  type CellContext,
  type ColumnDef,
  type Row,
  type Table as ReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { PlusIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { TBody, Tr, Td } from "@/components/ui";
import type { StatusValue } from "@/hooks/useStatus";
import type { Comment } from "@/hooks/useComments";
import { AutoResizeTextarea } from "./Field";
import FieldCommentButton from "./FieldCommentButton";
import FieldStatusDropdown from "./FieldStatusDropdown";
import SeeMoreLess from "./SeeMoreLess";
import { createSearchHighlighter } from "./textHighlightHelpers";
import {
  detectCellSources,
  getCellClickTitle,
  getColumnSizing,
  getMatchedRowIndexBeyondLimit,
  getSearchPathsToCheck,
  handleStructuredTableCellClick,
  hasClickableCellSource,
  isItemNameColumn,
  isSerialNumberColumn,
  isTwoColumnLayout,
  tablePathMatchesSearch,
  type StructuredTable,
  type TableSource,
} from "./structuredTableHelpers";

const INITIAL_ROW_LIMIT = 10;

type UserRole = "maker1" | "maker2" | "checker" | "superadmin" | null;

function getFieldStatusValue(
  fieldStatus: Record<string, string | null>,
  path: string,
): StatusValue {
  return (fieldStatus[path] as StatusValue) || null;
}

interface StructuredTableSectionMetaProps {
  tableFieldPath: string;
  shouldEnableStatus: boolean;
  shouldEnableSectionComments: boolean;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  userRole?: UserRole;
  isEditing: boolean;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment: (fieldPath: string, comment: string) => void;
  userId: string;
}

export function StructuredTableSectionMeta({
  tableFieldPath,
  shouldEnableStatus,
  shouldEnableSectionComments,
  fieldStatus,
  onFieldStatusChange,
  userRole,
  isEditing,
  getComments,
  onAddComment,
  userId,
}: Readonly<StructuredTableSectionMetaProps>) {
  return (
    <>
      {shouldEnableStatus && (
        <div className="dark:border-dark-600 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <FieldStatusDropdown
            fieldPath={tableFieldPath}
            status={getFieldStatusValue(fieldStatus, tableFieldPath)}
            onStatusChange={onFieldStatusChange || (() => {})}
            userRole={userRole}
            isEditing={isEditing}
          />
        </div>
      )}

      {shouldEnableSectionComments && (
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Comments:
          </span>
          <FieldCommentButton
            fieldPath={tableFieldPath}
            comments={getComments ? getComments(tableFieldPath) : []}
            onAddComment={onAddComment}
            userId={userId}
            userRole={userRole}
          />
        </div>
      )}
    </>
  );
}

interface StructuredTableTitleButtonProps {
  table: StructuredTable;
  tableFieldPath: string;
  searchText?: string;
  activeMatchPath?: string | null;
  isTableCollapsed: boolean;
  onToggle: () => void;
}

export function StructuredTableTitleButton({
  table,
  tableFieldPath,
  searchText,
  activeMatchPath,
  isTableCollapsed,
  onToggle,
}: Readonly<StructuredTableTitleButtonProps>) {
  const titlePath = tableFieldPath ? `${tableFieldPath}.title` : undefined;
  const highlightTitle = useMemo(
    () => createSearchHighlighter(searchText, titlePath, activeMatchPath),
    [searchText, titlePath, activeMatchPath],
  );
  const displayTitle = table.title ?? "Table";
  const titleContent = searchText ? highlightTitle(displayTitle) : displayTitle;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          onToggle();
        }}
        className="dark:hover:bg-dark-700 -mx-1.5 flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors hover:bg-gray-50"
        aria-label={isTableCollapsed ? "Expand table" : "Collapse table"}
      >
        {isTableCollapsed ? (
          <ChevronDownIcon className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronUpIcon className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        )}
        <h3 className="text-xs leading-tight font-semibold text-gray-900 dark:text-gray-100">
          {titleContent}
        </h3>
      </button>
    </div>
  );
}

interface StructuredTableEditableCellProps {
  value: string;
  rowIndex: number;
  headerIndex: number;
  table: StructuredTable;
  path: Array<string | number>;
  isEditing: boolean;
  localCellValuesRef: MutableRefObject<Record<string, string>>;
  onValueChange: (path: Array<string | number>, newValue: StructuredTable) => void;
}

function StructuredTableEditableCell({
  value,
  rowIndex,
  headerIndex,
  table,
  path,
  isEditing,
  localCellValuesRef,
  onValueChange,
}: Readonly<StructuredTableEditableCellProps>) {
  const cellKey = `${rowIndex}-${headerIndex}`;
  const [localValue, setLocalValue] = useState(() => value || "");
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    const refValue = localCellValuesRef.current[cellKey];
    setLocalValue(refValue !== undefined ? refValue : value || "");
  }, [cellKey, localCellValuesRef, value]);

  const updateCellValue = useCallback(
    (newValue: string) => {
      localCellValuesRef.current[cellKey] = newValue;
      const updatedRows = [...table.rows];
      if (!updatedRows[rowIndex]?.cells) {
        return;
      }
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        cells: [...updatedRows[rowIndex].cells],
      };
      updatedRows[rowIndex].cells[headerIndex] = newValue;
      onValueChange(path, { ...table, rows: updatedRows });
    },
    [cellKey, headerIndex, localCellValuesRef, onValueChange, path, rowIndex, table],
  );

  const handleChange = useCallback(
    (newVal: string) => {
      setLocalValue(newVal);
      updateCellValue(newVal);
    },
    [updateCellValue],
  );

  const handleBlur = useCallback(() => {
    const finalValue =
      localCellValuesRef.current[cellKey] !== undefined
        ? localCellValuesRef.current[cellKey]
        : value || "";
    const updatedRows = [...table.rows];
    if (!updatedRows[rowIndex]?.cells) {
      return;
    }
    const currentCellValue = updatedRows[rowIndex].cells[headerIndex] || "";
    if (currentCellValue === finalValue) {
      return;
    }
    updateCellValue(finalValue);
  }, [
    cellKey,
    headerIndex,
    localCellValuesRef,
    rowIndex,
    table,
    updateCellValue,
    value,
  ]);

  const stopPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <div onClick={stopPropagation} onMouseDown={stopPropagation}>
      <AutoResizeTextarea
        value={localValue}
        onChange={handleChange}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          handleBlur();
        }}
        disabled={!isEditing}
        className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs leading-tight transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
      />
    </div>
  );
}

interface StructuredTableReadOnlyCellProps {
  value: string;
  rowIndex: number;
  columnIndex: number;
  table: StructuredTable;
  tableFieldPath: string;
  fieldPath?: string;
  rootData?: unknown;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  onSourceClick?: (source: TableSource) => void;
}

function StructuredTableReadOnlyCell({
  value,
  rowIndex,
  columnIndex,
  table,
  tableFieldPath,
  fieldPath,
  rootData,
  searchText,
  activeMatchPath,
  matchedPaths = [],
  onSourceClick,
}: Readonly<StructuredTableReadOnlyCellProps>) {
  const textValue = value || "";
  const cellSources = detectCellSources({
    rowIndex,
    table,
    rootData,
    fieldPath,
    hasSourceClickHandler: Boolean(onSourceClick),
  });
  const clickable = hasClickableCellSource(cellSources, table.sources);
  const cellFieldPath = tableFieldPath
    ? `${tableFieldPath}.rows[${rowIndex}].cells[${columnIndex}]`
    : undefined;
  const clickTitle = clickable
    ? getCellClickTitle(cellSources, table.sources)
    : undefined;

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      handleStructuredTableCellClick(
        event,
        cellSources,
        table.sources,
        onSourceClick,
      );
    },
    [cellSources, onSourceClick, table.sources],
  );

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      className={
        clickable
          ? "min-h-full w-full cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
          : "w-full"
      }
      title={clickTitle}
      style={{ width: "100%", minHeight: "100%" }}
      data-path={cellFieldPath}
    >
      <SeeMoreLess
        content={textValue}
        maxLines={1}
        minCharForSeeMore={100}
        textClassName="text-gray-700 dark:text-gray-300"
        buttonClassName=""
        highlightText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        currentPath={cellFieldPath}
        stopPropagationOnClick={clickable}
      />
    </div>
  );
}

interface StructuredTableDataCellProps {
  value: string;
  rowIndex: number;
  columnIndex: number;
  isFirstColumn: boolean;
  isSerialCol: boolean;
  table: StructuredTable;
  tableFieldPath: string;
  path: Array<string | number>;
  fieldPath?: string;
  rootData?: unknown;
  isEditing: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  localCellValuesRef: MutableRefObject<Record<string, string>>;
  onValueChange?: (path: Array<string | number>, newValue: StructuredTable) => void;
  onSourceClick?: (source: TableSource) => void;
}

function StructuredTableDataCell({
  value,
  rowIndex,
  columnIndex,
  isFirstColumn,
  isSerialCol,
  table,
  tableFieldPath,
  path,
  fieldPath,
  rootData,
  isEditing,
  searchText,
  activeMatchPath,
  matchedPaths,
  localCellValuesRef,
  onValueChange,
  onSourceClick,
}: Readonly<StructuredTableDataCellProps>) {
  if (isSerialCol) {
    return (
      <div
        className="text-center font-medium text-gray-700 dark:text-gray-300"
        style={{ lineHeight: "1.25" }}
      >
        {value || (isFirstColumn ? rowIndex + 1 : "")}
      </div>
    );
  }

  if (isEditing && onValueChange) {
    return (
      <StructuredTableEditableCell
        value={value}
        rowIndex={rowIndex}
        headerIndex={columnIndex}
        table={table}
        path={path}
        isEditing={isEditing}
        localCellValuesRef={localCellValuesRef}
        onValueChange={onValueChange}
      />
    );
  }

  return (
    <StructuredTableReadOnlyCell
      value={value}
      rowIndex={rowIndex}
      columnIndex={columnIndex}
      table={table}
      tableFieldPath={tableFieldPath}
      fieldPath={fieldPath}
      rootData={rootData}
      searchText={searchText}
      activeMatchPath={activeMatchPath}
      matchedPaths={matchedPaths}
      onSourceClick={onSourceClick}
    />
  );
}

interface StructuredTableStatusColumnCellProps {
  rowIndex: number;
  cellFieldPath: string;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  userRole?: UserRole;
  isEditing: boolean;
}

function StructuredTableStatusColumnCell({
  rowIndex,
  cellFieldPath,
  fieldStatus,
  onFieldStatusChange,
  userRole,
  isEditing,
}: Readonly<StructuredTableStatusColumnCellProps>) {
  const resolvedPath = cellFieldPath.replace("[rowIndex]", String(rowIndex));
  return (
    <div
      className="flex items-center justify-center py-0.5"
      style={{ lineHeight: "1.25" }}
    >
      <FieldStatusDropdown
        fieldPath={resolvedPath}
        status={getFieldStatusValue(fieldStatus, resolvedPath)}
        onStatusChange={onFieldStatusChange || (() => {})}
        userRole={userRole}
        isEditing={isEditing}
      />
    </div>
  );
}

interface StructuredTableCommentsColumnCellProps {
  rowIndex: number;
  cellFieldPathTemplate: string;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment: (fieldPath: string, comment: string) => void;
  userId: string;
  userRole?: UserRole;
}

function StructuredTableCommentsColumnCell({
  rowIndex,
  cellFieldPathTemplate,
  getComments,
  onAddComment,
  userId,
  userRole,
}: Readonly<StructuredTableCommentsColumnCellProps>) {
  const cellFieldPath = cellFieldPathTemplate.replace(
    "[rowIndex]",
    String(rowIndex),
  );
  return (
    <div
      className="flex items-center justify-center py-0.5"
      style={{ lineHeight: "1.25" }}
    >
      <FieldCommentButton
        fieldPath={cellFieldPath}
        comments={getComments ? getComments(cellFieldPath) : []}
        onAddComment={onAddComment}
        userId={userId}
        userRole={userRole}
      />
    </div>
  );
}

export interface BuildStructuredTableColumnsParams {
  table: StructuredTable;
  tableFieldPath: string;
  fieldPath?: string;
  path: Array<string | number>;
  isEditing: boolean;
  shouldEnableStatus: boolean;
  shouldEnableComments: boolean;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  userRole?: UserRole;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment: (fieldPath: string, comment: string) => void;
  userId: string;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  localCellValuesRef: MutableRefObject<Record<string, string>>;
  onValueChange?: (path: Array<string | number>, newValue: StructuredTable) => void;
  onSourceClick?: (source: TableSource) => void;
  rootData?: unknown;
}

export function buildStructuredTableColumns({
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
  onAddComment,
  userId,
  searchText,
  activeMatchPath,
  matchedPaths = [],
  localCellValuesRef,
  onValueChange,
  onSourceClick,
  rootData,
}: BuildStructuredTableColumnsParams): ColumnDef<Record<string, string>>[] {
  const dataColumns: ColumnDef<Record<string, string>>[] = [];
  const shouldShowStatus = shouldEnableStatus === true;
  const shouldShowComments = shouldEnableComments === true;
  const twoColumnLayout = isTwoColumnLayout(table.headers);

  table.headers.forEach((header, index) => {
    const isFirstColumn = index === 0;
    const isSerialCol = isSerialNumberColumn(header);
    const { size, minSize, maxSize } = getColumnSizing(header, isFirstColumn);
    const uniqueColumnId = `col_${index}`;
    const headerPath = tableFieldPath
      ? `${tableFieldPath}.headers[${index}]`
      : undefined;
    const highlightHeader = createSearchHighlighter(
      searchText,
      headerPath,
      activeMatchPath,
    );

    dataColumns.push({
      accessorKey: uniqueColumnId,
      id: uniqueColumnId,
      header: searchText ? () => highlightHeader(header) : header,
      size,
      minSize,
      maxSize,
      cell: ({ getValue, row }: CellContext<Record<string, string>, unknown>) => (
        <StructuredTableDataCell
          value={String(getValue() ?? "")}
          rowIndex={row.index}
          columnIndex={index}
          isFirstColumn={isFirstColumn}
          isSerialCol={isSerialCol}
          table={table}
          tableFieldPath={tableFieldPath}
          path={path}
          fieldPath={fieldPath}
          rootData={rootData}
          isEditing={isEditing}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          matchedPaths={matchedPaths}
          localCellValuesRef={localCellValuesRef}
          onValueChange={onValueChange}
          onSourceClick={onSourceClick}
        />
      ),
    });

    if (twoColumnLayout && !isSerialCol && index > 0 && isItemNameColumn(header)) {
      if (shouldShowStatus) {
        const statusCellPath = `${tableFieldPath}.rows[rowIndex].cells[${index}]`;
        dataColumns.push({
          id: `status_${index}`,
          header: "Status",
          size: 90,
          minSize: 80,
          maxSize: 120,
          cell: ({ row }: CellContext<Record<string, string>, unknown>) => (
            <StructuredTableStatusColumnCell
              rowIndex={row.index}
              cellFieldPath={statusCellPath}
              fieldStatus={fieldStatus}
              onFieldStatusChange={onFieldStatusChange}
              userRole={userRole}
              isEditing={isEditing}
            />
          ),
        });
      }

      if (shouldShowComments) {
        const commentsCellPath = `${tableFieldPath}.rows[rowIndex].cells[${index}]`;
        dataColumns.push({
          id: `comments_${index}`,
          header: "Comments",
          size: 90,
          minSize: 80,
          maxSize: 120,
          cell: ({ row }: CellContext<Record<string, string>, unknown>) => (
            <StructuredTableCommentsColumnCell
              rowIndex={row.index}
              cellFieldPathTemplate={commentsCellPath}
              getComments={getComments}
              onAddComment={onAddComment}
              userId={userId}
              userRole={userRole}
            />
          ),
        });
      }
    }
  });

  if (!twoColumnLayout) {
    if (shouldShowStatus) {
      dataColumns.push({
        id: "status",
        header: "Status",
        size: 90,
        minSize: 80,
        maxSize: 120,
        cell: ({ row }: CellContext<Record<string, string>, unknown>) => {
          const rowFieldPath = `${tableFieldPath}.rows[${row.index}]`;
          return (
            <div className="flex items-center justify-center py-2">
              <FieldStatusDropdown
                fieldPath={rowFieldPath}
                status={getFieldStatusValue(fieldStatus, rowFieldPath)}
                onStatusChange={onFieldStatusChange || (() => {})}
                userRole={userRole}
                isEditing={isEditing}
              />
            </div>
          );
        },
      });
    }

    if (shouldShowComments) {
      dataColumns.push({
        id: "comments",
        header: "Comments",
        size: 90,
        minSize: 80,
        maxSize: 120,
        cell: ({ row }: CellContext<Record<string, string>, unknown>) => {
          const rowFieldPath = `${tableFieldPath}.rows[${row.index}]`;
          return (
            <div className="flex items-center justify-center py-2">
              <FieldCommentButton
                fieldPath={rowFieldPath}
                comments={getComments ? getComments(rowFieldPath) : []}
                onAddComment={onAddComment}
                userId={userId}
                userRole={userRole}
              />
            </div>
          );
        },
      });
    }
  }

  return dataColumns;
}

interface StructuredTableFallbackRowsProps {
  table: StructuredTable;
  tableData: Record<string, string>[];
  tableFieldPath: string;
  tableExpanded: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  onToggleExpanded: () => void;
}

function StructuredTableFallbackRows({
  table,
  tableData,
  tableFieldPath,
  tableExpanded,
  searchText,
  activeMatchPath,
  onToggleExpanded,
}: Readonly<StructuredTableFallbackRowsProps>) {
  const visibleTableData = tableExpanded
    ? tableData
    : tableData.slice(0, INITIAL_ROW_LIMIT);

  return (
    <>
      {visibleTableData.map((rowData, rowIndex) => (
        <Tr
          key={`fallback-row-${rowIndex}`}
          className="dark:border-dark-600 dark:hover:bg-dark-700/50 border-b border-gray-200 hover:bg-gray-50"
          style={{ height: "auto", minHeight: "auto", display: "table-row" }}
        >
          {table.headers.map((header, colIndex) => {
            const cellKey = `col_${colIndex}`;
            const cellValue = rowData[cellKey] || "";
            const isFirstColumn = colIndex === 0;
            const cellFieldPath = tableFieldPath
              ? `${tableFieldPath}.rows[${rowIndex}].cells[${colIndex}]`
              : undefined;
            const highlightCell = createSearchHighlighter(
              searchText,
              cellFieldPath,
              activeMatchPath,
            );
            const cellContent =
              searchText && cellFieldPath
                ? highlightCell(String(cellValue))
                : cellValue;

            return (
              <Td
                key={`fallback-cell-${rowIndex}-${colIndex}`}
                className={clsx(
                  "px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300",
                  isFirstColumn && "text-center font-medium",
                )}
                style={{
                  verticalAlign: "middle",
                  lineHeight: "1.25",
                  height: "auto",
                  minHeight: "auto",
                  display: "table-cell",
                }}
                data-path={cellFieldPath}
              >
                {cellContent}
              </Td>
            );
          })}
        </Tr>
      ))}
      {tableData.length > INITIAL_ROW_LIMIT && (
        <Tr className="dark:border-dark-600 border-t border-gray-200">
          <Td
            colSpan={table.headers.length}
            className="border-t border-gray-200 px-2 py-1 text-center"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleExpanded();
              }}
              className="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline"
            >
              {tableExpanded
                ? `See less (show first ${INITIAL_ROW_LIMIT} rows)`
                : `See more (show all ${tableData.length} rows)`}
            </button>
          </Td>
        </Tr>
      )}
    </>
  );
}

interface StructuredTableAddRowButtonProps {
  table: StructuredTable;
  path: Array<string | number>;
  tableExpanded: boolean;
  isAddingRowRef: MutableRefObject<boolean>;
  newRowRef: MutableRefObject<HTMLTableRowElement | null>;
  onValueChange: (path: Array<string | number>, newValue: StructuredTable) => void;
  onExpandTable: () => void;
  columnCount: number;
}

function StructuredTableAddRowButton({
  table,
  path,
  tableExpanded,
  isAddingRowRef,
  newRowRef,
  onValueChange,
  onExpandTable,
  columnCount,
}: Readonly<StructuredTableAddRowButtonProps>) {
  const handleAddRow = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (event.nativeEvent) {
        event.nativeEvent.stopImmediatePropagation();
        event.nativeEvent.stopPropagation();
        event.nativeEvent.preventDefault();
      }

      if (isAddingRowRef.current) {
        return;
      }
      isAddingRowRef.current = true;

      try {
        const nextRowNumber = table.rows.length + 1;
        const newRow = {
          row_number: nextRowNumber,
          cells: new Array(table.headers.length).fill(""),
        };
        const updatedRows = [...table.rows, newRow];
        const updatedTable: StructuredTable = {
          ...table,
          rows: updatedRows,
          table_id: table.table_id,
          title: table.title,
          headers: table.headers,
          footnotes: table.footnotes,
          sources: table.sources,
        };

        if (updatedRows.length > INITIAL_ROW_LIMIT && !tableExpanded) {
          onExpandTable();
        }

        onValueChange(path, updatedTable);

        setTimeout(() => {
          newRowRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 150);
      } catch {
        isAddingRowRef.current = false;
      }
    },
    [
      isAddingRowRef,
      newRowRef,
      onExpandTable,
      onValueChange,
      path,
      table,
      tableExpanded,
    ],
  );

  const stopPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const stopMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  }, []);

  return (
    <Tr className="dark:border-dark-600 border-b border-gray-200" onClick={stopPropagation}>
      <Td colSpan={columnCount} className="px-2 py-1" onClick={stopPropagation}>
        <button
          type="button"
          onClick={handleAddRow}
          onMouseDown={stopMouseDown}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-green-300 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Row
        </button>
      </Td>
    </Tr>
  );
}

interface StructuredTableBodyContentProps {
  reactTable: ReactTable<Record<string, string>>;
  table: StructuredTable;
  tableData: Record<string, string>[];
  tableFieldPath: string;
  tableExpanded: boolean;
  isEditing: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  path: Array<string | number>;
  isAddingRowRef: MutableRefObject<boolean>;
  newRowRef: MutableRefObject<HTMLTableRowElement | null>;
  onValueChange?: (path: Array<string | number>, newValue: StructuredTable) => void;
  onToggleExpanded: () => void;
  onExpandTable: () => void;
}

function StructuredTableBodyContent({
  reactTable,
  table,
  tableData,
  tableFieldPath,
  tableExpanded,
  isEditing,
  searchText,
  activeMatchPath,
  path,
  isAddingRowRef,
  newRowRef,
  onValueChange,
  onToggleExpanded,
  onExpandTable,
}: Readonly<StructuredTableBodyContentProps>) {
  const allRows = reactTable.getRowModel().rows;
  const visibleRows = tableExpanded
    ? allRows
    : allRows.slice(0, INITIAL_ROW_LIMIT);
  const hasMoreRows = allRows.length > INITIAL_ROW_LIMIT;

  if (allRows.length === 0 && tableData.length > 0) {
    return (
      <StructuredTableFallbackRows
        table={table}
        tableData={tableData}
        tableFieldPath={tableFieldPath}
        tableExpanded={tableExpanded}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        onToggleExpanded={onToggleExpanded}
      />
    );
  }

  if (allRows.length === 0) {
    return (
      <Tr>
        <Td
          colSpan={reactTable.getAllColumns().length || 2}
          className="relative px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="space-y-2">
            <div>No data available</div>
            <div className="text-xs text-gray-400">
              tableData: {tableData.length}, rows: {table.rows?.length || 0},
              columns: {reactTable.getAllColumns().length}
            </div>
          </div>
        </Td>
      </Tr>
    );
  }

  return (
    <>
      {visibleRows.map((row: Row<Record<string, string>>, visibleIndex: number) => {
        const isLastVisibleRow = visibleIndex === visibleRows.length - 1;
        return (
          <Tr
            key={row.id}
            ref={isLastVisibleRow ? newRowRef : null}
            className="dark:border-dark-600 dark:hover:bg-dark-700/50 border-b border-gray-200 hover:bg-gray-50"
            style={{ height: "auto", minHeight: "auto", display: "table-row" }}
          >
            {row.getVisibleCells().map((cell, cellIndex) => {
              const isFirstColumn = cellIndex === 0;
              const cellFieldPath = tableFieldPath
                ? `${tableFieldPath}.rows[${row.index}].cells[${cellIndex}]`
                : undefined;
              return (
                <Td
                  key={cell.id}
                  className={clsx(
                    "relative px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300",
                    isFirstColumn && "text-center font-medium",
                  )}
                  style={{
                    width: cell.column.getSize(),
                    verticalAlign: "middle",
                    lineHeight: "1.25",
                    height: "auto",
                    minHeight: "auto",
                    display: "table-cell",
                  }}
                  data-component-name="StructuredTableRenderer-Cell"
                  data-path={cellFieldPath}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              );
            })}
          </Tr>
        );
      })}
      {hasMoreRows && (
        <Tr className="dark:border-dark-600 border-t border-gray-200">
          <Td
            colSpan={reactTable.getAllColumns().length}
            className="border-t border-gray-200 px-2 py-1 text-center"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleExpanded();
              }}
              className="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline"
            >
              {tableExpanded
                ? `See less (show first ${INITIAL_ROW_LIMIT} rows)`
                : `See more (show all ${allRows.length} rows)`}
            </button>
          </Td>
        </Tr>
      )}
      {isEditing && onValueChange && (
        <StructuredTableAddRowButton
          table={table}
          path={path}
          tableExpanded={tableExpanded}
          isAddingRowRef={isAddingRowRef}
          newRowRef={newRowRef}
          onValueChange={onValueChange}
          onExpandTable={onExpandTable}
          columnCount={reactTable.getAllColumns().length}
        />
      )}
    </>
  );
}

interface StructuredTableBodyProps {
  reactTable: ReactTable<Record<string, string>>;
  table: StructuredTable;
  tableData: Record<string, string>[];
  tableFieldPath: string;
  tableExpanded: boolean;
  setTableExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  path: Array<string | number>;
  isAddingRowRef: MutableRefObject<boolean>;
  newRowRef: MutableRefObject<HTMLTableRowElement | null>;
  onValueChange?: (path: Array<string | number>, newValue: StructuredTable) => void;
}

export function StructuredTableBody({
  reactTable,
  table,
  tableData,
  tableFieldPath,
  tableExpanded,
  setTableExpanded,
  isEditing,
  searchText,
  activeMatchPath,
  path,
  isAddingRowRef,
  newRowRef,
  onValueChange,
}: Readonly<StructuredTableBodyProps>) {
  const toggleExpanded = useCallback(() => {
    setTableExpanded((previous) => !previous);
  }, [setTableExpanded]);

  const expandTable = useCallback(() => {
    setTableExpanded(true);
  }, [setTableExpanded]);

  return (
    <TBody
      style={{
        height: "auto",
        minHeight: "auto",
        display: "table-row-group",
      }}
    >
      <StructuredTableBodyContent
        reactTable={reactTable}
        table={table}
        tableData={tableData}
        tableFieldPath={tableFieldPath}
        tableExpanded={tableExpanded}
        isEditing={isEditing}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        path={path}
        isAddingRowRef={isAddingRowRef}
        newRowRef={newRowRef}
        onValueChange={onValueChange}
        onToggleExpanded={toggleExpanded}
        onExpandTable={expandTable}
      />
    </TBody>
  );
}

export function useStructuredTableSearchEffects(options: {
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths: string[];
  tableFieldPath: string;
  tableRowCount: number;
  tableExpanded: boolean;
  hasAutoExpandedRef: MutableRefObject<string>;
  setIsTableCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setTableExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    searchText,
    activeMatchPath,
    matchedPaths,
    tableFieldPath,
    tableRowCount,
    tableExpanded,
    hasAutoExpandedRef,
    setIsTableCollapsed,
    setTableExpanded,
  } = options;

  React.useEffect(() => {
    if (!searchText || !tableFieldPath) {
      if (!searchText) {
        hasAutoExpandedRef.current = "";
      }
      return;
    }

    const searchKey = `${searchText}-${activeMatchPath || ""}-${matchedPaths.join(",")}`;
    if (hasAutoExpandedRef.current === searchKey) {
      return;
    }

    const pathsToCheck = getSearchPathsToCheck(activeMatchPath, matchedPaths);
    const hasMatch = pathsToCheck.some((matchPath) =>
      tablePathMatchesSearch(tableFieldPath, matchPath),
    );

    if (hasMatch) {
      setIsTableCollapsed(false);
      hasAutoExpandedRef.current = searchKey;
    }
  }, [
    searchText,
    activeMatchPath,
    matchedPaths,
    tableFieldPath,
    hasAutoExpandedRef,
    setIsTableCollapsed,
  ]);

  React.useEffect(() => {
    if (!searchText || !tableRowCount || !tableFieldPath || tableExpanded) {
      return;
    }

    const pathsToCheck = getSearchPathsToCheck(activeMatchPath, matchedPaths);
    const shouldExpand = pathsToCheck.some((matchPath) => {
      const rowIndex = getMatchedRowIndexBeyondLimit(tableFieldPath, matchPath);
      return rowIndex !== null && rowIndex >= INITIAL_ROW_LIMIT;
    });

    if (shouldExpand) {
      setTableExpanded(true);
    }
  }, [
    searchText,
    activeMatchPath,
    matchedPaths,
    tableFieldPath,
    tableRowCount,
    tableExpanded,
    setTableExpanded,
  ]);
}
