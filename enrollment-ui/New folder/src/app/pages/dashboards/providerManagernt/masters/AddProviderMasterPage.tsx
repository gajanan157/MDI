import { Button, Page, PageContent } from "../shared/providerShell";
import DefaultMasterFieldsSection from "./components/DefaultMasterFieldsSection";
import NetworkModeFieldsGrid from "./components/NetworkModeFieldsGrid";
import TaxonomyFieldsGrid from "./components/TaxonomyFieldsGrid";
import { useAddProviderMasterPage } from "./useAddProviderMasterPage";

const cardClass =
  "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md";
const sectionHeaderClass =
  "flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 bg-gray-200 px-2.5 py-1";
const sectionTitleClass = "text-[11px] font-semibold text-gray-700";
const sectionBodyClass = "p-2.5";

export default function AddProviderMasterPage() {
  const page = useAddProviderMasterPage();

  return (
    <Page title={`${page.pageTitle}: ${page.selectedConfig.title}`}>
      <PageContent className="flex min-h-0 flex-1 flex-col gap-2 bg-gray-50">
        <div className={cardClass}>
          <div className={sectionHeaderClass}>
            <h3 className={sectionTitleClass}>{page.selectedConfig.title}</h3>
          </div>
          <div className={sectionBodyClass}>
            {page.isNetworkModeMaster && (
              <NetworkModeFieldsGrid
                form={page.form}
                setForm={page.setForm}
                control={page.networkModeForm.control}
                insurerOptions={page.insurerOptions}
                selectLabel={page.t("providerMaster.mastersPage.select")}
                effectiveFrom={page.networkModeEffectiveFrom}
                effectiveTo={page.networkModeEffectiveTo}
              />
            )}
            {page.isTaxonomyMaster && (
              <TaxonomyFieldsGrid
                form={page.form}
                setForm={page.setForm}
                control={page.taxonomyForm.control}
                selectLabel={page.t("providerMaster.mastersPage.select")}
              />
            )}
            {!page.isNetworkModeMaster && !page.isTaxonomyMaster && (
              <DefaultMasterFieldsSection
                form={page.form}
                setForm={page.setForm}
                statusControl={page.statusForm.control}
                identifierControl={page.identifierExtraForm.control}
                discountTypeControl={page.discountSubtypeForm.control}
                inclusionExclusionTypeControl={page.inclusionExclusionTypeForm.control}
                codeLabel={page.selectedConfig.codeLabel}
                nameLabel={page.selectedConfig.nameLabel}
                descriptionLabel={page.selectedConfig.descriptionLabel}
                statusLabel={
                  page.isDiscountTypeMaster ||
                  page.isDiscountSubtypeMaster ||
                  page.isDiscountInclusionExclusionMaster
                    ? page.t("providerMaster.mastersPage.isActive")
                    : page.t("providerMaster.common.status")
                }
                serviceTypeLabel={page.t("providerMaster.mastersPage.serviceType")}
                discountTypeLabel={page.t("providerMaster.mastersPage.discountType")}
                inclusionExclusionTypeLabel={page.t(
                  "providerMaster.mastersPage.inclusionExclusionType",
                )}
                selectLabel={page.t("providerMaster.mastersPage.select")}
                statusOptions={page.statusOptions}
                discountTypeOptions={page.discountTypeOptions}
                inclusionExclusionTypeOptions={page.inclusionExclusionTypeOptions}
                isIdentifierTypeMaster={page.isIdentifierTypeMaster}
                isDiscountTypeMaster={page.isDiscountTypeMaster}
                isDiscountSubtypeMaster={page.isDiscountSubtypeMaster}
                isDiscountInclusionExclusionMaster={page.isDiscountInclusionExclusionMaster}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 p-2.5">
            <Button
              type="button"
              variant="outlined"
              onClick={() => page.navigate(page.mastersListPath)}
            >
              {page.t("providerMaster.button.cancel")}
            </Button>
            <Button
              type="button"
              color="primary"
              disabled={page.isSaveDisabled}
              onClick={page.saveForm}
            >
              {page.t("providerMaster.button.save")}
            </Button>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
