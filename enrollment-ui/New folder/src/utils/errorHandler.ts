import { toast } from "sonner";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";

type CenterErrorPopupHandler = (
    status: number | undefined,
    message: string,
) => boolean;

let centerErrorPopupHandler: CenterErrorPopupHandler | null = null;

/**
 * Provider Management registers this so 400/409 can open a centered popup
 * instead of the toaster (handler itself must no-op outside Provider routes).
 * Returns true when the popup handled the message.
 */
export function registerErrorCenterPopupHandler(
    handler: CenterErrorPopupHandler | null,
): void {
    centerErrorPopupHandler = handler;
}

/**
 * Show error toast
 * ✔ shows ONLY backend message
 * ✔ static ONLY for 502, 503
 * ✔ 400 / 409 → centered popup when Provider host has registered a handler
 */
export const showErrorMessage = (response?: {
    status?: number;
    error?: string | { message?: string | null; details?: string | null } | null;
    message?: string | null;
}): void => {
    if (!response) return;

    if (response.status === 502) {
        toast.error("502 Bad Gateway", {
            position: "top-right",
            duration: 5000,
        });
        return;
    }

    if (response.status === 503) {
        toast.error("503 Service Unavailable", {
            position: "top-right",
            duration: 5000,
        });
        return;
    }

    if (response.status === 504) {
        toast.error("504 Gateway Timeout", {
            position: "top-right",
            duration: 5000,
        });
        return;
    }

    if (response.status === 429) {
        toast.error("Too Many Requests", {
            position: "top-right",
            duration: 5000,
        });
        return;
    }

  const rawMessage =
    typeof response.error === "string"
      ? response?.errorPayload?.responseMessage || response.error
      : response?.errorPayload?.responseMessage || response.error?.message || response.error?.details || response.message;
  if (typeof rawMessage === "string" && rawMessage.trim()) {
    const message = sanitizeApiErrorMessage(rawMessage);
    if (centerErrorPopupHandler?.(response.status, message)) {
      return;
    }
    toast.error(message, {
      position: "top-right",
      duration: 5000,
    });
  }
};

/**
 * Show success toast
 */
export const showSuccessMessage = (message?: string): void => {
    if (!message) return;

    toast.success(message, {
        position: "top-right",
        duration: 5000,
    });
};

/**
 * Handle API response
 * ❗ Single source of toast (NO duplicates)
 */
export const handleApiResponse = <T>(
    response: {
        success: boolean;
        data: T | null;
        error?: string | null;
        status?: number;
    },
    successMessage: string,
): boolean => {
    if (response.success) {
        showSuccessMessage(successMessage);
        return true;
    }

    showErrorMessage(response);
    return false;
};
