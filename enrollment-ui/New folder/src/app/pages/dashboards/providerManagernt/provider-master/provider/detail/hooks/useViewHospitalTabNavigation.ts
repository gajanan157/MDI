import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { getProviderTabLabel } from "../../../../shared/providerMasterI18n";
import {
  providerRootPath,
} from "../../utils/providersPaths";
import {
  PROVIDER_TAB_ID_TO_SLUG,
  PROVIDER_TAB_SLUG_TO_ID,
} from "../providerViewTabSlugs";
import {
  buildDefaultIcCorporateListPath,
  buildMappingSubTabPath,
  buildRestrictionCreatePath,
  buildRestrictionListPath,
  isRestrictionDeepRoute,
  parseRestrictionCreateFromPath,
  parseRestrictionListFromPath,
} from "../utils/icMappingSubTabPaths";
import { resolveActiveTabFromPath, resolveProviderTabNavigationSync } from "../utils/viewHospitalTabHelpers";
import { useViewHospitalBreadcrumbs } from "./useViewHospitalBreadcrumbs";

type UseViewHospitalTabNavigationArgs = {
  id: string | undefined;
  mappingSubTab: "ic" | "corporate";
  agreementUrlKey: string | undefined;
  agreementUrlSuffix: "view" | "edit" | undefined;
  socUrlKey: string | undefined;
  socUrlSuffix: "view" | "edit" | undefined;
  discountUrlKey?: string | undefined;
  discountUrlSuffix?: "view" | "edit" | undefined;
  ownerUrlKey: string | undefined;
  ownerUrlSuffix: "edit" | undefined;
  restrictionContextEntityId?: string;
};

export function useViewHospitalTabNavigation({
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
  restrictionContextEntityId,
}: UseViewHospitalTabNavigationArgs) {
  const { t } = useTranslation();
  const { tabSlug } = useParams<{ id: string; tabSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setTitleAboveBreadcrumb } = useBreadcrumbContext();

  const providerBasePath = id ? providerRootPath(id) : "";

  const [activeTabId, setActiveTabId] = useState(() => {
    const fromPath = resolveActiveTabFromPath(location.pathname);
    if (fromPath) return fromPath;
    if (tabSlug && PROVIDER_TAB_SLUG_TO_ID[tabSlug]) {
      return PROVIDER_TAB_SLUG_TO_ID[tabSlug]!;
    }
    if (tabSlug === "ic-mapping-details") {
      return "ic-corporate";
    }
    return "hospital-details";
  });

  const activeTabLabel =
    getProviderTabLabel(activeTabId, t) || t("providerMaster.breadcrumb.providerDetails");

  const icMappingCreateMode = useMemo(
    () =>
      /\/ic-mapping-details\/?$/.test(location.pathname) ||
      /\/provider-mapped-with-ic-and-corporate\/provider-mapped-with-ic\/new-ic-mapping\/?$/.test(
        location.pathname,
      ),
    [location.pathname],
  );

  const restrictionCreateMode = useMemo(
    () =>
      /\/provider-mapped-with-ic-and-corporate\/provider-mapped-with-ic\/add-restriction\/?$/.test(
        location.pathname,
      ) ||
      /\/provider-restriction\/(?:insurer|corporate)\/[^/]+\/add(?:\/|$)/.test(
        location.pathname,
      ),
    [location.pathname],
  );

  const setIcMappingCreateMode = useCallback(
    (enabled: boolean) => {
      if (!providerBasePath) return;

      if (enabled) {
        navigate(
          {
            pathname: `${providerBasePath}/provider-mapped-with-ic-and-corporate/provider-mapped-with-ic/new-ic-mapping`,
            search: location.search,
          },
          { replace: true },
        );
        return;
      }

      if (!icMappingCreateMode) return;

      navigate(
        {
          pathname: buildMappingSubTabPath(providerBasePath, mappingSubTab),
          search: location.search,
        },
        { replace: true },
      );
    },
    [providerBasePath, location.search, navigate, mappingSubTab, icMappingCreateMode],
  );

  const setRestrictionCreateMode = useCallback(
    (enabled: boolean) => {
      if (!providerBasePath) return;

      const createFromPath = parseRestrictionCreateFromPath(location.pathname);
      const listFromPath = parseRestrictionListFromPath(location.pathname);

      if (enabled) {
        const nextPath = listFromPath
          ? buildRestrictionCreatePath(
              providerBasePath,
              listFromPath.subTab,
              listFromPath.entityId,
            )
          : `${providerBasePath}/provider-mapped-with-ic-and-corporate/provider-mapped-with-ic/add-restriction`;
        navigate({ pathname: nextPath, search: location.search }, { replace: true });
        return;
      }

      if (!restrictionCreateMode) return;

      let nextPath: string;
      if (createFromPath) {
        nextPath = buildRestrictionListPath(
          providerBasePath,
          createFromPath.subTab,
          createFromPath.entityId,
        );
      } else if (listFromPath) {
        nextPath = buildRestrictionListPath(
          providerBasePath,
          listFromPath.subTab,
          listFromPath.entityId,
        );
      } else {
        nextPath = buildMappingSubTabPath(providerBasePath, mappingSubTab);
      }

      navigate({ pathname: nextPath, search: location.search }, { replace: true });
    },
    [
      providerBasePath,
      location.pathname,
      location.search,
      navigate,
      mappingSubTab,
      restrictionCreateMode,
    ],
  );

  useEffect(() => {
    setTitleAboveBreadcrumb(null);
  }, [setTitleAboveBreadcrumb]);

  useEffect(() => {
    if (activeTabId !== "ic-corporate" && icMappingCreateMode) {
      setIcMappingCreateMode(false);
    }
    if (
      activeTabId !== "ic-corporate" &&
      restrictionCreateMode &&
      !isRestrictionDeepRoute(location.pathname)
    ) {
      setRestrictionCreateMode(false);
    }
  }, [
    activeTabId,
    icMappingCreateMode,
    restrictionCreateMode,
    location.pathname,
    setIcMappingCreateMode,
    setRestrictionCreateMode,
  ]);

  useEffect(() => {
    const sync = resolveProviderTabNavigationSync(
      location.pathname,
      providerBasePath,
      tabSlug,
    );
    if (sync.redirectPath) {
      navigate(sync.redirectPath, { replace: true });
    }
    if (sync.tabId) {
      setActiveTabId(sync.tabId);
    }
  }, [tabSlug, location.pathname, providerBasePath, navigate]);

  useViewHospitalBreadcrumbs({
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
    pathname: location.pathname,
    restrictionContextEntityId,
  });

  const handleTabChange = useCallback(
    (nextTabId: string) => {
      setActiveTabId(nextTabId);
      if (!providerBasePath) return;

      if (nextTabId === "ic-corporate") {
        navigate(buildDefaultIcCorporateListPath(providerBasePath), { replace: true });
        return;
      }

      const slug = PROVIDER_TAB_ID_TO_SLUG[nextTabId];
      if (slug) {
        navigate(`${providerBasePath}/${slug}`, { replace: true });
      }
    },
    [navigate, providerBasePath],
  );

  return {
    activeTabId,
    setActiveTabId,
    activeTabLabel,
    providerBasePath,
    handleTabChange,
    icMappingCreateMode,
    restrictionCreateMode,
    setIcMappingCreateMode,
    setRestrictionCreateMode,
  };
}
