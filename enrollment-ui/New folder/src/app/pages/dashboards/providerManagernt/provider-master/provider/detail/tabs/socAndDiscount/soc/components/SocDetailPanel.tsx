import type { SocVersionItem } from "../data/socListData";
import { SOC_DETAIL_PANEL_CLASS } from "../utils/socDetailTheme";
import type { SocDetailPanelProps } from "../types/socDetailPanelTypes";
import { SocTabContent } from "./SocTabContent";

export type { SocVersionItem } from "../data/socListData";
export type { DiscountFormValues } from "../types/socDiscountTypes";
export type { SocDetailPanelProps } from "../types/socDetailPanelTypes";

export function SocDetailPanel({
  socForm,
  isSocViewMode,
  agreementName,
  setAgreementName,
  applyAgreementNameFromNavigation,
  providerId,
  agreementNameDisabled = false,
  socLastUpdatedOn,
  setSocLastUpdatedOn,
  socStartDate,
  setSocStartDate,
  socEndDate,
  setSocEndDate,
  socFileInputRef,
  pendingSocDocumentFile,
  isSavingSocDocument,
  onSocFileSelect,
  onClearPendingSocDocument,
  socVersionHistory,
  setSelectedSocPdfUrl,
  socSideBySide = true,
  gipsaSocVariant,
  onGipsaSocVariantChange,
  isCorporateSoc,
  onIsCorporateSocChange,
  selectedCorporateInsurerId,
  onSelectedCorporateInsurerIdChange,
  onDetailsInsurerChange,
  agreementInsurerMappings = [],
  lockApplicableIcsFromAgreement = false,
  selectedCorporates,
  onSelectedCorporatesChange,
  selectedApplicableIcIds,
  onSelectedApplicableIcIdsChange,
  applicableIcs,
  applicableIcsSummary,
  insurerMultiSelectOptions = [],
  psuInsurerOptions = [],
  insurerOptionsLoading = false,
  canWrite,
}: Readonly<SocDetailPanelProps>) {
  const selectedSocVersionId = socForm.watch("socVersionId");

  const handleSetActiveSocVersion = (item: SocVersionItem) => {
    if (isSocViewMode) return;
    socForm.setValue("socVersionId", item.id);
    setSelectedSocPdfUrl(item.url);
  };

  const handlePreviewSocVersion = (item: SocVersionItem) => {
    setSelectedSocPdfUrl(item.url);
  };

  return (
    <div className={SOC_DETAIL_PANEL_CLASS}>
      <SocTabContent
        socForm={socForm}
        isSocViewMode={isSocViewMode}
        socSideBySide={socSideBySide}
        agreementName={agreementName}
        setAgreementName={setAgreementName}
        applyAgreementNameFromNavigation={applyAgreementNameFromNavigation}
        providerId={providerId}
        agreementNameDisabled={agreementNameDisabled}
        gipsaSocVariant={gipsaSocVariant}
        onGipsaSocVariantChange={onGipsaSocVariantChange}
        isCorporateSoc={isCorporateSoc}
        onIsCorporateSocChange={onIsCorporateSocChange}
        selectedCorporateInsurerId={selectedCorporateInsurerId}
        onSelectedCorporateInsurerIdChange={onSelectedCorporateInsurerIdChange}
        onDetailsInsurerChange={onDetailsInsurerChange}
        agreementInsurerMappings={agreementInsurerMappings}
        lockApplicableIcsFromAgreement={lockApplicableIcsFromAgreement}
        selectedCorporates={selectedCorporates}
        onSelectedCorporatesChange={onSelectedCorporatesChange}
        socLastUpdatedOn={socLastUpdatedOn}
        setSocLastUpdatedOn={setSocLastUpdatedOn}
        socStartDate={socStartDate}
        setSocStartDate={setSocStartDate}
        socEndDate={socEndDate}
        setSocEndDate={setSocEndDate}
        socFileInputRef={socFileInputRef}
        pendingSocDocumentFile={pendingSocDocumentFile}
        isSavingSocDocument={isSavingSocDocument}
        onSocFileSelect={onSocFileSelect}
        onClearPendingSocDocument={onClearPendingSocDocument}
        socVersionHistory={socVersionHistory}
        selectedSocVersionId={selectedSocVersionId}
        onSetActiveSocVersion={handleSetActiveSocVersion}
        onPreviewSocVersion={handlePreviewSocVersion}
        canWrite={canWrite}
        selectedApplicableIcIds={selectedApplicableIcIds}
        onSelectedApplicableIcIdsChange={onSelectedApplicableIcIdsChange}
        applicableIcsSummary={applicableIcsSummary}
        applicableIcs={applicableIcs}
        insurerMultiSelectOptions={insurerMultiSelectOptions}
        psuInsurerOptions={psuInsurerOptions}
        insurerOptionsLoading={insurerOptionsLoading}
      />
    </div>
  );
}
