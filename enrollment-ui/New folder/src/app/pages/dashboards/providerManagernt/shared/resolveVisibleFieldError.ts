import type { FieldError, FieldErrors, FieldValues } from "react-hook-form";

export function resolveVisibleFieldError(
  errors: FieldErrors<FieldValues>,
  touchedFields: Partial<Readonly<Record<string, unknown>>>,
  isSubmitted: boolean,
  name: string,
): string | undefined {
  const fieldError = errors[name] as FieldError | undefined;
  const message = fieldError?.message;
  if (!message) return undefined;
  if (isSubmitted || touchedFields[name]) {
    return String(message);
  }
  return undefined;
}

export function resolveVisibleDropdownError(
  errors: FieldErrors<FieldValues>,
  touchedFields: Partial<Readonly<Record<string, unknown>>>,
  isSubmitted: boolean,
  name: string,
): FieldError | undefined {
  const message = resolveVisibleFieldError(errors, touchedFields, isSubmitted, name);
  return message ? { type: "validation", message } : undefined;
}
