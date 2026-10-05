// Search working
import React, { useCallback, useMemo } from "react";
import { AccordionPanel } from "@/components/ui";
import AddFieldButton from "./AddFieldButton";
import { isListingArray, formatKey } from "./utils";
import { renderSectionValueContent } from "./sectionContentRendererHelpers";
import { stopAccordionTogglePropagation } from "./tableRendererHelpers";

import type { JsonAccordionUserRole } from "./types";

export interface SectionContentRendererProps {
  fieldKey: string;
  value: any;
  actualDataWithoutChangeValue: any;
  actualDataWithoutChange: any; // Full root data object with sources
  formState: any;
  isEditing: boolean;
  isMaker: boolean;
  isApproved: boolean;
  hasMakerRole: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  checkerCanAct: boolean;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  rowId?: string;
  shouldEnableComments: boolean;
  shouldEnableSectionComments?: boolean; // Control section-level comments (default: false)
  shouldEnableStatus: boolean;
  errors: any;
  flatArrayFields: Set<string>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  openPaths?: Set<string>;
  listingArrayFields?: Set<string>;
  newlyAddedFields: Set<string>;
  newlyAddedArrayItems: Set<string>;
  newlyAddedTableRows?: Set<string>;
  newlyAddedTableColumns?: Set<string>;
  onFormStateChange: (newState: any) => void;
  onSetValue: (key: string, value: any, options?: any) => void;
  onRemoveField: (key: string) => void;
  onAddFieldInObject: (
    path: Array<string | number>,
    fieldName: string,
    fieldValue: any,
  ) => void;
  onRemoveFieldInObject: (
    path: Array<string | number>,
    fieldName: string,
  ) => void;
  onConvertToObjectAndAddField: (
    key: string,
    fieldName: string,
    fieldValue: any,
  ) => void;
  onNewlyAddedArrayItemsChange: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
  onNewlyAddedTableRowsChange?: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
  onNewlyAddedTableColumnsChange?: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
  fieldStatus?: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  onAddField?: (
    fieldPath: string,
    fieldName: string,
    fieldValue: any,
    metadata?: any,
  ) => void;
  // Comment and status props
  getComments?: (fieldPath: string) => Array<any>;
  onAddComment?: (
    fieldPath: string,
    comment: string,
    userId: string,
    userRole?: JsonAccordionUserRole,
  ) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  userId?: string;
}

export default function SectionContentRenderer({
  fieldKey,
  value,
  actualDataWithoutChangeValue,
  actualDataWithoutChange,
  formState,
  isEditing,
  isMaker,
  isApproved,
  hasMakerRole,
  hasCheckerRole,
  hasBothRoles,
  checkerCanAct,
  userRole,
  rowId,
  shouldEnableComments,
  shouldEnableSectionComments = false, // Default to false - hide section-level comments
  shouldEnableStatus,
  errors,
  flatArrayFields,
  searchText,
  activeMatchPath,
  matchedPaths,
  openPaths,
  listingArrayFields,
  newlyAddedFields,
  newlyAddedArrayItems,
  newlyAddedTableRows,
  newlyAddedTableColumns,
  onFormStateChange,
  onSetValue,
  onRemoveField,
  onAddFieldInObject,
  onRemoveFieldInObject,
  onNewlyAddedArrayItemsChange,
  onNewlyAddedTableRowsChange,
  onNewlyAddedTableColumnsChange,
  fieldStatus = {},
  onFieldStatusChange,
  onSourceClick,
  onAddField,
  getComments,
  onAddComment,
  onDeleteComment,
  userId,
}: SectionContentRendererProps) {
  // Get existing field names for this section - memoized
  const existingFields = useMemo(() => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return Object.keys(value).filter((key) => !key.startsWith("_"));
    }
    return [];
  }, [value]);

  // Event handlers to prevent accordion toggle on interactive elements
  const handleClick = useCallback((e: React.MouseEvent) => {
    stopAccordionTogglePropagation(e);
  }, []);

  // Memoize array type checks
  const isListing = useMemo(() => isListingArray(value), [value]);
  const isFlatArray = useMemo(
    () =>
      flatArrayFields.has(fieldKey) ||
      listingArrayFields?.has(fieldKey) ||
      isListing,
    [fieldKey, flatArrayFields, listingArrayFields, isListing],
  );

  return (
    <AccordionPanel
      data-component-name="SectionContentRenderer"
      data-field-key={fieldKey} className="pb-4">
      {/* <div className="mb-1 flex items-center gap-1">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          SectionContentRenderer
        </span>
      </div> */}
      <div
        className="relative w-full min-w-0 p-2 pr-1"
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          boxSizing: "border-box",
          height: "auto",
          maxHeight: "none",
          minHeight: "auto",
        }}
        onClick={handleClick}
      >
        {/* Add Field Button - Show when editing and user has permission */}
        {isEditing &&
          onAddField &&
          (hasCheckerRole || hasBothRoles) &&
          checkerCanAct && (
            <div className="dark:border-dark-600 mb-4 border-b border-gray-200 pb-4">
              <AddFieldButton
                fieldPath={fieldKey}
                sectionTitle={formatKey(fieldKey)}
                onAddField={onAddField}
                existingFields={existingFields}
                buttonLabel="Add Field to Section"
                variant="outlined"
              />
            </div>
          )}
        {renderSectionValueContent({
          fieldKey,
          value,
          actualDataWithoutChangeValue,
          actualDataWithoutChange,
          formState,
          isEditing,
          isMaker,
          isApproved,
          hasMakerRole,
          hasCheckerRole,
          hasBothRoles,
          checkerCanAct,
          userRole,
          rowId,
          shouldEnableComments,
          shouldEnableSectionComments,
          shouldEnableStatus,
          errors,
          searchText,
          activeMatchPath,
          matchedPaths,
          openPaths,
          newlyAddedFields,
          newlyAddedArrayItems,
          newlyAddedTableRows,
          newlyAddedTableColumns,
          onFormStateChange,
          onSetValue,
          onRemoveField,
          onAddFieldInObject,
          onRemoveFieldInObject,
          onNewlyAddedArrayItemsChange,
          onNewlyAddedTableRowsChange,
          onNewlyAddedTableColumnsChange,
          fieldStatus,
          onFieldStatusChange,
          onSourceClick,
          onAddField,
          getComments,
          onAddComment,
          onDeleteComment,
          userId,
          isFlatArray,
        })}
      </div>
    </AccordionPanel>
  );
}

SectionContentRenderer.displayName = "SectionContentRenderer";
