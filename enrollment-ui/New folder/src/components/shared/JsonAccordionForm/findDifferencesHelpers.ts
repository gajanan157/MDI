export type DifferenceEntry = {
  path: string;
  oldValue: unknown;
  newValue: unknown;
};

function appendChildDiffs(
  differences: DifferenceEntry[],
  oldObj: unknown,
  newObj: unknown,
  path: string,
): void {
  differences.push(...findDifferences(oldObj, newObj, path));
}

function diffWhenOldMissing(
  newObj: unknown,
  path: string,
): DifferenceEntry[] {
  const differences: DifferenceEntry[] = [];
  if (newObj === null || newObj === undefined) return differences;

  if (Array.isArray(newObj)) {
    newObj.forEach((item, i) => {
      differences.push(...findDifferences(undefined, item, path ? `${path}[${i}]` : `[${i}]`));
    });
    return differences;
  }

  if (typeof newObj === "object") {
    Object.keys(newObj as Record<string, unknown>).forEach((key) => {
      const keyPath = path ? `${path}.${key}` : key;
      differences.push({
        path: keyPath,
        oldValue: undefined,
        newValue: (newObj as Record<string, unknown>)[key],
      });
    });
    return differences;
  }

  differences.push({ path, oldValue: undefined, newValue: newObj });
  return differences;
}

function diffWhenNewMissing(
  oldObj: unknown,
  path: string,
): DifferenceEntry[] {
  const differences: DifferenceEntry[] = [];
  if (oldObj === null || oldObj === undefined) return differences;

  if (Array.isArray(oldObj)) {
    oldObj.forEach((item, i) => {
      differences.push(...findDifferences(item, undefined, path ? `${path}[${i}]` : `[${i}]`));
    });
    return differences;
  }

  if (typeof oldObj === "object") {
    Object.keys(oldObj as Record<string, unknown>).forEach((key) => {
      const keyPath = path ? `${path}.${key}` : key;
      differences.push({
        path: keyPath,
        oldValue: (oldObj as Record<string, unknown>)[key],
        newValue: undefined,
      });
    });
    return differences;
  }

  differences.push({ path, oldValue: oldObj, newValue: undefined });
  return differences;
}

function diffArrays(
  oldObj: unknown[],
  newObj: unknown[],
  path: string,
): DifferenceEntry[] {
  const differences: DifferenceEntry[] = [];
  const maxLength = Math.max(oldObj.length, newObj.length);

  for (let i = 0; i < maxLength; i++) {
    const itemPath = path ? `${path}[${i}]` : `[${i}]`;
    if (i >= oldObj.length) {
      differences.push({ path: itemPath, oldValue: undefined, newValue: newObj[i] });
    } else if (i >= newObj.length) {
      differences.push({ path: itemPath, oldValue: oldObj[i], newValue: undefined });
    } else {
      appendChildDiffs(differences, oldObj[i], newObj[i], itemPath);
    }
  }

  return differences;
}

function diffObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  path: string,
): DifferenceEntry[] {
  const differences: DifferenceEntry[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const keyPath = path ? `${path}.${key}` : key;
    if (!(key in oldObj)) {
      differences.push({ path: keyPath, oldValue: undefined, newValue: newObj[key] });
    } else if (!(key in newObj)) {
      differences.push({ path: keyPath, oldValue: oldObj[key], newValue: undefined });
    } else {
      appendChildDiffs(differences, oldObj[key], newObj[key], keyPath);
    }
  }

  return differences;
}

function diffArrayToObject(
  oldObj: unknown[],
  newObj: Record<string, unknown>,
  path: string,
): DifferenceEntry[] {
  const differences: DifferenceEntry[] = [];

  Object.keys(newObj).forEach((key) => {
    const keyPath = path ? `${path}.${key}` : key;
    const newVal = newObj[key];
    const isSameArray =
      Array.isArray(newVal) && newVal.length === oldObj.length;

    if (isSameArray) {
      appendChildDiffs(differences, oldObj, newVal, keyPath);
    } else {
      differences.push({ path: keyPath, oldValue: undefined, newValue: newVal });
    }
  });

  return differences;
}

export function findDifferences(
  oldObj: unknown,
  newObj: unknown,
  path = "",
): DifferenceEntry[] {
  if (oldObj === null || oldObj === undefined) {
    return diffWhenOldMissing(newObj, path);
  }

  if (newObj === null || newObj === undefined) {
    return diffWhenNewMissing(oldObj, path);
  }

  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    return diffArrays(oldObj, newObj, path);
  }

  if (
    typeof oldObj === "object" &&
    typeof newObj === "object" &&
    !Array.isArray(oldObj) &&
    !Array.isArray(newObj)
  ) {
    return diffObjects(
      oldObj as Record<string, unknown>,
      newObj as Record<string, unknown>,
      path,
    );
  }

  if (Array.isArray(oldObj) && typeof newObj === "object" && !Array.isArray(newObj)) {
    return diffArrayToObject(oldObj, newObj as Record<string, unknown>, path);
  }

  if (
    typeof oldObj === "object" &&
    oldObj !== null &&
    !Array.isArray(oldObj) &&
    Array.isArray(newObj)
  ) {
    const differences: DifferenceEntry[] = [];
    newObj.forEach((item, i) => {
      differences.push(...findDifferences(undefined, item, path ? `${path}[${i}]` : `[${i}]`));
    });
    return differences;
  }

  if (oldObj !== newObj) {
    return [{ path, oldValue: oldObj, newValue: newObj }];
  }

  return [];
}
