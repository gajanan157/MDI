import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export const ALPHABET_ONLY_PATTERN = /^[A-Za-z\s]*$/;

export const ALPHABET_ONLY_VALIDATION_MESSAGE =
  "Only alphabetic characters are allowed";

const ALLOWED_NAVIGATION_KEYS = [
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  " ",
] as const;

type AlphabetOnlyInputHandlers = {
  onInvalidInput?: () => void;
  onValidInput?: () => void;
};

function isAlphabetOnlyValue(value: string): boolean {
  return ALPHABET_ONLY_PATTERN.test(value);
}

function clearInputErrorIfValueValid(
  value: string,
  handlers?: AlphabetOnlyInputHandlers,
): void {
  if (isAlphabetOnlyValue(value)) {
    handlers?.onValidInput?.();
  }
}

function applyAlphabetOnlyChange(
  event: ChangeEvent<HTMLInputElement>,
  handlers: AlphabetOnlyInputHandlers | undefined,
  registerOnChange: (event: ChangeEvent<HTMLInputElement>) => void,
): void {
  const raw = event.target.value;
  const filtered = filterAlphabetOnlyInput(raw);
  if (raw !== filtered) {
    handlers?.onInvalidInput?.();
    event.target.value = filtered;
    if (isAlphabetOnlyValue(filtered)) {
      handlers?.onValidInput?.();
    }
  } else if (isAlphabetOnlyValue(filtered)) {
    handlers?.onValidInput?.();
  }
  registerOnChange(event);
}

export function filterAlphabetOnlyInput(value: string): string {
  return value.replace(/[^A-Za-z\s]/g, "");
}

export function handleAlphabetOnlyKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
): void {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (
    ALLOWED_NAVIGATION_KEYS.includes(
      event.key as (typeof ALLOWED_NAVIGATION_KEYS)[number],
    )
  ) {
    return;
  }
  if (/^[a-zA-Z]$/.test(event.key)) {
    return;
  }
  event.preventDefault();
}

export function handleAlphabetOnlyPaste(
  event: ClipboardEvent<HTMLInputElement>,
  handlers?: AlphabetOnlyInputHandlers,
): void {
  const pasted = event.clipboardData.getData("text");
  if (!ALPHABET_ONLY_PATTERN.test(pasted)) {
    handlers?.onInvalidInput?.();
    event.preventDefault();
    return;
  }
}

/** React Hook Form register props with alphabet-only typing, key, and paste guards. */
export function bindAlphabetOnlyRegister(
  registerReturn: UseFormRegisterReturn,
  handlers?: AlphabetOnlyInputHandlers,
) {
  return {
    ...registerReturn,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      applyAlphabetOnlyChange(event, handlers, registerReturn.onChange);
    },
    onBlur: (event: ChangeEvent<HTMLInputElement>) => {
      registerReturn.onBlur(event);
      clearInputErrorIfValueValid(event.target.value, handlers);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) =>
      handleAlphabetOnlyKeyDown(event),
    onPaste: (event: ClipboardEvent<HTMLInputElement>) =>
      handleAlphabetOnlyPaste(event, handlers),
  };
}
