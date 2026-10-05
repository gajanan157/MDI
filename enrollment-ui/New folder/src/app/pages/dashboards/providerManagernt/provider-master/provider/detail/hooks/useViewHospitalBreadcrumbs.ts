import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import {
  buildViewHospitalBreadcrumbs,
  type ViewHospitalBreadcrumbInput,
} from "../utils/buildViewHospitalBreadcrumbs";

export type UseViewHospitalBreadcrumbsInput = Omit<ViewHospitalBreadcrumbInput, "t">;

export function useViewHospitalBreadcrumbs(input: UseViewHospitalBreadcrumbsInput) {
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const {
    activeTabId,
    activeTabLabel,
    mappingSubTab,
    icMappingCreateMode,
    restrictionCreateMode,
    providerBasePath,
    agreementUrlKey,
    agreementUrlSuffix,
    socUrlKey,
    socUrlSuffix,
    discountUrlKey,
    discountUrlSuffix,
    ownerUrlKey,
    ownerUrlSuffix,
    pathname,
    restrictionContextEntityId,
  } = input;

  useLayoutEffect(() => {
    setBreadcrumbs(
      buildViewHospitalBreadcrumbs({
        t,
        activeTabId,
        activeTabLabel,
        mappingSubTab,
        icMappingCreateMode,
        restrictionCreateMode,
        providerBasePath,
        agreementUrlKey,
        agreementUrlSuffix,
        socUrlKey,
        socUrlSuffix,
        discountUrlKey,
        discountUrlSuffix,
        ownerUrlKey,
        ownerUrlSuffix,
        pathname,
        restrictionContextEntityId,
      }),
    );
    return () => setBreadcrumbs([]);
  }, [
    setBreadcrumbs,
    t,
    activeTabId,
    activeTabLabel,
    mappingSubTab,
    icMappingCreateMode,
    restrictionCreateMode,
    providerBasePath,
    agreementUrlKey,
    agreementUrlSuffix,
    socUrlKey,
    socUrlSuffix,
    discountUrlKey,
    discountUrlSuffix,
    ownerUrlKey,
    ownerUrlSuffix,
    pathname,
    restrictionContextEntityId,
  ]);
}
