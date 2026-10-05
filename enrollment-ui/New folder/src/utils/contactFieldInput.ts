import type { UseFormRegisterReturn } from "react-hook-form";
const CONTACT_PHONE_PATTERN = /^[\d+\s\-,;]*$/;
const CONTACT_EMAIL_PATTERN = /^[a-zA-Z0-9@._+\-,;\s]*$/;

export const CONTACT_SPECIAL_CHAR_MESSAGE = "Special characters are not accepted";

export const CONTACT_PHONE_NUMBERS_ONLY_MESSAGE = "Only numbers are allowed";

function isContactPhoneValue(value: string): boolean {
  return CONTACT_PHONE_PATTERN.test(value);
}

function isContactEmailValue(value: string): boolean {
  return CONTACT_EMAIL_PATTERN.test(value);
}

export function isContactPhoneInputValue(value: string): boolean {
  return isContactPhoneValue(value);
}

export function isContactEmailInputValue(value: string): boolean {
  return isContactEmailValue(value);
}

export function filterContactPhoneInput(value: string): string {
  return value.replace(/[^\d+\s\-,;]/g, "");
}

export function bindContactPhoneRegister(registerReturn: UseFormRegisterReturn) {
  return { ...registerReturn };
}

export function bindContactEmailRegister(registerReturn: UseFormRegisterReturn) {
  return { ...registerReturn };
}

export function getContactPhoneCharValidationError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  return isContactPhoneInputValue(value) ? undefined : CONTACT_PHONE_NUMBERS_ONLY_MESSAGE;
}

export function getContactEmailCharValidationError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  return isContactEmailInputValue(value) ? undefined : CONTACT_SPECIAL_CHAR_MESSAGE;
}

export function filterContactEmailInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9@._+\-,;\s]/g, "");
}
