import { deepClone, getAt, setAt, isListingArray } from "./utils";

export interface AddFieldCallbacks {
  markNewField: (fullFieldPath: string) => void;
  markListingArrayField: (fullFieldPath: string) => void;
  updateFormValue?: (formFieldPath: string, value: unknown) => void;
}

export interface AddFieldResult {
  newState: Record<string, unknown>;
  fullFieldPath: string;
  isListingArrayField: boolean;
  formFieldUpdate?: { path: string; value: unknown };
}

function buildFieldValue(fieldValue: unknown, metadata?: Record<string, unknown>) {
  if (!metadata) return fieldValue;
  return {
    ...(typeof fieldValue === "object" && fieldValue !== null ? fieldValue : {}),
    sources: metadata.sources || [],
    conditions: metadata.conditions || [],
  };
}

function resolveFullFieldPath(fieldPath: string, fieldName: string): string {
  return fieldPath ? `${fieldPath}.${fieldName}` : fieldName;
}

export function addFieldToFormState(
  prevState: Record<string, unknown>,
  fieldPath: string,
  fieldName: string,
  fieldValue: unknown,
  metadata: Record<string, unknown> | undefined,
): AddFieldResult {
  const newState = deepClone(prevState);
  const pathParts = fieldPath.split(".");
  const target = getAt(newState, pathParts);
  const finalValue = buildFieldValue(fieldValue, metadata);
  const fullFieldPath = resolveFullFieldPath(fieldPath, fieldName);
  const isListingArrayField =
    Array.isArray(fieldValue) && isListingArray(fieldValue);

  if (target && typeof target === "object" && !Array.isArray(target)) {
    return {
      newState: setAt(newState, pathParts, { ...target, [fieldName]: finalValue }),
      fullFieldPath,
      isListingArrayField,
    };
  }

  if (
    target !== undefined &&
    target !== null &&
    (typeof target !== "object" || Array.isArray(target))
  ) {
    const fieldKey = pathParts[pathParts.length - 1];
    const updated = {
      [fieldKey]: target,
      [fieldName]: finalValue,
    };

    return {
      newState: setAt(newState, pathParts, updated),
      fullFieldPath,
      isListingArrayField,
      formFieldUpdate: { path: pathParts.join("."), value: updated },
    };
  }

  if (target === undefined || target === null) {
    return {
      newState: setAt(newState, pathParts, { [fieldName]: finalValue }),
      fullFieldPath,
      isListingArrayField,
    };
  }

  return { newState, fullFieldPath, isListingArrayField: false };
}

export function applyAddFieldToState(
  prevState: Record<string, unknown>,
  fieldPath: string,
  fieldName: string,
  fieldValue: unknown,
  metadata: Record<string, unknown> | undefined,
  callbacks: AddFieldCallbacks,
): Record<string, unknown> {
  const result = addFieldToFormState(
    prevState,
    fieldPath,
    fieldName,
    fieldValue,
    metadata,
  );

  callbacks.markNewField(result.fullFieldPath);
  if (result.isListingArrayField) {
    callbacks.markListingArrayField(result.fullFieldPath);
  }
  if (result.formFieldUpdate) {
    callbacks.updateFormValue?.(
      result.formFieldUpdate.path,
      result.formFieldUpdate.value,
    );
  }

  return result.newState;
}
