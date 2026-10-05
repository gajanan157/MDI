import {
  IDENTIFIER_EXTRA_FIELDS,
} from "./identifierTypeFormConfig";
import type {
  ProviderMasterExtraValue,
  ProviderMasterKey,
  ProviderMasterRecord,
} from "./masterConfig";

export type MasterFormState = Pick<
  ProviderMasterRecord,
  "code" | "name" | "description" | "recordStatus"
> & {
  extra: Record<string, ProviderMasterExtraValue>;
};

export const PROVIDER_IDENTIFIER_TYPE_MASTER_KEY: ProviderMasterKey =
  "provider_identifier_type_master";
export const PROVIDER_TAXONOMY_KEY: ProviderMasterKey = "provider_taxonomy";
export const INSURER_PROVIDER_NETWORK_MODE_KEY: ProviderMasterKey =
  "insurer_provider_network_mode";
export const PROVIDER_DISCOUNT_TYPE_MASTER_KEY: ProviderMasterKey =
  "provider_discount_type_master";
export const PROVIDER_DISCOUNT_SUB_TYPE_MASTER_KEY: ProviderMasterKey =
  "provider_discount_sub_type_master";
export const PROVIDER_DISCOUNT_INCLUSION_EXCLUSION_MASTER_KEY: ProviderMasterKey =
  "provider_discount_inclusion_exclusion_master";

export function isDiscountInclusionExclusionMasterKey(
  selectedMasterKey: ProviderMasterKey,
): boolean {
  return selectedMasterKey === PROVIDER_DISCOUNT_INCLUSION_EXCLUSION_MASTER_KEY;
}

export function createRecordId(masterKey: ProviderMasterKey): string {
  return `${masterKey}-${Date.now()}`;
}

export function buildProviderIdentifierPatchPayload(
  current: MasterFormState,
  original: MasterFormState,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (current.code.trim() !== original.code.trim()) {
    payload.identifierTypeCode = current.code.trim();
  }
  if (current.name.trim() !== original.name.trim()) {
    payload.identifierTypeName = current.name.trim();
  }
  if (current.description.trim() !== original.description.trim()) {
    payload.identifierTypeDescription = current.description.trim();
  }
  if (current.recordStatus !== original.recordStatus) {
    payload.recordStatus = current.recordStatus;
  }

  for (const field of IDENTIFIER_EXTRA_FIELDS) {
    const currentValue = current.extra[field.name];
    const originalValue = original.extra[field.name];

    if (field.type === "checkbox") {
      if (Boolean(currentValue) !== Boolean(originalValue)) {
        payload[field.name] = Boolean(currentValue);
      }
      continue;
    }

    const currentStr = String(currentValue ?? "").trim();
    const originalStr = String(originalValue ?? "").trim();
    if (currentStr !== originalStr) {
      payload[field.name] = currentStr;
    }
  }

  return payload;
}

export function buildProviderIdentifierCreatePayload(
  form: MasterFormState,
): Record<string, unknown> {
  return {
    identifierTypeCode: form.code.trim(),
    identifierTypeName: form.name.trim(),
    identifierTypeDescription: form.description.trim(),
    recordStatus: form.recordStatus,
    identifierLevel: String(form.extra.identifierLevel ?? "").trim(),
    identifierCategory: String(form.extra.identifierCategory ?? "").trim(),
    identifierSubcategory: String(form.extra.identifierSubcategory ?? "").trim(),
    issuingAuthorityName: String(form.extra.issuingAuthorityName ?? "").trim(),
    applicableProviderType: String(form.extra.applicableProviderType ?? "").trim(),
    applicableProviderClass: String(form.extra.applicableProviderClass ?? "").trim(),
    applicableProviderSubclass: String(form.extra.applicableProviderSubclass ?? "").trim(),
    valueDataType: String(form.extra.valueDataType ?? "").trim(),
    appliesToProvider: Boolean(form.extra.appliesToProvider),
    appliesToFacility: Boolean(form.extra.appliesToFacility),
    appliesToPractitioner: Boolean(form.extra.appliesToPractitioner),
    isMandatory: Boolean(form.extra.isMandatory),
    allowsMultiple: Boolean(form.extra.allowsMultiple),
    supportsValidityPeriod: Boolean(form.extra.supportsValidityPeriod),
    verificationRequired: Boolean(form.extra.verificationRequired),
    isPrimaryAllowed: Boolean(form.extra.isPrimaryAllowed),
    isUniquePerProvider: Boolean(form.extra.isUniquePerProvider),
    isUniquePerFacility: Boolean(form.extra.isUniquePerFacility),
    isUniquePerPractitioner: Boolean(form.extra.isUniquePerPractitioner),
    isGloballyUnique: Boolean(form.extra.isGloballyUnique),
    sourceOfTruth: String(form.extra.sourceOfTruth ?? "").trim(),
    sourceSystem: String(form.extra.sourceSystem ?? "").trim(),
  };
}

export { saveAndUpdateProviderMaster } from "./saveProviderMasterHelpers";
