import { formatKey, isListingArray } from "./utils";
import { isStructuredTable } from "./structuredTableHelpers";
import { resolveFieldSources } from "./fieldHelpers";

export type FieldType = "normal" | "list" | "boolean" | "number";

export type UserRole = "maker1" | "maker2" | "checker" | "superadmin" | null;

export type CellSource = { page_number?: number; snippet?: string };

export function getBooleanBadgeClassName(value: unknown): string {
  if (typeof value === "boolean" && value) {
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  }
  if (typeof value === "boolean" && !value) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export function buildCellFieldPath(cellPath: Array<string | number>): string {
  let cellFieldPath = "";
  for (let i = 0; i < cellPath.length; i++) {
    const part = cellPath[i];
    if (typeof part === "number") {
      cellFieldPath += `[${part}]`;
    } else {
      cellFieldPath += i === 0 ? String(part) : `.${String(part)}`;
    }
  }
  return cellFieldPath;
}

export function parseBracketPath(fieldPath: string): string[] {
  const pathParts: string[] = [];
  const parts = fieldPath.split(".");
  for (const part of parts) {
    const bracketMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (bracketMatch) {
      const [, keyPart, indexStr] = bracketMatch;
      pathParts.push(keyPart);
      pathParts.push(`[${indexStr}]`);
    } else {
      pathParts.push(part);
    }
  }
  return pathParts;
}

export function navigateRootDataPath(rootData: any, pathParts: string[]): any {
  let fieldObj: any = rootData;
  for (const part of pathParts) {
    if (!fieldObj || typeof fieldObj !== "object") {
      return null;
    }
    if (part.startsWith("[") && part.endsWith("]")) {
      const index = Number(part.slice(1, -1));
      if (
        Number.isNaN(index) ||
        !Array.isArray(fieldObj) ||
        index < 0 ||
        index >= fieldObj.length
      ) {
        return null;
      }
      fieldObj = fieldObj[index];
    } else if (part in fieldObj) {
      fieldObj = fieldObj[part];
    } else {
      return null;
    }
  }
  return fieldObj;
}

function getSourcesFromObject(obj: any): CellSource[] | null {
  if (!obj || typeof obj !== "object" || !("sources" in obj)) {
    return null;
  }
  const sourcesArray = obj.sources;
  if (Array.isArray(sourcesArray) && sourcesArray.length > 0) {
    return sourcesArray;
  }
  return null;
}

function shouldDebugCellSources(cellFieldPath: string): boolean {
  return cellFieldPath.includes("modern_and_advanced_treatments");
}

export interface DetectCellSourcesParams {
  cellFieldPath: string;
  col: string;
  cellValue: any;
  row: any;
  rowIndex: number;
  rootData?: any;
  actualDataWithoutChangeValue?: any;
  path: Array<string | number>;
  data: any[];
}

function detectSourcesFromResolveFieldSources(
  params: DetectCellSourcesParams,
): CellSource[] | null {
  const resolved = resolveFieldSources(
    params.rootData,
    params.cellFieldPath,
    params.cellValue,
    params.actualDataWithoutChangeValue,
  );
  if (resolved && resolved.length > 0) {
    return resolved as CellSource[];
  }
  return null;
}

export function detectCellSources(params: DetectCellSourcesParams): CellSource[] | null {
  return (
    detectSourcesFromCellValue(params.cellValue) ??
    detectSourcesFromRootData(params.rootData, params.cellFieldPath) ??
    detectSourcesFromResolveFieldSources(params) ??
    detectSourcesFromRootDataArray(
      params.rootData,
      params.path,
      params.rowIndex,
      params.col,
    ) ??
    detectSourcesFromRowColumn(params.row, params.col) ??
    detectSourcesFromRow(params.row) ??
    detectSourcesFromDataArray(params.data, params.rowIndex)
  );
}

export function resolveRowSources(
  rootData: unknown,
  rowFieldPath: string,
  row: unknown,
  sectionData?: unknown,
): CellSource[] | null {
  const resolved = resolveFieldSources(rootData, rowFieldPath, row, sectionData);
  if (resolved && resolved.length > 0) {
    return resolved as CellSource[];
  }
  return getSourcesFromObject(row);
}

function detectSourcesFromCellValue(cellValue: any): CellSource[] | null {
  if (!cellValue || typeof cellValue !== "object" || Array.isArray(cellValue)) {
    return null;
  }
  return getSourcesFromObject(cellValue);
}

function detectSourcesFromRowColumn(row: any, col: string): CellSource[] | null {
  if (!row || !col || typeof row !== "object" || row === null) {
    return null;
  }
  const colValue = row[col];
  if (!colValue || typeof colValue !== "object" || Array.isArray(colValue)) {
    return null;
  }
  return getSourcesFromObject(colValue);
}

function detectSourcesFromRow(row: any): CellSource[] | null {
  if (!row || typeof row !== "object" || row === null) {
    return null;
  }
  return getSourcesFromObject(row);
}

function detectSourcesFromRootData(
  rootData: any,
  cellFieldPath: string,
): CellSource[] | null {
  if (!rootData || !cellFieldPath) {
    return null;
  }
  const pathParts = parseBracketPath(cellFieldPath);
  const fieldSources = getSourcesFromObject(
    navigateRootDataPath(rootData, pathParts),
  );
  if (fieldSources) {
    return fieldSources;
  }
  return findSourcesOnAncestors(rootData, pathParts, cellFieldPath);
}

function findSourcesOnAncestors(
  rootData: any,
  pathParts: string[],
  cellFieldPath: string,
): CellSource[] | null {
  const shouldDebug = shouldDebugCellSources(cellFieldPath);
  for (let i = pathParts.length - 1; i > 0; i--) {
    const ancestorSources = getSourcesFromObject(
      navigateRootDataPath(rootData, pathParts.slice(0, i)),
    );
    if (ancestorSources) {
      if (shouldDebug) {
      }
      return ancestorSources;
    }
  }
  return null;
}

function detectSourcesFromRootDataArray(
  rootData: any,
  path: Array<string | number>,
  rowIndex: number,
  col: string,
): CellSource[] | null {
  if (
    !rootData ||
    typeof rootData !== "object" ||
    path.length === 0 ||
    typeof rowIndex !== "number" ||
    rowIndex < 0
  ) {
    return null;
  }
  const pathKey = String(path[0]);
  if (!(pathKey in rootData)) {
    return null;
  }
  const pathArray = rootData[pathKey];
  if (!Array.isArray(pathArray) || rowIndex >= pathArray.length) {
    return null;
  }
  const rowObj = pathArray[rowIndex];
  const rowObjSources = getSourcesFromObject(rowObj);
  if (rowObjSources) {
    return rowObjSources;
  }
  if (!col || !rowObj || typeof rowObj !== "object" || !(col in rowObj)) {
    return null;
  }
  const colValue = rowObj[col];
  if (!colValue || typeof colValue !== "object" || Array.isArray(colValue)) {
    return null;
  }
  return getSourcesFromObject(colValue);
}

function detectSourcesFromDataArray(
  data: any[],
  rowIndex: number,
): CellSource[] | null {
  if (!data || !Array.isArray(data) || rowIndex < 0 || rowIndex >= data.length) {
    return null;
  }
  return getSourcesFromObject(data[rowIndex]);
}

export function isFormInteractiveElement(target: HTMLElement): boolean {
  return (
    isActualFormControl(target) ||
    target.tagName === "TD" ||
    target.tagName === "TH" ||
    target.tagName === "TR" ||
    !!target.closest("table") ||
    !!target.closest("[data-table-cell]") ||
    !!target.closest("[data-source-button]") ||
    !!target.closest("[data-page-number]")
  );
}

/** True only for real form controls — not table cells used for PDF navigation. */
export function isActualFormControl(target: HTMLElement): boolean {
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.tagName === "BUTTON" ||
    target.tagName === "A" ||
    !!target.closest("button") ||
    !!target.closest("input") ||
    !!target.closest("textarea") ||
    !!target.closest("select") ||
    !!target.closest("a")
  );
}

/** Stop accordion toggle without blocking native input/button behavior. */
export function stopAccordionTogglePropagation(event: {
  stopPropagation: () => void;
  target: EventTarget | null;
}): void {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (isFormInteractiveElement(target)) {
    event.stopPropagation();
  }
}

export function isArrayOfStructuredTables(cellValue: any): boolean {
  if (!Array.isArray(cellValue) || cellValue.length === 0) {
    return false;
  }
  const firstItem = cellValue[0];
  if (!isStructuredTable(firstItem)) {
    return false;
  }
  return cellValue.every((item: any) => isStructuredTable(item));
}

export function isListingCellValue(
  cellValue: any,
  isArray: boolean,
  isArrayOfStructuredTables: boolean,
  data: any[],
  rowIndex: number,
  col: string,
  editable: boolean,
): boolean {
  const isEmptyArray =
    isArray && cellValue.length === 0 && !isArrayOfStructuredTables;
  const hasListInOtherRows =
    isEmptyArray &&
    data.some(
      (r: any, idx: number) =>
        idx !== rowIndex &&
        Array.isArray(r?.[col]) &&
        r[col].length > 0 &&
        isListingArray(r[col]),
    );
  return (
    isArray &&
    !isArrayOfStructuredTables &&
    (isListingArray(cellValue) || (isEmptyArray && (hasListInOtherRows || editable)))
  );
}

export function getListingItemComment(
  row: any,
  col: string,
  itemIndex: number,
): string | null {
  const comments = row?._comments?.[col];
  if (Array.isArray(comments)) {
    return comments[itemIndex] ?? null;
  }
  if (itemIndex === 0) {
    return comments ?? null;
  }
  return null;
}

export function formatNestedValueDisplay(val: unknown): string {
  if (typeof val === "string") {
    return val;
  }
  if (Array.isArray(val)) {
    return `${val.length} items`;
  }
  if (typeof val === "object" && val !== null) {
    return "object";
  }
  return String(val);
}

export function getListingItemDisplayText(item: any, itemValue: any): string {
  if (typeof item !== "object" || item === null || Array.isArray(item)) {
    return String(itemValue);
  }
  if ("text" in item && typeof item.text === "string") {
    return item.text;
  }
  if (item._value !== undefined) {
    return String(item._value);
  }
  return String(itemValue);
}

export function formatListingItemFallbackDisplay(item: Record<string, any>): string {
  const keys = Object.keys(item);
  if (keys.length === 0) {
    return "Empty object";
  }
  const displayKeys = keys.filter((k) => k !== "sources");
  if (displayKeys.length === 0) {
    return "—";
  }
  const entries = displayKeys.slice(0, 2).map((key) => {
    const val = item[key];
    return `${formatKey(key)}: ${formatNestedValueDisplay(val)}`;
  });
  const more =
    displayKeys.length > 2 ? `, +${displayKeys.length - 2} more` : "";
  return entries.join(", ") + more;
}

function formatArrayPropertyValue(val: any[]): string {
  if (val.length === 0) {
    return "[]";
  }
  const suffix = val.length !== 1 ? "s" : "";
  return `[${val.length} item${suffix}]`;
}

function formatNestedObjectPropertyValue(val: Record<string, unknown>): string {
  const objKeys = Object.keys(val);
  if (objKeys.length === 0) {
    return "{}";
  }
  const suffix = objKeys.length !== 1 ? "s" : "";
  return `{${objKeys.length} key${suffix}}`;
}

export function formatObjectPropertyValue(val: any): string {
  if (val === null || val === undefined) {
    return String(val);
  }
  if (typeof val === "string") {
    return val.length > 100 ? val.substring(0, 100) + "..." : val;
  }
  if (typeof val === "boolean") {
    return val ? "true" : "false";
  }
  if (typeof val === "number") {
    return String(val);
  }
  if (Array.isArray(val)) {
    return formatArrayPropertyValue(val);
  }
  if (typeof val === "object") {
    return formatNestedObjectPropertyValue(val);
  }
  return String(val);
}

const INTERNAL_OBJECT_FIELDS = [
  "sources",
  "references",
  "limits",
  "conditions",
  "notes",
  "_field_metadata",
  "_section_metadata",
];

export function formatArrayCellDisplayText(cellValue: any): string {
  if (!Array.isArray(cellValue)) {
    return String(cellValue);
  }
  if (cellValue.length === 0) {
    return "No items";
  }
  const allPrimitives = cellValue.every(
    (item) =>
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean",
  );
  if (allPrimitives) {
    return cellValue.join(", ");
  }
  const suffix = cellValue.length !== 1 ? "s" : "";
  return `${cellValue.length} item${suffix}`;
}

export function formatObjectCellDisplayText(cellValue: Record<string, any>): string {
  const keys = Object.keys(cellValue);
  if (keys.length === 0) {
    return "Empty object";
  }
  const displayKeys = keys.filter((key) => !INTERNAL_OBJECT_FIELDS.includes(key));
  if (displayKeys.length === 0) {
    return "No displayable fields";
  }
  const entries = displayKeys.map((key) => {
    return `${formatKey(key)}: ${formatObjectPropertyValue(cellValue[key])}`;
  });
  return entries.join("\n");
}

export function formatCellValueForDisplay(cellValue: any): string {
  if (Array.isArray(cellValue)) {
    return formatArrayCellDisplayText(cellValue);
  }
  if (typeof cellValue === "object" && cellValue !== null) {
    return formatObjectCellDisplayText(cellValue);
  }
  return String(cellValue);
}

export function lookupConditionSources(
  condition: any,
  rootData: any,
  currentPath: string | undefined,
): CellSource[] | null {
  const directSources = condition?.sources ?? condition?.SOURCES;
  if (Array.isArray(directSources) && directSources.length > 0) {
    return directSources;
  }

  if (!rootData || !currentPath) {
    return null;
  }

  const resolved = resolveFieldSources(rootData, currentPath, condition);
  if (resolved && resolved.length > 0) {
    return resolved as CellSource[];
  }

  try {
    const pathParts = parseBracketPath(currentPath);
    for (let i = pathParts.length; i > 0; i--) {
      const ancestorSources = getSourcesFromObject(
        navigateRootDataPath(rootData, pathParts.slice(0, i)),
      );
      if (ancestorSources) {
        return ancestorSources;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export interface ResolveListingItemSourcesParams {
  item: unknown;
  itemIndex: number;
  cellFieldPath: string;
  rowFieldPath: string;
  rootData?: unknown;
  row?: unknown;
  actualDataWithoutChangeValue?: unknown;
  path: Array<string | number>;
  rowIndex: number;
  col: string;
  data: unknown[];
}

export function resolveListingItemSources(
  params: ResolveListingItemSourcesParams,
): CellSource[] | null {
  const itemFieldPath = `${params.cellFieldPath}[${params.itemIndex}]`;

  const fromItem = detectCellSources({
    cellFieldPath: itemFieldPath,
    col: params.col,
    cellValue: params.item,
    row: params.row,
    rowIndex: params.rowIndex,
    rootData: params.rootData,
    actualDataWithoutChangeValue: params.actualDataWithoutChangeValue,
    path: params.path,
    data: params.data as any[],
  });

  if (hasSourceWithPage(fromItem)) {
    return fromItem;
  }

  const fromRow = resolveRowSources(
    params.rootData,
    params.rowFieldPath,
    params.row,
    params.actualDataWithoutChangeValue,
  );

  if (hasSourceWithPage(fromRow)) {
    return fromRow;
  }

  return fromItem ?? fromRow;
}

export function findSourceWithPage(
  sources: CellSource[] | null | undefined,
): CellSource | null {
  if (!sources || sources.length === 0) {
    return null;
  }
  return sources.find((s) => s.page_number) ?? null;
}

export function hasSourceWithPage(
  sources: CellSource[] | null | undefined,
): boolean {
  return !!sources?.some((s) => s?.page_number);
}

export function resolveFirstAvailableSources(
  sources: CellSource[] | null | undefined,
  cellSources: CellSource[] | null | undefined,
  resolvedSources: CellSource[] | null,
): CellSource[] | null {
  if (sources && Array.isArray(sources) && sources.length > 0) {
    return sources;
  }
  if (cellSources && cellSources.length > 0) {
    return cellSources;
  }
  return resolvedSources;
}

export function getDefaultColumnValue(
  type: "string" | "number" | "boolean" | "array" | "object",
): unknown {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
}

export function inferFieldTypesFromColumns(
  columns: string[],
  data: any[],
): Record<string, FieldType> {
  const types: Record<string, FieldType> = {};
  columns.forEach((col) => {
    const sampleValue = data.find(
      (row: any) => row?.[col] !== undefined && row?.[col] !== null,
    )?.[col];
    if (Array.isArray(sampleValue)) {
      types[col] = "list";
    } else if (typeof sampleValue === "boolean") {
      types[col] = "boolean";
    } else if (typeof sampleValue === "number") {
      types[col] = "number";
    } else {
      types[col] = "normal";
    }
  });
  return types;
}

export function createRowFromFieldTypes(
  columns: string[],
  fieldTypes: Record<string, FieldType>,
  formValues: Record<string, FieldType>,
): Record<string, unknown> {
  const newRow: Record<string, unknown> = {};
  columns.forEach((col) => {
    const fieldType = formValues[col] || fieldTypes[col] || "normal";
    switch (fieldType) {
      case "list":
        newRow[col] = [];
        break;
      case "boolean":
        newRow[col] = false;
        break;
      case "number":
        newRow[col] = 0;
        break;
      default:
        newRow[col] = "";
    }
  });
  return newRow;
}

const SERIAL_NUMBER_PATTERNS = [
  "sl. no.",
  "sl no",
  "sr. no.",
  "sr no",
  "serial number",
  "serial no",
  "serialno",
  "sno",
  "no.",
  "number",
  "row_number",
  "row number",
];

export function isSerialNumberColumn(columnName: string): boolean {
  const normalizedName = columnName.toLowerCase().trim();
  return SERIAL_NUMBER_PATTERNS.some((pattern) =>
    normalizedName.includes(pattern),
  );
}

export function isTableRowNewlyAdded(
  rowIndex: number,
  parentPath: string,
  newlyAddedTableRows: Set<string>,
): boolean {
  return newlyAddedTableRows.has(`${parentPath}:${rowIndex}`);
}

export function isTableColumnNewlyAdded(
  columnName: string,
  parentPath: string,
  newlyAddedTableColumns: Set<string>,
): boolean {
  return newlyAddedTableColumns.has(`${parentPath}:${columnName}`);
}

export function getDefaultColumnWidths(
  columns: string[],
  shouldEnableComments: boolean,
  shouldEnableStatus: boolean,
): Record<string, number> {
  const defaultWidths: Record<string, number> = {};
  columns.forEach((col, index) => {
    const keyLower = col.toLowerCase().trim();
    let width = 150;
    if (
      keyLower === "definition" ||
      keyLower === "definitions" ||
      keyLower === "description" ||
      keyLower === "clause" ||
      keyLower === "condition"
    ) {
      width = 400;
    }
    if (index === 0 && width === 150) {
      width = 160;
    }
    defaultWidths[col] = width;
  });
  if (shouldEnableComments) {
    defaultWidths["_comment"] = 200;
  }
  if (shouldEnableStatus) {
    defaultWidths["_status"] = 150;
  }
  return defaultWidths;
}

export function collectTableColumns(data: any[]): string[] {
  const allKeys = new Set<string>();
  const internalFields = [
    "_comments",
    "_status",
    "_comment",
    "_newComment",
    "_newComments",
    "_value",
  ];
  data.forEach((row) => {
    if (typeof row === "object" && row !== null) {
      Object.keys(row).forEach((key) => {
        if (!internalFields.includes(key)) {
          allKeys.add(key);
        }
      });
    }
  });
  return Array.from(allKeys);
}

export function sortTableColumns(
  columns: string[],
  path: Array<string | number>,
): string[] {
  const isModernTreatments =
    path.length > 0 &&
    String(path[0]).includes("modern_and_advanced_treatments");
  if (!isModernTreatments) {
    return columns;
  }
  return [...columns].sort((a, b) => {
    if (a === "treatment_name" && b !== "treatment_name") return -1;
    if (b === "treatment_name" && a !== "treatment_name") return 1;
    return 0;
  });
}

export function shouldExpandTableForSearch(
  path: Array<string | number>,
  searchText: string | undefined,
  activeMatchPath: string | null | undefined,
  matchedPaths: string[],
  initialRowLimit: number,
): boolean {
  if (!searchText || path.length === 0) {
    return false;
  }
  const tablePathStr = buildCellFieldPath(path);
  if (!tablePathStr) {
    return false;
  }
  const pathsToCheck = activeMatchPath
    ? [activeMatchPath, ...matchedPaths]
    : matchedPaths;
  const escapedPath = tablePathStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const matchPath of pathsToCheck) {
    if (!matchPath.startsWith(`${tablePathStr}[`)) {
      continue;
    }
    const match = matchPath.match(new RegExp(`^${escapedPath}\\[(\\d+)\\]`));
    if (match && parseInt(match[1], 10) >= initialRowLimit) {
      return true;
    }
  }
  return false;
}
