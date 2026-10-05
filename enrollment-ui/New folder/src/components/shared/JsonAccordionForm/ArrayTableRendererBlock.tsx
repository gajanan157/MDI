import { useCallback } from "react";
import TableRenderer from "./TableRenderer";
import { getAt, setAt } from "./utils";
import { shiftIndexedSetKeys } from "./arraySectionContentHelpers";
import type { ArraySectionContentProps } from "./ArraySectionContent";

type ArrayTableRendererBlockProps = Pick<
  ArraySectionContentProps,
  | "fieldKey"
  | "actualDataWithoutChangeValue"
  | "formState"
  | "shouldEnableComments"
  | "shouldEnableStatus"
  | "userRole"
  | "fieldStatus"
  | "onFieldStatusChange"
  | "rootData"
  | "onRootDataChange"
  | "onSourceClick"
  | "getComments"
  | "onAddComment"
  | "searchText"
  | "activeMatchPath"
  | "matchedPaths"
  | "onFormStateChange"
  | "onSetValue"
  | "onNewlyAddedTableRowsChange"
  | "onNewlyAddedTableColumnsChange"
> & {
  currentValue: any[];
  userId: string;
  isFullEditMode: boolean;
  newlyAddedTableRows: Set<string>;
  newlyAddedTableColumns: Set<string>;
};

export default function ArrayTableRendererBlock({
  fieldKey,
  currentValue,
  actualDataWithoutChangeValue,
  formState: _formState,
  shouldEnableComments,
  shouldEnableStatus,
  userRole,
  onFormStateChange,
  onSetValue,
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
  isFullEditMode,
  newlyAddedTableRows,
  newlyAddedTableColumns,
}: ArrayTableRendererBlockProps) {
  const handleAddCommentForTable = useCallback(
    (fieldPath: string, comment: string) => {
      if (!onAddComment) return;
      const userRoleValue = Array.isArray(userRole)
        ? userRole[0] || "unknown"
        : userRole || "unknown";
      onAddComment(fieldPath, comment, userId, userRoleValue);
    },
    [onAddComment, userId, userRole],
  );

  const handleValueChange = useCallback(
    (fieldPath: Array<string | number>, newVal: unknown) => {
      onFormStateChange((prev) => setAt(prev, fieldPath, newVal));
      onSetValue(fieldPath.join("."), newVal, { shouldValidate: true });
    },
    [onFormStateChange, onSetValue],
  );

  const handleAddRow = useCallback(
    (path: Array<string | number>) => {
      onFormStateChange((prev) => {
        const rows = getAt(prev, path) ?? currentValue ?? [];
        const newRow: Record<string, string> = {};
        if (rows.length > 0 && typeof rows[0] === "object") {
          Object.keys(rows[0]).forEach((col) => {
            newRow[col] = "";
          });
        }
        const nextRows = [...rows, newRow];
        onSetValue(fieldKey, nextRows, { shouldValidate: true });
        onNewlyAddedTableRowsChange?.(
          (prevKeys) => new Set([...prevKeys, `${fieldKey}:${rows.length}`]),
        );
        return setAt(prev, path, nextRows);
      });
    },
    [
      currentValue,
      fieldKey,
      onFormStateChange,
      onNewlyAddedTableRowsChange,
      onSetValue,
    ],
  );

  const handleRemoveRow = useCallback(
    (path: Array<string | number>, index: number) => {
      const rowKey = `${fieldKey}:${index}`;
      if (!newlyAddedTableRows.has(rowKey)) return;
      onFormStateChange((prev) => {
        const rows = getAt(prev, path) ?? currentValue ?? [];
        const updated = rows.filter((_: unknown, i: number) => i !== index);
        onSetValue(fieldKey, updated, { shouldValidate: true });
        onNewlyAddedTableRowsChange?.((prevKeys) =>
          shiftIndexedSetKeys(prevKeys, fieldKey, index),
        );
        return setAt(prev, path, updated);
      });
    },
    [
      currentValue,
      fieldKey,
      newlyAddedTableRows,
      onFormStateChange,
      onNewlyAddedTableRowsChange,
      onSetValue,
    ],
  );

  const handleAddColumn = useCallback(
    (path: Array<string | number>, columnName: string) => {
      onFormStateChange((prev) => {
        const rows = getAt(prev, path) ?? currentValue ?? [];
        const updated = rows.map((row: Record<string, unknown>) => ({
          ...row,
          [columnName]: "",
        }));
        onSetValue(fieldKey, updated, { shouldValidate: true });
        onNewlyAddedTableColumnsChange?.(
          (prevKeys) => new Set([...prevKeys, `${fieldKey}:${columnName}`]),
        );
        return setAt(prev, path, updated);
      });
    },
    [
      currentValue,
      fieldKey,
      onFormStateChange,
      onNewlyAddedTableColumnsChange,
      onSetValue,
    ],
  );

  const handleRemoveColumn = useCallback(
    (path: Array<string | number>, columnName: string) => {
      const columnKey = `${fieldKey}:${columnName}`;
      if (!newlyAddedTableColumns.has(columnKey)) return;
      onFormStateChange((prev) => {
        const rows = getAt(prev, path) ?? currentValue ?? [];
        const updated = rows.map((row: Record<string, unknown>) => {
          const newRow = { ...row };
          delete newRow[columnName];
          return newRow;
        });
        onSetValue(fieldKey, updated, { shouldValidate: true });
        onNewlyAddedTableColumnsChange?.((prevKeys) => {
          const newSet = new Set(prevKeys);
          newSet.delete(columnKey);
          return newSet;
        });
        return setAt(prev, path, updated);
      });
    },
    [
      currentValue,
      fieldKey,
      newlyAddedTableColumns,
      onFormStateChange,
      onNewlyAddedTableColumnsChange,
      onSetValue,
    ],
  );

  return (
    <TableRenderer
      searchText={searchText}
      activeMatchPath={activeMatchPath}
      matchedPaths={matchedPaths}
      data={currentValue}
      path={[fieldKey]}
      actualDataWithoutChangeValue={actualDataWithoutChangeValue}
      editingMap={isFullEditMode ? { [fieldKey]: true } : {}}
      commentOnlyMode={false}
      shouldEnableComments={shouldEnableComments}
      shouldEnableStatus={shouldEnableStatus}
      userRole={userRole}
      fieldStatus={fieldStatus}
      onFieldStatusChange={onFieldStatusChange}
      onValueChange={handleValueChange}
      onAddRow={isFullEditMode ? handleAddRow : undefined}
      onRemoveRow={isFullEditMode ? handleRemoveRow : undefined}
      onAddColumn={isFullEditMode ? handleAddColumn : undefined}
      onRemoveColumn={isFullEditMode ? handleRemoveColumn : undefined}
      newlyAddedTableRows={newlyAddedTableRows}
      newlyAddedTableColumns={newlyAddedTableColumns}
      rootData={rootData}
      onRootDataChange={onRootDataChange || onFormStateChange}
      onSourceClick={onSourceClick}
      getComments={getComments}
      onAddComment={handleAddCommentForTable}
      userId={userId}
    />
  );
}
