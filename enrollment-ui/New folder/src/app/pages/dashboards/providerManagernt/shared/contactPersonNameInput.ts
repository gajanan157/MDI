import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import {
  ALPHABET_ONLY_PATTERN,
  ALPHABET_ONLY_VALIDATION_MESSAGE,
} from "./alphabetOnlyInput";

export type ContactPersonTextField = "name" | "designation";

const NUMBER_ERROR_BY_FIELD: Record<ContactPersonTextField, string> = {
  name: "Numbers are not allowed in name",
  designation: "Numbers are not allowed in designation",
};

export const CONTACT_PERSON_NAME_NUMBER_ERROR = NUMBER_ERROR_BY_FIELD.name;

export const CONTACT_PERSON_DESIGNATION_NUMBER_ERROR =
  NUMBER_ERROR_BY_FIELD.designation;

export function filterContactPersonTextInput(value: string): string {
  return value.replace(/[^A-Za-z0-9\s]/g, "");
}

/** @deprecated Use filterContactPersonTextInput */
export const filterContactPersonNameInput = filterContactPersonTextInput;

export function getContactPersonTextValidationError(
  value: string,
  field: ContactPersonTextField,
): string | undefined {
  if (/\d/.test(value)) return NUMBER_ERROR_BY_FIELD[field];
  if (value && !ALPHABET_ONLY_PATTERN.test(value)) {
    return ALPHABET_ONLY_VALIDATION_MESSAGE;
  }
  return undefined;
}

export function getContactPersonNameValidationError(
  value: string,
): string | undefined {
  return getContactPersonTextValidationError(value, "name");
}

export function getContactPersonDesignationValidationError(
  value: string,
): string | undefined {
  if (!value.trim()) return undefined;
  return getContactPersonTextValidationError(value, "designation");
}

export function isContactPersonTextValueValid(
  value: string,
  field: ContactPersonTextField,
): boolean {
  return !getContactPersonTextValidationError(value, field);
}

export function isContactPersonNameValueValid(value: string): boolean {
  return isContactPersonTextValueValid(value, "name");
}

export function isContactPersonDesignationValueValid(value: string): boolean {
  if (!value.trim()) return true;
  return isContactPersonTextValueValid(value, "designation");
}

type ContactPersonTextInputHandlers = {
  onInvalidInput?: () => void;
  onValidInput?: () => void;
};

function applyContactPersonTextChange(
  event: ChangeEvent<HTMLInputElement>,
  field: ContactPersonTextField,
  handlers: ContactPersonTextInputHandlers | undefined,
  registerOnChange: (event: ChangeEvent<HTMLInputElement>) => void,
): void {
  const value = event.target.value;
  const validationError = getContactPersonTextValidationError(value, field);
  if (validationError) handlers?.onInvalidInput?.();
  else handlers?.onValidInput?.();
  registerOnChange(event);
}

function bindContactPersonTextRegister(
  field: ContactPersonTextField,
  registerReturn: UseFormRegisterReturn,
  handlers?: ContactPersonTextInputHandlers,
) {
  return {
    ...registerReturn,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      applyContactPersonTextChange(event, field, handlers, registerReturn.onChange);
    },
    onBlur: (event: ChangeEvent<HTMLInputElement>) => {
      registerReturn.onBlur(event);
      const validationError = getContactPersonTextValidationError(
        event.target.value,
        field,
      );
      if (validationError) handlers?.onInvalidInput?.();
      else handlers?.onValidInput?.();
    },
  };
}

export function bindContactPersonNameRegister(
  registerReturn: UseFormRegisterReturn,
  handlers?: ContactPersonTextInputHandlers,
) {
  return bindContactPersonTextRegister("name", registerReturn, handlers);
}

export function bindContactPersonDesignationRegister(
  registerReturn: UseFormRegisterReturn,
  handlers?: ContactPersonTextInputHandlers,
) {
  return bindContactPersonTextRegister("designation", registerReturn, handlers);
}

export function syncContactPersonNameInputError(value: string): string {
  return getContactPersonNameValidationError(value) ?? "";
}

export function syncContactPersonDesignationInputError(value: string): string {
  return getContactPersonDesignationValidationError(value) ?? "";
}
