import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";

export const ALPHANUMERIC_CODE_PATTERN = /^[A-Za-z0-9-]*$/;

export const ALPHANUMERIC_CODE_VALIDATION_MESSAGE =
  "Only letters, numbers, and hyphen are allowed";

export const SPECIAL_CHAR_NOT_ACCEPTED_MESSAGE =
  "Special characters are not accepted";

type AlphanumericCodeInputHandlers = {
  onInvalidInput?: () => void;
  onValidInput?: () => void;
};

const NAVIGATION_KEYS = [
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
] as const;

/** Letters, digits, and hyphen (e.g. HSP-IC1). Strips other special characters. */
export function filterAlphanumericCodeInput(value: string): string {
  return value.replace(/[^A-Za-z0-9-]/g, "");
}

export function getAlphanumericCodeValidationError(
  value: string,
  invalidMessage = SPECIAL_CHAR_NOT_ACCEPTED_MESSAGE,
): string | undefined {
  if (!value.trim()) return undefined;
  return ALPHANUMERIC_CODE_PATTERN.test(value) ? undefined : invalidMessage;
}

export function handleAlphanumericCodeKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  handlers?: AlphanumericCodeInputHandlers,
): void {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (
    NAVIGATION_KEYS.includes(event.key as (typeof NAVIGATION_KEYS)[number])
  ) {
    return;
  }
  if (/^[a-zA-Z0-9-]$/.test(event.key)) {
    handlers?.onValidInput?.();
    return;
  }
  handlers?.onInvalidInput?.();
  event.preventDefault();
}

export function handleAlphanumericCodeBeforeInput(
  event: FormEvent<HTMLInputElement>,
  handlers?: AlphanumericCodeInputHandlers,
): void {
  const data = (event.nativeEvent as InputEvent).data;
  if (data && !/^[a-zA-Z0-9-]$/.test(data)) {
    handlers?.onInvalidInput?.();
    event.preventDefault();
    return;
  }
  if (data) {
    handlers?.onValidInput?.();
  }
}

export function handleAlphanumericCodePaste(
  event: ClipboardEvent<HTMLInputElement>,
  currentValue: string,
  onValue: (value: string) => void,
  handlers?: AlphanumericCodeInputHandlers,
): void {
  event.preventDefault();
  const raw = event.clipboardData.getData("text");
  const pasted = filterAlphanumericCodeInput(raw);
  if (raw && raw !== pasted) {
    handlers?.onInvalidInput?.();
  } else if (pasted) {
    handlers?.onValidInput?.();
  }
  if (!pasted) return;

  const input = event.currentTarget;
  const start = input.selectionStart ?? currentValue.length;
  const end = input.selectionEnd ?? currentValue.length;
  onValue(
    filterAlphanumericCodeInput(
      `${currentValue.slice(0, start)}${pasted}${currentValue.slice(end)}`,
    ),
  );
}

export function commitAlphanumericCodeInput(
  raw: string,
  onValue: (value: string) => void,
  handlers?: AlphanumericCodeInputHandlers,
): void {
  const filtered = filterAlphanumericCodeInput(raw);
  if (raw !== filtered) {
    handlers?.onInvalidInput?.();
  } else {
    handlers?.onValidInput?.();
  }
  onValue(filtered);
}
