import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ModernFileField } from "@/components/shared/dialog/commonDialog/ModernFileField";
import { SUPPORTING_DOCUMENT_ACCEPT } from "../../../icCorporateMapping/config";
import {
  isAllowedSupportingDocument,
  SUPPORTING_DOCUMENT_INVALID_MESSAGE,
} from "../../../icCorporateMapping/shared";
import { showErrorMessage } from "@/utils/errorHandler";
import {
  deleteDiscountSupportingDocumentFile,
  uploadDiscountSupportingDocument,
} from "../utils/discountDocumentApi";
import { useDiscountSupportingDocumentView } from "../hooks/useDiscountSupportingDocumentView";

type DiscountSupportingDocumentFieldProps = {
  providerId?: string;
  fileName: string;
  supportingFileMetadataId: string;
  onUploaded: (payload: {
    file: File;
    supportingFileMetadataId: string;
    supportingDocumentName: string;
  }) => void | Promise<void>;
  onClear: () => void;
  error?: string;
  disabled?: boolean;
  isRequired?: boolean;
};

export function DiscountSupportingDocumentField({
  providerId,
  fileName,
  supportingFileMetadataId,
  onUploaded,
  onClear,
  error,
  disabled = false,
  isRequired = false,
}: Readonly<DiscountSupportingDocumentFieldProps>) {
  const { t } = useTranslation();
  const D = "providerMaster.soc.discount";
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [localError, setLocalError] = useState("");

  const resolvedError = error || localError;
  const fieldDisabled = disabled || uploading || clearing;
  const hasStoredDocument = Boolean(
    String(fileName ?? "").trim() || String(supportingFileMetadataId ?? "").trim(),
  );
  const { displayName, viewUrl } = useDiscountSupportingDocumentView(
    supportingFileMetadataId,
    fileName,
    !fileName.trim() && Boolean(supportingFileMetadataId.trim()),
  );
  const resolvedFileName = fileName.trim() || displayName;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    if (!isAllowedSupportingDocument(file)) {
      setLocalError(SUPPORTING_DOCUMENT_INVALID_MESSAGE);
      return;
    }

    const resolvedProviderId = String(providerId ?? "").trim();
    if (!resolvedProviderId) {
      setLocalError("Provider id is required to upload a document.");
      return;
    }

    setLocalError("");
    setUploading(true);

    try {
      const result = await uploadDiscountSupportingDocument(file, resolvedProviderId);
      if (!result.ok) {
        const message = result.message ?? t(`${D}.supportingDocumentUploadFailed`);
        setLocalError(message);
        showErrorMessage({ error: message });
        return;
      }

      await onUploaded({
        file,
        supportingFileMetadataId: result.fileMetadataId,
        supportingDocumentName: file.name,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    if (fieldDisabled) return;

    setLocalError("");
    setClearing(true);
    try {
      const metadataId = String(supportingFileMetadataId ?? "").trim();
      if (metadataId) {
        const result = await deleteDiscountSupportingDocumentFile(metadataId);
        if (!result.ok) {
          const message = result.message ?? t(`${D}.supportingDocumentDeleteFailed`);
          setLocalError(message);
          showErrorMessage({ error: message });
          return;
        }
      }
      onClear();
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-1">
      <ModernFileField
        label={t(`${D}.supportingDocument`)}
        isRequired={isRequired}
        accept={SUPPORTING_DOCUMENT_ACCEPT}
        disabled={fieldDisabled}
        fileName={resolvedFileName || null}
        error={resolvedError}
        hint={
          uploading
            ? t(`${D}.supportingDocumentUploading`)
            : t(`${D}.supportingDocumentHint`)
        }
        className="!h-9 !min-h-[36px]"
        onChange={handleFileChange}
        onClear={hasStoredDocument ? handleClear : undefined}
      />
      {viewUrl && !uploading ? (
        <a
          href={viewUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs font-medium text-primary-600 underline hover:text-primary-800"
        >
          {t(`${D}.supportingDocumentView`)}
        </a>
      ) : null}
    </div>
  );
}
