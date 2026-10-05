import type { Dispatch, SetStateAction } from "react";
import type { ICellRendererParams, IsFullWidthRowParams, RowHeightParams } from "ag-grid-community";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { formatProviderDateTimeDisplay } from "../../../../../../shared/dateFormat";
import { DocumentVersionDetailPanel } from "../components/DocumentVersionDetailPanel";

export interface DocumentSampleFile {
  url: string;
  downloadName: string;
  type: "image" | "pdf";
}

export interface DocumentVersionItem {
  id: string;
  fileName: string;
  startDate: string;
  validTill: string;
  url?: string;
  type?: "image" | "pdf";
  active?: boolean;
  registrationNo?: string;
  registrationAct?: string;
  description?: string;
}

export interface DocumentListItem {
  no: number;
  name: string;
  startDate: string;
  validTill: string;
  versions?: DocumentVersionItem[];
}

export interface DocumentGridRow {
  rowKey: string;
  no?: number;
  name: string;
  startDate: string;
  validTill: string;
  isVersion: boolean;
  documentNo: number;
  canExpand?: boolean;
  versionCount?: number;
  versionId?: string;
  url?: string;
  fileType?: "image" | "pdf";
  downloadName?: string;
  registrationNo?: string;
  registrationAct?: string;
  description?: string;
  active?: boolean;
}

export type DocumentPreview = {
  url: string;
  type: "image" | "pdf";
  downloadName: string;
};

export type DocumentColumnKey = "name" | "startDate" | "validTill";
export type DocumentColumnFilter = Partial<Record<DocumentColumnKey, string>>;
export type DocumentColumnPin = "left" | "right";

export type DocumentHeaderMenu = {
  field: DocumentColumnKey;
  x: number;
  y: number;
} | null;

export const DOCUMENT_COLUMN_OPTIONS: Array<{
  field: DocumentColumnKey;
  label: string;
}> = [
  { field: "name", label: "Document Name" },
  { field: "startDate", label: "Start Date" },
  { field: "validTill", label: "Valid Till" },
];

export function resolveDocumentVersions(
  doc: DocumentListItem,
  sampleFiles: Record<number, DocumentSampleFile>,
): DocumentVersionItem[] {
  if (doc.versions?.length) return doc.versions;
  const sample = sampleFiles[doc.no];
  if (!sample) return [];
  return [
    {
      id: `sample-${doc.no}`,
      fileName: sample.downloadName,
      startDate: doc.startDate,
      validTill: doc.validTill,
      url: sample.url,
      type: sample.type,
      active: true,
    },
  ];
}

export function buildDocumentDisplayRows(
  list: DocumentListItem[],
  sampleFiles: Record<number, DocumentSampleFile>,
  expandedDocumentNos: ReadonlySet<number>,
): DocumentGridRow[] {
  const rows: DocumentGridRow[] = [];

  for (const doc of list) {
    const versions = resolveDocumentVersions(doc, sampleFiles);

    rows.push({
      rowKey: String(doc.no),
      no: doc.no,
      name: doc.name,
      startDate: doc.startDate,
      validTill: doc.validTill,
      isVersion: false,
      documentNo: doc.no,
      canExpand: versions.length > 1,
      versionCount: versions.length,
    });

    if (!expandedDocumentNos.has(doc.no)) continue;

    for (const version of versions) {
      rows.push({
        rowKey: `${doc.no}-${version.id}`,
        name: version.fileName,
        startDate: version.startDate,
        validTill: version.validTill,
        isVersion: true,
        documentNo: doc.no,
        versionId: version.id,
        url: version.url,
        fileType: version.type,
        downloadName: version.fileName,
        registrationNo: version.registrationNo,
        registrationAct: version.registrationAct,
        description: version.description,
        active: version.active,
      });
    }
  }

  return rows;
}

export function rowMatchesDocumentColumnFilters(
  row: DocumentGridRow,
  filters: DocumentColumnFilter,
) {
  if (row.isVersion) return true;
  return DOCUMENT_COLUMN_OPTIONS.every(({ field }) => {
    const search = String(filters[field] ?? "")
      .trim()
      .toLowerCase();
    if (!search) return true;
    const value =
      field === "name"
        ? `${row.no ?? ""}. ${row.name}`
        : String(row[field] ?? "");
    return value.toLowerCase().includes(search);
  });
}

export function toggleDocumentMasterColumn(
  field: DocumentColumnKey,
  setVisibleDocumentColumns: Dispatch<SetStateAction<DocumentColumnKey[]>>,
) {
  setVisibleDocumentColumns((current) => {
    if (current.includes(field)) {
      return current.length === 1
        ? current
        : current.filter((column) => column !== field);
    }
    return DOCUMENT_COLUMN_OPTIONS.map((column) => column.field).filter(
      (column) => column === field || current.includes(column),
    );
  });
}

export function updateDocumentMasterColumnFilter(
  field: DocumentColumnKey,
  value: string,
  setColumnFilters: Dispatch<SetStateAction<DocumentColumnFilter>>,
) {
  setColumnFilters((current) => ({ ...current, [field]: value }));
}

export function pinDocumentMasterColumn(
  field: DocumentColumnKey,
  pin: DocumentColumnPin | "none",
  setPinnedDocumentColumns: Dispatch<
    SetStateAction<Partial<Record<DocumentColumnKey, DocumentColumnPin>>>
  >,
  setHeaderMenu: Dispatch<SetStateAction<DocumentHeaderMenu>>,
) {
  setPinnedDocumentColumns((current) => {
    const next = { ...current };
    if (pin === "none") delete next[field];
    else next[field] = pin;
    return next;
  });
  setHeaderMenu(null);
}

export function openDocumentHeaderMenu(
  field: DocumentColumnKey,
  event: React.MouseEvent<HTMLButtonElement>,
  setHeaderMenu: Dispatch<SetStateAction<DocumentHeaderMenu>>,
) {
  event.stopPropagation();
  const rect = event.currentTarget.getBoundingClientRect();
  setHeaderMenu({ field, x: Math.max(8, rect.right - 208), y: rect.bottom + 4 });
}

export function createDocumentHeaderRenderer(
  field: DocumentColumnKey,
  label: string,
  onOpenHeaderMenu: (
    field: DocumentColumnKey,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void,
) {
  return () => (
    <div className="flex h-full w-full min-w-0 items-center gap-1">
      <span className="min-w-0 truncate text-xs">{label}</span>
      <button
        type="button"
        onClick={(event) => onOpenHeaderMenu(field, event)}
        className="ml-auto rounded px-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        title="Column menu"
        aria-label={`${label} column menu`}
      >
        ⋮
      </button>
    </div>
  );
}

function formatDocumentDate(value?: string) {
  if (!value || value === "-") return "-";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split("/");
    return formatProviderDateTimeDisplay(`${yyyy}-${mm}-${dd}`);
  }
  return formatProviderDateTimeDisplay(value);
}

export type DocumentGridContext = {
  canWrite: boolean;
  resolvePreview: (row: DocumentGridRow) => DocumentPreview | null;
  onView: (row: DocumentGridRow, preview: DocumentPreview | null) => void;
};

export function documentVersionFullWidthCell(
  params: ICellRendererParams<DocumentGridRow, unknown, DocumentGridContext>,
) {
  if (params.pinned != null) return null;

  const row = params.data;
  const ctx = params.context;
  if (!row?.isVersion || !ctx) return null;

  const preview = ctx.resolvePreview(row);

  return (
    <DocumentVersionDetailPanel
      fileName={row.name}
      registrationNo={row.registrationNo}
      registrationAct={row.registrationAct}
      description={row.description}
      startDate={row.startDate}
      validTill={row.validTill}
      active={row.active}
      canWrite={ctx.canWrite}
      preview={preview}
      onView={() => ctx.onView(row, preview)}
    />
  );
}

export function isDocumentVersionFullWidthRow(params: IsFullWidthRowParams<DocumentGridRow>) {
  return Boolean(params.rowNode.data?.isVersion);
}

export function getDocumentGridRowHeight(params: RowHeightParams<DocumentGridRow>) {
  if (!params.data?.isVersion) return 28;

  const hasDescription = Boolean(params.data.description?.trim());
  return hasDescription ? 124 : 96;
}

export function getDocumentMasterColumns({
  canWrite,
  resolvePreview,
  onView,
  expandedDocumentNos,
  onToggleExpand,
  pinnedDocumentColumns,
  createHeaderRenderer,
}: Readonly<{
  canWrite: boolean;
  resolvePreview: (row: DocumentGridRow) => DocumentPreview | null;
  onView: (row: DocumentGridRow, preview: DocumentPreview | null) => void;
  expandedDocumentNos: ReadonlySet<number>;
  onToggleExpand: (documentNo: number) => void;
  pinnedDocumentColumns: Partial<Record<DocumentColumnKey, DocumentColumnPin>>;
  createHeaderRenderer: (
    field: DocumentColumnKey,
    label: string,
  ) => () => React.JSX.Element;
}>) {
  return [
    {
      field: "expand",
      headerName: "",
      width: 36,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: DocumentGridRow }) => {
        const row = params.data;
        if (!row || row.isVersion) return null;
        if (!row.canExpand) return <span className="inline-block w-4" aria-hidden />;
        const expanded = expandedDocumentNos.has(row.documentNo);
        return (
          <button
            type="button"
            className="flex h-full w-full items-center justify-center rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title={expanded ? "Collapse versions" : "Expand versions"}
            aria-expanded={expanded}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand(row.documentNo);
            }}
          >
            {expanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 104,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: DocumentGridRow }) => {
        const row = params.data;
        if (!row || row.isVersion) return null;
        const hasMultipleVersions = (row.versionCount ?? 0) > 1;
        if (hasMultipleVersions) return null;

        const preview = resolvePreview(row);
        const hasFile = Boolean(preview?.url);
        return (
          <div className="flex h-full items-center justify-center gap-2 text-xs">
            <button
              type="button"
              className="cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              title="View"
              onClick={(e) => {
                e.stopPropagation();
                onView(row, preview);
              }}
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </button>
            {hasFile && preview ? (
              <a
                href={preview.url}
                download={preview.downloadName}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-primary-600 rounded p-1.5 ${
                  canWrite
                    ? "hover:bg-primary-50 cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                }`}
                title="Download"
                aria-disabled={!canWrite}
                tabIndex={canWrite ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canWrite) e.preventDefault();
                }}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center text-gray-300">
                <ArrowDownTrayIcon className="h-4 w-4" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      field: "no",
      headerName: "No",
      width: 70,
      sortable: true,
      valueGetter: (params: { data?: DocumentGridRow }) =>
        params.data?.isVersion ? "" : params.data?.no ?? "",
    },
    {
      field: "name",
      headerName: "Document Name",
      headerComponent: createHeaderRenderer("name", "Document Name"),
      pinned: pinnedDocumentColumns.name,
      flex: 1.2,
      minWidth: 220,
      sortable: true,
      filter: true,
      cellRenderer: (params: { data?: DocumentGridRow }) => {
        const row = params.data;
        if (!row) return null;
        if (row.isVersion) return null;
        return (
          <span className="block truncate font-medium text-gray-900" title={row.name}>
            {row.no}. {row.name}
            {row.versionCount != null && row.versionCount > 1 ? (
              <span className="ml-1 font-normal text-gray-500">({row.versionCount})</span>
            ) : null}
          </span>
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      headerComponent: createHeaderRenderer("startDate", "Start Date"),
      pinned: pinnedDocumentColumns.startDate,
      flex: 0.8,
      minWidth: 120,
      sortable: true,
      filter: true,
      valueGetter: (params: { data?: DocumentGridRow }) => params.data?.startDate ?? "-",
      valueFormatter: (params: { value?: string; data?: DocumentGridRow }) => {
        if (params.data?.isVersion) return "";
        return formatDocumentDate(params.value);
      },
    },
    {
      field: "validTill",
      headerName: "Valid Till",
      headerComponent: createHeaderRenderer("validTill", "Valid Till"),
      pinned: pinnedDocumentColumns.validTill,
      flex: 0.8,
      minWidth: 120,
      sortable: true,
      filter: true,
      valueGetter: (params: { data?: DocumentGridRow }) => params.data?.validTill ?? "-",
      valueFormatter: (params: { value?: string; data?: DocumentGridRow }) => {
        if (params.data?.isVersion) return "";
        return formatDocumentDate(params.value);
      },
    },
  ];
}
