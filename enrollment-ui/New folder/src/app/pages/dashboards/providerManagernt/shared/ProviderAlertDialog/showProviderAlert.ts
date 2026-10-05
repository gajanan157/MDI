import type { AlertDialogType, AlertDialogVariant } from "@/components/shared/dialog/AlertDialog/AlertDialog.types";
import {
  registerErrorCenterPopupHandler,
  showErrorMessage,
} from "@/utils/errorHandler";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import { dismissOpenOverlayMenus } from "@/utils/dismissOpenOverlayMenus";

export type ProviderAlertOptions = {
  type?: AlertDialogType;
  title?: string;
  message: string;
  closeText?: string;
  variant?: AlertDialogVariant;
};

export type ProviderErrorMessageInput = {
  status?: number;
  error?: string | { message?: string | null; details?: string | null } | null;
  message?: string | null;
};

type ProviderAlertListener = (options: ProviderAlertOptions | null) => void;

/** HTTP statuses that show a centered Provider Management popup instead of a toaster. */
export const PROVIDER_CENTER_POPUP_ERROR_STATUSES = new Set([400, 404, 409]);

const PROVIDER_MANAGEMENT_PATH_PREFIX = "/provider-masters";

let listener: ProviderAlertListener | null = null;

/** Center popup is only for Provider Management routes — never enrolment / other modules. */
export function isProviderManagementRoute(
  pathname: string = typeof window !== "undefined" ? window.location.pathname : "",
): boolean {
  return pathname.startsWith(PROVIDER_MANAGEMENT_PATH_PREFIX);
}

export function registerProviderAlertListener(
  next: ProviderAlertListener | null,
): void {
  listener = next;
  registerErrorCenterPopupHandler(
    next
      ? (status, message) => tryShowProviderCenterErrorPopup(status, message)
      : null,
  );
}

function resolveErrorText(response: ProviderErrorMessageInput): string {
  const rawMessage =
    typeof response.error === "string"
      ? response.error
      : response.error?.message || response.error?.details || response.message;
  if (typeof rawMessage !== "string") return "";
  return sanitizeApiErrorMessage(rawMessage, "").trim();
}

function openProviderAlertDialog(options: ProviderAlertOptions): void {
  const message = sanitizeApiErrorMessage(options.message, "").trim();
  if (!message) return;

  if (!listener) {
    console.warn("[ProviderAlert] Host not mounted; falling back to toaster:", message);
    showErrorMessage({ error: message });
    return;
  }

  dismissOpenOverlayMenus();
  listener({
    type: options.type ?? "error",
    title: options.title ?? (options.type === "success" ? "Success" : "Error"),
    message,
    closeText: options.closeText ?? "OK",
    variant: options.variant ?? "prominent",
  });
}

export function shouldShowProviderCenterErrorPopup(status?: number): boolean {
  const code = typeof status === "number" ? status : Number(status);
  return Number.isFinite(code) && PROVIDER_CENTER_POPUP_ERROR_STATUSES.has(code);
}

/**
 * Non-error alerts use the centered Provider Management dialog.
 * Error alerts with status 400/409 also use the centered dialog; other errors use the toaster.
 */
export function showProviderAlert(options: ProviderAlertOptions & { status?: number }): void {
  const message = sanitizeApiErrorMessage(options.message, "").trim();
  if (!message) return;

  if ((options.type ?? "error") === "error") {
    showProviderError(message, options.title, options.status);
    return;
  }

  openProviderAlertDialog(options);
}

/**
 * Provider Management API/client errors.
 * - 400 / 409 → centered popup
 * - other errors → top-right toaster
 *
 * Call as `showProviderError(message, status)` or `showProviderError(message, title, status)`.
 */
export function showProviderError(
  message: string | null | undefined,
  titleOrStatus: string | number = "Error",
  status?: number,
): void {
  const title = typeof titleOrStatus === "number" ? "Error" : titleOrStatus;
  const resolvedStatus = typeof titleOrStatus === "number" ? titleOrStatus : status;
  const sanitized = sanitizeApiErrorMessage(message ?? "", "").trim();
  if (!sanitized) return;

  if (shouldShowProviderCenterErrorPopup(resolvedStatus)) {
    openProviderAlertDialog({
      type: "error",
      title,
      message: sanitized,
    });
    return;
  }

  if (resolvedStatus === 502 || /^502\b/i.test(sanitized)) {
    showErrorMessage({ status: 502, error: sanitized });
    return;
  }
  if (resolvedStatus === 503 || /^503\b/i.test(sanitized)) {
    showErrorMessage({ status: 503, error: sanitized });
    return;
  }
  if (resolvedStatus === 504 || /^504\b/i.test(sanitized)) {
    showErrorMessage({ status: 504, error: sanitized });
    return;
  }

  showErrorMessage({ status: resolvedStatus, error: sanitized });
}

/**
 * Drop-in Provider Management replacement for `showErrorMessage`.
 * Routes 400/409 messages to the centered popup; everything else stays on the toaster.
 */
export function showProviderErrorMessage(response?: ProviderErrorMessageInput): void {
  if (!response) return;

  if (shouldShowProviderCenterErrorPopup(response.status)) {
    const message = resolveErrorText(response);
    if (!message) return;
    openProviderAlertDialog({
      type: "error",
      title: "Error",
      message,
    });
    return;
  }

  showErrorMessage(response);
}

/** Used when `showErrorMessage` receives 400/409 and the Provider alert host is mounted. */
export function tryShowProviderCenterErrorPopup(
  status: number | undefined,
  message: string,
): boolean {
  if (!isProviderManagementRoute()) return false;
  if (!shouldShowProviderCenterErrorPopup(status)) return false;
  if (!listener) return false;
  openProviderAlertDialog({
    type: "error",
    title: "Error",
    message,
  });
  return true;
}
