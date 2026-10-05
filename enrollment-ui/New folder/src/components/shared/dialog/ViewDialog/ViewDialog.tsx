import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useMemo, useRef } from "react";
import type { FieldItem, ViewDialogProps } from "./ViewDialog.types";
import { Button } from "@/components/ui";

/**
 * Generic “view details” dialog.
 * - Renders a title and a list of fields in a 2- or 3-column grid.
 * - Supports colSpan for full-width fields like Address.
 * - Closes on outside click, ESC, and X button.
 */
export default function ViewDialog({
  isOpen,
  onClose,
  title,
  fields,
  footer,
  isLoading = false,
  gridColumns = 2,
  panelClassName,
}: ViewDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Avoid re-rendering the "fallback" fields array on every parent update.
  const safeFields = useMemo<FieldItem[]>(
    () => (Array.isArray(fields) ? fields : []),
    [fields],
  );

  const renderedFooter = footer ?? (
    <div className="flex justify-end">
      <Button type="button" variant="outlined" onClick={onClose}>
        Close
      </Button>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={closeBtnRef}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        {/* Centered dialog */}
        <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={clsx(
                "mx-auto flex max-h-[min(90vh,calc(100dvh-1.5rem))] w-full flex-col rounded-xl bg-white p-4 shadow-lg sm:p-5",
                panelClassName ?? "max-w-lg",
              )}
            >
              <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight text-gray-900 sm:text-base">
                  {title}
                </h3>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                {isLoading ? (
                  <div className="text-xs text-gray-500">Loading...</div>
                ) : (
                  <dl
                    className={clsx(
                      "grid gap-x-2 gap-y-2 text-xs sm:gap-x-3 sm:gap-y-2.5 sm:text-[13px]",
                      gridColumns === 3 ? "grid-cols-3" : "grid-cols-2",
                    )}
                  >
                    {safeFields.map((field, index) => (
                      <div
                        key={`${field.label}-${index}`}
                        className={clsx(
                          "min-w-0",
                          gridColumns === 3
                            ? field.colSpan === 3
                              ? "col-span-3"
                              : field.colSpan === 2
                                ? "col-span-2"
                                : ""
                            : field.colSpan === 2 || field.colSpan === 3
                              ? "col-span-2"
                              : "",
                        )}
                      >
                        <dt className="text-[11px] text-gray-500 sm:text-xs">{field.label}</dt>
                        <dd className="break-words font-medium leading-snug text-gray-900">
                          {field.value ?? "-"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {renderedFooter && (
                <div className="mt-4 shrink-0 border-t border-gray-200 pt-3 sm:mt-5 sm:pt-4">
                  {renderedFooter}
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
