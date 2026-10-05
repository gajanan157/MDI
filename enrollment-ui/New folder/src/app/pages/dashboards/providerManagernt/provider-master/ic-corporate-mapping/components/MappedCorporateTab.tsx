import ProviderValidationMessage from "./ValidationMessage";
import { CorporateMapAllDoneSection } from "./CorporateMapAllDoneSection";
import { CorporatePreMapAllSection } from "./CorporatePreMapAllSection";
import { CorporateProviderListHeader } from "./CorporateProviderListHeader";
import { CorporateSelectionUploadCard } from "./CorporateSelectionUploadCard";

type ProviderMappedWithCorporateTabProps = {
  [key: string]: any;
};

export default function ProviderMappedWithCorporateTab(props: ProviderMappedWithCorporateTabProps) {
  const {
    control,
    hasSelection,
    validatedCorporate,
    fileAppliedCorporate,
    setUploadedFileCorporate,
    uploadedFileCorporate,
    handleUpload,
    validating,
    handleValidate,
    openMapAllConfirmPopup,
    mapAllDoneCorporate,
    providerListCardVisibleCorporate,
    setProviderListCardVisibleCorporate,
    providerListExpandedCorporate,
    setProviderListExpandedCorporate,
    alreadyMapped,
    hiddenCardsCorporate,
    existingNetwork,
    nonNetwork,
    newProvider,
    CARD_LIST_MIN_HEIGHT,
    PROVIDER_LIST_LIMIT,
    setSeeMoreDialog,
    seeMoreLabel,
    setDiscountFileCorporate,
    setDiscountAppliedToAllCorporate,
    socUploadedCorporate,
    socFileCorporate,
    setSocFileCorporate,
    handleSocUploadCorporate,
    socAppliedCorporate,
    socEffectiveFromCorporate,
    setSocEffectiveFromCorporate,
    socEffectiveToCorporate,
    setSocEffectiveToCorporate,
    discountUploadedCorporate,
    discountFileCorporate,
    handleDiscountUploadCorporate,
    discountTypeCorporate,
    selectedIcId,
    selectedCorporateId,
    discountAppliedToAllCorporate,
    setSocAppliedCorporate,
    validationErrorCorporate,
    validatedMessageDismissedCorporate,
    setValidatedMessageDismissedCorporate,
  } = props;

  const showValidationMessage =
    (validatedCorporate || validationErrorCorporate) && !validatedMessageDismissedCorporate;

  const socDiscountProps = {
    control,
    socUploadedCorporate,
    socFileCorporate,
    setSocFileCorporate,
    handleSocUploadCorporate,
    socAppliedCorporate,
    socEffectiveFromCorporate,
    setSocEffectiveFromCorporate,
    socEffectiveToCorporate,
    setSocEffectiveToCorporate,
    setSocAppliedCorporate,
    discountUploadedCorporate,
    discountFileCorporate,
    setDiscountFileCorporate,
    handleDiscountUploadCorporate,
    discountTypeCorporate,
    selectedIcId,
    selectedCorporateId,
  };

  return (
    <>
      <CorporateSelectionUploadCard
        control={control}
        selectedIcId={selectedIcId}
        hasSelection={hasSelection}
        validatedCorporate={validatedCorporate}
        fileAppliedCorporate={fileAppliedCorporate}
        uploadedFileCorporate={uploadedFileCorporate}
        setUploadedFileCorporate={setUploadedFileCorporate}
        handleUpload={handleUpload}
        validating={validating}
        handleValidate={handleValidate}
      />

      {validatedCorporate ? (
        <div className="space-y-4">
          <CorporateProviderListHeader
            mapAllDoneCorporate={mapAllDoneCorporate}
            providerListCardVisibleCorporate={providerListCardVisibleCorporate}
            setProviderListCardVisibleCorporate={setProviderListCardVisibleCorporate}
            openMapAllConfirmPopup={openMapAllConfirmPopup}
          />

          {mapAllDoneCorporate ? (
            <CorporateMapAllDoneSection
              providerListCardVisibleCorporate={providerListCardVisibleCorporate}
              providerListExpandedCorporate={providerListExpandedCorporate}
              setProviderListExpandedCorporate={setProviderListExpandedCorporate}
              alreadyMapped={alreadyMapped}
              providerListLimit={PROVIDER_LIST_LIMIT}
              setSeeMoreDialog={setSeeMoreDialog}
              seeMoreLabel={seeMoreLabel}
              {...socDiscountProps}
            />
          ) : (
            <CorporatePreMapAllSection
              hiddenCardsCorporate={hiddenCardsCorporate}
              alreadyMapped={alreadyMapped}
              existingNetwork={existingNetwork}
              nonNetwork={nonNetwork}
              newProvider={newProvider}
              cardListMinHeight={CARD_LIST_MIN_HEIGHT}
              providerListLimit={PROVIDER_LIST_LIMIT}
              setSeeMoreDialog={setSeeMoreDialog}
              seeMoreLabel={seeMoreLabel}
              discountAppliedToAllCorporate={discountAppliedToAllCorporate}
              setDiscountAppliedToAllCorporate={setDiscountAppliedToAllCorporate}
              {...socDiscountProps}
            />
          )}
        </div>
      ) : null}

      {showValidationMessage ? (
        <ProviderValidationMessage
          error={validationErrorCorporate}
          onDismiss={() => setValidatedMessageDismissedCorporate(true)}
        />
      ) : null}
    </>
  );
}
