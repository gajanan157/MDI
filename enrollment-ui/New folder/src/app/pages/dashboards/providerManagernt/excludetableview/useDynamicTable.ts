import { useCallback, useMemo, useRef, useState } from "react";

export type ColumnType = "text" | "number" | "date" | "pincode";

export type ColumnValidationRule = {
  required?: boolean;
  custom?: (value: string, row: RowData) => string | null;
};

export type ColumnMeta = {
  key: string;
  label: string;
  type: ColumnType;
  validation?: ColumnValidationRule;
};

export type RowData = {
  id: string;
  values: Record<string, string>;
};

export type ColumnOverride = Partial<Omit<ColumnMeta, "key">>;

/** Sample/API-ready table payload. Map API responses into this shape later. */
export type DynamicTableSourceData = {
  columns?: string[];
  rows: Array<Record<string, unknown>>;
};

type UseDynamicTableOptions = {
  initialData: DynamicTableSourceData;
  columnOverrides?: Record<string, ColumnOverride>;
};

type ErrorState = Record<string, Record<string, string>>;

const PINCODE_REGEX = /^[1-9]\d{5}$/;

let fallbackIdCounter = 0;

function createUuidFromRandomBytes(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function createId(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      return createUuidFromRandomBytes();
    }
  }

  fallbackIdCounter += 1;
  return `row-${Date.now()}-${fallbackIdCounter}`;
}

function normalizeValue(value: unknown): string {
  return value == null ? "" : String(value);
}

function inferType(columnKey: string, sampleValues: string[]): ColumnType {
  const key = columnKey.toLowerCase();
  if (key.includes("pin")) return "pincode";
  if (key.includes("date") || key.includes("effective")) return "date";

  const nonEmpty = sampleValues.map((v) => v.trim()).filter(Boolean);
  if (nonEmpty.length === 0) return "text";

  const allNumeric = nonEmpty.every((v) => /^-?\d+(\.\d+)?$/.test(v));
  if (allNumeric) return "number";

  const allDate = nonEmpty.every((v) => !Number.isNaN(Date.parse(v)));
  if (allDate) return "date";

  return "text";
}

function deriveColumnsAndRows(
  inputData: DynamicTableSourceData,
  columnOverrides?: Record<string, ColumnOverride>,
): { columns: ColumnMeta[]; rows: RowData[] } {
  const data = Array.isArray(inputData.rows) ? inputData.rows : [];
  const orderedColumns = Array.isArray(inputData.columns)
    ? inputData.columns.map((column) => String(column).trim()).filter(Boolean)
    : [];

  const keysInOrder: string[] = [...orderedColumns].filter(
    (key) => !isSerialNumberColumnKey(key),
  );
  const seen = new Set<string>(keysInOrder);

  data.forEach((row) => {
    if (!row || typeof row !== "object") return;
    Object.keys(row).forEach((key) => {
      if (isSerialNumberColumnKey(key) || seen.has(key)) return;
      seen.add(key);
      keysInOrder.push(key);
    });
  });

  const rows: RowData[] = data.map((row) => {
    const values: Record<string, string> = {};
    keysInOrder.forEach((key) => {
      values[key] = normalizeValue(row[key]);
    });
    return { id: createId(), values };
  });

  const columns: ColumnMeta[] = keysInOrder.map((key) => {
    const sampleValues = rows.map((row) => row.values[key]);
    const override = columnOverrides?.[key];
    return {
      key,
      label: override?.label ?? key,
      type: override?.type ?? inferType(key, sampleValues),
      validation: override?.validation,
    };
  });

  return { columns, rows };
}

function validateByType(type: ColumnType, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (type === "number" && Number.isNaN(Number(trimmed))) {
    return "Enter a valid number.";
  }
  if (type === "date") {
    const isIso = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    const isDmy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.test(trimmed);
    const parsed = isIso
      ? new Date(`${trimmed}T00:00:00`)
      : isDmy
        ? (() => {
            const match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
            if (!match) return null;
            return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
          })()
        : new Date(trimmed);
    if (!parsed || Number.isNaN(parsed.getTime())) {
      return "Enter a valid date.";
    }
  }
  if (type === "pincode" && !PINCODE_REGEX.test(trimmed)) {
    return "Enter a valid 6-digit pincode.";
  }
  return null;
}

function createUniqueColumnKey(base: string, existingKeys: Set<string>): string {
  let key = base;
  let suffix = 1;
  while (existingKeys.has(key)) {
    suffix += 1;
    key = `${base}_${suffix}`;
  }
  return key;
}

/** Serial / SL. No columns are rendered at UI level — exclude from editable data columns. */
export function isSerialNumberColumnKey(key: string): boolean {
  const normalized = key.trim().toLowerCase().replace(/\s+/g, " ");
  return /^(sl\.?\s*no\.?|sr\.?\s*no\.?|s\.?\s*no\.?|serial(\s*(no\.?|number))?)$/i.test(
    normalized,
  );
}

function appendEmptyColumnToRows(rows: RowData[], columnKey: string): RowData[] {
  return rows.map((row) => ({
    ...row,
    values: { ...row.values, [columnKey]: "" },
  }));
}

function insertAtIndex<T>(items: T[], item: T, position?: number): T[] {
  const insertAt =
    typeof position === "number"
      ? Math.min(Math.max(position, 0), items.length)
      : items.length;
  return [...items.slice(0, insertAt), item, ...items.slice(insertAt)];
}

type ColumnInsertPlan = {
  nextColumns: ColumnMeta[];
  columnKey: string;
};

function planColumnInsert(
  currentColumns: ColumnMeta[],
  label: string,
  position: number | undefined,
  type: ColumnType | undefined,
): ColumnInsertPlan | null {
  const base = label.trim();
  if (!base) return null;

  const columnKey = createUniqueColumnKey(
    base,
    new Set(currentColumns.map((column) => column.key)),
  );
  const newColumn: ColumnMeta = {
    key: columnKey,
    label: base,
    type: type ?? inferType(base, []),
  };

  return {
    columnKey,
    nextColumns: insertAtIndex(currentColumns, newColumn, position),
  };
}

export function useDynamicTable({ initialData, columnOverrides }: UseDynamicTableOptions) {
  const initialState = useMemo(
    () => deriveColumnsAndRows(initialData, columnOverrides),
    [initialData, columnOverrides],
  );
  const [columns, setColumns] = useState<ColumnMeta[]>(initialState.columns);
  const [rows, setRows] = useState<RowData[]>(initialState.rows);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ErrorState>({});
  const editSnapshotRef = useRef<Record<string, string> | null>(null);
  /** True when the row currently being edited was created via Insert Row. */
  const isNewInsertedRowRef = useRef(false);

  const getColumnByKey = useCallback(
    (key: string) => columns.find((column) => column.key === key),
    [columns],
  );

  const validateCell = useCallback(
    (row: RowData, columnKey: string, value: string): string | null => {
      const column = getColumnByKey(columnKey);
      if (!column) return null;

      if (column.validation?.required && !value.trim()) {
        return `${column.label} is required.`;
      }

      const typeError = validateByType(column.type, value);
      if (typeError) return typeError;

      if (column.validation?.custom) {
        return column.validation.custom(value, row);
      }
      return null;
    },
    [getColumnByKey],
  );

  const setCellError = useCallback((rowId: string, columnKey: string, message: string | null) => {
    setErrors((current) => {
      const next = { ...current };
      const rowErrors = { ...(next[rowId] ?? {}) };

      if (message) rowErrors[columnKey] = message;
      else delete rowErrors[columnKey];

      if (Object.keys(rowErrors).length === 0) delete next[rowId];
      else next[rowId] = rowErrors;
      return next;
    });
  }, []);

  const updateCell = useCallback(
    (rowId: string, columnKey: string, value: string) => {
      setRows((current) =>
        current.map((row) =>
          row.id === rowId ? { ...row, values: { ...row.values, [columnKey]: value } } : row,
        ),
      );

      const row = rows.find((r) => r.id === rowId);
      if (!row) return;
      const candidateRow = { ...row, values: { ...row.values, [columnKey]: value } };
      const error = validateCell(candidateRow, columnKey, value);
      setCellError(rowId, columnKey, error);
    },
    [rows, setCellError, validateCell],
  );

  const addRow = useCallback(
    (index?: number) => {
      const newRowId = createId();
      setRows((current) => {
        const values = Object.fromEntries(columns.map((column) => [column.key, ""]));
        editSnapshotRef.current = { ...values };
        const newRow: RowData = { id: newRowId, values };
        const insertAt =
          typeof index === "number"
            ? Math.min(Math.max(index, 0), current.length)
            : current.length;
        return [...current.slice(0, insertAt), newRow, ...current.slice(insertAt)];
      });
      // New row opens directly in row-edit mode (textarea visible immediately).
      isNewInsertedRowRef.current = true;
      setIsBulkEditMode(false);
      setEditingRowId(newRowId);
    },
    [columns],
  );

  const deleteRow = useCallback((rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
    setErrors((current) => {
      const next = { ...current };
      delete next[rowId];
      return next;
    });
    setEditingRowId((current) => (current === rowId ? null : current));
  }, []);

  const moveRow = useCallback((rowId: string, direction: "up" | "down") => {
    setRows((current) => {
      const index = current.findIndex((row) => row.id === rowId);
      if (index === -1) return current;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }, []);

  const addColumn = useCallback(
    (label: string, position?: number, type?: ColumnType) => {
      setColumns((currentColumns) => {
        const plan = planColumnInsert(currentColumns, label, position, type);
        if (!plan) return currentColumns;

        setRows((currentRows) => appendEmptyColumnToRows(currentRows, plan.columnKey));
        return plan.nextColumns;
      });
    },
    [],
  );

  const deleteColumn = useCallback((columnKey: string) => {
    setColumns((current) => current.filter((column) => column.key !== columnKey));
    setRows((current) =>
      current.map((row) => {
        const nextValues = { ...row.values };
        delete nextValues[columnKey];
        return { ...row, values: nextValues };
      }),
    );
    setErrors((current) => {
      const next: ErrorState = {};
      Object.entries(current).forEach(([rowId, rowErrors]) => {
        const mutable = { ...rowErrors };
        delete mutable[columnKey];
        if (Object.keys(mutable).length > 0) next[rowId] = mutable;
      });
      return next;
    });
  }, []);

  const renameColumn = useCallback((columnKey: string, label: string) => {
    const nextLabel = label.trim();
    if (!nextLabel) return;
    setColumns((current) =>
      current.map((column) =>
        column.key === columnKey ? { ...column, label: nextLabel } : column,
      ),
    );
  }, []);

  const setSingleRowEdit = useCallback((rowId: string | null) => {
    if (rowId) {
      setRows((current) => {
        const row = current.find((item) => item.id === rowId);
        editSnapshotRef.current = row ? { ...row.values } : {};
        return current;
      });
      isNewInsertedRowRef.current = false;
      setIsBulkEditMode(false);
    } else {
      editSnapshotRef.current = null;
      isNewInsertedRowRef.current = false;
    }
    setEditingRowId(rowId);
  }, []);

  const cancelSingleRowEdit = useCallback(() => {
    const rowId = editingRowId;
    if (!rowId) return;

    // Inserted row + Cancel: remove the temporary record entirely.
    if (isNewInsertedRowRef.current) {
      setRows((current) => current.filter((row) => row.id !== rowId));
      setErrors((current) => {
        const next = { ...current };
        delete next[rowId];
        return next;
      });
      editSnapshotRef.current = null;
      isNewInsertedRowRef.current = false;
      setEditingRowId(null);
      return;
    }

    const snapshot = editSnapshotRef.current;
    if (snapshot) {
      setRows((current) =>
        current.map((row) =>
          row.id === rowId ? { ...row, values: { ...snapshot } } : row,
        ),
      );
      setErrors((current) => {
        const next = { ...current };
        delete next[rowId];
        return next;
      });
    }

    editSnapshotRef.current = null;
    isNewInsertedRowRef.current = false;
    setEditingRowId(null);
  }, [editingRowId]);

  const toggleBulkEdit = useCallback(() => {
    setIsBulkEditMode((current) => !current);
    editSnapshotRef.current = null;
    isNewInsertedRowRef.current = false;
    setEditingRowId(null);
  }, []);

  const isRowEditable = useCallback(
    (rowId: string) => isBulkEditMode || editingRowId === rowId,
    [editingRowId, isBulkEditMode],
  );

  const validateAll = useCallback((): boolean => {
    const nextErrors: ErrorState = {};
    rows.forEach((row) => {
      columns.forEach((column) => {
        const error = validateCell(row, column.key, row.values[column.key] ?? "");
        if (error) {
          if (!nextErrors[row.id]) nextErrors[row.id] = {};
          nextErrors[row.id]![column.key] = error;
        }
      });
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [columns, rows, validateCell]);

  /** API-ready snapshot (labels as keys; no Sr. No / internal row ids). */
  const getSubmitPayload = useCallback((): DynamicTableSourceData => {
    return {
      columns: columns.map((column) => column.label),
      rows: rows.map((row) => {
        const record: Record<string, string> = {};
        columns.forEach((column) => {
          record[column.label] = row.values[column.key] ?? "";
        });
        return record;
      }),
    };
  }, [columns, rows]);

  const exitEditModes = useCallback(() => {
    editSnapshotRef.current = null;
    isNewInsertedRowRef.current = false;
    setIsBulkEditMode(false);
    setEditingRowId(null);
  }, []);

  return {
    columns,
    rows,
    errors,
    isBulkEditMode,
    editingRowId,
    isRowEditable,
    setSingleRowEdit,
    cancelSingleRowEdit,
    toggleBulkEdit,
    updateCell,
    addRow,
    deleteRow,
    moveRow,
    addColumn,
    renameColumn,
    deleteColumn,
    validateAll,
    getSubmitPayload,
    exitEditModes,
  };
}

