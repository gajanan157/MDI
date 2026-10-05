import type { ReactNode } from "react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import type { IcCorporateMappingTabProps } from "./types";
import { IcMappingCreateForm } from "./mapping/Form";
import { isIcMappingSaveDisabled } from "./mapping/Form.helpers";
import { IcMappingSubTabBar } from "./mapping/List";
import { IcRestrictionCreateForm } from "./restriction/Form";
import { RestrictionListPage } from "./restriction/List";
import { RestrictionContextHeader } from "./restriction/List";
import { RestrictionFormToolbar, RestrictionListToolbar } from "./restriction/List";
import { MappingResultsPanel } from "./mapping/List";
import { MappingFormToolbar, MappingToolbar } from "./mapping/List";
import { MappingUnmapDialog } from "./mapping/Dialogs";
import { MappingViewDialog } from "./mapping/Dialogs";
import { BankMatchCompareModal } from "./mapping/BankMatchCompareModal";
import { useIcMappingTabOrchestrator } from "./useTab";

export function IcCorporateMappingTab({
  providerId: providerIdProp,
  providerBarSection,
  mappingSubTab,
  setMappingSubTab,
  canWrite,
  canVerify = false,
  verifyDisabled = false,
  verifyDisabledTitle,
  hospital,
  mappingSearchOpen,
  toggleMappingSearch,
  mappingSearchFields,
  onMappingSearch,
  filteredMappedForGrid,
  hasMappingListData,
  mappingPage,
  mappingPageSize,
  mappingTotalItems,
  onMappingPageChange,
  onMappingPageSizeChange,
  mappingGridColumnDefs,
  onMappingView,
  onMappingRestrictionAction,
  onMappingUnmap,
  onOpenPendingAgreement,
  onCompareBankMatch,
  icNetworkMappingLoading = false,
  mappingViewItem,
  setMappingViewItem,
  icMappingDetail,
  closeIcMappingDetail,
  setIcMappingDetailEditing,
  setIcMappingDetailLoading,
  hydrateIcMappingDetailItem,
  unmapDialogOpen,
  unmapDialogItem,
  unmapEffectiveFrom,
  setUnmapEffectiveFrom,
  unmapEffectiveFromError,
  unmapRemark,
  setUnmapRemark,
  unmapRemarkError,
  unmapSupportingFileName,
  setUnmapSupportingFileMetadataId,
  clearUnmapSupportingDocument,
  unmapSupportingDocumentError,
  setUnmapSupportingDocumentError,
  unmapSaving,
  closeUnmapDialog,
  onUnmapSave,
  icMappingCreateMode,
  setIcMappingCreateMode,
  restrictionCreateMode,
  setRestrictionCreateMode,
  onIcMappingSaved,
  onRestrictionSaved,
  restrictionPrefillInsurerId = "",
  restrictionPrefillCorporateId = "",
  restrictionDetail,
  closeRestrictionDetail,
  setRestrictionDetailEditing,
  setRestrictionDetailLoading,
  setRestrictionContextEntityId,
  clearRestrictionPrefill,
  bindRestrictionNavigation,
  restrictionListActive,
  restrictionListCreateActive,
  restrictionListItem,
  restrictionListRows,
  restrictionListLoading,
  restrictionListError,
  handleRestrictionListAdd,
  handleRestrictionListView,
  restrictionSearchOpen,
  toggleRestrictionSearch,
  restrictionSearchFields,
  handleRestrictionSearch,
  bankMatchCompareOpen = false,
  bankMatchCompareItem = null,
  closeBankMatchCompare,
  navigateToProviderBankDetails,
}: Readonly<IcCorporateMappingTabProps>) {
  const {
    providerId,
    insurerOptions,
    insuranceCompanies,
    corporateList,
    restriction,
    icMapping,
    networkModeLoading,
    insurerListLoading,
    icProviderCodeLoading,
    icPrefilledFromRow,
    icMappingSaving,
    showRestrictionForm,
    showMappingForm,
    showCorporateCreateForm,
    showIcCreateForm,
    showRestrictionListSection,
    listVisible,
    restrictionRemoveConfirmOpen,
    setRestrictionRemoveConfirmOpen,
    restrictionRemoveConfirmState,
    setRestrictionRemoveConfirmState,
    restrictionRemoveConfirmMessages,
    restrictionRemoveConfirmLoading,
    closeRestrictionRemoveConfirm,
    handleRestrictionRemoveConfirm,
    handleCloseRestrictionForm,
    handleCloseIcMappingForm,
    handleCloseIcMappingDetail,
    handleIcMappingEdit,
    handleIcMappingSave,
    handleStartNewMapping,
  } = useIcMappingTabOrchestrator({
    providerId: providerIdProp,
    mappingSubTab,
    hospital,
    mappingSearchOpen,
    restrictionSearchOpen,
    icMappingDetail,
    closeIcMappingDetail,
    setIcMappingCreateMode,
    icMappingCreateMode,
    setIcMappingDetailEditing,
    setIcMappingDetailLoading,
    hydrateIcMappingDetailItem,
    restrictionCreateMode,
    setRestrictionCreateMode,
    restrictionDetail,
    closeRestrictionDetail,
    setRestrictionDetailEditing,
    setRestrictionDetailLoading,
    setRestrictionContextEntityId,
    clearRestrictionPrefill,
    bindRestrictionNavigation,
    restrictionPrefillInsurerId,
    restrictionPrefillCorporateId,
    restrictionListActive,
    restrictionListCreateActive,
    hasMappingListData,
    onIcMappingSaved,
    onRestrictionSaved,
  });

  const hasRestrictionRows = restrictionListRows.length > 0;

  const showCreateForm = mappingSubTab === "ic" ? showIcCreateForm : showCorporateCreateForm;

  const mappingFormSaveDisabled = isIcMappingSaveDisabled(
    icMapping.icMappingForm,
    mappingSubTab,
    Boolean(icMappingDetail),
    icMappingSaving,
    icMappingDetail?.detailLoading ?? false,
    networkModeLoading,
  );

  const toolbar = (() => {
    if (showRestrictionForm) {
      return (
        <RestrictionFormToolbar
          providerId={providerId ?? hospital?.id}
          isExistingRestriction={Boolean(restrictionDetail)}
          isViewMode={restrictionDetail ? !restrictionDetail.editing : false}
          canWrite={canWrite}
          onEdit={() => setRestrictionDetailEditing(true)}
          onCancel={handleCloseRestrictionForm}
          onSave={restriction.handleRestrictionSave}
          onRemove={() => setRestrictionRemoveConfirmOpen(true)}
          saving={restriction.restrictionSaving}
          removing={restriction.restrictionRemoving}
          saveDisabled={restriction.restrictionSaveDisabled}
        />
      );
    }
    if (showRestrictionListSection) {
      return (
        <RestrictionListToolbar
          canWrite={canWrite}
          providerId={providerId ?? hospital?.id}
          restrictionSearchOpen={restrictionSearchOpen}
          showSearch={restrictionListActive && !restrictionCreateMode && hasRestrictionRows}
          showAddRestriction={restrictionListActive && !restrictionCreateMode}
          toggleRestrictionSearch={toggleRestrictionSearch}
          onAddRestriction={handleRestrictionListAdd}
        />
      );
    }
    if (showMappingForm && icMappingDetail) {
      return (
        <MappingFormToolbar
          providerId={providerId ?? hospital?.id}
          isExistingMapping
          isViewMode={!icMappingDetail.editing}
          canWrite={canWrite}
          canVerify={canVerify}
          verifyDisabled={verifyDisabled}
          verifyDisabledTitle={verifyDisabledTitle}
          onEdit={handleIcMappingEdit}
          onCancel={handleCloseIcMappingDetail}
          onSave={handleIcMappingSave}
          saving={icMappingSaving}
          detailLoading={icMappingDetail.detailLoading}
          saveDisabled={mappingFormSaveDisabled}
        />
      );
    }
    if (showCreateForm) {
      return (
        <MappingFormToolbar
          providerId={providerId ?? hospital?.id}
          onCancel={handleCloseIcMappingForm}
          onSave={handleIcMappingSave}
          saving={icMappingSaving}
          canWrite={canWrite}
          saveDisabled={mappingFormSaveDisabled}
        />
      );
    }
    return (
      <MappingToolbar
        canWrite={canWrite}
        canVerify={canVerify}
        verifyDisabled={verifyDisabled}
        verifyDisabledTitle={verifyDisabledTitle}
        providerId={providerId ?? hospital?.id}
        mappingSubTab={mappingSubTab}
        mappingSearchOpen={mappingSearchOpen}
        showSearch={listVisible && hasMappingListData}
        toggleMappingSearch={toggleMappingSearch}
        setIcMappingCreateMode={handleStartNewMapping}
      />
    );
  })();

  const resultsPanel = (
    <MappingResultsPanel
      mappingSubTab={mappingSubTab}
      mappingSearchOpen={mappingSearchOpen}
      mappingSearchFields={mappingSearchFields}
      onMappingSearch={onMappingSearch}
      toggleMappingSearch={toggleMappingSearch}
      filteredMappedForGrid={filteredMappedForGrid}
      mappingGridColumnDefs={mappingGridColumnDefs}
      loading={icNetworkMappingLoading}
      page={mappingPage}
      pageSize={mappingPageSize}
      totalItems={mappingTotalItems}
      onPageChange={onMappingPageChange}
      onPageSizeChange={onMappingPageSizeChange}
      canWrite={canWrite}
      onView={onMappingView}
      onRestrictionAction={onMappingRestrictionAction}
      onUnmap={onMappingUnmap}
      onOpenPendingAgreement={onOpenPendingAgreement}
      onCompareBankMatch={onCompareBankMatch}
    />
  );

  const mappingTabBodyContent = ((): ReactNode => {
    if (showRestrictionForm) {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          {showRestrictionListSection && !restrictionDetail ? (
            <RestrictionContextHeader
              mappingSubTab={mappingSubTab}
              entityName={restrictionListItem?.name?.trim() || "—"}
            />
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto p-1">
            <IcRestrictionCreateForm
              providerId={providerId}
              restrictionForm={restriction.restrictionForm}
              restrictionFormErrors={restriction.restrictionFormErrors}
              restrictionDetails={restriction.restrictionDetails}
              setRestrictionDetails={restriction.setRestrictionDetails}
              effectiveFromError={restriction.effectiveFromError}
              setEffectiveFromError={restriction.setEffectiveFromError}
              remarkError={restriction.remarkError}
              setRemarkError={restriction.setRemarkError}
              supportingDocumentError={restriction.supportingDocumentError}
              setSupportingDocumentError={restriction.setSupportingDocumentError}
              insurerOptions={insurerOptions}
              insuranceCompanies={insuranceCompanies}
              selectedIcId={restriction.selectedIcId}
              selectedRestrictionLevel={restriction.selectedRestrictionLevel}
              selectedRestrictionType={restriction.selectedRestrictionType}
              showRestrictionType={restriction.showRestrictionType}
              showBlacklistCheckboxes={restriction.showBlacklistCheckboxes}
              showCorporateDropdown={restriction.showCorporateDropdown}
              showRohDropdown={restriction.showRohDropdown}
              showPolicyNumbersField={restriction.showPolicyNumbersField}
              showCcnNumbersField={restriction.showCcnNumbersField}
              applicableDisabled={restriction.applicableDisabled}
              restrictionApplicableOptions={restriction.restrictionApplicableOptions}
              applicableError={restriction.applicableError}
              corporateList={restriction.restrictionCorporateList}
              rohOfficeOptions={restriction.rohOfficeOptions}
              icPrefilledFromRow={icPrefilledFromRow}
              isExistingRestriction={Boolean(restrictionDetail)}
              isViewMode={restrictionDetail ? !restrictionDetail.editing : false}
              saving={restriction.restrictionSaving}
              removing={restriction.restrictionRemoving}
            />
          </div>
        </div>
      );
    }
    if (showMappingForm && icMappingDetail) {
      return (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <IcMappingCreateForm
            providerId={providerId}
            mappingVariant={mappingSubTab}
            icMappingForm={icMapping.icMappingForm}
            setIcMappingForm={icMapping.setIcMappingForm}
            icMappingSelectForm={icMapping.icMappingSelectForm}
            icMappingMetaSelectForm={icMapping.icMappingMetaSelectForm}
            icMappingDateOrderError={icMapping.icMappingDateOrderError}
            setIcMappingDateOrderError={icMapping.setIcMappingDateOrderError}
            showFieldErrors={icMapping.icMappingShowFieldErrors}
            insuranceCompanies={insuranceCompanies}
            corporateList={mappingSubTab === "corporate" ? corporateList : undefined}
            networkModeLoading={networkModeLoading || icMappingDetail.detailLoading}
            insurerListLoading={insurerListLoading}
            icProviderCodeLoading={icProviderCodeLoading}
            isViewMode={!icMappingDetail.editing}
            isExistingMapping
            saving={icMappingSaving}
            detailLoading={icMappingDetail.detailLoading}
          />
        </div>
      );
    }
    if (restrictionListActive) {
      return (
        <RestrictionListPage
          mappingSubTab={mappingSubTab}
          mappingItem={restrictionListItem}
          rows={restrictionListRows}
          loading={restrictionListLoading}
          errorMessage={restrictionListError}
          restrictionSearchOpen={restrictionSearchOpen}
          restrictionSearchFields={restrictionSearchFields}
          onRestrictionSearch={handleRestrictionSearch}
          toggleRestrictionSearch={toggleRestrictionSearch}
          onView={handleRestrictionListView}
        />
      );
    }
    if (showCreateForm) {
      return (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <IcMappingCreateForm
            providerId={providerId}
            mappingVariant={mappingSubTab}
            icMappingForm={icMapping.icMappingForm}
            setIcMappingForm={icMapping.setIcMappingForm}
            icMappingSelectForm={icMapping.icMappingSelectForm}
            icMappingMetaSelectForm={icMapping.icMappingMetaSelectForm}
            icMappingDateOrderError={icMapping.icMappingDateOrderError}
            setIcMappingDateOrderError={icMapping.setIcMappingDateOrderError}
            showFieldErrors={icMapping.icMappingShowFieldErrors}
            insuranceCompanies={insuranceCompanies}
            corporateList={mappingSubTab === "corporate" ? corporateList : undefined}
            networkModeLoading={networkModeLoading}
            insurerListLoading={insurerListLoading}
            icProviderCodeLoading={icProviderCodeLoading}
            saving={icMappingSaving}
          />
        </div>
      );
    }
    return resultsPanel;
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 bg-gray-50 p-1">
      {providerBarSection}

      <IcMappingSubTabBar
        mappingSubTab={mappingSubTab}
        setMappingSubTab={setMappingSubTab}
        toolbar={toolbar}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-1 px-1 py-0.5">
        <div className="flex min-h-0 flex-1 flex-col gap-1">{mappingTabBodyContent}</div>
      </div>

      <MappingViewDialog
        mappingSubTab={mappingSubTab}
        mappingViewItem={mappingViewItem}
        onClose={() => setMappingViewItem(null)}
      />

      <MappingUnmapDialog
        open={unmapDialogOpen}
        providerId={providerId}
        mappingSubTab={mappingSubTab}
        unmapDialogItem={unmapDialogItem}
        unmapEffectiveFrom={unmapEffectiveFrom}
        setUnmapEffectiveFrom={setUnmapEffectiveFrom}
        unmapEffectiveFromError={unmapEffectiveFromError}
        unmapRemark={unmapRemark}
        setUnmapRemark={setUnmapRemark}
        unmapRemarkError={unmapRemarkError}
        unmapSupportingFileName={unmapSupportingFileName}
        setUnmapSupportingFileMetadataId={setUnmapSupportingFileMetadataId}
        clearUnmapSupportingDocument={clearUnmapSupportingDocument}
        unmapSupportingDocumentError={unmapSupportingDocumentError}
        onClearUnmapSupportingDocumentError={() => setUnmapSupportingDocumentError?.("")}
        saving={unmapSaving}
        onClose={closeUnmapDialog}
        onSave={() => { onUnmapSave(); }}
      />

      <BankMatchCompareModal
        open={bankMatchCompareOpen}
        providerId={providerId}
        mappingItem={bankMatchCompareItem}
        onClose={() => closeBankMatchCompare?.()}
        onRequestUpdate={navigateToProviderBankDetails}
      />

      <ConfirmModal
        show={restrictionRemoveConfirmOpen}
        onClose={closeRestrictionRemoveConfirm}
        messages={restrictionRemoveConfirmMessages}
        onOk={() => {
          if (restrictionRemoveConfirmState === "error") {
            setRestrictionRemoveConfirmState("pending");
            return;
          }
          handleRestrictionRemoveConfirm();
        }}
        confirmLoading={restrictionRemoveConfirmLoading}
        state={restrictionRemoveConfirmState}
      />
    </div>
  );
}
