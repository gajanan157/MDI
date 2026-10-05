import { Controller, useWatch, type Control, type FieldErrors, type UseFormReturn } from "react-hook-form";
import type { TFunction } from "i18next";
import { ChooseFileField } from "../../../shared/ChooseFileField";
import {
  fileListFirstName,
  isDuplicateFileName,
} from "@/app/pages/dashboards/providerManagernt/shared/duplicateFileName";
import {
  AGREEMENT_DOCUMENT_ACCEPT,
  isAgreementPdfFile,
  isAgreementSupportingDocumentFile,
  SUPPORTING_DOCUMENT_ACCEPT,
} from "../utils/agreementDocumentConfig";
import type { StandaloneAgreementFormValues } from "../utils/agreementFormConfig";
import { resolveVisibleFieldError } from "../../../../../../shared/resolveVisibleFieldError";

type StandaloneAgreementDocumentUploadFieldsProps = {
  control: Control<StandaloneAgreementFormValues>;
  t: TFunction;
  documentUploadEnabled: boolean;
  agreementDocumentEnabled: boolean;
  supportingDocumentRequired?: boolean;
  agreementDocumentTypeError: string;
  supportingDocumentTypeError: string;
  setAgreementDocumentTypeError: (message: string) => void;
  setSupportingDocumentTypeError: (message: string) => void;
  fieldError: (name: "agreementDocumentName") => string | undefined;
  errors: FieldErrors<StandaloneAgreementFormValues>;
  touchedFields: UseFormReturn<StandaloneAgreementFormValues>["formState"]["touchedFields"];
  isSubmitted: boolean;
};

export function StandaloneAgreementDocumentUploadFields({
  control,
  t,
  documentUploadEnabled,
  agreementDocumentEnabled,
  supportingDocumentRequired = true,
  agreementDocumentTypeError,
  supportingDocumentTypeError,
  setAgreementDocumentTypeError,
  setSupportingDocumentTypeError,
  fieldError,
  errors,
  touchedFields,
  isSubmitted,
}: Readonly<StandaloneAgreementDocumentUploadFieldsProps>) {
  const documentFile = useWatch({ control, name: "documentFile" });
  const supportingDocumentFile = useWatch({ control, name: "supportingDocumentFile" });
  const duplicateFileMessage = t("providerMaster.common.duplicateFileName");

  return (
    <>
      <div className="min-w-0">
        <Controller
          name="documentFile"
          control={control}
          render={({ field: { onChange, ref, value } }) => (
            <ChooseFileField
              label={t("providerMaster.agreement.fields.agreementDocument")}
              inputRef={ref}
              disabled={!documentUploadEnabled}
              isRequired={agreementDocumentEnabled}
              displayName={value instanceof FileList && value.length > 0 ? value[0].name : null}
              onClear={
                value instanceof FileList && value.length > 0 ? () => onChange(undefined) : undefined
              }
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && !isAgreementPdfFile(file)) {
                  e.target.value = "";
                  setAgreementDocumentTypeError(
                    t("providerMaster.standaloneAgreement.validation.pdfOnly"),
                  );
                  return;
                }
                if (
                  file &&
                  isDuplicateFileName(file.name, fileListFirstName(supportingDocumentFile))
                ) {
                  e.target.value = "";
                  setAgreementDocumentTypeError(duplicateFileMessage);
                  return;
                }
                setAgreementDocumentTypeError("");
                onChange(e.target.files);
              }}
              accept={AGREEMENT_DOCUMENT_ACCEPT}
              error={
                agreementDocumentEnabled
                  ? agreementDocumentTypeError ||
                    fieldError("agreementDocumentName") ||
                    resolveVisibleFieldError(errors, touchedFields, isSubmitted, "documentFile")
                  : undefined
              }
            />
          )}
        />
      </div>
      <div className="min-w-0">
        <Controller
          name="supportingDocumentFile"
          control={control}
          render={({ field: { onChange, ref, value } }) => (
            <ChooseFileField
              label={t("providerMaster.agreement.fields.supportingDocument")}
              disabled={!documentUploadEnabled}
              inputRef={ref}
              isRequired={supportingDocumentRequired}
              displayName={value instanceof FileList && value.length > 0 ? value[0].name : null}
              onClear={
                value instanceof FileList && value.length > 0 ? () => onChange(undefined) : undefined
              }
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && !isAgreementSupportingDocumentFile(file)) {
                  e.target.value = "";
                  setSupportingDocumentTypeError(
                    t("providerMaster.standaloneAgreement.validation.supportingDocTypes"),
                  );
                  return;
                }
                if (file && isDuplicateFileName(file.name, fileListFirstName(documentFile))) {
                  e.target.value = "";
                  setSupportingDocumentTypeError(duplicateFileMessage);
                  return;
                }
                setSupportingDocumentTypeError("");
                onChange(e.target.files);
              }}
              accept={SUPPORTING_DOCUMENT_ACCEPT}
              error={
                supportingDocumentRequired
                  ? supportingDocumentTypeError ||
                    resolveVisibleFieldError(
                      errors,
                      touchedFields,
                      isSubmitted,
                      "supportingDocumentFile",
                    )
                  : supportingDocumentTypeError || undefined
              }
            />
          )}
        />
      </div>
    </>
  );
}
