import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ConfigFormDialog } from "@/components/shared/dialog/commonDialog";
import {
  AgGridSuperWrapper,
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "./providerShell";

export type AuditLogDialogProps<Row> = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  /** ag-grid column definitions — caller-defined, since field names/labels differ per domain. */
  columnDefs: unknown[];
  rows: Row[];
  loading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  widthClassName?: string;
  gridHeight?: number;
  pagination?: boolean;
  footer?: ReactNode;
  /** @default true — most audit logs are a read-only viewer with no footer. */
  hideFooter?: boolean;
  overlayZIndexClassName?: string;
  /** Outer content wrapper sizing/layout — override for a more compact dialog. */
  contentClassName?: string;
  /** Grid wrapper sizing — override for a more compact dialog. */
  gridWrapperClassName?: string;
};

/**
 * Generic read-only "field change history" audit-log dialog: a title, an optional
 * error banner, and an ag-grid table (with a loading placeholder while `loading`).
 * Each caller owns its own data fetching, row shape, and column definitions — this
 * component only owns the dialog shell + grid wiring shared by every audit log.
 *
 * For a file/version download history (not a field-change trail), see
 * `FileActivityLogDialog` instead.
 */
export function AuditLogDialog<Row>({
  open,
  onClose,
  title,
  titleId = "audit-log-dialog-title",
  columnDefs,
  rows,
  loading = false,
  loadingMessage = "Loading…",
  error,
  widthClassName = "w-full max-w-6xl min-h-[70vh] sm:w-[96%]",
  gridHeight = 360,
  pagination = true,
  footer,
  hideFooter = true,
  overlayZIndexClassName,
  contentClassName = "flex min-h-[420px] flex-col gap-2 pb-1",
  gridWrapperClassName = "min-h-[360px] flex-1",
}: Readonly<AuditLogDialogProps<Row>>) {
  const noopForm = useForm<Record<string, unknown>>({ defaultValues: {} });

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      title={title}
      titleId={titleId}
      fields={[]}
      form={noopForm}
      onSubmit={() => {}}
      maxColumns={1}
      widthClassName={widthClassName}
      hideFooter={hideFooter}
      footer={footer}
      {...(overlayZIndexClassName ? { overlayZIndexClassName } : {})}
    >
      <div className={contentClassName}>
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
        <div className={gridWrapperClassName}>
          {loading ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">{loadingMessage}</p>
          ) : (
            <AgGridSuperWrapper
              rowData={rows}
              columnDefs={columnDefs}
              height={gridHeight}
              pagination={pagination}
              pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
              pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
            />
          )}
        </div>
      </div>
    </ConfigFormDialog>
  );
}
