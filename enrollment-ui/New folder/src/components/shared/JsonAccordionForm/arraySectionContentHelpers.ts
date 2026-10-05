import { getAt, setAt } from "./utils";

export function isCommentsArrayField(fieldKey: string, value: unknown): boolean {
  const fieldKeyLower = fieldKey.toLowerCase().trim();
  if (!fieldKeyLower.includes("comment")) {
    return false;
  }
  return Array.isArray(value);
}

export type ArrayTableHandlerContext = {
  fieldKey: string;
  currentValue: any[];
  formState: any;
  onFormStateChange: (newState: any) => void;
  onSetValue: (key: string, value: any, options?: any) => void;
  newlyAddedTableRows: Set<string>;
  newlyAddedTableColumns: Set<string>;
  onNewlyAddedTableRowsChange?: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
  onNewlyAddedTableColumnsChange?: (
    updater: (prev: Set<string>) => Set<string>,
  ) => void;
};

function createEmptyRowFromTemplate(currentValue: any[]): Record<string, string> {
  const newRow: Record<string, string> = {};
  if (currentValue.length > 0 && typeof currentValue[0] === "object") {
    Object.keys(currentValue[0]).forEach((col) => {
      newRow[col] = "";
    });
  }
  return newRow;
}

export function createArrayTableAddRowHandler({
  fieldKey,
  currentValue,
  onFormStateChange,
  onSetValue,
  onNewlyAddedTableRowsChange,
}: ArrayTableHandlerContext) {
  return (path: Array<string | number>) => {
    const newRow = createEmptyRowFromTemplate(currentValue);
    onFormStateChange((prev) => {
      const rows = getAt(prev, path) ?? currentValue ?? [];
      const updated = [...rows, newRow];
      onSetValue(fieldKey, updated, { shouldValidate: true });
      onNewlyAddedTableRowsChange?.(
        (prevKeys) => new Set([...prevKeys, `${fieldKey}:${rows.length}`]),
      );
      return setAt(prev, path, updated);
    });
  };
}

export function createArrayTableRemoveRowHandler({
  fieldKey,
  currentValue,
  onFormStateChange,
  onSetValue,
  newlyAddedTableRows,
  onNewlyAddedTableRowsChange,
}: ArrayTableHandlerContext) {
  return (path: Array<string | number>, index: number) => {
    const rowKey = `${fieldKey}:${index}`;
    if (!newlyAddedTableRows.has(rowKey)) return;

    onFormStateChange((prev) => {
      const rows = getAt(prev, path) ?? currentValue ?? [];
      const updated = rows.filter((_: any, i: number) => i !== index);
      onSetValue(fieldKey, updated, { shouldValidate: true });
      onNewlyAddedTableRowsChange?.((prevKeys) =>
        shiftIndexedSetKeys(prevKeys, fieldKey, index),
      );
      return setAt(prev, path, updated);
    });
  };
}

export function createArrayTableAddColumnHandler({
  fieldKey,
  currentValue,
  onFormStateChange,
  onSetValue,
  onNewlyAddedTableColumnsChange,
}: ArrayTableHandlerContext) {
  return (path: Array<string | number>, columnName: string) => {
    onFormStateChange((prev) => {
      const rows = getAt(prev, path) ?? currentValue ?? [];
      const updated = rows.map((row: any) => ({
        ...row,
        [columnName]: "",
      }));
      onSetValue(fieldKey, updated, { shouldValidate: true });
      onNewlyAddedTableColumnsChange?.(
        (prevKeys) => new Set([...prevKeys, `${fieldKey}:${columnName}`]),
      );
      return setAt(prev, path, updated);
    });
  };
}

export function createArrayTableRemoveColumnHandler({
  fieldKey,
  currentValue,
  onFormStateChange,
  onSetValue,
  newlyAddedTableColumns,
  onNewlyAddedTableColumnsChange,
}: ArrayTableHandlerContext) {
  return (path: Array<string | number>, columnName: string) => {
    const columnKey = `${fieldKey}:${columnName}`;
    if (!newlyAddedTableColumns.has(columnKey)) return;

    onFormStateChange((prev) => {
      const rows = getAt(prev, path) ?? currentValue ?? [];
      const updated = rows.map((row: any) => {
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
  };
}

export function createArrayTableRowHandlers(
  isFullEditMode: boolean,
  context: ArrayTableHandlerContext,
) {
  if (!isFullEditMode) {
    return {
      onAddRow: undefined,
      onRemoveRow: undefined,
      onAddColumn: undefined,
      onRemoveColumn: undefined,
    };
  }

  return {
    onAddRow: createArrayTableAddRowHandler(context),
    onRemoveRow: createArrayTableRemoveRowHandler(context),
    onAddColumn: createArrayTableAddColumnHandler(context),
    onRemoveColumn: createArrayTableRemoveColumnHandler(context),
  };
}

export function isArraySectionOpen(
  openPaths: Set<string> | undefined,
  fieldKey: string,
): boolean | undefined {
  if (!openPaths) return undefined;
  if (openPaths.has(fieldKey)) return true;

  return Array.from(openPaths).some((path) => {
    const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
    return normalizedPath === fieldKey || normalizedPath.startsWith(`${fieldKey}.`);
  });
}

export function shiftIndexedSetKeys(
  keys: Set<string>,
  fieldKey: string,
  removedIndex: number,
): Set<string> {
  const updatedSet = new Set<string>();
  keys.forEach((key) => {
    const [fieldName, idx] = key.split(":");
    if (fieldName !== fieldKey) {
      updatedSet.add(key);
      return;
    }

    const oldIdx = parseInt(idx, 10);
    if (oldIdx > removedIndex) {
      updatedSet.add(`${fieldName}:${oldIdx - 1}`);
    } else if (oldIdx < removedIndex) {
      updatedSet.add(key);
    }
  });
  return updatedSet;
}
