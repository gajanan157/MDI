import type { ProviderMasterExtraValue, ProviderMasterRecord } from "./masterConfig";
import { createDiscountFamilyMasterConfig } from "./discountFamilyMasterFactory";

export const DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD = "providerInclusionExclusionType";

export const DISCOUNT_INCLUSION_EXCLUSION_TYPES = ["INCLUSION", "EXCLUSION"] as const;

export type DiscountInclusionExclusionTypeValue =
  (typeof DISCOUNT_INCLUSION_EXCLUSION_TYPES)[number];

type DiscountInclusionExclusionFormState = Pick<
  ProviderMasterRecord,
  "code" | "name" | "description" | "recordStatus"
> & {
  extra: Record<string, ProviderMasterExtraValue>;
};

type DiscountInclusionExclusionListParams = {
  page: number;
  size: number;
  providerInclusionExclusionCode?: string;
  providerInclusionExclusionType?: string;
  providerInclusionExclusionName?: string;
  isActive?: boolean;
  recordStatus?: string;
};

const discountInclusionExclusionMaster = createDiscountFamilyMasterConfig({
  apiPrefix: "providerInclusionExclusion",
  extraFormKey: DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
  extraApiKey: "providerInclusionExclusionType",
  extraListParam: "providerInclusionExclusionType",
  extraFilterInputKeys: [DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD, "inclusionExclusionType"],
});

export function createDiscountInclusionExclusionExtraDefaults(): Record<
  string,
  ProviderMasterExtraValue
> {
  return discountInclusionExclusionMaster.extraDefaults();
}

export function isDiscountInclusionExclusionFormValid(
  code: string,
  name: string,
  extra: Record<string, ProviderMasterExtraValue>,
): boolean {
  return discountInclusionExclusionMaster.isFormValid(code, name, extra);
}

export function getDiscountInclusionExclusionFormValidationError(
  form: DiscountInclusionExclusionFormState,
  labels: { code: string; name: string; type: string },
): string | null {
  return discountInclusionExclusionMaster.getValidationError(form, {
    code: labels.code,
    name: labels.name,
    extra: labels.type,
  });
}

export function mapRecordToDiscountInclusionExclusionForm(
  record: ProviderMasterRecord,
): DiscountInclusionExclusionFormState {
  return discountInclusionExclusionMaster.mapRecordToForm(record);
}

export function buildDiscountInclusionExclusionListParams(
  page: number,
  size: number,
  filters: Record<string, unknown>,
): DiscountInclusionExclusionListParams {
  return discountInclusionExclusionMaster.buildListParams(
    page,
    size,
    filters,
  ) as DiscountInclusionExclusionListParams;
}

export function buildDiscountInclusionExclusionCreatePayload(
  form: DiscountInclusionExclusionFormState,
): Record<string, unknown> {
  return discountInclusionExclusionMaster.buildCreatePayload(form);
}

export function buildDiscountInclusionExclusionPatchPayload(
  current: DiscountInclusionExclusionFormState,
  original: DiscountInclusionExclusionFormState,
): Record<string, unknown> {
  return discountInclusionExclusionMaster.buildPatchPayload(current, original);
}
