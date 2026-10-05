import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import type { ViewHospitalVerifyProps } from "../../utils/viewHospitalTabHelpers";
import {
  buildSocStatusBarConfig,
  type SocAgreementNavigationPayload,
  type SocDetailRecord,
  useSocAndDiscount,
  useSocDetailFromUrl,
  useSocNavigation,
  SocDetailView,
} from "./soc";
import { SocListView } from "./components/SocListView";

export type { DiscountFormValues } from "./soc";

export interface SocAndDiscountTabProps {
  providerBarSection: React.ReactNode;
  hospital?: { id?: string; status?: string; blacklistedByIcNames?: string[] } | null;
  providerBasePath?: string;
  providerId?: string;
  socUrlKey?: string;
  socUrlSuffix?: "view" | "edit";
  canWrite: boolean;
  canVerify?: boolean;
  socVerifyProps?: ViewHospitalVerifyProps;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
}

export function SocAndDiscountTab({
  providerBarSection,
  hospital = null,
  providerBasePath,
  providerId: providerIdProp,
  socUrlKey,
  socUrlSuffix,
  canWrite,
  canVerify,
  socVerifyProps,
  verifyDisabled = false,
  verifyDisabledTitle,
}: Readonly<SocAndDiscountTabProps>) {
  const { t } = useTranslation();
  const location = useLocation();
  const appliedAgreementFromNavRef = useRef<string | null>(null);
  const providerId = providerIdProp?.trim() || hospital?.id;

  const {
    selectedSocDetail,
    applySocDetailFromRoute,
    socForm,
    isSocViewMode,
    socLastUpdatedOn,
    setSocLastUpdatedOn,
    socStartDate,
    setSocStartDate,
    socEndDate,
    setSocEndDate,
    socVersionHistory,
    socFileInputRef,
    pendingSocDocumentFile,
    isSavingSocDocument,
    onSocFileSelect,
    onClearPendingSocDocument,
    selectedApplicableIcIds,
    onSelectedApplicableIcIdsChange,
    applicableIcs,
    applicableIcsSummary,
    agreementName,
    setAgreementName,
    applyAgreementNameFromNavigation,
    gipsaSocVariant,
    onGipsaSocVariantChange,
    isCorporateSoc,
    onIsCorporateSocChange,
    selectedCorporateInsurerId,
    onSelectedCorporateInsurerIdChange,
    onDetailsInsurerChange,
    agreementInsurerMappings,
    lockApplicableIcsFromAgreement,
    selectedCorporates,
    onSelectedCorporatesChange,
    insurerMultiSelectOptions,
    psuInsurerOptions,
    insurerOptionsLoading,
    onSocEdit,
    onSocCancel,
    onSocSave,
    socSaveDisabled,
    setSelectedSocPdfUrl,
    socSideBySide,
  } = useSocAndDiscount(providerId, true);

  const applyAgreementNameRef = useRef(applyAgreementNameFromNavigation);
  applyAgreementNameRef.current = applyAgreementNameFromNavigation;
  const applySocDetailFromRouteRef = useRef(applySocDetailFromRoute);
  applySocDetailFromRouteRef.current = applySocDetailFromRoute;

  const lockAgreementName = useMemo(() => {
    const navState = location.state as
      | { fromAgreement?: boolean; agreementName?: string }
      | null;
    return (
      Boolean(navState?.fromAgreement) &&
      Boolean(String(navState?.agreementName ?? "").trim())
    );
  }, [location.state]);

  const handleSocDetailOpen = useCallback(
    (detail: SocDetailRecord, urlSuffix: "view" | "edit") => {
      const navState = location.state as
        | {
            agreementName?: string;
            insurerMappings?: SocAgreementNavigationPayload["insurerMappings"];
          }
        | null;
      applySocDetailFromRouteRef.current(detail, urlSuffix);

      const agreementFromNav = String(navState?.agreementName ?? "").trim();
      const insurerMappings = navState?.insurerMappings ?? [];
      if (agreementFromNav || insurerMappings.length > 0) {
        applyAgreementNameRef.current({
          agreementName: agreementFromNav,
          insurerMappings,
        });
        appliedAgreementFromNavRef.current = `${agreementFromNav}|${insurerMappings
          .map((m) => m.insurerId)
          .join(",")}`;
      }
    },
    [location.state],
  );

  useEffect(() => {
    const navState = location.state as
      | {
          agreementName?: string;
          insurerMappings?: SocAgreementNavigationPayload["insurerMappings"];
        }
      | null;
    const agreementFromNav = String(navState?.agreementName ?? "").trim();
    const insurerMappings = navState?.insurerMappings ?? [];
    if (!agreementFromNav && insurerMappings.length === 0) return;

    const applyKey = `${agreementFromNav}|${insurerMappings
      .map((m) => m.insurerId)
      .join(",")}`;
    if (appliedAgreementFromNavRef.current === applyKey) return;

    applyAgreementNameRef.current({
      agreementName: agreementFromNav,
      insurerMappings,
    });
    appliedAgreementFromNavRef.current = applyKey;
  }, [location.state]);

  const { showDetailFromUrl } = useSocDetailFromUrl({
    providerId,
    socUrlKey,
    socUrlSuffix,
    onSocDetailOpen: handleSocDetailOpen,
  });

  const statusBarConfig = useMemo(
    () =>
      buildSocStatusBarConfig({
        hospital,
        canWrite,
        canVerify,
        verifyDisabled: socVerifyProps?.verifyDisabled ?? verifyDisabled,
        verifyDisabledTitle:
          socVerifyProps?.verifyDisabledTitle ?? verifyDisabledTitle,
        t,
      }),
    [
      hospital,
      canWrite,
      canVerify,
      socVerifyProps?.verifyDisabled,
      socVerifyProps?.verifyDisabledTitle,
      verifyDisabled,
      verifyDisabledTitle,
      t,
    ],
  );

  const { navigateToViewSoc, navigateToAddSoc } = useSocNavigation(providerBasePath);

  const handleSocCancelClick = () => {
    onSocCancel();
    if (selectedSocDetail && socUrlSuffix === "edit") {
      navigateToViewSoc(selectedSocDetail.id);
    }
  };

  const panelProps = {
    socForm,
    isSocViewMode,
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
    onSocEdit,
    onSocCancel,
    onSocSave,
    socVersionHistory,
    setSelectedSocPdfUrl,
    socSideBySide,
    agreementName,
    setAgreementName,
    applyAgreementNameFromNavigation,
    providerId,
    agreementNameDisabled: lockAgreementName,
    gipsaSocVariant,
    onGipsaSocVariantChange,
    isCorporateSoc,
    onIsCorporateSocChange,
    selectedCorporateInsurerId,
    onSelectedCorporateInsurerIdChange,
    onDetailsInsurerChange,
    agreementInsurerMappings,
    lockApplicableIcsFromAgreement,
    selectedCorporates,
    onSelectedCorporatesChange,
    selectedApplicableIcIds,
    onSelectedApplicableIcIdsChange,
    applicableIcs,
    applicableIcsSummary,
    insurerMultiSelectOptions,
    psuInsurerOptions,
    insurerOptionsLoading,
    canWrite,
  };

  if (showDetailFromUrl && selectedSocDetail) {
    return (
      <SocDetailView
        providerBarSection={providerBarSection}
        statusBarConfig={statusBarConfig}
        socDetail={selectedSocDetail}
        isSocViewMode={isSocViewMode}
        onEdit={onSocEdit}
        onCancel={handleSocCancelClick}
        onSave={onSocSave}
        saveDisabled={!isSocViewMode && socSaveDisabled}
        saveDisabledTitle={
          socSaveDisabled
            ? t("providerMaster.soc.details.validation.completeRequiredFields")
            : undefined
        }
        panelProps={panelProps}
      />
    );
  }

  return (
    <SocListView
      providerBarSection={providerBarSection}
      statusBarConfig={statusBarConfig}
      providerId={providerId}
      onViewSoc={navigateToViewSoc}
      onAddSoc={navigateToAddSoc}
    />
  );
}
