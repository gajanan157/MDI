import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  buildAgreementNavState,
  buildProviderAgreementPath,
  extractProviderIdFromPath,
} from "../utils/providerAgreementHelpers";

type UseAgreementNavigationArgs = {
  hospitalName?: string;
  providerBasePath?: string;
};

export function useAgreementNavigation({
  hospitalName,
  providerBasePath,
}: UseAgreementNavigationArgs) {
  const navigate = useNavigate();
  const location = useLocation();

  const navState = useMemo(
    () => buildAgreementNavState(hospitalName, location.pathname),
    [hospitalName, location.pathname],
  );

  const handleNewAgreementFromList = useCallback(() => {
    const providerId = extractProviderIdFromPath(location.pathname);
    if (!providerId) return;

    navigate(`/provider-masters/providers/${providerId}/agreement/new-agreement`, {
      state: navState,
    });
  }, [location.pathname, navigate, navState]);

  const toProviderAgreementPath = useCallback(
    (suffix: "view" | "edit", internalId: string) =>
      buildProviderAgreementPath(suffix, internalId, {
        providerBasePath,
        pathname: location.pathname,
      }),
    [providerBasePath, location.pathname],
  );

  const navigateToViewAgreement = useCallback(
    (agreementId: string) => {
      const path = toProviderAgreementPath("view", agreementId);
      if (!path) return;
      navigate(path, { state: navState });
    },
    [navState, navigate, toProviderAgreementPath],
  );

  const navigateToEditAgreement = useCallback(
    (agreementId: string) => {
      const path = toProviderAgreementPath("edit", agreementId);
      if (!path) return;
      navigate(path, { state: navState });
    },
    [navState, navigate, toProviderAgreementPath],
  );

  return {
    handleNewAgreementFromList,
    navigateToViewAgreement,
    navigateToEditAgreement,
  };
}
