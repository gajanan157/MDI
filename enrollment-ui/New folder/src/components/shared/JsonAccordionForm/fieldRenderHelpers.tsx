import type { MouseEvent, ReactNode } from "react";
import { formatKey, valueToString } from "./utils";
import { renderErrorContent, markSourceClickTarget, buildPdfSourceTitle } from "./fieldHelpers";
import FieldCommentButton from "./FieldCommentButton";
import FieldStatusDropdown from "./FieldStatusDropdown";
import type { Comment } from "@/hooks/useComments";
import type { FieldApprovalStatus } from "./types";

type SourceItem = { page_number?: number; snippet?: string };

function SourceClickableDisplay({
  displayText,
  sourceClickClassName,
  sourceTitle,
  pageNumber,
  isFieldEditable,
  handleSourceItemClick,
  highlightText,
  onStartEditing,
}: {
  displayText: string;
  sourceClickClassName: string;
  sourceTitle?: string;
  pageNumber?: number;
  isFieldEditable: boolean;
  handleSourceItemClick: (e: React.MouseEvent) => void;
  highlightText: (text: string) => ReactNode;
  onStartEditing: () => void;
}) {
  const title = buildPdfSourceTitle(pageNumber, {
    baseTitle: sourceTitle,
    editHint: isFieldEditable,
  });

  return (
    <div
      className={`rounded px-1 py-0.5 text-xs break-words whitespace-pre-wrap text-gray-900 dark:text-gray-100 ${sourceClickClassName}`}
      onClick={handleSourceItemClick}
      onMouseDown={markSourceClickTarget}
      onDoubleClick={
        isFieldEditable
          ? (e) => {
              e.stopPropagation();
              onStartEditing();
            }
          : undefined
      }
      title={title}
      data-source-button
      data-page-number={pageNumber}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSourceItemClick(e as unknown as MouseEvent);
        }
      }}
    >
      {highlightText(displayText)}
    </div>
  );
}

function SourceNavigableFieldValue({
  hasSourcePage,
  isFieldEditable,
  displayText,
  sourceClickClassName,
  sourceTitle,
  pageNumber,
  handleSourceItemClick,
  highlightText,
  AutoResizeTextareaComponent,
  inputValue,
  onInputChange,
  inputClassName,
  commentOnlyMode,
}: {
  hasSourcePage: boolean;
  isFieldEditable: boolean;
  displayText: string;
  sourceClickClassName: string;
  sourceTitle?: string;
  pageNumber?: number;
  handleSourceItemClick: (e: React.MouseEvent) => void;
  highlightText: (text: string) => ReactNode;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  inputValue: string;
  onInputChange: (value: string) => void;
  inputClassName: string;
  commentOnlyMode: boolean;
}) {
  if (commentOnlyMode) {
    return (
      <div
        className={`py-1 text-xs text-gray-900 dark:text-gray-100 ${sourceClickClassName}`}
        onClick={handleSourceItemClick}
        onMouseDown={hasSourcePage ? markSourceClickTarget : undefined}
        title={sourceTitle}
        data-source-button={hasSourcePage ? true : undefined}
        data-page-number={pageNumber}
      >
        {highlightText(displayText)}
      </div>
    );
  }

  if (isFieldEditable) {
    return (
      <AutoResizeTextareaComponent
        value={inputValue}
        onChange={onInputChange}
        className={inputClassName}
      />
    );
  }

  if (hasSourcePage) {
    return (
      <SourceClickableDisplay
        displayText={displayText}
        sourceClickClassName={sourceClickClassName}
        sourceTitle={sourceTitle}
        pageNumber={pageNumber}
        isFieldEditable={false}
        handleSourceItemClick={handleSourceItemClick}
        highlightText={highlightText}
        onStartEditing={() => {}}
      />
    );
  }

  return (
    <div className="py-1 text-xs text-gray-900 dark:text-gray-100">
      {highlightText(displayText)}
    </div>
  );
}

interface AutoResizeTextareaComponentProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

type AutoResizeTextareaComponent = (
  props: AutoResizeTextareaComponentProps,
) => React.JSX.Element;

export interface FieldCommentStatusProps {
  fieldPath?: string;
  shouldEnableComments?: boolean;
  shouldEnableStatus?: boolean;
  normalizedComments: Comment[];
  onAddComment?: (fieldPath: string, comment: string) => void;
  userId: string;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  fieldStatus?: FieldApprovalStatus | null;
  onStatusChange?: (
    fieldPath: string,
    status: FieldApprovalStatus | null,
  ) => void;
  isFieldEditable: boolean;
  requireOnAddComment?: boolean;
  className?: string;
}

export function FieldCommentStatusSection({
  fieldPath,
  shouldEnableComments,
  shouldEnableStatus,
  normalizedComments,
  onAddComment,
  userId,
  userRole,
  fieldStatus,
  onStatusChange,
  isFieldEditable,
  requireOnAddComment = false,
  className = "mt-2 space-y-2",
}: FieldCommentStatusProps) {
  if (!fieldPath || (!shouldEnableComments && !shouldEnableStatus)) {
    return null;
  }

  const showComments =
    shouldEnableComments && (!requireOnAddComment || onAddComment);

  return (
    <div className={className}>
      {showComments && (
        <div>
          <FieldCommentButton
            fieldPath={fieldPath}
            comments={normalizedComments}
            onAddComment={onAddComment || (() => {})}
            userId={userId}
            userRole={userRole}
          />
        </div>
      )}
      {shouldEnableStatus && (
        <div>
          <FieldStatusDropdown
            fieldPath={fieldPath}
            status={fieldStatus || null}
            onStatusChange={onStatusChange || (() => {})}
            userRole={userRole}
            isEditing={isFieldEditable}
          />
        </div>
      )}
    </div>
  );
}

export interface FieldRenderSharedProps {
  label: string;
  renderHighlightedLabel: () => ReactNode;
  containerHoverClassName: string;
  handleSourceClick: (e?: React.MouseEvent) => void;
  handleSourceItemClick: (e: React.MouseEvent) => void;
  sourceClickClassName: string;
  sourceTitle?: string;
  hasSourcePage: boolean;
  fieldPath?: string;
  commentStatusProps: FieldCommentStatusProps;
  error?: string | boolean;
  inputBaseClassName: string;
  inputDisabledClassName: string;
  commentOnlyMode: boolean;
  highlightText: (text: string) => ReactNode;
  searchText?: string;
  sources: SourceItem[] | null;
  handleSourceButtonClick: (
    source: SourceItem,
  ) => (e: React.MouseEvent) => void;
  onSourceClick?: (source: SourceItem) => void;
}

interface ReadOnlyFieldViewProps extends FieldRenderSharedProps {
  displayValue: unknown;
  measureRef: React.RefObject<HTMLDivElement | null>;
  textRef: React.RefObject<HTMLDivElement | null>;
  expanded: boolean;
  shouldShowSeeMore: boolean;
  handleExpandToggle: (e: React.MouseEvent) => void;
}

function ReadOnlyFieldTextContent({
  text,
  fieldPath,
  textRef,
  measureRef,
  expanded,
  shouldShowSeeMore,
  sourceClickClassName,
  handleSourceItemClick,
  sourceTitle,
  hasSourcePage,
  pageNumber,
  highlightText,
  handleExpandToggle,
}: {
  text: string;
  fieldPath?: string;
  textRef: React.RefObject<HTMLDivElement | null>;
  measureRef: React.RefObject<HTMLDivElement | null>;
  expanded: boolean;
  shouldShowSeeMore: boolean;
  sourceClickClassName: string;
  handleSourceItemClick: (e: React.MouseEvent) => void;
  sourceTitle?: string;
  hasSourcePage: boolean;
  pageNumber?: number;
  highlightText: (text: string) => ReactNode;
  handleExpandToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="space-y-1">
      <div
        ref={measureRef}
        className="invisible absolute -top-[9999px] -left-[9999px] text-xs break-words whitespace-pre-wrap"
      />
      <div className="flex flex-wrap items-start gap-2">
        <div
          ref={textRef}
          data-path={fieldPath}
          className={`min-w-0 flex-1 break-words whitespace-pre-wrap ${
            !expanded && shouldShowSeeMore ? "line-clamp-1" : ""
          } ${sourceClickClassName}`}
          onClick={handleSourceItemClick}
          onMouseDown={hasSourcePage ? markSourceClickTarget : undefined}
          title={sourceTitle}
          style={{ cursor: hasSourcePage ? "pointer" : "default" }}
          role={hasSourcePage ? "button" : undefined}
          tabIndex={hasSourcePage ? 0 : undefined}
          onKeyDown={
            hasSourcePage
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSourceItemClick(e as unknown as MouseEvent);
                  }
                }
              : undefined
          }
          data-source-button={hasSourcePage ? true : undefined}
          data-page-number={pageNumber}
        >
          {highlightText(text)}
        </div>
        {shouldShowSeeMore && (
          <button
            type="button"
            onClick={handleExpandToggle}
            className="text-primary-600 dark:text-primary-400 flex-shrink-0 text-xs font-medium whitespace-nowrap hover:underline"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ReadOnlyFieldView({
  renderHighlightedLabel,
  containerHoverClassName,
  handleSourceClick,
  handleSourceItemClick,
  sourceClickClassName,
  sourceTitle,
  hasSourcePage,
  sources,
  fieldPath,
  commentStatusProps,
  displayValue,
  measureRef,
  textRef,
  expanded,
  shouldShowSeeMore,
  handleExpandToggle,
  highlightText,
  searchText: _searchText,
}: ReadOnlyFieldViewProps) {
  const text = valueToString(displayValue);
  const pageNumber = sources?.find((s) => s.page_number)?.page_number;

  return (
    <div
      className={`dark:hover:bg-dark-700 relative flex items-start gap-1.5 rounded-md py-0.5 ${
        containerHoverClassName || "hover:bg-gray-50"
      } ${hasSourcePage ? "cursor-pointer" : ""}`}
      onClick={handleSourceClick}
      onMouseDown={hasSourcePage ? markSourceClickTarget : undefined}
      data-field-path={fieldPath}
      data-source-button={hasSourcePage ? true : undefined}
      data-page-number={hasSourcePage ? pageNumber : undefined}
    >
      <div className="w-40 max-w-40 min-w-40 shrink-0 text-xs text-slate-600 dark:text-slate-400">
        {renderHighlightedLabel()} :
      </div>
      <div
        data-path={fieldPath}
        className="box-border max-w-full min-w-0 flex-1 text-xs break-words text-gray-900 dark:text-gray-100"
      >
        <ReadOnlyFieldTextContent
          text={text}
          fieldPath={fieldPath}
          textRef={textRef}
          measureRef={measureRef}
          expanded={expanded}
          shouldShowSeeMore={shouldShowSeeMore}
          sourceClickClassName={sourceClickClassName}
          handleSourceItemClick={handleSourceItemClick}
          sourceTitle={sourceTitle}
          hasSourcePage={hasSourcePage}
          pageNumber={pageNumber}
          highlightText={highlightText}
          handleExpandToggle={handleExpandToggle}
        />
        <FieldCommentStatusSection {...commentStatusProps} />
      </div>
    </div>
  );
}

interface BoolFieldViewProps extends FieldRenderSharedProps {
  value: boolean;
  isFieldEditable: boolean;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  handleBoolChange: (newValue: string) => void;
}

export function BoolFieldView({
  renderHighlightedLabel,
  containerHoverClassName,
  handleSourceClick,
  handleSourceItemClick,
  sourceClickClassName,
  sourceTitle,
  hasSourcePage,
  sources,
  highlightText,
  value,
  commentOnlyMode,
  isFieldEditable,
  AutoResizeTextareaComponent,
  handleBoolChange,
  inputBaseClassName,
  inputDisabledClassName,
  error,
  commentStatusProps,
}: BoolFieldViewProps) {
  const pageNumber = sources?.find((s) => s.page_number)?.page_number;
  const displayText = value ? "True" : "False";

  return (
    <div
      className={`relative flex items-start gap-1 py-0.5 ${containerHoverClassName}`}
      onClick={(e) => handleSourceClick(e)}
      onMouseDown={hasSourcePage ? markSourceClickTarget : undefined}
      data-source-button={hasSourcePage ? true : undefined}
      data-page-number={pageNumber}
    >
      <label className="w-40 max-w-40 min-w-40 flex-shrink-0 text-xs text-slate-600 dark:text-slate-400">
        {renderHighlightedLabel()} :
      </label>
      <div className="box-border max-w-full min-w-0 flex-1 overflow-hidden break-words">
        <SourceNavigableFieldValue
          hasSourcePage={hasSourcePage}
          isFieldEditable={isFieldEditable}
          displayText={displayText}
          sourceClickClassName={sourceClickClassName}
          sourceTitle={sourceTitle}
          pageNumber={pageNumber}
          handleSourceItemClick={handleSourceItemClick}
          highlightText={highlightText}
          AutoResizeTextareaComponent={AutoResizeTextareaComponent}
          inputValue={displayText}
          onInputChange={handleBoolChange}
          inputClassName={`${inputBaseClassName} px-1.5 py-0.5 ${
            !isFieldEditable ? inputDisabledClassName : ""
          }`}
          commentOnlyMode={commentOnlyMode}
        />
        {error && (
          <span className="mt-0.5 block text-[10px] text-red-600">
            {renderErrorContent(error)}
          </span>
        )}
        <FieldCommentStatusSection
          {...commentStatusProps}
          className="mt-1 space-y-1"
        />
      </div>
    </div>
  );
}

interface NumberFieldViewProps extends FieldRenderSharedProps {
  displayValue: unknown;
  isFieldEditable: boolean;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  handleNumberChange: (newValue: string) => void;
}

export function NumberFieldView({
  renderHighlightedLabel,
  containerHoverClassName,
  handleSourceClick,
  displayValue,
  commentOnlyMode,
  isFieldEditable,
  AutoResizeTextareaComponent,
  handleNumberChange,
  inputBaseClassName,
  inputDisabledClassName,
  sourceClickClassName,
  handleSourceItemClick,
  sourceTitle,
  hasSourcePage,
  sources,
  highlightText,
  searchText: _searchText,
  error,
  commentStatusProps,
}: NumberFieldViewProps) {
  const pageNumber = sources?.find((s) => s.page_number)?.page_number;

  return (
    <div
      className={`relative flex items-start gap-1.5 py-0.5 ${containerHoverClassName}`}
      onClick={(e) => handleSourceClick(e)}
      onMouseDown={hasSourcePage ? markSourceClickTarget : undefined}
      data-source-button={hasSourcePage ? true : undefined}
      data-page-number={pageNumber}
    >
      <label className="w-40 max-w-40 min-w-40 flex-shrink-0 text-xs text-slate-600 dark:text-slate-400">
        {renderHighlightedLabel()} :
      </label>
      <div className="box-border max-w-full min-w-0 flex-1 overflow-hidden break-words">
        {commentOnlyMode ? (
          <div
            className={`py-1 text-xs text-gray-900 dark:text-gray-100 ${sourceClickClassName}`}
            onClick={handleSourceItemClick}
            onMouseDown={hasSourcePage ? markSourceClickTarget : undefined}
            title={sourceTitle}
            data-source-button={hasSourcePage ? true : undefined}
            data-page-number={pageNumber}
          >
            {highlightText(String(displayValue))}
          </div>
        ) : (
          <SourceNavigableFieldValue
            hasSourcePage={hasSourcePage}
            isFieldEditable={isFieldEditable}
            displayText={String(displayValue)}
            sourceClickClassName={sourceClickClassName}
            sourceTitle={sourceTitle}
            pageNumber={pageNumber}
            handleSourceItemClick={handleSourceItemClick}
            highlightText={highlightText}
            AutoResizeTextareaComponent={AutoResizeTextareaComponent}
            inputValue={String(displayValue)}
            onInputChange={handleNumberChange}
            inputClassName={`${inputBaseClassName} ${
              !isFieldEditable ? inputDisabledClassName : ""
            }`}
            commentOnlyMode={false}
          />
        )}
        {error && (
          <span className="mt-1 block text-xs text-red-600">
            {renderErrorContent(error)}
          </span>
        )}
        <FieldCommentStatusSection {...commentStatusProps} />
      </div>
    </div>
  );
}

interface ObjectFieldViewProps extends FieldRenderSharedProps {
  value: unknown;
  isFieldEditable: boolean;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  handleObjectChange: (newValue: string) => void;
}

export function ObjectFieldView({
  renderHighlightedLabel,
  containerHoverClassName,
  handleSourceClick,
  value,
  commentOnlyMode,
  isFieldEditable,
  AutoResizeTextareaComponent,
  handleObjectChange,
  inputBaseClassName,
  inputDisabledClassName,
  sourceClickClassName,
  handleSourceItemClick,
  sourceTitle,
  hasSourcePage,
  sources,
  highlightText,
  error,
  commentStatusProps,
}: ObjectFieldViewProps) {
  const pageNumber = sources?.find((s) => s.page_number)?.page_number;

  return (
    <div
      className={`relative flex items-start gap-2 py-1 ${containerHoverClassName}`}
      onClick={(e) => handleSourceClick(e)}
    >
      <label className="w-40 max-w-40 min-w-40 flex-shrink-0 text-xs text-slate-600 dark:text-slate-400">
        {renderHighlightedLabel()} :
      </label>
      <div className="box-border max-w-full min-w-0 flex-1 overflow-hidden break-words">
        <SourceNavigableFieldValue
          hasSourcePage={hasSourcePage}
          isFieldEditable={isFieldEditable}
          displayText={valueToString(value)}
          sourceClickClassName={sourceClickClassName}
          sourceTitle={sourceTitle}
          pageNumber={pageNumber}
          handleSourceItemClick={handleSourceItemClick}
          highlightText={highlightText}
          AutoResizeTextareaComponent={AutoResizeTextareaComponent}
          inputValue={valueToString(value)}
          onInputChange={handleObjectChange}
          inputClassName={`${inputBaseClassName} font-mono ${
            !isFieldEditable ? inputDisabledClassName : ""
          }`}
          commentOnlyMode={commentOnlyMode}
        />
        {error && (
          <span className="mt-1 block text-xs text-red-600">
            {renderErrorContent(error)}
          </span>
        )}
        <FieldCommentStatusSection {...commentStatusProps} />
      </div>
    </div>
  );
}

interface NullFieldViewProps extends FieldRenderSharedProps {
  editable: boolean;
  isFieldEditable: boolean;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  handleNullChange: (newValue: string) => void;
}

export function NullFieldView({
  renderHighlightedLabel,
  containerHoverClassName,
  handleSourceClick,
  editable,
  AutoResizeTextareaComponent,
  handleNullChange,
  inputBaseClassName,
  error,
  commentStatusProps,
}: NullFieldViewProps) {
  return (
    <div
      className={`relative flex items-start gap-2 py-1 ${containerHoverClassName}`}
      onClick={(e) => handleSourceClick(e)}
    >
      <label className="w-40 max-w-40 min-w-40 flex-shrink-0 text-xs text-slate-600 dark:text-slate-400">
        {renderHighlightedLabel()} :
      </label>
      <div className="box-border max-w-full min-w-0 flex-1 overflow-hidden break-words">
        {editable ? (
          <AutoResizeTextareaComponent
            value=""
            onChange={handleNullChange}
            className={inputBaseClassName}
          />
        ) : (
          <span className="text-xs text-gray-400 italic dark:text-gray-500">
            —
          </span>
        )}
        {error && (
          <span className="mt-1 block text-xs text-red-600">
            {renderErrorContent(error)}
          </span>
        )}
        <FieldCommentStatusSection {...commentStatusProps} />
      </div>
    </div>
  );
}

interface KeyValueFieldViewProps extends FieldRenderSharedProps {
  value: string;
  keyValuePair: { key: string; value: string };
  isFieldEditable: boolean;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  handleKeyValueChange: (newValue: string) => void;
}

export function KeyValueFieldView({
  renderHighlightedLabel,
  containerHoverClassName,
  handleSourceClick,
  value: _value,
  keyValuePair,
  commentOnlyMode,
  isFieldEditable,
  AutoResizeTextareaComponent,
  handleKeyValueChange,
  inputBaseClassName,
  inputDisabledClassName,
  sourceClickClassName,
  handleSourceItemClick,
  sourceTitle,
  hasSourcePage,
  sources,
  highlightText,
  error,
  commentStatusProps,
}: KeyValueFieldViewProps) {
  const pageNumber = sources?.find((s) => s.page_number)?.page_number;
  const displayText = `${keyValuePair.key}: ${keyValuePair.value}`;

  return (
    <div
      className={`relative flex items-start gap-3 py-1 ${containerHoverClassName}`}
      onClick={(e) => handleSourceClick(e)}
    >
      <label className="w-80 min-w-80 text-xs text-slate-600 dark:text-slate-400">
        {renderHighlightedLabel()} :{" "}
      </label>
      <div className="box-border max-w-full min-w-0 flex-1 space-y-2 overflow-hidden">
        <SourceNavigableFieldValue
          hasSourcePage={hasSourcePage}
          isFieldEditable={isFieldEditable}
          displayText={displayText}
          sourceClickClassName={sourceClickClassName}
          sourceTitle={sourceTitle}
          pageNumber={pageNumber}
          handleSourceItemClick={handleSourceItemClick}
          highlightText={highlightText}
          AutoResizeTextareaComponent={AutoResizeTextareaComponent}
          inputValue={displayText}
          onInputChange={handleKeyValueChange}
          inputClassName={`${inputBaseClassName} ${
            !isFieldEditable ? inputDisabledClassName : ""
          }`}
          commentOnlyMode={commentOnlyMode}
        />
        {error && (
          <span className="mt-1 block text-xs text-red-600">
            {renderErrorContent(error)}
          </span>
        )}
        <FieldCommentStatusSection {...commentStatusProps} />
      </div>
    </div>
  );
}

interface ImageFieldViewProps extends FieldRenderSharedProps {
  displayValue: unknown;
  isFieldEditable: boolean;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  handleImageChange: (newValue: string) => void;
}

export function ImageFieldView({
  label,
  containerHoverClassName,
  handleSourceClick,
  displayValue,
  isFieldEditable,
  AutoResizeTextareaComponent,
  handleImageChange,
  inputBaseClassName,
  inputDisabledClassName,
  error,
  commentStatusProps,
}: ImageFieldViewProps) {
  return (
    <div
      className={`relative flex items-start gap-3 py-1 ${containerHoverClassName}`}
      onClick={(e) => handleSourceClick(e)}
    >
      <label className="w-40 min-w-40 text-xs text-slate-600 dark:text-slate-400">
        {formatKey(label)} :{" "}
      </label>
      <div className="max-w-full min-w-0 flex-1 space-y-2 overflow-hidden">
        <img
          src={String(displayValue)}
          alt={formatKey(label)}
          className="max-h-48 max-w-md rounded border border-gray-200 object-contain"
        />
        <AutoResizeTextareaComponent
          value={valueToString(displayValue)}
          onChange={handleImageChange}
          disabled={!isFieldEditable}
          className={`${inputBaseClassName} ${
            !isFieldEditable ? inputDisabledClassName : ""
          }`}
        />
        {error && (
          <span className="mt-1 block text-xs text-red-600">
            {renderErrorContent(error)}
          </span>
        )}
        <FieldCommentStatusSection {...commentStatusProps} />
      </div>
    </div>
  );
}

interface DefaultStringFieldViewProps extends FieldRenderSharedProps {
  displayValue: unknown;
  isFieldEditable: boolean;
  AutoResizeTextareaComponent: AutoResizeTextareaComponent;
  handleStringChange: (newValue: string) => void;
}

export function DefaultStringFieldView({
  renderHighlightedLabel,
  containerHoverClassName,
  handleSourceClick,
  displayValue,
  commentOnlyMode,
  isFieldEditable,
  AutoResizeTextareaComponent,
  handleStringChange,
  inputBaseClassName,
  inputDisabledClassName,
  sourceClickClassName,
  handleSourceItemClick,
  sourceTitle,
  hasSourcePage,
  highlightText,
  error,
  sources,
  handleSourceButtonClick,
  commentStatusProps,
}: DefaultStringFieldViewProps) {
  const pageNumber = sources?.find((s) => s.page_number)?.page_number;
  const displayText = valueToString(displayValue);

  return (
    <div
      className={`relative flex min-w-0 w-full flex-col gap-0 py-1 ${containerHoverClassName}`}
      onClick={(e) => handleSourceClick(e)}
      onMouseDown={hasSourcePage ? markSourceClickTarget : undefined}
      data-source-button={hasSourcePage ? true : undefined}
      data-page-number={pageNumber}
    >
      <div className="flex min-w-0 w-full items-start gap-3">
        <label className="w-40 shrink-0 text-xs text-slate-600 dark:text-slate-400">
          {renderHighlightedLabel()} :{" "}
        </label>
        <div className="box-border min-w-[calc(20rem-2px)] max-w-full flex-1 overflow-x-auto break-words">
          <div className="relative block w-full">
            <SourceNavigableFieldValue
              hasSourcePage={hasSourcePage}
              isFieldEditable={isFieldEditable}
              displayText={displayText}
              sourceClickClassName={sourceClickClassName}
              sourceTitle={sourceTitle}
              pageNumber={pageNumber}
              handleSourceItemClick={handleSourceItemClick}
              highlightText={highlightText}
              AutoResizeTextareaComponent={AutoResizeTextareaComponent}
              inputValue={displayText}
              onInputChange={handleStringChange}
              inputClassName={`${inputBaseClassName} rounded ${
                !isFieldEditable ? inputDisabledClassName : ""
              }`}
              commentOnlyMode={commentOnlyMode}
            />
          </div>
          {error && (
            <span className="mt-1 block text-xs text-red-600">
              {renderErrorContent(error)}
            </span>
          )}
          {sources && sources.length > 0 && (
            <div className="mt-2 space-y-1">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                >
                  <span className="text-gray-500 dark:text-gray-500">•</span>
                  {source.snippet && (
                    <button
                      type="button"
                      onClick={handleSourceButtonClick(source)}
                      className={`text-left hover:underline ${
                        source.page_number
                          ? "cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          : "cursor-default text-gray-600 dark:text-gray-400"
                      }`}
                      title={
                        source.page_number
                          ? `Click to open page ${source.page_number}`
                          : "No page number available"
                      }
                    >
                      {source.snippet}
                    </button>
                  )}
                  {source.page_number && (
                    <span className="whitespace-nowrap text-gray-500 dark:text-gray-500">
                      (Page {source.page_number})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <FieldCommentStatusSection
            {...commentStatusProps}
            requireOnAddComment
          />
        </div>
      </div>
    </div>
  );
}

export interface FieldContentRouterProps {
  editable: boolean;
  isBool: boolean;
  isNum: boolean;
  isObj: boolean;
  value: unknown;
  displayValue: unknown;
  keyValuePair: { key: string; value: string } | null;
  dataType: { type: string };
  shared: FieldRenderSharedProps;
  readOnlyProps: Omit<ReadOnlyFieldViewProps, keyof FieldRenderSharedProps>;
  boolProps: Omit<BoolFieldViewProps, keyof FieldRenderSharedProps>;
  numberProps: Omit<NumberFieldViewProps, keyof FieldRenderSharedProps>;
  objectProps: Omit<ObjectFieldViewProps, keyof FieldRenderSharedProps>;
  nullProps: Omit<NullFieldViewProps, keyof FieldRenderSharedProps>;
  keyValueProps: Omit<KeyValueFieldViewProps, keyof FieldRenderSharedProps>;
  imageProps: Omit<ImageFieldViewProps, keyof FieldRenderSharedProps>;
  stringProps: Omit<DefaultStringFieldViewProps, keyof FieldRenderSharedProps>;
}

export function FieldContentRouter({
  editable,
  isBool,
  isNum,
  isObj,
  value,
  keyValuePair,
  dataType,
  shared,
  readOnlyProps,
  boolProps,
  numberProps,
  objectProps,
  nullProps,
  keyValueProps,
  imageProps,
  stringProps,
}: FieldContentRouterProps) {
  if (!editable) {
    return <ReadOnlyFieldView {...shared} {...readOnlyProps} />;
  }
  if (isBool) {
    return <BoolFieldView {...shared} {...boolProps} />;
  }
  if (isNum) {
    return <NumberFieldView {...shared} {...numberProps} />;
  }
  if (isObj) {
    return <ObjectFieldView {...shared} {...objectProps} />;
  }
  if (value === null || value === undefined) {
    return <NullFieldView {...shared} {...nullProps} />;
  }
  if (keyValuePair) {
    return <KeyValueFieldView {...shared} {...keyValueProps} />;
  }
  if (dataType.type === "image") {
    return <ImageFieldView {...shared} {...imageProps} />;
  }
  return <DefaultStringFieldView {...shared} {...stringProps} />;
}
