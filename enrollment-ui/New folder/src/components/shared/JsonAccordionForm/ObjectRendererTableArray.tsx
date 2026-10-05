import { TrashIcon } from "@heroicons/react/20/solid";
import TableRenderer from "./TableRenderer";
import ObjectRendererFieldSectionMeta from "./ObjectRendererFieldSectionMeta";
import { Button } from "@/components/ui/Button";
import { formatKey, highlightText } from "./utils";
import type { ObjectRendererProps } from "./types";

type TableArrayProps = Pick<
  ObjectRendererProps,
  | "searchText"
  | "matchedPaths"
  | "actualDataWithoutChangeValue"
  | "shouldEnableComments"
  | "shouldEnableSectionComments"
  | "shouldEnableStatus"
  | "fieldStatus"
  | "onFieldStatusChange"
  | "userRole"
  | "getComments"
  | "onAddComment"
  | "commentOnlyMode"
  | "newlyAddedFields"
  | "rootData"
  | "onRootDataChange"
> & {
  id: string;
  keyName: string;
  keyPath: Array<string | number>;
  path: Array<string | number>;
  val: Record<string, unknown>[];
  editable: boolean;
  isEditing: boolean;
  activeMatchPath?: string | null;
  fieldPath: string;
  userId: string;
  onValueChange: ObjectRendererProps["onValueChange"];
  onRemoveField?: ObjectRendererProps["onRemoveField"];
  onSourceClick?: ObjectRendererProps["onSourceClick"];
};

export default function ObjectRendererTableArray({
  id: _id,
  keyName,
  keyPath,
  path,
  val,
  editable,
  isEditing,
  onRemoveField,
  newlyAddedFields,
  fieldPath,
  searchText,
  activeMatchPath,
  matchedPaths,
  shouldEnableStatus,
  shouldEnableSectionComments,
  fieldStatus,
  onFieldStatusChange,
  userRole,
  getComments,
  onAddComment,
  userId,
  onValueChange,
  actualDataWithoutChangeValue,
  shouldEnableComments,
  commentOnlyMode,
  rootData,
  onRootDataChange,
  onSourceClick,
}: TableArrayProps) {
  const hideHeaderLabel = keyName === "conditions" || keyName === "definitions";

  return (
    <div className="dark:border-dark-600 dark:bg-dark-800 relative rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm">
      <div className="relative mb-1 flex items-center justify-between pr-1">
        {!hideHeaderLabel && (
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {searchText
              ? highlightText(formatKey(keyName), searchText, fieldPath, activeMatchPath)
              : formatKey(keyName)}{" "}
            ({val.length} rows)
          </div>
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
      </div>

      <ObjectRendererFieldSectionMeta
        fieldPath={fieldPath}
        shouldEnableStatus={shouldEnableStatus || false}
        shouldEnableSectionComments={shouldEnableSectionComments || false}
        fieldStatus={fieldStatus || {}}
        onFieldStatusChange={onFieldStatusChange}
        userRole={userRole}
        editable={editable}
        getComments={getComments}
        onAddComment={onAddComment}
        userId={userId}
      />

      <TableRenderer
        data={val}
        path={keyPath}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        editingMap={editable ? { [keyPath.join(".")]: true } : {}}
        actualDataWithoutChangeValue={actualDataWithoutChangeValue}
        shouldEnableComments={shouldEnableComments}
        shouldEnableStatus={shouldEnableStatus}
        commentOnlyMode={commentOnlyMode}
        onValueChange={onValueChange}
        getComments={getComments}
        onAddComment={onAddComment}
        userId={userId}
        userRole={userRole}
        onAddRow={(p) => {
          const current = val || [];
          const newRow: Record<string, unknown> = {};
          if (current.length > 0 && typeof current[0] === "object") {
            Object.keys(current[0]).forEach((col) => {
              newRow[col] = "";
            });
          }
          onValueChange(p, [...current, newRow]);
        }}
        onRemoveRow={(p, index) => {
          onValueChange(p, val.filter((_, i) => i !== index));
        }}
        onAddColumn={(p, columnName, defaultValue = "") => {
          onValueChange(
            p,
            val.map((row) => ({ ...row, [columnName]: defaultValue })),
          );
        }}
        onRemoveColumn={(p, columnName) => {
          onValueChange(
            p,
            val.map((row) => {
              const newRow = { ...row };
              delete newRow[columnName];
              return newRow;
            }),
          );
        }}
        fieldStatus={fieldStatus}
        onFieldStatusChange={onFieldStatusChange}
        rootData={rootData}
        onRootDataChange={onRootDataChange}
        onSourceClick={onSourceClick}
      />
    </div>
  );
}
