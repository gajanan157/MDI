/**
 * Utility functions for data processing
 * Extracted from duplicated code patterns
 */

/**
 * Ensures all sections in data have comments array (used in multiple places)
 */
export function ensureCommentsArray<T extends Record<string, unknown>>(
  data: T
): T {
  const dataCopy = JSON.parse(JSON.stringify(data)) as T;

  Object.keys(dataCopy).forEach((sectionKey) => {
    // Skip special fields
    if (sectionKey === "_comments") return;

    const section = dataCopy[sectionKey];
    // Only add comments to objects (not arrays or primitives)
    if (
      section &&
      typeof section === "object" &&
      !Array.isArray(section)
    ) {
      const sectionObj = section as Record<string, unknown>;
      // If comments array doesn't exist, add empty array
      if (!sectionObj.comments || !Array.isArray(sectionObj.comments)) {
        sectionObj.comments = [];
      }
    }
  });

  return dataCopy;
}

/**
 * Deep comparison to find changed fields between two objects
 */
export function findObjectChanges(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  path = ""
): Record<string, { oldValue: unknown; newValue: unknown }> {
  const changes: Record<string, { oldValue: unknown; newValue: unknown }> = {};

  const findChanges = (
    obj1: unknown,
    obj2: unknown,
    currentPath = ""
  ): void => {
    if (obj1 === obj2) return;

    if (typeof obj1 !== typeof obj2) {
      changes[currentPath || "root"] = { oldValue: obj1, newValue: obj2 };
      return;
    }

    if (obj1 === null || obj2 === null) {
      if (obj1 !== obj2) {
        changes[currentPath || "root"] = { oldValue: obj1, newValue: obj2 };
      }
      return;
    }

    if (typeof obj1 === "object" && typeof obj2 === "object") {
      if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        changes[currentPath || "root"] = { oldValue: obj1, newValue: obj2 };
        return;
      }

      if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        const allKeys = new Set([...keys1, ...keys2]);

        allKeys.forEach((key) => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          const obj1Record = obj1 as Record<string, unknown>;
          const obj2Record = obj2 as Record<string, unknown>;
          if (!(key in obj1Record)) {
            // New field added
            changes[newPath] = {
              oldValue: undefined,
              newValue: obj2Record[key],
            };
          } else if (!(key in obj2Record)) {
            // Field removed
            changes[newPath] = {
              oldValue: obj1Record[key],
              newValue: undefined,
            };
          } else {
            findChanges(obj1Record[key], obj2Record[key], newPath);
          }
        });
      }
    } else if (obj1 !== obj2) {
      changes[currentPath || "root"] = { oldValue: obj1, newValue: obj2 };
    }
  };

  findChanges(oldObj, newObj, path);
  return changes;
}

