import { useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowPathIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { BANK_DOCUMENT_UPLOAD_ACCEPT } from "../utils/bankDetailsConfig";
import type { BankDocumentPreview } from "../utils/bankDetailsHelpers";
import { BankDocumentPreviewPanel } from "./BankDocumentPreviewPanel";

const B = "providerMaster.detailTabs.bank.documents";

function renderBankDocumentSlotContent(
  isLoading: boolean,
  isUploading: boolean,
  preview: BankDocumentPreview | null,
  isEditMode: boolean,
  title: string,
  loadingLabel: string,
  uploadingLabel: string,
  noDocumentLabel: string,
  replaceHintLabel: string,
  dropFileLabel: string,
  browseLabel: string,
  uploadHintLabel: string,
): ReactNode {
  if (isLoading || isUploading) {
    return (
      <p className="text-center text-[11px] text-slate-600">
        {isUploading ? uploadingLabel : loadingLabel}
      </p>
    );
  }

  if (preview?.fileMetadataId && !preview.url) {
    return (
      <p className="text-center text-[11px] text-slate-600">{loadingLabel}</p>
    );
  }

  if (preview) {
    return (
      <div
        className={clsx(
          "flex h-full min-h-0 w-full flex-col items-stretch justify-start overflow-hidden",
          isEditMode && "flex-1",
        )}
      >
        <BankDocumentPreviewPanel
          preview={preview}
          alt={title}
          fillSlot
          allowReplaceClick={isEditMode}
        />
        {isEditMode ? (
          <p className="mt-0.5 shrink-0 text-center text-[10px] text-slate-500">
            {replaceHintLabel}
          </p>
        ) : null}
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="flex flex-col items-center gap-1 px-2 text-center">
        <CloudArrowUpIcon className="h-5 w-5 text-slate-500" aria-hidden />
        <p className="text-[11px] font-medium text-slate-700">
          {dropFileLabel}{" "}
          <span className="text-primary-600">{browseLabel}</span>
        </p>
        <p className="text-[10px] text-slate-500">{uploadHintLabel}</p>
      </div>
    );
  }

  return <p className="text-center text-[11px] text-slate-600">{noDocumentLabel}</p>;
}

type BankDocumentSlotProps = {
  title: string;
  uploadLabel: string;
  preview: BankDocumentPreview | null;
  isLoading: boolean;
  isUploading?: boolean;
  /** Bank details are being re-fetched after an upload; shown as a small overlay so the preview stays visible. */
  isRefreshing?: boolean;
  isEditMode: boolean;
  isRequired?: boolean;
  onUpload: (file: File | undefined) => void;
};

function BankDocumentSlot({
  title,
  uploadLabel,
  preview,
  isLoading,
  isUploading = false,
  isRefreshing = false,
  isEditMode,
  isRequired = false,
  onUpload,
}: Readonly<BankDocumentSlotProps>) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const slotHeightClass = isEditMode
    ? "flex min-h-[160px] flex-1 flex-col"
    : "flex h-[220px] flex-col";

  const applyFile = (file: File | undefined) => {
    if (isUploading) return;
    onUpload(file);
  };

  const openFilePicker = () => {
    if (isEditMode && !isUploading) inputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode || isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode || isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    applyFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        className={clsx(
          "relative flex flex-col rounded-lg border-2 border-dashed bg-slate-100/55",
          slotHeightClass,
          isEditMode && !isUploading && "cursor-pointer transition-colors hover:bg-slate-50/90",
          isDragging ? "border-primary-500 bg-primary-50/50" : "border-slate-300/90",
        )}
        onClick={openFilePicker}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (!isEditMode) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        role={isEditMode ? "button" : undefined}
        tabIndex={isEditMode ? 0 : undefined}
        aria-label={isEditMode ? uploadLabel : undefined}
      >
        {isRefreshing ? (
          <ArrowPathIcon
            className="absolute right-1.5 top-1.5 h-3.5 w-3.5 animate-spin text-primary-600"
            aria-hidden
          />
        ) : null}
        <p className="shrink-0 px-2 pt-0.5 text-[11px] font-medium leading-tight text-slate-700">
          {title}
          {isRequired && isEditMode ? <span className="text-error"> *</span> : null}
        </p>
        <div className="flex min-h-0 flex-1 flex-col items-stretch justify-center overflow-hidden px-1 pb-0.5 pt-0">
          {renderBankDocumentSlotContent(
            isLoading,
            isUploading,
            preview,
            isEditMode,
            title,
            t(`${B}.loadingDocument`),
            t(`${B}.uploadingDocument`),
            t(`${B}.noDocumentUploaded`),
            t(`${B}.clickOrDropToReplace`),
            t(`${B}.dropFileHere`),
            t(`${B}.browse`),
            t(`${B}.uploadHint`),
          )}
        </div>
        {isEditMode ? (
          <input
            ref={inputRef}
            type="file"
            accept={BANK_DOCUMENT_UPLOAD_ACCEPT}
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              applyFile(event.target.files?.[0]);
              event.target.value = "";
            }}
            onClick={(event) => event.stopPropagation()}
          />
        ) : null}
      </div>
    </div>
  );
}

type BankDocumentsPanelProps = {
  isBankViewMode: boolean;
  isLoadingApiData: boolean;
  hasApiFields: boolean;
  cancelledChequePreview: BankDocumentPreview | null;
  panCardPreview: BankDocumentPreview | null;
  isUploadingCancelledCheque?: boolean;
  isUploadingPanCard?: boolean;
  isRefreshingDocuments?: boolean;
  onUploadCancelledCheque: (file: File | undefined) => void;
  onUploadPanCard: (file: File | undefined) => void;
};

export function BankDocumentsPanel({
  isBankViewMode,
  isLoadingApiData,
  hasApiFields,
  cancelledChequePreview,
  panCardPreview,
  isUploadingCancelledCheque = false,
  isUploadingPanCard = false,
  isRefreshingDocuments = false,
  onUploadCancelledCheque,
  onUploadPanCard,
}: Readonly<BankDocumentsPanelProps>) {
  const { t } = useTranslation();
  const isLoadingDocuments = isLoadingApiData && !hasApiFields;

  return (
    <div
      className={
        isBankViewMode
          ? "flex shrink-0 flex-col gap-0.5 border-t border-slate-300/80 pt-1"
          : "flex min-h-0 w-full shrink-0 flex-col gap-1.5 border-t border-slate-300/80 pt-1 md:w-[min(100%,272px)] md:max-w-[28%] md:border-l md:border-t-0 md:pl-2 md:pt-0"
      }
    >
      <p className="mb-0 shrink-0 text-[11px] font-semibold leading-tight tracking-tight text-slate-900">
        {t(`${B}.preview`)}
      </p>
      <div
        className={
          isBankViewMode
            ? "grid grid-cols-2 items-stretch gap-1.5"
            : "flex min-h-0 flex-1 flex-col gap-1.5"
        }
      >
        <BankDocumentSlot
          title={t("providerMaster.detailTabs.bank.cancelCheque")}
          uploadLabel={t("providerMaster.detailTabs.bank.cancelCheque")}
          preview={cancelledChequePreview}
          isLoading={isLoadingDocuments}
          isUploading={isUploadingCancelledCheque}
          isRefreshing={isRefreshingDocuments}
          isEditMode={!isBankViewMode}
          isRequired
          onUpload={onUploadCancelledCheque}
        />
        <BankDocumentSlot
          title={t("providerMaster.detailTabs.bank.panCard")}
          uploadLabel={t("providerMaster.detailTabs.bank.panCard")}
          preview={panCardPreview}
          isLoading={isLoadingDocuments}
          isUploading={isUploadingPanCard}
          isRefreshing={isRefreshingDocuments}
          isEditMode={!isBankViewMode}
          isRequired
          onUpload={onUploadPanCard}
        />
      </div>
    </div>
  );
}
