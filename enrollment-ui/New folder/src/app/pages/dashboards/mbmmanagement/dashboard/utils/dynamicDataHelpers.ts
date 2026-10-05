/**
 * DYNAMIC DATA HELPERS
 * 
 * Utilities for handling highly dynamic insurance policy JSON data
 * where the schema is NOT fixed and can change at any time.
 */

/**
 * Base structure that all extensible objects should support
 */
export interface ExtensibleObject {
  // Allow any additional fields
  [key: string]: any;
  
  // Optional: Common extensibility fields
  sources?: Array<{
    snippet?: string;
    page_number?: number;
    document_id?: string;
    clause_reference?: string;
    section_reference?: string;
  }>;
  references?: Array<{
    type: 'clause' | 'annexure' | 'section' | 'external' | 'other';
    value: string;
    description?: string;
  }>;
  limits?: {
    min?: number | string;
    max?: number | string;
    unit?: string;
    description?: string;
  };
  conditions?: Array<{
    condition_text: string;
    applies_when?: string;
    exceptions?: string[];
  }>;
  notes?: Array<{
    note_type: 'general' | 'important' | 'warning' | 'info' | 'maker' | 'checker';
    content: string;
    created_by?: string;
    created_at?: string;
  }>;
  _field_metadata?: Record<string, any>;
  _section_metadata?: any;
}

export type ExtensibleSource = NonNullable<ExtensibleObject['sources']>[number];
export type ExtensibleReference = NonNullable<ExtensibleObject['references']>[number];
export type ExtensibleCondition = NonNullable<ExtensibleObject['conditions']>[number];
export type ExtensibleNote = NonNullable<ExtensibleObject['notes']>[number];

/**
 * Makes any object extensible by ensuring it has the base structure
 */
export function makeExtensible<T extends Record<string, any>>(obj: T): T & ExtensibleObject {
  return {
    ...obj,
    // Initialize optional arrays/objects only if they don't exist
    sources: obj.sources || [],
    references: obj.references || [],
    limits: obj.limits || {},
    conditions: obj.conditions || [],
    notes: obj.notes || [],
    _field_metadata: obj._field_metadata || {},
    _section_metadata: obj._section_metadata || {},
  };
}

function cloneStructuredData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

type PathSegment =
  | { kind: "array"; arrayName: string; index: number }
  | { kind: "object"; key: string };

type AddFieldSafelyOptions = {
  createIfNotExists?: boolean;
  preserveExisting?: boolean;
  makeExtensible?: boolean;
};

function parsePathSegment(part: string): PathSegment {
  const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
  if (arrayMatch) {
    return {
      kind: "array",
      arrayName: arrayMatch[1],
      index: Number.parseInt(arrayMatch[2], 10),
    };
  }
  return { kind: "object", key: part };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function maybeMakeExtensible(value: unknown, shouldMakeExtensible: boolean): unknown {
  if (!shouldMakeExtensible || !isPlainObject(value)) {
    return value;
  }
  return makeExtensible(value as Record<string, unknown>);
}

function ensureArraySlot(
  container: Record<string, unknown>,
  arrayName: string,
  index: number,
  createIfNotExists: boolean,
  emptyValue: unknown,
): { next: unknown; ok: boolean } {
  if (!container[arrayName]) {
    if (!createIfNotExists) {
      return { next: null, ok: false };
    }
    container[arrayName] = [];
  }

  const arrayValue = container[arrayName] as unknown[];
  if (!arrayValue[index]) {
    if (!createIfNotExists) {
      return { next: null, ok: false };
    }
    arrayValue[index] = emptyValue;
  }

  return { next: arrayValue[index], ok: true };
}

function ensureObjectSlot(
  container: Record<string, unknown>,
  key: string,
  createIfNotExists: boolean,
  emptyValue: unknown,
): { next: unknown; ok: boolean } {
  if (!container[key]) {
    if (!createIfNotExists) {
      return { next: null, ok: false };
    }
    container[key] = emptyValue;
  }
  return { next: container[key], ok: true };
}

function navigatePathSegment(
  container: Record<string, unknown>,
  segment: PathSegment,
  createIfNotExists: boolean,
): { next: unknown; ok: boolean } {
  if (segment.kind === "array") {
    return ensureArraySlot(
      container,
      segment.arrayName,
      segment.index,
      createIfNotExists,
      {},
    );
  }
  return ensureObjectSlot(container, segment.key, createIfNotExists, {});
}

function resolveMergedValue(
  existing: unknown,
  value: unknown,
  preserveExisting: boolean,
): { ok: true; value: unknown } | { ok: false } {
  if (preserveExisting && existing !== undefined) {
    if (isPlainObject(existing) && isPlainObject(value)) {
      return { ok: true, value: { ...existing, ...value } };
    }
    return { ok: false };
  }
  return { ok: true, value };
}

function readSegmentValue(
  container: Record<string, unknown>,
  segment: PathSegment,
): unknown {
  if (segment.kind === "array") {
    const arrayValue = container[segment.arrayName] as unknown[] | undefined;
    return arrayValue?.[segment.index];
  }
  return container[segment.key];
}

function writeSegmentValue(
  container: Record<string, unknown>,
  segment: PathSegment,
  nextValue: unknown,
): void {
  if (segment.kind === "array") {
    if (!container[segment.arrayName]) {
      container[segment.arrayName] = [];
    }
    (container[segment.arrayName] as unknown[])[segment.index] = nextValue;
    return;
  }
  container[segment.key] = nextValue;
}

function assignSegmentValue(
  container: Record<string, unknown>,
  segment: PathSegment,
  value: unknown,
  preserveExisting: boolean,
): boolean {
  if (segment.kind === "array" && !container[segment.arrayName]) {
    container[segment.arrayName] = [];
  }

  const merged = resolveMergedValue(
    readSegmentValue(container, segment),
    value,
    preserveExisting,
  );
  if (!merged.ok) {
    return false;
  }

  writeSegmentValue(container, segment, merged.value);
  return true;
}

function navigateToParent(
  draft: Record<string, unknown>,
  pathParts: string[],
  options: Required<AddFieldSafelyOptions>,
): Record<string, unknown> | null {
  let current: Record<string, unknown> = draft;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const navigated = navigatePathSegment(
      current,
      parsePathSegment(pathParts[i]),
      options.createIfNotExists,
    );
    if (!navigated.ok || !isPlainObject(navigated.next)) {
      return null;
    }

    current = maybeMakeExtensible(
      navigated.next,
      options.makeExtensible,
    ) as Record<string, unknown>;
  }

  return current;
}

function applyFieldAssignment(
  container: Record<string, unknown>,
  fieldSegment: PathSegment,
  value: unknown,
  options: Required<AddFieldSafelyOptions>,
): boolean {
  if (!assignSegmentValue(container, fieldSegment, value, options.preserveExisting)) {
    return false;
  }

  const assignedValue = readSegmentValue(container, fieldSegment);
  writeSegmentValue(
    container,
    fieldSegment,
    maybeMakeExtensible(assignedValue, options.makeExtensible),
  );
  return true;
}

/**
 * Safely adds a new field to any object at any path
 * Preserves existing fields and ensures extensibility.
 * Returns the original input when no change is applied; otherwise a new copy with updates.
 */
export function addFieldSafely(
  data: any,
  fieldPath: string,
  value: any,
  options?: AddFieldSafelyOptions,
): any {
  const resolvedOptions: Required<AddFieldSafelyOptions> = {
    createIfNotExists: options?.createIfNotExists ?? true,
    preserveExisting: options?.preserveExisting ?? true,
    makeExtensible: options?.makeExtensible ?? true,
  };

  if (data == null || typeof data !== "object") {
    return data;
  }

  const draft = cloneStructuredData(data) as Record<string, unknown>;
  const pathParts = fieldPath.split(".");
  const parent = navigateToParent(draft, pathParts, resolvedOptions);
  if (!parent) {
    return data;
  }

  const fieldSegment = parsePathSegment(pathParts[pathParts.length - 1]);
  if (!applyFieldAssignment(parent, fieldSegment, value, resolvedOptions)) {
    return data;
  }

  return draft;
}

/**
 * Adds a source reference to any field/object
 */
export function addSource(
  data: any,
  fieldPath: string,
  source: ExtensibleSource
): any {
  const obj = getFieldValue(data, fieldPath);
  if (obj && typeof obj === 'object') {
    const extensibleObj = makeExtensible(obj);
    if (!extensibleObj.sources) {
      extensibleObj.sources = [];
    }
    extensibleObj.sources.push(source);
    return setFieldValue(data, fieldPath, extensibleObj);
  }
  return data;
}

/**
 * Adds a reference to any field/object
 */
export function addReference(
  data: any,
  fieldPath: string,
  reference: ExtensibleReference
): any {
  const obj = getFieldValue(data, fieldPath);
  if (obj && typeof obj === 'object') {
    const extensibleObj = makeExtensible(obj);
    if (!extensibleObj.references) {
      extensibleObj.references = [];
    }
    extensibleObj.references.push(reference);
    return setFieldValue(data, fieldPath, extensibleObj);
  }
  return data;
}

/**
 * Adds a limit to any field/object
 */
export function addLimit(
  data: any,
  fieldPath: string,
  limit: ExtensibleObject['limits']
): any {
  const obj = getFieldValue(data, fieldPath);
  if (obj && typeof obj === 'object') {
    const extensibleObj = makeExtensible(obj);
    extensibleObj.limits = {
      ...(extensibleObj.limits || {}),
      ...limit,
    };
    return setFieldValue(data, fieldPath, extensibleObj);
  }
  return data;
}

/**
 * Adds a condition to any field/object
 */
export function addCondition(
  data: any,
  fieldPath: string,
  condition: ExtensibleCondition
): any {
  const obj = getFieldValue(data, fieldPath);
  if (obj && typeof obj === 'object') {
    const extensibleObj = makeExtensible(obj);
    if (!extensibleObj.conditions) {
      extensibleObj.conditions = [];
    }
    extensibleObj.conditions.push(condition);
    return setFieldValue(data, fieldPath, extensibleObj);
  }
  return data;
}

/**
 * Adds a note to any field/object
 */
export function addNote(
  data: any,
  fieldPath: string,
  note: ExtensibleNote
): any {
  const obj = getFieldValue(data, fieldPath);
  if (obj && typeof obj === 'object') {
    const extensibleObj = makeExtensible(obj);
    if (!extensibleObj.notes) {
      extensibleObj.notes = [];
    }
    extensibleObj.notes.push(note);
    return setFieldValue(data, fieldPath, extensibleObj);
  }
  return data;
}

/**
 * Gets a field value by path
 */
export function getFieldValue(data: any, fieldPath: string): any {
  const pathParts = fieldPath.split('.');
  let current = data;

  for (const part of pathParts) {
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);
      if (!current[arrayName] || !current[arrayName][index]) {
        return undefined;
      }
      current = current[arrayName][index];
    } else {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
  }

  return current;
}

/**
 * Sets a field value by path
 */
export function setFieldValue(data: any, fieldPath: string, value: any): any {
  return addFieldSafely(data, fieldPath, value, {
    createIfNotExists: true,
    preserveExisting: false,
  });
}

/**
 * Converts a flat list of strings to an array of objects
 * Useful when migrating from simple arrays to extensible objects
 */
export function convertToObjectArray(
  items: string[],
  options?: {
    idField?: string;
    valueField?: string;
    additionalFields?: Record<string, any>;
  }
): Array<Record<string, any>> {
  const {
    idField = 'id',
    valueField = 'value',
    additionalFields = {},
  } = options || {};

  return items.map((item, index) => makeExtensible({
    [idField]: `item_${index}`,
    [valueField]: item,
    ...additionalFields,
  }));
}

/**
 * Ensures an array contains objects (not primitives)
 * Converts primitives to objects if needed
 */
export function ensureObjectArray<T>(
  arr: T[],
  options?: {
    idField?: string;
    valueField?: string;
  }
): Array<ExtensibleObject> {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map((item, index) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      return makeExtensible(item as Record<string, any>);
    } else {
      // Convert primitive to object
      const {
        idField = 'id',
        valueField = 'value',
      } = options || {};
      
      return makeExtensible({
        [idField]: `item_${index}`,
        [valueField]: item,
      });
    }
  });
}

/**
 * Deeply makes all objects in a data structure extensible
 */
export function makeAllExtensible(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => makeAllExtensible(item));
  } else if (data !== null && typeof data === 'object') {
    const extensible = makeExtensible(data);
    const result: Record<string, any> = {};
    
    for (const key in extensible) {
      if (Object.prototype.hasOwnProperty.call(extensible, key)) {
        result[key] = makeAllExtensible(extensible[key]);
      }
    }
    
    return result;
  }
  
  return data;
}

function isPlainMergeObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeKeyValue(
  existing: Record<string, unknown>,
  newData: Record<string, unknown>,
  key: string,
  options: { deep?: boolean; preserveArrays?: boolean },
): unknown {
  const newValue = newData[key];

  if (Array.isArray(newValue)) {
    if (options.preserveArrays && Array.isArray(existing[key])) {
      return [...existing[key], ...newValue];
    }
    return [...newValue];
  }

  if (isPlainMergeObject(newValue) && isPlainMergeObject(existing[key])) {
    return mergeSafely(existing[key], newValue, options);
  }

  return newValue;
}

/**
 * Merges new data into existing data while preserving all existing fields
 */
export function mergeSafely(
  existing: any,
  newData: any,
  options?: {
    deep?: boolean;
    preserveArrays?: boolean;
  }
): any {
  const {
    deep = true,
    preserveArrays = false,
  } = options || {};

  if (!deep) {
    return { ...existing, ...newData };
  }

  const result = { ...existing };
  const mergeOptions = { deep, preserveArrays };

  for (const key in newData) {
    if (Object.prototype.hasOwnProperty.call(newData, key)) {
      result[key] = mergeKeyValue(existing, newData, key, mergeOptions);
    }
  }

  return result;
}

/**
 * Validates that a field path is safe to use
 */
export function validateFieldPath(path: string): boolean {
  // Basic validation - no empty parts, no special characters that could cause issues
  const parts = path.split('.');
  return parts.every(part => {
    if (part === '') return false;
    // Allow alphanumeric, underscore, and array notation
    return /^\w+(\[\d+\])?$/.test(part);
  });
}

function isTraversableArrayItem(item: unknown): boolean {
  return typeof item === 'object' && item !== null;
}

function isNestedPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function joinFieldPath(prefix: string, key: string): string {
  return prefix ? `${prefix}.${key}` : key;
}

function collectArrayFieldPaths(
  obj: unknown[],
  prefix: string,
  maxDepth: number,
  currentDepth: number,
): string[] {
  const paths: string[] = [];
  obj.forEach((item, index) => {
    const itemPath = `${prefix}[${index}]`;
    if (isTraversableArrayItem(item)) {
      paths.push(...getAllFieldPaths(item, itemPath, maxDepth, currentDepth + 1));
      return;
    }
    paths.push(itemPath);
  });
  return paths;
}

function collectObjectFieldPaths(
  obj: Record<string, unknown>,
  prefix: string,
  maxDepth: number,
  currentDepth: number,
): string[] {
  const paths: string[] = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key) || key.startsWith('_')) continue;

    const newPath = joinFieldPath(prefix, key);
    const value = obj[key];
    if (isNestedPlainObject(value)) {
      paths.push(...getAllFieldPaths(value, newPath, maxDepth, currentDepth + 1));
      continue;
    }
    paths.push(newPath);
  }
  return paths;
}

/**
 * Gets all field paths in a nested object
 */
export function getAllFieldPaths(
  obj: any,
  prefix = '',
  maxDepth = 10,
  currentDepth = 0
): string[] {
  if (currentDepth >= maxDepth) {
    return [];
  }

  if (Array.isArray(obj)) {
    return collectArrayFieldPaths(obj, prefix, maxDepth, currentDepth);
  }

  if (obj !== null && typeof obj === 'object') {
    return collectObjectFieldPaths(obj, prefix, maxDepth, currentDepth);
  }

  return [];
}

