import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchInsurerOffices } from "@/store/features/insurerOffice/insurerOfficeSlice";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import {
  RESTRICTION_APPLICABLE_CASHLESS_ONLY_OPTIONS,
  RESTRICTION_APPLICABLE_OPTIONS,
  RESTRICTION_DETAILS_DEFAULTS,
} from "./config";
import {
  createProviderRestriction,
  inactivateProviderRestriction,
  fetchProviderRestrictionById,
  patchProviderRestriction,
} from "../api";
import type { NormalizedProviderRestriction } from "./utils";
import { mapProviderRestrictionToForm } from "./utils";
import { buildProviderRestrictionCreateBody } from "./utils";
import { uploadRestrictionSupportingDocument } from "./documents";
import type { RestrictionDetailsState, RestrictionFormValues } from "../types";
import {
  areRestrictionRequiredFieldsFilled,
} from "./utils";
import { validateRestrictionFormBeforeSave } from "./restrictionSaveValidation";
import { useProviderAdminRole } from "../../providerDetails/useTab";
import { useRole } from "@/app/auth/usePermission";
import { fetchIcCorpDropdownApi } from "@/store/features/providerRestriction/providerRestrictionAPI";

const RESTRICTION_FORM_DEFAULTS: RestrictionFormValues = {
  icName: "",
  restrictionType: "Watchlist",
  restrictionApplicable: [],
  investigationType: "",
  investigationRequired: false,
  emergency_exception_allowed_flag: false,
  restrictionLevel: "",
  corporateIds: [],
  rohOfficeIds: [],
  policyNumbers: [],
  ccnNumbers: [],
};

type UseIcMappingRestrictionFormArgs = {
  providerId?: string;
  onRestrictionSaved?: () => void | Promise<void>;
};

export function useIcMappingRestrictionForm({
  providerId,
  onRestrictionSaved,
}: UseIcMappingRestrictionFormArgs) {
  const { hasRole } = useRole();
  const isAdminUser = useProviderAdminRole();
  // Only provider logins are locked to cashless; admin/super admin keep both options.
  const isProviderRoleUser = hasRole("provider") && !isAdminUser;
  const dispatch = useAppDispatch();
  const { parentOffices: insurerParentOffices } = useAppSelector((state) => state.insurerOffice);

  const restrictionForm = useForm<RestrictionFormValues>({
    defaultValues: RESTRICTION_FORM_DEFAULTS,
  });

  const {
    setError: setRestrictionError,
    clearErrors: clearRestrictionErrors,
    formState: { errors: restrictionFormErrors },
  } = restrictionForm;

  const selectedIcId = restrictionForm.watch("icName");
  const selectedRestrictionType = restrictionForm.watch("restrictionType");
  const restrictionApplicableRaw = restrictionForm.watch("restrictionApplicable");
  const restrictionApplicable = useMemo(
    () => (Array.isArray(restrictionApplicableRaw) ? restrictionApplicableRaw : []),
    [restrictionApplicableRaw],
  );
  const reimbursementSelected = restrictionApplicable.includes("reimbursement");
  const selectedRestrictionLevel = restrictionForm.watch("restrictionLevel");
  const watchedCorporateIds = restrictionForm.watch("corporateIds");
  const watchedRohOfficeIds = restrictionForm.watch("rohOfficeIds");
  const watchedPolicyNumbers = restrictionForm.watch("policyNumbers");
  const watchedCcnNumbers = restrictionForm.watch("ccnNumbers");
  const showCorporateDropdown = selectedRestrictionLevel === "INSURER_CORPORATE";
  const showRohDropdown = selectedRestrictionLevel === "INSURER_RO";
  const showPolicyNumbersField = selectedRestrictionLevel === "INSURER_POLICY";
  const showCcnNumbersField = selectedRestrictionLevel === "INSURER_CCN";

  const [icCorpCorporateOptions, setIcCorpCorporateOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [icCorpPolicyOptions, setIcCorpPolicyOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [icCorpDropdownLoading, setIcCorpDropdownLoading] = useState(false);

  const selectedCorporateIdForIcCorp = useMemo(() => {
    if (!Array.isArray(watchedCorporateIds)) return "";
    const first = watchedCorporateIds.find((id) => String(id ?? "").trim() !== "");
    return String(first ?? "").trim();
  }, [watchedCorporateIds]);

  const rohOfficeOptions = useMemo(
    () =>
      (insurerParentOffices ?? []).map(
        (office: {
          insurerOfficeName?: string;
          officeName?: string;
          name?: string;
          insurerOfficeId?: string;
          officeId?: string;
          id?: string;
        }) => ({
          label: office.insurerOfficeName ?? office.officeName ?? office.name ?? "",
          value: office.insurerOfficeId ?? office.officeId ?? office.id ?? "",
        }),
      ),
    [insurerParentOffices],
  );

  useEffect(() => {
    if (!showRohDropdown || !selectedIcId) return;
    dispatch(
      fetchInsurerOffices({
        insurerId: selectedIcId,
        officeType: "RO",
        onlyNames: true,
        level: "PARENT",
      } as Parameters<typeof fetchInsurerOffices>[0]),
    );
  }, [dispatch, selectedIcId, showRohDropdown]);

  // Insurer + Corporate: load corporates/policies from policy-management IC-Corp dropdown.
  useEffect(() => {
    if (!showCorporateDropdown || !selectedIcId.trim()) {
      setIcCorpCorporateOptions([]);
      setIcCorpPolicyOptions([]);
      return;
    }

    let cancelled = false;
    setIcCorpDropdownLoading(true);
    fetchIcCorpDropdownApi({
      insurerId: selectedIcId,
      corporateId: selectedCorporateIdForIcCorp || undefined,
    })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          showErrorMessage({ error: result.message });
          setIcCorpCorporateOptions([]);
          setIcCorpPolicyOptions([]);
          return;
        }
        setIcCorpCorporateOptions(
          result.corporates.map((item) => ({ label: item.name, value: item.id })),
        );
        setIcCorpPolicyOptions(
          result.policies.map((item) => ({ label: item.name, value: item.id })),
        );
      })
      .finally(() => {
        if (!cancelled) setIcCorpDropdownLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showCorporateDropdown, selectedIcId, selectedCorporateIdForIcCorp]);

  const [restrictionDetails, setRestrictionDetails] =
    useState<RestrictionDetailsState>(RESTRICTION_DETAILS_DEFAULTS);
  const [effectiveFromError, setEffectiveFromError] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [supportingDocumentError, setSupportingDocumentError] = useState("");
  const [restrictionSaving, setRestrictionSaving] = useState(false);
  const [restrictionRemoving, setRestrictionRemoving] = useState(false);
  const [restrictionLoading, setRestrictionLoading] = useState(false);
  const [editingRestrictionId, setEditingRestrictionId] = useState("");
  const [applicableError, setApplicableError] = useState("");

  const isEditMode = Boolean(editingRestrictionId.trim());
  const previousRestrictionTypeRef = useRef("");
  const previousRestrictionLevelRef = useRef("");
  const isBlacklistType = selectedRestrictionType === "Blacklist";
  const showRestrictionType = selectedRestrictionLevel === "Insurer";
  // Provider role: cashless only and field disabled. Admin/super admin: both (unless blacklist).
  const applicableDisabled = isProviderRoleUser || isBlacklistType;
  const showBlacklistCheckboxes = isBlacklistType;
  const restrictionApplicableOptions = isProviderRoleUser
    ? RESTRICTION_APPLICABLE_CASHLESS_ONLY_OPTIONS
    : RESTRICTION_APPLICABLE_OPTIONS;

  const resetRestrictionForm = useCallback(() => {
    setEditingRestrictionId("");
    restrictionForm.reset(RESTRICTION_FORM_DEFAULTS);
    setRestrictionDetails(RESTRICTION_DETAILS_DEFAULTS);
    setEffectiveFromError("");
    setRemarkError("");
    setSupportingDocumentError("");
    setApplicableError("");
    previousRestrictionTypeRef.current = "";
    previousRestrictionLevelRef.current = "";
  }, [restrictionForm]);

  const prepareCreateWithInsurer = useCallback(
    (insurerId: string) => {
      resetRestrictionForm();
      restrictionForm.setValue("icName", insurerId);
    },
    [resetRestrictionForm, restrictionForm],
  );

  const hydrateRestrictionFromRow = useCallback(
    (row: NormalizedProviderRestriction, providerRestrictionId: string) => {
      const mapped = mapProviderRestrictionToForm(row);
      setEditingRestrictionId(row.providerRestrictionId || providerRestrictionId);
      restrictionForm.reset(mapped.values);
      setRestrictionDetails(mapped.details);
      setEffectiveFromError("");
      setRemarkError("");
      setSupportingDocumentError("");
      setApplicableError("");
    },
    [restrictionForm],
  );

  const loadRestriction = useCallback(async (providerRestrictionId: string) => {
    setRestrictionLoading(true);
    try {
      const result = await fetchProviderRestrictionById(providerRestrictionId);
      if (!result.ok) {
        showErrorMessage({ error: result.message });
        return;
      }

      hydrateRestrictionFromRow(result.row, providerRestrictionId);
    } finally {
      setRestrictionLoading(false);
    }
  }, [hydrateRestrictionFromRow]);

  useEffect(() => {
    if (!showCorporateDropdown) clearRestrictionErrors("corporateIds");
    if (!showRohDropdown) clearRestrictionErrors("rohOfficeIds");
    if (!showPolicyNumbersField) clearRestrictionErrors("policyNumbers");
    if (!showCcnNumbersField) clearRestrictionErrors("ccnNumbers");
  }, [
    showCorporateDropdown,
    showRohDropdown,
    showPolicyNumbersField,
    showCcnNumbersField,
    clearRestrictionErrors,
  ]);

  // Apply defaults only when restriction type changes — not while user toggles options.
  useEffect(() => {
    const previousType = previousRestrictionTypeRef.current;
    if (previousType === selectedRestrictionType) return;
    previousRestrictionTypeRef.current = selectedRestrictionType;

    if (selectedRestrictionType === "Blacklist") {
      restrictionForm.setValue("restrictionApplicable", ["cashless", "reimbursement"]);
      restrictionForm.setValue("investigationRequired", false);
      restrictionForm.setValue("emergency_exception_allowed_flag", false);
      setApplicableError("");
      return;
    }

    restrictionForm.setValue("investigationRequired", false);
    restrictionForm.setValue("emergency_exception_allowed_flag", false);

    if (selectedRestrictionType === "Watchlist") {
      if (isProviderRoleUser) {
        restrictionForm.setValue("restrictionApplicable", ["cashless"]);
      }
    }
  }, [
    selectedRestrictionType,
    selectedRestrictionLevel,
    restrictionApplicable,
    restrictionForm,
    isProviderRoleUser,
  ]);

  useEffect(() => {
    const previousLevel = previousRestrictionLevelRef.current;
    if (previousLevel === selectedRestrictionLevel) return;
    previousRestrictionLevelRef.current = selectedRestrictionLevel;

    if (selectedRestrictionLevel !== "INSURER_CORPORATE") {
      restrictionForm.setValue("corporateIds", []);
      clearRestrictionErrors("corporateIds");
    }
    if (selectedRestrictionLevel !== "INSURER_RO") {
      restrictionForm.setValue("rohOfficeIds", []);
      clearRestrictionErrors("rohOfficeIds");
    }
    if (selectedRestrictionLevel !== "INSURER_POLICY") {
      restrictionForm.setValue("policyNumbers", []);
      clearRestrictionErrors("policyNumbers");
    }
    if (selectedRestrictionLevel !== "INSURER_CCN") {
      restrictionForm.setValue("ccnNumbers", []);
      clearRestrictionErrors("ccnNumbers");
    }
    if (selectedRestrictionLevel !== "Insurer") {
      restrictionForm.setValue("restrictionType", "");
      clearRestrictionErrors("restrictionType");
    }

    if (selectedRestrictionLevel === "INSURER_RO") {
      restrictionForm.setValue("investigationRequired", false);
      clearRestrictionErrors("restrictionType");
      setApplicableError("");
      return;
    }

    if (selectedRestrictionLevel === "INSURER_CORPORATE") {
      clearRestrictionErrors("restrictionType");
      setApplicableError("");
      return;
    }

    if (
      selectedRestrictionLevel === "INSURER_POLICY" ||
      selectedRestrictionLevel === "INSURER_CCN"
    ) {
      clearRestrictionErrors("restrictionType");
      setApplicableError("");
      return;
    }

    if (
      selectedRestrictionLevel === "Insurer" &&
      selectedRestrictionType === "Watchlist" &&
      isProviderRoleUser
    ) {
      restrictionForm.setValue("restrictionApplicable", ["cashless"]);
      setApplicableError("");
    }
  }, [
    selectedRestrictionLevel,
    selectedRestrictionType,
    restrictionForm,
    clearRestrictionErrors,
    isProviderRoleUser,
  ]);

  useEffect(() => {
    if (isAdminUser || selectedRestrictionType === "Blacklist") return;
    if (isProviderRoleUser) {
      restrictionForm.setValue("restrictionApplicable", ["cashless"]);
    }
  }, [
    isAdminUser,
    isProviderRoleUser,
    selectedRestrictionType,
    selectedRestrictionLevel,
    restrictionForm,
  ]);

  const restrictionSaveDisabled = useMemo(
    () =>
      restrictionSaving ||
      restrictionRemoving ||
      !areRestrictionRequiredFieldsFilled(
        {
          ...restrictionForm.getValues(),
          icName: selectedIcId,
          restrictionType: selectedRestrictionType,
          restrictionLevel: selectedRestrictionLevel,
          restrictionApplicable,
          corporateIds: Array.isArray(watchedCorporateIds) ? watchedCorporateIds : [],
          rohOfficeIds: Array.isArray(watchedRohOfficeIds) ? watchedRohOfficeIds : [],
          policyNumbers: Array.isArray(watchedPolicyNumbers) ? watchedPolicyNumbers : [],
          ccnNumbers: Array.isArray(watchedCcnNumbers) ? watchedCcnNumbers : [],
        },
        restrictionDetails,
        {
          showRestrictionType,
          showCorporateDropdown,
          showRohDropdown,
          showPolicyNumbersField,
          showCcnNumbersField,
        },
      ),
    [
      restrictionSaving,
      restrictionRemoving,
      restrictionForm,
      selectedIcId,
      selectedRestrictionType,
      selectedRestrictionLevel,
      restrictionApplicable,
      watchedCorporateIds,
      watchedRohOfficeIds,
      watchedPolicyNumbers,
      watchedCcnNumbers,
      restrictionDetails,
      showRestrictionType,
      showCorporateDropdown,
      showRohDropdown,
      showPolicyNumbersField,
      showCcnNumbersField,
    ],
  );

  const handleRestrictionSave = useCallback(async () => {
    const values = restrictionForm.getValues();
    const isValid = validateRestrictionFormBeforeSave(values, {
      showRestrictionType,
      setRestrictionError,
      setApplicableError,
      setEffectiveFromError,
      setRemarkError,
      setSupportingDocumentError,
      restrictionDetails,
    });
    if (!isValid || !providerId) return;

    let detailsForSave = restrictionDetails;
    if (
      restrictionDetails.supportingDocument &&
      !restrictionDetails.supportingFileMetadataId.trim()
    ) {
      const uploadResult = await uploadRestrictionSupportingDocument(
        restrictionDetails.supportingDocument,
        providerId,
      );
      if (!uploadResult.ok) {
        showErrorMessage({ error: uploadResult.message });
        return;
      }
      detailsForSave = {
        ...restrictionDetails,
        supportingFileMetadataId: uploadResult.fileMetadataId,
        supportingDocumentName: restrictionDetails.supportingDocument.name,
        inwardNo: uploadResult.inwardNo?.trim() ?? "",
      };
      setRestrictionDetails(detailsForSave);
    }

    const body = buildProviderRestrictionCreateBody(providerId, values, detailsForSave);

    setRestrictionSaving(true);
    try {
      const result = isEditMode
        ? await patchProviderRestriction(editingRestrictionId, body)
        : await createProviderRestriction(body);

      if (!result.ok) {
        showErrorMessage({ error: result.message });
        return;
      }

      showSuccessMessage(result.message);
      resetRestrictionForm();
      await onRestrictionSaved?.();
    } finally {
      setRestrictionSaving(false);
    }
  }, [
    restrictionForm,
    showRestrictionType,
    restrictionDetails,
    providerId,
    isEditMode,
    editingRestrictionId,
    resetRestrictionForm,
    onRestrictionSaved,
    setRestrictionError,
    setRestrictionDetails,
  ]);

  const handleRestrictionRemove = useCallback(async (): Promise<boolean> => {
    const restrictionId = editingRestrictionId.trim();
    if (!restrictionId) return false;

    setRestrictionRemoving(true);
    try {
      const result = await inactivateProviderRestriction(restrictionId);
      if (!result.ok) {
        showErrorMessage({ error: result.message });
        return false;
      }

      showSuccessMessage(result.message);
      resetRestrictionForm();
      await onRestrictionSaved?.();
      return true;
    } finally {
      setRestrictionRemoving(false);
    }
  }, [
    editingRestrictionId,
    resetRestrictionForm,
    onRestrictionSaved,
  ]);

  return {
    restrictionForm,
    restrictionFormErrors,
    restrictionDetails,
    setRestrictionDetails,
    effectiveFromError,
    setEffectiveFromError,
    remarkError,
    setRemarkError,
    supportingDocumentError,
    setSupportingDocumentError,
    selectedIcId,
    selectedRestrictionLevel,
    selectedRestrictionType,
    restrictionApplicable,
    reimbursementSelected,
    showRestrictionType,
    showBlacklistCheckboxes,
    restrictionApplicableOptions,
    showCorporateDropdown,
    showRohDropdown,
    showPolicyNumbersField,
    showCcnNumbersField,
    applicableDisabled,
    applicableError,
    rohOfficeOptions,
    restrictionCorporateList: icCorpCorporateOptions,
    restrictionPolicyOptions: icCorpPolicyOptions,
    icCorpDropdownLoading,
    handleRestrictionSave,
    handleRestrictionRemove,
    restrictionSaveDisabled,
    restrictionSaving,
    restrictionRemoving,
    restrictionLoading,
    loadRestriction,
    hydrateRestrictionFromRow,
    resetRestrictionForm,
    prepareCreateWithInsurer,
    isEditMode,
  };
}
