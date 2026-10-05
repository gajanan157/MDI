// Search working
import { useCallback } from "react";
import ObjectRenderer from "./ObjectRenderer";
import { getAt, setAt } from "./utils";

export interface ObjectSectionContentProps {
  fieldKey: string;
  value: any;
  actualDataWithoutChangeValue: any;
  formState: any;
  isEditing: boolean;
  searchText?: string;
  activeMatchPath?: string | null;
  matchedPaths?: string[];
  openPaths?: Set<string>;
  isMaker: boolean;
  isApproved: boolean;
  hasMakerRole: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  checkerCanAct: boolean;
  userRole?: "maker1" | "maker2" | "checker" | null;
  rowId?: string;
  shouldEnableComments: boolean;
  shouldEnableSectionComments?: boolean; // Control section-level comments (default: false)
  shouldEnableStatus?: boolean;
  errors: any;
  newlyAddedFields: Set<string>;
  onFormStateChange: (newState: any) => void;
  onSetValue: (key: string, value: any, options?: any) => void;
  onAddField: (
    path: Array<string | number>,
    fieldName: string,
    fieldValue: any,
  ) => void;
  onRemoveField: (path: Array<string | number>, fieldName: string) => void;
  fieldStatus?: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  rootData?: any;
  onRootDataChange?: (newData: any) => void;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
  onAddFieldAtPath?: (
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
    userRole?: "maker1" | "maker2" | "checker",
  ) => void;
  onDeleteComment?: (fieldPath: string, commentId: string) => void;
  userId?: string;
}

export default function ObjectSectionContent({
  fieldKey,
  value,
  actualDataWithoutChangeValue,
  formState,
  isEditing,
  searchText,
  activeMatchPath,
  matchedPaths = [],
  openPaths,
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
  newlyAddedFields,
  onFormStateChange,
  onSetValue,
  onAddField,
  onRemoveField,
  fieldStatus = {},
  onFieldStatusChange,
  rootData,
  onRootDataChange,
  onSourceClick,
  onAddFieldAtPath,
  getComments,
  onAddComment,
  onDeleteComment,
  userId,
}: ObjectSectionContentProps) {
  // Wrapper function to adapt onAddComment signature for ObjectRenderer
  // ObjectRenderer expects (fieldPath, comment) but ObjectSectionContent provides (fieldPath, comment, userId, userRole)
  const handleAddCommentForObject = useCallback(
    (fieldPath: string, comment: string) => {
      if (!onAddComment) return;

      const userIdValue = userId || "unknown";
      const userRoleValue = Array.isArray(userRole)
        ? userRole[0] || "unknown"
        : userRole || "unknown";
      onAddComment(fieldPath, comment, userIdValue, userRoleValue);
    },
    [onAddComment, userId, userRole],
  );

  // MAKER1 and MAKER2 can now edit fields like CHECKER, so no comment-only mode
  const isCommentOnlyMode = false;
  // Full edit mode for both makers and checkers
  const isFullEditMode =
    isEditing &&
    (hasCheckerRole || hasBothRoles || hasMakerRole) &&
    checkerCanAct;
  // When editing, fields should be editable
  const shouldShowAsEditable = isFullEditMode;

  return (
    <div
      className="relative w-full min-w-0 space-y-2"
      data-component-name="ObjectSectionContent"
      data-field-key={fieldKey}
    >
      <ObjectRenderer
        data={getAt(formState, [fieldKey]) ?? value}
        path={[fieldKey]}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        openPaths={openPaths}
        editingMap={shouldShowAsEditable ? { [fieldKey]: true } : {}}
        commentOnlyMode={isCommentOnlyMode}
        shouldEnableComments={shouldEnableComments}
        shouldEnableSectionComments={shouldEnableSectionComments}
        shouldEnableStatus={shouldEnableStatus}
        actualDataWithoutChangeValue={actualDataWithoutChangeValue}
        onValueChange={(fieldPath, newVal) => {
          onFormStateChange((prev) => setAt(prev, fieldPath, newVal));
          const fieldName = fieldPath.join(".");
          onSetValue(fieldName, newVal, { shouldValidate: true });
        }}
        onAddField={checkerCanAct ? onAddField : undefined}
        onRemoveField={checkerCanAct ? onRemoveField : undefined}
        rootData={rootData}
        onRootDataChange={onRootDataChange || onFormStateChange}
        errors={errors[fieldKey]}
        rowId={shouldEnableComments ? rowId : undefined}
        isMaker={isMaker}
        userRole={userRole}
        isApproved={isApproved}
        newlyAddedFields={newlyAddedFields}
        fieldStatus={fieldStatus}
        onFieldStatusChange={onFieldStatusChange}
        onSourceClick={onSourceClick}
        onAddFieldAtPath={onAddFieldAtPath}
        getComments={getComments}
        onAddComment={handleAddCommentForObject}
        onDeleteComment={onDeleteComment}
        userId={userId}
      />
    </div>
  );
}

ObjectSectionContent.displayName = "ObjectSectionContent";
