function mergeSourcesKey(
  formRecord: Record<string, unknown>,
  actualRecord: Record<string, unknown>,
  key: string,
): unknown {
  if (
    Object.prototype.hasOwnProperty.call(actualRecord, "sources") &&
    actualRecord.sources !== undefined
  ) {
    return actualRecord[key];
  }
  return formRecord[key];
}

function mergeArrayKey(
  formRecord: Record<string, unknown>,
  actualRecord: Record<string, unknown>,
  key: string,
): unknown[] {
  const formArray = formRecord[key] as unknown[];
  const actualArray = actualRecord[key] as unknown[];
  return formArray.map((item, index) => {
    if (index < actualArray.length) {
      return deepMergeWithSources(item, actualArray[index]);
    }
    return item;
  });
}

function mergeNestedObjectKey(
  formRecord: Record<string, unknown>,
  actualRecord: Record<string, unknown>,
  key: string,
): unknown {
  return deepMergeWithSources(formRecord[key], actualRecord[key]);
}

function mergeObjectRecords(
  formRecord: Record<string, unknown>,
  actualRecord: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...actualRecord };

  for (const key in formRecord) {
    if (!Object.prototype.hasOwnProperty.call(formRecord, key)) continue;

    if (key === "sources") {
      result[key] = mergeSourcesKey(formRecord, actualRecord, key);
      continue;
    }

    if (Array.isArray(formRecord[key]) && Array.isArray(actualRecord[key])) {
      result[key] = mergeArrayKey(formRecord, actualRecord, key);
      continue;
    }

    if (
      typeof formRecord[key] === "object" &&
      formRecord[key] !== null &&
      typeof actualRecord[key] === "object" &&
      actualRecord[key] !== null &&
      !Array.isArray(formRecord[key]) &&
      !Array.isArray(actualRecord[key])
    ) {
      result[key] = mergeNestedObjectKey(formRecord, actualRecord, key);
      continue;
    }

    result[key] = formRecord[key];
  }

  return result;
}

export function deepMergeWithSources(
  formData: unknown,
  actualData: unknown,
): unknown {
  if (actualData === null || actualData === undefined) {
    return formData;
  }

  if (Array.isArray(formData) && Array.isArray(actualData)) {
    return formData.map((item, index) => {
      if (index < actualData.length) {
        return deepMergeWithSources(item, actualData[index]);
      }
      return item;
    });
  }

  if (
    typeof formData === "object" &&
    formData !== null &&
    typeof actualData === "object" &&
    actualData !== null &&
    !Array.isArray(formData) &&
    !Array.isArray(actualData)
  ) {
    return mergeObjectRecords(
      formData as Record<string, unknown>,
      actualData as Record<string, unknown>,
    );
  }

  return formData;
}
