import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import {
  createPresignedDownloadLinkCellRenderer,
  presignedDownloadLinkCellRenderer,
} from "./providerAgGrid";
import {
  AgGridSuperWrapper,
  Button,
  CommonSearch,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  type SearchField,
} from "./providerShell";
import { ConfigFormDialog } from "@/components/shared/dialog/commonDialog";
import Pagination from "@/components/shared/Pagination";
import {
  parsePresignListResponse,
  getPresignDownloadList,
  type PresignDownloadRequest,
} from "@/services/presignFilesApi";
import { showErrorMessage } from "@/utils/errorHandler";
import type { TFunction } from "i18next";
import { formatProviderDateTimeDisplay } from "./dateFormat";

type PresignGridRow = {
  id: string;
  inwardNumber: string;
  fileName: string;
  userId: string;
  createdDate: string;
  presignedUrl?: string;
};

function formatActivityLogDate(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === "") return "—";
  return formatProviderDateTimeDisplay(String(iso));
}

function mapPresignItem(
  raw: Record<string, unknown>,
  index: number,
): PresignGridRow {
  const inward = String(raw.inwardNo ?? raw.inwardNumber ?? "").trim();
  const fileName = String(
    raw.originalFileName ?? raw.fileName ?? raw.name ?? "",
  ).trim();
  const created =
    raw.createdAt ?? raw.createdDate ?? raw.uploadedAt ?? raw.timestamp;
  const user = String(
    raw.uploadedBy ?? raw.userId ?? raw.userName ?? "",
  ).trim();
  const presignedUrl = String(
    raw.presignedUrl ?? raw.url ?? raw.downloadUrl ?? "",
  ).trim();
  const id = String(raw.id ?? raw.fileMetadataId ?? `presign-${index}`);
  return {
    id,
    inwardNumber: inward || "—",
    fileName: fileName || "—",
    userId: user || "—",
    createdDate: formatActivityLogDate(created as string | undefined),
    presignedUrl: presignedUrl || undefined,
  };
}

const createFileActivityLogColumns = (t: TFunction) => [
  {
    field: "inwardNumber",
    headerName: t("providerMaster.rohiniMaster.versionLogColumns.inwardNumber"),
    flex: 0.9,
    minWidth: 140,
    sortable: false,
  },
  {
    field: "fileName",
    headerName: t("providerMaster.rohiniMaster.versionLogColumns.fileName"),
    flex: 1.2,
    minWidth: 200,
    sortable: false,
  },
  {
    field: "userId",
    headerName: t("providerMaster.rohiniMaster.versionLogColumns.userName"),
    flex: 1,
    minWidth: 140,
    sortable: false,
  },
  {
    field: "createdDate",
    headerName: t("providerMaster.rohiniMaster.versionLogColumns.createdDate"),
    flex: 0.9,
    minWidth: 140,
    sortable: false,
  },
  {
    field: "presignedUrl",
    headerName: t("providerMaster.common.download"),
    flex: 0.5,
    minWidth: 100,
    sortable: false,
    cellRenderer: createPresignedDownloadLinkCellRenderer(t),
  },
];

export type FileActivityLogDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** S3 bucket to list files from. */
  s3BucketName?: string;
  /** S3 sub-bucket/folder to list files from — feature-specific (e.g. Rohini uploads). */
  s3SubBucketName: string;
  /** When false, the bottom Close bar is hidden (title ✕ still closes). @default true */
  showFooter?: boolean;
  /** Controls Download action visibility/availability in the file grid. */
  canDownload?: boolean;
};

/**
 * Generic file/version-download-history dialog: lists files uploaded under a given
 * S3 bucket/sub-bucket (with inward number + filename search) and lets the user
 * download each via a presigned URL. Not a field-change audit trail — for that, see
 * `AuditLogDialog`.
 */
export default function FileActivityLogDialog({
  open,
  onClose,
  title,
  s3BucketName = "provider",
  s3SubBucketName,
  showFooter = false,
  canDownload = true,
}: Readonly<FileActivityLogDialogProps>) {
  const { t } = useTranslation();
  const noopForm = useForm<Record<string, unknown>>({ defaultValues: {} });

  const [inwardNo, setInwardNo] = useState("");
  const [originalFileName, setOriginalFileName] = useState("");
  const [presignFromDate, setPresignFromDate] = useState("");
  const [presignToDate, setPresignToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PROVIDER_GRID_DEFAULT_PAGE_SIZE);
  /** Keeps latest page size for fetch when Pagination calls onPageChange(1) in the same tick as onPageSizeChange (state would still be stale). */
  const pageSizeRef = useRef(pageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [presignRows, setPresignRows] = useState<PresignGridRow[]>([]);
  const [presignLoading, setPresignLoading] = useState(false);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  type PresignFilters = {
    inwardNo: string;
    originalFileName: string;
    fromDate: string;
    toDate: string;
  };

  const loadPresignPage = useCallback(
    async (
      page1Based: number,
      sizeOverride?: number,
      filters?: PresignFilters,
    ) => {
      const size = sizeOverride ?? pageSizeRef.current;
      const f: PresignFilters = filters ?? {
        inwardNo,
        originalFileName,
        fromDate: presignFromDate,
        toDate: presignToDate,
      };
      setPresignLoading(true);
      try {
        const body: PresignDownloadRequest = {
          s3BucketName,
          s3SubBucketName,
          page: Math.max(0, page1Based - 1),
          size,
        };
        const inw = f.inwardNo.trim();
        const fn = f.originalFileName.trim();
        if (inw) body.inwardNo = inw;
        if (fn) body.originalFileName = fn;
        if (f.fromDate.trim()) body.fromDate = f.fromDate.trim();
        if (f.toDate.trim()) body.toDate = f.toDate.trim();

        const res = await getPresignDownloadList(body);
        if (!res.success || res.data == null) {
          showErrorMessage({
            error: res.error ?? t("providerMaster.rohiniMaster.loadVersionLogFailed"),
            status: res.status,
          });
          setPresignRows([]);
          setTotalItems(0);
          return;
        }
        const parsed = parsePresignListResponse(res.data);
        const rows = parsed.items.map((item, i) => mapPresignItem(item, i));
        setPresignRows(rows);
        // Some APIs return totalRecords = current page length on page 2+; lower bound fixes pager (e.g. 51–67 of 67).
        const lowerBound = (page1Based - 1) * size + rows.length;
        setTotalItems(Math.max(parsed.totalElements, lowerBound));
        setPage(page1Based);
      } catch (e: unknown) {
        showErrorMessage({
          error:
            e instanceof Error
              ? e.message
              : t("providerMaster.rohiniMaster.loadVersionLogFailed"),
        });
        setPresignRows([]);
        setTotalItems(0);
      } finally {
        setPresignLoading(false);
      }
    },
    [inwardNo, originalFileName, presignFromDate, presignToDate, s3BucketName, s3SubBucketName, t],
  );

  useEffect(() => {
    if (!open) {
      setInwardNo("");
      setOriginalFileName("");
      setPresignFromDate("");
      setPresignToDate("");
      setPage(1);
      setPresignRows([]);
      setTotalItems(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    loadPresignPage(1);
    // Initial load when opening only (not when filter state changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const searchFields = useMemo<SearchField[]>(
    () => [
      {
        name: "inwardNo",
        label: t("providerMaster.rohiniMaster.versionLogSearch.inwardNumber"),
        type: "text",
      },
      {
        name: "originalFileName",
        label: t("providerMaster.rohiniMaster.versionLogSearch.fileName"),
        type: "text",
      },
      {
        name: "fromDate",
        label: t("providerMaster.rohiniMaster.versionLogSearch.fromDate"),
        type: "date",
      },
      {
        name: "toDate",
        label: t("providerMaster.rohiniMaster.versionLogSearch.toDate"),
        type: "date",
      },
    ],
    [t],
  );

  const handlePageChange = useCallback(
    (p: number) => {
      loadPresignPage(p);
    },
    [loadPresignPage],
  );

  const handlePageSizeChange = useCallback((s: number) => {
    pageSizeRef.current = s;
    setPageSize(s);
    setPage(1);
  }, []);

  const handleSearch = useCallback(
    (data: Record<string, unknown>) => {
      const inward = String(data.inwardNo ?? "").trim();
      const file = String(data.originalFileName ?? "").trim();
      const from = String(data.fromDate ?? "").trim();
      const to = String(data.toDate ?? "").trim();
      setInwardNo(inward);
      setOriginalFileName(file);
      setPresignFromDate(from);
      setPresignToDate(to);
      loadPresignPage(1, undefined, {
        inwardNo: inward,
        originalFileName: file,
        fromDate: from,
        toDate: to,
      });
    },
    [loadPresignPage],
  );

  const columns = useMemo(
    () =>
      createFileActivityLogColumns(t).map((col) => {
        if ((col as { field?: string }).field !== "presignedUrl") return col;
        return {
          ...col,
          cellRenderer: (params: { data?: { presignedUrl?: string } }) => {
            const url = params?.data?.presignedUrl;
            if (!url) return "—";
            if (!canDownload) {
              return (
                <span
                  className="inline-flex cursor-not-allowed items-center gap-1 text-gray-400"
                  title={t("providerMaster.errors.noWritePermission")}
                  aria-disabled="true"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 shrink-0" aria-hidden />
                  {t("providerMaster.common.download")}
                </span>
              );
            }
            return presignedDownloadLinkCellRenderer(params, t);
          },
        };
      }),
    [canDownload, t],
  );

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      title={title}
      titleId="file-activity-log-dialog-title"
      fields={[]}
      form={noopForm}
      onSubmit={() => {}}
      maxColumns={1}
      widthClassName="w-full max-w-5xl min-h-[80vh] sm:w-[96%]"
      hideFooter={!showFooter}
      footer={
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2 dark:border-dark-500 dark:bg-dark-700">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" onClick={onClose}>
              {t("providerMaster.rohiniMaster.close")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-1 pb-1">
        <CommonSearch
          key={open ? "file-activity-log-search" : "file-activity-log-closed"}
          fields={searchFields}
          onSearch={handleSearch}
          isSubmitting={presignLoading}
          showToggleButton={false}
          isOpen={true}
          disableDatePortal
        />
        <div
          className={`flex min-h-0 flex-1 flex-col gap-0 ${
            presignLoading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <div className="min-h-[300px] flex-1">
            <AgGridSuperWrapper
              rowData={presignRows}
              columnDefs={columns}
              pagination={false}
              height={300}
              domLayout="normal"
            />
          </div>
          <Pagination
            className="shrink-0"
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
          />
        </div>
      </div>
    </ConfigFormDialog>
  );
}
