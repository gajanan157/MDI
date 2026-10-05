import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useLocation, useNavigate, useParams } from "react-router";
import type { ConfirmMessages, ModalState } from "@/components/shared/ConfirmModal";
import { showErrorMessage } from "@/utils/errorHandler";
import type { IcCorporateMappingTabProps, IcMappingFormState } from "./types";
import { useIcMappingCreateForm } from "./mapping/useForm";
import { useIcMappingRestrictionForm } from "./restriction/useRestriction";
import { useInsurerNetworkMode } from "./mapping/useInsurer";
import { useInsurerProviderCode } from "./mapping/useInsurer";
import { useIcMappingTabData } from "./mapping/useForm";
import { IC_MAPPING_FORM_DEFAULTS } from "./mapping/config";
import { RESTRICTION_DETAILS_DEFAULTS } from "./restriction/config";
import { fetchProviderRestrictionById } from "./api";
import { resolveRestrictionEntityIdFromRow } from "./restriction/utils";
import { parseMappingDetailFromPath, parseRestrictionDetailFromPath } from "../../utils/icMappingSubTabPaths";
import {
  fetchProviderNetworkMappingById,
} from "./api";
import { fetchInsurerProviderCode } from "./api";
import {
  mapCorporateNetworkMappingToGridRow,
  mapNetworkMappingToGridRow,
} from "./mapping/network";
import { mapProviderNetworkMappingToForm } from "./mapping/utils";
import { buildIcMappingFormFromItem } from "./mapping/utils";
import {
  cloneIcMappingFormState,
  resolveProviderNetworkMappingId,
} from "./mapping/utils";
import {
  resolveFormForIcMappingSave,
  saveExistingIcMapping,
  saveNewIcMapping,
  validateIcMappingEntityFields,
  validateIcMappingRequiredFields,
} from "./icMappingSaveHandlers";
import { providerRootPath } from "../../../utils/providersPaths";
import {
  buildRestrictionListPath,
  isRestrictionDeepRoute,
  parseRestrictionCreateFromPath,
} from "../../utils/icMappingSubTabPaths";

type OrchestratorInput = Pick<
  IcCorporateMappingTabProps,
  | "providerId"
  | "mappingSubTab"
  | "hospital"
  | "mappingSearchOpen"
  | "restrictionSearchOpen"
  | "icMappingDetail"
  | "closeIcMappingDetail"
  | "setIcMappingCreateMode"
  | "icMappingCreateMode"
  | "setIcMappingDetailEditing"
  | "setIcMappingDetailLoading"
  | "hydrateIcMappingDetailItem"
  | "restrictionCreateMode"
  | "setRestrictionCreateMode"
  | "restrictionDetail"
  | "closeRestrictionDetail"
  | "setRestrictionDetailLoading"
  | "setRestrictionContextEntityId"
  | "clearRestrictionPrefill"
  | "bindRestrictionNavigation"
  | "restrictionPrefillInsurerId"
  | "restrictionPrefillCorporateId"
  | "restrictionListActive"
  | "restrictionListCreateActive"
  | "hasMappingListData"
  | "onIcMappingSaved"
  | "onRestrictionSaved"
>;

export function useIcMappingTabOrchestrator({
  providerId: providerIdProp,
  mappingSubTab,
  hospital,
  mappingSearchOpen,
  restrictionSearchOpen,
  icMappingDetail,
  closeIcMappingDetail,
  setIcMappingCreateMode,
  icMappingCreateMode,
  setIcMappingDetailEditing,
  setIcMappingDetailLoading,
  hydrateIcMappingDetailItem,
  restrictionCreateMode,
  setRestrictionCreateMode,
  restrictionDetail,
  closeRestrictionDetail,
  setRestrictionDetailLoading,
  setRestrictionContextEntityId,
  clearRestrictionPrefill,
  bindRestrictionNavigation,
  restrictionPrefillInsurerId = "",
  restrictionPrefillCorporateId = "",
  restrictionListActive,
  restrictionListCreateActive,
  hasMappingListData,
  onIcMappingSaved,
  onRestrictionSaved,
}: OrchestratorInput) {
  const { id: routeProviderId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const providerId = providerIdProp?.trim() || routeProviderId?.trim() || undefined;

  const loadMasterDropdownData =
    icMappingCreateMode ||
    /\/new-ic-mapping\/?$/.test(location.pathname) ||
    /\/new-corporate-mapping\/?$/.test(location.pathname) ||
    mappingSearchOpen ||
    restrictionCreateMode ||
    restrictionSearchOpen ||
    restrictionListCreateActive ||
    Boolean(icMappingDetail?.editing) ||
    Boolean(restrictionDetail?.editing);

  // Restriction uses IC-Corp policy dropdown for corporates — do not call corporates?onlyName.
  const loadCorporatesForMapping =
    icMappingCreateMode ||
    /\/new-corporate-mapping\/?$/.test(location.pathname) ||
    mappingSearchOpen ||
    Boolean(icMappingDetail?.editing);

  const { insurerOptions, corporateList, insurerListLoading } =
    useIcMappingTabData(loadMasterDropdownData, {
      loadCorporates: loadCorporatesForMapping,
    });

  const insuranceCompanies = useMemo(
    () =>
      insurerOptions.map((option) => ({
        id: String(option.value ?? ""),
        name: String(option.label ?? ""),
      })),
    [insurerOptions],
  );

  const handleRestrictionSaved = async () => {
    clearRestrictionPrefill?.();

    const createFromPath = parseRestrictionCreateFromPath(location.pathname);
    if (createFromPath && providerId) {
      restriction.resetRestrictionForm();
      navigate(
        {
          pathname: buildRestrictionListPath(
            providerRootPath(providerId),
            createFromPath.subTab,
            createFromPath.entityId,
          ),
          search: location.search,
        },
        { replace: true },
      );
      await onRestrictionSaved?.();
      return;
    }

    if (restrictionCreateMode) {
      restriction.resetRestrictionForm();
      setRestrictionCreateMode(false);
      await onRestrictionSaved?.();
      return;
    }

    closeRestrictionDetail();
    await onRestrictionSaved?.();
  };

  const restriction = useIcMappingRestrictionForm({
    providerId,
    onRestrictionSaved: handleRestrictionSaved,
  });

  const icPrefilledFromRow = Boolean(
    restrictionDetail || restrictionPrefillInsurerId.trim() || restrictionListCreateActive,
  );

  const loadedRestrictionIdRef = useRef("");
  const openedRestrictionIdRef = useRef("");
  const restrictionSessionRef = useRef("");

  const detailRestrictionItem = restrictionDetail?.item;
  const detailRestrictionLoading = restrictionDetail?.detailLoading ?? false;

  useLayoutEffect(() => {
    if (!detailRestrictionItem) {
      openedRestrictionIdRef.current = "";
      return;
    }

    const restrictionId = detailRestrictionItem.providerRestrictionId?.trim() ?? "";
    if (!restrictionId || openedRestrictionIdRef.current === restrictionId) return;
    openedRestrictionIdRef.current = restrictionId;

    closeIcMappingDetail({ navigate: false });
    setIcMappingCreateMode(false);
    restriction.restrictionForm.reset({
      icName: detailRestrictionItem.insurerId ?? detailRestrictionItem.id,
      restrictionType: "Watchlist",
      restrictionApplicable: [],
      investigationType: "",
      investigationRequired: false,
      emergency_exception_allowed_flag: false,
      restrictionLevel: mappingSubTab === "corporate" ? "INSURER_CORPORATE" : "",
      corporateIds: mappingSubTab === "corporate" ? [detailRestrictionItem.id] : [],
      rohOfficeIds: [],
      policyNumbers: [],
      ccnNumbers: [],
    });
    restriction.setRestrictionDetails(RESTRICTION_DETAILS_DEFAULTS);
  }, [
    detailRestrictionItem,
    mappingSubTab,
    closeIcMappingDetail,
    setIcMappingCreateMode,
    restriction,
  ]);

  useEffect(() => {
    if (!detailRestrictionLoading || !detailRestrictionItem) return;

    const restrictionId = detailRestrictionItem.providerRestrictionId?.trim() ?? "";
    if (!restrictionId) {
      setRestrictionDetailLoading(false);
      return;
    }

    if (loadedRestrictionIdRef.current === restrictionId) {
      setRestrictionDetailLoading(false);
      return;
    }
    loadedRestrictionIdRef.current = restrictionId;

    (async () => {
      try {
        const result = await fetchProviderRestrictionById(restrictionId);
        if (!result.ok) {
          loadedRestrictionIdRef.current = "";
          showErrorMessage({ error: result.message });
          return;
        }
        const entityId = resolveRestrictionEntityIdFromRow(result.row, mappingSubTab);
        if (entityId) {
          setRestrictionContextEntityId?.(entityId);
        }
        restriction.hydrateRestrictionFromRow(result.row, restrictionId);
      } finally {
        setRestrictionDetailLoading(false);
      }
    })();
  }, [
    detailRestrictionLoading,
    detailRestrictionItem,
    restriction,
    setRestrictionDetailLoading,
    setRestrictionContextEntityId,
    mappingSubTab,
  ]);

  useEffect(() => {
    if (!restrictionDetail) {
      loadedRestrictionIdRef.current = "";
      openedRestrictionIdRef.current = "";
    }
  }, [restrictionDetail]);

  useLayoutEffect(() => {
    bindRestrictionNavigation?.({
      setRestrictionCreateMode,
      setIcMappingCreateMode,
    });
  }, [bindRestrictionNavigation, setRestrictionCreateMode, setIcMappingCreateMode]);

  useEffect(() => {
    if (!restrictionCreateMode || restrictionDetail) {
      if (!restrictionCreateMode) restrictionSessionRef.current = "";
      return;
    }

    const sessionKey = restrictionPrefillCorporateId.trim()
      ? `corporate:${restrictionPrefillCorporateId.trim()}:${restrictionPrefillInsurerId.trim()}`
      : restrictionPrefillInsurerId.trim() || "toolbar";
    const insurerId = restrictionPrefillInsurerId.trim();
    const corporateId = restrictionPrefillCorporateId.trim();

    if (insurerId) {
      const insurerKey = corporateId
        ? `corporate:${corporateId}:${insurerId}`
        : `insurer:${insurerId}`;
      if (loadedRestrictionIdRef.current === insurerKey) return;
      loadedRestrictionIdRef.current = insurerKey;
      restrictionSessionRef.current = sessionKey;
      restriction.prepareCreateWithInsurer(insurerId);
      if (corporateId) {
        restriction.restrictionForm.setValue("restrictionLevel", "INSURER_CORPORATE");
        restriction.restrictionForm.setValue("corporateIds", [corporateId]);
      }
      return;
    }

    if (restrictionSessionRef.current === sessionKey) return;
    restrictionSessionRef.current = sessionKey;
    restriction.resetRestrictionForm();
  }, [
    restrictionCreateMode,
    restrictionDetail,
    restrictionPrefillInsurerId,
    restrictionPrefillCorporateId,
    restriction,
  ]);

  const handleCloseRestrictionForm = () => {
    loadedRestrictionIdRef.current = "";
    openedRestrictionIdRef.current = "";
    clearRestrictionPrefill?.();
    restriction.resetRestrictionForm();

    const createFromPath = parseRestrictionCreateFromPath(location.pathname);
    if (createFromPath && providerId) {
      navigate(
        {
          pathname: buildRestrictionListPath(
            providerRootPath(providerId),
            createFromPath.subTab,
            createFromPath.entityId,
          ),
          search: location.search,
        },
        { replace: true },
      );
      return;
    }

    closeRestrictionDetail();
    setRestrictionCreateMode(false);
  };

  const [restrictionRemoveConfirmOpen, setRestrictionRemoveConfirmOpen] = useState(false);
  const [restrictionRemoveConfirmState, setRestrictionRemoveConfirmState] =
    useState<ModalState>("pending");
  const [restrictionRemoveConfirmLoading, setRestrictionRemoveConfirmLoading] = useState(false);

  const restrictionRemoveConfirmMessages = useMemo(
    (): ConfirmMessages => ({
      pending: {
        Icon: ExclamationTriangleIcon,
        title: "Remove restriction?",
        description:
          "This will remove the restriction from this mapping. The network mapping will stay active.",
        actionText: "Remove",
      },
      error: {
        description: "Unable to remove the restriction. Please try again.",
        actionText: "Close",
      },
    }),
    [],
  );

  const closeRestrictionRemoveConfirm = () => {
    if (restrictionRemoveConfirmLoading) return;
    setRestrictionRemoveConfirmOpen(false);
    setRestrictionRemoveConfirmState("pending");
  };

  const handleRestrictionRemoveConfirm = async () => {
    setRestrictionRemoveConfirmLoading(true);
    try {
      const removed = await restriction.handleRestrictionRemove();
      if (removed) {
        setRestrictionRemoveConfirmOpen(false);
        setRestrictionRemoveConfirmState("pending");
        handleCloseRestrictionForm();
        return;
      }
      setRestrictionRemoveConfirmState("error");
    } finally {
      setRestrictionRemoveConfirmLoading(false);
    }
  };

  const icMapping = useIcMappingCreateForm();
  const {
    icMappingForm,
    setIcMappingForm,
    setIcMappingDateOrderError,
    setIcMappingShowFieldErrors,
    icMappingSelectForm,
    resetSelectForm,
  } = icMapping;
  const initializedCreateRouteRef = useRef<string | null>(null);
  const selectedInsurerId = String(icMappingSelectForm.watch("icName") ?? "").trim();
  const insurerIdForFetch =
    selectedInsurerId || String(icMappingForm.icName ?? "").trim();

  const enableNetworkModeHook = !(icMappingCreateMode && !icMappingDetail);

  const { networkModeLoading } = useInsurerNetworkMode(
    insurerIdForFetch,
    icMapping.setIcMappingForm,
    enableNetworkModeHook,
  );

  const { icProviderCodeLoading } = useInsurerProviderCode(
    providerId,
    insurerIdForFetch,
    icMapping.setIcMappingForm,
    icMappingCreateMode && !icMappingDetail && Boolean(providerId?.trim()),
  );

  const loadedNetworkMappingIdRef = useRef("");
  const openedMappingIdRef = useRef("");
  const icMappingOriginalFormRef = useRef<IcMappingFormState | null>(null);

  const detailMappingItem = icMappingDetail?.item;
  const detailMappingLoading = icMappingDetail?.detailLoading ?? false;

  useLayoutEffect(() => {
    if (!detailMappingItem) {
      openedMappingIdRef.current = "";
      return;
    }

    const providerNetworkMappingId = resolveProviderNetworkMappingId(detailMappingItem);
    const sessionKey = providerNetworkMappingId || `${mappingSubTab}:${detailMappingItem.id}`;

    if (openedMappingIdRef.current === sessionKey) return;
    openedMappingIdRef.current = sessionKey;

    setRestrictionCreateMode(false);
    setIcMappingCreateMode(false);
  }, [detailMappingItem, mappingSubTab, setRestrictionCreateMode, setIcMappingCreateMode]);

  useEffect(() => {
    if (!detailMappingLoading || !detailMappingItem || !providerId) {
      if (detailMappingLoading && detailMappingItem && !providerId) {
        setIcMappingDetailLoading(false);
      }
      return;
    }

    const providerNetworkMappingId = resolveProviderNetworkMappingId(detailMappingItem);
    if (!providerNetworkMappingId) {
      setIcMappingDetailLoading(false);
      return;
    }

    if (loadedNetworkMappingIdRef.current === providerNetworkMappingId) {
      setIcMappingDetailLoading(false);
      return;
    }
    loadedNetworkMappingIdRef.current = providerNetworkMappingId;

    (async () => {
      try {
        const result = await fetchProviderNetworkMappingById(providerId, providerNetworkMappingId);
        if (!result.ok) {
          loadedNetworkMappingIdRef.current = "";
          showErrorMessage({ error: result.message });
          return;
        }

        const gridItem =
          mappingSubTab === "corporate"
            ? mapCorporateNetworkMappingToGridRow(result.row)
            : mapNetworkMappingToGridRow(result.row);

        hydrateIcMappingDetailItem?.(gridItem);

        const formState = mapProviderNetworkMappingToForm(result.row);
        const gridFallback = buildIcMappingFormFromItem(detailMappingItem, mappingSubTab);

        let icProviderCode = formState.icProviderCode.trim();
        if (!icProviderCode) {
          icProviderCode = detailMappingItem.icProviderCode?.trim() ?? "";
        }
        if (!icProviderCode && result.row.insurerId.trim()) {
          icProviderCode = await fetchInsurerProviderCode(providerId, result.row.insurerId);
        }

        const nextForm: IcMappingFormState = {
          ...formState,
          icName: formState.icName.trim() || gridFallback.icName,
          empanelmentSource: formState.empanelmentSource.trim() || gridFallback.empanelmentSource,
          effectiveFrom: formState.effectiveFrom.trim() || gridFallback.effectiveFrom,
          icProviderCode,
        };
        icMapping.setIcMappingForm(nextForm);
        if (icMappingDetail?.editing) {
          icMappingOriginalFormRef.current = cloneIcMappingFormState(nextForm);
        }
      } catch (error) {
        showErrorMessage({
          error: error instanceof Error ? error.message : undefined,
        });
      } finally {
        setIcMappingDetailLoading(false);
      }
    })();
  }, [
    detailMappingLoading,
    detailMappingItem,
    mappingSubTab,
    providerId,
    icMapping,
    icMappingDetail?.editing,
    setIcMappingDetailLoading,
    hydrateIcMappingDetailItem,
  ]);

  useEffect(() => {
    if (!icMappingDetail) {
      loadedNetworkMappingIdRef.current = "";
      openedMappingIdRef.current = "";
      icMappingOriginalFormRef.current = null;
    }
  }, [icMappingDetail]);

  const previousMappingSubTabRef = useRef(mappingSubTab);
  useEffect(() => {
    if (previousMappingSubTabRef.current === mappingSubTab) return;
    previousMappingSubTabRef.current = mappingSubTab;

    const onRestrictionDeepRoute = isRestrictionDeepRoute(location.pathname);
    if (onRestrictionDeepRoute) return;

    if (icMappingCreateMode) {
      icMapping.setIcMappingForm(IC_MAPPING_FORM_DEFAULTS);
      setIcMappingCreateMode(false);
    }

    if (icMappingDetail) {
      loadedNetworkMappingIdRef.current = "";
      openedMappingIdRef.current = "";
      closeIcMappingDetail();
      icMapping.setIcMappingForm(IC_MAPPING_FORM_DEFAULTS);
    }

    if (restrictionCreateMode || restrictionDetail) {
      loadedRestrictionIdRef.current = "";
      openedRestrictionIdRef.current = "";
      clearRestrictionPrefill?.();
      closeRestrictionDetail();
      restriction.resetRestrictionForm();
      setRestrictionCreateMode(false);
    }
  }, [
    mappingSubTab,
    location.pathname,
    icMappingCreateMode,
    icMappingDetail,
    restrictionCreateMode,
    restrictionDetail,
    icMapping,
    restriction,
    setIcMappingCreateMode,
    closeIcMappingDetail,
    closeRestrictionDetail,
    clearRestrictionPrefill,
    setRestrictionCreateMode,
  ]);

  const handleCloseIcMappingForm = () => {
    loadedNetworkMappingIdRef.current = "";
    openedMappingIdRef.current = "";
    closeIcMappingDetail();
    icMapping.setIcMappingForm(IC_MAPPING_FORM_DEFAULTS);
    icMapping.setIcMappingDateOrderError("");
    icMapping.setIcMappingShowFieldErrors(false);
    setIcMappingCreateMode(false);
  };

  const handleCloseIcMappingDetail = () => {
    loadedNetworkMappingIdRef.current = "";
    openedMappingIdRef.current = "";
    icMappingOriginalFormRef.current = null;
    closeIcMappingDetail();
    icMapping.setIcMappingForm(IC_MAPPING_FORM_DEFAULTS);
    icMapping.setIcMappingDateOrderError("");
    icMapping.setIcMappingShowFieldErrors(false);
  };

  const handleIcMappingEdit = () => {
    icMappingOriginalFormRef.current = cloneIcMappingFormState(icMapping.icMappingForm);
    setIcMappingDetailEditing(true);
  };

  const [icMappingSaving, setIcMappingSaving] = useState(false);

  const handleIcMappingSave = async () => {
    if (!providerId) return;

    icMapping.setIcMappingShowFieldErrors(true);

    const isEditingExistingMapping = Boolean(icMappingDetail?.editing);
    if (!(await validateIcMappingEntityFields({
      isEditingExistingMapping,
      mappingSubTab,
      icMappingSelectForm: icMapping.icMappingSelectForm,
    }))) {
      return;
    }

    if (!validateIcMappingRequiredFields(icMapping.icMappingForm)) {
      return;
    }

    const formForSave = await resolveFormForIcMappingSave(
      providerId,
      icMapping.icMappingForm,
      icMapping.setIcMappingForm,
    );
    if (!formForSave) return;

    setIcMappingSaving(true);
    try {
      const saveContext = {
        providerId,
        mappingSubTab,
        isEditingExistingMapping,
        formForSave,
        icMappingDetail,
        icMappingOriginalFormRef,
        icMappingSelectForm: icMapping.icMappingSelectForm,
        icMappingForm: icMapping.icMappingForm,
        setIcMappingDateOrderError: icMapping.setIcMappingDateOrderError,
        setIcMappingForm: icMapping.setIcMappingForm,
        handleCloseIcMappingDetail,
        handleCloseIcMappingForm,
        onIcMappingSaved,
      };

      if (isEditingExistingMapping) {
        await saveExistingIcMapping(saveContext);
      } else {
        await saveNewIcMapping(saveContext);
      }
    } finally {
      setIcMappingSaving(false);
    }
  };

  const handleStartNewMapping = () => {
    closeIcMappingDetail();
    setIcMappingForm(IC_MAPPING_FORM_DEFAULTS);
    resetSelectForm();
    setIcMappingCreateMode(true);
  };

  useEffect(() => {
    const isCreateForm = icMappingCreateMode && !icMappingDetail;
    const createRouteKey = isCreateForm
      ? `${location.pathname}|${mappingSubTab}`
      : null;

    if (createRouteKey && initializedCreateRouteRef.current !== createRouteKey) {
      initializedCreateRouteRef.current = createRouteKey;
      if (!icMappingForm.icName.trim()) {
        setIcMappingForm(IC_MAPPING_FORM_DEFAULTS);
        setIcMappingDateOrderError("");
        setIcMappingShowFieldErrors(false);
        resetSelectForm();
      }
      return;
    }

    if (!createRouteKey) {
      initializedCreateRouteRef.current = null;
    }
  }, [
    icMappingCreateMode,
    icMappingDetail,
    icMappingForm.icName,
    location.pathname,
    mappingSubTab,
    setIcMappingForm,
    setIcMappingDateOrderError,
    setIcMappingShowFieldErrors,
    resetSelectForm,
  ]);

  const showRestrictionForm =
    restrictionCreateMode ||
    restrictionListCreateActive ||
    Boolean(restrictionDetail) ||
    parseRestrictionDetailFromPath(location.pathname) != null;
  const showMappingForm =
    Boolean(icMappingDetail) || parseMappingDetailFromPath(location.pathname) != null;
  const onRestrictionDetailRoute = parseRestrictionDetailFromPath(location.pathname) != null;
  const showRestrictionListSection =
    (restrictionListActive || restrictionListCreateActive) &&
    !restrictionDetail &&
    !onRestrictionDetailRoute;
  const showCorporateCreateForm = mappingSubTab === "corporate" && icMappingCreateMode && !showMappingForm;
  const showIcCreateForm = mappingSubTab === "ic" && icMappingCreateMode && !showMappingForm;
  const listVisible =
    mappingSubTab === "corporate"
      ? !showCorporateCreateForm && !showMappingForm && !showRestrictionForm && !showRestrictionListSection
      : !showIcCreateForm && !showMappingForm && !showRestrictionForm && !showRestrictionListSection;

  return {
    providerId,
    insurerOptions,
    insuranceCompanies,
    corporateList,
    restriction,
    icMapping,
    insurerListLoading,
    networkModeLoading,
    icProviderCodeLoading,
    icPrefilledFromRow,
    icMappingSaving,
    showRestrictionForm,
    showMappingForm,
    showCorporateCreateForm,
    showIcCreateForm,
    showRestrictionListSection,
    listVisible,
    restrictionRemoveConfirmOpen,
    setRestrictionRemoveConfirmOpen,
    restrictionRemoveConfirmState,
    setRestrictionRemoveConfirmState,
    restrictionRemoveConfirmLoading,
    restrictionRemoveConfirmMessages,
    closeRestrictionRemoveConfirm,
    handleRestrictionRemoveConfirm,
    handleCloseRestrictionForm,
    handleCloseIcMappingForm,
    handleCloseIcMappingDetail,
    handleIcMappingEdit,
    handleIcMappingSave,
    handleStartNewMapping,
    hasMappingListData,
    hospital,
  };
}
