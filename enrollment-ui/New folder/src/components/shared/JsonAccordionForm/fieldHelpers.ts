import type { MouseEvent, ReactNode } from "react";

export function formatErrorArrayItem(e: unknown): string {
  if (typeof e === "string") return e;
  if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    return (e as { message: string }).message;
  }
  if (typeof e === "object" && e !== null) return JSON.stringify(e);
  return String(e);
}

function extractMessagesFromErrorObject(err: Record<string, unknown>): string[] {
  const parts: string[] = [];
  for (const k of Object.keys(err)) {
    const v = err[k];
    if (!v && v !== 0) continue;
    if (typeof v === "string") parts.push(v);
    else if (
      typeof v === "object" &&
      v !== null &&
      "message" in v &&
      typeof (v as { message: unknown }).message === "string"
    ) {
      parts.push((v as { message: string }).message);
    } else if (typeof v === "number") parts.push(String(v));
  }
  return parts;
}

function stringifyErrorSafe(err: object): string {
  try {
    return JSON.stringify(
      err,
      (key, value) => {
        if (key === "ref") return undefined;
        if (typeof value === "function") return undefined;
        return value;
      },
      2,
    );
  } catch {
    return "[Invalid error]";
  }
}

export function renderErrorContent(err: unknown): ReactNode {
  if (err === null || err === undefined) return null;
  if (typeof err === "string" || typeof err === "number") return err;
  if (typeof err === "object" && (err as { $$typeof?: unknown })?.$$typeof) {
    return err as ReactNode;
  }

  if (Array.isArray(err)) {
    return err
      .map(formatErrorArrayItem)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof err === "object" && err !== null) {
    const errObj = err as Record<string, unknown>;
    if (typeof errObj.message === "string") return errObj.message;

    const parts = extractMessagesFromErrorObject(errObj);
    if (parts.length) return parts.join(", ");

    return stringifyErrorSafe(err);
  }

  return String(err);
}

function accessBracketKeyPart(
  currentObj: unknown,
  keyPart: string,
  index: number,
): unknown | null {
  if (!currentObj || typeof currentObj !== "object" || !(keyPart in currentObj)) {
    return null;
  }
  const next = (currentObj as Record<string, unknown>)[keyPart];
  if (!Array.isArray(next) || index < 0 || index >= next.length) {
    return null;
  }
  return next[index];
}

function accessStandaloneBracketPart(
  currentObj: unknown,
  index: number,
): unknown | null {
  if (
    Number.isNaN(index) ||
    !Array.isArray(currentObj) ||
    index < 0 ||
    index >= currentObj.length
  ) {
    return null;
  }
  return currentObj[index];
}

function accessRegularPathPart(currentObj: unknown, part: string): unknown | null {
  if (!currentObj || typeof currentObj !== "object") return null;

  const numPart = Number(part);
  const isNumeric = !Number.isNaN(numPart) && part === String(numPart);
  if (isNumeric && Array.isArray(currentObj)) {
    return currentObj[numPart];
  }
  if (part in (currentObj as Record<string, unknown>)) {
    return (currentObj as Record<string, unknown>)[part];
  }
  return null;
}

function accessPathPart(currentObj: unknown, part: string): unknown | null {
  const bracketMatch = part.match(/^(.+)\[(\d+)\]$/);
  if (bracketMatch) {
    const [, keyPart, indexStr] = bracketMatch;
    return accessBracketKeyPart(currentObj, keyPart, Number(indexStr));
  }
  if (part.startsWith("[") && part.endsWith("]")) {
    return accessStandaloneBracketPart(currentObj, Number(part.slice(1, -1)));
  }
  return accessRegularPathPart(currentObj, part);
}

function extractSourcesArray(obj: unknown): unknown[] | null {
  if (!obj || typeof obj !== "object" || !("sources" in obj)) return null;
  const sourcesArray = (obj as { sources: unknown }).sources;
  if (Array.isArray(sourcesArray) && sourcesArray.length > 0) {
    return sourcesArray;
  }
  return null;
}

export function getSourcesFromPath(obj: unknown, pathParts: string[]): unknown[] | null {
  try {
    let currentObj: unknown = obj;
    for (const part of pathParts) {
      currentObj = accessPathPart(currentObj, part);
      if (currentObj === null) return null;
    }
    return extractSourcesArray(currentObj);
  } catch {
    return null;
  }
}

export function splitFieldPathParts(fieldPath: string): string[] {
  const pathParts: string[] = [];
  for (const part of fieldPath.split(".")) {
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

export function isDebugSourceFieldPath(fieldPath: string | undefined): boolean {
  if (!fieldPath) return false;
  return (
    fieldPath.includes("modern_and_advanced_treatments") ||
    fieldPath.includes("treatment_name") ||
    fieldPath.includes("text_description")
  );
}

export function logSourceDebug(
  message: string,
  fieldPath: string | undefined,
  data: Record<string, unknown>,
): void {
  if (!isDebugSourceFieldPath(fieldPath)) return;
}

/** Track source-button clicks so accordion toggles do not swallow PDF navigation. */
export function markSourceClickTarget(event: MouseEvent): void {
  const target = event.currentTarget as HTMLElement;
  (window as Window & { __lastClickedElement?: HTMLElement }).__lastClickedElement =
    target;
  event.stopPropagation();
}

export function buildPdfSourceTitle(
  pageNumber?: number,
  options?: { editHint?: boolean; baseTitle?: string },
): string | undefined {
  if (options?.baseTitle) {
    return options.editHint
      ? `${options.baseTitle} — Double-click to edit`
      : options.baseTitle;
  }
  if (!pageNumber) return undefined;
  const base = `Click to open page ${pageNumber} in PDF viewer`;
  return options?.editHint ? `${base} — Double-click to edit` : base;
}

export function handleConditionSourceClick(
  e: MouseEvent,
  hasClickableSource: boolean,
  sourceWithPage: { page_number?: number; snippet?: string } | null | undefined,
  onSourceClick?: (source: { page_number?: number; snippet?: string }) => void,
): void {
  if (!hasClickableSource || !sourceWithPage || !onSourceClick) return;
  e.stopPropagation();
  markSourceClickTarget(e);
  onSourceClick(sourceWithPage);
}

export function getValueAtPath(root: unknown, pathParts: string[]): unknown {
  let current: unknown = root;
  for (const part of pathParts) {
    current = accessPathPart(current, part);
    if (current === null) return null;
  }
  return current;
}

function findAncestorSources(
  data: unknown,
  pathParts: string[],
  getSources: (obj: unknown, parts: string[]) => unknown[] | null,
): unknown[] | null {
  if (pathParts.length === 0) return null;
  for (let i = pathParts.length; i > 0; i--) {
    const ancestorSources = getSources(data, pathParts.slice(0, i));
    if (ancestorSources) return ancestorSources;
  }
  return null;
}

function findValueSources(value: unknown): unknown[] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return extractSourcesArray(value);
}

function resolveSourcesOnPath(
  data: unknown,
  pathParts: string[],
  getSources: (obj: unknown, parts: string[]) => unknown[] | null = getSourcesFromPath,
): unknown[] | null {
  if (!data || pathParts.length === 0) return null;

  const fieldSources = getSources(data, pathParts);
  if (fieldSources) return fieldSources;

  return findAncestorSources(data, pathParts, getSources);
}

function getSectionPathStartIndex(
  sectionData: unknown,
  pathParts: string[],
): number {
  if (
    pathParts.length > 0 &&
    typeof sectionData === "object" &&
    pathParts[0] in (sectionData as Record<string, unknown>)
  ) {
    return 0;
  }
  return 1;
}

function findSourcesInSectionData(
  sectionData: unknown,
  pathParts: string[],
  fieldPath: string,
  getSources: (obj: unknown, parts: string[]) => unknown[] | null,
): unknown[] | null {
  const sectionStart = getSectionPathStartIndex(sectionData, pathParts);

  for (let start = sectionStart; start < pathParts.length; start++) {
    const relativeParts = pathParts.slice(start);
    const fromSection = resolveSourcesOnPath(
      sectionData,
      relativeParts,
      getSources,
    );
    if (fromSection) {
      logSourceDebug("[Field] Found sources on section data:", fieldPath, {
        relativeParts,
        sourcesCount: fromSection.length,
      });
      return fromSection;
    }
  }

  return resolveSourcesOnPath(sectionData, pathParts, getSources);
}

function findSourcesOnRootValue(
  rootData: unknown,
  pathParts: string[],
  fieldPath: string,
): unknown[] | null {
  const actualValue = getValueAtPath(rootData, pathParts);
  const rootValueSources = findValueSources(actualValue);
  if (!rootValueSources) return null;

  logSourceDebug("[Field] Found sources on root value object:", fieldPath, {
    sourcesCount: rootValueSources.length,
  });
  return rootValueSources;
}

export function resolveFieldSources(
  rootData: unknown,
  fieldPath: string | undefined,
  value: unknown,
  sectionData?: unknown,
  getSources: (obj: unknown, parts: string[]) => unknown[] | null = getSourcesFromPath,
): unknown[] | null {
  if (!fieldPath) return null;

  const pathParts = splitFieldPathParts(fieldPath);

  if (rootData) {
    const fromRoot = resolveSourcesOnPath(rootData, pathParts, getSources);
    if (fromRoot) {
      logSourceDebug("[Field] Found sources on root:", fieldPath, {
        pathParts,
        sourcesCount: fromRoot.length,
      });
      return fromRoot;
    }
  }

  if (sectionData) {
    const fromSection = findSourcesInSectionData(
      sectionData,
      pathParts,
      fieldPath,
      getSources,
    );
    if (fromSection) return fromSection;
  }

  const valueSources = findValueSources(value);
  if (valueSources) {
    logSourceDebug("[Field] Found sources on value object:", fieldPath, {
      sourcesCount: valueSources.length,
    });
    return valueSources;
  }

  if (rootData) {
    const fromRootValue = findSourcesOnRootValue(rootData, pathParts, fieldPath);
    if (fromRootValue) return fromRootValue;
  }

  logSourceDebug("[Field] No sources found after all checks:", fieldPath, {
    pathParts,
    hasRootData: !!rootData,
    hasSectionData: !!sectionData,
  });
  return null;
}

export function computeTextWrapsToMultipleLines(
  textElement: HTMLElement,
  measureElement: HTMLElement,
  text: string,
): boolean {
  const textRect = textElement.getBoundingClientRect();
  const availableWidth =
    textRect.width || textElement.offsetWidth || textElement.clientWidth;

  if (!availableWidth || availableWidth < 50) {
    return false;
  }

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
  measureElement.textContent = text;

  const lineHeight =
    parseFloat(computedStyle.lineHeight) ||
    parseFloat(computedStyle.fontSize) * 1.2;
  const singleLineHeight =
    lineHeight +
    parseFloat(computedStyle.paddingTop || "0") +
    parseFloat(computedStyle.paddingBottom || "0");

  return measureElement.scrollHeight > singleLineHeight * 1.1;
}

export function scheduleTextWrapCheck(check: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(check);
  });
}

export function observeElementResize(
  element: HTMLElement,
  onResize: () => void,
): () => void {
  const resizeObserver = new ResizeObserver(() => onResize());
  resizeObserver.observe(element);
  return () => resizeObserver.disconnect();
}
