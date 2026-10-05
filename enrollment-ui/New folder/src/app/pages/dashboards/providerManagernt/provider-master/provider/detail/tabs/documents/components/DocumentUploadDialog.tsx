import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { ProviderDatePicker } from "@/app/pages/dashboards/providerManagernt/shared/ProviderDatePicker";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { ConfigFormDialog } from "@/components/shared/dialog/commonDialog";
import type { DocumentListItem } from "../utils/documentMasterGrid";
import { DocumentUploadDropZone } from "./DocumentUploadDropZone";

type DocumentUploadDialogProps = {
  open: boolean;
  uploadForm: UseFormReturn<{ selectedDocumentNo: string }>;
  uploadModalDoc: DocumentListItem | null;
  uploadFile: File | null;
  uploadStartDate: string;
  uploadValidTill: string;
  documentTypeOptions: Array<{ label: string; value: string }>;
  onClose: () => void;
  onSubmit: () => void;
  onFileChange: (file: File | null) => void;
  onStartDateChange: (value: string) => void;
  onValidTillChange: (value: string) => void;
  onSelectDocument: (documentNo: number) => void;
};

export function DocumentUploadDialog({
  open,
  uploadForm,
  uploadModalDoc,
  uploadFile,
  uploadStartDate,
  uploadValidTill,
  documentTypeOptions,
  onClose,
  onSubmit,
  onFileChange,
  onStartDateChange,
  onValidTillChange,
  onSelectDocument,
}: Readonly<DocumentUploadDialogProps>) {
  const { t } = useTranslation();

  return (
    <ConfigFormDialog
      open={open}
      onClose={onClose}
      title={t("providerMaster.detailTabs.documents.uploadDocument")}
      titleId="upload-document-dialog-title"
      fields={[]}
      form={uploadForm as unknown as UseFormReturn<Record<string, unknown>>}
      onSubmit={onSubmit}
      maxColumns={1}
      widthClassName="w-full max-w-md sm:w-[90%]"
      footer={
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2">
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="outlined"
              className={PROVIDER_FORM_BUTTON_CLASS}
              onClick={onClose}
            >
              {t("providerMaster.button.cancel")}
            </Button>
            <Button
              type="button"
              color="primary"
              className={PROVIDER_FORM_BUTTON_CLASS}
              onClick={onSubmit}
              disabled={!uploadFile || !uploadModalDoc}
            >
              {t("providerMaster.detailTabs.documents.upload")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {uploadModalDoc == null ? (
          <DropdownSelect
            control={uploadForm.control}
            name="selectedDocumentNo"
            name_key="selectedDocumentNo"
            label={t("providerMaster.detailTabs.documents.selectDocument")}
            options={documentTypeOptions}
            className="h-9 w-full text-sm"
            onSelect={(opt: { value?: string } | null) => {
              const no = opt?.value ? Number(opt.value) : 0;
              if (no) onSelectDocument(no);
            }}
          />
        ) : (
          <p className="text-sm font-medium text-gray-700">
            {t("providerMaster.detailTabs.documents.documentLabel")}:{" "}
            <span className="text-gray-900">{uploadModalDoc.name}</span>
          </p>
        )}
        <DocumentUploadDropZone file={uploadFile} onFileChange={onFileChange} />
        <ProviderDatePicker
          label={t("providerMaster.detailTabs.documents.startDateOptional")}
          value={uploadStartDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full text-sm"
          disablePortal
        />
        <ProviderDatePicker
          label={t("providerMaster.detailTabs.documents.validTillOptional")}
          value={uploadValidTill}
          onChange={(e) => onValidTillChange(e.target.value)}
          className="w-full text-sm"
          disablePortal
        />
      </div>
    </ConfigFormDialog>
  );
}
