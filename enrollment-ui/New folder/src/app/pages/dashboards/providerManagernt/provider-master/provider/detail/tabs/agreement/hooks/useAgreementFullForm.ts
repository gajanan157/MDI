import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthContext } from "@/app/contexts/auth/context";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  fetchProviderAgreementById,
  updateProviderAgreement,
} from "@/store/features/providerAgreement/providerAgreementSlice";
import {
  AGREEMENT_FULL_FORM_DEFAULTS,
  agreementFullFormSchema,
  type AgreementFullFormValues,
} from "../utils/agreementFormConfig";
import { resolveAgreementIdFromRouteParam, encodeAgreementRouteSegmentFromInternalId, reportAgreementMutationError } from "../utils/agreementHelpers";
import { mapNormalizedAgreementToFullForm } from "../providerAgreementMapper";
import { buildUpdateProviderAgreementPatchBody } from "../providerAgreementSave";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import {
  fetchAgreementDocumentPresign,
  fetchAgreementSupportingDocumentPresign,
  resolveAgreementDocumentsForSave,
} from "../utils/agreementDocumentApi";
import type { NormalizedProviderAgreement } from "@/store/features/providerAgreement/providerAgreementTypes";

/** Fingerprint agreement detail so form resets when insurer mappings change. */
function buildAgreementFormSyncKey(row: NormalizedProviderAgreement): string {
  const mappingKey = row.insurerMappings
    .map(
      (mapping) =>
        `${mapping.insurerId}:${mapping.mappingEffectiveFrom?.trim() ?? ""}:${mapping.mappingIsActive ? 1 : 0}`,
    )
    .sort((left, right) => left.localeCompare(right))
    .join("|");
  return [
    row.providerId,
    row.providerAgreementId,
    row.applicableScope.trim(),
    String(row.insurerMappings.length),
    mappingKey,
  ].join("::");
}

async function loadAgreementRowDocuments(
  row: NormalizedProviderAgreement,
  fullForm: UseFormReturn<AgreementFullFormValues>,
  setAgreementPdfUrl: (url: string | undefined) => void,
  setSupportingPdfUrl: (url: string | undefined) => void,
): Promise<void> {
  if (row.fileMetadataId.trim()) {
    const result = await fetchAgreementDocumentPresign(row.fileMetadataId);
    if (result.ok) {
      fullForm.setValue("agreementDocumentName", result.fileName, { shouldDirty: false });
      setAgreementPdfUrl(result.presignedUrl);
    }
  }

  if (row.supportingFileMetadataId.trim()) {
    const result = await fetchAgreementSupportingDocumentPresign(row.supportingFileMetadataId);
    if (result.ok) {
      fullForm.setValue("supportingDocumentName", result.fileName, { shouldDirty: false });
      setSupportingPdfUrl(result.presignedUrl);
    }
  }
}

type AuthUserWithTpa = {
  tpaId?: string;
};

type UseAgreementFullFormArgs = {
  providerId?: string;
  providerBasePath?: string;
  agreementUrlKey?: string;
  agreementUrlSuffix?: "view" | "edit";
  agreementSamplePdfUrl: string;
  setAgreementPdfUrl: (url: string | undefined) => void;
  setSupportingPdfUrl: (url: string | undefined) => void;
  onAgreementDetailOpen?: () => void;
  onAgreementSaveComplete?: () => void;
};

export type AgreementFullFormHandle = {
  fullForm: UseFormReturn<AgreementFullFormValues>;
  showDetailFromUrl: boolean;
  createValidatedSaveHandler: (
    onSave: (values: AgreementFullFormValues) => void | Promise<void>,
  ) => () => void;
  onSaveAgreement: (values: AgreementFullFormValues) => Promise<void>;
  detailLoading: boolean;
  detailError: string;
  saving: boolean;
};

export function useAgreementFullForm({
  providerId,
  providerBasePath,
  agreementUrlKey,
  agreementUrlSuffix,
  agreementSamplePdfUrl,
  setAgreementPdfUrl,
  setSupportingPdfUrl,
  onAgreementDetailOpen,
  onAgreementSaveComplete,
}: UseAgreementFullFormArgs): AgreementFullFormHandle {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuthContext();
  const detailState = useAppSelector((state) => state.providerAgreement.detail);
  const saving = useAppSelector((state) => state.providerAgreement.create.saving);

  const fullForm = useForm<AgreementFullFormValues>({
    defaultValues: AGREEMENT_FULL_FORM_DEFAULTS,
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: yupResolver(agreementFullFormSchema) as Resolver<AgreementFullFormValues>,
  });

  const showDetailFromUrl = !!(agreementUrlKey && agreementUrlSuffix);

  const { reset: resetFullAgreementForm } = fullForm;
  const fetchedAgreementKeyRef = useRef<string | null>(null);
  const loadedDocumentsKeyRef = useRef<string | null>(null);
  const lastDetailErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!agreementUrlKey || !agreementUrlSuffix) return;

    const agreementId = resolveAgreementIdFromRouteParam(agreementUrlKey);
    if (!agreementId) return;

    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId) return;

    const fetchKey = `${resolvedProviderId}:${agreementId}`;
    if (fetchedAgreementKeyRef.current === fetchKey) return;
    fetchedAgreementKeyRef.current = fetchKey;
    loadedDocumentsKeyRef.current = null;
    lastDetailErrorRef.current = null;

    dispatch(
      fetchProviderAgreementById({
        providerId: resolvedProviderId,
        agreementId,
      }),
    );
  }, [agreementUrlKey, agreementUrlSuffix, providerId, dispatch]);

  useEffect(() => {
    if (!agreementUrlKey || !agreementUrlSuffix) return;

    const agreementId = resolveAgreementIdFromRouteParam(agreementUrlKey);
    if (!agreementId) return;

    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId) return;

    if (
      detailState.providerId !== resolvedProviderId ||
      detailState.agreementId !== agreementId
    ) {
      return;
    }

    if (detailState.error) {
      if (lastDetailErrorRef.current !== detailState.error) {
        lastDetailErrorRef.current = detailState.error;
        showProviderError(detailState.error);
      }
      return;
    }

    if (!detailState.row) return;
    if (detailState.row.providerAgreementId !== agreementId) return;

    const syncKey = buildAgreementFormSyncKey(detailState.row);
    if (loadedDocumentsKeyRef.current === syncKey) return;
    loadedDocumentsKeyRef.current = syncKey;

    resetFullAgreementForm(mapNormalizedAgreementToFullForm(detailState.row));
    setAgreementPdfUrl(agreementSamplePdfUrl);
    setSupportingPdfUrl(undefined);
    onAgreementDetailOpen?.();

    const row = detailState.row;
    let cancelled = false;

    loadAgreementRowDocuments(
      row,
      fullForm,
      (url) => {
        if (!cancelled) setAgreementPdfUrl(url);
      },
      (url) => {
        if (!cancelled) setSupportingPdfUrl(url);
      },
    ).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    agreementUrlKey,
    agreementUrlSuffix,
    providerId,
    detailState.providerId,
    detailState.agreementId,
    detailState.row,
    detailState.error,
    resetFullAgreementForm,
    setAgreementPdfUrl,
    setSupportingPdfUrl,
    agreementSamplePdfUrl,
    onAgreementDetailOpen,
    fullForm,
  ]);

  const resolvedProviderId = providerId?.trim() ?? "";
  const agreementId = resolveAgreementIdFromRouteParam(agreementUrlKey ?? "") ?? "";
  const detailLoading =
    showDetailFromUrl &&
    detailState.providerId === resolvedProviderId &&
    detailState.agreementId === agreementId &&
    detailState.loading;

  const detailError =
    showDetailFromUrl &&
    detailState.providerId === resolvedProviderId &&
    detailState.agreementId === agreementId
      ? (detailState.error ?? "")
      : "";

  const createValidatedSaveHandler = (
    onSave: (values: AgreementFullFormValues) => void | Promise<void>,
  ) =>
    fullForm.handleSubmit(
      (values) => {
        onSave(values);
      },
      () => {},
    );

  const navigateToAgreementView = useCallback(() => {
    const agreementId = resolveAgreementIdFromRouteParam(agreementUrlKey ?? "");
    if (agreementUrlSuffix === "edit" && agreementId && providerBasePath) {
      const seg = encodeAgreementRouteSegmentFromInternalId(agreementId);
      navigate(`${providerBasePath}/agreement/${seg}/view`);
      return;
    }
    onAgreementSaveComplete?.();
  }, [
    agreementUrlKey,
    agreementUrlSuffix,
    navigate,
    onAgreementSaveComplete,
    providerBasePath,
  ]);

  const onSaveAgreement = useCallback(
    async (values: AgreementFullFormValues) => {
      const resolvedProviderId = providerId?.trim();
      const agreementId = resolveAgreementIdFromRouteParam(agreementUrlKey ?? "");
      const originalRow = detailState.row;

      if (
        !resolvedProviderId ||
        !agreementId ||
        !originalRow ||
        originalRow.providerAgreementId !== agreementId
      ) {
        navigateToAgreementView();
        return;
      }

      const authUser = user as AuthUserWithTpa | null;
      const tpaId = (authUser?.tpaId ?? originalRow.tpaId ?? "").trim();

      const documentsResult = await resolveAgreementDocumentsForSave(
        resolvedProviderId,
        values,
        originalRow,
      );
      if (!documentsResult.ok) {
        if (documentsResult.message) {
          showProviderError(documentsResult.message);
        }
        return;
      }

      const patchBody = buildUpdateProviderAgreementPatchBody(
        originalRow,
        values,
        {
          providerId: resolvedProviderId,
          tpaId,
          ...documentsResult.documents,
        },
      );

      if (!patchBody) {
        navigateToAgreementView();
        return;
      }

      try {
        const result = await dispatch(
          updateProviderAgreement({
            providerId: resolvedProviderId,
            body: patchBody,
          }),
        ).unwrap();

        if (result.message) {
          toast.success(result.message, { position: "top-right", duration: 5000 });
        }

        loadedDocumentsKeyRef.current = null;
        fetchedAgreementKeyRef.current = null;

        const refreshed = await dispatch(
          fetchProviderAgreementById({
            providerId: resolvedProviderId,
            agreementId,
          }),
        ).unwrap();

        // Apply latest GET immediately so edit/view never keep removed insurer rows.
        loadedDocumentsKeyRef.current = buildAgreementFormSyncKey(refreshed.row);
        resetFullAgreementForm(mapNormalizedAgreementToFullForm(refreshed.row));

        navigateToAgreementView();
      } catch (error) {
        reportAgreementMutationError(error, showProviderError);
      }
    },
    [
      agreementUrlKey,
      detailState.row,
      dispatch,
      navigateToAgreementView,
      providerId,
      resetFullAgreementForm,
      user,
    ],
  );

  return {
    fullForm,
    showDetailFromUrl,
    createValidatedSaveHandler,
    onSaveAgreement,
    detailLoading,
    detailError,
    saving,
  };
}
