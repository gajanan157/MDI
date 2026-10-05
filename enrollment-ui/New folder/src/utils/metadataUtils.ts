// src/utils/metadataUtils.ts

/**
 * Utility functions for managing metadata (comments and status)
 * Metadata uses path-based keys to map to fields in the JSON structure
 */

/**
 * Build a field path from an array of path segments
 * @example buildFieldPath(["section1", "field3"]) => "section1.field3"
 * @example buildFieldPath(["otherBaseCovers", 0, "subLimit"]) => "otherBaseCovers.0.subLimit"
 */
export function buildFieldPath(path: Array<string | number>): string {
  return path.join(".");
}

/**
 * Parse a field path into an array of segments
 * @example parseFieldPath("section1.field3") => ["section1", "field3"]
 * @example parseFieldPath("otherBaseCovers.0.subLimit") => ["otherBaseCovers", "0", "subLimit"]
 */
export function parseFieldPath(fieldPath: string): Array<string | number> {
  return fieldPath.split(".").map((segment) => {
    const num = Number(segment);
    return Number.isNaN(num) ? segment : num;
  });
}

/**
 * Get nested value from object using path array
 */
export function getValueAtPath(
  obj: any,
  path: Array<string | number>
): any {
  let current = obj;
  for (const segment of path) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

/**
 * Set nested value in object using path array
 */
export function setValueAtPath(
  obj: any,
  path: Array<string | number>,
  value: any
): any {
  const newObj = { ...obj };
  let current = newObj;
  
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    if (current[segment] == null) {
      current[segment] = {};
    } else {
      current[segment] = Array.isArray(current[segment])
        ? [...current[segment]]
        : { ...current[segment] };
    }
    current = current[segment];
  }
  
  current[path[path.length - 1]] = value;
  return newObj;
}

/**
 * Check if a field path exists in metadata
 */
export function hasMetadata(
  metadata: Record<string, any>,
  fieldPath: string
): boolean {
  return fieldPath in metadata;
}

/**
 * Merge two metadata objects
 */
export function mergeMetadata(
  metadata1: Record<string, any>,
  metadata2: Record<string, any>
): Record<string, any> {
  return { ...metadata1, ...metadata2 };
}

