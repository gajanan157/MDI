import type { AppDispatch } from "@/store/store";
import {
  createProviderDiscountTypeMaster,
  createProviderDiscountSubtypeMaster,
  createProviderDiscountInclusionExclusionMaster,
  createInsurerProviderNetworkMode,
  createProviderIdentifierTypeMaster,
  createProviderTaxonomyMaster,
  patchProviderDiscountTypeMaster,
  patchProviderDiscountSubtypeMaster,
  patchProviderDiscountInclusionExclusionMaster,
  patchInsurerProviderNetworkMode,
  patchProviderIdentifierTypeMaster,
  patchProviderTaxonomyMaster,
} from "@/store/features/providerMasters/providerMastersSlice";
import { showProviderErrorMessage } from "../../shared/ProviderAlertDialog/showProviderAlert";
import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import {
  getIdentifierFormValidationError,
} from "./identifierTypeFormConfig";
import {
  buildDiscountTypeCreatePayload,
  buildDiscountTypePatchPayload,
  getDiscountTypeFormValidationError,
} from "./discountTypeFormConfig";
import {
  buildDiscountSubtypeCreatePayload,
  buildDiscountSubtypePatchPayload,
  getDiscountSubtypeFormValidationError,
} from "./discountSubtypeFormConfig";
import {
  buildDiscountInclusionExclusionCreatePayload,
  buildDiscountInclusionExclusionPatchPayload,
  getDiscountInclusionExclusionFormValidationError,
} from "./discountInclusionExclusionFormConfig";
import {
  buildNetworkModeCreatePayload,
  buildNetworkModePatchPayload,
  getNetworkModeFormValidationError,
} from "./insurerProviderNetworkModeFormConfig";
import type {
  ProviderMasterKey,
  ProviderMasterRecord,
} from "./masterConfig";
import { readProviderMasterRows, writeProviderMasterRows } from "./storage";
import {
  buildTaxonomyCreatePayload,
  buildTaxonomyPatchPayload,
  getTaxonomyFormValidationError,
} from "./taxonomyFormConfig";
import {
  buildProviderIdentifierCreatePayload,
  buildProviderIdentifierPatchPayload,
  createRecordId,
  type MasterFormState,
} from "./providerMasterFunctions";
import { getMasterTypeFlags } from "./providerMastersPageHelpers";

export type SaveAndUpdateProviderMasterArgs = {
  dispatch: AppDispatch;
  selectedMasterKey: ProviderMasterKey;
  form: MasterFormState;
  originalForm: MasterFormState | null;
  isEditMode: boolean;
  editRecordId?: string;
  isSuperAdmin: boolean;
  identifierFormLabels: { code: string; name: string; description: string };
};

function asErrorText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveMutationError(
  error: unknown,
  fallback: string,
): { message: string; status?: number } {
  if (error instanceof Error) {
    return { message: error.message.trim() || fallback };
  }

  if (error && typeof error === "object") {
    const record = error as { message?: unknown; error?: unknown; status?: unknown };
    const message =
      asErrorText(record.message) || asErrorText(record.error) || fallback;
    const status = typeof record.status === "number" ? record.status : undefined;
    return { message, status };
  }

  if (typeof error === "string" && error.trim()) {
    return { message: error.trim() };
  }

  return { message: fallback };
}

function rejectValidationError(validationError: string): false {
  showErrorMessage({ error: validationError });
  return false;
}

function confirmNoPatchChanges(): true {
  showSuccessMessage("No changes to update.");
  return true;
}

async function executeMasterMutation(
  dispatch: AppDispatch,
  mutation: Parameters<AppDispatch>[0],
  failureMessage: string,
): Promise<boolean> {
  try {
    const result = await dispatch(mutation).unwrap();
    showSuccessMessage(result.message);
    return true;
  } catch (error) {
    const { message, status } = resolveMutationError(error, failureMessage);
    showProviderErrorMessage({ status, error: message, message });
    return false;
  }
}

async function patchMasterRecord(
  dispatch: AppDispatch,
  editRecordId: string,
  payload: Record<string, unknown>,
  patchAction: (args: { id: string; payload: Record<string, unknown> }) => Parameters<AppDispatch>[0],
): Promise<boolean> {
  if (Object.keys(payload).length === 0) {
    return confirmNoPatchChanges();
  }

  return executeMasterMutation(
    dispatch,
    patchAction({ id: editRecordId, payload }),
    "Failed to update record.",
  );
}

async function saveNetworkModeMaster({
  dispatch,
  form,
  originalForm,
  isEditMode,
  editRecordId,
}: SaveAndUpdateProviderMasterArgs): Promise<boolean> {
  const validationError = getNetworkModeFormValidationError(form.extra);
  if (validationError) return rejectValidationError(validationError);

  if (isEditMode && editRecordId) {
    if (!originalForm) return false;
    return patchMasterRecord(
      dispatch,
      editRecordId,
      buildNetworkModePatchPayload(form.extra, originalForm.extra),
      patchInsurerProviderNetworkMode,
    );
  }

  return executeMasterMutation(
    dispatch,
    createInsurerProviderNetworkMode(buildNetworkModeCreatePayload(form.extra)),
    "Failed to create record.",
  );
}

async function saveTaxonomyMaster({
  dispatch,
  form,
  originalForm,
  isEditMode,
  editRecordId,
}: SaveAndUpdateProviderMasterArgs): Promise<boolean> {
  const validationError = getTaxonomyFormValidationError(form.extra);
  if (validationError) return rejectValidationError(validationError);

  if (isEditMode && editRecordId) {
    if (!originalForm) return false;
    return patchMasterRecord(
      dispatch,
      editRecordId,
      buildTaxonomyPatchPayload(form.extra, originalForm.extra),
      patchProviderTaxonomyMaster,
    );
  }

  return executeMasterMutation(
    dispatch,
    createProviderTaxonomyMaster(buildTaxonomyCreatePayload(form.extra)),
    "Failed to create record.",
  );
}

async function saveDiscountTypeMaster(
  args: SaveAndUpdateProviderMasterArgs,
): Promise<boolean> {
  const { dispatch, form, originalForm, isEditMode, editRecordId, identifierFormLabels } = args;
  const validationError = getDiscountTypeFormValidationError(form, {
    code: identifierFormLabels.code,
    name: identifierFormLabels.name,
    serviceType: "Service Type",
  });
  if (validationError) return rejectValidationError(validationError);

  if (isEditMode && editRecordId) {
    if (!originalForm) return false;
    return patchMasterRecord(
      dispatch,
      editRecordId,
      buildDiscountTypePatchPayload(form, originalForm),
      patchProviderDiscountTypeMaster,
    );
  }

  return executeMasterMutation(
    dispatch,
    createProviderDiscountTypeMaster(buildDiscountTypeCreatePayload(form)),
    "Failed to create record.",
  );
}

async function saveDiscountSubtypeMaster(
  args: SaveAndUpdateProviderMasterArgs,
): Promise<boolean> {
  const { dispatch, form, originalForm, isEditMode, editRecordId, identifierFormLabels } = args;
  const validationError = getDiscountSubtypeFormValidationError(form, {
    code: identifierFormLabels.code,
    name: identifierFormLabels.name,
    discountType: "Discount Type",
  });
  if (validationError) return rejectValidationError(validationError);

  if (isEditMode && editRecordId) {
    if (!originalForm) return false;
    return patchMasterRecord(
      dispatch,
      editRecordId,
      buildDiscountSubtypePatchPayload(form, originalForm),
      patchProviderDiscountSubtypeMaster,
    );
  }

  return executeMasterMutation(
    dispatch,
    createProviderDiscountSubtypeMaster(buildDiscountSubtypeCreatePayload(form)),
    "Failed to create record.",
  );
}

async function saveDiscountInclusionExclusionMaster(
  args: SaveAndUpdateProviderMasterArgs,
): Promise<boolean> {
  const { dispatch, form, originalForm, isEditMode, editRecordId, identifierFormLabels } = args;
  const validationError = getDiscountInclusionExclusionFormValidationError(form, {
    code: identifierFormLabels.code,
    name: identifierFormLabels.name,
    type: "Type",
  });
  if (validationError) return rejectValidationError(validationError);

  if (isEditMode && editRecordId) {
    if (!originalForm) return false;
    return patchMasterRecord(
      dispatch,
      editRecordId,
      buildDiscountInclusionExclusionPatchPayload(form, originalForm),
      patchProviderDiscountInclusionExclusionMaster,
    );
  }

  return executeMasterMutation(
    dispatch,
    createProviderDiscountInclusionExclusionMaster(
      buildDiscountInclusionExclusionCreatePayload(form),
    ),
    "Failed to create record.",
  );
}

async function saveIdentifierTypeMaster(
  args: SaveAndUpdateProviderMasterArgs,
): Promise<boolean> {
  const { dispatch, form, originalForm, isEditMode, editRecordId, identifierFormLabels } = args;
  const validationError = getIdentifierFormValidationError(form, identifierFormLabels);
  if (validationError) return rejectValidationError(validationError);

  if (isEditMode && editRecordId) {
    if (!originalForm) return false;
    return patchMasterRecord(
      dispatch,
      editRecordId,
      buildProviderIdentifierPatchPayload(form, originalForm),
      patchProviderIdentifierTypeMaster,
    );
  }

  if (!isEditMode) {
    return executeMasterMutation(
      dispatch,
      createProviderIdentifierTypeMaster(buildProviderIdentifierCreatePayload(form)),
      "Failed to create record.",
    );
  }

  return false;
}

function buildLocalMasterRecord(
  selectedMasterKey: ProviderMasterKey,
  form: MasterFormState,
  editRecordId: string | undefined,
  persistExtra: boolean,
): ProviderMasterRecord | null {
  const next: ProviderMasterRecord = {
    id: editRecordId ?? createRecordId(selectedMasterKey),
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    recordStatus: form.recordStatus,
    extra: persistExtra ? form.extra : undefined,
  };

  if (!next.code || !next.name) return null;
  return next;
}

function saveLocalMasterRecord(
  selectedMasterKey: ProviderMasterKey,
  next: ProviderMasterRecord,
  isEditMode: boolean,
  editRecordId: string | undefined,
): boolean {
  const rowsByMaster = readProviderMasterRows();
  const existingRows = rowsByMaster[selectedMasterKey] ?? [];
  const nextRows =
    isEditMode && editRecordId
      ? existingRows.map((row) => (row.id === editRecordId ? next : row))
      : [next, ...existingRows];

  writeProviderMasterRows({ ...rowsByMaster, [selectedMasterKey]: nextRows });
  showSuccessMessage(
    isEditMode
      ? "Master record updated successfully."
      : "Master record added successfully.",
  );
  return true;
}

export async function saveAndUpdateProviderMaster(
  args: SaveAndUpdateProviderMasterArgs,
): Promise<boolean> {
  if (args.isEditMode && !args.isSuperAdmin) {
    showErrorMessage({ error: "Only Super Admin can edit master records." });
    return false;
  }

  const flags = getMasterTypeFlags(args.selectedMasterKey);

  if (flags.isNetworkModeMaster) {
    return saveNetworkModeMaster(args);
  }

  if (flags.isTaxonomyMaster) {
    return saveTaxonomyMaster(args);
  }

  if (flags.isDiscountTypeMaster) {
    return saveDiscountTypeMaster(args);
  }

  if (flags.isDiscountSubtypeMaster) {
    return saveDiscountSubtypeMaster(args);
  }

  if (flags.isDiscountInclusionExclusionMaster) {
    return saveDiscountInclusionExclusionMaster(args);
  }

  const next = buildLocalMasterRecord(
    args.selectedMasterKey,
    args.form,
    args.editRecordId,
    flags.isIdentifierTypeMaster,
  );
  if (!next) return false;

  if (flags.isIdentifierTypeMaster) {
    return saveIdentifierTypeMaster(args);
  }

  return saveLocalMasterRecord(
    args.selectedMasterKey,
    next,
    args.isEditMode,
    args.editRecordId,
  );
}
