// Search working
import { AccordionItem } from "@/components/ui";
import { getAt, setAt, deepEqual } from "./utils";
import { stopAccordionTogglePropagation } from "./tableRendererHelpers";
import AccordionSectionHeader from "./AccordionSectionHeader";
import SectionContentRenderer from "./SectionContentRenderer";

export interface AccordionSectionItemProps {
  sectionId: string;
  sectionKey: string;
  value: any;
  formState: any;
  initialData: any;
  actualDataWithoutChange: any;
  isEditing: boolean;
  editingMap: Record<string, boolean>;
  isApproved: boolean;
  rowId?: string;
  userRole?: "maker1" | "maker2" | "checker" | "superadmin" | null;
  hasMakerRole: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  checkerCanAct: boolean;
  isMaker: boolean;
  shouldEnableComments: boolean;
  shouldEnableSectionComments?: boolean; // Control section-level comments (default: false)
  shouldEnableStatus: boolean;
  errors: any;
  flatArrayFields: Set<string>;
  listingArrayFields?: Set<string>;
  newlyAddedFields: Set<string>;
  newlyAddedArrayItems: Set<string>;
  newlyAddedTableRows?: Set<string>;
  newlyAddedTableColumns?: Set<string>;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  openPaths?: Set<string>;
  onToggleEdit: (sectionId: string) => void;
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
  shouldHideSection: () => boolean;
  fieldStatus?: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  readOnly?: boolean;
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
    userRole?: "maker1" | "maker2" | "checker" | "superadmin",
  ) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  userId?: string;
}

export default function AccordionSectionItem({
  sectionId,
  sectionKey,
  value,
  formState,
  initialData,
  actualDataWithoutChange,
  isEditing,
  isApproved,
  rowId,
  userRole,
  hasMakerRole,
  hasCheckerRole,
  hasBothRoles,
  checkerCanAct,
  isMaker,
  shouldEnableComments,
  shouldEnableSectionComments = false, // Default to false - hide section-level comments
  shouldEnableStatus,
  errors,
  flatArrayFields,
  listingArrayFields,
  newlyAddedFields,
  newlyAddedArrayItems,
  newlyAddedTableRows,
  newlyAddedTableColumns,
  searchText,
  activeMatchPath,
  matchedPaths,
  openPaths,
  onToggleEdit,
  onFormStateChange,
  onSetValue,
  onRemoveField,
  onAddFieldInObject,
  onRemoveFieldInObject,
  onConvertToObjectAndAddField,
  onNewlyAddedArrayItemsChange,
  onNewlyAddedTableRowsChange,
  onNewlyAddedTableColumnsChange,
  shouldHideSection,
  fieldStatus = {},
  onFieldStatusChange,
  onSourceClick,
  readOnly = false,
  onAddField,
  getComments,
  onAddComment,
  onDeleteComment,
  userId,
}: AccordionSectionItemProps) {
  // Check if this section has been edited (has changes from initial data)
  const currentValue = getAt(formState, [sectionKey]);
  const initialValue = getAt(initialData, [sectionKey]);
  const actualDataWithoutChangeValue = getAt(actualDataWithoutChange, [
    sectionKey,
  ]);
  // Remove _comments from comparison
  const cleanCurrent =
    currentValue &&
    typeof currentValue === "object" &&
    !Array.isArray(currentValue)
      ? { ...currentValue }
      : currentValue;
  const cleanInitial =
    initialValue &&
    typeof initialValue === "object" &&
    !Array.isArray(initialValue)
      ? { ...initialValue }
      : initialValue;
  const sectionHasChanges = !deepEqual(cleanCurrent, cleanInitial);

  // Skip rendering accordion item if section should be hidden
  if (shouldHideSection()) {
    return null;
  }

  // Debug logging for section rendering

  return (
    <AccordionItem
      data-component-name="AccordionSectionItem"
      data-section-key={sectionKey}
      value={sectionId}
      key={sectionId}
      data-accordion-section={sectionId}
      data-path={sectionKey}
      onClick={(e) => {
        stopAccordionTogglePropagation(e);
      }}
    >
      {/* Component Name Badge - Positioned at top-left to not overlap with header actions */}
      {/* <div className="absolute top-1 left-1 z-10 flex items-center gap-1">
        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[8px] font-mono font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 whitespace-nowrap">
          AccordionSectionItem
        </span>
      </div> */}
        <AccordionSectionHeader
        sectionId={sectionId}
        sectionKey={sectionKey}
        isEditing={isEditing}
        sectionHasChanges={sectionHasChanges}
        isOpen={false}
        rowId={rowId}
        isApproved={isApproved}
        userRole={userRole}
        hasCheckerRole={hasCheckerRole}
        hasBothRoles={hasBothRoles}
        checkerCanAct={checkerCanAct}
        isMaker={isMaker}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        readOnly={readOnly}
        onToggleEdit={() => onToggleEdit(sectionId)}
        onCancelEdit={() => {
          // Cancel editing: reset this section's formState to initialData and exit edit mode
          const initialValue = getAt(initialData, [sectionKey]);
          const updatedFormState = setAt(formState, [sectionKey], initialValue);
          onFormStateChange(updatedFormState);
          // Also reset react-hook-form for this section
          onSetValue(sectionKey, initialValue, { shouldValidate: false });
          // Exit edit mode
          onToggleEdit(sectionId);
        }}
        onSaveEdit={() => {
          // Save changes: just exit edit mode (changes are already in formState)
          onToggleEdit(sectionId);
        }}
      />

      <SectionContentRenderer
        fieldKey={sectionKey}
        value={value}
        actualDataWithoutChangeValue={actualDataWithoutChangeValue}
        actualDataWithoutChange={actualDataWithoutChange}
        formState={formState}
        isEditing={isEditing}
        isMaker={isMaker}
        isApproved={isApproved}
        hasMakerRole={hasMakerRole}
        hasCheckerRole={hasCheckerRole}
        hasBothRoles={hasBothRoles}
        checkerCanAct={checkerCanAct}
        userRole={userRole}
        rowId={rowId}
        shouldEnableComments={shouldEnableComments}
        shouldEnableSectionComments={shouldEnableSectionComments}
        shouldEnableStatus={shouldEnableStatus}
        errors={errors}
        flatArrayFields={flatArrayFields}
        listingArrayFields={listingArrayFields}
        newlyAddedFields={newlyAddedFields}
        newlyAddedArrayItems={newlyAddedArrayItems}
        newlyAddedTableRows={newlyAddedTableRows}
        newlyAddedTableColumns={newlyAddedTableColumns}
        onFormStateChange={onFormStateChange}
        onSetValue={onSetValue}
        onRemoveField={onRemoveField}
        onAddFieldInObject={onAddFieldInObject}
        onRemoveFieldInObject={onRemoveFieldInObject}
        onConvertToObjectAndAddField={onConvertToObjectAndAddField}
        onNewlyAddedArrayItemsChange={onNewlyAddedArrayItemsChange}
        onNewlyAddedTableRowsChange={onNewlyAddedTableRowsChange}
        onNewlyAddedTableColumnsChange={onNewlyAddedTableColumnsChange}
        fieldStatus={fieldStatus}
        onFieldStatusChange={onFieldStatusChange}
        onSourceClick={onSourceClick}
        onAddField={onAddField}
        getComments={getComments}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        userId={userId}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        openPaths={openPaths}
      />
    </AccordionItem>
  );
}

AccordionSectionItem.displayName = "AccordionSectionItem";
