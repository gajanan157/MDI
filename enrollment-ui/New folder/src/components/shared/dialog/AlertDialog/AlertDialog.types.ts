import type { ReactNode } from "react";

export type AlertDialogType = "success" | "partial" | "error";

export type AlertDialogVariant = "default" | "prominent";

export type AlertDialogProps = {
  type: AlertDialogType;
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  /** Label for the dismiss button (defaults to "Close" / "Cancel"). */
  closeText?: string;
  /** When true, the confirm (e.g. View) action cannot be clicked. */
  confirmDisabled?: boolean;
  /** Hides the top-right X; dialog closes only via action buttons. */
  hideCloseIcon?: boolean;
  /** Prominent styling for high-visibility confirmations. */
  variant?: AlertDialogVariant;
  /** Optional content under the message (e.g. provider comparison). */
  children?: ReactNode;
};


function getMetricsResult(
  alreadyExist: number | null,
  newAdded: number | null
): AlertDialogType | null {
  if (alreadyExist === null || newAdded === null) {
    return null;
  }

  if (alreadyExist > 0 && newAdded > 0) {
    return "partial";
  }

  if (newAdded > 0) {
    return "success";
  }

  return "error";
}

export function handleApiResponse(response: any): AlertDialogType {
  if (!response) {
    return "error";
  }

  if (response.success === true) {
    return "success";
  }

  if (response.partial === true) {
    return "partial";
  }

  const metricsResult = getMetricsResult(
    typeof response.alreadyExist === "number"
      ? response.alreadyExist
      : null,
    typeof response.newAdded === "number"
      ? response.newAdded
      : null
  );

  if (metricsResult) {
    return metricsResult;
  }

  if (
    response.success === false ||
    response.error ||
    response.exception
  ) {
    return "error";
  }

  if (response.status === 206) {
    return "partial";
  }

  return "error";
}