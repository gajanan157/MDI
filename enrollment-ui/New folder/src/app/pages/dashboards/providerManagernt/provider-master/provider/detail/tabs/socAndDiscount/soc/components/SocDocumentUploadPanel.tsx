import { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/ui";
import { SOC_DOCUMENT_ACCEPT } from "../utils/socDocumentConfig";
import { formatFileSizeKb } from "../utils/socFileFormatUtils";

type SocDocumentUploadPanelProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  pendingFile: File | null;
  isSaving: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

export function SocDocumentUploadPanel({
  fileInputRef,
  pendingFile,
  isSaving,
  onFileSelect,
  onClear,
}: Readonly<SocDocumentUploadPanelProps>) {
  const { t } = useTranslation();
  const U = "providerMaster.soc.upload";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-2 py-1.5">
        <CloudArrowUpIcon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-slate-700">
            {t(`${U}.dropHint`)}
          </p>
          <p className="truncate text-[10px] text-slate-500">{t(`${U}.fileTypes`)}</p>
        </div>
        <label className="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-800 shadow-sm hover:bg-slate-50">
          {isSaving ? <Spinner className="size-3.5 border-2" /> : t(`${U}.chooseFile`)}
          <input
            ref={fileInputRef}
            type="file"
            accept={SOC_DOCUMENT_ACCEPT}
            className="hidden"
            disabled={isSaving}
            onChange={onFileSelect}
          />
        </label>
      </div>

      {pendingFile ? (
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1">
          <p
            className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-900"
            title={pendingFile.name}
          >
            {pendingFile.name}
          </p>
          <span className="shrink-0 text-[10px] text-slate-500">
            {formatFileSizeKb(pendingFile.size)}
          </span>
          <button
            type="button"
            className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t(`${U}.removeFile`)}
            disabled={isSaving}
            onClick={onClear}
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
