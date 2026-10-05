import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { providerRootPath } from "../../utils/providersPaths";
import {
  buildMappingDetailPath,
  buildMappingSubTabPathForProviderId,
  buildRestrictionDetailPath,
  buildRestrictionCreatePath,
  buildRestrictionListPath,
  isIcCorporateListPath,
  isRestrictionDeepRoute,
  parseMappingDetailFromPath,
  parseMappingSubTabFromPath,
  parseRestrictionDetailFromPath,
  parseRestrictionListFromPath,
  parseRestrictionCreateFromPath,
} from "../utils/icMappingSubTabPaths";
import {
  mergeMappingDetailFromUrl,
  updateMappingDetailEditingOnly,
} from "./icMappingRouteSyncHelpers";
import type { SearchField } from "../../../../shared/providerShell";
import type {
  IcMappingDetailSession,
  ItemWithIdName,
  RestrictionDetailSession,
} from "../tabs/icCorporateMapping/types";
import {
  buildCorporateMappingGridColumnDefs,
  buildIcMappingGridColumnDefs,
} from "../tabs/icCorporateMapping/mapping";
import { resolveProviderNetworkMappingId } from "../tabs/icCorporateMapping/mapping";
import {
  fetchProviderRestrictionList,
} from "../tabs/icCorporateMapping/api";
import type { NormalizedProviderRestriction } from "../tabs/icCorporateMapping/restriction";
import {
  buildProviderRestrictionListFilters,
  getRestrictionListEntityId,
  resolveRestrictionEntityIdFromRow,
  resolveRestrictionListItem,
} from "../tabs/icCorporateMapping/restriction";
import { RESTRICTION_LIST_SEARCH_FIELDS } from "../tabs/icCorporateMapping/config";
import { useProviderNetworkMappingList } from "../tabs/icCorporateMapping/mapping/useList";
import {
  PROVIDER_MAPPING_TYPE_CORPORATE,
  PROVIDER_MAPPING_TYPE_INSURER,
} from "../tabs/icCorporateMapping/api";
import { useIcMappingUnmapDialog } from "./useIcMappingUnmapDialog";
import {
  buildMappingSearchFields,
  toApiBankMatchStatus,
} from "./icMappingViewHospitalHelpers";
import { createIcMappingGridLabels } from "../../../../shared/providerMasterI18n";
import { buildNewAgreementFromMappingNavState, buildAgreementNavState, buildProviderAgreementPath } from "../tabs/agreement/utils/providerAgreementHelpers";

type UseViewHospitalIcMappingArgs = {
  canWrite: boolean;
  providerId?: string;
  icMappingFetchEnabled?: boolean;
};

export function useViewHospitalIcMapping({
  canWrite,
  providerId,
  icMappingFetchEnabled = false,
}: UseViewHospitalIcMappingArgs) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const insurerList = useAppSelector((state) => state.insurerList.insurerList);

  const insurerSearchOptions = useMemo(
    () =>
      insurerList?.map((insurer: { insurerId?: string; insurerName?: string }) => ({
        value: insurer.insurerId ?? "",
        label: insurer.insurerName ?? "",
      })).filter((option) => option.value && option.label) ?? [],
    [insurerList],
  );

  const [mappingSubTab, setMappingSubTabState] = useState<"ic" | "corporate">(() =>
    parseMappingSubTabFromPath(location.pathname),
  );

  useEffect(() => {
    if (!isIcCorporateListPath(location.pathname)) return;
    setMappingSubTabState(parseMappingSubTabFromPath(location.pathname));
  }, [location.pathname]);

  const setMappingSubTab = useCallback(
    (subTab: "ic" | "corporate") => {
      if (!providerId) {
        setMappingSubTabState(subTab);
        return;
      }

      // Stay on restriction list/create/detail when re-selecting the active sub-tab.
      const pathSubTab = parseMappingSubTabFromPath(location.pathname);
      if (subTab === pathSubTab && isRestrictionDeepRoute(location.pathname)) {
        setMappingSubTabState(subTab);
        return;
      }

      navigate(
        {
          pathname: buildMappingSubTabPathForProviderId(providerId, subTab),
          search: location.search,
        },
        { replace: true },
      );
    },
    [providerId, location.pathname, location.search, navigate],
  );
  const {
    rows: icNetworkMappingRows,
    loading: icNetworkMappingLoading,
    totalRecords: icNetworkMappingTotalRecords,
    page: icMappingPage,
    pageSize: icMappingPageSize,
    handlePageChange: handleIcMappingPageChange,
    handlePageSizeChange: handleIcMappingPageSizeChange,
    reload: reloadIcNetworkMapping,
    search: searchIcNetworkMapping,
  } = useProviderNetworkMappingList(
    providerId,
    icMappingFetchEnabled && mappingSubTab === "ic",
    PROVIDER_MAPPING_TYPE_INSURER,
  );

  const {
    rows: corporateNetworkMappingRows,
    loading: corporateNetworkMappingLoading,
    totalRecords: corporateNetworkMappingTotalRecords,
    page: corporateMappingPage,
    pageSize: corporateMappingPageSize,
    handlePageChange: handleCorporateMappingPageChange,
    handlePageSizeChange: handleCorporateMappingPageSizeChange,
    reload: reloadCorporateNetworkMapping,
    search: searchCorporateNetworkMapping,
  } = useProviderNetworkMappingList(
    providerId,
    icMappingFetchEnabled && mappingSubTab === "corporate",
    PROVIDER_MAPPING_TYPE_CORPORATE,
  );

  const reloadNetworkMapping = useCallback(async () => {
    if (mappingSubTab === "ic") {
      await reloadIcNetworkMapping();
      return;
    }
    await reloadCorporateNetworkMapping();
  }, [mappingSubTab, reloadIcNetworkMapping, reloadCorporateNetworkMapping]);

  useEffect(() => {
    const navState = location.state as { refreshNetworkMapping?: boolean } | null;
    if (!navState?.refreshNetworkMapping) return;
    if (!isIcCorporateListPath(location.pathname)) return;

    reloadIcNetworkMapping().catch(() => undefined);

    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null },
    );
  }, [
    location.pathname,
    location.search,
    location.state,
    reloadIcNetworkMapping,
    navigate,
  ]);

  const {
    unmapDialogOpen,
    setUnmapDialogOpen,
    unmapDialogItem,
    unmapEffectiveFrom,
    setUnmapEffectiveFrom,
    unmapEffectiveFromError,
    unmapRemark,
    setUnmapRemark,
    unmapRemarkError,
    unmapSupportingFileName,
    setUnmapSupportingFileMetadata,
    clearUnmapSupportingDocument,
    unmapSupportingDocumentError,
    setUnmapSupportingDocumentError,
    unmapSaving,
    closeUnmapDialog,
    handleUnmapSave,
    openUnmapForItem,
  } = useIcMappingUnmapDialog({
    providerId,
    mappingSubTab,
    reloadNetworkMapping,
  });

  const networkMappingLoading =
    mappingSubTab === "ic" ? icNetworkMappingLoading : corporateNetworkMappingLoading;

  const [mappingSearchOpen, { toggle: toggleMappingSearch }] = useDisclosure(false);
  const [restrictionSearchOpen, { toggle: toggleRestrictionSearch }] = useDisclosure(false);
  const [mappingFilters, setMappingFilters] = useState<Record<string, unknown>>({});
  const [mappingViewItem, setMappingViewItem] = useState<ItemWithIdName | null>(null);
  const [bankMatchCompareOpen, setBankMatchCompareOpen] = useState(false);
  const [bankMatchCompareItem, setBankMatchCompareItem] = useState<ItemWithIdName | null>(null);
  const [icMappingDetail, setIcMappingDetail] = useState<IcMappingDetailSession | null>(null);
  const [corporateToIcMap] = useState<Record<string, string>>({});
  const [restrictionPrefillInsurerId, setRestrictionPrefillInsurerId] = useState("");
  const [restrictionPrefillCorporateId, setRestrictionPrefillCorporateId] = useState("");
  const [restrictionPrefillRestrictionId, setRestrictionPrefillRestrictionId] = useState("");
  const [restrictionDetail, setRestrictionDetail] = useState<RestrictionDetailSession | null>(null);
  const [restrictionListItem, setRestrictionListItem] = useState<ItemWithIdName | null>(null);
  const [restrictionListRows, setRestrictionListRows] = useState<NormalizedProviderRestriction[]>([]);
  const [restrictionListLoading, setRestrictionListLoading] = useState(false);
  const [restrictionListError, setRestrictionListError] = useState("");
  const [restrictionContextEntityId, setRestrictionContextEntityId] = useState("");

  const openedMappingUrlRef = useRef("");
  const openedRestrictionUrlRef = useRef("");
  const loadedRestrictionListKeyRef = useRef("");
  const wasRestrictionListCreateActiveRef = useRef(false);
  const restrictionListContextRef = useRef<{
    entityId: string;
    subTab: "ic" | "corporate";
  } | null>(null);

  const buildRestrictionDetailItem = useCallback(
    (
      restrictionId: string,
      subTab: "ic" | "corporate",
      listItem: ItemWithIdName | null,
      contextEntityId: string,
    ): ItemWithIdName => {
      if (listItem) {
        return {
          ...listItem,
          providerRestrictionId: restrictionId,
        };
      }

      return {
        id: contextEntityId,
        name: "",
        insurerId: subTab === "ic" ? contextEntityId : corporateToIcMap[contextEntityId] ?? "",
        providerRestrictionId: restrictionId,
      };
    },
    [corporateToIcMap],
  );

  const navigateToRestrictionList = useCallback(
    (subTab?: "ic" | "corporate", entityId?: string) => {
      if (!providerId) return false;

      const resolvedSubTab = subTab ?? restrictionListContextRef.current?.subTab ?? mappingSubTab;
      const resolvedEntityId =
        entityId?.trim() ||
        (restrictionListItem
          ? getRestrictionListEntityId(restrictionListItem, resolvedSubTab)
          : "") ||
        restrictionListContextRef.current?.entityId?.trim() ||
        "";

      if (!resolvedEntityId) return false;

      loadedRestrictionListKeyRef.current = "";

      navigate(
        {
          pathname: buildRestrictionListPath(
            providerRootPath(providerId),
            resolvedSubTab,
            resolvedEntityId,
          ),
          search: location.search,
        },
        { replace: true },
      );
      return true;
    },
    [providerId, mappingSubTab, restrictionListItem, location.search, navigate],
  );

  const restrictionNavigationRef = useRef<{
    setRestrictionCreateMode: (enabled: boolean) => void;
    setIcMappingCreateMode: (enabled: boolean) => void;
  } | null>(null);

  const bindRestrictionNavigation = useCallback(
    (handlers: {
      setRestrictionCreateMode: (enabled: boolean) => void;
      setIcMappingCreateMode: (enabled: boolean) => void;
    }) => {
      restrictionNavigationRef.current = handlers;
    },
    [],
  );

  const clearRestrictionPrefill = useCallback(() => {
    setRestrictionPrefillInsurerId("");
    setRestrictionPrefillCorporateId("");
    setRestrictionPrefillRestrictionId("");
  }, []);

  const closeRestrictionDetail = useCallback(() => {
    openedRestrictionUrlRef.current = "";
    setRestrictionDetail(null);
    setRestrictionContextEntityId("");
    if (!providerId) return;

    if (!isRestrictionDeepRoute(location.pathname)) return;

    if (navigateToRestrictionList()) return;

    restrictionListContextRef.current = null;
    navigate(
      {
        pathname: buildMappingSubTabPathForProviderId(providerId, mappingSubTab),
        search: location.search,
      },
      { replace: true },
    );
  }, [providerId, mappingSubTab, location.pathname, location.search, navigate, navigateToRestrictionList]);

  const setRestrictionDetailEditing = useCallback(
    (editing: boolean) => {
      setRestrictionDetail((prev) => {
        if (!prev) return null;

        const restrictionId = prev.item.providerRestrictionId?.trim();
        if (providerId && restrictionId) {
          const subTab =
            restrictionListContextRef.current?.subTab ??
            parseRestrictionDetailFromPath(location.pathname)?.subTab ??
            mappingSubTab;
          navigate(
            {
              pathname: buildRestrictionDetailPath(
                providerRootPath(providerId),
                subTab,
                restrictionId,
                editing ? "edit" : "view",
              ),
              search: location.search,
            },
            { replace: true },
          );
        }

        return { ...prev, editing };
      });
    },
    [providerId, mappingSubTab, location.pathname, location.search, navigate],
  );

  const setRestrictionDetailLoading = useCallback((detailLoading: boolean) => {
    setRestrictionDetail((prev) => (prev ? { ...prev, detailLoading } : null));
  }, []);

  const closeIcMappingDetail = useCallback(
    (options?: { navigate?: boolean }) => {
      openedMappingUrlRef.current = "";
      setIcMappingDetail(null);
      if (!providerId || options?.navigate === false) return;
      if (isRestrictionDeepRoute(location.pathname)) return;
      if (parseMappingDetailFromPath(location.pathname)) return;

      navigate(
        {
          pathname: buildMappingSubTabPathForProviderId(providerId, mappingSubTab),
          search: location.search,
        },
        { replace: true },
      );
    },
    [providerId, mappingSubTab, location.pathname, location.search, navigate],
  );

  const hydrateIcMappingDetailItem = useCallback((item: ItemWithIdName) => {
    setIcMappingDetail((prev) => (prev ? { ...prev, item } : null));
  }, []);

  const setIcMappingDetailEditing = useCallback(
    (editing: boolean) => {
      setIcMappingDetail((prev) => {
        if (!prev) return null;

        if (providerId) {
          const mappingId = resolveProviderNetworkMappingId(prev.item);
          if (mappingId) {
            const subTab =
              parseMappingDetailFromPath(location.pathname)?.subTab ?? mappingSubTab;
            const mode = editing ? "edit" : "view";
            openedMappingUrlRef.current = `${subTab}:${mappingId}:${mode}`;
            navigate(
              {
                pathname: buildMappingDetailPath(
                  providerRootPath(providerId),
                  subTab,
                  mappingId,
                  mode,
                ),
                search: location.search,
              },
              { replace: true },
            );
          }
        }

        return { ...prev, editing };
      });
    },
    [providerId, mappingSubTab, location.pathname, location.search, navigate],
  );

  const setIcMappingDetailLoading = useCallback((detailLoading: boolean) => {
    setIcMappingDetail((prev) => (prev ? { ...prev, detailLoading } : null));
  }, []);

  const openViewForItem = useCallback(
    (item: ItemWithIdName) => {
      setMappingViewItem(null);

      const mappingId = resolveProviderNetworkMappingId(item);
      if (!mappingId || !providerId) return;

      openedMappingUrlRef.current = `${mappingSubTab}:${mappingId}:view`;

      setIcMappingDetail({
        item,
        editing: false,
        detailLoading: true,
      });

      navigate(
        {
          pathname: buildMappingDetailPath(
            providerRootPath(providerId),
            mappingSubTab,
            mappingId,
            "view",
          ),
          search: location.search,
        },
        { replace: false },
      );
    },
    [mappingSubTab, providerId, location.search, navigate],
  );

  const openPendingAgreement = useCallback(
    (item: ItemWithIdName) => {
      if (!providerId || mappingSubTab !== "ic") return;

      const returnTo = `${location.pathname}${location.search}`;
      const navState = buildNewAgreementFromMappingNavState(item, returnTo);
      if (!navState) return;

      navigate(`${providerRootPath(providerId)}/agreement/new-agreement`, {
        state: navState,
      });
    },
    [mappingSubTab, providerId, location.pathname, location.search, navigate],
  );

  const openCompletedAgreement = useCallback(
    (item: ItemWithIdName) => {
      if (!providerId) return;

      const agreementId = String(item.providerAgreementId ?? "").trim();
      if (!agreementId) return;

      const returnTo = `${location.pathname}${location.search}`;
      const path = buildProviderAgreementPath("view", agreementId, {
        providerBasePath: providerRootPath(providerId),
        pathname: location.pathname,
      });
      if (!path) return;

      navigate(path, {
        state: buildAgreementNavState(undefined, returnTo),
      });
    },
    [providerId, location.pathname, location.search, navigate],
  );

  const openBankMatchCompare = useCallback((item: ItemWithIdName) => {
    setBankMatchCompareItem(item);
    setBankMatchCompareOpen(true);
  }, []);

  const closeBankMatchCompare = useCallback(() => {
    setBankMatchCompareOpen(false);
    setBankMatchCompareItem(null);
  }, []);

  const navigateToProviderBankDetails = useCallback(() => {
    if (!providerId) return;
    closeBankMatchCompare();
    navigate(`${providerRootPath(providerId)}/bank-details`);
  }, [providerId, closeBankMatchCompare, navigate]);

  useEffect(() => {
    const parsed = parseMappingDetailFromPath(location.pathname);
    if (parsed) {
      setMappingSubTabState(parsed.subTab);
    }
  }, [location.pathname]);

  useEffect(() => {
    const parsed = parseMappingDetailFromPath(location.pathname);
    if (!parsed || !providerId) {
      openedMappingUrlRef.current = "";
      setIcMappingDetail(null);
      return;
    }

    const urlKey = `${parsed.subTab}:${parsed.mappingId}:${parsed.mode}`;
    if (
      openedMappingUrlRef.current &&
      openedMappingUrlRef.current !== urlKey
    ) {
      return;
    }
    if (openedMappingUrlRef.current === urlKey) {
      setIcMappingDetail((prev) => {
        if (!prev) return prev;
        return updateMappingDetailEditingOnly(prev, parsed);
      });
      return;
    }
    openedMappingUrlRef.current = urlKey;

    setIcMappingDetail((prev) => mergeMappingDetailFromUrl(prev, parsed));
  }, [location.pathname, providerId]);

  useEffect(() => {
    if (!icMappingDetail || !providerId) return;
    if (parseMappingDetailFromPath(location.pathname)) return;

    // Breadcrumb/back navigated to the mapping list — keep list URL, drop stale detail.
    if (isIcCorporateListPath(location.pathname)) {
      openedMappingUrlRef.current = "";
      setIcMappingDetail(null);
      return;
    }

    const mappingId = resolveProviderNetworkMappingId(icMappingDetail.item);
    if (!mappingId) return;

    const subTab = parseMappingSubTabFromPath(location.pathname);
    const urlKey = `${subTab}:${mappingId}:${icMappingDetail.editing ? "edit" : "view"}`;
    if (openedMappingUrlRef.current === urlKey) return;
    openedMappingUrlRef.current = urlKey;

    navigate(
      {
        pathname: buildMappingDetailPath(
          providerRootPath(providerId),
          subTab,
          mappingId,
          icMappingDetail.editing ? "edit" : "view",
        ),
        search: location.search,
      },
      { replace: true },
    );
  }, [
    icMappingDetail,
    providerId,
    location.pathname,
    location.search,
    navigate,
  ]);

  useEffect(() => {
    const parsed = parseRestrictionDetailFromPath(location.pathname);
    if (parsed) {
      setMappingSubTabState(parsed.subTab);
    }
  }, [location.pathname]);

  useEffect(() => {
    const parsed = parseRestrictionDetailFromPath(location.pathname);
    if (!parsed || !providerId) {
      if (!isRestrictionDeepRoute(location.pathname)) {
        if (openedRestrictionUrlRef.current) return;
        openedRestrictionUrlRef.current = "";
        setRestrictionDetail(null);
      }
      return;
    }

    const urlKey = `${parsed.subTab}:${parsed.restrictionId}:${parsed.mode}`;
    const contextEntityId = restrictionListContextRef.current?.entityId?.trim() ?? "";
    const listItem =
      restrictionListItem &&
      getRestrictionListEntityId(restrictionListItem, parsed.subTab) === contextEntityId
        ? restrictionListItem
        : null;

    if (openedRestrictionUrlRef.current === urlKey) {
      setRestrictionDetail((prev) => {
        if (prev) {
          const currentId = prev.item.providerRestrictionId?.trim() ?? "";
          if (currentId !== parsed.restrictionId) return prev;
          if (prev.editing === (parsed.mode === "edit")) return prev;
          return { ...prev, editing: parsed.mode === "edit" };
        }

        return {
          item: buildRestrictionDetailItem(
            parsed.restrictionId,
            parsed.subTab,
            listItem,
            contextEntityId,
          ),
          editing: parsed.mode === "edit",
          detailLoading: true,
        };
      });
      return;
    }
    openedRestrictionUrlRef.current = urlKey;

    setRestrictionDetail((prev) => {
      const currentId = prev?.item.providerRestrictionId?.trim() ?? "";
      if (currentId === parsed.restrictionId && prev) {
        return {
          ...prev,
          editing: parsed.mode === "edit",
          detailLoading: prev.detailLoading,
        };
      }

      return {
        item: buildRestrictionDetailItem(
          parsed.restrictionId,
          parsed.subTab,
          listItem,
          contextEntityId,
        ),
        editing: parsed.mode === "edit",
        detailLoading: true,
      };
    });
  }, [
    location.pathname,
    providerId,
    restrictionListItem,
    buildRestrictionDetailItem,
  ]);

  useEffect(() => {
    if (!restrictionDetail || !providerId) return;
    if (parseRestrictionDetailFromPath(location.pathname)) return;

    if (parseRestrictionListFromPath(location.pathname) || isIcCorporateListPath(location.pathname)) {
      openedRestrictionUrlRef.current = "";
      setRestrictionDetail(null);
      return;
    }

    const restrictionId = restrictionDetail.item.providerRestrictionId?.trim() ?? "";
    if (!restrictionId) return;

    const subTab =
      restrictionListContextRef.current?.subTab ??
      parseMappingSubTabFromPath(location.pathname);
    const urlKey = `${subTab}:${restrictionId}:${restrictionDetail.editing ? "edit" : "view"}`;
    if (openedRestrictionUrlRef.current === urlKey) return;
    openedRestrictionUrlRef.current = urlKey;

    navigate(
      {
        pathname: buildRestrictionDetailPath(
          providerRootPath(providerId),
          subTab,
          restrictionId,
          restrictionDetail.editing ? "edit" : "view",
        ),
        search: location.search,
      },
      { replace: true },
    );
  }, [
    restrictionDetail,
    providerId,
    location.pathname,
    location.search,
    navigate,
  ]);

  const openEditRestrictionForItem = useCallback(
    (
      item: ItemWithIdName,
      restrictionId: string,
      subTab: "ic" | "corporate" = mappingSubTab,
    ) => {
      const trimmedRestrictionId = restrictionId.trim();
      if (!trimmedRestrictionId || !providerId) return;

      openedMappingUrlRef.current = "";
      setIcMappingDetail(null);

      const entityId = getRestrictionListEntityId(item, subTab);
      if (entityId) {
        restrictionListContextRef.current = { entityId, subTab };
        setRestrictionContextEntityId(entityId);
        setRestrictionListItem(item);
      }

      setRestrictionPrefillInsurerId("");
      setRestrictionPrefillCorporateId("");
      setRestrictionPrefillRestrictionId("");

      const restrictionItem =
        subTab === "corporate"
          ? {
              ...item,
              insurerId: corporateToIcMap[item.id] ?? item.insurerId,
              providerRestrictionId: trimmedRestrictionId,
            }
          : { ...item, providerRestrictionId: trimmedRestrictionId };

      openedRestrictionUrlRef.current = `${subTab}:${trimmedRestrictionId}:view`;

      setRestrictionDetail({
        item: restrictionItem,
        editing: false,
        detailLoading: true,
      });

      navigate(
        {
          pathname: buildRestrictionDetailPath(
            providerRootPath(providerId),
            subTab,
            trimmedRestrictionId,
            "view",
          ),
          search: location.search,
        },
        { replace: false },
      );
    },
    [corporateToIcMap, mappingSubTab, providerId, location.search, navigate],
  );

  const restrictionListFromPath = useMemo(
    () => parseRestrictionListFromPath(location.pathname),
    [location.pathname],
  );
  const restrictionListCreateFromPath = useMemo(
    () => parseRestrictionCreateFromPath(location.pathname),
    [location.pathname],
  );
  const restrictionListActive = restrictionListFromPath != null;
  const restrictionListCreateActive = restrictionListCreateFromPath != null;

  const loadRestrictionList = useCallback(
    async (
      item: ItemWithIdName,
      searchFilters?: Record<string, unknown>,
      subTab: "ic" | "corporate" = mappingSubTab,
    ) => {
      const resolvedProviderId = providerId?.trim();
      if (!resolvedProviderId) return;

      setRestrictionListLoading(true);
      setRestrictionListError("");
      try {
        const result = await fetchProviderRestrictionList(
          buildProviderRestrictionListFilters({
            providerId: resolvedProviderId,
            mappingSubTab: subTab,
            item,
            corporateToIcMap,
            searchFilters,
          }),
        );

        if (!result.ok) {
          setRestrictionListRows([]);
          setRestrictionListError(result.message ?? "");
          return;
        }

        setRestrictionListRows(result.rows);
      } finally {
        setRestrictionListLoading(false);
      }
    },
    [providerId, mappingSubTab, corporateToIcMap],
  );

  const closeRestrictionListPage = useCallback(() => {
    loadedRestrictionListKeyRef.current = "";
    restrictionListContextRef.current = null;
    setRestrictionContextEntityId("");
    setRestrictionListItem(null);
    setRestrictionListRows([]);
    setRestrictionListError("");
    if (!providerId) return;
    navigate(
      {
        pathname: buildMappingSubTabPathForProviderId(providerId, mappingSubTab),
        search: location.search,
      },
      { replace: true },
    );
  }, [providerId, mappingSubTab, location.search, navigate]);

  const openRestrictionForItem = useCallback(
    (item: ItemWithIdName) => {
      const entityId = getRestrictionListEntityId(item, mappingSubTab);
      if (!providerId || !entityId) return;

      restrictionListContextRef.current = { entityId, subTab: mappingSubTab };
      setRestrictionContextEntityId(entityId);
      setRestrictionListItem(item);
      setRestrictionDetail(null);
      openedRestrictionUrlRef.current = "";
      navigate(
        {
          pathname: buildRestrictionListPath(
            providerRootPath(providerId),
            mappingSubTab,
            entityId,
          ),
          search: location.search,
        },
        { replace: false },
      );
    },
    [providerId, mappingSubTab, location.search, navigate],
  );

  const handleRestrictionSearch = useCallback(
    (data: Record<string, unknown>) => {
      if (!restrictionListItem) return;
      loadRestrictionList(restrictionListItem, data);
    },
    [restrictionListItem, loadRestrictionList],
  );

  const filteredMappedForGrid = useMemo(() => {
    if (mappingSubTab === "ic") {
      return icNetworkMappingRows;
    }

    const baseList = corporateNetworkMappingRows;
    const name = String(mappingFilters.name ?? "").trim().toLowerCase();
    const insuranceCompanyName = String(mappingFilters.insuranceCompanyName ?? "")
      .trim()
      .toLowerCase();
    let list = baseList;
    if (name) list = list.filter((item) => item.name.toLowerCase().includes(name));
    if (insuranceCompanyName) {
      list = list.filter((item) =>
        (item.insuranceCompanyName ?? "").toLowerCase().includes(insuranceCompanyName),
      );
    }
    return list;
  }, [
    corporateNetworkMappingRows,
    icNetworkMappingRows,
    mappingFilters,
    mappingSubTab,
  ]);

  const mappingPage = mappingSubTab === "ic" ? icMappingPage : corporateMappingPage;
  const mappingPageSize = mappingSubTab === "ic" ? icMappingPageSize : corporateMappingPageSize;
  const mappingTotalItems =
    mappingSubTab === "ic"
      ? icNetworkMappingTotalRecords
      : corporateNetworkMappingTotalRecords;
  const handleMappingPageChange =
    mappingSubTab === "ic" ? handleIcMappingPageChange : handleCorporateMappingPageChange;
  const handleMappingPageSizeChange =
    mappingSubTab === "ic"
      ? handleIcMappingPageSizeChange
      : handleCorporateMappingPageSizeChange;

  const hasMappingListData = mappingTotalItems > 0;

  const handleRestrictionListView = useCallback(
    (restriction: NormalizedProviderRestriction) => {
      const restrictionId = restriction.providerRestrictionId?.trim();
      if (!restrictionId) return;

      const listPath = restrictionListFromPath;
      const subTab = listPath?.subTab ?? mappingSubTab;
      const entityId =
        listPath?.entityId?.trim() ||
        resolveRestrictionEntityIdFromRow(restriction, subTab) ||
        restriction.insurerId?.trim() ||
        "";

      const item =
        restrictionListItem ??
        (entityId
          ? resolveRestrictionListItem({
              entityId,
              mappingSubTab: subTab,
              gridRows: filteredMappedForGrid,
              corporateToIcMap,
            })
          : {
              id: restriction.corporateId?.trim() || restriction.insurerId?.trim() || "",
              insurerId: restriction.insurerId?.trim() ?? "",
              name: restriction.insurerName?.trim() ?? "",
            });

      openEditRestrictionForItem(item, restrictionId, subTab);
    },
    [
      restrictionListItem,
      restrictionListFromPath,
      mappingSubTab,
      filteredMappedForGrid,
      corporateToIcMap,
      openEditRestrictionForItem,
    ],
  );

  const handleRestrictionListAdd = useCallback(() => {
    if (!providerId || !canWrite) return;

    if (restrictionListCreateFromPath) return;

    const listPath = restrictionListFromPath;
    if (!listPath) return;

    const entityId = listPath.entityId.trim();
    if (!entityId) return;

    const item =
      restrictionListItem ??
      resolveRestrictionListItem({
        entityId,
        mappingSubTab: listPath.subTab,
        gridRows: filteredMappedForGrid,
        corporateToIcMap,
      });

    setIcMappingDetail(null);
    setRestrictionDetail(null);
    if (listPath.subTab === "corporate") {
      setRestrictionPrefillInsurerId(
        corporateToIcMap[entityId] ?? item.insurerId ?? "",
      );
      setRestrictionPrefillCorporateId(entityId);
    } else {
      setRestrictionPrefillInsurerId(entityId);
      setRestrictionPrefillCorporateId("");
    }
    setRestrictionPrefillRestrictionId("");

    if (restrictionNavigationRef.current) {
      restrictionNavigationRef.current.setRestrictionCreateMode(true);
      return;
    }

    navigate(
      {
        pathname: buildRestrictionCreatePath(
          providerRootPath(providerId),
          listPath.subTab,
          entityId,
        ),
        search: location.search,
      },
      { replace: false },
    );
  }, [
    canWrite,
    restrictionListCreateFromPath,
    restrictionListFromPath,
    restrictionListItem,
    providerId,
    location.search,
    navigate,
    corporateToIcMap,
    filteredMappedForGrid,
  ]);

  useEffect(() => {
    const parsed = restrictionListFromPath;
    if (!parsed || !providerId) {
      const onRestrictionDetail = parseRestrictionDetailFromPath(location.pathname);
      const onRestrictionCreate = parseRestrictionCreateFromPath(location.pathname);
      if (
        !restrictionListFromPath &&
        !restrictionListCreateFromPath &&
        !onRestrictionDetail &&
        !onRestrictionCreate
      ) {
        loadedRestrictionListKeyRef.current = "";
        restrictionListContextRef.current = null;
        setRestrictionContextEntityId("");
        setRestrictionListItem(null);
        setRestrictionListRows([]);
        setRestrictionListError("");
      }
      return;
    }

    setMappingSubTabState(parsed.subTab);
    restrictionListContextRef.current = {
      entityId: parsed.entityId,
      subTab: parsed.subTab,
    };
    setRestrictionContextEntityId(parsed.entityId);

    const item = resolveRestrictionListItem({
      entityId: parsed.entityId,
      mappingSubTab: parsed.subTab,
      gridRows: filteredMappedForGrid,
      corporateToIcMap,
    });
    setRestrictionListItem(item);

    const loadKey = `${parsed.subTab}:${parsed.entityId}`;
    if (loadedRestrictionListKeyRef.current === loadKey) return;
    loadedRestrictionListKeyRef.current = loadKey;

    loadRestrictionList(item, undefined, parsed.subTab);
  }, [
    restrictionListFromPath,
    restrictionListCreateFromPath,
    providerId,
    corporateToIcMap,
    loadRestrictionList,
    filteredMappedForGrid,
    location.pathname,
  ]);

  useEffect(() => {
    const parsed = restrictionListCreateFromPath;
    if (!parsed || !providerId) return;

    if (!canWrite) {
      navigate(
        {
          pathname: buildRestrictionListPath(
            providerRootPath(providerId),
            parsed.subTab,
            parsed.entityId,
          ),
          search: location.search,
        },
        { replace: true },
      );
      return;
    }

    setMappingSubTabState(parsed.subTab);
    restrictionListContextRef.current = {
      entityId: parsed.entityId,
      subTab: parsed.subTab,
    };
    setRestrictionContextEntityId(parsed.entityId);

    const item = resolveRestrictionListItem({
      entityId: parsed.entityId,
      mappingSubTab: parsed.subTab,
      gridRows: filteredMappedForGrid,
      corporateToIcMap,
    });
    setRestrictionListItem(item);

    if (parsed.subTab === "corporate") {
      setRestrictionPrefillInsurerId(
        corporateToIcMap[parsed.entityId] ?? item.insurerId ?? "",
      );
      setRestrictionPrefillCorporateId(parsed.entityId);
    } else {
      setRestrictionPrefillInsurerId(parsed.entityId);
      setRestrictionPrefillCorporateId("");
    }
    setRestrictionPrefillRestrictionId("");
  }, [
    canWrite,
    restrictionListCreateFromPath,
    providerId,
    location.search,
    navigate,
    corporateToIcMap,
    filteredMappedForGrid,
  ]);

  useEffect(() => {
    const wasCreateActive = wasRestrictionListCreateActiveRef.current;
    wasRestrictionListCreateActiveRef.current = restrictionListCreateActive;

    if (!wasCreateActive || restrictionListCreateActive || !restrictionListFromPath) {
      return;
    }

    loadedRestrictionListKeyRef.current = "";
    const parsed = restrictionListFromPath;
    const item = resolveRestrictionListItem({
      entityId: parsed.entityId,
      mappingSubTab: parsed.subTab,
      gridRows: filteredMappedForGrid,
      corporateToIcMap,
    });
    setRestrictionListItem(item);
    loadRestrictionList(item, undefined, parsed.subTab);
  }, [
    restrictionListCreateActive,
    restrictionListFromPath,
    corporateToIcMap,
    loadRestrictionList,
    filteredMappedForGrid,
  ]);

  const mappingSearchFields: SearchField[] = useMemo(
    () => buildMappingSearchFields(mappingSubTab, insurerSearchOptions, t),
    [insurerSearchOptions, mappingSubTab, t],
  );

  const icMappingGridLabels = useMemo(
    () => createIcMappingGridLabels(t),
    [t],
  );

  const handleMappingSearch = useCallback(
    (data: Record<string, unknown>) => {
      setMappingFilters(data);

      if (mappingSubTab === "ic") {
        searchIcNetworkMapping({
          insurerId: String(data.mappedInsurerId ?? "").trim(),
          insurerProviderCode: String(data.icProviderCode ?? "").trim(),
          providerBankMatchWithIC: toApiBankMatchStatus(String(data.bankMatch ?? "")),
        });
        return;
      }

      searchCorporateNetworkMapping({
        insurerProviderCode: String(data.icProviderCode ?? "").trim(),
        providerBankMatchWithIC: toApiBankMatchStatus(String(data.bankMatch ?? "")),
      });
    },
    [mappingSubTab, searchCorporateNetworkMapping, searchIcNetworkMapping],
  );

  const mappingGridColumnDefs = useMemo(() => {
    if (mappingSubTab === "ic") {
      return buildIcMappingGridColumnDefs({
        labels: icMappingGridLabels,
        canWrite,
        onView: openViewForItem,
        onRestrictionAction: openRestrictionForItem,
        onUnmap: openUnmapForItem,
        onOpenPendingAgreement: openPendingAgreement,
        onOpenCompletedAgreement: openCompletedAgreement,
        onCompareBankMatch: openBankMatchCompare,
      });
    }
    return buildCorporateMappingGridColumnDefs({
      labels: icMappingGridLabels,
      canWrite,
      onView: openViewForItem,
      onRestrictionAction: openRestrictionForItem,
      onUnmap: openUnmapForItem,
      onCompareBankMatch: openBankMatchCompare,
    });
  }, [
    canWrite,
    icMappingGridLabels,
    mappingSubTab,
    openViewForItem,
    openRestrictionForItem,
    openUnmapForItem,
    openPendingAgreement,
    openCompletedAgreement,
    openBankMatchCompare,
  ]);

  return {
    mappingSubTab,
    setMappingSubTab,
    mappingSearchOpen,
    toggleMappingSearch,
    mappingViewItem,
    setMappingViewItem,
    bankMatchCompareOpen,
    bankMatchCompareItem,
    closeBankMatchCompare,
    navigateToProviderBankDetails,
    icMappingDetail,
    closeIcMappingDetail,
    setIcMappingDetailEditing,
    setIcMappingDetailLoading,
    hydrateIcMappingDetailItem,
    unmapDialogOpen,
    setUnmapDialogOpen,
    unmapDialogItem,
    unmapEffectiveFrom,
    setUnmapEffectiveFrom,
    unmapEffectiveFromError,
    unmapRemark,
    setUnmapRemark,
    unmapRemarkError,
    unmapSupportingFileName,
    setUnmapSupportingFileMetadataId: setUnmapSupportingFileMetadata,
    clearUnmapSupportingDocument,
    unmapSupportingDocumentError,
    setUnmapSupportingDocumentError,
    unmapSaving,
    closeUnmapDialog,
    handleUnmapSave,
    filteredMappedForGrid,
    hasMappingListData,
    mappingPage,
    mappingPageSize,
    mappingTotalItems,
    handleMappingPageChange,
    handleMappingPageSizeChange,
    mappingSearchFields,
    handleMappingSearch,
    mappingGridColumnDefs,
    onMappingView: openViewForItem,
    onMappingRestrictionAction: openRestrictionForItem,
    onMappingUnmap: openUnmapForItem,
    onOpenPendingAgreement: openPendingAgreement,
    onCompareBankMatch: openBankMatchCompare,
    icNetworkMappingLoading: networkMappingLoading,
    reloadIcNetworkMapping: reloadNetworkMapping,
    restrictionPrefillInsurerId,
    restrictionPrefillCorporateId,
    restrictionPrefillRestrictionId,
    restrictionDetail,
    closeRestrictionDetail,
    setRestrictionDetailEditing,
    setRestrictionDetailLoading,
    clearRestrictionPrefill,
    bindRestrictionNavigation,
    restrictionListActive,
    restrictionListCreateActive,
    restrictionListItem,
    restrictionListRows,
    restrictionListLoading,
    restrictionListError,
    closeRestrictionListPage,
    handleRestrictionListAdd,
    handleRestrictionListView,
    restrictionSearchOpen,
    toggleRestrictionSearch,
    restrictionSearchFields: RESTRICTION_LIST_SEARCH_FIELDS,
    handleRestrictionSearch,
    restrictionContextEntityId,
    setRestrictionContextEntityId,
  };
}
