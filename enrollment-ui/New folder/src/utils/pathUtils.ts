/**
 * Utility functions for handling field paths in JSON structures
 * Paths are used to identify fields for comments, status, and metadata
 */

/**
 * Join path segments into a dot-separated path string
 * @example joinPath(['section1', 'field3']) => 'section1.field3'
 */
export function joinPath(segments: (string | number)[]): string {
  return segments.map(String).join(".");
}

/**
 * Split a path string into segments
 * @example splitPath('section1.field3') => ['section1', 'field3']
 */
export function splitPath(path: string): string[] {
  return path.split(".").filter(Boolean);
}

/**
 * Get the parent path of a given path
 * @example getParentPath('section1.field3.subField') => 'section1.field3'
 */
export function getParentPath(path: string): string | null {
  const segments = splitPath(path);
  if (segments.length <= 1) return null;
  return joinPath(segments.slice(0, -1));
}

/**
 * Get the field name from a path
 * @example getFieldName('section1.field3') => 'field3'
 */
export function getFieldName(path: string): string {
  const segments = splitPath(path);
  return segments[segments.length - 1] || "";
}

/**
 * Check if a path is a child of another path
 * @example isChildPath('section1.field3', 'section1') => true
 */
export function isChildPath(childPath: string, parentPath: string): boolean {
  return childPath.startsWith(parentPath + ".");
}

/**
 * Get the relative path from a parent path
 * @example getRelativePath('section1.field3.subField', 'section1') => 'field3.subField'
 */
export function getRelativePath(fullPath: string, parentPath: string): string {
  if (!isChildPath(fullPath, parentPath)) return fullPath;
  return fullPath.slice(parentPath.length + 1);
}

