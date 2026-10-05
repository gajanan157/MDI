import { useEffect, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui";
import { ConfigFormField } from "./ConfigFormField";
import type { FieldConfig } from "./fieldTypes";
import type { ConfigFormDialogMaxColumns } from "./fieldTypes";
import { getGridClass } from "./gridUtils";

export type ConfigFormDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional icon shown to the left of the title. */
  titleIcon?: ReactNode;
  /** Optional line under the title (e.g. address). */
  subtitle?: ReactNode;
  titleClassName?: string;
  titleId?: string;
  fields: FieldConfig[];
  form: UseFormReturn<Record<string, unknown>>;
  onSubmit: () => void;
  /** Disables actions and fields (e.g. uploading). */
  loading?: boolean;
  /** Disables submit when false (e.g. validation). */
  canSubmit?: boolean;
  /** Optional error banner above the form grid. */
  error?: string | null;
  /** Max columns in the responsive grid (1–4). @default 2 */
  maxColumns?: ConfigFormDialogMaxColumns;
  submitLabel?: string;
  /** Label on primary button while `loading` is true. @default `${submitLabel}…` */
  loadingSubmitLabel?: string;
  cancelLabel?: string;
  /** Modal width: matches enrollment modal pattern. @default 75% with max-w-6xl */
  widthClassName?: string;
  /** Refs for file inputs keyed by field `name`. */
  fileRefs?: Record<string, RefObject<HTMLInputElement | null>>;
  onFileChange?: (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearError?: () => void;
  /** Extra content after error banner, above the field grid (e.g. inward number). */
  topContent?: ReactNode;
  /** Extra content below fields, above footer (e.g. hints). */
  children?: ReactNode;
  /** Replace default footer (Cancel / Submit). */
  footer?: ReactNode;
  /** When true, no footer is rendered (header close still works). */
  hideFooter?: boolean;
  /** Primary button color */
  submitButtonClassName?: string;
  /** @default "neutral" */
  submitButtonColor?: import("@/constants/app").ColorType;
  /** Stacking above drawers/modals. @default "z-[200]" (alerts use z-[300]) */
  overlayZIndexClassName?: string;
  /** Scroll/background classes for the dialog body. @default "overflow-y-auto" */
  bodyClassName?: string;
  /** Padding/spacing around fields and children. */
  contentClassName?: string;
};

export function ConfigFormDialog({
  open,
  onClose,
  title,
  titleIcon,
  subtitle,
  titleClassName = "text-lg font-semibold text-gray-900",
  titleId = "config-form-dialog-title",
  fields,
  form,
  onSubmit,
  loading = false,
  canSubmit = true,
  error,
  maxColumns = 2,
  submitLabel = "Submit",
  loadingSubmitLabel,
  cancelLabel = "Cancel",
  widthClassName = "w-full max-w-6xl sm:w-[75%]",
  fileRefs,
  onFileChange,
  onClearError,
  topContent,
  children,
  footer,
  hideFooter = false,
  submitButtonClassName = "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600",
  submitButtonColor = "neutral",
  overlayZIndexClassName = "z-[200]",
  bodyClassName = "overflow-y-auto",
  contentClassName = "space-y-1 px-4 py-2 sm:px-6 sm:py-2",
}: ConfigFormDialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  /** Subscribe to form updates so conditional fields (`showWhen` / `disabledWhen`) re-render. */
  form.watch();

  const gridClass = getGridClass(maxColumns);

  const dialogFooter =
    footer ??
    (!hideFooter ? (
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outlined" disabled={loading} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="filled"
            color={submitButtonColor}
            className={submitButtonClassName}
            disabled={!canSubmit || loading}
            onClick={onSubmit}
          >
            {loading ? (loadingSubmitLabel ?? `${submitLabel}…`) : submitLabel}
          </Button>
        </div>
      </div>
    ) : null);

  const content = (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/40 p-4 ${overlayZIndexClassName}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <div
        className={`relative flex max-h-[90vh] ${widthClassName} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-4 py-2">
          <div className="flex min-w-0 items-start gap-2 pr-3">
            {titleIcon ? <div className="mt-0.5 shrink-0">{titleIcon}</div> : null}
            <div className="min-w-0">
              <h2 id={titleId} className={titleClassName}>
                {title}
              </h2>
              {subtitle ? (
                <div className="mt-0.5 min-w-0 text-xs font-normal leading-4 text-gray-500">
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="cursor-pointer text-xl text-gray-500 hover:text-red-500 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={`min-h-0 flex-1 bg-gray-50 ${bodyClassName}`}>
          <div className={contentClassName}>
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {topContent}

            <div className={gridClass}>
              {fields.map((field) => (
                <ConfigFormField
                  key={field.name}
                  field={field}
                  form={form}
                  disabled={Boolean(loading)}
                  maxColumns={maxColumns}
                  fileRefs={fileRefs}
                  onFileChange={onFileChange}
                  onClearError={onClearError}
                />
              ))}
            </div>

            {children}
          </div>
        </div>

        {dialogFooter}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
