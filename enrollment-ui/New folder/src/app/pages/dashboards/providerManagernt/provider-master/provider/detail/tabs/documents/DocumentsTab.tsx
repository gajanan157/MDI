import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import AlertDialogComponent from "@/components/shared/dialog/AlertDialog/AlertDialog";
import { PROVIDER_ACTION_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { StatusEditVerifyBar } from "../../shared/StatusEditVerifyBar";
import { DocumentsEmbeddedGrid } from "./DocumentsEmbeddedGrid";
import { DocumentUploadDialog } from "./components/DocumentUploadDialog";
import { DocumentViewerPanel } from "./components/DocumentViewerPanel";
import { useDocumentPreview } from "./hooks/useDocumentPreview";
import { useDocumentUpload } from "./hooks/useDocumentUpload";
import { useDocumentsList } from "./hooks/useDocumentsList";
import type {
  DocumentListItem,
  DocumentSampleFile,
} from "./utils/documentMasterGrid";
import {
  buildDocumentTypeOptions,
  buildDocumentsToolbarConfig,
  type DocumentsHospitalSummary,
} from "./utils/documentsHelpers";

export type { DocumentListItem, DocumentSampleFile } from "./utils/documentMasterGrid";

export interface DocumentsTabProps {
  providerBarSection: React.ReactNode;
  documentList: DocumentListItem[];
  documentSampleFiles: Record<number, DocumentSampleFile>;
  hospital?: DocumentsHospitalSummary;
  canWrite?: boolean;
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
}

export function DocumentsTab({
  providerBarSection,
  documentList,
  documentSampleFiles,
  hospital = null,
  canWrite = false,
  canVerify = false,
  verifyDisabled = false,
  verifyDisabledTitle,
}: Readonly<DocumentsTabProps>) {
  const { t } = useTranslation();
  const statusBarConfig = buildDocumentsToolbarConfig(hospital, t);
  const {
    localDocumentList,
    setLocalDocumentList,
    uploadedVersionUrls,
    setUploadedVersionUrls,
  } = useDocumentsList(documentList);

  const [uploadSuccessOpen, setUploadSuccessOpen] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(
    t("providerMaster.detailTabs.documents.uploadSuccessMessage"),
  );

  const {
    uploadForm,
    uploadModalOpen,
    uploadModalDoc,
    uploadFile,
    setUploadFile,
    uploadStartDate,
    setUploadStartDate,
    uploadValidTill,
    setUploadValidTill,
    openUploadModal,
    closeUploadModal,
    selectUploadDocument,
    handleUploadSubmit,
  } = useDocumentUpload({
    localDocumentList,
    setLocalDocumentList,
    setUploadedVersionUrls,
    onUploadSuccess: (message) => {
      setUploadSuccessMessage(message);
      setUploadSuccessOpen(true);
    },
  });

  const {
    documentViewerOpen,
    documentViewerDoc,
    resolveRowPreview,
    handleDocumentView,
    closeDocumentViewer,
  } = useDocumentPreview({
    localDocumentList,
    documentSampleFiles,
    uploadedVersionUrls,
  });

  const documentTypeOptions = useMemo(
    () => buildDocumentTypeOptions(localDocumentList, t),
    [localDocumentList, t],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 bg-gray-50 p-1">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={statusBarConfig.providerStatus}
        blacklistedByIcs={statusBarConfig.blacklistedByIcs}
        canWrite={canWrite}
        canVerify={canVerify}
        isEditMode={false}
        onEdit={() => undefined}
        onCancel={() => undefined}
        onSave={() => undefined}
        hideEdit
        verifyDisabled={verifyDisabled}
        verifyDisabledTitle={verifyDisabledTitle}
        auditLog={statusBarConfig.auditLog}
        extraActions={
          canWrite ? (
            <Button
              type="button"
              variant="outlined"
              className={PROVIDER_ACTION_BUTTON_CLASS}
              onClick={() => openUploadModal(null)}
            >
              <CloudArrowUpIcon className="h-3.5 w-3.5" />
              {t("providerMaster.detailTabs.documents.upload")}
            </Button>
          ) : null
        }
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 lg:flex-row">
        <div
          className={`min-w-0 transition-all duration-300 ${
            documentViewerOpen ? "w-full lg:w-1/2" : "w-full"
          }`}
        >
          <DocumentsEmbeddedGrid
            documentList={localDocumentList}
            documentSampleFiles={documentSampleFiles}
            canWrite={canWrite}
            gridHeight={354}
            resolvePreview={resolveRowPreview}
            onView={handleDocumentView}
          />
        </div>
        <DocumentViewerPanel
          open={documentViewerOpen}
          document={documentViewerDoc}
          onClose={closeDocumentViewer}
        />
      </div>

      <DocumentUploadDialog
        open={uploadModalOpen}
        uploadForm={uploadForm}
        uploadModalDoc={uploadModalDoc}
        uploadFile={uploadFile}
        uploadStartDate={uploadStartDate}
        uploadValidTill={uploadValidTill}
        documentTypeOptions={documentTypeOptions}
        onClose={closeUploadModal}
        onSubmit={handleUploadSubmit}
        onFileChange={setUploadFile}
        onStartDateChange={setUploadStartDate}
        onValidTillChange={setUploadValidTill}
        onSelectDocument={selectUploadDocument}
      />

      <AlertDialogComponent
        type="success"
        title={t("providerMaster.detailTabs.documents.uploadSuccessful")}
        message={uploadSuccessMessage}
        isOpen={uploadSuccessOpen}
        onClose={() => setUploadSuccessOpen(false)}
      />
    </div>
  );
}
