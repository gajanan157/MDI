import { Fragment, useRef, type ReactNode, type RefObject } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import clsx from "clsx";

import type { AlertDialogProps } from "./AlertDialog.types";
import { alertTheme, getAlertDialogPanelClass } from "./AlertDialog.styles";

const typeToIcon = {
  success: CheckCircleIcon,
  partial: ExclamationTriangleIcon,
  error: XCircleIcon,
} as const;

type AlertTheme = (typeof alertTheme)[keyof typeof alertTheme];
type ThemeIconType = (typeof typeToIcon)[keyof typeof typeToIcon];

function getPanelSizeClass(hasChildren: boolean, isProminent: boolean): string {
  if (hasChildren) {
    return "max-w-5xl px-3 py-2.5 sm:px-4";
  }
  if (isProminent) {
    return "max-w-lg px-6 py-8 sm:px-8";
  }
  return "max-w-md px-4 py-6";
}

function getIconWrapClass(isProminent: boolean, hasChildren: boolean, theme: AlertTheme): string {
  if (isProminent) {
    return clsx("size-20", theme.prominentIconBg);
  }
  if (hasChildren) {
    return "size-7 bg-gray-50 dark:bg-dark-600";
  }
  return "size-16 bg-gray-50 dark:bg-dark-600";
}

function getIconClass(isProminent: boolean, hasChildren: boolean, theme: AlertTheme): string {
  if (isProminent) {
    return clsx("h-11 w-11", theme.prominentIcon);
  }
  if (hasChildren) {
    return clsx("h-4 w-4", theme.icon);
  }
  return clsx("h-9 w-9", theme.icon);
}

function getBackdropClass(isProminent: boolean): string {
  if (isProminent) {
    return "fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm";
  }
  return "fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-[1px]";
}

function getFooterClass(hasChildren: boolean, isProminent: boolean): string {
  if (hasChildren) {
    return "flex items-center gap-2 mt-2 justify-end";
  }
  if (isProminent) {
    return "flex items-center gap-2 mt-8 justify-center";
  }
  return "flex items-center gap-2 mt-5 justify-center";
}

function getCloseButtonClass(isProminent: boolean, hasChildren: boolean): string {
  if (isProminent) {
    return "h-10 min-w-32 text-sm font-semibold";
  }
  if (hasChildren) {
    return "h-8 min-w-24 px-4 py-0 text-xs";
  }
  return "h-9 min-w-28 text-sm";
}

function getConfirmButtonClass(isProminent: boolean, hasChildren: boolean): string {
  if (isProminent) {
    return "h-10 min-w-32 text-sm font-semibold shadow-md";
  }
  if (hasChildren) {
    return "h-8 min-w-24 px-4 py-0 text-xs font-semibold";
  }
  return "h-9 min-w-28 text-sm font-semibold";
}

function getDismissLabel(closeText: string | undefined, hasConfirm: boolean): string {
  if (closeText) {
    return closeText;
  }
  if (hasConfirm) {
    return "Close";
  }
  return "Cancel";
}

function getDefaultTitleClass(isProminent: boolean, theme: AlertTheme): string {
  if (isProminent) {
    return clsx("mt-4 font-semibold text-xl sm:text-2xl font-bold", theme.prominentTitle);
  }
  return clsx("mt-4 font-semibold text-base", theme.title);
}

function getDefaultMessageClass(isProminent: boolean, theme: AlertTheme): string {
  if (isProminent) {
    return clsx(
      "mt-2 whitespace-pre-line text-sm leading-5 text-base sm:text-lg leading-relaxed",
      theme.prominentMessage,
    );
  }
  return clsx("mt-2 whitespace-pre-line text-sm leading-5", theme.message);
}

async function runConfirmAction(
  confirmDisabled: boolean | undefined,
  onConfirm?: () => void | Promise<void>,
): Promise<void> {
  if (confirmDisabled) {
    return;
  }
  await onConfirm?.();
}

function dismissDialog(hideCloseIcon: boolean, onClose: () => void): void {
  if (hideCloseIcon) {
    return;
  }
  onClose();
}

function AlertDialogCloseIcon({
  hideCloseIcon,
  onClose,
}: Readonly<{
  hideCloseIcon: boolean;
  onClose: () => void;
}>) {
  if (hideCloseIcon) {
    return null;
  }

  return (
    <div className="absolute right-3 top-3">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className={clsx(
          "inline-flex h-9 w-9 items-center justify-center rounded-full",
          "text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300",
          "dark:text-dark-50 dark:hover:bg-dark-600 dark:focus:ring-dark-400",
        )}
      >
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

type HeaderProps = {
  hasChildren: boolean;
  isProminent: boolean;
  theme: AlertTheme;
  ThemeIcon: ThemeIconType;
  iconWrapClass: string;
  iconClass: string;
  title: string;
  message: string;
};

function AlertDialogHeader(props: Readonly<HeaderProps>) {
  const { hasChildren, isProminent, theme, ThemeIcon, iconWrapClass, iconClass, title, message } = props;

  if (hasChildren) {
    return (
      <div className="flex items-center justify-center gap-2 pr-6">
        <div className={clsx("flex items-center justify-center rounded-full", iconWrapClass)}>
          <ThemeIcon className={iconClass} aria-hidden="true" />
        </div>
        <div className="min-w-0 text-left">
          <h3 className={clsx("text-sm font-semibold leading-4", theme.title)}>{title}</h3>
          <p className={clsx("mt-0.5 text-[11px] leading-3.5", theme.message)}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={clsx("mx-auto flex items-center justify-center rounded-full", iconWrapClass)}>
        <ThemeIcon className={iconClass} aria-hidden="true" />
      </div>
      <h3 className={getDefaultTitleClass(isProminent, theme)}>{title}</h3>
      <p className={getDefaultMessageClass(isProminent, theme)}>{message}</p>
    </>
  );
}

function AlertDialogExtraContent({ children }: Readonly<{ children?: ReactNode }>) {
  if (!children) {
    return null;
  }
  return <div className="mt-1.5 text-left">{children}</div>;
}

type ActionsProps = {
  hasChildren: boolean;
  isProminent: boolean;
  hasConfirm: boolean;
  hideCloseIcon: boolean;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onConfirmClick: () => void | Promise<void>;
  closeText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  confirmColor: AlertTheme["confirmColor"];
};

function AlertDialogActions(props: Readonly<ActionsProps>) {
  const {
    hasChildren,
    isProminent,
    hasConfirm,
    hideCloseIcon,
    closeBtnRef,
    onClose,
    onConfirmClick,
    closeText,
    confirmText,
    confirmDisabled,
    confirmColor,
  } = props;

  return (
    <div className={getFooterClass(hasChildren, isProminent)}>
      <Button
        ref={hideCloseIcon ? closeBtnRef : undefined}
        onClick={onClose}
        variant="outlined"
        color="neutral"
        className={getCloseButtonClass(isProminent, hasChildren)}
      >
        {getDismissLabel(closeText, hasConfirm)}
      </Button>

      {hasConfirm && (
        <Button
          onClick={onConfirmClick}
          color={confirmColor}
          className={getConfirmButtonClass(isProminent, hasChildren)}
          disabled={confirmDisabled}
        >
          {confirmText ?? "Confirm"}
        </Button>
      )}
    </div>
  );
}

/**
 * Reusable alert dialog.
 * - Uses HeadlessUI `Dialog` for focus trapping + ESC to close.
 * - Shows themed icon + soft color based on `type`.
 */
export default function AlertDialogComponent(props: Readonly<AlertDialogProps>) {
  const {
    type,
    title,
    message,
    isOpen,
    onClose,
    onConfirm,
    confirmText,
    closeText,
    confirmDisabled,
    hideCloseIcon = false,
    variant = "default",
    children,
  } = props;

  const ThemeIcon = typeToIcon[type];
  const theme = alertTheme[type];
  const isProminent = variant === "prominent";
  const hasChildren = Boolean(children);
  const hasConfirm = typeof onConfirm === "function";
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[300]"
        onClose={() => dismissDialog(hideCloseIcon, onClose)}
        initialFocus={closeBtnRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={getBackdropClass(isProminent)} />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-6 sm:px-5">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90 translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-1"
            >
              <div
                className={clsx(
                  "relative w-full rounded-xl bg-white text-center dark:bg-dark-700",
                  getPanelSizeClass(hasChildren, isProminent),
                  getAlertDialogPanelClass(type, variant),
                  "ring-offset-2 dark:ring-offset-dark-900",
                )}
                role="dialog"
                aria-modal="true"
                aria-label={title}
              >
                <AlertDialogCloseIcon hideCloseIcon={hideCloseIcon} onClose={onClose} />

                <AlertDialogHeader
                  hasChildren={hasChildren}
                  isProminent={isProminent}
                  theme={theme}
                  ThemeIcon={ThemeIcon}
                  iconWrapClass={getIconWrapClass(isProminent, hasChildren, theme)}
                  iconClass={getIconClass(isProminent, hasChildren, theme)}
                  title={title}
                  message={message}
                />

                <AlertDialogExtraContent>{children}</AlertDialogExtraContent>

                <AlertDialogActions
                  hasChildren={hasChildren}
                  isProminent={isProminent}
                  hasConfirm={hasConfirm}
                  hideCloseIcon={hideCloseIcon}
                  closeBtnRef={closeBtnRef}
                  onClose={onClose}
                  onConfirmClick={() => runConfirmAction(confirmDisabled, onConfirm)}
                  closeText={closeText}
                  confirmText={confirmText}
                  confirmDisabled={confirmDisabled}
                  confirmColor={theme.confirmColor}
                />
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Re-export helper for convenient imports from this folder.
export { handleApiResponse } from "./AlertDialog.types";
