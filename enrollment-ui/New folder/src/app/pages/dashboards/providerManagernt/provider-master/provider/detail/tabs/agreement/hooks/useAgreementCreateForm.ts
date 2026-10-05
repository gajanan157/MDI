import { useForm, type Resolver, type UseFormSetValue } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthContext } from "@/app/contexts/auth/context";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { getProviderById } from "@/store/features/provider/providerAPI";
import { resolveProviderDetailsFromApi } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/providerDetailSectionMerges";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import {
  AGREEMENT_FULL_FORM_DEFAULTS,
  agreementFullFormSchema,
  type AgreementFullFormValues,
  AGREEMENT_NAME_OPTIONS,
} from "../utils/agreementFormConfig";
import { useAgreementFormLogic } from "./useAgreement";
import {
  createProviderAgreement,
  fetchProviderCheckPpnStateCity,
} from "@/store/features/providerAgreement/providerAgreementSlice";
import { buildCreateProviderAgreementBody } from "../providerAgreementSave";
import {
  isNewAgreementFromNetworkMapping,
  resolveInsurerNetworkMode,
  resolveMappingAgreementNameBeforePpn,
  resolveMappingAgreementNameFromPpn,
  shouldDisableAgreementNameFromMapping,
  getHybridBipartiteAgreementNameOptions,
  type MappingAgreementNameSelection,
  type NewAgreementFromMappingNavState,
} from "../utils/providerAgreementHelpers";
import { resolveAgreementDocumentsForSave } from "../utils/agreementDocumentApi";
import {
  isPsuInsurerLabel,
  reportAgreementMutationError,
  resolveGicGipsaMappingSuccessKind,
  type GicGipsaMappingSuccessKind,
} from "../utils/agreementHelpers";
import { useAgreementMappingInsurerPrefill } from "../utils/agreementEffects";
import { buildDefaultIcCorporateListPath } from "../../../utils/icMappingSubTabPaths";

type AuthUserWithTpa = {
  tpaId?: string;
};

type UseAgreementCreateFormArgs = {
  providerId?: string;
  providerBasePath: string;
};

export type AgreementIcMappingSuccessDialogState = {
  open: boolean;
  kind: GicGipsaMappingSuccessKind | null;
  viewEnabled: boolean;
};

const IC_MAPPING_SUCCESS_DIALOG_CLOSED: AgreementIcMappingSuccessDialogState = {
  open: false,
  kind: null,
  viewEnabled: false,
};

function applyMappingAgreementNameSelection(
  selection: MappingAgreementNameSelection,
  setAgreementNameOptions: (options: typeof AGREEMENT_NAME_OPTIONS) => void,
  setValue: UseFormSetValue<AgreementFullFormValues>,
) {
  if (selection.restrictToHybridBipartiteOptions) {
    setAgreementNameOptions(getHybridBipartiteAgreementNameOptions());
  }
  setValue("agreementName", selection.agreementName, {
    shouldDirty: true,
    shouldValidate: true,
  });
}

export function useAgreementCreateForm({
  providerId,
  providerBasePath,
}: UseAgreementCreateFormArgs) {
  const navigate = useNavigate();
  const location = useLocation();
  const mappingNavState = (location.state ?? null) as NewAgreementFromMappingNavState | null;
  const disableAgreementName = useMemo(
    () => shouldDisableAgreementNameFromMapping(mappingNavState),
    [mappingNavState],
  );
  const dispatch = useAppDispatch();
  const { user } = useAuthContext();

  const form = useForm<AgreementFullFormValues>({
    defaultValues: AGREEMENT_FULL_FORM_DEFAULTS,
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: yupResolver(agreementFullFormSchema) as Resolver<AgreementFullFormValues>,
  });

  const logic = useAgreementFormLogic(form, mappingNavState);
  const { setValue, getValues, handleSubmit, watch, formState: { isSubmitting } } = form;

  useAgreementMappingInsurerPrefill({
    form,
    mappingInsurer: mappingNavState,
    showSelectedIcScopeUi: logic.showSelectedIcScopeUi,
    agreementName: logic.agreementName,
  });
  const formValues = watch();
  const isFormValid = useMemo(
    () => agreementFullFormSchema.isValidSync(formValues),
    [formValues],
  );
  const [ppnValidation, setPpnValidation] = useState({
    isGipsaPpnTripartite: false,
    isPsuTripartite: false,
    isChecking: false,
    isPpnValidationPassed: true,
  });

  const [agreementNameOptions, setAgreementNameOptions] =
    useState<typeof AGREEMENT_NAME_OPTIONS>(AGREEMENT_NAME_OPTIONS);
  const [icMappingSuccessDialog, setIcMappingSuccessDialog] = useState(
    IC_MAPPING_SUCCESS_DIALOG_CLOSED,
  );

  const handlePpnValidationChange = useCallback(
    (state: {
      isGipsaPpnTripartite: boolean;
      isPsuTripartite: boolean;
      isChecking: boolean;
      isPpnValidationPassed: boolean;
    }) => {
      setPpnValidation(state);
    },
    [],
  );

  useEffect(() => {
    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId) return;

    let cancelled = false;

    (async () => {
      const providerResponse = await getProviderById(resolvedProviderId);
      if (cancelled || !providerResponse.success || !providerResponse.data) return;

      const details = resolveProviderDetailsFromApi(providerResponse.data);
      if (!details) return;

      if (!getValues("providerSignatoryName").trim()) {
        setValue("providerSignatoryName", details.providerSignatoryName ?? "", {
          shouldDirty: false,
        });
      }
      if (!getValues("providerSignatoryDesignation").trim()) {
        setValue(
          "providerSignatoryDesignation",
          details.providerSignatoryDesignation ?? "",
          { shouldDirty: false },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providerId, getValues, setValue]);

  useEffect(() => {
    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId) return;
    if (getValues("agreementName").trim()) return;

    const search = new URLSearchParams(location.search);
    const state = (location.state ?? {}) as NewAgreementFromMappingNavState;
    const insurerIdFromQuery = (search.get("insurerId") ?? "").trim();
    const fromNetworkMapping =
      isNewAgreementFromNetworkMapping(mappingNavState) || Boolean(insurerIdFromQuery);

    // Plain create from Agreements tab: user selects agreement name manually.
    if (!fromNetworkMapping) return;

    let cancelled = false;

    (async () => {
      const insurerId = (insurerIdFromQuery || state.insurerId || "").trim();
      const mappingContext = {
        networkMode: await resolveInsurerNetworkMode(
          insurerId,
          String(state.providerNetworkMode ?? ""),
        ),
        networkSource: state.networkSource,
        insurerType: String(state.insurerType ?? "").trim(),
        insurerName: (state.insurerName ?? "").trim(),
      };

      if (cancelled || !mappingContext.networkMode) return;

      const beforePpn = resolveMappingAgreementNameBeforePpn(mappingContext);
      if (beforePpn) {
        applyMappingAgreementNameSelection(beforePpn, setAgreementNameOptions, setValue);
        return;
      }

      const ppn = await dispatch(
        fetchProviderCheckPpnStateCity({
          providerId: resolvedProviderId,
          validationOnly: true,
        }),
      )
        .unwrap()
        .catch(() => null);

      if (cancelled) return;

      const fromPpn = resolveMappingAgreementNameFromPpn({
        ...mappingContext,
        ppnCityAvailable: ppn?.data?.providerGipsaPpnCityAvailable === true,
        ppnStateAvailable: ppn?.data?.providerGipsaPpnStateAvailable === true,
        isPsuInsurerLabel,
      });
      if (fromPpn) {
        applyMappingAgreementNameSelection(fromPpn, setAgreementNameOptions, setValue);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    providerId,
    location.search,
    location.state,
    mappingNavState,
    dispatch,
    getValues,
    setValue,
  ]);

  const goBackToAgreementList = useCallback(() => {
    const mappingState = location.state as NewAgreementFromMappingNavState | null;
    const returnTo = mappingState?.returnTo?.trim();
    if (returnTo) {
      navigate(returnTo, { state: { refreshNetworkMapping: true } });
      return;
    }
    if (providerBasePath) {
      navigate(`${providerBasePath}/agreement`);
      return;
    }
    navigate(-1);
  }, [navigate, providerBasePath, location.state]);

  const closeIcMappingSuccessDialog = useCallback(() => {
    setIcMappingSuccessDialog(IC_MAPPING_SUCCESS_DIALOG_CLOSED);
    goBackToAgreementList();
  }, [goBackToAgreementList]);

  const viewMappedIcsFromSuccessDialog = useCallback(() => {
    setIcMappingSuccessDialog(IC_MAPPING_SUCCESS_DIALOG_CLOSED);
    if (providerBasePath) {
      navigate(buildDefaultIcCorporateListPath(providerBasePath));
      return;
    }
    navigate(-1);
  }, [navigate, providerBasePath]);

  const onSaveAgreement = handleSubmit(async (values) => {
    const resolvedProviderId = providerId?.trim();
    if (!resolvedProviderId) {
      goBackToAgreementList();
      return;
    }

    const needsPpnCheck =
      ppnValidation.isGipsaPpnTripartite || ppnValidation.isPsuTripartite;
    if (
      needsPpnCheck &&
      !ppnValidation.isChecking &&
      !ppnValidation.isPpnValidationPassed
    ) {
      return;
    }

    const authUser = user as AuthUserWithTpa | null;
    const tpaId = (authUser?.tpaId ?? "").trim();

    const documentsResult = await resolveAgreementDocumentsForSave(resolvedProviderId, values);
    if (!documentsResult.ok) {
      if (documentsResult.message) {
        showProviderError(documentsResult.message);
      }
      return;
    }

    const body = buildCreateProviderAgreementBody({
      providerId: resolvedProviderId,
      tpaId,
      formValues: values,
      fileMetadataId: documentsResult.documents.fileMetadataId || null,
      supportingFileMetadataId: documentsResult.documents.supportingFileMetadataId || null,
      inwardNo: documentsResult.documents.inwardNo || null,
    });

    try {
      const result = await dispatch(
        createProviderAgreement({
          providerId: resolvedProviderId,
          body,
        }),
      ).unwrap();

      const created = result.data;
      const mappingKind = resolveGicGipsaMappingSuccessKind(
        created?.providerAgreementName ?? values.agreementName,
        created?.insurerMappings.length ?? 0,
      );

      if (mappingKind) {
        setIcMappingSuccessDialog({
          open: true,
          kind: mappingKind,
          viewEnabled: true,
        });
        return;
      }

      if (result.message) {
        toast.success(result.message, { position: "top-right", duration: 5000 });
      }
      goBackToAgreementList();
    } catch (error) {
      reportAgreementMutationError(error, showProviderError);
    }
  });

  const needsPpnCheck =
    ppnValidation.isGipsaPpnTripartite || ppnValidation.isPsuTripartite;
  const isPpnSaveAllowed =
    !needsPpnCheck ||
    (!ppnValidation.isChecking && ppnValidation.isPpnValidationPassed);

  return {
    logic,
    onCancel: goBackToAgreementList,
    onSaveAgreement,
    handlePpnValidationChange,
    canSaveAgreement: !isSubmitting && isPpnSaveAllowed && isFormValid,
    agreementNameOptions,
    disableAgreementName,
    icMappingSuccessDialog,
    closeIcMappingSuccessDialog,
    viewMappedIcsFromSuccessDialog,
  };
}
