import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Page, PageContent } from "../../shared/providerShell";
import IcCorporateMappingLanding from "./Landing";
import { BulkIcMappingPageContent } from "./NetworkPage";
import type { AddNewNetworkFormShape } from "./components/AddNetworkDialog";
import { BULK_IC_MAPPING_ADD_PATH } from "./config";

function isAddNewNetworkPathname(pathname: string): boolean {
  return (
    pathname === BULK_IC_MAPPING_ADD_PATH ||
    pathname.startsWith(`${BULK_IC_MAPPING_ADD_PATH}/`)
  );
}

export default function IcCorporateMapping() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const addNewNetworkRoute = isAddNewNetworkPathname(pathname);

  const { control, setValue, register, trigger, setError, clearErrors, formState: { errors } } =
    useForm<AddNewNetworkFormShape>({
    defaultValues: {
      selectedIc: "",
      selectedCorporate: "",
      isDepanel: false,
      providerNetwork: "",
      providerTariff: "",
      empanelSource: "",
      discountTypeIc: "individual",
      discountTypeCorporate: "individual",
      socRemarkCategoryIc: "",
      socRemarkIc: "",
      effectiveFrom: "",
      effectiveTo: "",
      remarkCategory: "",
      remarks: "",
    },
  });

  const [inwardListRefreshToken, setInwardListRefreshToken] = useState(0);

  const handleBulkUploadSuccess = () => {
    setInwardListRefreshToken((token) => token + 1);
  };

  return (
    <Page
      title={
        addNewNetworkRoute
          ? t("nav.dashboards.provider-masters-ic-corporate-mapping-add-new-network")
          : t("providerMaster.title.icCorporateMapping")
      }
    >
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        {!addNewNetworkRoute ? (
          <IcCorporateMappingLanding
            onAddNewNetwork={() => navigate(BULK_IC_MAPPING_ADD_PATH)}
          />
        ) : (
          <BulkIcMappingPageContent
            control={control}
            errors={errors}
            register={register}
            setValue={setValue}
            setError={setError}
            clearErrors={clearErrors}
            trigger={trigger}
            refreshToken={inwardListRefreshToken}
            onSubmitSuccess={handleBulkUploadSuccess}
          />
        )}
      </div>
    </Page>
  );
}
