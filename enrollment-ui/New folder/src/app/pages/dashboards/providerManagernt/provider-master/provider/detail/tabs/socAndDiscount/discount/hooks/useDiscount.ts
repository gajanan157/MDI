import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import type { DiscountComponentRow, DiscountFormValues, DiscountDetailRecord } from "../types/discountTypes";
import {
  buildProviderDiscountPath,
  DISCOUNT_FORM_DEFAULTS,
  resolveDiscountIdFromRouteParam,
} from "../utils/discountConfig";
import {
  createEmptyDiscountDetail,
  cloneBulkDiscountByTypeForStore,
  formValuesFromDetail,
  getDiscountSaveBlockMessage,
} from "../utils/discountHelpers";
import { buildProviderDiscountConfigurationCreatePayload } from "../utils/buildProviderDiscountConfigurationCreatePayload";
import { buildProviderDiscountConfigurationPatchPayload } from "../utils/buildProviderDiscountConfigurationPatchPayload";
import type { OpdFormBaselineSnapshot } from "../utils/discountOpdHelpers";
import { useDiscountTypeMasterOptions } from "./useDiscountTypeMasterOptions";
import type { AgreementListRow } from "../../../agreement/utils/agreementHelpers";
import {
  createProviderDiscountConfiguration,
  fetchProviderDiscountConfigurationById,
  patchProviderDiscountConfiguration,
} from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationSlice";
import type { NormalizedProviderDiscountConfiguration } from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { mapProviderDiscountConfigurationToDetail } from "../utils/mapProviderDiscountConfigurationToListRow";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { resolveDiscountSupportingDocumentForSave } from "../utils/discountDocumentApi";
import {
  selectDiscountSubtypeMasterList,
  selectInclusionExclusionMasterList,
} from "../utils/discountSelectorUtils";

const EMPTY_AGREEMENT_ROWS_BY_ID = new Map<string, AgreementListRow>();

/** Best-effort human-readable message from an unknown thrown value. */
function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "";
}

export function useDiscountNavigation(providerBasePath?: string) {
  const navigate = useNavigate();
  const location = useLocation();

  const toPath = useCallback(
    (suffix: "view" | "edit", internalId: string) =>
      buildProviderDiscountPath(suffix, internalId, {
        providerBasePath,
        pathname: location.pathname,
      }),
    [providerBasePath, location.pathname],
  );

  const navigateToViewDiscount = useCallback(
    (id: string) => {
      const path = toPath("view", id);
      if (path) navigate(path, { replace: false });
    },
    [navigate, toPath],
  );

  const navigateToEditDiscount = useCallback(
    (id: string) => {
      const path = toPath("edit", id);
      if (path) navigate(path, { replace: false });
    },
    [navigate, toPath],
  );

  const navigateToAddDiscount = useCallback(() => {
    const path = toPath("edit", "new");
    if (path) navigate(path, { replace: false, state: {} });
  }, [navigate, toPath]);

  const navigateToDiscountList = useCallback(() => {
    if (providerBasePath) {
      navigate(`${providerBasePath}/discount`, { replace: false });
      return;
    }
    const providerId = location.pathname.match(
      /\/provider-masters\/providers\/([^/]+)/,
    )?.[1];
    if (!providerId) return;
    navigate(`/provider-masters/providers/${providerId}/discount`, {
      replace: false,
    });
  }, [navigate, providerBasePath, location.pathname]);

  return {
    navigateToViewDiscount,
    navigateToEditDiscount,
    navigateToAddDiscount,
    navigateToDiscountList,
  };
}

type UseDiscountDetailFromUrlArgs = {
  discountUrlKey?: string;
  discountUrlSuffix?: "view" | "edit";
  onOpen: (
    detail: DiscountDetailRecord,
    suffix: "view" | "edit",
    sourceRow?: NormalizedProviderDiscountConfiguration,
  ) => void;
};

export function useDiscountDetailFromUrl({
  discountUrlKey,
  discountUrlSuffix,
  onOpen,
}: UseDiscountDetailFromUrlArgs) {
  const dispatch = useAppDispatch();
  const showDetailFromUrl = !!(discountUrlKey && discountUrlSuffix);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const lastOpenedKeyRef = useRef<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(
    !!(discountUrlKey && discountUrlSuffix),
  );
  const [detailLoadFailed, setDetailLoadFailed] = useState(false);

  useEffect(() => {
    if (!discountUrlKey || !discountUrlSuffix) {
      lastOpenedKeyRef.current = null;
      setDetailLoading(false);
      setDetailLoadFailed(false);
      return;
    }
    const openKey = `${discountUrlKey}|${discountUrlSuffix}`;
    if (lastOpenedKeyRef.current === openKey) return;
    const internalId = resolveDiscountIdFromRouteParam(discountUrlKey);
    if (!internalId) return;

    if (internalId === "new") {
      lastOpenedKeyRef.current = openKey;
      setDetailLoading(false);
      setDetailLoadFailed(false);
      onOpenRef.current(createEmptyDiscountDetail("new"), discountUrlSuffix);
      return;
    }

    lastOpenedKeyRef.current = openKey;
    setDetailLoading(true);
    setDetailLoadFailed(false);
    let cancelled = false;

    dispatch(fetchProviderDiscountConfigurationById(internalId))
      .then((action) => {
      if (cancelled) return;
      setDetailLoading(false);
      if (fetchProviderDiscountConfigurationById.fulfilled.match(action)) {
        onOpenRef.current(
          mapProviderDiscountConfigurationToDetail(action.payload.row),
          discountUrlSuffix,
          action.payload.row,
        );
        return;
      }
      const message =
        fetchProviderDiscountConfigurationById.rejected.match(action) &&
        typeof action.payload === "string" &&
        action.payload.trim()
          ? action.payload
          : "Failed to load discount configuration.";
      showProviderError(message);
      setDetailLoadFailed(true);
    })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (lastOpenedKeyRef.current === openKey) {
        lastOpenedKeyRef.current = null;
      }
    };
  }, [discountUrlKey, discountUrlSuffix, dispatch]);

  return { showDetailFromUrl, detailLoading, detailLoadFailed };
}

export function useDiscountForm(
  providerId?: string,
  agreementRowsById: Map<string, AgreementListRow> = EMPTY_AGREEMENT_ROWS_BY_ID,
) {
  const dispatch = useAppDispatch();
  const form = useForm<DiscountFormValues>({
    defaultValues: DISCOUNT_FORM_DEFAULTS,
    mode: "onTouched",
  });
  const { ipdDiscountTypeOptions, opdDiscountTypeOptions } = useDiscountTypeMasterOptions();
  const selectInclusionExclusionList = useMemo(
    () => (state: Parameters<typeof selectInclusionExclusionMasterList>[0]) =>
      selectInclusionExclusionMasterList(state),
    [],
  );
  const inclusionExclusionMasterRecords = useAppSelector(selectInclusionExclusionList);
  const saving = useAppSelector(
    (state) =>
      (state.providerDiscountConfiguration?.create?.saving ?? false) ||
      (state.providerDiscountConfiguration?.update?.saving ?? false),
  );
  const opdMasterId = useMemo(() => {
    const withId = (opdDiscountTypeOptions ?? []).find(
      (option) => String(option.masterId ?? "").trim() !== "",
    );
    return String(withId?.masterId ?? "").trim();
  }, [opdDiscountTypeOptions]);
  const selectOpdSubtypeList = useMemo(
    () => (state: Parameters<typeof selectDiscountSubtypeMasterList>[0]) =>
      selectDiscountSubtypeMasterList(state, opdMasterId),
    [opdMasterId],
  );
  const opdSubtypeMasterRecords = useAppSelector(selectOpdSubtypeList);
  const individualMasterId = useMemo(() => {
    const match = (ipdDiscountTypeOptions ?? []).find((option) => option.value === "individual");
    return String(match?.masterId ?? "").trim();
  }, [ipdDiscountTypeOptions]);
  const selectIndividualSubtypeList = useMemo(
    () => (state: Parameters<typeof selectDiscountSubtypeMasterList>[0]) =>
      selectDiscountSubtypeMasterList(state, individualMasterId),
    [individualMasterId],
  );
  const individualSubtypeMasterRecords = useAppSelector(selectIndividualSubtypeList);
  const configurationDetailRow = useAppSelector((state) => {
    const detail = state.providerDiscountConfiguration?.detail;
    if (!detail?.row) return null;
    return detail.row;
  });
  const discountTypeIdSets = useMemo(
    () => ({
      ipdTypeIds: (ipdDiscountTypeOptions ?? []).map((option) => option.value),
      opdTypeIds: (opdDiscountTypeOptions ?? []).map((option) => option.value),
    }),
    [ipdDiscountTypeOptions, opdDiscountTypeOptions],
  );
  const [selectedDetail, setSelectedDetail] = useState<DiscountDetailRecord | null>(
    null,
  );
  const [isViewMode, setIsViewMode] = useState(true);
  const [opdPercentByKey, setOpdPercentByKey] = useState<Record<string, string>>(
    {},
  );
  const [ipdPercentByKey, setIpdPercentByKey] = useState<Record<string, string>>({});
  const [additionalDiscountPercentByKey, setAdditionalDiscountPercentByKey] =
    useState<Record<string, string>>({});
  const [componentDiscounts, setComponentDiscounts] = useState<DiscountComponentRow[]>([]);
  const [supportingDocumentFile, setSupportingDocumentFile] = useState<File | null>(null);
  const baselineSourceRowRef = useRef<NormalizedProviderDiscountConfiguration | null>(null);
  const baselineFormSnapshotRef = useRef<OpdFormBaselineSnapshot | null>(null);
  const saveInFlightRef = useRef(false);

  const applyDetail = useCallback(
    (
      detail: DiscountDetailRecord,
      suffix: "view" | "edit",
      sourceRow?: NormalizedProviderDiscountConfiguration,
    ) => {
      if (sourceRow) {
        baselineSourceRowRef.current = sourceRow;
      } else if (detail.id === "new") {
        baselineSourceRowRef.current = null;
        baselineFormSnapshotRef.current = null;
      }
      const formValues = formValuesFromDetail(detail);
      if (sourceRow || detail.id === "new") {
        baselineFormSnapshotRef.current = {
          bulkDiscountByType: cloneBulkDiscountByTypeForStore(formValues.bulkDiscountByType),
          opdPercentByKey: { ...detail.opdPercentByKey },
          discountTypes: [...formValues.discountTypes],
          opdEnabled: formValues.opdEnabled,
          componentDiscounts: (detail.componentDiscounts ?? []).map((row) => ({ ...row })),
        };
      }
      setSelectedDetail(detail);
      setIsViewMode(suffix === "view");
      form.reset(formValues);
      setOpdPercentByKey({ ...detail.opdPercentByKey });
      setIpdPercentByKey({ ...(detail.ipdPercentByKey ?? {}) });
      setAdditionalDiscountPercentByKey({
        ...detail.additionalDiscountPercentByKey,
      });
      setComponentDiscounts(
        (detail.componentDiscounts ?? []).map((row) => ({ ...row })),
      );
      setSupportingDocumentFile(null);
    },
    [form],
  );

  const onEdit = useCallback(() => setIsViewMode(false), []);

  useEffect(() => {
    if (!selectedDetail?.agreementId) return;
    const agreementId = String(selectedDetail.agreementId).trim();
    if (!agreementId) return;
    const row = agreementRowsById.get(agreementId);
    if (!row) return;
    const nextName = String(row.agreementName ?? "").trim();
    const nextType = String(row.type ?? "").trim();
    if (nextName && nextName !== String(form.getValues("agreementName") ?? "").trim()) {
      form.setValue("agreementName", nextName, { shouldDirty: false });
    }
    if (nextType && nextType !== String(form.getValues("agreementType") ?? "").trim()) {
      form.setValue("agreementType", nextType, { shouldDirty: false });
    }
  }, [agreementRowsById, form, selectedDetail?.agreementId]);

  const onCancel = useCallback(() => {
    if (selectedDetail?.id === "new" || !selectedDetail) {
      form.reset(DISCOUNT_FORM_DEFAULTS);
      setOpdPercentByKey({});
      setIpdPercentByKey({});
      setAdditionalDiscountPercentByKey({});
      setComponentDiscounts([]);
      setSupportingDocumentFile(null);
      setSelectedDetail(null);
      baselineSourceRowRef.current = null;
      baselineFormSnapshotRef.current = null;
      setIsViewMode(true);
      return;
    }
    applyDetail(selectedDetail, "view");
  }, [applyDetail, form, selectedDetail]);

  const watched = form.watch();
  const saveBlockMessage = getDiscountSaveBlockMessage(
    watched,
    componentDiscounts,
    discountTypeIdSets,
    opdPercentByKey,
    supportingDocumentFile,
  );
  const saveDisabled = saving || saveBlockMessage != null;

  const resolveSupportingDocumentForSave = useCallback(async () => {
    const values = form.getValues();
    const resolvedProviderId = String(providerId ?? "").trim();
    if (!resolvedProviderId) {
      return { ok: false as const, message: "Provider id is required to upload a document." };
    }
    return resolveDiscountSupportingDocumentForSave(
      resolvedProviderId,
      values,
      supportingDocumentFile,
      baselineSourceRowRef.current?.supportingFileMetadataId,
    );
  }, [form, providerId, supportingDocumentFile]);

  const onSupportingDocumentUploaded = useCallback(
    async (payload: {
      file: File;
      supportingFileMetadataId: string;
      supportingDocumentName: string;
    }) => {
      const supportingFileMetadataId = String(
        payload.supportingFileMetadataId ?? "",
      ).trim();
      setSupportingDocumentFile(payload.file);
      form.setValue("supportingFileMetadataId", supportingFileMetadataId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("supportingDocumentName", payload.supportingDocumentName, {
        shouldDirty: true,
        shouldValidate: true,
      });

      const configurationId = String(selectedDetail?.id ?? "").trim();
      if (isViewMode || !configurationId || configurationId === "new") {
        return;
      }
      if (!supportingFileMetadataId) return;

      try {
        await dispatch(
          patchProviderDiscountConfiguration({
            configurationId,
            body: { supportingFileMetadataId },
          }),
        ).unwrap();

        if (baselineSourceRowRef.current) {
          baselineSourceRowRef.current = {
            ...baselineSourceRowRef.current,
            supportingFileMetadataId,
          };
        }
        setSelectedDetail((prev) =>
          prev
            ? {
                ...prev,
                supportingFileMetadataId,
                supportingDocumentName: payload.supportingDocumentName,
              }
            : prev,
        );
      } catch (error) {
        const message = extractErrorMessage(error);
        if (message) showProviderError(message);
      }
    },
    [dispatch, form, isViewMode, selectedDetail],
  );

  const createDiscountConfiguration = useCallback(
    async (
      supportingFileMetadataId: string,
      resolvedProviderId: string,
    ): Promise<DiscountDetailRecord | null> => {
      const body = buildProviderDiscountConfigurationCreatePayload({
        providerId: resolvedProviderId,
        values: form.getValues(),
        componentDiscounts,
        ipdDiscountTypeOptions,
        opdMasterId,
        inclusionExclusionMasterRecords,
        opdSubtypeMasterRecords,
        ipdTypeIds: discountTypeIdSets.ipdTypeIds,
        opdPercentByKey,
        supportingFileMetadataId,
      });

      try {
        const result = await dispatch(
          createProviderDiscountConfiguration({ providerId: resolvedProviderId, body }),
        ).unwrap();

        const saved = mapProviderDiscountConfigurationToDetail(result.row);
        applyDetail(saved, "view", result.row);
        if (result.message) {
          toast.success(result.message, { position: "top-right", duration: 5000 });
        }
        return saved;
      } catch (error) {
        const message = extractErrorMessage(error);
        if (message) showProviderError(message);
        return null;
      }
    },
    [
      applyDetail,
      componentDiscounts,
      discountTypeIdSets,
      dispatch,
      form,
      inclusionExclusionMasterRecords,
      ipdDiscountTypeOptions,
      opdMasterId,
      opdPercentByKey,
      opdSubtypeMasterRecords,
    ],
  );

  const patchDiscountConfiguration = useCallback(
    async (
      supportingFileMetadataId: string,
      configurationId: string,
      baselineSourceRow: NormalizedProviderDiscountConfiguration,
    ): Promise<DiscountDetailRecord | null> => {
      const body = buildProviderDiscountConfigurationPatchPayload(baselineSourceRow, {
        values: form.getValues(),
        componentDiscounts,
        opdPercentByKey,
        ipdPercentByKey,
        inclusionExclusionMasterRecords,
        opdSubtypeMasterRecords,
        opdBaseline: baselineFormSnapshotRef.current,
        ipdTypeIds: discountTypeIdSets.ipdTypeIds,
        opdMasterId,
        individualMasterId,
        individualSubtypeMasterRecords,
        ipdDiscountTypeOptions,
        supportingFileMetadataId,
      });

      if (!body) {
        toast.message("No changes to save", { position: "top-right", duration: 4000 });
        return null;
      }

      try {
        const result = await dispatch(
          patchProviderDiscountConfiguration({ configurationId, body }),
        ).unwrap();

        const saved = mapProviderDiscountConfigurationToDetail(result.row);
        baselineSourceRowRef.current = result.row;
        baselineFormSnapshotRef.current = {
          bulkDiscountByType: cloneBulkDiscountByTypeForStore(
            form.getValues().bulkDiscountByType,
          ),
          opdPercentByKey: { ...opdPercentByKey },
          discountTypes: [...form.getValues().discountTypes],
          opdEnabled: form.getValues().opdEnabled,
          componentDiscounts: componentDiscounts.map((row) => ({ ...row })),
        };
        applyDetail(saved, "view", result.row);
        if (result.message) {
          toast.success(result.message, { position: "top-right", duration: 5000 });
        }
        return saved;
      } catch (error) {
        const message = extractErrorMessage(error);
        if (message) showProviderError(message);
        return null;
      }
    },
    [
      applyDetail,
      componentDiscounts,
      discountTypeIdSets,
      dispatch,
      form,
      inclusionExclusionMasterRecords,
      individualMasterId,
      individualSubtypeMasterRecords,
      ipdDiscountTypeOptions,
      ipdPercentByKey,
      opdMasterId,
      opdPercentByKey,
      opdSubtypeMasterRecords,
    ],
  );

  const resolveBaselineSourceRow = useCallback(
    (configurationId: string): NormalizedProviderDiscountConfiguration | null =>
      baselineSourceRowRef.current ??
      (configurationDetailRow?.providerDiscountConfigurationId === configurationId
        ? configurationDetailRow
        : null),
    [configurationDetailRow],
  );

  const onSave = useCallback(async (): Promise<DiscountDetailRecord | null> => {
    if (saveInFlightRef.current || saving) {
      return null;
    }
    const values = form.getValues();
    const saveBlockMessage = getDiscountSaveBlockMessage(
      values,
      componentDiscounts,
      discountTypeIdSets,
      opdPercentByKey,
      supportingDocumentFile,
    );
    if (saveBlockMessage) {
      showProviderError(saveBlockMessage, "Incomplete discount");
      return null;
    }

    saveInFlightRef.current = true;
    try {
      const resolvedProviderId = String(providerId ?? "").trim();
      const isNew = !selectedDetail || selectedDetail.id === "new";

      const documentResult = await resolveSupportingDocumentForSave();
      if (!documentResult.ok) {
        if (documentResult.message) showProviderError(documentResult.message);
        return null;
      }
      const supportingFileMetadataId = documentResult.supportingFileMetadataId;
      if (values.supportingFileMetadataId !== supportingFileMetadataId) {
        form.setValue("supportingFileMetadataId", supportingFileMetadataId, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (isNew && resolvedProviderId) {
        return await createDiscountConfiguration(
          supportingFileMetadataId,
          resolvedProviderId,
        );
      }

      const configurationId = String(selectedDetail?.id ?? "").trim();
      const baselineSourceRow = resolveBaselineSourceRow(configurationId);
      if (configurationId && configurationId !== "new" && baselineSourceRow) {
        return await patchDiscountConfiguration(
          supportingFileMetadataId,
          configurationId,
          baselineSourceRow,
        );
      }

      if (!resolvedProviderId) {
        showProviderError("Provider id is required to save a discount configuration.");
        return null;
      }

      showProviderError("Unable to save discount configuration.");
      return null;
    } finally {
      saveInFlightRef.current = false;
    }
  }, [
    componentDiscounts,
    createDiscountConfiguration,
    discountTypeIdSets,
    form,
    opdPercentByKey,
    patchDiscountConfiguration,
    providerId,
    resolveBaselineSourceRow,
    resolveSupportingDocumentForSave,
    saving,
    selectedDetail,
    supportingDocumentFile,
  ]);

  return {
    providerId,
    form,
    selectedDetail,
    isViewMode,
    applyDetail,
    onEdit,
    onCancel,
    onSave,
    saveDisabled,
    saveBlockMessage,
    saving,
    corporateOptions: [] as { value: string; label: string }[],
    optionsByInsurerId: {} as Record<string, { value: string; label: string }[]>,
    ipdPercentByKey,
    setIpdPercentByKey,
    opdPercentByKey,
    setOpdPercentByKey,
    additionalDiscountPercentByKey,
    setAdditionalDiscountPercentByKey,
    componentDiscounts,
    setComponentDiscounts,
    supportingDocumentFile,
    setSupportingDocumentFile,
    onSupportingDocumentUploaded,
  };
}
