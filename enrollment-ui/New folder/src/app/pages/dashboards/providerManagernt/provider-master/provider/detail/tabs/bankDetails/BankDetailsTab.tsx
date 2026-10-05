import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { useWatch } from "react-hook-form";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { ProviderSectionCard } from "../../shared/DetailRow";
import { ProviderTabLoadingState } from "../../shared/ProviderTabLoadingState";
import { StatusEditVerifyBar } from "../../shared/StatusEditVerifyBar";
import type { BankFormValues } from "../../schemas";
import { bankSchema } from "../../schemas";
import type { HospitalDetailRecord } from "../../../hospitalData";
import type { BankTabFieldsFromApi } from "../../utils/providerDetailSectionMerges";
import { BankDetailsEditForm } from "./components/BankDetailsEditForm";
import { BankDetailsViewCard } from "./components/BankDetailsViewCard";
import { BankDocumentsPanel } from "./components/BankDocumentsPanel";
import {
  useBankDetailsForm,
  useBankDocumentPreviews,
  useIfscVerification,
  type BankSaveResult,
} from "./hooks/bankTabHooks";
import { EMPTY_BANK_FORM } from "./utils/bankDetailsConfig";
import {
  buildBankDetailsStatusBarConfig,
  getBankDetailsSaveDisabledState,
} from "./utils/bankDetailsHelpers";
import type { ProviderBankDetailsNavState } from "../../../utils/providersPaths";

export interface BankDetailsTabProps {
  hospital: HospitalDetailRecord | null;
  bankFieldsFromApi: BankTabFieldsFromApi | null;
  canWrite: boolean;
  canVerify?: boolean;
  providerBarSection: React.ReactNode;
  isLoadingApiData?: boolean;
  onSaveBankDetails?: (
    values: BankFormValues,
    ifscVerifiedStatus?: boolean | null,
    documents?: {
      cancelChequeFileMetadataId?: string;
      panCardFileMetadataId?: string;
    },
  ) => Promise<BankSaveResult> | BankSaveResult;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  onDocumentUploaded?: () => void;
  isRefreshingDocuments?: boolean;
}

export function BankDetailsTab({
  hospital,
  bankFieldsFromApi,
  canWrite,
  canVerify = false,
  providerBarSection,
  isLoadingApiData = false,
  onSaveBankDetails,
  verifyDisabled = false,
  verifyDisabledTitle,
  onDocumentUploaded,
  isRefreshingDocuments = false,
}: Readonly<BankDetailsTabProps>) {
  const { t } = useTranslation();
  const location = useLocation();
  const { isExpanded: isSidebarOpen } = useSidebarContext();
  const startInEditMode =
    canWrite &&
    Boolean((location.state as ProviderBankDetailsNavState | null)?.startBankDetailsEdit);
  const [isBankViewMode, setIsBankViewMode] = useState(!startInEditMode);
  const statusBarConfig = buildBankDetailsStatusBarConfig(hospital, t);
  const getIfscCodeRef = useRef<() => string>(
    () => EMPTY_BANK_FORM.providerBankIfscCode ?? "",
  );

  const {
    cancelledChequePreview,
    panCardPreview,
    isUploadingCancelledCheque,
    isUploadingPanCard,
    resetPreviewsFromApi,
    uploadCancelledCheque,
    uploadPanCard,
  } = useBankDocumentPreviews({
    bankFieldsFromApi,
    providerId: hospital?.id,
    onDocumentUploaded,
  });

  const {
    isIfscVerifying,
    ifscVerificationStatus,
    verifyIfscDisabled,
    verifyIfsc,
    resetIfscVerification,
    clearIfscVerification,
  } = useIfscVerification({
    bankFieldsFromApi,
    isBankViewMode,
    getIfscCode: () => getIfscCodeRef.current(),
  });

  const form = useBankDetailsForm({
    bankFieldsFromApi,
    ifscVerificationStatus,
    onSaveBankDetails,
    getSaveDocuments: () => ({
      cancelChequeFileMetadataId: cancelledChequePreview?.fileMetadataId,
      panCardFileMetadataId: panCardPreview?.fileMetadataId,
    }),
    onSaveComplete: () => setIsBankViewMode(true),
  });

  getIfscCodeRef.current = () =>
    String(form.getValues("providerBankIfscCode") ?? "");

  const bankFormValues = useWatch({ control: form.control }) as BankFormValues;
  const isFormValid = bankSchema.isValidSync(bankFormValues ?? EMPTY_BANK_FORM);
  const { saveDisabled, saveDisabledTitle } = getBankDetailsSaveDisabledState(
    isFormValid,
    cancelledChequePreview,
    panCardPreview,
    t,
  );

  const handleCancel = () => {
    form.resetFromApi();
    resetPreviewsFromApi();
    resetIfscVerification();
    setIsBankViewMode(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden bg-gray-50 p-1">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={statusBarConfig.providerStatus}
        blacklistedByIcs={statusBarConfig.blacklistedByIcs}
        canWrite={canWrite}
        canVerify={canVerify}
        isEditMode={!isBankViewMode}
        onEdit={() => setIsBankViewMode(false)}
        onCancel={handleCancel}
        onSave={() => form.handleSubmit(form.handleSave)()}
        saveDisabled={!isBankViewMode && saveDisabled}
        saveDisabledTitle={saveDisabledTitle}
        verifyDisabled={verifyDisabled}
        verifyDisabledTitle={verifyDisabledTitle}
        auditLog={statusBarConfig.auditLog}
      />
      <ProviderSectionCard
        title={t("providerMaster.detailTabs.bank.title")}
        isExpanded
        fillHeight
        className="min-h-0 flex-1"
      >
        <div
          className={`flex h-full min-h-0 flex-col p-1 md:p-1.5 ${
            isBankViewMode ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {isLoadingApiData ? (
            <ProviderTabLoadingState fillHeight={false} />
          ) : (
            <div
              className={
                isBankViewMode
                  ? "flex min-h-0 flex-1 flex-col gap-1"
                  : "flex min-h-0 flex-1 flex-col gap-1.5 md:flex-row md:items-stretch md:gap-2"
              }
            >
          <div
            className={`min-w-0 rounded-lg bg-white ${
              isBankViewMode
                ? "shrink-0"
                : "min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
            }`}
          >
            {isBankViewMode ? (
              <BankDetailsViewCard
                bankFieldsFromApi={bankFieldsFromApi}
                ifscVerificationStatus={ifscVerificationStatus}
                isSidebarOpen={isSidebarOpen}
              />
            ) : (
              <BankDetailsEditForm
                form={form}
                isSidebarOpen={isSidebarOpen}
                ifscVerificationStatus={ifscVerificationStatus}
                isIfscVerifying={isIfscVerifying}
                verifyIfscDisabled={verifyIfscDisabled}
                onVerifyIfsc={verifyIfsc}
                onClearIfscVerification={clearIfscVerification}
                onSubmit={form.handleSave}
              />
            )}
          </div>
          <BankDocumentsPanel
            isBankViewMode={isBankViewMode}
            isLoadingApiData={isLoadingApiData}
            hasApiFields={bankFieldsFromApi != null}
            cancelledChequePreview={cancelledChequePreview}
            panCardPreview={panCardPreview}
            isUploadingCancelledCheque={isUploadingCancelledCheque}
            isUploadingPanCard={isUploadingPanCard}
            isRefreshingDocuments={isRefreshingDocuments}
            onUploadCancelledCheque={uploadCancelledCheque}
            onUploadPanCard={uploadPanCard}
          />
            </div>
          )}
        </div>
      </ProviderSectionCard>
    </div>
  );
}
