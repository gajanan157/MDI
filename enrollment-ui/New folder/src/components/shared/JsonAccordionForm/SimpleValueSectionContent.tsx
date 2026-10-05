// Search working
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@heroicons/react/20/solid";
import Field from "./Field";
import { getAt, formatKey, setAt } from "./utils";

export interface SimpleValueSectionContentProps {
  fieldKey: string;
  value: any;
  actualDataWithoutChangeValue: any;
  formState: any;
  searchText?: string;
  activeMatchPath?: string | null;
  isEditing: boolean;
  isNewlyAdded: boolean;
  hasCheckerRole: boolean;
  hasBothRoles: boolean;
  hasMakerRole: boolean;
  checkerCanAct: boolean;
  isApproved: boolean;
  isMaker: boolean;
  errors: any;
  shouldEnableComments?: boolean;
  newComments?: Record<string, string>;
  onNewCommentsChange?: (
    updater: (prev: Record<string, string>) => Record<string, string>,
  ) => void;
  jsonComments?: Record<string, Array<any>>;
  pendingComments?: Array<any>;
  fieldStatus?: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  userRole?: "maker1" | "maker2" | "checker" | null;
  rootData?: any;
  onRootDataChange?: (newRootData: any) => void;
  onFormStateChange: (newState: any) => void;
  onSetValue: (key: string, value: any, options?: any) => void;
  onRemoveField: (key: string) => void;
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void;
}

export default function SimpleValueSectionContent({
  fieldKey,
  value,
  searchText,
  activeMatchPath,
  actualDataWithoutChangeValue,
  formState,
  isEditing,
  isNewlyAdded,
  hasCheckerRole,
  hasBothRoles,
  hasMakerRole,
  checkerCanAct,
  errors,
  shouldEnableComments = true,
  newComments = {},
  onNewCommentsChange,
  jsonComments,
  pendingComments = [],
  fieldStatus = {},
  onFieldStatusChange,
  userRole,
  rootData,
  onRootDataChange,
  onFormStateChange,
  onSetValue,
  onRemoveField,
  onSourceClick,
}: SimpleValueSectionContentProps) {
  // MAKER1 and MAKER2 can now edit fields like CHECKER, so no comment-only mode
  const isCommentOnlyMode = false;
  // Full edit mode for both makers and checkers
  const isFullEditMode =
    isEditing && (hasCheckerRole || hasBothRoles || hasMakerRole) && checkerCanAct;
  // When editing, fields should be editable
  const shouldShowAsEditable = isFullEditMode;
  return (
    <>
      <div className="relative flex w-full min-w-0 flex-col rounded bg-slate-50 p-1 dark:bg-dark-700" data-component-name="SimpleValueSectionContent" data-field-key={fieldKey}>
        <div className="mb-1 flex items-center gap-1">
          <span className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
            SimpleValueSectionContent → Field
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <Field
            label={fieldKey}
            value={getAt(formState, [fieldKey]) ?? value}
            actualDataWithoutChangeValue={actualDataWithoutChangeValue}
            editable={shouldShowAsEditable}
            onChange={(v) => {
              onFormStateChange((prev: any) => {
                return setAt(prev, [fieldKey], v);
              });
              onSetValue(fieldKey, v, { shouldValidate: true });
            }}
            error={errors[fieldKey]?.message}
            commentOnlyMode={isCommentOnlyMode}
            shouldEnableComments={shouldEnableComments}
            fieldPath={fieldKey}
            searchText={searchText}
            activeMatchPath={activeMatchPath}
            status={fieldStatus[fieldKey]}
            onStatusChange={
              onFieldStatusChange
                ? (status) => onFieldStatusChange(fieldKey, status)
                : undefined
            }
            userRole={userRole || null}
            rootData={rootData}
            onRootDataChange={onRootDataChange}
            jsonComments={
              jsonComments?.[fieldKey]
                ? { [fieldKey]: jsonComments[fieldKey] }
                : undefined
            }
            pendingComments={pendingComments.filter(
              (pc: any) => pc.fieldName === fieldKey,
            )}
            newComments={newComments}
            onNewCommentsChange={onNewCommentsChange}
            onSourceClick={onSourceClick}
          />
        </div>
        {isEditing && isNewlyAdded && (
          <Button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to remove "${formatKey(fieldKey)}" field?`,
                )
              ) {
                onRemoveField(fieldKey);
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
    </>
  );
}

SimpleValueSectionContent.displayName = "SimpleValueSectionContent";
