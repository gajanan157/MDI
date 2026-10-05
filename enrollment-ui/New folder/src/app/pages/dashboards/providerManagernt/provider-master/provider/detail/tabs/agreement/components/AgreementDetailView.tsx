import type { UseFormReturn } from "react-hook-form";
import { AgreementFormContent } from "../form";
import type { AgreementFullFormValues } from "../utils/agreementFormConfig";
import { StatusEditVerifyBar } from "../../../shared/StatusEditVerifyBar";
import type { AgreementStatusBarConfig } from "../utils/providerAgreementHelpers";

type AgreementDetailViewProps = {
  providerBarSection: React.ReactNode;
  statusBarConfig: AgreementStatusBarConfig;
  isAgreementViewMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  fullForm: UseFormReturn<AgreementFullFormValues>;
  providerId?: string;
  providerDisplay: string;
  tpaDisplay: string;
  pdfUrl: string;
  onViewDocument: () => void;
  onDownloadDocument: () => void;
  onViewSupportingDocument?: () => void;
  onDownloadSupportingDocument?: () => void;
  supportingPdfUrl?: string;
  onAgreementFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AgreementDetailView({
  providerBarSection,
  statusBarConfig,
  isAgreementViewMode,
  onEdit,
  onCancel,
  onSave,
  fullForm,
  providerId,
  providerDisplay,
  tpaDisplay,
  pdfUrl,
  onViewDocument,
  onDownloadDocument,
  onViewSupportingDocument,
  onDownloadSupportingDocument,
  supportingPdfUrl,
  onAgreementFileChange,
}: Readonly<AgreementDetailViewProps>) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 p-1.5">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={statusBarConfig.providerStatus}
        blacklistedByIcs={statusBarConfig.blacklistedByIcs}
        canWrite={statusBarConfig.canWrite}
        canVerify={statusBarConfig.canVerify}
        isEditMode={!isAgreementViewMode}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        editDisabled={false}
        verifyDisabled={statusBarConfig.verifyDisabled}
        verifyDisabledTitle={statusBarConfig.verifyDisabledTitle}
        auditLog={statusBarConfig.auditLog}
        showCancelInViewMode
      />
      <section className="min-h-0 flex-1 overflow-y-auto">
        <AgreementFormContent
          form={fullForm}
          readOnly={isAgreementViewMode}
          providerId={providerId}
          providerDisplay={providerDisplay}
          tpaDisplay={tpaDisplay}
          pdfUrl={pdfUrl}
          onViewDocument={onViewDocument}
          onDownloadDocument={onDownloadDocument}
          onViewSupportingDocument={onViewSupportingDocument}
          onDownloadSupportingDocument={onDownloadSupportingDocument}
          supportingPdfUrl={supportingPdfUrl}
          onAgreementFileChange={onAgreementFileChange}
        />
      </section>
    </div>
  );
}
