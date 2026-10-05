// Search working
import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { FieldProps } from "./types";
import {
  valueToString,
  parseInputString,
  formatKey,
  detectDataType,
  parseKeyValuePair,
} from "./utils";
import { useKeycloakUser } from "@/hooks/useKeycloakUser";
import { Comment } from "@/hooks/useComments";
import { createSearchHighlighter } from "./textHighlightHelpers";
import {
  resolveFieldSources,
  computeTextWrapsToMultipleLines,
  scheduleTextWrapCheck,
  observeElementResize,
  isDebugSourceFieldPath,
  markSourceClickTarget,
} from "./fieldHelpers";
import {
  FieldContentRouter,
  type FieldCommentStatusProps,
  type FieldRenderSharedProps,
} from "./fieldRenderHelpers";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function AutoResizeTextarea({
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  className,
  label,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const adjustSize = useCallback(() => {
    const textarea = textareaRef.current;
    const measure = measureRef.current;
    if (textarea && measure) {
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

      measure.textContent = value || "M";
      const contentWidth = measure.offsetWidth;

      const minWidth = 100;
      const contentBasedWidth = Math.max(minWidth, contentWidth + 2);
      textarea.style.minWidth = `${contentBasedWidth}px`;
      textarea.style.width = "100%";

      measure.style.width = `${contentBasedWidth}px`;
      measure.textContent = value || "M";
      const contentHeight = measure.offsetHeight;

      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(2.5 * 16, Math.max(contentHeight, scrollHeight))}px`;
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      setTimeout(adjustSize, 0);
    },
    [onChange, adjustSize],
  );

  useEffect(() => {
    adjustSize();
  }, [adjustSize]);

  return (
    <>
      <div
        ref={measureRef}
        className="invisible absolute -top-[9999px] -left-[9999px] text-xs break-words whitespace-pre-wrap"
        data-component-name="Field"
        data-field-label={label}
        style={{
          fontFamily: "inherit",
          padding: "0.25rem 0.5rem",
          border: "1px solid transparent",
          width: "auto",
          maxWidth: "100%",
        }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className={className || ""}
        style={{
          minHeight: "2.5rem",
          overflowY: "visible",
          overflowX: "visible",
          resize: "both",
          width: "auto",
          boxSizing: "border-box",
          display: "inline-block",
        }}
      />
    </>
  );
}

const MIN_CHAR_FOR_SEE_MORE = 100;

export default function Field({
  label,
  value,
  searchText,
  activeMatchPath,
  status: _status,
  actualDataWithoutChangeValue,
  editable,
  onChange,
  error,
  commentOnlyMode = false,
  fieldPath,
  rootData,
  onSourceClick,
  comments = [],
  onAddComment,
  fieldStatus,
  onStatusChange,
  userId: userIdProp,
  shouldEnableComments = false,
  shouldEnableStatus = false,
  userRole,
}: FieldProps) {
  const keycloakUser = useKeycloakUser();
  const userId = userIdProp || keycloakUser.userId || "unknown";

  const normalizedComments: Comment[] = useMemo(
    () =>
      (comments || []).map((c) => ({
        ...c,
        userRole: typeof c?.userRole === "string" ? c.userRole : "",
      })),
    [comments],
  );

  const highlightText = useMemo(
    () => createSearchHighlighter(searchText, fieldPath, activeMatchPath),
    [searchText, fieldPath, activeMatchPath],
  );

  const renderHighlightedLabel = useCallback(() => {
    const formattedLabel = formatKey(label);
    const labelLower = label.toLowerCase();
    const formattedLabelLower = formattedLabel.toLowerCase();
    const searchLower = searchText?.toLowerCase().trim() || "";

    const labelMatches =
      searchText &&
      (labelLower.includes(searchLower) ||
        formattedLabelLower.includes(searchLower));

    if (labelMatches) {
      return highlightText(formattedLabel);
    }

    return formattedLabel;
  }, [label, searchText, highlightText]);

  const sources = useMemo(
    () =>
      resolveFieldSources(
        rootData,
        fieldPath,
        value,
        actualDataWithoutChangeValue,
      ),
    [rootData, fieldPath, value, actualDataWithoutChangeValue],
  );

  const isBool = typeof value === "boolean";
  const isNum = typeof value === "number";
  const isObj =
    typeof value === "object" && value !== null && !Array.isArray(value);

  const dataType = detectDataType(value);
  const keyValuePair =
    typeof value === "string" ? parseKeyValuePair(value) : null;

  const displayValue =
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    value._value !== undefined
      ? value._value
      : value;

  const isFieldEditable = editable && !commentOnlyMode;

  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [shouldShowSeeMore, setShouldShowSeeMore] = useState(false);

  const handleSourceClick = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        const target = e.target as HTMLElement;
        if (
          target.closest("[data-comment-button]") ||
          target.closest("[data-comment-area]") ||
          target.closest("button[data-comment-button]") ||
          target.closest(".comment-area") ||
          target.closest("[data-field-comment]")
        ) {
          e.stopPropagation();
          return;
        }
      }

      if (sources && sources.length > 0 && onSourceClick) {
        const sourceWithPage = (sources as Array<{ page_number?: number }>).find(
          (s) => s.page_number,
        );
        if (sourceWithPage) {
          onSourceClick(sourceWithPage);
        }
      }
    },
    [sources, onSourceClick],
  );

  const handleSourceItemClick = useCallback(
    (e: React.MouseEvent) => {
      if (sources?.some((s) => (s as { page_number?: number }).page_number)) {
        markSourceClickTarget(e);
      } else {
        e.stopPropagation();
      }
      handleSourceClick(e);
    },
    [handleSourceClick, sources],
  );

  const handleExpandToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  const handleBoolChange = useCallback(
    (newValue: string) => {
      onChange(parseInputString(value, newValue));
    },
    [value, onChange],
  );

  const handleNumberChange = useCallback(
    (newValue: string) => {
      const parsedValue = parseInputString(value, newValue);
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "_comment" in value
      ) {
        onChange({ ...(value as Record<string, unknown>), _value: parsedValue });
      } else {
        onChange(parsedValue);
      }
    },
    [value, onChange],
  );

  const handleObjectChange = useCallback(
    (newValue: string) => {
      onChange(parseInputString(value, newValue));
    },
    [value, onChange],
  );

  const handleKeyValueChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  const handleImageChange = useCallback(
    (newValue: string) => {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        value._comment !== undefined
      ) {
        onChange({ ...value, _value: newValue });
      } else {
        onChange(newValue);
      }
    },
    [value, onChange],
  );

  const handleStringChange = useCallback(
    (newValue: string) => {
      const parsedValue = parseInputString(displayValue, newValue);
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        value._comment !== undefined
      ) {
        onChange({ ...value, _value: parsedValue });
      } else {
        onChange(parsedValue);
      }
    },
    [displayValue, value, onChange],
  );

  const handleNullChange = useCallback(
    (newValue: string) => {
      onChange(newValue === "" ? null : newValue);
    },
    [onChange],
  );

  const runTextWrapCheck = useCallback(() => {
    if (!textRef.current || !measureRef.current) return;
    const wraps = computeTextWrapsToMultipleLines(
      textRef.current,
      measureRef.current,
      valueToString(displayValue),
    );
    setShouldShowSeeMore(wraps);
  }, [displayValue]);

  const measureTextWrap = useCallback(() => {
    if (!editable && textRef.current && measureRef.current) {
      const text = valueToString(displayValue);

      if (typeof text !== "string" || text.length <= MIN_CHAR_FOR_SEE_MORE) {
        setShouldShowSeeMore(false);
        return;
      }

      scheduleTextWrapCheck(runTextWrapCheck);

      const parentElement = textRef.current.parentElement;
      if (typeof ResizeObserver !== "undefined" && parentElement) {
        return observeElementResize(parentElement, () => {
          scheduleTextWrapCheck(runTextWrapCheck);
        });
      }
    } else {
      setShouldShowSeeMore(false);
    }
  }, [editable, displayValue, runTextWrapCheck]);

  useEffect(() => {
    measureTextWrap();
  }, [measureTextWrap]);

  const sourceTitle = useMemo(() => {
    const typedSources = sources as Array<{ page_number?: number }> | null;
    if (
      typedSources &&
      typedSources.length > 0 &&
      typedSources.some((s) => s.page_number)
    ) {
      const pageNumber = typedSources.find((s) => s.page_number)?.page_number;
      return `Click to open page ${pageNumber} in PDF viewer`;
    }
    return undefined;
  }, [sources]);

  const hasSourcePage = useMemo(() => {
    const typedSources = sources as Array<{ page_number?: number }> | null;
    const hasPage = Boolean(typedSources?.some((s) => s?.page_number));
    if (
      isDebugSourceFieldPath(fieldPath) ||
      (fieldPath?.includes("conditions") &&
        fieldPath.includes("modern_and_advanced_treatments"))
    )
    return hasPage;
  }, [sources, fieldPath, onSourceClick]);

  const sourceClickClassName = useMemo(
    () =>
      hasSourcePage
        ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        : "",
    [hasSourcePage],
  );

  const containerHoverClassName = useMemo(
    () =>
      sources && sources.length > 0
        ? "cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
        : "",
    [sources],
  );

  const handleSourceButtonClick = useCallback(
    (source: { page_number?: number; snippet?: string }) =>
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (source.page_number && onSourceClick) {
          onSourceClick(source);
        }
      },
    [onSourceClick],
  );

  const inputBaseClassName =
    "focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:ring-1 focus:outline-none dark:text-gray-100";
  const inputDisabledClassName = "cursor-not-allowed opacity-50";

  const commentStatusProps: FieldCommentStatusProps = {
    fieldPath,
    shouldEnableComments,
    shouldEnableStatus,
    normalizedComments,
    onAddComment,
    userId,
    userRole,
    fieldStatus: fieldStatus ?? null,
    onStatusChange,
    isFieldEditable,
  };

  const sharedProps: FieldRenderSharedProps = {
    label,
    renderHighlightedLabel,
    containerHoverClassName,
    handleSourceClick,
    handleSourceItemClick,
    sourceClickClassName,
    sourceTitle,
    hasSourcePage,
    fieldPath,
    commentStatusProps,
    error,
    inputBaseClassName,
    inputDisabledClassName,
    commentOnlyMode,
    highlightText,
    searchText,
    sources: sources as FieldRenderSharedProps["sources"],
    handleSourceButtonClick,
    onSourceClick,
  };

  return (
    <FieldContentRouter
      editable={editable}
      isBool={isBool}
      isNum={isNum}
      isObj={isObj}
      value={value}
      displayValue={displayValue}
      keyValuePair={keyValuePair}
      dataType={dataType}
      shared={sharedProps}
      readOnlyProps={{
        displayValue,
        measureRef,
        textRef,
        expanded,
        shouldShowSeeMore,
        handleExpandToggle,
      }}
      boolProps={{
        value: value as boolean,
        isFieldEditable,
        AutoResizeTextareaComponent: AutoResizeTextarea,
        handleBoolChange,
      }}
      numberProps={{
        displayValue,
        isFieldEditable,
        AutoResizeTextareaComponent: AutoResizeTextarea,
        handleNumberChange,
      }}
      objectProps={{
        value,
        isFieldEditable,
        AutoResizeTextareaComponent: AutoResizeTextarea,
        handleObjectChange,
      }}
      nullProps={{
        editable,
        isFieldEditable,
        AutoResizeTextareaComponent: AutoResizeTextarea,
        handleNullChange,
      }}
      keyValueProps={{
        value: value as string,
        keyValuePair: keyValuePair!,
        isFieldEditable,
        AutoResizeTextareaComponent: AutoResizeTextarea,
        handleKeyValueChange,
      }}
      imageProps={{
        displayValue,
        isFieldEditable,
        AutoResizeTextareaComponent: AutoResizeTextarea,
        handleImageChange,
      }}
      stringProps={{
        displayValue,
        isFieldEditable,
        AutoResizeTextareaComponent: AutoResizeTextarea,
        handleStringChange,
      }}
    />
  );
}

// Field.displayName = "Field";
