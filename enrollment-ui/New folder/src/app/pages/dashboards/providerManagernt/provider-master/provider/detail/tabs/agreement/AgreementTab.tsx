import { useState } from "react";
import { AgreementDetailView } from "./components/AgreementDetailView";
import { AgreementListView } from "./components/AgreementListView";
import { AgreementNewView } from "./components/AgreementNewView";
import { useAgreementFullForm } from "./hooks/useAgreementFullForm";
import { useAgreementNavigation } from "./hooks/useAgreementNavigation";
import {
  DEFAULT_AGREEMENT_PDF_URL,
  mergeAgreementDisplay,
} from "./utils/agreementConfig";
import {
  buildAgreementStatusBarConfig,
  downloadAgreementPdf,
  openAgreementPdf,
  type AgreementHospitalSummary,
} from "./utils/providerAgreementHelpers";

export interface AgreementTabProps {
  hospital: AgreementHospitalSummary;
  canWrite: boolean;
  canVerify?: boolean;
  providerBarSection: React.ReactNode;
  /** e.g. `/provider-masters/providers/1` — for URL-only agreement routes */
  providerBasePath?: string;
  /** From path `.../agreement/:key/view|edit` */
  agreementUrlKey?: string;
  agreementUrlSuffix?: "view" | "edit";
  isAgreementViewMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  agreementForm: Record<string, string>;
  agreementPdfUrl: string | undefined;
  agreementSamplePdfUrl?: string;
  onAgreementFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAgreementPdfUrl: (url: string | undefined) => void;
  onAgreementDetailOpen?: () => void;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  providerId?: string;
  isNewAgreementRoute?: boolean;
}

export function AgreementTab({
  hospital,
  canWrite,
  canVerify,
  providerBarSection,
  providerBasePath,
  agreementUrlKey,
  agreementUrlSuffix,
  isAgreementViewMode,
  onEdit,
  onCancel,
  onSave,
  agreementForm,
  agreementPdfUrl,
  agreementSamplePdfUrl = DEFAULT_AGREEMENT_PDF_URL,
  onAgreementFileChange,
  setAgreementPdfUrl,
  onAgreementDetailOpen,
  verifyDisabled = false,
  verifyDisabledTitle,
  providerId,
  isNewAgreementRoute = false,
}: Readonly<AgreementTabProps>) {
  const [supportingPdfUrl, setSupportingPdfUrl] = useState<string | undefined>();
  const statusBarConfig = buildAgreementStatusBarConfig({
    hospital,
    canWrite,
    canVerify,
    verifyDisabled,
    verifyDisabledTitle,
    providerId,
  });

  const { fullForm, showDetailFromUrl, createValidatedSaveHandler, onSaveAgreement } =
    useAgreementFullForm({
      providerId,
      providerBasePath,
      agreementUrlKey,
      agreementUrlSuffix,
      agreementSamplePdfUrl,
      setAgreementPdfUrl,
      setSupportingPdfUrl,
      onAgreementDetailOpen,
    });

  const {
    handleNewAgreementFromList,
    navigateToViewAgreement,
    navigateToEditAgreement,
  } = useAgreementNavigation({
    hospitalName: hospital?.hospitalName,
    providerBasePath,
  });

  const agreementDisplay = mergeAgreementDisplay(agreementForm);
  const pdfUrl = agreementPdfUrl ?? agreementSamplePdfUrl;

  const handleViewDocument = () => {
    if (!pdfUrl) return;
    openAgreementPdf(pdfUrl);
  };

  const handleDownloadDocument = () => {
    if (!pdfUrl) return;
    const documentName = showDetailFromUrl
      ? fullForm.getValues("agreementDocumentName")
      : agreementDisplay.agreementDocumentName;
    downloadAgreementPdf(pdfUrl, documentName ?? "agreement.pdf");
  };

  const handleViewSupportingDocument = () => {
    if (!supportingPdfUrl) return;
    openAgreementPdf(supportingPdfUrl);
  };

  const handleDownloadSupportingDocument = () => {
    if (!supportingPdfUrl) return;
    const documentName = showDetailFromUrl
      ? fullForm.getValues("supportingDocumentName")
      : "";
    downloadAgreementPdf(
      supportingPdfUrl,
      documentName?.trim() || "supporting-document",
    );
  };

  if (isNewAgreementRoute) {
    return (
      <AgreementNewView
        providerId={providerId}
        providerBasePath={providerBasePath ?? ""}
        providerBarSection={providerBarSection}
        statusBarConfig={statusBarConfig}
        onAgreementFileChange={onAgreementFileChange}
      />
    );
  }

  if (showDetailFromUrl) {
    return (
      <AgreementDetailView
        providerBarSection={providerBarSection}
        statusBarConfig={statusBarConfig}
        isAgreementViewMode={isAgreementViewMode}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={createValidatedSaveHandler(onSaveAgreement)}
        fullForm={fullForm}
        providerId={providerId}
        providerDisplay={hospital?.hospitalName ?? "—"}
        tpaDisplay="MDIndia"
        pdfUrl={pdfUrl}
        onViewDocument={handleViewDocument}
        onDownloadDocument={handleDownloadDocument}
        onViewSupportingDocument={
          supportingPdfUrl ? handleViewSupportingDocument : undefined
        }
        onDownloadSupportingDocument={
          supportingPdfUrl ? handleDownloadSupportingDocument : undefined
        }
        supportingPdfUrl={supportingPdfUrl}
        onAgreementFileChange={onAgreementFileChange}
      />
    );
  }

  return (
    <AgreementListView
      providerId={providerId}
      providerBarSection={providerBarSection}
      statusBarConfig={statusBarConfig}
      isAgreementViewMode={isAgreementViewMode}
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      onNewAgreement={handleNewAgreementFromList}
      onViewAgreement={navigateToViewAgreement}
      onEditAgreement={navigateToEditAgreement}
    />
  );
}
