import { TrashIcon } from "@heroicons/react/20/solid";
import Field from "./Field";
import { Button } from "@/components/ui/Button";
import { formatKey, toBracketPath } from "./utils";
import type { ObjectRendererProps } from "./types";

type ScalarFieldProps = Pick<
  ObjectRendererProps,
  | "searchText"
  | "actualDataWithoutChangeValue"
  | "commentOnlyMode"
  | "shouldEnableComments"
  | "shouldEnableStatus"
  | "fieldStatus"
  | "onFieldStatusChange"
  | "getComments"
  | "onAddComment"
  | "userRole"
  | "rootData"
  | "jsonComments"
  | "pendingComments"
  | "newComments"
  | "onNewCommentsChange"
  | "newlyAddedFields"
  | "onSourceClick"
> & {
  id: string;
  keyName: string;
  keyPath: Array<string | number>;
  path: Array<string | number>;
  val: unknown;
  editable: boolean;
  isEditing: boolean;
  activeMatchPath?: string | null;
  userId: string;
  errors?: unknown;
  onValueChange: ObjectRendererProps["onValueChange"];
  onRemoveField?: ObjectRendererProps["onRemoveField"];
};

export default function ObjectRendererScalarField({
  id: _id,
  keyName,
  keyPath,
  path,
  val,
  editable,
  isEditing,
  onRemoveField,
  newlyAddedFields,
  searchText,
  activeMatchPath,
  actualDataWithoutChangeValue,
  commentOnlyMode,
  shouldEnableComments,
  shouldEnableStatus,
  fieldStatus,
  onFieldStatusChange,
  getComments,
  onAddComment,
  userId,
  userRole,
  rootData,
  jsonComments,
  pendingComments,
  newComments,
  onNewCommentsChange,
  onSourceClick,
  errors,
  onValueChange,
}: ScalarFieldProps) {
  const fieldPathForField = toBracketPath(keyPath);

  return (
    <div className="dark:bg-dark-700 relative flex min-w-0 items-center gap-2 rounded bg-slate-50 p-1">
      <div className="min-w-0 flex-1">
        <Field
          label={keyName}
          value={val}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          status={null}
          actualDataWithoutChangeValue={actualDataWithoutChangeValue}
          editable={editable}
          onChange={(newVal) => onValueChange(keyPath, newVal)}
          error={(errors as Record<string, unknown>)?.[keyName]}
          commentOnlyMode={commentOnlyMode}
          shouldEnableComments={shouldEnableComments}
          shouldEnableStatus={shouldEnableStatus}
          fieldPath={fieldPathForField}
          fieldStatus={
            (fieldStatus?.[fieldPathForField] as
              | "approved"
              | "approve_with_pendency"
              | "rejected"
              | "reverse_to_maker"
              | null) || null
          }
          onStatusChange={
            onFieldStatusChange
              ? (fieldPath, status) => onFieldStatusChange(fieldPath, status)
              : () => {}
          }
          comments={getComments ? getComments(fieldPathForField) : []}
          onAddComment={onAddComment}
          userId={userId}
          userRole={userRole || null}
          rootData={rootData}
          onRootDataChange={(newRootData) => onValueChange([], newRootData)}
          newComments={newComments}
          onNewCommentsChange={
            onNewCommentsChange
              ? (updater) => {
                  onNewCommentsChange(updater);
                }
              : undefined
          }
          jsonComments={jsonComments}
          pendingComments={pendingComments}
          onSourceClick={onSourceClick}
        />
      </div>
      {isEditing && onRemoveField && newlyAddedFields?.has(keyPath.join(".")) && (
        <Button
          type="button"
          onClick={() => {
            if (window.confirm(`Are you sure you want to remove "${formatKey(keyName)}" field?`)) {
              onRemoveField(path, keyName);
            }
          }}
          variant="flat"
          className="h-7 w-7 shrink-0 rounded border border-red-300 bg-red-50 p-0 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
          title="Remove Field"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
