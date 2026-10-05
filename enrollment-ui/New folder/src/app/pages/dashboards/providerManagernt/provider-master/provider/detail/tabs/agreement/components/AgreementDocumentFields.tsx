import { useState, type ChangeEvent, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { UseFormReturn } from "react-hook-form";
import { ChooseFileField } from "../../../shared/ChooseFileField";
import { showErrorMessage } from "@/utils/errorHandler";
import { isDuplicateFileName } from "@/app/pages/dashboards/providerManagernt/shared/duplicateFileName";
import type { AgreementFullFormValues } from "../utils/agreementFormConfig";
import {
  deleteAgreementDocumentFile,
  uploadAgreementDocument,
  uploadAgreementSupportingDocument,
} from "../utils/agreementDocumentApi";
import {
  AGREEMENT_DOCUMENT_ACCEPT,
  AGREEMENT_DOCUMENT_INVALID_TYPE_MESSAGE,
  isAgreementPdfFile,
  isAgreementSupportingDocumentFile,
  SUPPORTING_DOCUMENT_ACCEPT,
  SUPPORTING_DOCUMENT_INVALID_TYPE_MESSAGE,
} from "../utils/agreementDocumentConfig";
import { formatToDDMMMYYYY, toProviderDateStorageValue } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";

function formatUploadedOnDate(): string {
  return formatToDDMMMYYYY(toProviderDateStorageValue(new Date()));
}

type AgreementDocumentFieldsProps = {
  providerId?: string;
  form: UseFormReturn<AgreementFullFormValues>;
  agreementFileInputRef: RefObject<HTMLInputElement | null>;
  supportingFileInputRef: RefObject<HTMLInputElement | null>;
  agreementFileDisplayName: string | null;
  supportingFileDisplayName: string | null;
  agreementDocumentViewUrl?: string;
  supportingDocumentViewUrl?: string;
  clearAgreementDocument: () => void;
  clearSupportingDocument: () => void;
  disabled?: boolean;
  agreementDocumentRequired?: boolean;
  supportingDocumentRequired?: boolean;
  agreementDocumentError?: string;
  supportingDocumentError?: string;
  onAgreementFileChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function AgreementDocumentFields({
  providerId,
  form,
  agreementFileInputRef,
  supportingFileInputRef,
  agreementFileDisplayName,
  supportingFileDisplayName,
  agreementDocumentViewUrl,
  supportingDocumentViewUrl,
  clearAgreementDocument,
  clearSupportingDocument,
  disabled = false,
  agreementDocumentRequired = false,
  supportingDocumentRequired = false,
  agreementDocumentError,
  supportingDocumentError,
  onAgreementFileChange,
}: Readonly<AgreementDocumentFieldsProps>) {
  const { t } = useTranslation();
  const { setValue, getValues } = form;
  const [uploadingAgreement, setUploadingAgreement] = useState(false);
  const [uploadingSupporting, setUploadingSupporting] = useState(false);
  const [clearingAgreement, setClearingAgreement] = useState(false);
  const [clearingSupporting, setClearingSupporting] = useState(false);
  const [agreementError, setAgreementError] = useState("");
  const [supportingError, setSupportingError] = useState("");

  const resolvedProviderId = providerId?.trim() ?? "";
  const duplicateFileMessage = t("providerMaster.common.duplicateFileName");

  const deleteStoredFile = async (fileMetadataId: string) => {
    const trimmedId = fileMetadataId.trim();
    if (!trimmedId) return true;
    const result = await deleteAgreementDocumentFile(trimmedId);
    if (!result.ok) {
      showErrorMessage({ error: result.message ?? "Failed to delete document." });
      return false;
    }
    return true;
  };

  const handleAgreementClear = async () => {
    if (disabled || uploadingAgreement || clearingAgreement) return;

    setAgreementError("");
    setClearingAgreement(true);
    try {
      const fileMetadataId = String(getValues("fileMetadataId") ?? "").trim();
      if (fileMetadataId) {
        const deleted = await deleteStoredFile(fileMetadataId);
        if (!deleted) return;
      }
      clearAgreementDocument();
    } finally {
      setClearingAgreement(false);
    }
  };

  const handleSupportingClear = async () => {
    if (disabled || uploadingSupporting || clearingSupporting) return;

    setSupportingError("");
    setClearingSupporting(true);
    try {
      const fileMetadataId = String(getValues("supportingFileMetadataId") ?? "").trim();
      if (fileMetadataId) {
        const deleted = await deleteStoredFile(fileMetadataId);
        if (!deleted) return;
      }
      clearSupportingDocument();
    } finally {
      setClearingSupporting(false);
    }
  };

  const handleAgreementFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!isAgreementPdfFile(file)) {
      event.target.value = "";
      setAgreementError(AGREEMENT_DOCUMENT_INVALID_TYPE_MESSAGE);
      return;
    }

    const otherName = String(getValues("supportingDocumentName") ?? "").trim();
    if (isDuplicateFileName(file.name, otherName)) {
      event.target.value = "";
      setAgreementError(duplicateFileMessage);
      return;
    }

    onAgreementFileChange?.(event);
    event.target.value = "";

    if (String(getValues("fileMetadataId") ?? "").trim() || agreementFileDisplayName?.trim()) {
      return;
    }

    if (!resolvedProviderId) {
      setAgreementError("Provider id is required to upload a document.");
      return;
    }

    setAgreementError("");
    setUploadingAgreement(true);
    setValue("pendingAgreementDocumentFile", null, { shouldDirty: true });
    setValue("fileMetadataId", "", { shouldDirty: true });

    try {
      const result = await uploadAgreementDocument(file, resolvedProviderId);
      if (!result.ok) {
        const message = result.message ?? "Failed to upload agreement document.";
        setAgreementError(message);
        showErrorMessage({ error: message });
        return;
      }

      setValue("agreementDocumentName", file.name, { shouldDirty: true, shouldValidate: true });
      setValue("agreementDocumentUploadedOn", formatUploadedOnDate(), { shouldDirty: true });
      setValue("fileMetadataId", result.fileMetadataId, { shouldDirty: true, shouldValidate: true });
      if (result.inwardNo?.trim()) {
        setValue("inwardNo", result.inwardNo.trim(), { shouldDirty: true });
      }
    } finally {
      setUploadingAgreement(false);
    }
  };

  const handleSupportingFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!isAgreementSupportingDocumentFile(file)) {
      event.target.value = "";
      setSupportingError(SUPPORTING_DOCUMENT_INVALID_TYPE_MESSAGE);
      return;
    }

    const otherName = String(getValues("agreementDocumentName") ?? "").trim();
    if (isDuplicateFileName(file.name, otherName)) {
      event.target.value = "";
      setSupportingError(duplicateFileMessage);
      return;
    }

    event.target.value = "";

    if (
      String(getValues("supportingFileMetadataId") ?? "").trim() ||
      supportingFileDisplayName?.trim()
    ) {
      return;
    }

    if (!resolvedProviderId) {
      setSupportingError("Provider id is required to upload a document.");
      return;
    }

    setSupportingError("");
    setUploadingSupporting(true);
    setValue("pendingSupportingDocumentFile", null, { shouldDirty: true });
    setValue("supportingFileMetadataId", "", { shouldDirty: true });

    try {
      const result = await uploadAgreementSupportingDocument(file, resolvedProviderId);
      if (!result.ok) {
        const message = result.message ?? "Failed to upload supporting document.";
        setSupportingError(message);
        showErrorMessage({ error: message });
        return;
      }

      setValue("supportingDocumentName", file.name, { shouldDirty: true, shouldValidate: true });
      setValue("supportingDocumentUploadedOn", formatUploadedOnDate(), { shouldDirty: true });
      setValue("supportingFileMetadataId", result.fileMetadataId, { shouldDirty: true, shouldValidate: true });
      if (result.inwardNo?.trim()) {
        setValue("inwardNo", result.inwardNo.trim(), { shouldDirty: true });
      }
    } finally {
      setUploadingSupporting(false);
    }
  };

  return (
    <>
      <ChooseFileField
        label={t("providerMaster.agreement.fields.agreementDocument")}
        inputRef={agreementFileInputRef}
        accept={AGREEMENT_DOCUMENT_ACCEPT}
        disabled={disabled}
        isRequired={agreementDocumentRequired}
        uploading={uploadingAgreement}
        clearing={clearingAgreement}
        displayName={agreementFileDisplayName}
        viewUrl={agreementDocumentViewUrl}
        error={agreementError || agreementDocumentError || undefined}
        onClear={() => {
          handleAgreementClear();
        }}
        onChange={(event) => {
          handleAgreementFileChange(event);
        }}
      />
      <ChooseFileField
        label={t("providerMaster.agreement.fields.supportingDocument")}
        inputRef={supportingFileInputRef}
        accept={SUPPORTING_DOCUMENT_ACCEPT}
        disabled={disabled}
        isRequired={supportingDocumentRequired}
        uploading={uploadingSupporting}
        clearing={clearingSupporting}
        displayName={supportingFileDisplayName}
        viewUrl={supportingDocumentViewUrl}
        error={supportingError || supportingDocumentError || undefined}
        onClear={() => {
          handleSupportingClear();
        }}
        onChange={(event) => {
          handleSupportingFileChange(event);
        }}
      />
    </>
  );
}
