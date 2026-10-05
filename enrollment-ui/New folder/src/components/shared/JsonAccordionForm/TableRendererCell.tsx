import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { PlusIcon } from "@heroicons/react/20/solid";
import { toBracketPath } from "./utils";
import Field from "./Field";
import SeeMoreLess from "./SeeMoreLess";
import { StructuredTableRenderer } from "./StructuredTableRenderer";
import { createSearchHighlighter } from "./textHighlightHelpers";
import {
  buildCellFieldPath,
  detectCellSources,
  findSourceWithPage,
  formatCellValueForDisplay,
  formatListingItemFallbackDisplay,
  getListingItemComment,
  getListingItemDisplayText,
  hasSourceWithPage,
  isActualFormControl,
  isArrayOfStructuredTables,
  isFormInteractiveElement,
  isListingCellValue,
  resolveListingItemSources,
  type CellSource,
  type UserRole,
} from "./tableRendererHelpers";
import { markSourceClickTarget, buildPdfSourceTitle } from "./fieldHelpers";

// Re-exported from parent file scope - passed as prop
type AutoResizeTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
};

type AutoResizeTextareaComponent = React.ComponentType<AutoResizeTextareaProps>;

type LimitPeriodRendererComponent = React.ComponentType<{
  data: any;
  onSourceClick?: (source: CellSource) => void;
  cellSources?: CellSource[] | null;
  editable?: boolean;
  onChange?: (newData: any) => void;
  onValueChange?: (path: Array<string | number>, newVal: any) => void;
  cellPath?: Array<string | number>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  rootData?: any;
}>;

type ConditionsArrayRendererComponent = React.ComponentType<{
  data: any[];
  editable?: boolean;
  onChange?: (newData: any[]) => void;
  onValueChange?: (path: Array<string | number>, newVal: any) => void;
  cellPath?: Array<string | number>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  onSourceClick?: (source: CellSource) => void;
  rootData?: any;
  defaultCollapsed?: boolean;
}>;

const isLimitOrPeriodStructure = (obj: any): boolean => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return (
    ("limit_type" in obj ||
      "value" in obj ||
      "unit" in obj ||
      "text_description" in obj) &&
    !("cover_name" in obj)
  );
};

const isConditionsArray = (arr: any): boolean => {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      ("text" in item ||
        "type" in item ||
        "sources" in item ||
        "TEXT" in item ||
        "TYPE" in item ||
        "SOURCES" in item ||
        "condition_text" in item ||
        "CONDITION_TEXT" in item ||
        "applies_when" in item ||
        "exceptions" in item),
  );
};

function getCellTdStyle(
  col: string,
  columnWidths: Record<string, number>,
  minWidth = "150px",
) {
  return {
    width: columnWidths[col] ? `${columnWidths[col]}px` : "auto",
    minWidth: columnWidths[col] ? `${columnWidths[col]}px` : minWidth,
    lineHeight: "1.25" as const,
  };
}

function stopCellMouseDown(e: React.MouseEvent) {
  if (isFormInteractiveElement(e.target as HTMLElement)) {
    e.stopPropagation();
    return;
  }
  e.stopPropagation();
}

function handleCellSourceClick(
  e: React.MouseEvent,
  cellSources: CellSource[] | null,
  onSourceClick?: (source: CellSource) => void,
) {
  if (isActualFormControl(e.target as HTMLElement)) {
    e.stopPropagation();
    return;
  }
  e.stopPropagation();
  const sourceWithPage = findSourceWithPage(cellSources);
  if (sourceWithPage && onSourceClick) {
    markSourceClickTarget(e);
    onSourceClick(sourceWithPage);
  }
}

interface ListingArrayReadOnlyItemProps {
  item: any;
  itemIndex: number;
  cellValue: any[];
  cellFieldPath: string;
  rowFieldPath: string;
  row: any;
  col: string;
  path: Array<string | number>;
  rowIndex: number;
  data: any[];
  rootData?: any;
  actualDataWithoutChangeValue?: any;
  searchText?: string;
  activeMatchPath?: string | null;
  onSourceClick?: (source: CellSource) => void;
}

function ListingArrayReadOnlyItem({
  item,
  itemIndex,
  cellValue,
  cellFieldPath,
  rowFieldPath,
  row,
  col,
  path,
  rowIndex,
  data,
  rootData,
  actualDataWithoutChangeValue,
  searchText,
  activeMatchPath,
  onSourceClick,
}: ListingArrayReadOnlyItemProps) {
  const itemValue =
    typeof item === "object" &&
    item !== null &&
    !Array.isArray(item) &&
    item._value !== undefined
      ? item._value
      : item;
  const useTwoCols = cellValue.length > 9;
  const itemFieldPath = `${cellFieldPath}[${itemIndex}]`;
  const itemSources = resolveListingItemSources({
    item,
    itemIndex,
    cellFieldPath,
    rowFieldPath,
    rootData,
    row,
    actualDataWithoutChangeValue,
    path,
    rowIndex,
    col,
    data,
  });
  const itemSourceWithPage = findSourceWithPage(itemSources);
  const hasItemSourceWithPage = !!itemSourceWithPage;
  const displayText = getListingItemDisplayText(item, itemValue);
  const highlightText = createSearchHighlighter(
    searchText,
    itemFieldPath,
    activeMatchPath,
  );

  let content: React.ReactNode;
  if (displayText === null || displayText === undefined || displayText === "") {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      content = formatListingItemFallbackDisplay(item);
    } else {
      content = "—";
    }
  } else {
    content = highlightText(displayText);
  }

  return (
    <li
      key={`item-${itemIndex}`}
      className={`relative text-[10px] ${hasItemSourceWithPage ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400" : "text-gray-700 dark:text-gray-300"} ${useTwoCols ? "flex items-start gap-2" : ""}`}
      style={{ lineHeight: "1.25" }}
      data-path={itemFieldPath}
      data-component-name="TableRenderer-Cell-Item"
      onClick={(e) => {
        e.stopPropagation();
        if (hasItemSourceWithPage && itemSourceWithPage && onSourceClick) {
          markSourceClickTarget(e);
          onSourceClick(itemSourceWithPage);
        }
      }}
      onMouseDown={hasItemSourceWithPage ? markSourceClickTarget : undefined}
      data-source-button={hasItemSourceWithPage ? true : undefined}
      data-page-number={itemSourceWithPage?.page_number}
      title={
        hasItemSourceWithPage && itemSourceWithPage
          ? `Click to open page ${itemSourceWithPage.page_number} in PDF viewer`
          : undefined
      }
    >
      {useTwoCols && (
        <span className="mt-0.5 shrink-0 text-gray-700 dark:text-gray-300">
          •
        </span>
      )}
      <span className={useTwoCols ? "flex-1" : ""}>{content}</span>
    </li>
  );
}

interface ListingArrayEditableContentProps {
  cellValue: any[];
  cellPath: Array<string | number>;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  AutoResizeTextarea: AutoResizeTextareaComponent;
}

function ListingArrayEditableContent({
  cellValue,
  cellPath,
  onValueChange,
  AutoResizeTextarea,
}: ListingArrayEditableContentProps) {
  return (
    <div className="max-w-[400px] min-w-[200px] space-y-2">
      {Array.isArray(cellValue) &&
        cellValue.map((item: any, itemIndex: number) => (
          <div key={`item-${itemIndex}`} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
              <AutoResizeTextarea
                value={String(item)}
                onChange={(newValue: string) => {
                  const updated = [...cellValue];
                  if (typeof item === "number") {
                    const num = Number(newValue);
                    updated[itemIndex] = Number.isNaN(num) ? newValue : num;
                  } else if (typeof item === "boolean") {
                    updated[itemIndex] =
                      newValue === "true" || newValue === "True";
                  } else {
                    updated[itemIndex] = newValue;
                  }
                  onValueChange(cellPath, updated);
                }}
                disabled={false}
                className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:bg-white focus:ring-2 focus:outline-none dark:text-gray-100"
              />
            </div>
          </div>
        ))}
      <button
        type="button"
        onClick={() => {
          const updated = [...(cellValue || []), ""];
          onValueChange(cellPath, updated);
        }}
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 ml-5 flex items-center gap-1 text-xs"
      >
        <PlusIcon className="h-3 w-3" />
        Add Item
      </button>
    </div>
  );
}

interface ListingArrayReadOnlyContentProps {
  cellValue: any[];
  cellFieldPath: string;
  rowFieldPath: string;
  row: any;
  col: string;
  path: Array<string | number>;
  rowIndex: number;
  data: any[];
  rootData?: any;
  actualDataWithoutChangeValue?: any;
  searchText?: string;
  activeMatchPath?: string | null;
  onSourceClick?: (source: CellSource) => void;
  shouldEnableComments: boolean;
}

function ListingArrayReadOnlyContent({
  cellValue,
  cellFieldPath,
  rowFieldPath,
  row,
  col,
  path,
  rowIndex,
  data,
  rootData,
  actualDataWithoutChangeValue,
  searchText,
  activeMatchPath,
  onSourceClick,
  shouldEnableComments,
}: ListingArrayReadOnlyContentProps) {
  if (!Array.isArray(cellValue) || cellValue.length === 0) {
    return (
      <div
        className="py-0.5 text-[10px] text-gray-500 italic dark:text-gray-400"
        style={{ lineHeight: "1.25" }}
      >
        No items
      </div>
    );
  }

  const listClassName =
    cellValue.length > 9
      ? "grid grid-cols-2 gap-x-8 gap-y-1.5"
      : "list-disc space-y-1.5 pl-6";

  return (
    <>
      <ul className={listClassName}>
        {cellValue.map((item: any, itemIndex: number) => (
          <ListingArrayReadOnlyItem
            key={`item-${itemIndex}`}
            item={item}
            itemIndex={itemIndex}
            cellValue={cellValue}
            cellFieldPath={cellFieldPath}
            rowFieldPath={rowFieldPath}
            row={row}
            col={col}
            path={path}
            rowIndex={rowIndex}
            data={data}
            rootData={rootData}
            actualDataWithoutChangeValue={actualDataWithoutChangeValue}
            searchText={searchText}
            activeMatchPath={activeMatchPath}
            onSourceClick={onSourceClick}
          />
        ))}
      </ul>
      {shouldEnableComments &&
        cellValue.map((_item: any, itemIndex: number) => {
          const itemComment = getListingItemComment(row, col, itemIndex);
          if (!itemComment) return null;
          return (
            <div
              key={`comment-${itemIndex}`}
              className="ml-5 text-xs text-gray-600 italic dark:text-gray-400"
            >
              • {itemComment}
            </div>
          );
        })}
    </>
  );
}

interface ArrayCellContentProps {
  cellValue: any;
  cellPath: Array<string | number>;
  cellFieldPath: string;
  editable: boolean;
  isSerialNumber: boolean;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  AutoResizeTextarea: AutoResizeTextareaComponent;
}

function ArrayCellContent({
  cellValue,
  cellPath,
  cellFieldPath,
  editable,
  isSerialNumber,
  onValueChange,
  searchText,
  activeMatchPath,
  matchedPaths,
  AutoResizeTextarea,
}: ArrayCellContentProps) {
  if (editable && !isSerialNumber) {
    return (
      <AutoResizeTextarea
        value={JSON.stringify(cellValue, null, 2)}
        onChange={(newValue) => {
          try {
            const parsed = JSON.parse(newValue);
            onValueChange(cellPath, parsed);
          } catch {
            // Invalid JSON, ignore
          }
        }}
        className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 w-full max-w-[400px] min-w-[200px] rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs focus:ring-1 focus:outline-none dark:text-gray-100"
      />
    );
  }

  const formattedText = formatCellValueForDisplay(cellValue);
  return (
    <div className="relative w-[200px] max-w-[400px] min-w-[200px]" data-path={cellFieldPath}>
      <SeeMoreLess
        content={formattedText}
        maxLines={1}
        minCharForSeeMore={100}
        className=""
        textClassName="text-gray-700 dark:text-gray-300"
        buttonClassName=""
        highlightText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        currentPath={cellFieldPath}
      />
    </div>
  );
}

interface ObjectCellContentProps {
  cellValue: any;
  col: string;
  cellPath: Array<string | number>;
  cellFieldPath: string;
  cellSources: CellSource[] | null;
  editable: boolean;
  isSerialNumber: boolean;
  commentOnlyMode: boolean;
  actualDataWithoutChangeValue: any;
  userRole?: UserRole;
  rootData?: any;
  onRootDataChange?: (data: any) => void;
  onSourceClick?: (source: CellSource) => void;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  LimitPeriodRenderer: LimitPeriodRendererComponent;
}

function ObjectCellContent({
  cellValue,
  col,
  cellPath,
  cellFieldPath,
  cellSources,
  editable,
  isSerialNumber,
  commentOnlyMode,
  actualDataWithoutChangeValue,
  userRole,
  rootData,
  onRootDataChange,
  onSourceClick,
  onValueChange,
  searchText,
  activeMatchPath,
  matchedPaths,
  LimitPeriodRenderer,
}: ObjectCellContentProps) {
  if (isLimitOrPeriodStructure(cellValue)) {
    return (
      <div
        className="relative max-w-[500px] min-w-[300px] space-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        <LimitPeriodRenderer
          data={cellValue}
          onSourceClick={onSourceClick}
          cellSources={cellSources}
          editable={editable && !isSerialNumber}
          onValueChange={onValueChange}
          cellPath={cellPath}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          matchedPaths={matchedPaths}
          rootData={rootData}
        />
      </div>
    );
  }

  return (
    <div
      className="relative max-w-[400px] min-w-[200px] space-y-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Field
        label={col}
        value={cellValue}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        status={null}
        actualDataWithoutChangeValue={actualDataWithoutChangeValue}
        editable={editable && !isSerialNumber}
        onChange={(newVal) => onValueChange(cellPath, newVal)}
        commentOnlyMode={commentOnlyMode}
        shouldEnableComments={false}
        fieldPath={cellFieldPath}
        fieldStatus={null}
        onStatusChange={undefined}
        userRole={userRole || null}
        rootData={rootData}
        onRootDataChange={onRootDataChange}
        onSourceClick={onSourceClick}
      />
    </div>
  );
}

interface PrimitiveEditableCellProps {
  cellValue: any;
  cellPath: Array<string | number>;
  cellFieldPath: string;
  cellSources: CellSource[] | null;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  editable: boolean;
  onSourceClick?: (source: CellSource) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  AutoResizeTextarea: AutoResizeTextareaComponent;
}

function PrimitiveEditableCell({
  cellValue,
  cellPath,
  cellFieldPath,
  cellSources,
  onValueChange,
  editable,
  onSourceClick,
  searchText,
  activeMatchPath,
  AutoResizeTextarea,
}: PrimitiveEditableCellProps) {
  const [draftValue, setDraftValue] = useState(() => String(cellValue ?? ""));
  const isFocusedRef = useRef(false);
  const clickable = hasSourceWithPage(cellSources);
  const sourceWithPage = findSourceWithPage(cellSources);
  const highlightText = createSearchHighlighter(
    searchText,
    cellFieldPath,
    activeMatchPath,
  );

  useEffect(() => {
    if (isFocusedRef.current) return;
    setDraftValue(String(cellValue ?? ""));
  }, [cellValue]);

  const handleSourceNavigation = (e: React.MouseEvent) => {
    if (!clickable || !sourceWithPage || !onSourceClick) return;
    markSourceClickTarget(e);
    e.stopPropagation();
    onSourceClick(sourceWithPage);
  };

  if (clickable && !editable) {
    return (
      <div
        className={`relative block w-full min-w-0 rounded px-1 py-0.5 text-sm text-gray-900 dark:text-gray-100 ${clickable ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400" : ""}`}
        data-path={cellFieldPath}
        data-source-button
        data-page-number={sourceWithPage?.page_number}
        onClick={handleSourceNavigation}
        onMouseDown={markSourceClickTarget}
        title={buildPdfSourceTitle(sourceWithPage?.page_number)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSourceNavigation(e as unknown as React.MouseEvent);
          }
        }}
      >
        {highlightText(String(cellValue ?? ""))}
      </div>
    );
  }

  if (typeof cellValue === "boolean") {
    return (
      <select
        value={cellValue ? "true" : "false"}
        onChange={(e) => {
          onValueChange(cellPath, e.target.value === "true");
        }}
        className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-800 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:text-gray-100"
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  if (typeof cellValue === "number") {
    return (
      <input
        type="number"
        value={cellValue}
        onChange={(e) => {
          const val = e.target.value === "" ? 0 : Number(e.target.value);
          onValueChange(cellPath, val);
        }}
        className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-800 w-32 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:text-gray-100"
      />
    );
  }

  return (
    <div
      className="relative block w-full min-w-0"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      data-path={cellFieldPath}
    >
      <AutoResizeTextarea
        value={draftValue}
        onChange={(newVal: string) => {
          setDraftValue(newVal);
          onValueChange(cellPath, newVal);
        }}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        disabled={!editable}
        className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 w-full min-w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm transition-all focus:bg-white focus:ring-2 focus:outline-none dark:text-gray-100"
      />
    </div>
  );
}

interface PrimitiveReadOnlyCellProps {
  cellValue: any;
  cellFieldPath: string;
  cellSources: CellSource[] | null;
  row: any;
  col: string;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  onSourceClick?: (source: CellSource) => void;
  shouldEnableComments: boolean;
}

function PrimitiveReadOnlyCell({
  cellValue,
  cellFieldPath,
  cellSources,
  row,
  col,
  searchText,
  activeMatchPath,
  matchedPaths,
  onSourceClick,
  shouldEnableComments,
}: PrimitiveReadOnlyCellProps) {
  const clickable = hasSourceWithPage(cellSources);
  const sourceWithPage = findSourceWithPage(cellSources);

  return (
    <div
      className={`relative py-1.5 ${clickable ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400" : ""}`}
      data-path={cellFieldPath}
      data-source-button={clickable ? true : undefined}
      data-page-number={sourceWithPage?.page_number}
      onClick={(e) => {
        e.stopPropagation();
        if (sourceWithPage && onSourceClick) {
          markSourceClickTarget(e);
          onSourceClick(sourceWithPage);
        }
      }}
      onMouseDown={clickable ? markSourceClickTarget : undefined}
      title={
        clickable && sourceWithPage
          ? `Click to open page ${sourceWithPage.page_number} in PDF viewer`
          : undefined
      }
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (sourceWithPage && onSourceClick) {
            markSourceClickTarget(e);
            onSourceClick(sourceWithPage);
          }
        }}
        className={clickable ? "cursor-pointer" : ""}
      >
        <SeeMoreLess
          content={String(cellValue || "")}
          maxLines={1}
          minCharForSeeMore={100}
          textClassName={`text-gray-900 dark:text-gray-100 ${clickable ? "hover:text-blue-600 dark:hover:text-blue-400 transition-colors" : ""}`}
          highlightText={searchText}
          activeMatchPath={activeMatchPath}
          matchedPaths={matchedPaths}
          currentPath={cellFieldPath}
        />
      </div>
      {shouldEnableComments && row?._comments?.[col] && (
        <div className="mt-1 text-[10px] text-gray-600 italic dark:text-gray-400">
          Comment: {row._comments[col]}
        </div>
      )}
    </div>
  );
}

function renderCellInnerContent(props: {
  cellValue: any;
  col: string;
  cellPath: Array<string | number>;
  cellFieldPath: string;
  cellSources: CellSource[] | null;
  row: any;
  data: any[];
  rowIndex: number;
  editable: boolean;
  isSerialNumber: boolean;
  isListing: boolean;
  isArray: boolean;
  isObject: boolean;
  isNull: boolean;
  commentOnlyMode: boolean;
  shouldEnableComments: boolean;
  actualDataWithoutChangeValue: any;
  userRole?: UserRole;
  rootData?: any;
  onRootDataChange?: (data: any) => void;
  onSourceClick?: (source: CellSource) => void;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  AutoResizeTextarea: AutoResizeTextareaComponent;
  LimitPeriodRenderer: LimitPeriodRendererComponent;
}): React.ReactNode {
  const {
    cellValue,
    col,
    cellPath,
    cellFieldPath,
    cellSources,
    row,
    data,
    rowIndex,
    editable,
    isSerialNumber,
    isListing,
    isArray,
    isObject,
    isNull,
    commentOnlyMode,
    shouldEnableComments,
    actualDataWithoutChangeValue,
    userRole,
    rootData,
    onRootDataChange,
    onSourceClick,
    onValueChange,
    searchText,
    activeMatchPath,
    matchedPaths,
    AutoResizeTextarea,
    LimitPeriodRenderer,
  } = props;

  if (isListing) {
    if (editable && !isSerialNumber) {
      return (
        <ListingArrayEditableContent
          cellValue={cellValue}
          cellPath={cellPath}
          onValueChange={onValueChange}
          AutoResizeTextarea={AutoResizeTextarea}
        />
      );
    }
    return (
      <div className="max-w-[400px] min-w-[200px] space-y-2">
        <ListingArrayReadOnlyContent
          cellValue={cellValue}
          cellFieldPath={cellFieldPath}
          rowFieldPath={buildCellFieldPath(cellPath.slice(0, -1))}
          row={row}
          col={col}
          path={cellPath.slice(0, -2)}
          rowIndex={rowIndex}
          data={data}
          rootData={rootData}
          actualDataWithoutChangeValue={actualDataWithoutChangeValue}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          onSourceClick={onSourceClick}
          shouldEnableComments={shouldEnableComments}
        />
      </div>
    );
  }

  if (isArray) {
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <ArrayCellContent
          cellValue={cellValue}
          cellPath={cellPath}
          cellFieldPath={cellFieldPath}
          editable={editable}
          isSerialNumber={isSerialNumber}
          onValueChange={onValueChange}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          matchedPaths={matchedPaths}
          AutoResizeTextarea={AutoResizeTextarea}
        />
      </div>
    );
  }

  if (isObject) {
    return (
      <ObjectCellContent
        cellValue={cellValue}
        col={col}
        cellPath={cellPath}
        cellFieldPath={cellFieldPath}
        cellSources={cellSources}
        editable={editable}
        isSerialNumber={isSerialNumber}
        commentOnlyMode={commentOnlyMode}
        actualDataWithoutChangeValue={actualDataWithoutChangeValue}
        userRole={userRole}
        rootData={rootData}
        onRootDataChange={onRootDataChange}
        onSourceClick={onSourceClick}
        onValueChange={onValueChange}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        LimitPeriodRenderer={LimitPeriodRenderer}
      />
    );
  }

  if (isNull) {
    return (
      <div
        className="min-h-[24px] py-0.5 text-[10px] text-gray-400 italic dark:text-gray-500"
        style={{ lineHeight: "1.25" }}
      >
        —
      </div>
    );
  }

  if (editable && !isSerialNumber) {
    return (
      <div className="space-y-2">
        <PrimitiveEditableCell
          cellValue={cellValue}
          cellPath={cellPath}
          cellFieldPath={cellFieldPath}
          cellSources={cellSources}
          onValueChange={onValueChange}
          editable={editable}
          onSourceClick={onSourceClick}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          AutoResizeTextarea={AutoResizeTextarea}
        />
      </div>
    );
  }

  return (
    <PrimitiveReadOnlyCell
      cellValue={cellValue}
      cellFieldPath={cellFieldPath}
      cellSources={cellSources}
      row={row}
      col={col}
      searchText={searchText}
      activeMatchPath={activeMatchPath}
      matchedPaths={matchedPaths}
      onSourceClick={onSourceClick}
      shouldEnableComments={shouldEnableComments}
    />
  );
}

export interface TableRendererCellProps {
  col: string;
  row: any;
  rowIndex: number;
  path: Array<string | number>;
  data: any[];
  columnWidths: Record<string, number>;
  serialNumber: number;
  editable: boolean;
  isRowNewlyAdded: (rowIndex: number) => boolean;
  isSerialNumberColumn: (columnName: string) => boolean;
  commentOnlyMode: boolean;
  shouldEnableComments: boolean;
  actualDataWithoutChangeValue: any;
  userRole?: UserRole;
  rootData?: any;
  onRootDataChange?: (data: any) => void;
  onSourceClick?: (source: CellSource) => void;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  isEditing: boolean;
  shouldEnableStatus: boolean;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  getComments?: (fieldPath: string) => Array<any>;
  onAddComment: (fieldPath: string, comment: string, userId: string) => void;
  userId: string;
  AutoResizeTextarea: AutoResizeTextareaComponent;
  LimitPeriodRenderer: LimitPeriodRendererComponent;
  ConditionsArrayRenderer: ConditionsArrayRendererComponent;
}

export function TableRendererCell({
  col,
  row,
  rowIndex,
  path,
  data,
  columnWidths,
  serialNumber,
  editable,
  isRowNewlyAdded,
  isSerialNumberColumn,
  commentOnlyMode,
  shouldEnableComments,
  actualDataWithoutChangeValue,
  userRole,
  rootData,
  onRootDataChange,
  onSourceClick,
  onValueChange,
  searchText,
  activeMatchPath,
  matchedPaths,
  isEditing,
  shouldEnableStatus,
  fieldStatus,
  onFieldStatusChange,
  getComments,
  onAddComment,
  userId,
  AutoResizeTextarea,
  LimitPeriodRenderer,
  ConditionsArrayRenderer,
}: TableRendererCellProps) {
  const cellPath = [...path, rowIndex, col];
  const cellValue = row?.[col];
  const cellFieldPath = buildCellFieldPath(cellPath);
  const isSerialNumber = isSerialNumberColumn(col);
  const cellSources = detectCellSources({
    cellFieldPath,
    col,
    cellValue,
    row,
    rowIndex,
    rootData,
    actualDataWithoutChangeValue,
    path,
    data,
  });

  if (isSerialNumber) {
    return (
      <td
        key={col}
        data-table-cell="true"
        style={{
          ...getCellTdStyle(col, columnWidths, "80px"),
        }}
        className="px-2 py-0.5 text-center text-[10px] font-medium text-gray-700 dark:text-gray-300"
      >
        {serialNumber}
      </td>
    );
  }

  const isArray = Array.isArray(cellValue);
  const structuredTables = isArrayOfStructuredTables(cellValue);
  const isConditionsColumn = String(col).toLowerCase() === "conditions";
  const isArrayOfObjects =
    isArray &&
    cellValue.length > 0 &&
    cellValue.every(
      (x: any) =>
        typeof x === "object" && x !== null && !Array.isArray(x),
    );
  const isConditions =
    isArray &&
    (isConditionsArray(cellValue) ||
      (isConditionsColumn && isArrayOfObjects));

  if (isConditions) {
    return (
      <td
        key={col}
        data-table-cell="true"
        style={{
          ...getCellTdStyle(col, columnWidths, "400px"),
          verticalAlign: "top",
          padding: "0.5rem",
        }}
        className={clsx(
          "dark:border-dark-500 border-b border-gray-200",
          isRowNewlyAdded(rowIndex) && "bg-green-50 dark:bg-green-900/20",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ConditionsArrayRenderer
          data={cellValue}
          editable={editable}
          onValueChange={onValueChange}
          cellPath={cellPath}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          matchedPaths={matchedPaths}
          onSourceClick={onSourceClick}
          rootData={rootData}
          defaultCollapsed={false}
        />
      </td>
    );
  }

  if (structuredTables) {
    return (
      <td
        key={col}
        data-table-cell="true"
        colSpan={1}
        style={{
          ...getCellTdStyle(col, columnWidths, "400px"),
          verticalAlign: "top",
          padding: "0.5rem",
        }}
        className={clsx(
          "dark:border-dark-500 border-b border-gray-200",
          isRowNewlyAdded(rowIndex) && "bg-green-50 dark:bg-green-900/20",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {(cellValue as any[]).map((table: any, tableIndex: number) => {
            const tablePath = [...cellPath, tableIndex];
            const tableFieldPath = toBracketPath(tablePath);
            return (
              <div key={tableIndex} className="space-y-2">
                <StructuredTableRenderer
                  table={table}
                  onSourceClick={onSourceClick}
                  path={tablePath}
                  searchText={searchText}
                  activeMatchPath={activeMatchPath}
                  matchedPaths={matchedPaths}
                  isEditing={isEditing}
                  onValueChange={(_p, newValue) => {
                    const updatedTables = [...(cellValue as any[])];
                    updatedTables[tableIndex] = newValue;
                    onValueChange(cellPath, updatedTables);
                  }}
                  shouldEnableStatus={shouldEnableStatus}
                  shouldEnableComments={shouldEnableComments}
                  fieldPath={tableFieldPath}
                  fieldStatus={fieldStatus}
                  onFieldStatusChange={onFieldStatusChange}
                  getComments={getComments}
                  onAddComment={onAddComment}
                  userId={userId}
                  userRole={userRole}
                  rootData={rootData}
                />
              </div>
            );
          })}
        </div>
      </td>
    );
  }

  const isListing = isListingCellValue(
    cellValue,
    isArray,
    structuredTables,
    data,
    rowIndex,
    col,
    editable,
  );
  const isObject =
    typeof cellValue === "object" && cellValue !== null && !isArray;
  const isNull = cellValue === null || cellValue === undefined;
  const clickable = hasSourceWithPage(cellSources);
  const sourceWithPage = findSourceWithPage(cellSources);

  return (
    <td
      key={col}
      data-table-cell="true"
      style={getCellTdStyle(col, columnWidths)}
      className={`relative px-2 py-0.5 align-top ${clickable ? "cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20" : ""}`}
      onClick={(e) => handleCellSourceClick(e, cellSources, onSourceClick)}
      onMouseDown={stopCellMouseDown}
      data-source-button={clickable ? true : undefined}
      data-page-number={sourceWithPage?.page_number}
      title={
        clickable && sourceWithPage
          ? `Click to view PDF page ${sourceWithPage.page_number || ""}`
          : undefined
      }
    >
      {renderCellInnerContent({
        cellValue,
        col,
        cellPath,
        cellFieldPath,
        cellSources,
        row,
        data,
        rowIndex,
        editable,
        isSerialNumber,
        isListing,
        isArray,
        isObject,
        isNull,
        commentOnlyMode,
        shouldEnableComments,
        actualDataWithoutChangeValue,
        userRole,
        rootData,
        onRootDataChange,
        onSourceClick,
        onValueChange,
        searchText,
        activeMatchPath,
        matchedPaths,
        AutoResizeTextarea,
        LimitPeriodRenderer,
      })}
    </td>
  );
}
