import { TrashIcon } from "@heroicons/react/20/solid";
import ObjectRenderer from "./ObjectRenderer";
import AddFieldButton from "./AddFieldButton";
import CollapsibleSection from "./CollapsibleSection";
import ObjectRendererFieldSectionMeta from "./ObjectRendererFieldSectionMeta";
import { Button } from "@/components/ui/Button";
import { formatKey, toBracketPath } from "./utils";
import { canUserEditFields, isNestedCollapsibleOpen } from "./objectRendererHelpers";
import type { ObjectRendererProps } from "./types";

type NestedObjectProps = ObjectRendererProps & {
  id: string;
  keyName: string;
  keyPath: Array<string | number>;
  val: Record<string, unknown>;
  editable: boolean;
  isEditing: boolean;
  activeMatchPath?: string | null;
  fieldPath: string;
  userId: string;
  errors?: unknown;
  newFieldRef: React.RefObject<HTMLDivElement | null>;
  lastAddedFieldPath: string | null;
  setLastAddedFieldPath: (path: string | null) => void;
  onAddFieldAtPath?: (
    fieldPath: string,
    fieldName: string,
    fieldValue: unknown,
    metadata?: unknown,
  ) => void;
};

export default function ObjectRendererNestedObject({
  id,
  keyName,
  keyPath,
  path = [],
  val,
  editable,
  isEditing,
  onRemoveField,
  newlyAddedFields,
  fieldPath,
  searchText,
  activeMatchPath,
  matchedPaths,
  openPaths,
  editingMap,
  shouldEnableStatus,
  shouldEnableSectionComments,
  fieldStatus,
  onFieldStatusChange,
  userRole,
  getComments,
  onAddComment,
  userId,
  commentOnlyMode,
  onValueChange,
  onAddField,
  onAddFieldAtPath,
  newFieldRef,
  lastAddedFieldPath,
  setLastAddedFieldPath,
  errors,
  ...childProps
}: NestedObjectProps) {
  const nestedObjectPath = toBracketPath(keyPath);
  const dotNotationPath = keyPath.map((p) => String(p)).join(".");
  const isNestedPathOpen = isNestedCollapsibleOpen(
    nestedObjectPath,
    dotNotationPath,
    openPaths,
    matchedPaths,
  );
  const isNestedEditable = editable && !commentOnlyMode;
  const canEditFields = canUserEditFields(userRole);
  const existingFields = Object.keys(val).filter((k) => !k.startsWith("_"));
  const isNewlyAdded = lastAddedFieldPath === fieldPath;

  return (
    <div key={id} ref={isNewlyAdded ? newFieldRef : null}>
      <CollapsibleSection
        title={formatKey(keyName)}
        subtitle={`(${existingFields.length} ${existingFields.length === 1 ? "field" : "fields"})`}
        defaultCollapsed={true}
        isOpen={isNestedPathOpen}
        className="relative"
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        currentPath={keyPath.join(".")}
        headerActions={
          <>
            {isNestedEditable && canEditFields && (onAddFieldAtPath || onAddField) && (
              <AddFieldButton
                fieldPath={nestedObjectPath}
                sectionTitle={formatKey(keyName)}
                onAddField={(_fieldPath, fieldName, fieldValue, metadata) => {
                  if (onAddFieldAtPath) {
                    onAddFieldAtPath(nestedObjectPath, fieldName, fieldValue, metadata);
                    setLastAddedFieldPath(`${nestedObjectPath}.${fieldName}`);
                  } else if (onAddField) {
                    onAddField(keyPath, fieldName, fieldValue);
                    setLastAddedFieldPath(`${keyPath.join(".")}.${fieldName}`);
                  }
                }}
                existingFields={existingFields}
                buttonLabel="Add Field to Subsection"
                variant="outlined"
                className="shrink-0 border-dashed text-xs"
              />
            )}
            {isEditing && onRemoveField && newlyAddedFields?.has(keyPath.join(".")) && (
              <Button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove "${formatKey(keyName)}" field?`)) {
                    onRemoveField(path, keyName);
                  }
                }}
                variant="flat"
                className="h-7 w-7 rounded border border-red-300 bg-red-50 p-0 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                title="Remove Field"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </>
        }
      >
        <ObjectRendererFieldSectionMeta
          fieldPath={nestedObjectPath}
          shouldEnableStatus={shouldEnableStatus || false}
          shouldEnableSectionComments={shouldEnableSectionComments || false}
          fieldStatus={fieldStatus || {}}
          onFieldStatusChange={onFieldStatusChange}
          userRole={userRole}
          editable={editable}
          getComments={getComments}
          onAddComment={onAddComment}
          userId={userId}
          className="dark:border-dark-600 mb-1 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-1"
        />

        <ObjectRenderer
          {...childProps}
          data={val}
          path={keyPath}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          matchedPaths={matchedPaths}
          openPaths={openPaths}
          editingMap={editable ? { ...editingMap, [keyPath.join(".")]: true } : {}}
          onValueChange={onValueChange}
          onAddField={onAddField}
          onRemoveField={onRemoveField}
          newlyAddedFields={newlyAddedFields}
          errors={(errors as Record<string, unknown>)?.[keyName]}
          userRole={userRole}
          commentOnlyMode={commentOnlyMode}
          shouldEnableComments={childProps.shouldEnableComments}
          shouldEnableStatus={shouldEnableStatus}
          fieldStatus={fieldStatus}
          onFieldStatusChange={onFieldStatusChange}
          onAddFieldAtPath={onAddFieldAtPath}
          getComments={getComments}
          onAddComment={onAddComment}
          userId={userId}
        />
      </CollapsibleSection>
    </div>
  );
}
