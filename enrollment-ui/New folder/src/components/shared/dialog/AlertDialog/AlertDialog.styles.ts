import type { AlertDialogType, AlertDialogVariant } from "./AlertDialog.types";

export const alertTheme: Record<
  AlertDialogType,
  {
    ring: string;
    icon: string;
    title: string;
    message: string;
    confirmColor: "success" | "warning" | "error";
    prominentRing: string;
    prominentIconBg: string;
    prominentIcon: string;
    prominentTitle: string;
    prominentMessage: string;
  }
> = {
  success: {
    ring: "ring-1 ring-emerald-200",
    icon: "text-emerald-600",
    title: "text-emerald-700",
    message: "text-emerald-700/90",
    confirmColor: "success",
    prominentRing: "ring-2 ring-emerald-300 shadow-xl shadow-emerald-200/60",
    prominentIconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100 ring-4 ring-emerald-100",
    prominentIcon: "text-emerald-600",
    prominentTitle: "text-emerald-800",
    prominentMessage: "text-emerald-700",
  },
  partial: {
    ring: "ring-1 ring-amber-200",
    icon: "text-amber-600",
    title: "text-amber-700",
    message: "text-amber-700/90",
    confirmColor: "warning",
    prominentRing: "ring-2 ring-amber-300 shadow-xl shadow-amber-200/60",
    prominentIconBg: "bg-gradient-to-br from-amber-50 to-amber-100 ring-4 ring-amber-100",
    prominentIcon: "text-amber-600",
    prominentTitle: "text-amber-800",
    prominentMessage: "text-amber-700",
  },
  error: {
    ring: "ring-1 ring-red-200",
    icon: "text-red-600",
    title: "text-red-700",
    message: "text-red-700/90",
    confirmColor: "error",
    prominentRing: "ring-2 ring-red-300 shadow-xl shadow-red-200/60",
    prominentIconBg: "bg-gradient-to-br from-red-50 to-red-100 ring-4 ring-red-100",
    prominentIcon: "text-red-600",
    prominentTitle: "text-red-800",
    prominentMessage: "text-red-700",
  },
};

export function getAlertDialogPanelClass(
  type: AlertDialogType,
  variant: AlertDialogVariant,
): string {
  if (variant === "prominent") {
    return alertTheme[type].prominentRing;
  }
  return alertTheme[type].ring;
}

