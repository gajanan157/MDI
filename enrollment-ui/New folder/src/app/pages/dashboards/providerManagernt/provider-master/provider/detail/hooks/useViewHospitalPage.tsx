import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { usePermission, useRole, useBankDetailsAccess, useDiscountAccess } from "@/app/auth/usePermission";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { PROVIDERS_LIST_PATH } from "../../utils/providersPaths";
import { ViewHospitalAgreementProviderSection } from "../components/ViewHospitalAgreementProviderSection";
import {
  useViewHospitalAgreement,
  useProviderAgreementTypeLabels,
} from "./useViewHospitalAgreement";
import {
  useViewHospitalBankSave,
  useViewHospitalInfrastructureSave,
  useViewHospitalManpowerSave,
  useViewHospitalFacilitySave,
} from "./useViewHospitalTabSave";
import { useViewHospitalContactHandlers } from "./useViewHospitalContactHandlers";
import { useViewHospitalIcMapping } from "./useViewHospitalIcMapping";
import { useViewHospitalProviderData } from "./useViewHospitalProviderData";
import { useViewHospitalTabNavigation } from "./useViewHospitalTabNavigation";
import { isIcCorporateNetworkTabPath } from "../utils/icMappingSubTabPaths";
import {
  buildTabStatusBarProps,
  buildVerifyProps,
} from "../utils/viewHospitalTabHelpers";

export function useViewHospitalPage() {
  const {
    data: infrastructureData,
    loading: infrastructureLoading,
    saving: infrastructureSaving,
  } = useAppSelector((state) => state.providerInfrastructure);
  const {
    data: manpowerData,
    loading: manpowerLoading,
    saving: manpowerSaving,
  } = useAppSelector((state) => state.providerManpower);
  const {
    data: facilityData,
    loading: facilityLoading,
    saving: facilitySaving,
  } = useAppSelector((state) => state.providerFacility);
  const { id } = useParams<{ id: string; tabSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isNewAgreementRoute = useMemo(
    () => /\/agreement\/new-agreement(?:\/?$)/.test(location.pathname),
    [location.pathname],
  );

  const agreementRouteMatch = useMemo(
    () => location.pathname.match(/\/agreement\/([^/]+)\/(view|edit)(?:\/?$)/),
    [location.pathname],
  );
  const agreementUrlKey = agreementRouteMatch?.[1];
  const agreementUrlSuffix = agreementRouteMatch?.[2] as "view" | "edit" | undefined;

  const socRouteMatch = useMemo(
    () => location.pathname.match(/\/soc\/([^/]+)\/(view|edit)(?:\/?$)/),
    [location.pathname],
  );
  const socUrlKey = socRouteMatch?.[1];
  const socUrlSuffix = socRouteMatch?.[2] as "view" | "edit" | undefined;

  const discountRouteMatch = useMemo(
    () => location.pathname.match(/\/discount\/([^/]+)\/(view|edit)(?:\/?$)/),
    [location.pathname],
  );
  const discountUrlKey = discountRouteMatch?.[1];
  const discountUrlSuffix = discountRouteMatch?.[2] as "view" | "edit" | undefined;

  const ownerRouteMatch = useMemo(
    () => location.pathname.match(/\/owner\/([^/]+)(?:\/(edit))?(?:\/?$)/),
    [location.pathname],
  );
  const ownerUrlKey = ownerRouteMatch?.[1];
  const ownerUrlSuffix = ownerRouteMatch?.[2] as "edit" | undefined;

  const { canWrite } = usePermission("provider-list");
  const { hasRole } = useRole();
  const { canWrite: canWriteBankDetails, canVerify: canVerifyBankDetails } =
    useBankDetailsAccess();
  const { canWrite: canWriteDiscount, canVerify: canVerifyDiscount } =
    useDiscountAccess();
  const canVerifyProvider = hasRole("checker.write");

  const stateNetworkType =
    (location.state as { providerNetworkType?: "NETWORK" | "NON_NETWORK" } | null)
      ?.providerNetworkType;
  const isNonNetwork = stateNetworkType === "NON_NETWORK";
  const isNetworkRoute = !isNonNetwork;

  const icMappingFetchEnabled = useMemo(
    () => isIcCorporateNetworkTabPath(location.pathname),
    [location.pathname],
  );

  const icMappingState = useViewHospitalIcMapping({
    canWrite,
    providerId: id,
    icMappingFetchEnabled,
  });
  const { mappingSubTab } = icMappingState;

  const tabNav = useViewHospitalTabNavigation({
    id,
    mappingSubTab,
    agreementUrlKey,
    agreementUrlSuffix,
    socUrlKey,
    socUrlSuffix,
    discountUrlKey,
    discountUrlSuffix,
    ownerUrlKey,
    ownerUrlSuffix,
    restrictionContextEntityId: icMappingState.restrictionContextEntityId,
  });

  const providerData = useViewHospitalProviderData({
    id,
    isNetworkRoute,
    isNonNetwork,
    activeTabId: tabNav.activeTabId,
  });

  const agreementState = useViewHospitalAgreement({
    providerBasePath: tabNav.providerBasePath,
    agreementUrlKey,
    agreementUrlSuffix,
  });

  const agreementTypeLabels = useProviderAgreementTypeLabels(
    id,
    providerData.providerDetailsFields?.agreementTypeNames ?? [],
  );

  const contactHandlers = useViewHospitalContactHandlers({
    id,
    providerProfile: providerData.providerProfile,
    hospital: providerData.hospital,
    setProviderProfile: providerData.setProviderProfile,
    setHospital: providerData.setHospital,
    setOwnerContactOwnerNotFound: providerData.setOwnerContactOwnerNotFound,
    setOwnerContactNotFoundMessage: providerData.setOwnerContactNotFoundMessage,
    ownerFetchedForIdRef: providerData.ownerFetchedForIdRef,
  });

  const { handleBankDetailsSave } = useViewHospitalBankSave({
    id,
    bankTabFields: providerData.bankTabFields,
    canWriteBankDetails,
    setBankTabFields: providerData.setBankTabFields,
  });

  const { handleInfrastructureSave } = useViewHospitalInfrastructureSave({
    id,
    canWrite,
    setProviderProfile: providerData.setProviderProfile,
    setHospital: providerData.setHospital,
  });

  const { handleManpowerSave } = useViewHospitalManpowerSave({ id, canWrite });
  const { handleFacilitySave } = useViewHospitalFacilitySave({ id, canWrite });

  const pageTitle =
    providerData.providerDetailsFields?.providerName ??
    providerData.providerProfile?.hospitalName ??
    providerData.hospital?.hospitalName ??
    "View Hospital";

  const providerBarSection = (
    <ViewHospitalAgreementProviderSection
      providerProfile={providerData.providerProfile}
      providerDetailsFields={providerData.providerDetailsFields}
      agreementForm={agreementState.agreementForm}
      agreementTypeLabels={agreementTypeLabels}
    />
  );

  const tabStatusBar = buildTabStatusBarProps(
    providerData.providerProfile,
    providerData.hospital,
    providerData.providerDetailsFields?.recordStatus,
  );
  const verifyProps = buildVerifyProps(
    canVerifyProvider,
    isNetworkRoute,
    providerData.networkProviderDetailsFetchOk,
  );
  const bankVerifyProps = buildVerifyProps(
    canVerifyBankDetails,
    isNetworkRoute,
    providerData.networkProviderDetailsFetchOk,
  );
  const discountVerifyProps = buildVerifyProps(
    canVerifyDiscount,
    isNetworkRoute,
    providerData.networkProviderDetailsFetchOk,
  );

  return {
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
    pageTitle,
    providerBarSection,
    tabStatusBar,
    verifyProps,
    bankVerifyProps,
    discountVerifyProps,
    providersListPath: PROVIDERS_LIST_PATH,
  };
}

export type ViewHospitalPageContext = ReturnType<typeof useViewHospitalPage>;
