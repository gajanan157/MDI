import {
  DEFAULT_PROVIDER_MASTER_KEY,
  isProviderMasterKey,
  type ProviderMasterKey,
} from "./masterConfig";
import type { Dispatch, SetStateAction } from "react";
import {
  createIdentifierExtraDefaults,
  isIdentifierFormValid,
  type IdentifierExtraField,
} from "./identifierTypeFormConfig";
import { createDiscountTypeExtraDefaults, isDiscountTypeFormValid } from "./discountTypeFormConfig";
import {
  createDiscountSubtypeExtraDefaults,
  isDiscountSubtypeFormValid,
} from "./discountSubtypeFormConfig";
import {
  createDiscountInclusionExclusionExtraDefaults,
  isDiscountInclusionExclusionFormValid,
} from "./discountInclusionExclusionFormConfig";
import {
  createTaxonomyFormDefaults,
  isTaxonomyFormValid,
  mapRecordToTaxonomyFormExtra,
  TAXONOMY_FIELDS,
} from "./taxonomyFormConfig";
import {
  createNetworkModeFormDefaults,
  isNetworkModeFormValid,
  mapRecordToNetworkModeFormExtra,
} from "./insurerProviderNetworkModeFormConfig";
import {
  INSURER_PROVIDER_NETWORK_MODE_KEY,
  PROVIDER_DISCOUNT_TYPE_MASTER_KEY,
  PROVIDER_DISCOUNT_SUB_TYPE_MASTER_KEY,
  isDiscountInclusionExclusionMasterKey,
  PROVIDER_IDENTIFIER_TYPE_MASTER_KEY,
  PROVIDER_TAXONOMY_KEY,
  type MasterFormState,
} from "./providerMasterFunctions";
import { readProviderMasterRows } from "./storage";
import type { ProviderMasterRecord } from "./masterConfig";

export const emptyMasterForm: MasterFormState = {
  code: "",
  name: "",
  description: "",
  recordStatus: "ACTIVE",
  extra: {},
};

export function resolveSelectedMasterKey(
  routeMaster: string,
  queryMaster: string,
): ProviderMasterKey {
  if (isProviderMasterKey(routeMaster)) return routeMaster;
  if (isProviderMasterKey(queryMaster)) return queryMaster;
  return DEFAULT_PROVIDER_MASTER_KEY;
}

export function buildInitialMasterFormState(
  selectedMasterKey: ProviderMasterKey,
  editRecordId?: string,
): MasterFormState {
  const storedRecord = editRecordId
    ? readProviderMasterRows()[selectedMasterKey]?.find((row) => row.id === editRecordId)
    : undefined;

  if (selectedMasterKey === PROVIDER_TAXONOMY_KEY) {
    return {
      ...emptyMasterForm,
      extra: storedRecord
        ? mapRecordToTaxonomyFormExtra(storedRecord)
        : createTaxonomyFormDefaults(),
    };
  }

  if (selectedMasterKey === INSURER_PROVIDER_NETWORK_MODE_KEY) {
    return {
      ...emptyMasterForm,
      extra: storedRecord
        ? mapRecordToNetworkModeFormExtra(storedRecord)
        : createNetworkModeFormDefaults(),
    };
  }

  const baseForm = storedRecord
    ? {
        code: storedRecord.code,
        name: storedRecord.name,
        description: storedRecord.description,
        recordStatus: storedRecord.recordStatus,
        extra: storedRecord.extra ?? {},
      }
    : emptyMasterForm;

  return {
    ...baseForm,
    extra: {
      ...(selectedMasterKey === PROVIDER_IDENTIFIER_TYPE_MASTER_KEY
        ? createIdentifierExtraDefaults()
        : {}),
      ...(selectedMasterKey === PROVIDER_DISCOUNT_TYPE_MASTER_KEY
        ? createDiscountTypeExtraDefaults()
        : {}),
      ...(selectedMasterKey === PROVIDER_DISCOUNT_SUB_TYPE_MASTER_KEY
        ? createDiscountSubtypeExtraDefaults()
        : {}),
      ...(isDiscountInclusionExclusionMasterKey(selectedMasterKey)
        ? createDiscountInclusionExclusionExtraDefaults()
        : {}),
      ...(storedRecord?.extra ?? {}),
    },
  };
}

type SaveDisabledParams = {
  isEditMode: boolean;
  isSuperAdmin: boolean;
  isNetworkModeMaster: boolean;
  isTaxonomyMaster: boolean;
  isIdentifierTypeMaster: boolean;
  isDiscountTypeMaster: boolean;
  isDiscountSubtypeMaster: boolean;
  isDiscountInclusionExclusionMaster: boolean;
  detailLoading: boolean;
  originalForm: MasterFormState | null;
  form: MasterFormState;
  identifierFormLabels: {
    code: string;
    name: string;
    description: string;
  };
};

function isDiscountFamilySaveDisabled({
  isEditMode,
  isDiscountTypeMaster,
  isDiscountSubtypeMaster,
  detailLoading,
  originalForm,
  form,
}: Pick<
  SaveDisabledParams,
  | "isEditMode"
  | "isDiscountTypeMaster"
  | "isDiscountSubtypeMaster"
  | "detailLoading"
  | "originalForm"
  | "form"
>): boolean {
  if (isEditMode && (detailLoading || !originalForm)) return true;
  if (isDiscountTypeMaster) return !isDiscountTypeFormValid(form.code, form.name, form.extra);
  if (isDiscountSubtypeMaster) return !isDiscountSubtypeFormValid(form.code, form.name, form.extra);
  return !isDiscountInclusionExclusionFormValid(form.code, form.name, form.extra);
}

export function isProviderMasterSaveDisabled({
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
}: SaveDisabledParams): boolean {
  if (isEditMode && !isSuperAdmin) return true;
  if (isNetworkModeMaster) {
    if (isEditMode && (detailLoading || !originalForm)) return true;
    return !isNetworkModeFormValid(form.extra);
  }
  if (isTaxonomyMaster) return !isTaxonomyFormValid(form.extra);
  if (isIdentifierTypeMaster) return !isIdentifierFormValid(form, identifierFormLabels);
  if (isDiscountTypeMaster || isDiscountSubtypeMaster || isDiscountInclusionExclusionMaster) {
    return isDiscountFamilySaveDisabled({
      isEditMode,
      isDiscountTypeMaster,
      isDiscountSubtypeMaster,
      detailLoading,
      originalForm,
      form,
    });
  }

  return !form.code.trim() || !form.name.trim();
}

export function updateMasterFormExtra(
  setForm: Dispatch<SetStateAction<MasterFormState>>,
  fieldName: string,
  value: unknown,
) {
  setForm((prev) => ({
    ...prev,
    extra: {
      ...prev.extra,
      [fieldName]: value,
    },
  }));
}

export function getNetworkModeDateBounds(
  fieldName: string,
  effectiveFrom: string,
  effectiveTo: string,
) {
  if (fieldName === "insurerProviderNetworkModeEffectiveFrom" && effectiveTo) {
    return { max: effectiveTo.slice(0, 10), min: undefined };
  }
  if (fieldName === "insurerProviderNetworkModeEffectiveTo" && effectiveFrom) {
    return { min: effectiveFrom.slice(0, 10), max: undefined };
  }
  return { min: undefined, max: undefined };
}

export function getTaxonomyFieldValue(
  fieldName: string,
  extra: MasterFormState["extra"],
  defaultActiveStatus: string,
) {
  return String(extra[fieldName] ?? (fieldName === "is_active" ? defaultActiveStatus : ""));
}

export function getIdentifierFieldValue(
  field: IdentifierExtraField,
  extra: MasterFormState["extra"],
  defaultValueDataType: string,
) {
  if (field.name === "valueDataType") {
    return String(extra[field.name] ?? defaultValueDataType);
  }
  return String(extra[field.name] ?? "");
}

export function mapRecordToLoadedForm(
  record: ProviderMasterRecord,
  isIdentifierTypeMaster: boolean,
): MasterFormState {
  return {
    code: record.code,
    name: record.name,
    description: record.description,
    recordStatus: record.recordStatus,
    extra: {
      ...(isIdentifierTypeMaster ? createIdentifierExtraDefaults() : {}),
      ...(record.extra ?? {}),
    },
  };
}

export { TAXONOMY_FIELDS };
