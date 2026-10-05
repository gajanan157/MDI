import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { formatToDDMMMYYYY } from "../../../../../../shared/dateFormat";
import type { DocumentPreview } from "../utils/documentMasterGrid";

type DocumentVersionDetailPanelProps = {
  fileName: string;
  registrationNo?: string;
  registrationAct?: string;
  description?: string;
  startDate: string;
  validTill: string;
  active?: boolean;
  canWrite: boolean;
  preview: DocumentPreview | null;
  onView: () => void;
};

const META_FIELDS = [
  { key: "registrationNo", label: "Reg No" },
  { key: "registrationAct", label: "Reg Act" },
  { key: "startDate", label: "Start" },
  { key: "validTill", label: "Valid Till" },
] as const;

function formatDocumentDate(value?: string) {
  if (!value || value === "-") return "—";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split("/");
    return formatToDDMMMYYYY(`${yyyy}-${mm}-${dd}`);
  }
  return formatToDDMMMYYYY(value);
}

function MetaCell({ label, value }: Readonly<{ label: string; value: string }>) {
  const text = value.trim() || "—";
  return (
    <div className="min-w-0 bg-white px-2.5 py-1.5">
      <dt className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className="mt-0.5 whitespace-nowrap text-[10px] font-semibold tabular-nums text-slate-900"
        title={text}
      >
        {text}
      </dd>
    </div>
  );
}

function VersionActions({
  canWrite,
  hasFile,
  preview,
  onView,
}: Readonly<{
  canWrite: boolean;
  hasFile: boolean;
  preview: DocumentPreview | null;
  onView: () => void;
}>) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        className="cursor-pointer rounded-md border border-blue-200/90 bg-blue-50 p-1 text-blue-600 transition-colors hover:bg-blue-100"
        title="View"
        onClick={onView}
      >
        <EyeIcon className="h-3.5 w-3.5" />
      </button>
      {hasFile && preview ? (
        <a
          href={preview.url}
          download={preview.downloadName}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-primary-600 rounded-md border border-primary-200/90 bg-primary-50/60 p-1 transition-colors ${
            canWrite ? "hover:bg-primary-100 cursor-pointer" : "cursor-not-allowed opacity-60"
          }`}
          title="Download"
          aria-disabled={!canWrite}
          tabIndex={canWrite ? 0 : -1}
          onClick={(event) => {
            if (!canWrite) event.preventDefault();
          }}
        >
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-100 bg-slate-50 text-slate-300">
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}

export function DocumentVersionDetailPanel({
  fileName,
  registrationNo = "",
  registrationAct = "",
  description = "",
  startDate,
  validTill,
  active,
  canWrite,
  preview,
  onView,
}: Readonly<DocumentVersionDetailPanelProps>) {
  const hasFile = Boolean(preview?.url);
  const statusLabel = active === false ? "Archived" : "Active";
  const statusClass =
    active === false
      ? "bg-slate-100 text-slate-700 ring-slate-300/70"
      : "bg-emerald-100 text-emerald-800 ring-emerald-300/70";

  const metaValues: Record<(typeof META_FIELDS)[number]["key"], string> = {
    registrationNo,
    registrationAct,
    startDate: formatDocumentDate(startDate),
    validTill: formatDocumentDate(validTill),
  };

  const descriptionText = description.trim();

  return (
    <div className="document-version-detail box-border h-full w-full px-2 py-1.5">
      <div className="border-l-primary-600 flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-l-[4px] border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-primary-100/80 bg-gradient-to-r from-primary-50/90 via-blue-50/40 to-white px-2.5 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-700 ring-1 ring-primary-200/60">
              <DocumentTextIcon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span
              className="min-w-0 truncate text-[11px] font-semibold text-slate-900"
              title={fileName}
            >
              {fileName}
            </span>
            <span
              className={`inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
          <VersionActions
            canWrite={canWrite}
            hasFile={hasFile}
            preview={preview}
            onView={onView}
          />
        </div>

        <div className="grid shrink-0 grid-cols-4 gap-px bg-slate-200/50">
          {META_FIELDS.map(({ key, label }) => (
            <MetaCell key={key} label={label} value={metaValues[key]} />
          ))}
        </div>

        {descriptionText ? (
          <div className="flex min-h-0 flex-1 items-start gap-1.5 border-t border-primary-100/70 bg-gradient-to-r from-primary-50/50 to-blue-50/30 px-2.5 py-1.5">
            <InformationCircleIcon
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600"
              aria-hidden
            />
            <p className="min-w-0 text-[10px] leading-snug text-primary-900">{descriptionText}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
