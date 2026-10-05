import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@heroicons/react/20/solid";
import { detectDataType } from "./utils";
import { AutoResizeTextarea } from "./Field";
import { useState, useEffect, useRef, useCallback } from "react";
import FieldCommentButton from "./FieldCommentButton";
import FieldStatusDropdown from "./FieldStatusDropdown";
import { StatusValue } from "@/hooks/useStatus";
import type { JsonAccordionUserRole } from "./types";
import { markSourceClickTarget, buildPdfSourceTitle } from "./fieldHelpers";
import {
  toDisplayText,
  highlightSearchText,
  formatObjectValueForDisplay,
  scheduleTextWrapMeasurement,
  createTextWrapResizeObserver,
  type SourceItem,
} from "./BulletedList.helpers";

const MIN_CHAR_FOR_SEE_MORE = 40;

const inputClassName =
  "focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:ring-1 focus:outline-none dark:text-gray-100";

const sourceClickClassName =
  "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400";

function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
  e.currentTarget.nextElementSibling?.classList.remove("hidden");
}

function handleSourceNavigation(
  e: React.MouseEvent,
  hasClickableSource: boolean,
  sourceWithPage: SourceItem | null,
  onSourceClick?: (source: SourceItem) => void,
): void {
  if (!hasClickableSource || !sourceWithPage || !onSourceClick) {
    return;
  }
  markSourceClickTarget(e);
  onSourceClick(sourceWithPage);
}

interface SourceNavigableListValueProps {
  hasClickableSource: boolean;
  sourceWithPage: SourceItem | null;
  onSourceClick?: (source: SourceItem) => void;
  displayText: string;
  isEditing: boolean;
  highlightContent: React.ReactNode;
  children: React.ReactNode;
}

function SourceNavigableListValue({
  hasClickableSource,
  sourceWithPage,
  onSourceClick,
  displayText,
  isEditing,
  highlightContent,
  children,
}: SourceNavigableListValueProps) {
  if (hasClickableSource && !isEditing) {
    return (
      <div
        className={`min-w-0 flex-1 break-words whitespace-pre-wrap rounded px-0.5 py-0.5 text-sm text-gray-700 dark:text-gray-300 ${sourceClickClassName}`}
        onClick={(e) =>
          handleSourceNavigation(e, hasClickableSource, sourceWithPage, onSourceClick)
        }
        title={buildPdfSourceTitle(sourceWithPage?.page_number)}
        data-source-button
        data-page-number={sourceWithPage?.page_number}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSourceNavigation(
              e as unknown as React.MouseEvent,
              hasClickableSource,
              sourceWithPage,
              onSourceClick,
            );
          }
        }}
      >
        {highlightContent || displayText}
      </div>
    );
  }

  return <>{children}</>;
}

interface EditableItemValueProps {
  itemValue: unknown;
  index: number;
  dataType: ReturnType<typeof detectDataType>;
  onItemChange: (index: number, value: unknown) => void;
  hasClickableSource: boolean;
  sourceWithPage: SourceItem | null;
  onSourceClick?: (source: SourceItem) => void;
  itemValueStr: string;
  searchText?: string;
  activeMatchPath?: string | null;
  itemFieldPath: string;
}

function EditableItemValue({
  itemValue,
  index,
  dataType,
  onItemChange,
  hasClickableSource,
  sourceWithPage,
  onSourceClick,
  itemValueStr,
  searchText,
  activeMatchPath,
  itemFieldPath,
}: EditableItemValueProps) {
  const highlightContent = searchText
    ? highlightSearchText(itemValueStr, searchText, activeMatchPath, itemFieldPath)
    : itemValueStr;

  const editor = (() => {
    if (dataType.type === "image") {
      return (
        <div className="space-y-2">
          <img
            src={String(itemValue)}
            alt={`Item ${index + 1}`}
            className="max-h-32 max-w-xs rounded object-contain"
            onError={handleImageError}
          />
          <input
            type="text"
            value={String(itemValue)}
            onChange={(e) => onItemChange(index, e.target.value)}
            className={inputClassName}
            placeholder="Enter value..."
          />
        </div>
      );
    }

    if (typeof itemValue === "object" && itemValue !== null) {
      return (
        <AutoResizeTextarea
          value={JSON.stringify(itemValue, null, 2)}
          onChange={(newValue) => {
            try {
              const parsed = JSON.parse(newValue);
              onItemChange(index, parsed);
            } catch {
              // Invalid JSON, ignore
            }
          }}
          className={`${inputClassName} font-mono`}
        />
      );
    }

    return (
      <input
        type="text"
        value={String(itemValue)}
        onChange={(e) => onItemChange(index, e.target.value)}
        className={inputClassName}
        placeholder="Enter value..."
      />
    );
  })();

  return (
    <SourceNavigableListValue
      hasClickableSource={hasClickableSource}
      sourceWithPage={sourceWithPage}
      onSourceClick={onSourceClick}
      displayText={itemValueStr}
      isEditing={true}
      highlightContent={highlightContent}
    >
      {editor}
    </SourceNavigableListValue>
  );
}

interface ReadOnlyItemValueProps {
  itemValue: unknown;
  index: number;
  fieldKey: string;
  dataType: ReturnType<typeof detectDataType>;
  itemValueStr: string;
  isStringValue: boolean;
  expanded: boolean;
  shouldShowSeeMore: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  hasClickableSource: boolean;
  onSourceClick?: (source: SourceItem) => void;
  sourceWithPage: SourceItem | null;
  textRef: React.RefObject<HTMLSpanElement | null>;
  measureRef: React.RefObject<HTMLDivElement | null>;
  onToggleExpanded: () => void;
}

function ReadOnlyItemValue({
  itemValue,
  index,
  fieldKey,
  dataType,
  itemValueStr,
  isStringValue,
  expanded,
  shouldShowSeeMore,
  searchText,
  activeMatchPath,
  hasClickableSource,
  onSourceClick,
  sourceWithPage,
  textRef,
  measureRef,
  onToggleExpanded,
}: ReadOnlyItemValueProps) {
  const itemFieldPath = `${fieldKey}[${index}]`;

  const getSourceTitle = (): string | undefined => {
    if (hasClickableSource && sourceWithPage) {
      return `Click to open page ${sourceWithPage.page_number} in PDF viewer`;
    }
    return undefined;
  };

  const getTextSpanClassName = (): string => {
    const classes = ["min-w-0 flex-1 break-words whitespace-pre-wrap"];
    if (!expanded && shouldShowSeeMore) {
      classes.push("line-clamp-1");
    }
    if (hasClickableSource && onSourceClick) {
      classes.push(sourceClickClassName);
    }
    return classes.join(" ");
  };

  const renderClickableWrapper = (content: React.ReactNode) => (
    <span
      ref={isStringValue ? textRef : undefined}
      data-path={itemFieldPath}
      className={getTextSpanClassName()}
      onClick={(e) =>
        handleSourceNavigation(e, hasClickableSource, sourceWithPage, onSourceClick)
      }
      onMouseDown={hasClickableSource ? markSourceClickTarget : undefined}
      title={getSourceTitle()}
      data-source-button={hasClickableSource ? true : undefined}
      data-page-number={sourceWithPage?.page_number}
      role={hasClickableSource ? "button" : undefined}
      tabIndex={hasClickableSource ? 0 : undefined}
      onKeyDown={
        hasClickableSource
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSourceNavigation(
                  e as unknown as React.MouseEvent,
                  hasClickableSource,
                  sourceWithPage,
                  onSourceClick,
                );
              }
            }
          : undefined
      }
    >
      {content}
    </span>
  );

  const renderValueContent = () => {
    if (dataType.type === "image") {
      return (
        <img
          src={String(itemValue)}
          alt={`Item ${index + 1}`}
          className="max-h-32 max-w-xs rounded object-contain"
          onError={handleImageError}
        />
      );
    }

    if (typeof itemValue === "object" && itemValue !== null) {
      const objectText = formatObjectValueForDisplay(itemValue);
      return renderClickableWrapper(
        searchText
          ? highlightSearchText(objectText, searchText, activeMatchPath, itemFieldPath)
          : objectText,
      );
    }

    return renderClickableWrapper(
      searchText
        ? highlightSearchText(itemValueStr, searchText, activeMatchPath, itemFieldPath)
        : itemValueStr,
    );
  };

  return (
    <div
      className={`flex-1 space-y-1 ${hasClickableSource ? sourceClickClassName : ""}`}
      onClick={(e) =>
        handleSourceNavigation(e, hasClickableSource, sourceWithPage, onSourceClick)
      }
      onMouseDown={hasClickableSource ? markSourceClickTarget : undefined}
      data-source-button={hasClickableSource ? true : undefined}
      data-page-number={sourceWithPage?.page_number}
    >
      {isStringValue && (
        <div
          ref={measureRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            top: "-9999px",
            left: "-9999px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "0.875rem",
          }}
        />
      )}

      <div className="flex flex-wrap items-start gap-2">
        {renderValueContent()}

        {isStringValue && shouldShowSeeMore && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded();
            }}
            className="text-primary-600 dark:text-primary-400 flex-shrink-0 text-xs font-medium whitespace-nowrap hover:underline"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </div>
  );
}

export interface BulletedListItemProps {
  itemValue: unknown;
  index: number;
  fieldKey: string;
  isEditing: boolean;
  isNew: boolean;
  useTwoColumns: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  hasClickableSource: boolean;
  sourceWithPage: SourceItem | null;
  onItemChange: (index: number, value: unknown) => void;
  onItemRemove: (index: number) => void;
  onSourceClick?: (source: SourceItem) => void;
  shouldEnableComments: boolean;
  shouldEnableStatus: boolean;
  getComments?: (fieldPath: string) => Array<unknown>;
  onAddComment?: (fieldPath: string, comment: string) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  userId: string;
  userRole?: JsonAccordionUserRole | null;
  fieldStatus: Record<string, StatusValue>;
  onStatusChange?: (fieldPath: string, status: StatusValue) => void;
}

export function BulletedListItem({
  itemValue,
  index,
  fieldKey,
  isEditing,
  isNew,
  useTwoColumns,
  searchText,
  activeMatchPath,
  hasClickableSource,
  sourceWithPage,
  onItemChange,
  onItemRemove,
  onSourceClick,
  shouldEnableComments,
  shouldEnableStatus,
  getComments,
  onAddComment,
  onDeleteComment,
  userId,
  userRole,
  fieldStatus,
  onStatusChange,
}: BulletedListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [shouldShowSeeMore, setShouldShowSeeMore] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const dataType = detectDataType(itemValue);
  const itemValueStr = toDisplayText(itemValue);
  const isStringValue = typeof itemValue === "string" && !isEditing;
  const itemFieldPath = `${fieldKey}[${index}]`;
  const isActive = Boolean(activeMatchPath && itemFieldPath === activeMatchPath);
  const containsSearch = Boolean(
    searchText &&
      itemValueStr.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleWrapChange = useCallback((wraps: boolean) => {
    setShouldShowSeeMore(wraps);
  }, []);

  const handleToggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleRemoveClick = useCallback(() => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      onItemRemove(index);
    }
  }, [index, onItemRemove]);

  useEffect(() => {
    if (isActive && !expanded && containsSearch) {
      setExpanded(true);
    }
  }, [isActive, expanded, containsSearch]);

  useEffect(() => {
    if (!isEditing && isStringValue && textRef.current && measureRef.current) {
      const textElement = textRef.current;
      const measureElement = measureRef.current;
      const text = itemValueStr;

      if (text.length <= MIN_CHAR_FOR_SEE_MORE) {
        setShouldShowSeeMore(false);
        return;
      }

      scheduleTextWrapMeasurement(
        textElement,
        measureElement,
        text,
        handleWrapChange,
      );

      if (
        typeof ResizeObserver !== "undefined" &&
        textRef.current?.parentElement
      ) {
        return createTextWrapResizeObserver(
          textElement,
          measureElement,
          text,
          textRef.current.parentElement,
          handleWrapChange,
        );
      }
    }

    setShouldShowSeeMore(false);
  }, [isEditing, isStringValue, itemValueStr, handleWrapChange]);

  return (
    <li
      data-path={itemFieldPath}
      className={`relative ${useTwoColumns ? "flex items-start gap-2" : "mb-3 space-y-2"} ${
        hasClickableSource ? sourceClickClassName : ""
      }`}
      data-source-button={hasClickableSource ? true : undefined}
      data-page-number={sourceWithPage?.page_number}
    >
      <div className="absolute -top-2 left-0 z-50">
        <span className="pointer-events-none rounded bg-blue-100 px-1 py-0.5 font-mono text-[7px] font-semibold whitespace-nowrap text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          BulletedList.Item
        </span>
      </div>

      {useTwoColumns && (
        <span className="mt-0.5 shrink-0 text-gray-700 dark:text-gray-300">
          •
        </span>
      )}

      <div className={useTwoColumns ? "flex-1" : "w-full"}>
        <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
          {isEditing ? (
            <EditableItemValue
              itemValue={itemValue}
              index={index}
              dataType={dataType}
              onItemChange={onItemChange}
              hasClickableSource={hasClickableSource}
              sourceWithPage={sourceWithPage}
              onSourceClick={onSourceClick}
              itemValueStr={itemValueStr}
              searchText={searchText}
              activeMatchPath={activeMatchPath}
              itemFieldPath={itemFieldPath}
            />
          ) : (
            <ReadOnlyItemValue
              itemValue={itemValue}
              index={index}
              fieldKey={fieldKey}
              dataType={dataType}
              itemValueStr={itemValueStr}
              isStringValue={isStringValue}
              expanded={expanded}
              shouldShowSeeMore={shouldShowSeeMore}
              searchText={searchText}
              activeMatchPath={activeMatchPath}
              hasClickableSource={hasClickableSource}
              onSourceClick={onSourceClick}
              sourceWithPage={sourceWithPage}
              textRef={textRef}
              measureRef={measureRef}
              onToggleExpanded={handleToggleExpanded}
            />
          )}

          <div className="flex shrink-0 items-center gap-2">
            {isEditing && isNew && (
              <Button
                type="button"
                onClick={handleRemoveClick}
                variant="flat"
                className="h-6 w-6 shrink-0 rounded border border-red-300 bg-red-50 p-0 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                title="Remove Item"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {(shouldEnableComments || shouldEnableStatus) && (
          <div className="mt-2 flex items-center gap-2">
            {shouldEnableComments &&
              getComments &&
              onAddComment &&
              onDeleteComment && (
                <FieldCommentButton
                  fieldPath={itemFieldPath}
                  comments={getComments(itemFieldPath) || []}
                  onAddComment={onAddComment}
                  userId={userId}
                  userRole={userRole}
                />
              )}
            {shouldEnableStatus && onStatusChange && (
              <FieldStatusDropdown
                fieldPath={itemFieldPath}
                status={fieldStatus[itemFieldPath] || null}
                onStatusChange={onStatusChange}
                userRole={userRole}
                isEditing={isEditing}
              />
            )}
          </div>
        )}
      </div>
    </li>
  );
}
