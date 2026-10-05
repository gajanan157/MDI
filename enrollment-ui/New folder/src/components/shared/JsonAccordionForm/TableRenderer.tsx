// Search working
// src/components/shared/JsonAccordionForm/TableRenderer.tsx
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/Button";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useForm, type UseFormSetValue } from "react-hook-form";
import {
  formatKey,
  highlightText as highlightKeyText,
  toBracketPath,
} from "./utils";
import FieldCommentButton from "./FieldCommentButton";
import FieldStatusDropdown from "./FieldStatusDropdown";
import { Comment } from "@/hooks/useComments";
import {
  StructuredTableRenderer,
} from "./StructuredTableRenderer";
import { isStructuredTable } from "./structuredTableHelpers";
import CollapsibleSection from "./CollapsibleSection";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";
import { createSearchHighlighter } from "./textHighlightHelpers";
import { markSourceClickTarget, handleConditionSourceClick, buildPdfSourceTitle } from "./fieldHelpers";
import {
  getBooleanBadgeClassName,
  lookupConditionSources,
  type FieldType,
  buildCellFieldPath,
  createRowFromFieldTypes,
  getDefaultColumnValue,
  inferFieldTypesFromColumns,
  shouldExpandTableForSearch,
  sortTableColumns,
  collectTableColumns,
  isSerialNumberColumn,
  getDefaultColumnWidths,
  isTableColumnNewlyAdded,
  isTableRowNewlyAdded,
  findSourceWithPage,
  hasSourceWithPage,
  resolveFirstAvailableSources,
  resolveRowSources,
} from "./tableRendererHelpers";
import { TableRendererCell } from "./TableRendererCell";

// Helper function to check if an array contains condition objects
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

// Helper function to format key names: replace underscores with spaces
const formatKeyName = (key: string): string => {
  return key.replace(/_/g, " ");
};

// Helper function to format values: replace underscores with spaces
const formatValue = (value: string | number | boolean): string => {
  if (typeof value === "string") {
    return value.replace(/_/g, " ");
  }
  return String(value);
};

function useConditionTextTruncation(
  conditionText: string,
  editable: boolean,
) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [shouldShowSeeMore, setShouldShowSeeMore] = useState(false);

  useEffect(() => {
    if (editable || !conditionText) {
      setShouldShowSeeMore(false);
      return;
    }

    const textElement = textRef.current;
    const measureElement = measureRef.current;
    if (!textElement || !measureElement) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const textRect = textElement.getBoundingClientRect();
        const availableWidth =
          textRect.width || textElement.offsetWidth || textElement.clientWidth;
        if (!availableWidth || availableWidth < 50) return;

        const computedStyle = window.getComputedStyle(textElement);
        measureElement.style.width = `${availableWidth}px`;
        measureElement.style.fontSize = computedStyle.fontSize;
        measureElement.style.fontFamily = computedStyle.fontFamily;
        measureElement.style.fontWeight = computedStyle.fontWeight;
        measureElement.style.letterSpacing = computedStyle.letterSpacing;
        measureElement.style.lineHeight = computedStyle.lineHeight;
        measureElement.style.padding = computedStyle.padding || "0";
        measureElement.style.whiteSpace = "pre-wrap";
        measureElement.style.wordBreak = "break-word";
        measureElement.style.boxSizing = "border-box";
        measureElement.textContent = conditionText;

        const fullHeight = measureElement.scrollHeight;
        measureElement.style.webkitLineClamp = "1";
        measureElement.style.display = "-webkit-box";
        measureElement.style.webkitBoxOrient = "vertical";
        measureElement.style.overflow = "hidden";
        const clampedHeight = measureElement.scrollHeight;
        measureElement.style.webkitLineClamp = "none";
        measureElement.style.display = "block";
        measureElement.style.webkitBoxOrient = "unset";

        setShouldShowSeeMore(fullHeight > clampedHeight * 1.1);
      });
    });
  }, [conditionText, editable]);

  return { textRef, measureRef, shouldShowSeeMore };
}

function updateConditionTextProperty(
  condition: any,
  newText: string,
): Record<string, unknown> {
  if (condition.TEXT !== undefined) {
    return { ...condition, TEXT: newText };
  }
  return { ...condition, text: newText };
}

function updateConditionTypeProperty(
  condition: any,
  newVal: string,
): Record<string, unknown> {
  if (condition.TYPE !== undefined) {
    return { ...condition, TYPE: newVal };
  }
  return { ...condition, type: newVal };
}

function normalizeSearchPath(path: string): string {
  return path.replace(/\[(\d+)\]/g, ".$1");
}

function useConditionSearchExpansion(
  currentPath: string | undefined,
  activeMatchPath: string | null | undefined,
  searchText: string | undefined,
  conditionText: string,
  isExpanded: boolean,
  onToggleExpand: () => void,
) {
  const containsSearch = Boolean(
    searchText &&
      conditionText.toLowerCase().includes(searchText.toLowerCase()),
  );
  const normCurrent = currentPath ? normalizeSearchPath(currentPath) : "";
  const normActive = activeMatchPath ? normalizeSearchPath(activeMatchPath) : "";
  const isActive = Boolean(
    normCurrent &&
      normActive &&
      (normActive === normCurrent || normActive.startsWith(`${normCurrent}.`)),
  );

  useEffect(() => {
    if (isActive && !isExpanded && containsSearch) {
      onToggleExpand();
    }
  }, [isActive, isExpanded, containsSearch, onToggleExpand]);

  return { containsSearch, isActive };
}

function buildCellBasePath(cellPath?: Array<string | number>): string {
  if (!cellPath) return "";
  return cellPath
    .map((part, idx) => {
      if (typeof part === "number") {
        return `[${part}]`;
      }
      return idx === 0 ? String(part) : `.${String(part)}`;
    })
    .join("");
}

function ConditionItemReadOnlyText({
  conditionText,
  currentPath,
  hasClickableSource,
  sourceWithPage,
  onSourceClick,
  highlightText,
  textRef,
  measureRef,
  shouldShowSeeMore,
  isExpanded,
  onToggleExpand,
}: {
  conditionText: string;
  currentPath?: string;
  hasClickableSource: boolean;
  sourceWithPage: { page_number?: number; snippet?: string } | null;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  highlightText: (text: string) => ReactNode;
  textRef: React.RefObject<HTMLDivElement | null>;
  measureRef: React.RefObject<HTMLDivElement | null>;
  shouldShowSeeMore: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasClickableSource && sourceWithPage && onSourceClick) {
      markSourceClickTarget(e);
      onSourceClick(sourceWithPage);
    }
  };

  return (
    <>
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
      <div className="flex flex-wrap items-start gap-2">
        <div
          ref={textRef}
          data-path={currentPath}
          className={`flex-1 text-gray-900 dark:text-gray-100 ${!isExpanded && shouldShowSeeMore ? "line-clamp-1" : ""} ${
            hasClickableSource
              ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              : ""
          }`}
          onClick={handleSourceClick}
          onMouseDown={hasClickableSource ? markSourceClickTarget : undefined}
          title={
            hasClickableSource && sourceWithPage
              ? `Click to open page ${sourceWithPage.page_number} in PDF viewer`
              : undefined
          }
          data-source-button={hasClickableSource ? true : undefined}
          data-page-number={sourceWithPage?.page_number}
          role={hasClickableSource ? "button" : undefined}
          tabIndex={hasClickableSource ? 0 : undefined}
          onKeyDown={
            hasClickableSource
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSourceClick(e as unknown as React.MouseEvent);
                  }
                }
              : undefined
          }
        >
          {highlightText(conditionText)}
        </div>
        {shouldShowSeeMore && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="text-primary-600 dark:text-primary-400 text-xs font-medium whitespace-nowrap hover:underline"
          >
            {isExpanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </>
  );
}

function ConditionItemTextSection({
  editable,
  hasClickableSource,
  conditionText,
  condition,
  onUpdate,
  sourceWithPage,
  onSourceClick,
  highlightText,
  currentPath,
  textRef,
  measureRef,
  shouldShowSeeMore,
  isExpanded,
  onToggleExpand,
}: {
  editable: boolean;
  hasClickableSource: boolean;
  conditionText: string;
  condition: any;
  onUpdate: (updatedCondition: any) => void;
  sourceWithPage: { page_number?: number; snippet?: string } | null;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  highlightText: (text: string) => ReactNode;
  currentPath?: string;
  textRef: React.RefObject<HTMLDivElement | null>;
  measureRef: React.RefObject<HTMLDivElement | null>;
  shouldShowSeeMore: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  if (editable) {
    return (
      <AutoResizeTextarea
        value={conditionText}
        onChange={(newText) =>
          onUpdate(updateConditionTextProperty(condition, newText))
        }
        className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
      />
    );
  }

  return (
    <ConditionItemReadOnlyText
      conditionText={conditionText}
      currentPath={currentPath}
      hasClickableSource={hasClickableSource}
      sourceWithPage={sourceWithPage}
      onSourceClick={onSourceClick}
      highlightText={highlightText}
      textRef={textRef}
      measureRef={measureRef}
      shouldShowSeeMore={shouldShowSeeMore}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    />
  );
}

// Renders extra metadata fields on a condition object (type, flags, etc.)
function ConditionMetadataBadges({ condition }: { condition: any }) {
  return (
    <>
      {Object.keys(condition)
        .filter(
          (key) =>
            key !== "text" &&
            key !== "TEXT" &&
            key !== "type" &&
            key !== "TYPE" &&
            key !== "sources" &&
            key !== "SOURCES",
        )
        .map((key) => {
          const value = condition[key];
          if (value === undefined || value === null) return null;
          return (
            <div key={key} className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {formatKeyName(key)}:
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getBooleanBadgeClassName(value)}`}
              >
                {formatValue(value)}
              </span>
            </div>
          );
        })}
    </>
  );
}

function LimitPeriodConditionReadOnlyText({
  conditionText,
  currentPath,
  hasClickableSource,
  sourceWithPage,
  onSourceClick,
  highlightText,
  textRef,
  measureRef,
  shouldShowSeeMore,
  isExpanded,
  onToggleExpand,
}: {
  conditionText: string;
  currentPath?: string;
  hasClickableSource: boolean;
  sourceWithPage: { page_number?: number; snippet?: string } | null;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  highlightText: (text: string) => ReactNode;
  textRef: React.RefObject<HTMLDivElement | null>;
  measureRef: React.RefObject<HTMLDivElement | null>;
  shouldShowSeeMore: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const onSourceClickHandler = (e: React.MouseEvent) =>
    handleConditionSourceClick(
      e,
      hasClickableSource,
      sourceWithPage,
      onSourceClick,
    );

  return (
    <>
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          top: "-9999px",
          left: "-9999px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "0.75rem",
        }}
      />
      <div className="flex flex-wrap items-start gap-2">
        <div
          ref={textRef}
          data-path={currentPath}
          className={`flex-1 text-gray-800 dark:text-gray-200 ${!isExpanded && shouldShowSeeMore ? "line-clamp-1" : ""} ${
            hasClickableSource
              ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              : ""
          }`}
          onClick={onSourceClickHandler}
          onMouseDown={hasClickableSource ? markSourceClickTarget : undefined}
          data-source-button={hasClickableSource ? true : undefined}
          data-page-number={sourceWithPage?.page_number}
          title={buildPdfSourceTitle(sourceWithPage?.page_number)}
        >
          {highlightText(conditionText)}
        </div>
        {shouldShowSeeMore && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="text-primary-600 dark:text-primary-400 text-xs font-medium whitespace-nowrap hover:underline"
          >
            {isExpanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </>
  );
}

function LimitPeriodConditionTypeBadge({
  conditionType,
  hasClickableSource,
  sourceWithPage,
  onSourceClick,
}: {
  conditionType?: string;
  hasClickableSource: boolean;
  sourceWithPage: { page_number?: number; snippet?: string } | null;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
}) {
  if (!conditionType) return null;

  return (
    <span
      className={`inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400 ${
        hasClickableSource
          ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          : ""
      }`}
      onClick={(e) =>
        handleConditionSourceClick(
          e,
          hasClickableSource,
          sourceWithPage,
          onSourceClick,
        )
      }
      onMouseDown={hasClickableSource ? markSourceClickTarget : undefined}
      data-source-button={hasClickableSource ? true : undefined}
      title={buildPdfSourceTitle(sourceWithPage?.page_number)}
    >
      {conditionType}
    </span>
  );
}

// Component for individual limit/period condition item
function LimitPeriodConditionItem({
  condition,
  editable,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onUpdateType,
  onRemove,
  searchText,
  activeMatchPath,
  currentPath,
  onSourceClick,
  rootData,
}: {
  condition: any;
  editable: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (newVal: string) => void;
  onUpdateType: (newVal: string) => void;
  onRemove: () => void;
  searchText?: string;
  activeMatchPath?: string | null;
  currentPath?: string;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  rootData?: any;
}) {
  const conditionText =
    condition.text ||
    condition.TEXT ||
    condition.condition_text ||
    condition.CONDITION_TEXT ||
    "";
  const { textRef, measureRef, shouldShowSeeMore } = useConditionTextTruncation(
    conditionText,
    editable,
  );
  const highlightText = createSearchHighlighter(
    searchText,
    currentPath,
    activeMatchPath,
  );

  const conditionSources = lookupConditionSources(
    condition,
    rootData,
    currentPath,
  );
  const hasClickableSource = hasSourceWithPage(conditionSources);
  const sourceWithPage = findSourceWithPage(conditionSources);

  useConditionSearchExpansion(
    currentPath,
    activeMatchPath,
    searchText,
    conditionText,
    isExpanded,
    onToggleExpand,
  );

  return (
    <li className="relative" data-path={currentPath}>
      <div className="flex items-start gap-2">
        <span className="absolute top-1.5 -left-4 h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
        <div className="flex-1 space-y-1">
          {editable ? (
            <AutoResizeTextarea
              value={conditionText}
              onChange={onUpdate}
              disabled={!editable}
              className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
            />
          ) : (
            <LimitPeriodConditionReadOnlyText
              conditionText={conditionText}
              currentPath={currentPath}
              hasClickableSource={hasClickableSource}
              sourceWithPage={sourceWithPage}
              onSourceClick={onSourceClick}
              highlightText={highlightText}
              textRef={textRef}
              measureRef={measureRef}
              shouldShowSeeMore={shouldShowSeeMore}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {editable ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Type:
                </div>
                <AutoResizeTextarea
                  value={condition.type || ""}
                  onChange={onUpdateType}
                  disabled={!editable}
                  className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
                />
              </div>
            ) : (
              <LimitPeriodConditionTypeBadge
                conditionType={condition.type}
                hasClickableSource={hasClickableSource}
                sourceWithPage={sourceWithPage}
                onSourceClick={onSourceClick}
              />
            )}
            <ConditionMetadataBadges condition={condition} />
          </div>
          {editable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="mt-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function LimitPeriodTextDescriptionSection({
  text_description,
  editable,
  basePath,
  hasClickableSource,
  sourceWithPage,
  onSourceClick,
  highlightFieldText,
  onUpdate,
}: {
  text_description: unknown;
  editable: boolean;
  basePath: string;
  hasClickableSource: boolean;
  sourceWithPage: { page_number?: number; snippet?: string } | null;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  highlightFieldText: (text: string, fieldPath: string) => ReactNode;
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  if (text_description === undefined) return null;

  return (
    <div className="space-y-1" data-path={`${basePath}.text_description`}>
      {editable ? (
        <>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            text_description:
          </div>
          <AutoResizeTextarea
            value={String(text_description || "")}
            onChange={(newVal) => onUpdate({ text_description: newVal })}
            disabled={!editable}
            className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
          />
        </>
      ) : (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium whitespace-nowrap text-gray-600 dark:text-gray-400">
            text_description:
          </span>
          <div
            className={`font-medium text-gray-900 dark:text-gray-100 ${
              hasClickableSource
                ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                : ""
            }`}
            onClick={(e) =>
              handleConditionSourceClick(
                e,
                hasClickableSource,
                sourceWithPage,
                onSourceClick,
              )
            }
            onMouseDown={hasClickableSource ? markSourceClickTarget : undefined}
            data-source-button={hasClickableSource ? true : undefined}
            data-page-number={sourceWithPage?.page_number}
            title={buildPdfSourceTitle(sourceWithPage?.page_number)}
          >
            {highlightFieldText(
              String(text_description || ""),
              `${basePath}.text_description`,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LimitPeriodConditionsSection({
  conditions,
  editable,
  basePath,
  expandedSections,
  toggleExpand,
  handleUpdateData,
  searchText,
  activeMatchPath,
  onSourceClick,
  rootData,
}: {
  conditions: any[] | undefined;
  editable: boolean;
  basePath: string;
  expandedSections: Record<string, boolean>;
  toggleExpand: (key: string) => void;
  handleUpdateData: (updates: Record<string, unknown>) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  rootData?: any;
}) {
  return (
    <div className="space-y-1.5 border-t border-gray-200 pt-2 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
          Conditions:
        </div>
        {editable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const newConditions = [
                ...(conditions || []),
                { text: "", type: "", sources: [] },
              ];
              handleUpdateData({ conditions: newConditions });
            }}
            className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-green-600"
          >
            <PlusIcon className="h-3 w-3" />
            Add
          </button>
        )}
      </div>
      {conditions && Array.isArray(conditions) && conditions.length > 0 ? (
        <ul className="space-y-1.5 pl-4">
          {conditions.map((condition: any, idx: number) => {
            const conditionKey = `condition-${idx}`;
            const conditionPath = `${basePath}.conditions[${idx}]`;
            return (
              <LimitPeriodConditionItem
                key={idx}
                condition={condition}
                editable={editable}
                isExpanded={expandedSections[conditionKey] ?? false}
                onToggleExpand={() => toggleExpand(conditionKey)}
                onUpdate={(newVal) => {
                  const updated = [...conditions];
                  updated[idx] = { ...condition, text: newVal };
                  handleUpdateData({ conditions: updated });
                }}
                onUpdateType={(newVal) => {
                  const updated = [...conditions];
                  updated[idx] = { ...condition, type: newVal };
                  handleUpdateData({ conditions: updated });
                }}
                onRemove={() => {
                  const updated = conditions.filter(
                    (_: any, i: number) => i !== idx,
                  );
                  handleUpdateData({ conditions: updated });
                }}
                searchText={searchText}
                activeMatchPath={activeMatchPath}
                currentPath={conditionPath}
                onSourceClick={onSourceClick}
                rootData={rootData}
              />
            );
          })}
        </ul>
      ) : (
        !editable && (
          <div className="relative pl-4 text-xs text-gray-400 italic dark:text-gray-500">
            No conditions
          </div>
        )
      )}
    </div>
  );
}

// Component to render limit/period structures beautifully
function LimitPeriodRenderer({
  data,
  onSourceClick,
  cellSources,
  editable = false,
  onChange,
  onValueChange,
  cellPath,
  searchText,
  activeMatchPath,
  rootData,
}: {
  data: any;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  cellSources?: any[] | null;
  editable?: boolean;
  onChange?: (newData: any) => void;
  onValueChange?: (path: Array<string | number>, newVal: any) => void;
  cellPath?: Array<string | number>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  rootData?: any;
}) {
  const {
    limit_type,
    value,
    unit,
    text_description,
    conditions,
    sources,
    actuals_basis,
  } = data || {};

  const basePath = buildCellBasePath(cellPath);

  const resolvedSources =
    rootData && basePath
      ? lookupConditionSources(data, rootData, basePath)
      : null;

  const availableSources = resolveFirstAvailableSources(
    sources,
    cellSources,
    resolvedSources,
  );

  const hasClickableSource = hasSourceWithPage(availableSources);
  const sourceWithPage = findSourceWithPage(availableSources);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const highlightFieldText = (text: string, fieldPath: string) =>
    createSearchHighlighter(searchText, fieldPath, activeMatchPath)(text);

  const handleUpdateData = (updates: Partial<typeof data>) => {
    const newData = { ...data, ...updates };
    if (onChange) onChange(newData);
    if (onValueChange && cellPath) onValueChange(cellPath, newData);
  };

  const toggleExpand = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative space-y-2 text-sm" data-path={basePath}>
      <LimitPeriodTextDescriptionSection
        text_description={text_description}
        editable={editable}
        basePath={basePath}
        hasClickableSource={hasClickableSource}
        sourceWithPage={sourceWithPage}
        onSourceClick={onSourceClick}
        highlightFieldText={highlightFieldText}
        onUpdate={handleUpdateData}
      />

      <LimitPeriodLimitFields
        editable={editable}
        limit_type={limit_type}
        value={value}
        unit={unit}
        actuals_basis={actuals_basis}
        basePath={basePath}
        onUpdate={handleUpdateData}
        highlightFieldText={highlightFieldText}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        hasClickableSource={hasClickableSource}
        sourceWithPage={sourceWithPage}
        onSourceClick={onSourceClick}
      />

      <LimitPeriodConditionsSection
        conditions={conditions}
        editable={editable}
        basePath={basePath}
        expandedSections={expandedSections}
        toggleExpand={toggleExpand}
        handleUpdateData={handleUpdateData}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        onSourceClick={onSourceClick}
        rootData={rootData}
      />
    </div>
  );
}

// Component for individual condition item with proper hook usage
function ConditionItem({
  condition,
  editable,
  onUpdate,
  onRemove,
  isExpanded,
  onToggleExpand,
  searchText,
  activeMatchPath,
  currentPath,
  onSourceClick,
  rootData,
}: {
  condition: any;
  editable: boolean;
  onUpdate: (updatedCondition: any) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  searchText?: string;
  activeMatchPath?: string | null;
  currentPath?: string;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  rootData?: any;
}) {
  // Support both lowercase and uppercase property names, and condition_text (e.g. Other Base Covers)
  const conditionText =
    condition.text ||
    condition.TEXT ||
    condition.condition_text ||
    condition.CONDITION_TEXT ||
    "";
  const { textRef, measureRef, shouldShowSeeMore } = useConditionTextTruncation(
    conditionText,
    editable,
  );

  const conditionSources = lookupConditionSources(
    condition,
    rootData,
    currentPath,
  );

  const hasClickableSource = Boolean(hasSourceWithPage(conditionSources));
  const sourceWithPage = findSourceWithPage(conditionSources);

  const highlightText = createSearchHighlighter(
    searchText,
    currentPath,
    activeMatchPath,
  );

  useConditionSearchExpansion(
    currentPath,
    activeMatchPath,
    searchText,
    conditionText,
    isExpanded,
    onToggleExpand,
  );

  return (
    <li
      className={`relative ${hasClickableSource ? "cursor-pointer" : ""}`}
      data-path={currentPath}
      data-source-button={hasClickableSource ? true : undefined}
      data-page-number={sourceWithPage?.page_number}
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="absolute top-1.5 -left-4 h-1.5 w-1.5 rounded-full bg-blue-500" />
        <div className="min-w-0 flex-1 space-y-1">
          <ConditionItemTextSection
            editable={editable}
            hasClickableSource={hasClickableSource}
            conditionText={conditionText}
            condition={condition}
            onUpdate={onUpdate}
            sourceWithPage={sourceWithPage}
            onSourceClick={onSourceClick}
            highlightText={highlightText}
            currentPath={currentPath}
            textRef={textRef}
            measureRef={measureRef}
            shouldShowSeeMore={shouldShowSeeMore}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
          />
          <div
            className={`flex flex-wrap items-center gap-2 ${hasClickableSource ? "cursor-pointer" : ""}`}
            onClick={(e) =>
              handleConditionSourceClick(
                e,
                hasClickableSource,
                sourceWithPage,
                onSourceClick,
              )
            }
          >
            {editable ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Type:
                </div>
                <AutoResizeTextarea
                  value={condition.type || condition.TYPE || ""}
                  onChange={(newVal) =>
                    onUpdate(updateConditionTypeProperty(condition, newVal))
                  }
                  className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
                />
              </div>
            ) : (
              (condition.type || condition.TYPE) && (
                <span
                  className={`inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300 ${
                    hasClickableSource
                      ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (!hasClickableSource || !sourceWithPage || !onSourceClick) return;
                    e.stopPropagation();
                    markSourceClickTarget(e);
                    onSourceClick(sourceWithPage);
                  }}
                  onMouseDown={
                    hasClickableSource ? markSourceClickTarget : undefined
                  }
                  data-source-button={hasClickableSource ? true : undefined}
                  title={
                    hasClickableSource && sourceWithPage
                      ? `Click to open page ${sourceWithPage.page_number} in PDF viewer`
                      : undefined
                  }
                >
                  {condition.type || condition.TYPE}
                </span>
              )
            )}
            <ConditionMetadataBadges condition={condition} />
          </div>
          {editable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

// Component to render conditions array beautifully
function ConditionsArrayRenderer({
  data,
  editable = false,
  onChange,
  onValueChange,
  cellPath,
  searchText,
  activeMatchPath,
  onSourceClick,
  rootData,
  defaultCollapsed = true,
}: {
  data: any[];
  editable?: boolean;
  onChange?: (newData: any[]) => void;
  onValueChange?: (path: Array<string | number>, newVal: any) => void;
  cellPath?: Array<string | number>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  rootData?: any;
  /** When false, conditions are expanded by default (e.g. in Other Base Covers table cells) */
  defaultCollapsed?: boolean;
}) {
  // Conditions are collapsed by default (all start as false/undefined)
  const [expandedConditions, setExpandedConditions] = useState<
    Record<number, boolean>
  >({});

  const handleUpdateData = (newData: any[]) => {
    if (onChange) onChange(newData);
    if (onValueChange && cellPath) onValueChange(cellPath, newData);
  };

  const toggleExpand = (idx: number) => {
    setExpandedConditions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!Array.isArray(data) || data.length === 0) {
    if (!editable) {
      return (
        <div className="relative text-sm text-gray-400 italic dark:text-gray-500">
          {/* Component Name Badge for empty conditions - Only show when search is active */}
          {/* {searchText && (
            <div className="absolute -top-2 left-0 z-10">
              <span className="pointer-events-none rounded bg-teal-100 px-1 py-0.5 font-mono text-[7px] font-semibold text-teal-700 opacity-80 dark:bg-teal-900/30 dark:text-teal-300">
                TableRenderer
              </span>
            </div>
          )} */}
          No conditions
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateData([{ text: "", type: "", sources: [] }]);
          }}
          className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-green-600"
        >
          <PlusIcon className="h-3 w-3" />
          Add Condition
        </button>
      </div>
    );
  }

  // Build base path string
  const basePath = cellPath
    ? cellPath
        .map((part, idx) => {
          if (typeof part === "number") {
            return `[${part}]`;
          }
          return idx === 0 ? String(part) : `.${String(part)}`;
        })
        .join("")
    : "";

  return (
    <div
      className="relative w-full min-w-0"
      data-path={basePath}
      data-component-name="ConditionsArrayRenderer"
    >
      <CollapsibleSection
        title={`Conditions (${data.length})`}
        defaultCollapsed={defaultCollapsed}
        // isOpen={shouldBeOpen} // Open if there's a search match
        headerActions={
          editable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateData([
                  ...data,
                  { text: "", type: "", sources: [] },
                ]);
              }}
              className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-green-600"
            >
              <PlusIcon className="h-3 w-3" />
              Add
            </button>
          ) : undefined
        }
        className="text-sm"
      >
        <ul className="space-y-2 pl-4">
          {data.map((condition: any, idx: number) => {
            const conditionPath = `${basePath}[${idx}]`;
            return (
              <ConditionItem
                key={idx}
                condition={condition}
                editable={editable}
                onUpdate={(updatedCondition) => {
                  const updated = [...data];
                  updated[idx] = updatedCondition;
                  handleUpdateData(updated);
                }}
                onRemove={() => {
                  const updated = data.filter((_: any, i: number) => i !== idx);
                  handleUpdateData(updated);
                }}
                isExpanded={expandedConditions[idx] ?? false} // Default to collapsed (false)
                onToggleExpand={() => toggleExpand(idx)}
                searchText={searchText}
                activeMatchPath={activeMatchPath}
                currentPath={conditionPath}
                onSourceClick={onSourceClick}
                rootData={rootData}
              />
            );
          })}
        </ul>
      </CollapsibleSection>
    </div>
  );
}

// Auto-resize textarea for table cells - matches exact content dimensions
function AutoResizeTextarea({
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const adjustSize = useCallback(() => {
    const textarea = textareaRef.current;
    const measure = measureRef.current;
    if (textarea && measure) {
      // Copy all styles from textarea to measure div for accurate measurement
      const computedStyle = window.getComputedStyle(textarea);
      measure.style.fontSize = computedStyle.fontSize;
      measure.style.fontFamily = computedStyle.fontFamily;
      measure.style.fontWeight = computedStyle.fontWeight;
      measure.style.letterSpacing = computedStyle.letterSpacing;
      measure.style.lineHeight = computedStyle.lineHeight;
      measure.style.padding = computedStyle.padding;
      measure.style.border = computedStyle.border;
      measure.style.boxSizing = computedStyle.boxSizing;
      measure.style.whiteSpace = "pre-wrap";
      measure.style.wordWrap = "break-word";
      measure.style.width = "auto";

      // Set content and measure
      measure.textContent = value || "M";

      // Get the actual content width
      const contentWidth = measure.offsetWidth;

      // Set width to match content exactly (with constraints)
      const minWidth = 150;
      const maxWidth =
        textarea.parentElement?.clientWidth || window.innerWidth * 0.6;
      const finalWidth = Math.max(
        minWidth,
        Math.min(contentWidth + 2, maxWidth),
      ); // +2 for border
      textarea.style.width = `${finalWidth}px`;

      // Measure height - set width first, then measure height
      measure.style.width = `${finalWidth}px`;
      measure.textContent = value || "M";
      const contentHeight = measure.offsetHeight;

      // Set height to match content exactly
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(36, Math.max(contentHeight, scrollHeight))}px`;
    }
  }, [value]);

  useEffect(() => {
    adjustSize();
  }, [value, adjustSize]);

  return (
    <>
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          top: "-9999px",
          left: "-9999px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          fontSize: "0.875rem", // text-sm
          fontFamily: "inherit",
          padding: "0.375rem 0.75rem", // px-3 py-1.5
          border: "1px solid transparent",
          width: "auto",
          maxWidth: "100%",
        }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setTimeout(adjustSize, 0);
        }}
        onFocus={(e) => {
          // Allow textarea to receive focus - stop propagation to parent
          e.stopPropagation();
          onFocus?.(e);
        }}
        onBlur={onBlur}
        onMouseDown={(e) => {
          // Allow textarea to receive mouse events - stop propagation to parent
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Allow textarea to receive click events - stop propagation to parent
          e.stopPropagation();
        }}
        disabled={disabled}
        style={{
          minHeight: "36px",
          overflowY: "visible",
          overflowX: "visible",
          resize: "both",
          width: "auto",
          boxSizing: "border-box",
          display: "inline-block",
        }}
        className={className}
      />
    </>
  );
}

function LimitPeriodLimitFields({
  editable,
  limit_type,
  value,
  unit,
  actuals_basis,
  basePath,
  onUpdate,
  highlightFieldText,
  searchText,
  activeMatchPath,
  hasClickableSource,
  sourceWithPage,
  onSourceClick,
}: {
  editable: boolean;
  limit_type?: string;
  value?: number | string;
  unit?: string;
  actuals_basis?: string;
  basePath: string;
  onUpdate: (updates: Record<string, unknown>) => void;
  highlightFieldText: (text: string, fieldPath: string) => ReactNode;
  searchText?: string;
  activeMatchPath?: string | null;
  hasClickableSource?: boolean;
  sourceWithPage?: { page_number?: number; snippet?: string } | null;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
}) {
  const sourceClickProps = hasClickableSource
    ? {
        onClick: (e: React.MouseEvent) =>
          handleConditionSourceClick(
            e,
            !!hasClickableSource,
            sourceWithPage ?? null,
            onSourceClick,
          ),
        onMouseDown: markSourceClickTarget,
        "data-source-button": true as const,
        title: buildPdfSourceTitle(sourceWithPage?.page_number),
      }
    : {};
  if (
    !limit_type &&
    value === undefined &&
    !unit &&
    !actuals_basis &&
    !editable
  ) {
    return null;
  }

  if (editable) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Limit Type:
            </div>
            <AutoResizeTextarea
              value={limit_type || ""}
              onChange={(newVal) => onUpdate({ limit_type: newVal })}
              className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Value:</div>
            <AutoResizeTextarea
              value={value !== undefined && value !== null ? String(value) : ""}
              onChange={(newVal) => {
                const numVal = Number(newVal);
                onUpdate({ value: Number.isNaN(numVal) ? newVal : numVal });
              }}
              className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Unit:</div>
            <AutoResizeTextarea
              value={unit || ""}
              onChange={(newVal) => onUpdate({ unit: newVal })}
              className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Actuals Basis:
            </div>
            <AutoResizeTextarea
              value={actuals_basis || ""}
              onChange={(newVal) => onUpdate({ actuals_basis: newVal })}
              className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {limit_type && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              limit_type:
            </span>
            <span
              className={`inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ${
                hasClickableSource
                  ? "cursor-pointer transition-colors hover:text-blue-800 dark:hover:text-blue-200"
                  : ""
              }`}
              data-path={`${basePath}.limit_type`}
              {...sourceClickProps}
            >
              {highlightFieldText(limit_type, `${basePath}.limit_type`)}
            </span>
          </div>
        )}
        {value !== undefined && value !== null && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              value:
            </span>
            <span
              className={`font-semibold text-gray-700 dark:text-gray-300 ${
                hasClickableSource
                  ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                  : ""
              }`}
              data-path={`${basePath}.value`}
              {...sourceClickProps}
            >
              {highlightFieldText(String(value), `${basePath}.value`)}
            </span>
          </div>
        )}
        {unit && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              unit:
            </span>
            <span
              className={`font-semibold text-gray-700 dark:text-gray-300 ${
                hasClickableSource
                  ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                  : ""
              }`}
              data-path={`${basePath}.unit`}
              {...sourceClickProps}
            >
              {highlightFieldText(unit, `${basePath}.unit`)}
            </span>
          </div>
        )}
        {actuals_basis && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {searchText
                ? highlightKeyText(
                    `${formatKeyName("actuals_basis")}:`,
                    searchText,
                    `${basePath}.actuals_basis`,
                    activeMatchPath,
                  )
                : `${formatKeyName("actuals_basis")}:`}
            </span>
            <span
              className={`inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 ${
                hasClickableSource
                  ? "cursor-pointer transition-colors hover:text-purple-900 dark:hover:text-purple-200"
                  : ""
              }`}
              data-path={`${basePath}.actuals_basis`}
              {...sourceClickProps}
            >
              {highlightFieldText(
                formatValue(actuals_basis),
                `${basePath}.actuals_basis`,
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TableRendererConditionsView({
  data,
  path,
  isEditing,
  onValueChange,
  searchText,
  activeMatchPath,
  matchedPaths,
  onSourceClick,
  rootData,
}: {
  data: any[];
  path: Array<string | number>;
  isEditing: boolean;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  rootData?: any;
}) {
  return (
    <div className="w-full min-w-0 space-y-2" data-component-name="TableRenderer">
      <ConditionsArrayRenderer
        data={data}
        editable={isEditing}
        onChange={(newData) => onValueChange(path, newData)}
        onValueChange={onValueChange}
        cellPath={path}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        onSourceClick={onSourceClick}
        rootData={rootData}
      />
    </div>
  );
}

function TableRendererStructuredTablesView({
  data,
  path,
  searchText,
  activeMatchPath,
  matchedPaths,
  onSourceClick,
  isEditing,
  onValueChange,
  shouldEnableStatus,
  shouldEnableComments,
  fieldStatus,
  onFieldStatusChange,
  getComments,
  onAddComment,
  userId,
  userRole,
}: {
  data: any[];
  path: Array<string | number>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  isEditing: boolean;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  shouldEnableStatus: boolean;
  shouldEnableComments: boolean;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment: (fieldPath: string, comment: string, userId: string) => void;
  userId: string;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
}) {
  return (
    <div className="space-y-6" data-component-name="TableRenderer">
      <div className="mb-1 flex items-center gap-1">
        <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          TableRenderer (array of StructuredTableRenderer)
        </span>
      </div>
      {data.map((table: any, index: number) => {
        const tablePath = [...path, index];
        const tableFieldPath = toBracketPath(tablePath);
        return (
          <div key={index}>
            <StructuredTableRenderer
              table={table}
              searchText={searchText}
              activeMatchPath={activeMatchPath}
              matchedPaths={matchedPaths}
              onSourceClick={onSourceClick}
              path={tablePath}
              isEditing={isEditing}
              onValueChange={(_p, newValue) => {
                const updatedData = [...data];
                updatedData[index] = newValue;
                onValueChange(path, updatedData);
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
            />
          </div>
        );
      })}
    </div>
  );
}

interface TableRendererProps {
  data: any[];
  actualDataWithoutChangeValue: any;
  path: Array<string | number>;
  editingMap: Record<string, boolean>;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  onAddRow?: (path: Array<string | number>) => void;
  onRemoveRow?: (path: Array<string | number>, index: number) => void;
  onAddColumn?: (
    path: Array<string | number>,
    columnName: string,
    defaultValue?: any,
  ) => void;
  onRemoveColumn?: (path: Array<string | number>, columnName: string) => void;
  newlyAddedTableRows?: Set<string>;
  newlyAddedTableColumns?: Set<string>;
  commentOnlyMode?: boolean;
  shouldEnableComments?: boolean;
  shouldEnableStatus?: boolean;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  fieldStatus?: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  jsonComments?: Record<string, Array<any>>;
  pendingComments?: Array<any>;
  rootData?: any;
  onRootDataChange?: (data: any) => void;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment?: (fieldPath: string, comment: string, userId: string) => void;
  userId?: string;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
}

function isCommentLikeDataItem(firstItem: unknown): boolean {
  if (
    typeof firstItem !== "object" ||
    firstItem === null ||
    Array.isArray(firstItem)
  ) {
    return false;
  }
  const normalizedKeys = Object.keys(firstItem).map((k) =>
    k.toLowerCase().trim(),
  );
  const hasComment = normalizedKeys.some((k) => k.includes("comment"));
  const hasId = normalizedKeys.some((k) => k === "id");
  const hasCreated = normalizedKeys.some((k) => k.includes("created"));
  const hasUser = normalizedKeys.some((k) => k.includes("user"));
  return hasComment || (hasId && hasCreated && hasUser);
}

function resolveAlternateTableRendererView({
  data,
  path,
  fieldKeyLower,
  isEditing,
  onValueChange,
  searchText,
  activeMatchPath,
  matchedPaths,
  onSourceClick,
  rootData,
  shouldEnableStatus,
  shouldEnableComments,
  fieldStatus,
  onFieldStatusChange,
  getComments,
  onAddComment,
  userId,
  userRole,
}: {
  data: any[];
  path: Array<string | number>;
  fieldKeyLower: string;
  isEditing: boolean;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  rootData?: any;
  shouldEnableStatus: boolean;
  shouldEnableComments: boolean;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment: (fieldPath: string, comment: string, userId: string) => void;
  userId: string;
  userRole?: TableRendererProps["userRole"];
}): ReactNode | null | undefined {
  if (fieldKeyLower.includes("comment") || fieldKeyLower.includes("status")) {
    return null;
  }

  if (Array.isArray(data) && data.length > 0 && isConditionsArray(data)) {
    return (
      <TableRendererConditionsView
        data={data}
        path={path}
        isEditing={isEditing}
        onValueChange={onValueChange}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        onSourceClick={onSourceClick}
        rootData={rootData}
      />
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return undefined;
  }

  const firstItem = data[0];
  if (isStructuredTable(firstItem) && data.every((item) => isStructuredTable(item))) {
    return (
      <TableRendererStructuredTablesView
        data={data}
        path={path}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        onSourceClick={onSourceClick}
        isEditing={isEditing}
        onValueChange={onValueChange}
        shouldEnableStatus={shouldEnableStatus}
        shouldEnableComments={shouldEnableComments}
        fieldStatus={fieldStatus}
        onFieldStatusChange={onFieldStatusChange}
        getComments={getComments}
        onAddComment={onAddComment}
        userId={userId}
        userRole={userRole}
      />
    );
  }

  if (isCommentLikeDataItem(firstItem)) {
    return null;
  }

  return undefined;
}

function StopPropagationContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const stopPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <div
      className={className}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      {children}
    </div>
  );
}

function ColumnResizeHandle({
  columnKey,
  onResizeStart,
}: {
  columnKey: string;
  onResizeStart: (columnKey: string, e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label="Resize column"
      onMouseDown={(e) => onResizeStart(columnKey, e)}
      className="hover:bg-primary-500 absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize border-0 bg-transparent p-0 transition-colors"
      style={{
        width: "4px",
        cursor: "col-resize",
        userSelect: "none",
      }}
      title="Drag to resize column"
    />
  );
}

function useTableColumnResize(
  columns: string[],
  shouldEnableComments: boolean,
  shouldEnableStatus: boolean,
) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  useEffect(() => {
    if (columns.length > 0 && Object.keys(columnWidths).length === 0) {
      setColumnWidths(
        getDefaultColumnWidths(columns, shouldEnableComments, shouldEnableStatus),
      );
    }
  }, [columns, columnWidths, shouldEnableComments, shouldEnableStatus]);

  const handleResizeStart = useCallback(
    (col: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingColumn(col);
      setResizeStartX(e.clientX);
      setResizeStartWidth(columnWidths[col] || 150);
    },
    [columnWidths],
  );

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(80, resizeStartWidth + diff);
      setColumnWidths((prev) => ({ ...prev, [resizingColumn]: newWidth }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  return { columnWidths, handleResizeStart };
}

function useAddRowModalState(columns: string[], data: any[]) {
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [fieldTypes, setFieldTypes] = useState<Record<string, FieldType>>({});
  const fieldTypesForm = useForm({
    defaultValues: {} as Record<string, FieldType>,
  });

  useEffect(() => {
    if (
      showAddRowModal &&
      columns.length > 0 &&
      Object.keys(fieldTypes).length === 0
    ) {
      const types = inferFieldTypesFromColumns(columns, data);
      setFieldTypes(types);
      fieldTypesForm.reset(types);
    }
  }, [showAddRowModal, columns, data, fieldTypes, fieldTypesForm]);

  return {
    showAddRowModal,
    setShowAddRowModal,
    fieldTypes,
    setFieldTypes,
    fieldTypesForm,
  };
}

type NewColumnValueType = "string" | "number" | "boolean" | "array" | "object";
type NewColumnFormValues = { newColumnType: NewColumnValueType };

function useAutoExpandOnNewRow(
  dataLength: number,
  initialRowLimit: number,
  setTableExpanded: (value: boolean) => void,
  newRowRef: React.RefObject<HTMLTableRowElement | null>,
) {
  const previousDataLengthRef = useRef(dataLength);

  useEffect(() => {
    if (
      dataLength > previousDataLengthRef.current &&
      dataLength > initialRowLimit
    ) {
      setTableExpanded(true);
      setTimeout(() => {
        newRowRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
    previousDataLengthRef.current = dataLength;
  }, [dataLength, initialRowLimit, newRowRef, setTableExpanded]);
}

function addTableColumnIfValid({
  newColumnName,
  onAddColumn,
  path,
  newColumnType,
  setNewColumnName,
  setValue,
  setShowAddColumn,
}: {
  newColumnName: string;
  onAddColumn?: (
    path: Array<string | number>,
    columnName: string,
    defaultValue?: unknown,
  ) => void;
  path: Array<string | number>;
  newColumnType: NewColumnValueType;
  setNewColumnName: (value: string) => void;
  setValue: UseFormSetValue<NewColumnFormValues>;
  setShowAddColumn: (value: boolean) => void;
}) {
  if (!newColumnName.trim() || !onAddColumn) {
    return;
  }
  onAddColumn(path, newColumnName.trim(), getDefaultColumnValue(newColumnType));
  setNewColumnName("");
  setValue("newColumnType", "string");
  setShowAddColumn(false);
}

function confirmAddTableRow({
  columns,
  fieldTypes,
  fieldTypesForm,
  data,
  path,
  onValueChange,
  initialRowLimit,
  tableExpanded,
  setTableExpanded,
  setShowAddRowModal,
  setFieldTypes,
  newRowRef,
}: {
  columns: string[];
  fieldTypes: Record<string, FieldType>;
  fieldTypesForm: ReturnType<typeof useForm<Record<string, FieldType>>>;
  data: any[];
  path: Array<string | number>;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  initialRowLimit: number;
  tableExpanded: boolean;
  setTableExpanded: (value: boolean) => void;
  setShowAddRowModal: (value: boolean) => void;
  setFieldTypes: React.Dispatch<React.SetStateAction<Record<string, FieldType>>>;
  newRowRef: React.RefObject<HTMLTableRowElement | null>;
}) {
  const formValues = fieldTypesForm.getValues();
  const newRow = createRowFromFieldTypes(columns, fieldTypes, formValues);
  const updatedData = [...data, newRow];
  if (updatedData.length > initialRowLimit && !tableExpanded) {
    setTableExpanded(true);
  }
  onValueChange(path, updatedData);
  setShowAddRowModal(false);
  setFieldTypes({});
  fieldTypesForm.reset({});
  setTimeout(() => {
    newRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 150);
}

export default function TableRenderer({
  data,
  path,
  actualDataWithoutChangeValue,
  editingMap,
  onValueChange,
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  newlyAddedTableRows = new Set(),
  newlyAddedTableColumns = new Set(),
  commentOnlyMode = false,
  shouldEnableComments = false,
  shouldEnableStatus = false,
  userRole,
  fieldStatus = {},
  onFieldStatusChange,
  rootData,
  onRootDataChange,
  onSourceClick,
  getComments,
  onAddComment: onAddCommentProp,
  userId: userIdProp,
  searchText,
  activeMatchPath,
  matchedPaths = [],
}: TableRendererProps) {
  const keycloakUser = useKeycloakUser();
  const userId = userIdProp || keycloakUser.userId || "unknown";

  const onAddComment = onAddCommentProp || (() => {});

  // All hooks must be at the top, before any early returns
  const parentPath = path.join(".");
  const isEditing = !!editingMap[parentPath];
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const columnNameInputRef = useRef<HTMLInputElement>(null);

  // State to track if table rows are expanded (for "See more" functionality)
  const [tableExpanded, setTableExpanded] = useState(false);
  const INITIAL_ROW_LIMIT = 5; // Show first 5 rows initially
  const newRowRef = useRef<HTMLTableRowElement | null>(null);
  useAutoExpandOnNewRow(
    data.length,
    INITIAL_ROW_LIMIT,
    setTableExpanded,
    newRowRef,
  );

  // Auto-expand table if search match is found in hidden rows
  useEffect(() => {
    if (
      shouldExpandTableForSearch(
        path,
        searchText,
        activeMatchPath,
        matchedPaths,
        INITIAL_ROW_LIMIT,
      ) &&
      !tableExpanded
    ) {
      setTableExpanded(true);
    }
  }, [
    searchText,
    activeMatchPath,
    matchedPaths,
    path,
    tableExpanded,
    INITIAL_ROW_LIMIT,
  ]);

  const highlightAtPath = (text: string, currentPath: string) =>
    createSearchHighlighter(searchText, currentPath, activeMatchPath)(text);

  // Helper to check if row is newly added
  const checkRowNewlyAdded = (rowIndex: number) =>
    isTableRowNewlyAdded(rowIndex, parentPath, newlyAddedTableRows);

  // Local form for column type dropdown
  const { control, watch, setValue } = useForm<NewColumnFormValues>({
    defaultValues: {
      newColumnType: "string",
    },
  });
  const newColumnType = watch("newColumnType");
  const columns = sortTableColumns(collectTableColumns(data), path);
  const {
    showAddRowModal,
    setShowAddRowModal,
    fieldTypes,
    setFieldTypes,
    fieldTypesForm,
  } = useAddRowModalState(columns, data);
  const { columnWidths, handleResizeStart } = useTableColumnResize(
    columns,
    shouldEnableComments,
    shouldEnableStatus,
  );

  // Helper to check if column is newly added
  const checkColumnNewlyAdded = (columnName: string) =>
    isTableColumnNewlyAdded(columnName, parentPath, newlyAddedTableColumns);

  const handleAddColumn = () =>
    addTableColumnIfValid({
      newColumnName,
      onAddColumn,
      path,
      newColumnType,
      setNewColumnName,
      setValue,
      setShowAddColumn,
    });

  const handleAddRowClick = () => {
    setShowAddRowModal(true);
  };

  const handleConfirmAddRow = () =>
    confirmAddTableRow({
      columns,
      fieldTypes,
      fieldTypesForm,
      data,
      path,
      onValueChange,
      initialRowLimit: INITIAL_ROW_LIMIT,
      tableExpanded,
      setTableExpanded,
      setShowAddRowModal,
      setFieldTypes,
      newRowRef,
    });

  const handleCancelAddRow = () => {
    setShowAddRowModal(false);
    setFieldTypes({});
    fieldTypesForm.reset({});
  };

  // FAIL-SAFE: Check if this is a comments array and render as comments instead of table
  const fieldKey = path[path.length - 1]?.toString() || "";
  const fieldKeyLower = fieldKey.toLowerCase().trim();

  const alternateView = resolveAlternateTableRendererView({
    data,
    path,
    fieldKeyLower,
    isEditing,
    onValueChange,
    searchText,
    activeMatchPath,
    matchedPaths,
    onSourceClick,
    rootData,
    shouldEnableStatus,
    shouldEnableComments,
    fieldStatus,
    onFieldStatusChange,
    getComments,
    onAddComment,
    userId,
    userRole,
  });
  if (alternateView !== undefined) {
    return alternateView;
  }

  // We'll only show the status column when shouldEnableStatus === true AND we're NOT in edit mode
  // Show status column when status is enabled (both in edit and non-edit mode)
  const showStatusColumn = shouldEnableStatus;
  // Show comment column when comments are enabled
  const showCommentColumn = shouldEnableComments;

  // Determine which rows to display based on expanded state
  const visibleRows = tableExpanded ? data : data.slice(0, INITIAL_ROW_LIMIT);
  const hasMoreRows = data.length > INITIAL_ROW_LIMIT;

  return (
    <TableRendererMainView
      path={path}
      data={data}
      visibleRows={visibleRows}
      hasMoreRows={hasMoreRows}
      tableExpanded={tableExpanded}
      setTableExpanded={setTableExpanded}
      INITIAL_ROW_LIMIT={INITIAL_ROW_LIMIT}
      columns={columns}
      columnWidths={columnWidths}
      isEditing={isEditing}
      searchText={searchText}
      activeMatchPath={activeMatchPath}
      highlightAtPath={highlightAtPath}
      onRemoveColumn={onRemoveColumn}
      checkColumnNewlyAdded={checkColumnNewlyAdded}
      handleResizeStart={handleResizeStart}
      showCommentColumn={showCommentColumn}
      showStatusColumn={showStatusColumn}
      onAddColumn={onAddColumn}
      showAddColumn={showAddColumn}
      setShowAddColumn={setShowAddColumn}
      newColumnName={newColumnName}
      setNewColumnName={setNewColumnName}
      columnNameInputRef={columnNameInputRef}
      handleAddColumn={handleAddColumn}
      control={control}
      setValue={setValue}
      onRemoveRow={onRemoveRow}
      commentOnlyMode={commentOnlyMode}
      checkRowNewlyAdded={checkRowNewlyAdded}
      isSerialNumberColumn={isSerialNumberColumn}
      shouldEnableComments={shouldEnableComments}
      actualDataWithoutChangeValue={actualDataWithoutChangeValue}
      userRole={userRole}
      rootData={rootData}
      onRootDataChange={onRootDataChange}
      onSourceClick={onSourceClick}
      onValueChange={onValueChange}
      matchedPaths={matchedPaths}
      fieldStatus={fieldStatus}
      onFieldStatusChange={onFieldStatusChange}
      getComments={getComments}
      onAddComment={onAddComment}
      userId={userId}
      newRowRef={newRowRef}
      parentPath={parentPath}
      onAddRow={onAddRow}
      handleAddRowClick={handleAddRowClick}
      showAddRowModal={showAddRowModal}
      handleCancelAddRow={handleCancelAddRow}
      handleConfirmAddRow={handleConfirmAddRow}
      fieldTypesForm={fieldTypesForm}
      fieldTypes={fieldTypes}
    />
  );
}

type TableRendererMainViewProps = {
  path: Array<string | number>;
  data: any[];
  visibleRows: any[];
  hasMoreRows: boolean;
  tableExpanded: boolean;
  setTableExpanded: (value: boolean) => void;
  INITIAL_ROW_LIMIT: number;
  columns: string[];
  columnWidths: Record<string, number>;
  isEditing: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  highlightAtPath: (text: string, currentPath: string) => ReactNode;
  onRemoveColumn?: (path: Array<string | number>, columnName: string) => void;
  checkColumnNewlyAdded: (columnName: string) => boolean;
  handleResizeStart: (columnKey: string, e: React.MouseEvent) => void;
  showCommentColumn: boolean;
  showStatusColumn: boolean;
  onAddColumn?: (path: Array<string | number>, columnName: string, defaultValue?: unknown) => void;
  showAddColumn: boolean;
  setShowAddColumn: (value: boolean) => void;
  newColumnName: string;
  setNewColumnName: (value: string) => void;
  columnNameInputRef: React.RefObject<HTMLInputElement | null>;
  handleAddColumn: () => void;
  control: any;
  setValue: UseFormSetValue<NewColumnFormValues>;
  onRemoveRow?: (path: Array<string | number>, index: number) => void;
  commentOnlyMode: boolean;
  checkRowNewlyAdded: (rowIndex: number) => boolean;
  isSerialNumberColumn: (columnName: string) => boolean;
  shouldEnableComments: boolean;
  actualDataWithoutChangeValue: any;
  userRole?: TableRendererProps["userRole"];
  rootData?: any;
  onRootDataChange?: (data: any) => void;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  onValueChange: (path: Array<string | number>, newVal: any) => void;
  matchedPaths?: string[];
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  getComments?: (fieldPath: string) => Comment[];
  onAddComment: (fieldPath: string, comment: string, userId: string) => void;
  userId: string;
  newRowRef: React.RefObject<HTMLTableRowElement | null>;
  parentPath: string;
  onAddRow?: (path: Array<string | number>) => void;
  handleAddRowClick: () => void;
  showAddRowModal: boolean;
  handleCancelAddRow: () => void;
  handleConfirmAddRow: () => void;
  fieldTypesForm: ReturnType<typeof useForm<Record<string, FieldType>>>;
  fieldTypes: Record<string, FieldType>;
};

function TableRendererMainView(props: TableRendererMainViewProps) {
  const {
    path, data, visibleRows, hasMoreRows, tableExpanded, setTableExpanded, INITIAL_ROW_LIMIT,
    columns, columnWidths, isEditing, searchText, activeMatchPath, highlightAtPath,
    onRemoveColumn, checkColumnNewlyAdded, handleResizeStart, showCommentColumn,
    showStatusColumn, onAddColumn, showAddColumn, setShowAddColumn, newColumnName,
    setNewColumnName, columnNameInputRef, handleAddColumn, control, setValue,
    onRemoveRow, commentOnlyMode, checkRowNewlyAdded, isSerialNumberColumn,
    shouldEnableComments, actualDataWithoutChangeValue, userRole, rootData,
    onRootDataChange, onSourceClick, onValueChange, matchedPaths, fieldStatus,
    onFieldStatusChange, getComments, onAddComment, userId, newRowRef, parentPath,
    onAddRow, handleAddRowClick, showAddRowModal, handleCancelAddRow,
    handleConfirmAddRow, fieldTypesForm, fieldTypes,
  } = props;
  return (
    <div
      className="relative w-full min-w-0 space-y-3"
      data-component-name="TableRenderer"
      data-path={buildCellFieldPath(path) || undefined}
    >
      {/* Debug: Component name label */}
      {/* <div className="flex items-center gap-2 px-2 py-1">
        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          TableRenderer
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          Path: {path.map((part, idx) => {
            if (typeof part === "number") {
              return `[${part}]`;
            }
            return idx === 0 ? String(part) : `.${String(part)}`;
          }).join("")}
        </span>
        {searchText && (
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
            (() => {
              const tablePathStr = path.map((part, idx) => {
                if (typeof part === "number") {
                  return `[${part}]`;
                }
                return idx === 0 ? String(part) : `.${String(part)}`;
              }).join("");
              const hasMatch = matchedPaths.some(p => p.startsWith(tablePathStr + "["));
              const hasActiveMatch = activeMatchPath && activeMatchPath.startsWith(tablePathStr + "[");
              if (hasActiveMatch) {
                return "bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300";
              } else if (hasMatch) {
                return "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
              }
              return "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
            })()
          }`}>
            {(() => {
              const tablePathStr = path.map((part, idx) => {
                if (typeof part === "number") {
                  return `[${part}]`;
                }
                return idx === 0 ? String(part) : `.${String(part)}`;
              }).join("");
              const hasMatch = matchedPaths.some(p => p.startsWith(tablePathStr + "["));
              const hasActiveMatch = activeMatchPath && activeMatchPath.startsWith(tablePathStr + "[");
              if (hasActiveMatch) return "✓ ACTIVE";
              if (hasMatch) return "✓ MATCH";
              return "✗ NO";
            })()}
          </span>
        )}
      </div> */}
      <StopPropagationContainer
        className="dark:border-dark-600 dark:bg-dark-800 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="group dark:from-dark-700 dark:to-dark-750 bg-gradient-to-r from-gray-50 to-gray-100">
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    width: columnWidths[col]
                      ? `${columnWidths[col]}px`
                      : "auto",
                    minWidth: columnWidths[col]
                      ? `${columnWidths[col]}px`
                      : "150px",
                    position: "relative",
                    lineHeight: "1.25",
                  }}
                  className="group dark:border-dark-500 relative border-b-2 border-gray-300 px-2 py-1 text-left text-[10px] font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {searchText
                        ? highlightAtPath(
                            formatKey(col),
                            `${path.join(".")}.${col}`,
                          )
                        : formatKey(col)}
                    </span>
                    {isEditing && onRemoveColumn && checkColumnNewlyAdded(col) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(`Remove column "${formatKey(col)}"?`)
                          ) {
                            onRemoveColumn(path, col);
                          }
                        }}
                        className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded text-red-600 opacity-60 transition-all group-hover:opacity-100 hover:bg-red-100 hover:opacity-100 dark:hover:bg-red-900/30"
                        title="Remove Column"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Resize handle */}
                  <ColumnResizeHandle
                    columnKey={col}
                    onResizeStart={handleResizeStart}
                  />
                </th>
              ))}
              {/* Comment column header - one per row */}
              {shouldEnableComments && (
                <th
                  style={{
                    width: columnWidths["_comment"]
                      ? `${columnWidths["_comment"]}px`
                      : "auto",
                    minWidth: columnWidths["_comment"]
                      ? `${columnWidths["_comment"]}px`
                      : "200px",
                    position: "relative",
                  }}
                  className="dark:border-dark-500 border-b-2 border-gray-300 px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
                >
                  <span className="text-xs">Comment</span>
                  {/* Resize handle */}
                  <ColumnResizeHandle
                    columnKey="_comment"
                    onResizeStart={handleResizeStart}
                  />
                </th>
              )}
              {/* Status column header - conditionally show */}
              {showStatusColumn && (
                <th
                  style={{
                    width: columnWidths["_status"]
                      ? `${columnWidths["_status"]}px`
                      : "auto",
                    minWidth: columnWidths["_status"]
                      ? `${columnWidths["_status"]}px`
                      : "150px",
                    position: "relative",
                  }}
                  className="dark:border-dark-500 border-b-2 border-gray-300 px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
                >
                  <span className="text-xs">Status</span>
                  {/* Resize handle */}
                  <ColumnResizeHandle
                    columnKey="_status"
                    onResizeStart={handleResizeStart}
                  />
                </th>
              )}
              {isEditing && (onRemoveRow || onAddColumn) && (
                <th
                  className={`dark:border-dark-500 relative z-20 border-b-2 border-gray-300 bg-white px-4 py-3 text-left text-xs font-bold tracking-wider text-gray-700 uppercase dark:bg-dark-800 dark:text-gray-300`}
                >
                  <div className="relative z-20 flex items-center gap-2">
                    <span className="text-xs">Actions</span>
                    {onAddColumn && !showAddColumn && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddColumn(true);
                        }}
                        className="relative z-20 ml-1 flex h-6 cursor-pointer items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        title="Add Column"
                      >
                        <PlusIcon className="h-3 w-3" />
                        <span>Column</span>
                      </button>
                    )}
                    {showAddColumn && (
                      <div className="relative z-10 flex items-center gap-1.5">
                        <input
                          ref={columnNameInputRef}
                          type="text"
                          value={newColumnName}
                          onChange={(e) => setNewColumnName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddColumn();
                            } else if (e.key === "Escape") {
                              setShowAddColumn(false);
                              setNewColumnName("");
                              setValue("newColumnType", "string");
                            }
                          }}
                          placeholder="Column name"
                          className="form-input dark:border-dark-450 dark:bg-dark-800 dark:focus:border-primary-500 h-7 w-24 rounded border border-gray-300 text-xs focus:border-primary-600 hover:border-gray-400 dark:hover:border-dark-400"
                          autoFocus
                        />
                        <div className="w-28">
                          <DropdownSelect
                            name="newColumnType"
                            name_key="newColumnType"
                            control={control}
                            options={[
                              { label: "String", value: "string" },
                              { label: "Number", value: "number" },
                              { label: "Boolean", value: "boolean" },
                              { label: "Array", value: "array" },
                              { label: "Object", value: "object" },
                            ]}
                            menuPlacement="auto"
                            onMenuClose={() => {
                              // Refocus column name so it doesn't stay "frozen" after selecting type
                              setTimeout(
                                () => columnNameInputRef.current?.focus(),
                                0,
                              );
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddColumn}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500 text-white transition-colors hover:bg-green-600"
                          title="Add"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddColumn(false);
                            setNewColumnName("");
                            setValue("newColumnType", "string");
                          }}
                          className="dark:border-dark-600 dark:bg-dark-800 flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="dark:divide-dark-600 dark:bg-dark-800 divide-y divide-gray-200 bg-white">
            {visibleRows.map((row, visibleIndex) => {
              // Calculate actual row index in the data array
              // If table is expanded, visibleRows = data, so visibleIndex matches actual index
              // If collapsed, visibleRows = data.slice(0, INITIAL_ROW_LIMIT), so visibleIndex is 0-4 but actual index is also 0-4
              // So rowIndex is always visibleIndex (which is the actual index in both cases)
              const rowIndex = visibleIndex;
              // For serial numbers, we want to show 1-based position in visible list
              const serialNumber = visibleIndex + 1;
              // Define editable outside columns.map so it's accessible in status column
              const editable = isEditing && !commentOnlyMode;
              const isLastRow =
                visibleIndex === visibleRows.length - 1 &&
                data.length > INITIAL_ROW_LIMIT;

              // Resolve row PDF sources from actualData (formState rows have sources stripped)
              const rowFieldPath = buildCellFieldPath([...path, rowIndex]);
              const rowSources = resolveRowSources(
                rootData,
                rowFieldPath,
                row,
                actualDataWithoutChangeValue,
              );
              const hasRowSourceWithPage = hasSourceWithPage(rowSources);
              const rowSourceWithPage = findSourceWithPage(rowSources);

              return (
                <tr
                  key={rowIndex}
                  ref={isLastRow ? newRowRef : null}
                  className={`group transition-colors ${
                    hasRowSourceWithPage
                      ? "cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      : "dark:hover:bg-dark-700/50 hover:bg-blue-50/50"
                  }`}
                  onMouseDown={(e) => {
                    // Stop propagation on table rows to prevent accordion collapse
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    // Check if clicking on interactive elements - don't navigate if so
                    const target = e.target as HTMLElement;
                    const isInteractive =
                      target.closest("button") ||
                      target.closest("input") ||
                      target.closest("textarea") ||
                      target.closest("select") ||
                      target.closest("a") ||
                      target.tagName === "BUTTON" ||
                      target.tagName === "INPUT" ||
                      target.tagName === "TEXTAREA" ||
                      target.tagName === "SELECT" ||
                      target.tagName === "A";

                    // If clicking on interactive element, don't navigate
                    if (isInteractive) {
                      e.stopPropagation();
                      return;
                    }

                    // If row has sources with page_number, open PDF viewer
                    if (
                      hasRowSourceWithPage &&
                      rowSourceWithPage &&
                      onSourceClick
                    ) {
                      e.stopPropagation();
                      e.preventDefault();
                      onSourceClick(rowSourceWithPage);
                      return;
                    }

                    // Otherwise, just stop propagation to prevent accordion collapse
                    e.stopPropagation();
                  }}
                  title={
                    hasRowSourceWithPage && rowSourceWithPage
                      ? `Click to open page ${rowSourceWithPage.page_number} in PDF viewer`
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <TableRendererCell
                      key={col}
                      col={col}
                      row={row}
                      rowIndex={rowIndex}
                      path={path}
                      data={data}
                      columnWidths={columnWidths}
                      serialNumber={serialNumber}
                      editable={editable}
                      isRowNewlyAdded={checkRowNewlyAdded}
                      isSerialNumberColumn={isSerialNumberColumn}
                      commentOnlyMode={commentOnlyMode}
                      shouldEnableComments={shouldEnableComments}
                      actualDataWithoutChangeValue={actualDataWithoutChangeValue}
                      userRole={userRole}
                      rootData={rootData}
                      onRootDataChange={onRootDataChange}
                      onSourceClick={onSourceClick}
                      onValueChange={onValueChange}
                      searchText={searchText}
                      activeMatchPath={activeMatchPath}
                      matchedPaths={matchedPaths}
                      isEditing={isEditing}
                      shouldEnableStatus={showStatusColumn}
                      fieldStatus={fieldStatus}
                      onFieldStatusChange={onFieldStatusChange}
                      getComments={getComments}
                      onAddComment={onAddComment}
                      userId={userId}
                      AutoResizeTextarea={AutoResizeTextarea}
                      LimitPeriodRenderer={LimitPeriodRenderer}
                      ConditionsArrayRenderer={ConditionsArrayRenderer}
                    />
                  ))}
                  {/* Comment column per row - always show when enabled */}
                  {showCommentColumn && (
                    <td
                      style={{
                        width: columnWidths["_comment"]
                          ? `${columnWidths["_comment"]}px`
                          : "200px",
                        minWidth: columnWidths["_comment"]
                          ? `${columnWidths["_comment"]}px`
                          : "200px",
                        lineHeight: "1.25",
                      }}
                      className="dark:border-dark-500 border-b border-gray-200 px-2 py-0.5"
                    >
                      <FieldCommentButton
                        fieldPath={`${parentPath}[${rowIndex}]`}
                        comments={
                          getComments
                            ? getComments(`${parentPath}[${rowIndex}]`)
                            : []
                        }
                        onAddComment={onAddComment}
                        userId={userId}
                        userRole={userRole}
                      />
                    </td>
                  )}
                  {/* Status column per row - always show when enabled */}
                  {showStatusColumn && (
                    <td
                      style={{
                        width: columnWidths["_status"]
                          ? `${columnWidths["_status"]}px`
                          : "150px",
                        minWidth: columnWidths["_status"]
                          ? `${columnWidths["_status"]}px`
                          : "150px",
                        lineHeight: "1.25",
                      }}
                      className="dark:border-dark-500 border-b border-gray-200 px-2 py-0.5"
                    >
                      <FieldStatusDropdown
                        fieldPath={`${parentPath}[${rowIndex}]`}
                        status={
                          (fieldStatus[`${parentPath}[${rowIndex}]`] as
                            | "approved"
                            | "approve_with_pendency"
                            | "rejected"
                            | "reverse_to_maker"
                            | null) || null
                        }
                        onStatusChange={onFieldStatusChange || (() => {})}
                        userRole={userRole}
                        isEditing={isEditing}
                      />
                    </td>
                  )}
                  {isEditing && onRemoveRow && checkRowNewlyAdded(rowIndex) && (
                    <td className="dark:border-dark-500 border-b border-gray-200 px-2 py-0.5">
                      <Button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to remove row ${rowIndex + 1}?`,
                            )
                          ) {
                            onRemoveRow(path, rowIndex);
                          }
                        }}
                        variant="flat"
                        className="h-7 w-7 rounded border border-red-300 bg-red-50 p-0 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                        title="Remove Row"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          {/* See more/less button in table footer - same line */}
          {hasMoreRows && (
            <tfoot>
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showCommentColumn ? 1 : 0) +
                    (showStatusColumn ? 1 : 0) +
                    (isEditing && (onRemoveRow || onAddColumn) ? 1 : 0)
                  }
                  className="border-t border-gray-200 px-2 py-1 text-center text-[10px]"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTableExpanded(!tableExpanded);
                    }}
                    className="text-primary-600 dark:text-primary-400 text-[10px] font-medium hover:underline"
                  >
                    {tableExpanded
                      ? `See less (show first ${INITIAL_ROW_LIMIT} rows)`
                      : `See more (show all ${data.length} rows)`}
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </StopPropagationContainer>
      {isEditing && onAddRow && (
        <div className="dark:border-dark-600 dark:bg-dark-800 flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{data.length}</span> row
            {data.length === 1 ? "" : "s"} in table
          </div>
          <Button
            type="button"
            onClick={handleAddRowClick}
            variant="outlined"
            className="border-primary-500 text-primary-600 hover:bg-primary-50 dark:border-primary-500 dark:bg-dark-800 dark:text-primary-400 dark:hover:bg-primary-900/30 flex items-center gap-2 bg-white"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="font-medium">Add New Row</span>
          </Button>
        </div>
      )}

      {/* Popup for selecting field types when adding new row */}
      {showAddRowModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="dark:bg-dark-800 border-primary-300 dark:border-primary-700 flex max-h-[60vh] w-[450px] flex-col overflow-hidden rounded-lg border-2 bg-white shadow-2xl">
            {/* Header */}
            <div className="dark:border-dark-600 dark:from-dark-700 dark:to-dark-750 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary-100 dark:bg-primary-900/30 flex h-8 w-8 items-center justify-center rounded-lg">
                    <PlusIcon className="text-primary-600 dark:text-primary-400 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Configure New Row
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Select field type for each column.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelAddRow}
                  className="dark:hover:bg-dark-700 flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[300px] overflow-y-auto p-3">
              <div className="grid grid-cols-4 gap-2.5">
                {columns.map((col, index) => {
                  // Get field type from form, fallback to fieldTypes state
                  const formFieldType = fieldTypesForm.watch(col);
                  const fieldType =
                    formFieldType || fieldTypes[col] || "normal";
                  const getDescription = (type: string) => {
                    switch (type) {
                      case "list":
                        return "Multiple values as a bulleted list";
                      case "boolean":
                        return "True/False checkbox";
                      case "number":
                        return "Numeric value";
                      default:
                        return "Single text value";
                    }
                  };

                  return (
                    <div
                      key={col}
                      className="group dark:border-dark-600 dark:bg-dark-800 hover:border-primary-300 dark:hover:border-primary-700 relative rounded-lg border border-gray-200 bg-white p-2 transition-all"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="dark:bg-dark-700 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                            {index + 1}
                          </span>
                          <label className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {formatKey(col)}
                          </label>
                        </div>
                        <DropdownSelect
                          name={col}
                          name_key={col}
                          control={fieldTypesForm.control}
                          options={[
                            { label: "📝 Text", value: "normal" },
                            { label: "🔢 Number", value: "number" },
                            { label: "✓ Boolean", value: "boolean" },
                            { label: "📋 List", value: "list" },
                          ]}
                          menuPlacement="auto"
                        />
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {getDescription(fieldType)}
                        </p>
                        {/* Preview / default hint */}
                        {fieldType === "normal" && (
                          <div className="rounded-md border border-blue-200 bg-blue-50 p-1.5 dark:border-blue-800 dark:bg-blue-900/20">
                            <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300">
                              Preview: text field
                            </p>
                          </div>
                        )}
                        {fieldType === "boolean" && (
                          <div className="rounded-md border border-green-200 bg-green-50 p-1.5 dark:border-green-800 dark:bg-green-900/20">
                            <p className="text-[10px] font-medium text-green-700 dark:text-green-300">
                              Preview: ✓ Checkbox
                            </p>
                          </div>
                        )}
                        {fieldType === "number" && (
                          <div className="rounded-md border border-purple-200 bg-purple-50 p-1.5 dark:border-purple-800 dark:bg-purple-900/20">
                            <p className="text-[10px] font-medium text-purple-700 dark:text-purple-300">
                              Preview: 0 (Numeric)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-600 dark:bg-dark-800/50 border-t border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {columns.length} field{columns.length === 1 ? "" : "s"}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCancelAddRow}
                    variant="outlined"
                    className="dark:border-dark-600 dark:hover:bg-dark-700 border-gray-300 px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmAddRow}
                    className="bg-primary-600 hover:bg-primary-700 px-4 py-1.5 text-xs text-white shadow-md transition-all hover:shadow-lg"
                  >
                    <PlusIcon className="mr-1.5 h-3 w-3" />
                    Add Row
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

TableRenderer.displayName = "TableRenderer";
