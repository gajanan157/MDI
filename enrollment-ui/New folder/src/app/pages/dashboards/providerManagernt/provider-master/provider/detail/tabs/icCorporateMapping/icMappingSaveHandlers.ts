import { showErrorMessage, showSuccessMessage } from "@/utils/errorHandler";
import {
  buildNetworkMappingCreateBodies,
  buildNetworkMappingUpdateBody,
  cloneIcMappingFormState,
  resolveIcMappingFormForSave,
  resolveProviderNetworkMappingId,
} from "./mapping/utils";
import {
  createProviderNetworkMapping,
  patchProviderNetworkMapping,
} from "./api";
import type { IcMappingFormState } from "./types";
import {
  hasSupportingDocumentPresent,
  isRemarkFilled,
  REMARK_REQUIRED_MESSAGE,
  SUPPORTING_DOCUMENT_REQUIRED_MESSAGE,
} from "./shared";

type MappingSubTab = "ic" | "corporate";

type IcMappingSaveContext = {
  providerId: string;
  mappingSubTab: MappingSubTab;
  isEditingExistingMapping: boolean;
  formForSave: IcMappingFormState;
  icMappingDetail: { editing?: boolean; item?: unknown } | null | undefined;
  icMappingOriginalFormRef: { current: IcMappingFormState | null };
  icMappingSelectForm: {
    trigger: (field: "icName" | "corporateIds") => Promise<boolean>;
  };
  icMappingForm: IcMappingFormState;
  setIcMappingDateOrderError: (message: string) => void;
  setIcMappingForm: (form: IcMappingFormState) => void;
  handleCloseIcMappingDetail: () => void;
  handleCloseIcMappingForm: () => void;
  onIcMappingSaved?: () => void | Promise<void>;
};

export async function validateIcMappingEntityFields(
  ctx: Pick<IcMappingSaveContext, "isEditingExistingMapping" | "mappingSubTab" | "icMappingSelectForm">,
): Promise<boolean> {
  if (ctx.isEditingExistingMapping) return true;

  if (ctx.mappingSubTab === "corporate") {
    const icValid = await ctx.icMappingSelectForm.trigger("icName");
    const corporateValid = await ctx.icMappingSelectForm.trigger("corporateIds");
    return icValid && corporateValid;
  }

  return ctx.icMappingSelectForm.trigger("icName");
}

export function validateIcMappingRequiredFields(
  form: IcMappingFormState,
): boolean {
  if (!form.effectiveFrom.trim()) {
    return false;
  }

  if (!form.networkMode.trim() || !form.tariffType.trim()) {
    showErrorMessage({
      error: "Network Mode and Tariff Type are required. Select an Insurance Company to load them.",
    });
    return false;
  }

  if (!isRemarkFilled(form.remarks)) {
    showErrorMessage({ error: REMARK_REQUIRED_MESSAGE });
    return false;
  }

  if (!hasSupportingDocumentPresent(form)) {
    showErrorMessage({ error: SUPPORTING_DOCUMENT_REQUIRED_MESSAGE });
    return false;
  }

  return true;
}

export async function resolveFormForIcMappingSave(
  providerId: string,
  form: IcMappingFormState,
  setIcMappingForm: (form: IcMappingFormState) => void,
): Promise<IcMappingFormState | null> {
  const resolvedFormResult = await resolveIcMappingFormForSave(providerId, form);
  if (!resolvedFormResult.ok) {
    showErrorMessage({ error: resolvedFormResult.message });
    return null;
  }

  const formForSave = resolvedFormResult.form;
  if (formForSave !== form) {
    setIcMappingForm(formForSave);
  }
  return formForSave;
}

export async function saveExistingIcMapping(ctx: IcMappingSaveContext): Promise<boolean> {
  if (!ctx.icMappingDetail?.item) {
    showErrorMessage({ error: "Mapping details are not available." });
    return false;
  }

  const originalForm =
    ctx.icMappingOriginalFormRef.current ??
    cloneIcMappingFormState(ctx.formForSave);
  if (!ctx.icMappingOriginalFormRef.current) {
    ctx.icMappingOriginalFormRef.current = originalForm;
  }

  const providerNetworkMappingId = resolveProviderNetworkMappingId(ctx.icMappingDetail.item);
  if (!providerNetworkMappingId) {
    showErrorMessage({ error: "Network mapping id is missing for this row." });
    return false;
  }

  const updateBody = buildNetworkMappingUpdateBody(
    providerNetworkMappingId,
    ctx.providerId,
    originalForm,
    ctx.formForSave,
    ctx.mappingSubTab,
  );
  if (!updateBody) {
    showErrorMessage({ error: "No changes to update." });
    return false;
  }

  const result = await patchProviderNetworkMapping(ctx.providerId, updateBody);
  if (!result.ok) {
    showErrorMessage({ error: result.message });
    return false;
  }

  showSuccessMessage(result.message);
  ctx.handleCloseIcMappingDetail();
  await ctx.onIcMappingSaved?.();
  return true;
}

export async function saveNewIcMapping(ctx: IcMappingSaveContext): Promise<boolean> {
  const createBodies = buildNetworkMappingCreateBodies(
    ctx.providerId,
    ctx.formForSave,
    ctx.mappingSubTab,
  );
  if (ctx.mappingSubTab === "corporate" && createBodies.length === 0) return false;

  let successMessage = "";
  for (const body of createBodies) {
    const result = await createProviderNetworkMapping(ctx.providerId, body);
    if (!result.ok) {
      showErrorMessage({ error: result.message });
      return false;
    }
    successMessage = result.message;
  }

  showSuccessMessage(successMessage);
  ctx.handleCloseIcMappingForm();
  await ctx.onIcMappingSaved?.();
  return true;
}
