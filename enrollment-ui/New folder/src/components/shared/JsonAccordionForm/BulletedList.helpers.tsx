import type { ReactNode } from "react";
import type { JsonAccordionUserRole } from "./types";
import { resolveFieldSources } from "./fieldHelpers";

export type SourceItem = { page_number?: number; snippet?: string };

export function toDisplayText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value ?? "");
}

export function resolveParentSources(
  rootData: unknown,
  fieldKey: string,
): SourceItem[] | null {
  if (!rootData || typeof rootData !== "object") return null;

  try {
    const sourcesFromParentPath = findSourcesByParentPath(
      rootData as Record<string, unknown>,
      fieldKey,
    );
    if (sourcesFromParentPath) {
      return sourcesFromParentPath;
    }

    const sourcesFromCommonParents = findSourcesFromCommonParents(
      rootData as Record<string, unknown>,
      fieldKey,
    );
    if (sourcesFromCommonParents) {
      return sourcesFromCommonParents;
    }

    return findSourcesFromTopLevelObjects(
      rootData as Record<string, unknown>,
      fieldKey,
    );
  } catch {
    return null;
  }
}

function getValidSources(
  parentObj: unknown,
): SourceItem[] | null {
  if (!parentObj || typeof parentObj !== "object" || !("sources" in parentObj)) {
    return null;
  }

  const sources = (parentObj as { sources?: unknown }).sources;
  if (Array.isArray(sources) && sources.length > 0) {
    return sources;
  }

  return null;
}

function findSourcesByParentPath(
  rootData: Record<string, unknown>,
  fieldKey: string,
): SourceItem[] | null {
  const parts = fieldKey.split(".");
  if (parts.length <= 1) {
    return null;
  }

  const parentPath = parts.slice(0, -1);
  let parentObj: unknown = rootData;
  for (const part of parentPath) {
    if (parentObj && typeof parentObj === "object" && part in parentObj) {
      parentObj = (parentObj as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  return getValidSources(parentObj);
}

function findSourcesFromCommonParents(
  rootData: Record<string, unknown>,
  fieldKey: string,
): SourceItem[] | null {
  const commonParents = [
    "eligibility_and_entry_conditions",
    "portability_conditions",
  ];

  for (const parentKey of commonParents) {
    if (!(parentKey in rootData)) {
      continue;
    }

    const parentObj = rootData[parentKey];
    if (
      parentObj &&
      typeof parentObj === "object" &&
      fieldKey in parentObj
    ) {
      const sources = getValidSources(parentObj);
      if (sources) {
        return sources;
      }
    }
  }

  return null;
}

function findSourcesFromTopLevelObjects(
  rootData: Record<string, unknown>,
  fieldKey: string,
): SourceItem[] | null {
  for (const key in rootData) {
    if (!Object.hasOwn(rootData, key)) {
      continue;
    }

    const obj = rootData[key];
    if (obj && typeof obj === "object" && fieldKey in obj) {
      const sources = getValidSources(obj);
      if (sources) {
        return sources;
      }
    }
  }

  return null;
}

export function resolveItemSources(
  rootData: unknown,
  fieldKey: string,
  index: number,
  itemValue: unknown,
  sectionData?: unknown,
): SourceItem[] | null {
  const itemPath = `${fieldKey}[${index}]`;

  const fromPath = resolveFieldSources(
    rootData,
    itemPath,
    itemValue,
    sectionData,
  );
  if (fromPath && fromPath.length > 0) {
    return fromPath as SourceItem[];
  }

  if (
    itemValue &&
    typeof itemValue === "object" &&
    !Array.isArray(itemValue) &&
    "sources" in itemValue
  ) {
    const itemSources = getValidSources(itemValue);
    if (itemSources) return itemSources;
  }

  return resolveParentSources(rootData, fieldKey);
}

export function getItemSourceWithPage(
  sources: SourceItem[] | null | undefined,
): SourceItem | null {
  if (!sources?.length) return null;
  return sources.find((s) => s?.page_number) ?? null;
}

export function hasItemClickableSource(
  sources: SourceItem[] | null | undefined,
): boolean {
  return Boolean(sources?.some((s) => s?.page_number));
}

export function highlightSearchText(
  text: string,
  searchText: string | undefined,
  activeMatchPath: string | null | undefined,
  currentPath?: string,
): ReactNode {
  if (!searchText) return text;

  const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const isActive =
    Boolean(currentPath && activeMatchPath && currentPath === activeMatchPath);

  return text.split(regex).map((part, i) => {
    if (part.toLowerCase() !== searchText.toLowerCase()) {
      return part;
    }

    const activeClass =
      "bg-orange-400 ring-2 ring-orange-500 dark:bg-orange-500 text-amber-900 dark:text-amber-200";
    const inactiveClass =
      "bg-yellow-300 dark:bg-yellow-600 dark:text-yellow-50";

    return (
      <mark
        key={i}
        className={`rounded px-0.5 font-semibold text-gray-900 dark:text-gray-100 ${
          isActive ? activeClass : inactiveClass
        }`}
      >
        {part}
      </mark>
    );
  });
}

function formatNestedValue(val: unknown): string {
  if (typeof val === "string") {
    return val;
  }
  if (typeof val === "object" && val !== null) {
    if (Array.isArray(val)) {
      return `${val.length} items`;
    }
    return "object";
  }
  return String(val);
}

function isPrimitiveArray(itemValue: unknown[]): boolean {
  return itemValue.every(
    (item) =>
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean",
  );
}

export function formatObjectValueForDisplay(itemValue: object): string {
  if (Array.isArray(itemValue)) {
    if (itemValue.length === 0) {
      return "No items";
    }
    if (isPrimitiveArray(itemValue)) {
      return itemValue.join(", ");
    }
    const suffix = itemValue.length === 1 ? "" : "s";
    return `${itemValue.length} item${suffix}`;
  }

  const keys = Object.keys(itemValue);
  if (keys.length === 0) {
    return "Empty object";
  }

  const entries = keys.slice(0, 2).map((key) => {
    const val = (itemValue as Record<string, unknown>)[key];
    return `${key}: ${formatNestedValue(val)}`;
  });

  const more = keys.length > 2 ? `, +${keys.length - 2} more` : "";
  return entries.join(", ") + more;
}

function applyMeasureElementStyles(
  textElement: HTMLElement,
  measureElement: HTMLDivElement,
  availableWidth: number,
): CSSStyleDeclaration {
  const computedStyle = window.getComputedStyle(textElement);
  measureElement.style.fontSize = computedStyle.fontSize;
  measureElement.style.fontFamily = computedStyle.fontFamily;
  measureElement.style.fontWeight = computedStyle.fontWeight;
  measureElement.style.letterSpacing = computedStyle.letterSpacing;
  measureElement.style.lineHeight = computedStyle.lineHeight;
  measureElement.style.padding = computedStyle.padding || "0";
  measureElement.style.whiteSpace = "pre-wrap";
  measureElement.style.wordBreak = "break-word";
  measureElement.style.width = `${availableWidth}px`;
  measureElement.style.boxSizing = "border-box";
  return computedStyle;
}

function textWrapsToMultipleLines(
  measureElement: HTMLDivElement,
  computedStyle: CSSStyleDeclaration,
): boolean {
  const lineHeight =
    parseFloat(computedStyle.lineHeight) ||
    parseFloat(computedStyle.fontSize) * 1.2;
  const singleLineHeight =
    lineHeight +
    parseFloat(computedStyle.paddingTop || "0") +
    parseFloat(computedStyle.paddingBottom || "0");
  return measureElement.scrollHeight > singleLineHeight * 1.1;
}

function getAvailableTextWidth(textElement: HTMLElement): number {
  const textRect = textElement.getBoundingClientRect();
  return (
    textRect.width || textElement.offsetWidth || textElement.clientWidth
  );
}

export function measureTextWrap(
  textElement: HTMLElement,
  measureElement: HTMLDivElement,
  text: string,
): boolean | null {
  const availableWidth = getAvailableTextWidth(textElement);
  if (!availableWidth || availableWidth < 50) {
    return null;
  }

  const computedStyle = applyMeasureElementStyles(
    textElement,
    measureElement,
    availableWidth,
  );
  measureElement.textContent = toDisplayText(text);
  return textWrapsToMultipleLines(measureElement, computedStyle);
}

export function scheduleTextWrapMeasurement(
  textElement: HTMLElement,
  measureElement: HTMLDivElement,
  text: string,
  onResult: (wraps: boolean) => void,
): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const wraps = measureTextWrap(textElement, measureElement, text);
      if (wraps !== null) {
        onResult(wraps);
      }
    });
  });
}

export function createTextWrapResizeObserver(
  textElement: HTMLElement,
  measureElement: HTMLDivElement,
  text: string,
  parentElement: Element,
  onWrapChange: (wraps: boolean) => void,
): () => void {
  const resizeObserver = new ResizeObserver(() => {
    scheduleTextWrapMeasurement(textElement, measureElement, text, onWrapChange);
  });
  resizeObserver.observe(parentElement);
  return () => {
    resizeObserver.disconnect();
  };
}

export function getUserRoleValue(
  userRole: JsonAccordionUserRole | JsonAccordionUserRole[] | null | undefined,
): JsonAccordionUserRole | undefined {
  if (Array.isArray(userRole)) {
    return userRole[0];
  }
  return userRole ?? undefined;
}
