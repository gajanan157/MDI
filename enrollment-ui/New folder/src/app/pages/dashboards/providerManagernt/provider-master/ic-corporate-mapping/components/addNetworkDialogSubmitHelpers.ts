import type { TFunction } from "i18next";
import type {
  UseFormClearErrors,
  UseFormSetError,
} from "react-hook-form";
import { isEffectiveFromOnOrBeforeEffectiveTo } from "../../../shared/effectiveDateRange";
import type { AddNewNetworkFormShape } from "./AddNetworkDialog";

export type MappingEntity = "ic" | "corporate";

export function getTriggerFields(
  entityType: MappingEntity,
): (keyof AddNewNetworkFormShape)[] {
  return entityType === "corporate"
    ? ["selectedIc", "selectedCorporate"]
    : ["selectedIc"];
}

export function validateEffectiveDateRange(
  effectiveFrom: string,
  effectiveTo: string,
  t: TFunction,
  setError?: UseFormSetError<AddNewNetworkFormShape>,
  clearErrors?: UseFormClearErrors<AddNewNetworkFormShape>,
): boolean {
  if (!isEffectiveFromOnOrBeforeEffectiveTo(effectiveFrom, effectiveTo)) {
    setError?.("effectiveTo", {
      type: "validate",
      message: t("providerMaster.icMapping.validation.effectiveDateOrder"),
    });
    return false;
  }

  clearErrors?.("effectiveTo");
  return true;
}

export function getInwardContextErrorMessage(
  t: TFunction,
  branchMissing: boolean,
  departmentMissing: boolean,
): string {
  if (branchMissing) {
    return t("providerMaster.icMapping.errors.branchUnavailable");
  }
  if (departmentMissing) {
    return t("providerMaster.icMapping.errors.departmentUnavailable");
  }
  return t("providerMaster.icMapping.errors.contextLoading");
}

export function resolveSubmitEntityIds(
  entityType: MappingEntity,
  selectedIc: string,
  selectedCorporate: string,
): { entityId: string; insurerId: string } | null {
  const entityId =
    entityType === "ic" ? String(selectedIc).trim() : String(selectedCorporate).trim();
  const insurerId = String(selectedIc).trim();

  if (!entityId || !insurerId) return null;
  return { entityId, insurerId };
}

export function getUploadErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function resolveEntityLabel(
  options: Array<{ value: unknown; label: string }>,
  selectedValue: string,
): string {
  return (
    options.find((option) => String(option.value) === String(selectedValue))?.label ??
    String(selectedValue)
  );
}
