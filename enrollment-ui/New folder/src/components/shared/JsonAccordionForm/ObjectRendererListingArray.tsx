import { TrashIcon, PlusIcon } from "@heroicons/react/20/solid";
import { AutoResizeTextarea } from "./Field";
import FieldCommentButton from "./FieldCommentButton";
import SeeMoreLess from "./SeeMoreLess";
import ObjectRendererFieldSectionMeta from "./ObjectRendererFieldSectionMeta";
import { Button } from "@/components/ui/Button";
import { formatKey, toBracketPath } from "./utils";
import { getListingItemClassName } from "./displayHelpers";
import { renderFieldStatusControl } from "./objectRendererFieldStatus";
import {
  canUserEditFields,
  collectListingItemComments,
  coerceListingItemUpdate,
  getFieldStatusClassName,
  getFieldStatusLabel,
  getParentSourcesFromRootData,
  listingItemToDisplayString,
  resolveFieldComments,
} from "./objectRendererHelpers";
import type { ObjectRendererProps } from "./types";

type ListingArrayProps = Pick<
  ObjectRendererProps,
  | "searchText"
  | "matchedPaths"
  | "jsonComments"
  | "rootData"
  | "pendingComments"
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
> & {
  id: string;
  keyName: string;
  keyPath: Array<string | number>;
  path: Array<string | number>;
  displayArray: unknown[];
  editable: boolean;
  isEditing: boolean;
  activeMatchPath?: string | null;
  userId: string;
  fieldPath: string;
  onValueChange: (path: Array<string | number>, newVal: unknown) => void;
  onRemoveField?: (path: Array<string | number>, fieldName: string) => void;
  newlyAddedArrayItems: Set<string>;
  setNewlyAddedArrayItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  onSourceClick?: (source: unknown) => void;
};

function ListingArrayReadOnly({
  displayArray,
  keyPath,
  id,
  searchText,
  activeMatchPath,
  matchedPaths,
  shouldEnableStatus,
  shouldEnableComments,
  fieldStatus,
  getComments,
  onAddComment,
  userId,
  userRole,
  jsonComments,
  rootData,
  pendingComments,
  editable,
  onSourceClick,
}: Pick<
  ListingArrayProps,
  | "displayArray"
  | "keyPath"
  | "id"
  | "searchText"
  | "activeMatchPath"
  | "matchedPaths"
  | "shouldEnableStatus"
  | "shouldEnableComments"
  | "fieldStatus"
  | "getComments"
  | "onAddComment"
  | "userId"
  | "userRole"
  | "jsonComments"
  | "rootData"
  | "pendingComments"
  | "editable"
  | "onSourceClick"
> & {
  shouldEnableStatus: boolean;
  shouldEnableComments: boolean;
}) {
  const useTwoColumns = displayArray.length > 9;
  const parentSources = getParentSourcesFromRootData(rootData, keyPath);
  const hasClickableSource = parentSources?.some(
    (s: { page_number?: number }) => s?.page_number,
  );
  const sourceWithPage = hasClickableSource
    ? parentSources!.find((s: { page_number?: number }) => s?.page_number)
    : null;

  return (
    <ul
      className={
        useTwoColumns
          ? "grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-900 dark:text-gray-100"
          : "list-disc space-y-1 pl-6 text-xs text-gray-900 dark:text-gray-100"
      }
    >
      {displayArray.map((item, itemIndex) => {
        const itemFieldPath = toBracketPath([...keyPath, itemIndex]);
        const itemStatus = fieldStatus?.[itemFieldPath];
        const itemComments = collectListingItemComments(
          itemFieldPath,
          jsonComments,
          rootData,
          pendingComments || [],
          userId,
        );

        return (
          <li
            key={`${id}-readonly-${itemIndex}`}
            className={getListingItemClassName(
              useTwoColumns,
              shouldEnableStatus,
              shouldEnableComments,
            )}
          >
            {useTwoColumns && (
              <span className="shrink-0 text-gray-700 dark:text-gray-300">•</span>
            )}
            <div className="relative min-w-0 flex-1">
              <span
                data-path={itemFieldPath}
                className={
                  hasClickableSource && onSourceClick
                    ? "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    : ""
                }
                onClick={(e) => {
                  if (!editable && hasClickableSource && sourceWithPage && onSourceClick) {
                    e.stopPropagation();
                    onSourceClick(sourceWithPage);
                  }
                }}
                title={
                  hasClickableSource && sourceWithPage && !editable
                    ? `Click to open page ${sourceWithPage.page_number} in PDF viewer`
                    : undefined
                }
              >
                <SeeMoreLess
                  content={listingItemToDisplayString(item)}
                  maxLines={1}
                  minCharForSeeMore={50}
                  highlightText={searchText}
                  activeMatchPath={activeMatchPath}
                  matchedPaths={matchedPaths}
                  currentPath={itemFieldPath}
                  textClassName={
                    hasClickableSource && onSourceClick && !editable
                      ? "hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      : ""
                  }
                />
              </span>
            </div>
            {shouldEnableStatus && (
              <div className="shrink-0">
                {itemStatus ? (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getFieldStatusClassName(itemStatus)} dark:bg-opacity-20`}
                  >
                    {getFieldStatusLabel(itemStatus)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic dark:text-gray-500" />
                )}
              </div>
            )}
            {shouldEnableComments && (
              <div className="shrink-0">
                <FieldCommentButton
                  fieldPath={itemFieldPath}
                  comments={resolveFieldComments(itemFieldPath, getComments, itemComments)}
                  onAddComment={onAddComment || (() => {})}
                  userId={userId}
                  userRole={userRole}
                />
              </div>
            )}
          </li>
        );
      })}
      {displayArray.length === 0 && (
        <li
          className={`${useTwoColumns ? "flex items-center gap-2" : ""} relative text-gray-400 italic dark:text-gray-500`}
        >
          {useTwoColumns && <span>•</span>}
          <span>No items</span>
        </li>
      )}
    </ul>
  );
}

function ListingArrayEdit({
  displayArray,
  keyPath,
  id,
  fieldPath,
  isFieldEditable,
  canEditFields,
  commentOnlyMode,
  shouldEnableStatus,
  shouldEnableComments,
  fieldStatus,
  onFieldStatusChange,
  getComments,
  onAddComment,
  userId,
  userRole,
  jsonComments,
  rootData,
  pendingComments,
  newlyAddedArrayItems,
  setNewlyAddedArrayItems,
  onValueChange,
}: {
  displayArray: unknown[];
  keyPath: Array<string | number>;
  id: string;
  fieldPath: string;
  isFieldEditable: boolean;
  canEditFields: boolean;
  commentOnlyMode: boolean;
  shouldEnableStatus: boolean;
  shouldEnableComments: boolean;
  fieldStatus: Record<string, string | null>;
  onFieldStatusChange?: (fieldPath: string, status: string | null) => void;
  getComments?: ListingArrayProps["getComments"];
  onAddComment?: ListingArrayProps["onAddComment"];
  userId: string;
  userRole?: ListingArrayProps["userRole"];
  jsonComments?: ListingArrayProps["jsonComments"];
  rootData?: ListingArrayProps["rootData"];
  pendingComments?: ListingArrayProps["pendingComments"];
  newlyAddedArrayItems: Set<string>;
  setNewlyAddedArrayItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  onValueChange: ListingArrayProps["onValueChange"];
}) {
  return (
    <div className="space-y-1">
      {displayArray.map((item, itemIndex) => {
        const itemFieldPath = toBracketPath([...keyPath, itemIndex]);
        const itemKey = `${fieldPath}:${itemIndex}`;

        return (
          <div
            key={`${id}-item-${itemIndex}`}
            className="dark:border-dark-600 dark:bg-dark-700 rounded-md border border-gray-200 bg-gray-50 p-0"
          >
            <div className="space-y-0">
              {!commentOnlyMode && newlyAddedArrayItems.has(itemKey) && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      const updated = displayArray.filter((_, i) => i !== itemIndex);
                      onValueChange(keyPath, updated);
                      setNewlyAddedArrayItems((prev) => {
                        const next = new Set(prev);
                        next.delete(itemKey);
                        return next;
                      });
                    }}
                    variant="flat"
                    className="h-5 w-5 rounded border border-red-300 bg-red-50 p-0 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                    title="Remove Item"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div>
                <AutoResizeTextarea
                  value={listingItemToDisplayString(item)}
                  onChange={(newValue) => {
                    if (commentOnlyMode || !isFieldEditable) return;
                    const updated = [...displayArray];
                    updated[itemIndex] = coerceListingItemUpdate(item, newValue);
                    onValueChange(keyPath, updated);
                  }}
                  disabled={!isFieldEditable}
                  className={`focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-900 dark:focus:border-primary-500 min-h-[24px] w-full rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs transition-all focus:ring-2 focus:outline-none dark:text-gray-100 ${
                    !isFieldEditable ? "cursor-not-allowed opacity-50" : ""
                  }`}
                />
              </div>
              {shouldEnableStatus && (
                <div>
                  {renderFieldStatusControl(
                    itemFieldPath,
                    fieldStatus[itemFieldPath],
                    Boolean(onFieldStatusChange && canEditFields),
                    onFieldStatusChange,
                  )}
                </div>
              )}
              {shouldEnableComments && (
                <div>
                  <FieldCommentButton
                    fieldPath={itemFieldPath}
                    comments={resolveFieldComments(
                      itemFieldPath,
                      getComments,
                      collectListingItemComments(
                        itemFieldPath,
                        jsonComments,
                        rootData,
                        pendingComments || [],
                        userId,
                      ),
                    )}
                    onAddComment={onAddComment || (() => {})}
                    userId={userId}
                    userRole={userRole}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      {!commentOnlyMode && (
        <div>
          <Button
            type="button"
            onClick={() => {
              const updated = [...displayArray, ""];
              onValueChange(keyPath, updated);
              setNewlyAddedArrayItems(
                (prev) => new Set([...prev, `${fieldPath}:${displayArray.length}`]),
              );
            }}
            variant="outlined"
            className="flex w-full items-center gap-2 border-dashed"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        </div>
      )}
      {displayArray.length === 0 && (
        <div className="relative py-2 text-center text-xs text-gray-500 italic dark:text-gray-400">
          No items yet. Click "Add Item" to add one.
        </div>
      )}
    </div>
  );
}

export default function ObjectRendererListingArray(props: ListingArrayProps) {
  const {
    id,
    keyName,
    keyPath,
    path,
    displayArray,
    editable,
    isEditing,
    onRemoveField,
    newlyAddedFields,
    shouldEnableStatus,
    shouldEnableSectionComments,
    fieldPath,
    fieldStatus,
    onFieldStatusChange,
    userRole,
    getComments,
    onAddComment,
    userId,
    commentOnlyMode,
    newlyAddedArrayItems,
    setNewlyAddedArrayItems,
    onValueChange,
    ...readOnlyProps
  } = props;

  const isFieldEditable = editable && !commentOnlyMode;
  const canEditFields = canUserEditFields(userRole);

  return (
    <div className="dark:border-dark-600 dark:bg-dark-800 relative rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm">
      <div className="mb-1 flex items-center justify-between pr-1">
        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {formatKey(keyName)} ({displayArray.length} items)
        </div>
        {isEditing && onRemoveField && newlyAddedFields?.has(fieldPath) && (
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

      {!editable && (
        <div className="relative space-y-1">
          <ListingArrayReadOnly
            {...readOnlyProps}
            displayArray={displayArray}
            keyPath={keyPath}
            id={id}
            editable={editable}
            shouldEnableStatus={shouldEnableStatus || false}
            shouldEnableComments={props.shouldEnableComments || false}
            fieldStatus={fieldStatus || {}}
            userId={userId}
          />
        </div>
      )}

      {editable && (
        <ListingArrayEdit
          displayArray={displayArray}
          keyPath={keyPath}
          id={id}
          fieldPath={fieldPath}
          isFieldEditable={isFieldEditable}
          canEditFields={canEditFields}
          commentOnlyMode={commentOnlyMode || false}
          shouldEnableStatus={shouldEnableStatus || false}
          shouldEnableComments={props.shouldEnableComments || false}
          fieldStatus={fieldStatus || {}}
          onFieldStatusChange={onFieldStatusChange}
          getComments={getComments}
          onAddComment={onAddComment}
          userId={userId}
          userRole={userRole}
          jsonComments={props.jsonComments}
          rootData={props.rootData}
          pendingComments={props.pendingComments}
          newlyAddedArrayItems={newlyAddedArrayItems}
          setNewlyAddedArrayItems={setNewlyAddedArrayItems}
          onValueChange={onValueChange}
        />
      )}
    </div>
  );
}
