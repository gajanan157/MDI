import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useRef, useState } from "react";
import { Button } from "@/components/ui";

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog should close (Cancel, overlay click, Escape) */
  onClose: () => void;
  /** Called when user confirms. Can be async; optional loading state can be shown. */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Body text or description */
  description: string;
  /** Label for the confirm button (e.g. "Approve", "Delete", "Confirm") */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Confirm button variant: primary (blue), success (green), danger (red) */
  variant?: "primary" | "success" | "danger";
  /** When true, confirm button shows loading state and is disabled */
  loading?: boolean;
  /** Optional class for the panel */
  className?: string;
}

/** Maps our variant to Button's color prop for proper styling */
const variantToColor = {
  primary: "primary" as const,
  success: "success" as const,
  danger: "error" as const,
};

/**
 * Shared confirmation dialog for actions like Approve, Delete, etc.
 * Use across the app whenever you need "Are you sure?" before calling an API or performing an action.
 */
export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  className,
}: ConfirmationDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState(false);
  const isBusy = loading || confirming;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  const dialogProps = isBusy
    ? { onClose: () => {}, static: true }
    : { onClose };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        initialFocus={confirmRef}
        {...dialogProps}
      >
        <TransitionChild
          as="div"
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as="div"
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          <DialogPanel
            className={clsx(
              "relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark-700",
              className,
            )}
          >
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
              <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 sm:mx-0">
                <ExclamationTriangleIcon className="size-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-4 sm:ml-4 sm:mt-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={isBusy}
                className="min-w-[80px]"
              >
                {cancelLabel}
              </Button>
              <Button
                ref={confirmRef}
                type="button"
                color={variantToColor[variant]}
                variant="filled"
                onClick={handleConfirm}
                disabled={isBusy}
                className="min-w-[80px]"
              >
                {isBusy ? "Please wait..." : confirmLabel}
              </Button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
