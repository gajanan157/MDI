import { useCallback, useEffect, useState } from "react";
import AlertDialogComponent from "@/components/shared/dialog/AlertDialog/AlertDialog";
import {
  registerProviderAlertListener,
  type ProviderAlertOptions,
} from "./showProviderAlert";

type OpenAlertState = Required<
  Pick<ProviderAlertOptions, "type" | "title" | "message" | "closeText" | "variant">
> & { open: true };

/**
 * Global host for Provider Management alert popups.
 * Mount once near the app root; call `showProviderError` / `showProviderAlert` from anywhere.
 * Also registers 400/409 handling so `showErrorMessage({ status: 400|409, ... })` opens this dialog.
 */
export function ProviderAlertDialogHost() {
  const [alert, setAlert] = useState<OpenAlertState | null>(null);

  useEffect(() => {
    registerProviderAlertListener((options) => {
      if (!options) {
        setAlert(null);
        return;
      }
      setAlert({
        open: true,
        type: options.type ?? "error",
        title: options.title ?? "Error",
        message: options.message,
        closeText: options.closeText ?? "OK",
        variant: options.variant ?? "prominent",
      });
    });
    return () => registerProviderAlertListener(null);
  }, []);

  const onClose = useCallback(() => {
    setAlert(null);
  }, []);

  if (!alert) return null;

  return (
    <AlertDialogComponent
      type={alert.type}
      variant={alert.variant}
      hideCloseIcon
      title={alert.title}
      message={alert.message}
      isOpen={alert.open}
      onClose={onClose}
      closeText={alert.closeText}
    />
  );
}
