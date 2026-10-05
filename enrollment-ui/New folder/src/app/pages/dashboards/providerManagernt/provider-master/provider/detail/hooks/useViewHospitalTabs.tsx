import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import {
    AgreementTab,
    BankDetailsTab,
    DocumentsTab,
    IcCorporateMappingTab,
    InfrastructureAndFacilityTab,
    OwnerInfoTab,
    ProviderDetailsTab,
    ProviderOwnerTab,
    SocAndDiscountTab,
    DiscountTab,
} from "../tabs";
import { ViewHospitalDetailPlaceholder } from "../components/ViewHospitalDetailPlaceholder";
import {
    AGREEMENT_SAMPLE_PDF_URL,
    DOCUMENT_LIST,
    DOCUMENT_SAMPLE_FILES,
    NETWORK_ONLY_PROVIDER_TAB_IDS,
} from "../utils/viewHospitalConfig";
import { getViewHospitalMainTabs } from "../../../../shared/providerMasterI18n";
import { getAgreementViewMode } from "../utils/viewHospitalTabHelpers";
import type { ViewHospitalPageContext } from "./useViewHospitalPage";

function isNonNetworkProviderType(value: string | null | undefined): boolean {
    const normalized = String(value ?? "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
    return normalized.includes("NON_NETWORK") || normalized === "NONNETWORK";
}

export function useViewHospitalTabs(ctx: ViewHospitalPageContext) {
    const { t } = useTranslation();
    const mainTabs = useMemo(() => getViewHospitalMainTabs(t), [t]);
    const {
        id,
        navigate,
        canWrite,
        canWriteBankDetails,
        canVerifyBankDetails,
        canWriteDiscount,
        canVerifyDiscount,
        canVerifyProvider,
        isNetworkRoute,
        isNonNetwork,
        isNewAgreementRoute,
        agreementUrlKey,
        agreementUrlSuffix,
        socUrlKey,
        socUrlSuffix,
        discountUrlKey,
        discountUrlSuffix,
        ownerUrlKey,
        ownerUrlSuffix,
        infrastructureData,
        infrastructureLoading,
        infrastructureSaving,
        manpowerData,
        manpowerLoading,
        manpowerSaving,
        facilityData,
        facilityLoading,
        facilitySaving,
        providerData,
        agreementState,
        contactHandlers,
        handleBankDetailsSave,
        handleInfrastructureSave,
        handleManpowerSave,
        handleFacilitySave,
        icMappingState,
        tabNav,
        providerBarSection,
        tabStatusBar,
        verifyProps,
        bankVerifyProps,
        discountVerifyProps,
        providersListPath,
    } = ctx;

    const detailPlaceholderContent = useMemo(
        () => (
            <ViewHospitalDetailPlaceholder
                providerBarSection={providerBarSection}
                placeholderBarStatus={tabStatusBar.providerStatus}
                placeholderBarIcs={tabStatusBar.blacklistedByIcs}
                canWrite={canWrite}
                networkDetailVerifyDisabled={verifyProps.verifyDisabled}
                networkDetailVerifyDisabledTitle={verifyProps.verifyDisabledTitle}
                detailLoading={providerData.detailLoading}
                isNetworkRoute={isNetworkRoute}
                detailLoadError={providerData.detailLoadError}
                onBackToList={() => navigate(providersListPath)}
            />
        ),
        [
            providerBarSection,
            tabStatusBar.providerStatus,
            tabStatusBar.blacklistedByIcs,
            canWrite,
            verifyProps.verifyDisabled,
            verifyProps.verifyDisabledTitle,
            providerData.detailLoading,
            providerData.detailLoadError,
            isNetworkRoute,
            navigate,
            providersListPath,
        ],
    );

    return useMemo(() => {
        const detailsNetworkType = providerData.providerDetailsFields?.providerNetworkType;
        const blockNetworkOnlyTabs =
            detailsNetworkType != null && String(detailsNetworkType).trim() !== ""
                ? isNonNetworkProviderType(detailsNetworkType)
                : isNonNetwork;

        const blockedTabContent = (
            <div className="flex min-h-0 flex-1 flex-col gap-1 p-1">
                {providerBarSection}
                <div className="flex flex-1 items-center justify-center p-6">
                    <div
                        className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white px-6 py-10 text-center shadow-sm"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                            <NoSymbolIcon className="h-6 w-6" aria-hidden />
                        </div>
                        <h3 className="text-base font-semibold text-amber-950">
                            {t("providerMaster.network.nonNetwork")}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-amber-900/80">
                            {t("providerMaster.nonNetworkTabBlocked")}
                        </p>
                    </div>
                </div>
            </div>
        );

        if (!providerData.providerProfile) {
            return mainTabs.map((tab) => {
                const blocked = blockNetworkOnlyTabs && NETWORK_ONLY_PROVIDER_TAB_IDS.has(tab.id);
                return {
                    ...tab,
                    disabled: blocked,
                    content: blocked ? blockedTabContent : detailPlaceholderContent,
                };
            });
        }

        const hospitalDetailsTab = (
            <ProviderDetailsTab
                providerDetails={providerData.providerDetailsFields}
                canWrite={canWrite}
                canVerify={canVerifyProvider}
                onRefreshDetails={providerData.refreshProviderDetails}
                providerBarSection={providerBarSection}
                {...verifyProps}
            />
        );

        const infrastructureAndFacilityTab = (
            <InfrastructureAndFacilityTab
                providerId={id}
                hospital={providerData.providerProfile}
                infrastructure={infrastructureData}
                manpower={manpowerData}
                facility={facilityData}
                loading={infrastructureLoading}
                saving={infrastructureSaving}
                manpowerLoading={manpowerLoading}
                manpowerSaving={manpowerSaving}
                facilityLoading={facilityLoading}
                facilitySaving={facilitySaving}
                canWrite={canWrite}
                canVerify={canVerifyProvider}
                providerBarSection={providerBarSection}
                onSave={handleInfrastructureSave}
                onSaveManpower={handleManpowerSave}
                onSaveFacility={handleFacilitySave}
                {...verifyProps}
            />
        );

        const providerOwnerTab = (
            <ProviderOwnerTab
                providerId={id}
                hospital={providerData.providerProfile}
                canWrite={canWrite}
                canVerify={canVerifyProvider}
                providerBarSection={providerBarSection}
                ownerUrlKey={ownerUrlKey}
                ownerUrlSuffix={ownerUrlSuffix}
                {...verifyProps}
            />
        );

        const ownersInfoTab = (
            <OwnerInfoTab
                hospital={providerData.providerProfile}
                providerId={id}
                canWrite={canWrite}
                canVerify={canVerifyProvider}
                providerBarSection={providerBarSection}
                isLoadingApiData={providerData.lazyOwnerLoading}
                contactPersonOwnerNotFound={providerData.ownerContactOwnerNotFound}
                contactPersonNotFoundMessage={providerData.ownerContactNotFoundMessage}
                onRefreshContactPersons={contactHandlers.refreshContactPersons}
                onSaveContactPersons={contactHandlers.saveContactPersons}
                onDeleteContactPerson={contactHandlers.deleteContactPerson}
                {...verifyProps}
            />
        );

        const icCorporateMappingTab = (
            <IcCorporateMappingTab
                providerId={id}
                providerBarSection={providerBarSection}
                hospital={providerData.providerProfile}
                mappingSubTab={icMappingState.mappingSubTab}
                setMappingSubTab={icMappingState.setMappingSubTab}
                canWrite={canWrite}
                canVerify={canVerifyProvider}
                {...verifyProps}
                mappingSearchOpen={icMappingState.mappingSearchOpen}
                toggleMappingSearch={icMappingState.toggleMappingSearch}
                mappingSearchFields={icMappingState.mappingSearchFields}
                onMappingSearch={icMappingState.handleMappingSearch}
                filteredMappedForGrid={icMappingState.filteredMappedForGrid}
                hasMappingListData={icMappingState.hasMappingListData}
                mappingPage={icMappingState.mappingPage}
                mappingPageSize={icMappingState.mappingPageSize}
                mappingTotalItems={icMappingState.mappingTotalItems}
                onMappingPageChange={icMappingState.handleMappingPageChange}
                onMappingPageSizeChange={icMappingState.handleMappingPageSizeChange}
                mappingGridColumnDefs={icMappingState.mappingGridColumnDefs}
                onMappingView={icMappingState.onMappingView}
                onMappingRestrictionAction={icMappingState.onMappingRestrictionAction}
                onMappingUnmap={icMappingState.onMappingUnmap}
                onOpenPendingAgreement={icMappingState.onOpenPendingAgreement}
                onCompareBankMatch={icMappingState.onCompareBankMatch}
                icNetworkMappingLoading={icMappingState.icNetworkMappingLoading}
                mappingViewItem={icMappingState.mappingViewItem}
                setMappingViewItem={icMappingState.setMappingViewItem}
                icMappingDetail={icMappingState.icMappingDetail}
                closeIcMappingDetail={icMappingState.closeIcMappingDetail}
                setIcMappingDetailEditing={icMappingState.setIcMappingDetailEditing}
                setIcMappingDetailLoading={icMappingState.setIcMappingDetailLoading}
                hydrateIcMappingDetailItem={icMappingState.hydrateIcMappingDetailItem}
                unmapDialogOpen={icMappingState.unmapDialogOpen}
                setUnmapDialogOpen={icMappingState.setUnmapDialogOpen}
                unmapDialogItem={icMappingState.unmapDialogItem}
                unmapEffectiveFrom={icMappingState.unmapEffectiveFrom}
                setUnmapEffectiveFrom={icMappingState.setUnmapEffectiveFrom}
                unmapEffectiveFromError={icMappingState.unmapEffectiveFromError}
                unmapRemark={icMappingState.unmapRemark}
                setUnmapRemark={icMappingState.setUnmapRemark}
                unmapRemarkError={icMappingState.unmapRemarkError}
                unmapSupportingFileName={icMappingState.unmapSupportingFileName}
                setUnmapSupportingFileMetadataId={icMappingState.setUnmapSupportingFileMetadataId}
                clearUnmapSupportingDocument={icMappingState.clearUnmapSupportingDocument}
                unmapSupportingDocumentError={icMappingState.unmapSupportingDocumentError}
                setUnmapSupportingDocumentError={icMappingState.setUnmapSupportingDocumentError}
                unmapSaving={icMappingState.unmapSaving}
                closeUnmapDialog={icMappingState.closeUnmapDialog}
                onUnmapSave={async () => {
                    const saved = await icMappingState.handleUnmapSave();
                    if (saved) {
                        await providerData.refreshProviderDetails();
                    }
                }}
                icMappingCreateMode={tabNav.icMappingCreateMode}
                setIcMappingCreateMode={tabNav.setIcMappingCreateMode}
                restrictionCreateMode={tabNav.restrictionCreateMode}
                setRestrictionCreateMode={tabNav.setRestrictionCreateMode}
                onIcMappingSaved={async () => {
                    await icMappingState.reloadIcNetworkMapping();
                    await providerData.refreshProviderDetails();
                }}
                onRestrictionSaved={icMappingState.reloadIcNetworkMapping}
                restrictionPrefillInsurerId={icMappingState.restrictionPrefillInsurerId}
                restrictionPrefillCorporateId={icMappingState.restrictionPrefillCorporateId}
                restrictionPrefillRestrictionId={icMappingState.restrictionPrefillRestrictionId}
                restrictionDetail={icMappingState.restrictionDetail}
                closeRestrictionDetail={icMappingState.closeRestrictionDetail}
                setRestrictionDetailEditing={icMappingState.setRestrictionDetailEditing}
                setRestrictionDetailLoading={icMappingState.setRestrictionDetailLoading}
                setRestrictionContextEntityId={icMappingState.setRestrictionContextEntityId}
                clearRestrictionPrefill={icMappingState.clearRestrictionPrefill}
                bindRestrictionNavigation={icMappingState.bindRestrictionNavigation}
                restrictionListActive={icMappingState.restrictionListActive}
                restrictionListCreateActive={icMappingState.restrictionListCreateActive}
                restrictionListItem={icMappingState.restrictionListItem}
                restrictionListRows={icMappingState.restrictionListRows}
                restrictionListLoading={icMappingState.restrictionListLoading}
                restrictionListError={icMappingState.restrictionListError}
                closeRestrictionListPage={icMappingState.closeRestrictionListPage}
                handleRestrictionListAdd={icMappingState.handleRestrictionListAdd}
                handleRestrictionListView={icMappingState.handleRestrictionListView}
                restrictionSearchOpen={icMappingState.restrictionSearchOpen}
                toggleRestrictionSearch={icMappingState.toggleRestrictionSearch}
                restrictionSearchFields={icMappingState.restrictionSearchFields}
                handleRestrictionSearch={icMappingState.handleRestrictionSearch}
                bankMatchCompareOpen={icMappingState.bankMatchCompareOpen}
                bankMatchCompareItem={icMappingState.bankMatchCompareItem}
                closeBankMatchCompare={icMappingState.closeBankMatchCompare}
                navigateToProviderBankDetails={icMappingState.navigateToProviderBankDetails}
            />
        );

        const bankDetailsTab = (
            <BankDetailsTab
                hospital={providerData.hospital}
                bankFieldsFromApi={providerData.bankTabFields}
                canWrite={canWriteBankDetails}
                canVerify={canVerifyBankDetails}
                providerBarSection={providerBarSection}
                isLoadingApiData={providerData.lazyBankLoading}
                isRefreshingDocuments={providerData.isBankDocumentsRefreshing}
                onSaveBankDetails={handleBankDetailsSave}
                onDocumentUploaded={() => {
                    if (id) providerData.pollBankTabFields(id);
                }}
                {...bankVerifyProps}
            />
        );

        const documentsTab = (
            <DocumentsTab
                canVerify={canVerifyProvider}
                providerBarSection={providerBarSection}
                documentList={DOCUMENT_LIST}
                documentSampleFiles={DOCUMENT_SAMPLE_FILES}
                hospital={providerData.hospital}
                canWrite={canWrite}
                {...verifyProps}
            />
        );

        const agreementTab = (
            <AgreementTab
                hospital={providerData.hospital}
                canWrite={canWrite}
                canVerify={canVerifyProvider}
                providerBarSection={providerBarSection}
                providerBasePath={tabNav.providerBasePath}
                agreementUrlKey={agreementUrlKey}
                agreementUrlSuffix={agreementUrlSuffix}
                isAgreementViewMode={getAgreementViewMode(
                    agreementUrlSuffix,
                    agreementState.isAgreementViewMode,
                )}
                onEdit={agreementState.handleAgreementEdit}
                onCancel={agreementState.handleAgreementCancel}
                onSave={agreementState.handleAgreementSave}
                agreementForm={agreementState.agreementForm}
                agreementPdfUrl={agreementState.agreementPdfUrl}
                agreementSamplePdfUrl={AGREEMENT_SAMPLE_PDF_URL}
                onAgreementFileChange={agreementState.handleAgreementFileChange}
                setAgreementPdfUrl={agreementState.setAgreementPdfUrl}
                onAgreementDetailOpen={agreementState.handleAgreementDetailOpen}
                {...verifyProps}
                providerId={id}
                isNewAgreementRoute={isNewAgreementRoute}
            />
        );

        const socAndDiscountTab = (
            <SocAndDiscountTab
                providerBarSection={providerBarSection}
                hospital={providerData.hospital}
                providerId={id}
                providerBasePath={tabNav.providerBasePath}
                socUrlKey={socUrlKey}
                socUrlSuffix={socUrlSuffix}
                canWrite={canWrite}
                canVerify={canVerifyProvider}
                socVerifyProps={verifyProps}
            />
        );

        const discountTab = (
            <DiscountTab
                providerBarSection={providerBarSection}
                hospital={providerData.hospital}
                providerId={id}
                providerBasePath={tabNav.providerBasePath}
                discountUrlKey={discountUrlKey}
                discountUrlSuffix={discountUrlSuffix}
                canWrite={canWriteDiscount}
                canVerify={canVerifyDiscount}
                discountVerifyProps={discountVerifyProps}
            />
        );

        const tabContents: Record<string, React.ReactNode> = {
            "hospital-details": hospitalDetailsTab,
            "agreement": agreementTab,
            "provider-owner": providerOwnerTab,
            "soc": socAndDiscountTab,
            "hospital-discount": discountTab,
            "infrastructure-facility": infrastructureAndFacilityTab,
            "owners-info": ownersInfoTab,
            "ic-corporate": icCorporateMappingTab,
            "bank-details": bankDetailsTab,
            "hospital-document": documentsTab,
        };

        return mainTabs.map((tab) => {
            const blocked = blockNetworkOnlyTabs && NETWORK_ONLY_PROVIDER_TAB_IDS.has(tab.id);
            return {
                ...tab,
                disabled: blocked,
                content: blocked ? blockedTabContent : tabContents[tab.id],
            };
        });
    }, [
        agreementState,
        agreementUrlKey,
        agreementUrlSuffix,
        isNewAgreementRoute,
        isNonNetwork,
        socUrlKey,
        socUrlSuffix,
        discountUrlKey,
        discountUrlSuffix,
        ownerUrlKey,
        ownerUrlSuffix,
        canVerifyProvider,
        canVerifyBankDetails,
        canWriteDiscount,
        canVerifyDiscount,
        canWrite,
        canWriteBankDetails,
        contactHandlers,
        detailPlaceholderContent,
        handleBankDetailsSave,
        handleInfrastructureSave,
        handleManpowerSave,
        handleFacilitySave,
        icMappingState,
        id,
        infrastructureData,
        infrastructureLoading,
        infrastructureSaving,
        manpowerData,
        manpowerLoading,
        manpowerSaving,
        facilityData,
        facilityLoading,
        facilitySaving,
        providerBarSection,
        providerData,
        t,
        tabNav,
        verifyProps,
        bankVerifyProps,
        discountVerifyProps,
        mainTabs,
    ]);
}
