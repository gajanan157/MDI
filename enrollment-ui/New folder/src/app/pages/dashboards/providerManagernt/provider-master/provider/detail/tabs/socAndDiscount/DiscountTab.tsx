import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ViewHospitalVerifyProps } from "../../utils/viewHospitalTabHelpers";
import {
  buildSocStatusBarConfig,
  DISCOUNT_AUDIT_TAB_ID,
  useSocInsurerOptions,
} from "./soc";
import { DiscountListView } from "./discount/components/DiscountListView";
import { ProviderTabLoadingState } from "../../shared/ProviderTabLoadingState";
import {
  DiscountDetailView,
  useDiscountDetailFromUrl,
  useDiscountForm,
  useDiscountFormOptions,
  useDiscountNavigation,
} from "./discount";

export interface DiscountTabProps {
  providerBarSection: React.ReactNode;
  hospital?: { id?: string; status?: string; blacklistedByIcNames?: string[] } | null;
  providerBasePath?: string;
  providerId?: string;
  discountUrlKey?: string;
  discountUrlSuffix?: "view" | "edit";
  canWrite: boolean;
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  discountVerifyProps?: ViewHospitalVerifyProps;
}

export function DiscountTab({
  providerBarSection,
  hospital = null,
  providerBasePath,
  providerId: providerIdProp,
  discountUrlKey,
  discountUrlSuffix,
  canWrite,
  canVerify,
  verifyDisabled = false,
  verifyDisabledTitle,
  discountVerifyProps,
}: Readonly<DiscountTabProps>) {
  const { t } = useTranslation();
  const providerId = providerIdProp?.trim() || hospital?.id;
  const discountOptions = useDiscountFormOptions(providerId);
  const discountHook = useDiscountForm(providerId, discountOptions.agreementRowsById);
  const discountNav = useDiscountNavigation(providerBasePath);
  const { multiSelectOptions: insurerMultiSelectOptions } = useSocInsurerOptions(
    discountUrlSuffix === "edit",
  );

  const { showDetailFromUrl, detailLoading, detailLoadFailed } = useDiscountDetailFromUrl({
    discountUrlKey,
    discountUrlSuffix,
    onOpen: discountHook.applyDetail,
  });

  useEffect(() => {
    if (!detailLoadFailed) return;
    discountNav.navigateToDiscountList();
  }, [detailLoadFailed, discountNav]);

  const statusBarConfig = useMemo(
    () =>
      buildSocStatusBarConfig({
        hospital,
        canWrite,
        canVerify,
        verifyDisabled: discountVerifyProps?.verifyDisabled ?? verifyDisabled,
        verifyDisabledTitle:
          discountVerifyProps?.verifyDisabledTitle ?? verifyDisabledTitle,
        t,
        auditTabId: DISCOUNT_AUDIT_TAB_ID,
      }),
    [
      hospital,
      canWrite,
      canVerify,
      discountVerifyProps?.verifyDisabled,
      discountVerifyProps?.verifyDisabledTitle,
      verifyDisabled,
      verifyDisabledTitle,
      t,
    ],
  );

  const handleDiscountCancelClick = () => {
    const wasNew = discountHook.selectedDetail?.id === "new";
    const wasViewMode = discountHook.isViewMode;
    discountHook.onCancel();
    if (wasNew || wasViewMode) {
      discountNav.navigateToDiscountList();
      return;
    }
    if (discountHook.selectedDetail && discountUrlSuffix === "edit") {
      discountNav.navigateToViewDiscount(discountHook.selectedDetail.id);
    }
  };

  const handleDiscountSaveClick = async () => {
    const saved = await discountHook.onSave();
    if (saved) {
      discountNav.navigateToViewDiscount(saved.id);
    }
  };

  const handleDiscountEditClick = () => {
    if (!discountHook.selectedDetail) return;
    discountHook.onEdit();
    discountNav.navigateToEditDiscount(discountHook.selectedDetail.id);
  };

  if (showDetailFromUrl) {
    if (detailLoadFailed) {
      return null;
    }

    if (detailLoading || !discountHook.selectedDetail) {
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 p-1">
          {providerBarSection}
          <ProviderTabLoadingState />
        </div>
      );
    }

    return (
      <DiscountDetailView
        providerBarSection={providerBarSection}
        statusBarConfig={statusBarConfig}
        isViewMode={discountHook.isViewMode}
        onEdit={handleDiscountEditClick}
        onCancel={handleDiscountCancelClick}
        onSave={handleDiscountSaveClick}
        saveDisabled={!discountHook.isViewMode && discountHook.saveDisabled}
        saveDisabledTitle={
          discountHook.saveDisabled
            ? discountHook.saveBlockMessage ??
              t("providerMaster.soc.discount.validation.completeRequiredFields")
            : undefined
        }
        saving={discountHook.saving}
        form={discountHook.form}
        setOpdPercentByKey={discountHook.setOpdPercentByKey}
        setIpdPercentByKey={discountHook.setIpdPercentByKey}
        componentDiscounts={discountHook.componentDiscounts}
        setComponentDiscounts={discountHook.setComponentDiscounts}
        supportingDocumentFile={discountHook.supportingDocumentFile}
        setSupportingDocumentFile={discountHook.setSupportingDocumentFile}
        onSupportingDocumentUploaded={discountHook.onSupportingDocumentUploaded}
        agreementOptions={discountOptions.agreementOptions}
        socOptions={discountOptions.socOptions}
        agreementRowsById={discountOptions.agreementRowsById}
        fallbackInsurerOptions={insurerMultiSelectOptions}
        corporateOptions={discountHook.corporateOptions}
        optionsByInsurerId={discountHook.optionsByInsurerId}
        selectedDetail={discountHook.selectedDetail}
        providerId={discountHook.providerId}
      />
    );
  }

  return (
    <DiscountListView
      providerBarSection={providerBarSection}
      statusBarConfig={statusBarConfig}
      providerId={providerId}
      onViewDiscount={discountNav.navigateToViewDiscount}
      onAddDiscount={discountNav.navigateToAddDiscount}
    />
  );
}
