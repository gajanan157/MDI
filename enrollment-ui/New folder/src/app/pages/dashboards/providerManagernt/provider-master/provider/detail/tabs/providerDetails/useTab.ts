import { useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useKeycloak } from "@/app/contexts/keycloak/KeycloakProvider";
import { getUserPermissions, type KeycloakJwtPayload } from "@/app/auth/permissions";
import { useRole } from "@/app/auth/usePermission";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchCertificateTypeOptions } from "@/store/features/providerDetail/providerDetailSlice";
import { fetchProviderClinicalSpecialties } from "@/store/features/providerClinicalSpecialties/providerClinicalSpecialtiesSlice";
import { fetchTPABranches } from "@/store/features/tpa/tpaSlice";
import {
  useFieldArray,
  useForm,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { patchProvider } from "@/store/features/provider/providerAPI";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import {
  contactSchema,
  type ContactFormValues,
} from "../../schemas";
import {
  generalInfoSchema,
  type GeneralInfoFormValues,
} from "../../schemas";
import {
  certificatesEditSchema,
  type CertificatesEditFormValues,
} from "../../schemas";
import {
  IDENTIFIERS_EDIT_DEFAULT_VALUES,
  identifiersEditSchema,
  type IdentifiersEditFormValues,
} from "../../schemas";
import type { ProviderDetailsFromApi } from "../../utils/providerDetailSectionMerges";
import {
  CERTIFICATES_DEFAULT_VALUES,
  CONTACT_DEFAULT_VALUES,
  GENERAL_INFO_DEFAULT_VALUES,
} from "./config";
import {
  buildProviderOverviewPatch,
  buildProviderFormValues,
} from "./helpers";
import { mapIdentifiersToFormValues } from "./identifierUtils";
import {
  DEFAULT_PROVIDER_TYPE,
  fetchProviderClassOptions,
  fetchProviderSystemOfMedicineOptions,
  toProviderClassDropdownOptions,
  toProviderSystemOfMedicineDropdownOptions,
  type ProviderSystemOfMedicineOption,
  type ProviderTaxonomyOption,
} from "./options";
import { formatProviderTaxonomyLabel } from "../../../utils/providerTypeConstants";

export function useProviderAdminRole() {
  const { token } = useKeycloak();
  const { hasRole, isSuperAdmin } = useRole();

  if (isSuperAdmin || hasRole("admin") || hasRole("provider.admin")) return true;
  if (token && getUserPermissions(token).has("*")) return true;

  if (token) {
    try {
      const decoded = jwtDecode<KeycloakJwtPayload>(token);
      const realmRoles = decoded.realm_access?.roles ?? [];
      if (realmRoles.includes("super.admin") || realmRoles.includes("admin")) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export function useProviderTypeOptions(currentProviderType?: string | null) {
  const resolvedType = currentProviderType?.trim() || DEFAULT_PROVIDER_TYPE;

  const providerTypeOptions = useMemo(
    () => [
      {
        value: resolvedType,
        label: formatProviderTaxonomyLabel(resolvedType),
      },
    ],
    [resolvedType],
  );

  return {
    providerTypeOptions,
    isProviderTypeLocked: true,
    defaultProviderType: resolvedType,
    loading: false,
  };
}

export function useProviderTaxonomyOptions(enabled = false) {
  const [classRows, setClassRows] = useState<ProviderTaxonomyOption[]>([]);
  const [classLoading, setClassLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      setClassLoading(true);
      // Full HOSPITAL type-master list (no classCode filter) — drives category + multi-select.
      const result = await fetchProviderClassOptions();
      if (cancelled) return;

      if ("error" in result) {
        showErrorMessage({ error: result.error });
        setClassRows([]);
      } else {
        setClassRows(result);
      }
      setClassLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const providerClassOptions = useMemo(
    () => toProviderClassDropdownOptions(classRows),
    [classRows],
  );

  return {
    providerClassOptions,
    classLoading,
    loading: classLoading,
  };
}

/** GET `/v1/provider-clinical-specialty?page=1&size=20&onlyName=true` — same as Add Provider. */
export function useProviderClinicalSpecialtyOptions(enabled = false) {
  const dispatch = useAppDispatch();
  const clinicalSpecialtiesList = useAppSelector(
    (state) => state.providerClinicalSpecialties.clinicalSpecialtiesList,
  );
  const loading = useAppSelector((state) => state.providerClinicalSpecialties.loading);

  useEffect(() => {
    if (!enabled) return;
    dispatch(
      fetchProviderClinicalSpecialties({
        page: 1,
        size: 20,
        onlyName: true,
      }),
    );
  }, [dispatch, enabled]);

  const options = useMemo(
    () =>
      clinicalSpecialtiesList.map((row) => ({
        value: row.id,
        label: row.name,
      })),
    [clinicalSpecialtiesList],
  );

  return { options, loading };
}

/** Ensures specialties already on the provider appear even if missing from the page-1 list. */
export function mergeClinicalSpecialtyOptions(
  options: Array<{ label: string; value: string }>,
  specialtyIds: string[] = [],
  specialtyNames: string[] = [],
): Array<{ label: string; value: string }> {
  const merged = [...options];
  const seen = new Set(options.map((opt) => opt.value.trim()).filter(Boolean));

  const idCount = specialtyIds.length;
  for (let i = 0; i < idCount; i += 1) {
    const id = String(specialtyIds[i] ?? "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const name = String(specialtyNames[i] ?? "").trim() || id;
    merged.push({ value: id, label: name });
  }

  return merged;
}

export function useCertificateOptions(enabled = false) {
  const dispatch = useAppDispatch();
  const certificateTypeOptions = useAppSelector(
    (state) => state.providerDetail.certificateTypeOptions,
  );

  useEffect(() => {
    if (!enabled) return;
    dispatch(fetchCertificateTypeOptions());
  }, [dispatch, enabled]);

  return certificateTypeOptions;
}

export type ProviderDetailsForms = {
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  contactForm: UseFormReturn<ContactFormValues>;
  certDynamicForm: UseFormReturn<CertificatesEditFormValues>;
  identifierForm: UseFormReturn<IdentifiersEditFormValues>;
  providerOldCodeFields: ReturnType<
    typeof useFieldArray<GeneralInfoFormValues, "providerOldCodes">
  >["fields"];
  certEditFields: ReturnType<
    typeof useFieldArray<CertificatesEditFormValues, "items">
  >["fields"];
  appendCertificateRow: ReturnType<
    typeof useFieldArray<CertificatesEditFormValues, "items">
  >["append"];
  removeCertificateRow: ReturnType<
    typeof useFieldArray<CertificatesEditFormValues, "items">
  >["remove"];
  removeIdentifierRow: ReturnType<
    typeof useFieldArray<IdentifiersEditFormValues, "items">
  >["remove"];
  resetProviderForms: () => void;
  hasProviderDetailsChanges: boolean;
  providerTypeOptions: Array<{ label: string; value: string }>;
  isProviderTypeLocked: boolean;
  defaultProviderType: string;
  providerClassOptions: Array<{ label: string; value: string }>;
  providerClassOptionsLoading: boolean;
  clinicalSpecialtyOptions: Array<{ label: string; value: string }>;
  clinicalSpecialtyOptionsLoading: boolean;
  systemOfMedicineOptions: Array<{ label: string; value: string }>;
  systemOfMedicineOptionsLoading: boolean;
  tpaBranchOptions: Array<{ label: string; value: string }>;
};

export function useProviderTpaBranchOptions(enabled = false) {
  const dispatch = useAppDispatch();
  const branches = useAppSelector((state) => state.tpa.branches);

  useEffect(() => {
    if (!enabled) return;
    dispatch(fetchTPABranches({ page: 1, size: 500 }));
  }, [dispatch, enabled]);

  return useMemo(
    () => [
      { value: "", label: "Select" },
      ...(branches ?? []).map((branch) => ({
        value: branch.tpaBranchId,
        label: String(branch.branchName ?? branch.parentBranchName ?? branch.tpaBranchId).trim(),
      })),
    ],
    [branches],
  );
}

export function useProviderSystemOfMedicineOptions(enabled = false) {
  const [rows, setRows] = useState<ProviderSystemOfMedicineOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      const result = await fetchProviderSystemOfMedicineOptions();
      if (cancelled) return;

      if ("error" in result) {
        showErrorMessage({ error: result.error });
        setRows([]);
      } else {
        setRows(result);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const options = useMemo(
    () => toProviderSystemOfMedicineDropdownOptions(rows),
    [rows],
  );

  return { options, loading };
}

export function useProviderDetailsForms(
  providerDetails: ProviderDetailsFromApi | null,
  isEditMode = false,
): ProviderDetailsForms {
  const generalInfoForm = useForm<GeneralInfoFormValues>({
    resolver: yupResolver(generalInfoSchema),
    defaultValues: GENERAL_INFO_DEFAULT_VALUES,
  });

  const {
    providerTypeOptions,
    isProviderTypeLocked,
    defaultProviderType,
  } = useProviderTypeOptions(providerDetails?.providerType);

  const {
    providerClassOptions,
    classLoading: providerClassOptionsLoading,
  } = useProviderTaxonomyOptions(isEditMode);

  const {
    options: clinicalSpecialtyApiOptions,
    loading: clinicalSpecialtyOptionsLoading,
  } = useProviderClinicalSpecialtyOptions(isEditMode);

  const clinicalSpecialtyOptions = useMemo(
    () =>
      mergeClinicalSpecialtyOptions(
        clinicalSpecialtyApiOptions,
        providerDetails?.clinicalSpecialtyIds,
        providerDetails?.clinicalSpecialties,
      ),
    [
      clinicalSpecialtyApiOptions,
      providerDetails?.clinicalSpecialtyIds,
      providerDetails?.clinicalSpecialties,
    ],
  );

  const {
    options: systemOfMedicineOptions,
    loading: systemOfMedicineOptionsLoading,
  } = useProviderSystemOfMedicineOptions(isEditMode);
  const tpaBranchOptions = useProviderTpaBranchOptions(isEditMode);

  const contactForm = useForm<ContactFormValues>({
    resolver: yupResolver(contactSchema) as Resolver<ContactFormValues>,
    defaultValues: CONTACT_DEFAULT_VALUES,
  });

  const certDynamicForm = useForm<CertificatesEditFormValues>({
    resolver: yupResolver(
      certificatesEditSchema,
    ) as Resolver<CertificatesEditFormValues>,
    defaultValues: CERTIFICATES_DEFAULT_VALUES,
  });

  const identifierForm = useForm<IdentifiersEditFormValues>({
    resolver: yupResolver(identifiersEditSchema) as Resolver<IdentifiersEditFormValues>,
    defaultValues: IDENTIFIERS_EDIT_DEFAULT_VALUES,
  });

  const { fields: providerOldCodeFields } = useFieldArray({
    control: generalInfoForm.control,
    name: "providerOldCodes",
  });

  const {
    fields: certEditFields,
    append: appendCertificateRow,
    remove: removeCertificateRow,
  } = useFieldArray({
    control: certDynamicForm.control,
    name: "items",
  });

  const { remove: removeIdentifierRow } = useFieldArray({
    control: identifierForm.control,
    name: "items",
  });

  const resetProviderForms = useCallback(() => {
    if (!providerDetails) return;
    const { general, contact, certs } = buildProviderFormValues(
      providerDetails,
      clinicalSpecialtyOptions,
      systemOfMedicineOptions,
    );
    generalInfoForm.reset(general);
    contactForm.reset(contact);
    certDynamicForm.reset(certs);
    identifierForm.reset(mapIdentifiersToFormValues(providerDetails.identifiers));
  }, [
    providerDetails,
    clinicalSpecialtyOptions,
    systemOfMedicineOptions,
    generalInfoForm,
    contactForm,
    certDynamicForm,
    identifierForm,
  ]);

  useEffect(() => {
    resetProviderForms();
  }, [resetProviderForms]);

  const hasProviderDetailsChanges =
    generalInfoForm.formState.isDirty ||
    contactForm.formState.isDirty ||
    certDynamicForm.formState.isDirty ||
    identifierForm.formState.isDirty;

  return {
    generalInfoForm,
    contactForm,
    certDynamicForm,
    identifierForm,
    providerOldCodeFields,
    certEditFields,
    appendCertificateRow,
    removeCertificateRow,
    removeIdentifierRow,
    resetProviderForms,
    hasProviderDetailsChanges,
    providerTypeOptions,
    isProviderTypeLocked,
    defaultProviderType,
    providerClassOptions,
    providerClassOptionsLoading,
    clinicalSpecialtyOptions,
    clinicalSpecialtyOptionsLoading,
    systemOfMedicineOptions,
    systemOfMedicineOptionsLoading,
    tpaBranchOptions,
  };
}
type SaveForms = {
  generalInfoForm: UseFormReturn<GeneralInfoFormValues>;
  contactForm: UseFormReturn<ContactFormValues>;
  certDynamicForm: UseFormReturn<CertificatesEditFormValues>;
  identifierForm: UseFormReturn<IdentifiersEditFormValues>;
};

type UseProviderDetailsSaveArgs = {
  providerDetails: ProviderDetailsFromApi | null;
  forms: SaveForms;
  clinicalSpecialtyOptions?: Array<{ label: string; value: string }>;
  onRefreshDetails?: () => Promise<void> | void;
  onSaveComplete: () => void;
};

export function useProviderDetailsSave({
  providerDetails,
  forms,
  clinicalSpecialtyOptions = [],
  onRefreshDetails,
  onSaveComplete,
}: UseProviderDetailsSaveArgs) {
  const { generalInfoForm, contactForm, certDynamicForm, identifierForm } = forms;

  const [saving, setSaving] = useState(false);

  const saveProviderDetails = async (
    general: GeneralInfoFormValues,
    contact: ContactFormValues,
    certs: CertificatesEditFormValues,
    identifiers: IdentifiersEditFormValues,
  ) => {
    const providerId = providerDetails?.providerId;
    if (!providerId) {
      showErrorMessage({
        error: "Provider ID is missing. Cannot save details.",
      });
      return;
    }
    if (!providerDetails) return;

    const providerOldCodesDirty = Boolean(
      generalInfoForm.formState.dirtyFields?.providerOldCodes,
    );
    const payload = buildProviderOverviewPatch({
      providerDetails,
      general,
      contact,
      certs,
      identifiers,
      providerOldCodesDirty,
      clinicalSpecialtyOptions,
    });

    if (Object.keys(payload).length === 0) {
      showSuccessMessage("No changes to update.");
      onSaveComplete();
      return;
    }

    const patchRes = await patchProvider(providerId, payload);
    if (!patchRes.success) {
      showErrorMessage({
        status: patchRes.status,
        error: patchRes.error ?? "Failed to update provider details.",
      });
      return;
    }

    if (onRefreshDetails) {
      await onRefreshDetails();
    }
    showSuccessMessage(patchRes.message ?? undefined);
    onSaveComplete();
  };

  const handlePageSave = async () => {
    if (saving) return;
    const [generalValid, contactValid, certsValid, identifiersValid] = await Promise.all([
      generalInfoForm.trigger(),
      contactForm.trigger(),
      certDynamicForm.trigger(),
      identifierForm.trigger(),
    ]);
    if (!generalValid || !contactValid || !certsValid || !identifiersValid) return;

    setSaving(true);
    try {
      await saveProviderDetails(
        generalInfoForm.getValues(),
        contactForm.getValues(),
        certDynamicForm.getValues(),
        identifierForm.getValues(),
      );
    } finally {
      setSaving(false);
    }
  };

  return { handlePageSave, saving };
}
