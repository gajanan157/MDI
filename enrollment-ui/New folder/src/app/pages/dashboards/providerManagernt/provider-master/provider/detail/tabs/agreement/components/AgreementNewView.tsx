import { useTranslation } from "react-i18next";
import AlertDialogComponent from "@/components/shared/dialog/AlertDialog/AlertDialog";
import { AgreementFormEdit } from "../form";
import { StatusEditVerifyBar } from "../../../shared/StatusEditVerifyBar";
import { useAgreementCreateForm } from "../hooks/useAgreementCreateForm";
import type { AgreementStatusBarConfig } from "../utils/providerAgreementHelpers";

type AgreementNewViewProps = {
  providerId?: string;
  providerBasePath: string;
  providerBarSection: React.ReactNode;
  statusBarConfig: AgreementStatusBarConfig;
  onAgreementFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AgreementNewView({
  providerId,
  providerBasePath,
  providerBarSection,
  statusBarConfig,
  onAgreementFileChange,
}: Readonly<AgreementNewViewProps>) {
  const { t } = useTranslation();
  const {
    logic,
    onCancel,
    onSaveAgreement,
    canSaveAgreement,
    handlePpnValidationChange,
    agreementNameOptions,
    disableAgreementName,
    icMappingSuccessDialog,
    closeIcMappingSuccessDialog,
    viewMappedIcsFromSuccessDialog,
  } = useAgreementCreateForm({
    providerId,
    providerBasePath,
  });

  const mappingSuccessMessage =
    icMappingSuccessDialog.kind == null
      ? ""
      : t(`providerMaster.agreement.mappingSuccess.${icMappingSuccessDialog.kind}`);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 p-1.5">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={statusBarConfig.providerStatus}
        blacklistedByIcs={statusBarConfig.blacklistedByIcs}
        canWrite={statusBarConfig.canWrite}
        canVerify={statusBarConfig.canVerify}
        isEditMode
        onEdit={() => undefined}
        onCancel={onCancel}
        onSave={onSaveAgreement}
        editDisabled={false}
        hideEdit
        saveDisabled={!canSaveAgreement}
        verifyDisabled={statusBarConfig.verifyDisabled}
        verifyDisabledTitle={statusBarConfig.verifyDisabledTitle}
        auditLog={statusBarConfig.auditLog}
      />
      <section className="min-h-0 flex-1 overflow-y-auto">
        <AgreementFormEdit
          logic={logic}
          providerId={providerId}
          mode="create"
          agreementNameOptions={agreementNameOptions}
          disableAgreementName={disableAgreementName}
          onAgreementFileChange={onAgreementFileChange}
          onPpnValidationChange={handlePpnValidationChange}
        />
      </section>

      <AlertDialogComponent
        type="success"
        variant="prominent"
        hideCloseIcon
        title={t("providerMaster.agreement.mappingSuccess.title")}
        message={mappingSuccessMessage}
        isOpen={icMappingSuccessDialog.open}
        onClose={closeIcMappingSuccessDialog}
        closeText={t("providerMaster.agreement.mappingSuccess.close")}
        onConfirm={viewMappedIcsFromSuccessDialog}
        confirmText={t("providerMaster.agreement.mappingSuccess.view")}
        confirmDisabled={!icMappingSuccessDialog.viewEnabled}
      />
    </div>
  );
}
