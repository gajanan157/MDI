import type { MouseEvent } from "react";

export interface StructuredTable {
  table_id?: string;
  title?: string;
  headers: string[];
  rows: Array<{
    row_number?: number;
    cells: string[];
    sources?: Array<{ page_number?: number; snippet?: string }>;
  }>;
  footnotes?: any[];
  sources?: Array<{ page_number?: number; snippet?: string }>;
}

export type TableSource = { page_number?: number; snippet?: string };

/** Helper to check if data is a structured table. */
export function isStructuredTable(data: any): data is StructuredTable {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  if (!("headers" in data) || !("rows" in data)) {
    return false;
  }

  if (!Array.isArray(data.headers) || data.headers.length === 0) {
    return false;
  }

  if (!Array.isArray(data.rows)) {
    return false;
  }

  if (data.rows.length > 0) {
    const allRowsValid = data.rows.every(
      (row: any) =>
        row &&
        typeof row === "object" &&
        !Array.isArray(row) &&
        "cells" in row &&
        Array.isArray(row.cells),
    );
    if (!allRowsValid) {
      return false;
    }
  }

  return true;
}

export function normalizeTablePath(path: string): string {
  return path.replace(/\[(\d+)\]/g, ".$1");
}

export function isSerialNumberColumn(header: string): boolean {
  const headerLower = header.toLowerCase().trim();
  return (
    headerLower === "no" ||
    headerLower === "s no" ||
    headerLower === "sl. no." ||
    headerLower === "sl no" ||
    headerLower === "s.no" ||
    headerLower === "sl.no." ||
    headerLower === "serial no" ||
    headerLower === "serial no." ||
    headerLower === "serial number" ||
    headerLower.startsWith("serial")
  );
}

export function isItemNameColumn(header: string): boolean {
  const normalizedHeader = header.toLowerCase().trim();
  return (
    normalizedHeader.includes("procedure") ||
    normalizedHeader.includes("item") ||
    normalizedHeader.includes("name") ||
    normalizedHeader.includes("description")
  );
}

export function isTwoColumnLayout(headers: string[]): boolean {
  const headerCounts = new Map<string, number>();
  headers.forEach((header) => {
    const normalized = header.toLowerCase().trim();
    headerCounts.set(normalized, (headerCounts.get(normalized) || 0) + 1);
  });
  return Array.from(headerCounts.values()).some((count) => count > 1);
}

export interface ColumnSizing {
  size: number;
  minSize: number;
  maxSize: number;
}

export function getColumnSizing(
  header: string,
  isFirstColumn: boolean,
): ColumnSizing {
  const headerLower = header.toLowerCase().trim();
  let size = isFirstColumn ? 60 : 180;
  let minSize = isFirstColumn ? 50 : 100;
  let maxSize = isFirstColumn ? 100 : 500;

  if (
    !isFirstColumn &&
    (headerLower === "definition" ||
      headerLower === "definitions" ||
      headerLower === "description" ||
      headerLower === "clause" ||
      headerLower === "condition")
  ) {
    size = 380;
    minSize = 260;
    maxSize = 900;
  }

  return { size, minSize, maxSize };
}

function navigateObjectPath(rootData: unknown, fieldPath: string): unknown {
  try {
    const pathParts = fieldPath.split(".");
    let fieldObj: unknown = rootData;
    for (const part of pathParts) {
      if (!fieldObj || typeof fieldObj !== "object") {
        return null;
      }
      const numPart = Number(part);
      const isNumeric = !Number.isNaN(numPart) && part === String(numPart);
      if (isNumeric && Array.isArray(fieldObj)) {
        fieldObj = fieldObj[numPart];
      } else if (part in (fieldObj as Record<string, unknown>)) {
        fieldObj = (fieldObj as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }
    return fieldObj;
  } catch {
    return null;
  }
}

function getSourcesFromObject(obj: unknown): TableSource[] | null {
  if (!obj || typeof obj !== "object" || !("sources" in obj)) {
    return null;
  }
  const sourcesArray = (obj as { sources?: TableSource[] }).sources;
  if (Array.isArray(sourcesArray) && sourcesArray.length > 0) {
    return sourcesArray;
  }
  return null;
}

export function detectCellSources(options: {
  rowIndex: number;
  table: StructuredTable;
  rootData?: unknown;
  fieldPath?: string;
  hasSourceClickHandler: boolean;
}): TableSource[] | null {
  const { rowIndex, table, rootData, fieldPath, hasSourceClickHandler } =
    options;
  if (!hasSourceClickHandler) {
    return null;
  }

  const currentRow = table.rows[rowIndex];
  if (currentRow?.sources && currentRow.sources.length > 0) {
    return currentRow.sources;
  }

  if (rootData && fieldPath) {
    const rowFieldPath = `${fieldPath}.rows[${rowIndex}]`;
    const rowSources = getSourcesFromObject(
      navigateObjectPath(rootData, rowFieldPath),
    );
    if (rowSources) {
      return rowSources;
    }
  }

  if (table.sources && table.sources.length > 0) {
    return table.sources;
  }

  if (rootData && fieldPath) {
    const tableSources = getSourcesFromObject(
      navigateObjectPath(rootData, fieldPath),
    );
    if (tableSources) {
      return tableSources;
    }
  }

  return null;
}

export function resolveSourcesToUse(
  cellSources: TableSource[] | null,
  tableSources?: TableSource[],
): TableSource[] | null {
  if (cellSources && cellSources.length > 0) {
    return cellSources;
  }
  if (tableSources && tableSources.length > 0) {
    return tableSources;
  }
  return null;
}

function sourcesHavePageNumber(sources: TableSource[]): boolean {
  return sources.some((source) => source.page_number);
}

export function hasClickableCellSource(
  cellSources: TableSource[] | null,
  tableSources?: TableSource[],
): boolean {
  if (cellSources && cellSources.length > 0) {
    return sourcesHavePageNumber(cellSources);
  }
  if (tableSources && tableSources.length > 0) {
    return sourcesHavePageNumber(tableSources);
  }
  return false;
}

export function getCellClickTitle(
  cellSources: TableSource[] | null,
  tableSources?: TableSource[],
): string | undefined {
  const sources = resolveSourcesToUse(cellSources, tableSources);
  if (!sources) {
    return undefined;
  }
  const sourceWithPage = sources.find((source) => source.page_number);
  if (!sourceWithPage?.page_number) {
    return undefined;
  }
  return `Click to view PDF page ${sourceWithPage.page_number}`;
}

export function isSeeMoreLessButton(target: HTMLElement): boolean {
  if (target.tagName !== "BUTTON" && !target.closest("button")) {
    return false;
  }
  const button = target.closest("button");
  if (!button) {
    return false;
  }
  const text = button.textContent ?? "";
  return text.includes("See more") || text.includes("See less");
}

export function isInteractiveElement(target: HTMLElement): boolean {
  if (isSeeMoreLessButton(target)) {
    return true;
  }
  const interactiveTags = ["INPUT", "TEXTAREA", "SELECT"];
  if (interactiveTags.includes(target.tagName)) {
    return true;
  }
  return Boolean(
    target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select"),
  );
}

export function handleStructuredTableCellClick(
  event: MouseEvent,
  cellSources: TableSource[] | null,
  tableSources: TableSource[] | undefined,
  onSourceClick?: (source: TableSource) => void,
): void {
  const target = event.target as HTMLElement;

  if (isSeeMoreLessButton(target)) {
    return;
  }

  if (isInteractiveElement(target)) {
    return;
  }

  event.stopPropagation();
  event.preventDefault();

  const sourcesToUse = resolveSourcesToUse(cellSources, tableSources);
  if (!sourcesToUse || !onSourceClick) {
    return;
  }

  const sourceWithPage = sourcesToUse.find((source) => source.page_number);
  if (sourceWithPage) {
    onSourceClick(sourceWithPage);
  }
}

export function tablePathMatchesSearch(
  tableFieldPath: string,
  matchPath: string,
): boolean {
  const normalizedTablePath = normalizeTablePath(tableFieldPath);
  const normalizedMatchPath = normalizeTablePath(matchPath);
  return (
    normalizedMatchPath.startsWith(normalizedTablePath + ".") ||
    normalizedMatchPath === normalizedTablePath
  );
}

export function getMatchedRowIndexBeyondLimit(
  tableFieldPath: string,
  matchPath: string,
): number | null {
  const normalizedTablePath = normalizeTablePath(tableFieldPath);
  const normalizedMatchPath = normalizeTablePath(matchPath);
  const rowsPrefix = `${normalizedTablePath}.rows.`;
  if (!normalizedMatchPath.startsWith(rowsPrefix)) {
    return null;
  }

  const escapedPath = normalizedTablePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = normalizedMatchPath.match(
    new RegExp(`^${escapedPath}\\.rows\\.(\\d+)`),
  );
  if (!match) {
    return null;
  }
  return parseInt(match[1], 10);
}

export function getSearchPathsToCheck(
  activeMatchPath: string | null | undefined,
  matchedPaths: string[],
): string[] {
  if (activeMatchPath) {
    return [activeMatchPath, ...matchedPaths];
  }
  return matchedPaths;
}
