import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";
import { useRole } from "@/app/auth/usePermission";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  fetchProviderIdentifierTypeMasterById,
  fetchProviderTaxonomyMasterById,
  fetchInsurerProviderNetworkModeById,
  fetchProviderDiscountTypeMasterById,
  fetchProviderDiscountTypeMaster,
  fetchProviderDiscountSubtypeMasterById,
  fetchProviderDiscountInclusionExclusionMasterById,
} from "@/store/features/providerMasters/providerMastersSlice";
import { fetchInsurerList } from "@/store/features/insurerList/insurerListSlice";
import { showErrorMessage } from "@/utils/errorHandler";
import {
  getProviderMastersListPath,
  type ProviderMasterRecordStatus,
} from "./utils/masterConfig";
import {
  DEFAULT_VALUE_DATA_TYPE,
} from "./utils/identifierTypeFormConfig";
import {
  DEFAULT_TAXONOMY_IS_ACTIVE,
  mapRecordToTaxonomyFormExtra,
} from "./utils/taxonomyFormConfig";
import { mapRecordToNetworkModeFormExtra } from "./utils/insurerProviderNetworkModeFormConfig";
import { mapRecordToDiscountTypeForm } from "./utils/discountTypeFormConfig";
import {
  DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
  DISCOUNT_SUBTYPE_TYPE_NAME_FIELD,
  mapRecordToDiscountSubtypeForm,
} from "./utils/discountSubtypeFormConfig";
import {
  DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
  DISCOUNT_INCLUSION_EXCLUSION_TYPES,
  mapRecordToDiscountInclusionExclusionForm,
} from "./utils/discountInclusionExclusionFormConfig";
import {
  saveAndUpdateProviderMaster,
  type MasterFormState,
} from "./utils/providerMasterFunctions";
import { getProviderMasterConfig } from "../shared/providerMasterI18n";
import {
  buildInitialMasterFormState,
  emptyMasterForm,
  isProviderMasterSaveDisabled,
  mapRecordToLoadedForm,
  resolveSelectedMasterKey,
} from "./utils/addProviderMasterPageHelpers";
import { getMasterTypeFlags } from "./utils/providerMastersPageHelpers";

export function useAddProviderMasterPage() {
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const { isSuperAdmin } = useRole();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    selectedProviderIdentifierType,
    selectedProviderTaxonomy,
    selectedInsurerProviderNetworkMode,
    selectedProviderDiscountType,
    selectedProviderDiscountSubtype,
    selectedProviderDiscountInclusionExclusion,
    providerDiscountTypeRows,
    detailLoading,
    detailError,
  } = useAppSelector((state) => state.providerMasters);
  const { insurerList } = useAppSelector((state) => state.insurerList);
  const params = useParams<{ masterKey?: string; recordId?: string }>();
  const [searchParams] = useSearchParams();

  const selectedMasterKey = resolveSelectedMasterKey(
    params.masterKey ?? "",
    searchParams.get("master") ?? "",
  );
  const editRecordId = params.recordId ?? searchParams.get("id") ?? undefined;
  const isEditMode = Boolean(editRecordId);

  const statusForm = useForm<{ recordStatus: ProviderMasterRecordStatus }>({
    defaultValues: { recordStatus: "ACTIVE" },
  });
  const identifierExtraForm = useForm<{ valueDataType: string; identifierLevel: string }>({
    defaultValues: { valueDataType: DEFAULT_VALUE_DATA_TYPE, identifierLevel: "" },
  });
  const discountSubtypeForm = useForm<{ providerDiscountTypeMasterId: string }>({
    defaultValues: { providerDiscountTypeMasterId: "" },
  });
  const inclusionExclusionTypeForm = useForm<{ providerInclusionExclusionType: string }>({
    defaultValues: { providerInclusionExclusionType: "" },
  });
  const taxonomyForm = useForm<{ is_active: string; provider_type_scope: string }>({
    defaultValues: { is_active: DEFAULT_TAXONOMY_IS_ACTIVE, provider_type_scope: "" },
  });
  const networkModeForm = useForm<{
    insurerProviderNetworkModeType: string;
    insurerProviderNetworkTariffType: string;
    insurerId: string;
    recordStatus: ProviderMasterRecordStatus;
  }>({
    defaultValues: {
      insurerProviderNetworkModeType: "",
      insurerProviderNetworkTariffType: "",
      insurerId: "",
      recordStatus: "ACTIVE",
    },
  });

  const [originalForm, setOriginalForm] = useState<MasterFormState | null>(null);
  const [form, setForm] = useState<MasterFormState>(() =>
    buildInitialMasterFormState(selectedMasterKey, editRecordId),
  );

  const selectedConfig = useMemo(
    () => getProviderMasterConfig(selectedMasterKey, t),
    [selectedMasterKey, t],
  );
  const mastersListPath = useMemo(
    () => getProviderMastersListPath(selectedMasterKey),
    [selectedMasterKey],
  );
  const identifierFormLabels = useMemo(
    () => ({
      code: selectedConfig.codeLabel,
      name: selectedConfig.nameLabel,
      description: selectedConfig.descriptionLabel,
    }),
    [selectedConfig.codeLabel, selectedConfig.descriptionLabel, selectedConfig.nameLabel],
  );

  const {
    isIdentifierTypeMaster,
    isTaxonomyMaster,
    isNetworkModeMaster,
    isDiscountTypeMaster,
    isDiscountSubtypeMaster,
    isDiscountInclusionExclusionMaster,
  } = getMasterTypeFlags(selectedMasterKey);
  const pageTitle = isEditMode
    ? t("providerMaster.mastersPage.editTitle")
    : t("providerMaster.mastersPage.createTitle");
  const breadcrumbActionTitle = `${isEditMode ? t("providerMaster.common.edit") : t("providerMaster.button.add")} ${selectedConfig.title}`;

  const networkModeEffectiveFrom = String(form.extra.insurerProviderNetworkModeEffectiveFrom ?? "").trim();
  const networkModeEffectiveTo = String(form.extra.insurerProviderNetworkModeEffectiveTo ?? "").trim();
  const discountSubtypeTypeMasterId = String(
    form.extra[DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD] ?? "",
  ).trim();
  const discountSubtypeTypeMasterName = String(
    form.extra[DISCOUNT_SUBTYPE_TYPE_NAME_FIELD] ?? "",
  ).trim();
  const discountInclusionExclusionType = String(
    form.extra[DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD] ?? "",
  );

  const statusOptions = useMemo(
    () => [
      { label: t("providerMaster.common.active"), value: "ACTIVE" },
      { label: t("providerMaster.common.inactive"), value: "INACTIVE" },
    ],
    [t],
  );

  const insurerOptions = useMemo(() => {
    const options = Array.isArray(insurerList)
      ? insurerList.map((insurer) => ({
          value: insurer.insurerId,
          label: insurer.insurerName,
        }))
      : [];
    const selectedInsurerId = String(form.extra.insurerId ?? "").trim();
    if (selectedInsurerId && !options.some((option) => option.value === selectedInsurerId)) {
      options.unshift({ value: selectedInsurerId, label: selectedInsurerId });
    }
    return options;
  }, [form.extra.insurerId, insurerList]);

  const discountTypeOptions = useMemo(() => {
    const options = providerDiscountTypeRows.map((row) => ({
      value: row.id,
      label: row.name || row.code || row.id,
    }));
    const selectedId = discountSubtypeTypeMasterId;
    const selectedLabel = discountSubtypeTypeMasterName;
    if (selectedId && !options.some((option) => option.value === selectedId)) {
      options.unshift({ value: selectedId, label: selectedLabel || selectedId });
    }
    return options;
  }, [discountSubtypeTypeMasterId, discountSubtypeTypeMasterName, providerDiscountTypeRows]);

  const inclusionExclusionTypeOptions = useMemo(
    () =>
      DISCOUNT_INCLUSION_EXCLUSION_TYPES.map((value) => ({
        value,
        label:
          value === "INCLUSION"
            ? t("providerMaster.mastersPage.inclusion")
            : t("providerMaster.mastersPage.exclusion"),
      })),
    [t],
  );

  const isSaveDisabled = isProviderMasterSaveDisabled({
    isEditMode,
    isSuperAdmin,
    isNetworkModeMaster,
    isTaxonomyMaster,
    isIdentifierTypeMaster,
    isDiscountTypeMaster,
    isDiscountSubtypeMaster,
    isDiscountInclusionExclusionMaster,
    detailLoading,
    originalForm,
    form,
    identifierFormLabels,
  });

  useEffect(() => {
    if (isNetworkModeMaster) dispatch(fetchInsurerList());
  }, [dispatch, isNetworkModeMaster]);

  useEffect(() => {
    if (!isDiscountSubtypeMaster) return;
    dispatch(fetchProviderDiscountTypeMaster({ page: 1, size: 200, download: true }));
  }, [dispatch, isDiscountSubtypeMaster]);

  useEffect(() => {
    setBreadcrumbs([
      { title: t("providerMaster.moduleName") },
      { title: t("providerMaster.mastersPage.breadcrumbMasters"), path: mastersListPath },
      { title: breadcrumbActionTitle },
    ]);
    return () => setBreadcrumbs([]);
  }, [breadcrumbActionTitle, mastersListPath, setBreadcrumbs, t]);

  useEffect(() => {
    if (!isEditMode || isSuperAdmin) return;
    showErrorMessage({ error: t("providerMaster.mastersPage.superAdminOnlyEdit") });
    navigate(mastersListPath, { replace: true });
  }, [isEditMode, isSuperAdmin, mastersListPath, navigate, t]);

  useEffect(() => {
    statusForm.setValue("recordStatus", form.recordStatus);
  }, [form.recordStatus, statusForm]);

  useEffect(() => {
    identifierExtraForm.setValue("valueDataType", String(form.extra.valueDataType ?? DEFAULT_VALUE_DATA_TYPE));
    identifierExtraForm.setValue("identifierLevel", String(form.extra.identifierLevel ?? ""));
  }, [form.extra.valueDataType, form.extra.identifierLevel, identifierExtraForm]);

  useEffect(() => {
    taxonomyForm.setValue(
      "is_active",
      (String(form.extra.is_active ?? DEFAULT_TAXONOMY_IS_ACTIVE).trim() ||
        DEFAULT_TAXONOMY_IS_ACTIVE) as ProviderMasterRecordStatus,
    );
    taxonomyForm.setValue("provider_type_scope", String(form.extra.provider_type_scope ?? ""));
  }, [form.extra.is_active, form.extra.provider_type_scope, taxonomyForm]);

  useEffect(() => {
    networkModeForm.setValue("insurerProviderNetworkModeType", String(form.extra.insurerProviderNetworkModeType ?? ""));
    networkModeForm.setValue("insurerProviderNetworkTariffType", String(form.extra.insurerProviderNetworkTariffType ?? ""));
    networkModeForm.setValue("insurerId", String(form.extra.insurerId ?? ""));
    networkModeForm.setValue(
      "recordStatus",
      (String(form.extra.recordStatus ?? "ACTIVE").trim() || "ACTIVE") as ProviderMasterRecordStatus,
    );
  }, [
    form.extra.insurerProviderNetworkModeType,
    form.extra.insurerProviderNetworkTariffType,
    form.extra.insurerId,
    form.extra.recordStatus,
    networkModeForm,
  ]);

  useEffect(() => {
    discountSubtypeForm.setValue(
      DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
      discountSubtypeTypeMasterId,
    );
  }, [discountSubtypeForm, discountSubtypeTypeMasterId]);

  useEffect(() => {
    inclusionExclusionTypeForm.setValue(
      DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
      discountInclusionExclusionType,
    );
  }, [inclusionExclusionTypeForm, discountInclusionExclusionType]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isIdentifierTypeMaster) return;
    dispatch(fetchProviderIdentifierTypeMasterById(editRecordId));
  }, [dispatch, editRecordId, isEditMode, isIdentifierTypeMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isTaxonomyMaster) return;
    dispatch(fetchProviderTaxonomyMasterById(editRecordId));
  }, [dispatch, editRecordId, isEditMode, isTaxonomyMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isNetworkModeMaster) return;
    dispatch(fetchInsurerProviderNetworkModeById(editRecordId));
  }, [dispatch, editRecordId, isEditMode, isNetworkModeMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isDiscountTypeMaster) return;
    dispatch(fetchProviderDiscountTypeMasterById(editRecordId));
  }, [dispatch, editRecordId, isEditMode, isDiscountTypeMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isDiscountSubtypeMaster) return;
    dispatch(fetchProviderDiscountSubtypeMasterById(editRecordId));
  }, [dispatch, editRecordId, isEditMode, isDiscountSubtypeMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isDiscountInclusionExclusionMaster) return;
    dispatch(fetchProviderDiscountInclusionExclusionMasterById(editRecordId));
  }, [dispatch, editRecordId, isEditMode, isDiscountInclusionExclusionMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !selectedProviderIdentifierType) return;
    if (selectedProviderIdentifierType.id !== editRecordId) return;
    const loadedForm = mapRecordToLoadedForm(selectedProviderIdentifierType, isIdentifierTypeMaster);
    setForm(loadedForm);
    setOriginalForm(loadedForm);
  }, [editRecordId, isEditMode, isIdentifierTypeMaster, selectedProviderIdentifierType]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !selectedProviderTaxonomy) return;
    if (selectedProviderTaxonomy.id !== editRecordId) return;
    const loadedExtra = mapRecordToTaxonomyFormExtra(selectedProviderTaxonomy);
    const loadedForm: MasterFormState = { ...emptyMasterForm, extra: loadedExtra };
    setForm(loadedForm);
    setOriginalForm(loadedForm);
  }, [editRecordId, isEditMode, selectedProviderTaxonomy]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isNetworkModeMaster || !detailError) return;
    showErrorMessage({ error: detailError });
  }, [detailError, editRecordId, isEditMode, isNetworkModeMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !selectedInsurerProviderNetworkMode) return;
    if (selectedInsurerProviderNetworkMode.id !== editRecordId) return;
    const loadedExtra = mapRecordToNetworkModeFormExtra(selectedInsurerProviderNetworkMode);
    const loadedForm: MasterFormState = { ...emptyMasterForm, extra: loadedExtra };
    setForm(loadedForm);
    setOriginalForm({ ...emptyMasterForm, extra: { ...loadedExtra } });
  }, [editRecordId, isEditMode, selectedInsurerProviderNetworkMode]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !selectedProviderDiscountType) return;
    if (selectedProviderDiscountType.id !== editRecordId) return;
    const loadedForm = mapRecordToDiscountTypeForm(selectedProviderDiscountType);
    setForm(loadedForm);
    setOriginalForm(loadedForm);
  }, [editRecordId, isEditMode, selectedProviderDiscountType]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isDiscountTypeMaster || !detailError) return;
    showErrorMessage({ error: detailError });
  }, [detailError, editRecordId, isEditMode, isDiscountTypeMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !selectedProviderDiscountSubtype) return;
    if (selectedProviderDiscountSubtype.id !== editRecordId) return;
    const loadedForm = mapRecordToDiscountSubtypeForm(selectedProviderDiscountSubtype);
    setForm(loadedForm);
    setOriginalForm(loadedForm);
  }, [editRecordId, isEditMode, selectedProviderDiscountSubtype]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isDiscountSubtypeMaster || !detailError) return;
    showErrorMessage({ error: detailError });
  }, [detailError, editRecordId, isEditMode, isDiscountSubtypeMaster]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !selectedProviderDiscountInclusionExclusion) return;
    if (selectedProviderDiscountInclusionExclusion.id !== editRecordId) return;
    const loadedForm = mapRecordToDiscountInclusionExclusionForm(
      selectedProviderDiscountInclusionExclusion,
    );
    setForm(loadedForm);
    setOriginalForm(loadedForm);
  }, [editRecordId, isEditMode, selectedProviderDiscountInclusionExclusion]);

  useEffect(() => {
    if (!isEditMode || !editRecordId || !isDiscountInclusionExclusionMaster || !detailError) return;
    showErrorMessage({ error: detailError });
  }, [detailError, editRecordId, isEditMode, isDiscountInclusionExclusionMaster]);

  const saveForm = async () => {
    const saved = await saveAndUpdateProviderMaster({
      dispatch,
      selectedMasterKey,
      form,
      originalForm,
      isEditMode,
      editRecordId,
      isSuperAdmin,
      identifierFormLabels,
    });
    if (saved) navigate(mastersListPath);
  };

  return {
    t,
    navigate,
    form,
    setForm,
    selectedConfig,
    pageTitle,
    mastersListPath,
    isNetworkModeMaster,
    isTaxonomyMaster,
    isIdentifierTypeMaster,
    isDiscountTypeMaster,
    isDiscountSubtypeMaster,
    isDiscountInclusionExclusionMaster,
    statusForm,
    identifierExtraForm,
    discountSubtypeForm,
    inclusionExclusionTypeForm,
    taxonomyForm,
    networkModeForm,
    insurerOptions,
    discountTypeOptions,
    inclusionExclusionTypeOptions,
    networkModeEffectiveFrom,
    networkModeEffectiveTo,
    statusOptions,
    isSaveDisabled,
    saveForm,
  };
}
