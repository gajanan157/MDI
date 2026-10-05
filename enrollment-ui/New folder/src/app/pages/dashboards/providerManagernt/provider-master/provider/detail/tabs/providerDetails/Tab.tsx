import { type ReactNode, useState } from "react";
import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";
import type { ProviderDetailsFromApi } from "../../utils/providerDetailSectionMerges";
import { StatusEditVerifyBar } from "../../shared/StatusEditVerifyBar";
import {
  appendEmptyCertificateRow,
  buildProviderDetailsStatusBarConfig,
  getContactViewFields,
} from "./helpers";
import {
  ProviderAddressCard,
  ProviderCertificatesCard,
  ProviderContactCard,
  ProviderInformationCard,
} from "./Cards";
import { ProviderIdentifierCard } from "./IdentifierSection";
import {
  useCertificateOptions,
  useProviderDetailsForms,
  useProviderDetailsSave,
} from "./useTab";
import { ProviderDetailsMobileView } from "./ProviderDetailsMobileView";

function selectByEditMode<T>(
  isEditMode: boolean,
  editValue: T,
  viewValue: T,
): T {
  return isEditMode ? editValue : viewValue;
}

function DesktopProviderDetailsColumns({
  isEditMode,
  providerInformation,
  identifierDetails,
  addressDetails,
  contactDetails,
  certificates,
}: Readonly<{
  isEditMode: boolean;
  providerInformation: ReactNode;
  identifierDetails: ReactNode;
  addressDetails: ReactNode;
  contactDetails: ReactNode;
  certificates: ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-1.5 lg:flex-row lg:items-start">
      <div className="flex w-full min-w-0 flex-col gap-1.5 lg:w-1/2">
        {providerInformation}
        {identifierDetails}
        {!isEditMode ? addressDetails : null}
      </div>
      <div className="flex w-full min-w-0 flex-col gap-1.5 lg:w-1/2">
        {contactDetails}
        {certificates}
        {isEditMode ? addressDetails : null}
      </div>
    </div>
  );
}

export interface ProviderDetailsTabProps {
  providerDetails: ProviderDetailsFromApi | null;
  canWrite: boolean;
  canVerify?: boolean;
  onRefreshDetails?: () => Promise<void> | void;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  providerBarSection?: React.ReactNode;
}

export function ProviderDetailsTab({
  providerDetails,
  canWrite,
  canVerify,
  onRefreshDetails,
  verifyDisabled = false,
  verifyDisabledTitle,
  providerBarSection,
}: Readonly<ProviderDetailsTabProps>) {
  const { smAndDown } = useBreakpointsContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const forms = useProviderDetailsForms(providerDetails, isEditMode);
  const certificateTypeOptions = useCertificateOptions(isEditMode);

  const statusBarConfig = buildProviderDetailsStatusBarConfig({
    providerDetails,
    canWrite,
    canVerify,
    hasProviderDetailsChanges: forms.hasProviderDetailsChanges,
    verifyDisabled,
    verifyDisabledTitle,
  });

  const contactViewFields = getContactViewFields(providerDetails);

  const resetAllForms = () => {
    forms.resetProviderForms();
    setIsEditMode(false);
  };

  const { handlePageSave, saving } = useProviderDetailsSave({
    providerDetails,
    forms,
    clinicalSpecialtyOptions: forms.clinicalSpecialtyOptions,
    onRefreshDetails,
    onSaveComplete: () => setIsEditMode(false),
  });

  const handleAppendCertificate = () => {
    appendEmptyCertificateRow(forms.appendCertificateRow);
  };

  const identifierCardProps = {
    providerDetails,
    generalInfoForm: forms.generalInfoForm,
    identifierForm: forms.identifierForm,
    providerOldCodeFields: forms.providerOldCodeFields,
    onRemoveIdentifier: forms.removeIdentifierRow,
  };

  const sharedCardProps = {
    providerDetails,
    providerTypeOptions: forms.providerTypeOptions,
    providerClassOptions: forms.providerClassOptions,
    clinicalSpecialtyOptions: forms.clinicalSpecialtyOptions,
    clinicalSpecialtyOptionsLoading: forms.clinicalSpecialtyOptionsLoading,
    systemOfMedicineOptions: forms.systemOfMedicineOptions,
    systemOfMedicineOptionsLoading: forms.systemOfMedicineOptionsLoading,
  };

  const statusBar = (
    <StatusEditVerifyBar
      providerStatus={statusBarConfig.providerStatus}
      blacklistedByIcs={statusBarConfig.blacklistedByIcs}
      canWrite={statusBarConfig.canWrite}
      canVerify={statusBarConfig.canVerify}
      isEditMode={isEditMode}
      onEdit={() => setIsEditMode(true)}
      onCancel={resetAllForms}
      onSave={handlePageSave}
      saveDisabled={statusBarConfig.saveDisabled || saving}
      saving={saving}
      saveDisabledTitle={statusBarConfig.saveDisabledTitle}
      verifyDisabled={statusBarConfig.verifyDisabled}
      verifyDisabledTitle={statusBarConfig.verifyDisabledTitle}
      auditLog={statusBarConfig.auditLog}
    />
  );

  const providerInformation = (
    <ProviderInformationCard
      {...sharedCardProps}
      generalInfoForm={forms.generalInfoForm}
      isEditMode={isEditMode}
    />
  );
  const identifierDetails = (
    <ProviderIdentifierCard
      {...identifierCardProps}
      providerOldCodeFields={selectByEditMode(
        isEditMode,
        forms.providerOldCodeFields,
        [],
      )}
      isEditMode={isEditMode}
    />
  );
  const addressDetails = (
    <ProviderAddressCard
      providerDetails={providerDetails}
      generalInfoForm={forms.generalInfoForm}
      isEditMode={isEditMode}
    />
  );
  const contactDetails = (
    <ProviderContactCard
      providerDetails={providerDetails}
      contactForm={forms.contactForm}
      contactViewFields={contactViewFields}
      isEditMode={isEditMode}
    />
  );
  const certificates = (
    <ProviderCertificatesCard
      providerDetails={providerDetails}
      isEditMode={isEditMode}
      certDynamicForm={forms.certDynamicForm}
      certEditFields={selectByEditMode(isEditMode, forms.certEditFields, [])}
      certificateTypeOptions={selectByEditMode(
        isEditMode,
        certificateTypeOptions,
        [],
      )}
      onAppendCertificate={selectByEditMode(
        isEditMode,
        handleAppendCertificate,
        () => undefined,
      )}
      onRemoveCertificate={selectByEditMode(
        isEditMode,
        forms.removeCertificateRow,
        () => undefined,
      )}
    />
  );

  if (smAndDown) {
    return (
      <ProviderDetailsMobileView
        providerBarSection={providerBarSection}
        statusBar={statusBar}
        providerInformation={providerInformation}
        identifierDetails={identifierDetails}
        addressDetails={addressDetails}
        contactDetails={contactDetails}
        certificates={certificates}
        isEditMode={isEditMode}
        onAddCertificate={handleAppendCertificate}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden bg-gray-50 p-1">
      {providerBarSection ? (
        <div className="shrink-0">{providerBarSection}</div>
      ) : null}
      <div className="shrink-0">{statusBar}</div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-1">
        <DesktopProviderDetailsColumns
          isEditMode={isEditMode}
          providerInformation={providerInformation}
          identifierDetails={identifierDetails}
          addressDetails={addressDetails}
          contactDetails={contactDetails}
          certificates={certificates}
        />
      </div>
    </div>
  );
}
