import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@heroicons/react/20/solid";
import BulletedList from "./BulletedList";
import CollapsibleSection from "./CollapsibleSection";
import ArrayTableRendererBlock from "./ArrayTableRendererBlock";
import { StructuredTableRenderer } from "./StructuredTableRenderer";
import { formatKey, getAt, setAt, toBracketPath } from "./utils";
import type { AnyObject } from "./types";
import {
  isArraySectionOpen,
  shiftIndexedSetKeys,
} from "./arraySectionContentHelpers";
import type { ArraySectionContentProps } from "./ArraySectionContent";

type ArraySectionViewProps = ArraySectionContentProps & {
  currentValue: any[];
  userId: string;
  isFullEditMode: boolean;
};

function RemoveFieldButton({
  fieldKey,
  onRemoveField,
}: {
  fieldKey: string;
  onRemoveField: (key: string) => void;
}) {
  return (
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
      className="h-7 w-7 rounded border border-red-300 bg-red-50 p-0 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      title="Remove Field"
    >
      <TrashIcon className="h-4 w-4" />
    </Button>
  );
}

export function ArrayBulletedListSection({
  fieldKey,
  currentValue,
  formState,
  isEditing,
  isNewlyAdded,
  checkerCanAct,
  newlyAddedArrayItems,
  shouldEnableComments,
  shouldEnableStatus,
  userRole,
  onFormStateChange,
  onSetValue,
  onRemoveField,
  onNewlyAddedArrayItemsChange,
  fieldStatus,
  onFieldStatusChange,
  rootData,
  onSourceClick,
  getComments,
  onAddComment,
  onDeleteComment,
  userId,
  searchText,
  activeMatchPath,
  openPaths,
  isFullEditMode,
}: ArraySectionViewProps) {
  const isArrayPathOpen = isArraySectionOpen(openPaths, fieldKey);

  return (
    <div className="w-full min-w-0" data-component-name="ArraySectionContent">
      <div className="mb-1 flex items-center gap-1">
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          ArraySectionContent → BulletedList
        </span>
      </div>
      <CollapsibleSection
        data-field-key={fieldKey}
        title={formatKey(fieldKey)}
        subtitle={`(${currentValue.length} ${currentValue.length === 1 ? "item" : "items"})`}
        defaultCollapsed={true}
        isOpen={isArrayPathOpen}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        currentPath={fieldKey}
        headerActions={
          isEditing && isNewlyAdded ? (
            <RemoveFieldButton fieldKey={fieldKey} onRemoveField={onRemoveField} />
          ) : undefined
        }
      >
        <BulletedList
          items={currentValue}
          searchText={searchText}
          activeMatchPath={activeMatchPath}
          isEditing={isFullEditMode}
          fieldKey={fieldKey}
          isNewlyAdded={(index) =>
            newlyAddedArrayItems.has(`${fieldKey}:${index}`)
          }
          onItemChange={(index, itemValue) => {
            if (!checkerCanAct) return;
            const updated = [...currentValue];
            updated[index] = itemValue;
            const newState = setAt(formState, [fieldKey], updated);
            onFormStateChange(newState);
            onSetValue(fieldKey, updated, { shouldValidate: true });
          }}
          onItemRemove={(index) => {
            const itemKey = `${fieldKey}:${index}`;
            if (!newlyAddedArrayItems.has(itemKey)) return;

            const updated = currentValue.filter((_: any, i: number) => i !== index);
            const newState = setAt(formState, [fieldKey], updated);
            onFormStateChange(newState);
            onSetValue(fieldKey, updated, { shouldValidate: true });
            onNewlyAddedArrayItemsChange((prev) =>
              shiftIndexedSetKeys(prev, fieldKey, index),
            );
          }}
          onItemAdd={() => {
            if (!checkerCanAct) return;
            const updated = [...currentValue, ""];
            const newState = setAt(formState, [fieldKey], updated);
            onFormStateChange(newState);
            onSetValue(fieldKey, updated, { shouldValidate: true });
            onNewlyAddedArrayItemsChange(
              (prev) => new Set([...prev, `${fieldKey}:${currentValue.length}`]),
            );
          }}
          shouldEnableComments={shouldEnableComments}
          shouldEnableStatus={shouldEnableStatus}
          userRole={userRole}
          getComments={getComments}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          userId={userId}
          fieldStatus={
            fieldStatus as Record<
              string,
              | "approved"
              | "approve_with_pendency"
              | "rejected"
              | "reverse_to_maker"
              | null
            >
          }
          onStatusChange={onFieldStatusChange}
          rootData={rootData}
          sectionActualData={getAt(rootData, [fieldKey])}
          onSourceClick={onSourceClick}
        />
      </CollapsibleSection>
    </div>
  );
}

export function ArrayStructuredTablesSection({
  fieldKey,
  currentValue,
  onFormStateChange,
  onSetValue,
  shouldEnableComments,
  shouldEnableStatus,
  fieldStatus,
  onFieldStatusChange,
  getComments,
  onAddComment,
  userId,
  userRole,
  rootData,
  onSourceClick,
  searchText,
  activeMatchPath,
  matchedPaths,
  isFullEditMode,
}: ArraySectionViewProps) {
  return (
    <div>
      {currentValue.map((table: any, index: number) => {
        const tablePath = [fieldKey, index];
        const tableFieldPath = toBracketPath(tablePath);

        return (
          <div key={index}>
            <StructuredTableRenderer
              searchText={searchText}
              activeMatchPath={activeMatchPath}
              matchedPaths={matchedPaths}
              table={table}
              onSourceClick={onSourceClick}
              path={tablePath}
              isEditing={isFullEditMode}
              onValueChange={(_p, newValue) => {
                onFormStateChange((prev: AnyObject) => {
                  const current = getAt(prev, [fieldKey]) ?? currentValue;
                  const updatedTables = [...current];
                  updatedTables[index] = newValue;
                  onSetValue(fieldKey, updatedTables, { shouldValidate: false });
                  return setAt(prev, [fieldKey], updatedTables);
                });
              }}
              shouldEnableStatus={shouldEnableStatus}
              shouldEnableComments={shouldEnableComments}
              fieldPath={tableFieldPath}
              fieldStatus={fieldStatus}
              onFieldStatusChange={onFieldStatusChange}
              getComments={getComments}
              onAddComment={onAddComment}
              userId={userId}
              userRole={userRole}
              rootData={rootData}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ArrayTableSection({
  fieldKey,
  currentValue,
  actualDataWithoutChangeValue,
  formState,
  isEditing,
  isNewlyAdded,
  newlyAddedTableRows = new Set(),
  newlyAddedTableColumns = new Set(),
  shouldEnableComments,
  shouldEnableStatus,
  userRole,
  onFormStateChange,
  onSetValue,
  onRemoveField,
  onNewlyAddedTableRowsChange,
  onNewlyAddedTableColumnsChange,
  fieldStatus,
  onFieldStatusChange,
  rootData,
  onRootDataChange,
  onSourceClick,
  getComments,
  onAddComment,
  userId,
  searchText,
  activeMatchPath,
  matchedPaths,
  openPaths,
  isFullEditMode,
}: ArraySectionViewProps) {
  const isArrayPathOpen = isArraySectionOpen(openPaths, fieldKey);
  const definitionsOnly = fieldKey === "definitions";

  const tableRenderer = (
    <ArrayTableRendererBlock
      fieldKey={fieldKey}
      currentValue={currentValue}
      actualDataWithoutChangeValue={actualDataWithoutChangeValue}
      formState={formState}
      shouldEnableComments={shouldEnableComments}
      shouldEnableStatus={shouldEnableStatus}
      userRole={userRole}
      onFormStateChange={onFormStateChange}
      onSetValue={onSetValue}
      onNewlyAddedTableRowsChange={onNewlyAddedTableRowsChange}
      onNewlyAddedTableColumnsChange={onNewlyAddedTableColumnsChange}
      fieldStatus={fieldStatus}
      onFieldStatusChange={onFieldStatusChange}
      rootData={rootData}
      onRootDataChange={onRootDataChange}
      onSourceClick={onSourceClick}
      getComments={getComments}
      onAddComment={onAddComment}
      userId={userId}
      searchText={searchText}
      activeMatchPath={activeMatchPath}
      matchedPaths={matchedPaths}
      isFullEditMode={isFullEditMode}
      newlyAddedTableRows={newlyAddedTableRows}
      newlyAddedTableColumns={newlyAddedTableColumns}
    />
  );

  if (definitionsOnly) {
    return (
      <div className="relative min-w-0 w-full overflow-x-auto px-1.5 pb-1.5 pt-1">
        {tableRenderer}
      </div>
    );
  }

  return (
    <div className="relative">
      <CollapsibleSection
        data-component-name="ArraySectionContent"
        data-field-key={fieldKey}
        title={formatKey(fieldKey)}
        subtitle={`(${currentValue?.length || 0} rows)`}
        defaultCollapsed={true}
        isOpen={isArrayPathOpen}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        currentPath={fieldKey}
        headerActions={
          isEditing && isNewlyAdded ? (
            <RemoveFieldButton fieldKey={fieldKey} onRemoveField={onRemoveField} />
          ) : undefined
        }
      >
        {tableRenderer}
      </CollapsibleSection>
    </div>
  );
}
