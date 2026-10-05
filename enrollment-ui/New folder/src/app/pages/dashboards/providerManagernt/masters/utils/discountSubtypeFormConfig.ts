import type { ProviderMasterExtraValue, ProviderMasterRecord } from "./masterConfig";
import { createDiscountFamilyMasterConfig } from "./discountFamilyMasterFactory";

export const DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD = "providerDiscountTypeMasterId";
export const DISCOUNT_SUBTYPE_TYPE_NAME_FIELD = "providerDiscountTypeName";

type DiscountSubtypeFormState = Pick<
  ProviderMasterRecord,
  "code" | "name" | "description" | "recordStatus"
> & {
  extra: Record<string, ProviderMasterExtraValue>;
};

type DiscountSubtypeListParams = {
  page: number;
  size: number;
  providerDiscountTypeMasterId?: string;
  providerDiscountSubtypeCode?: string;
  providerDiscountSubtypeName?: string;
  isActive?: boolean;
  recordStatus?: string;
};

const discountSubtypeMaster = createDiscountFamilyMasterConfig({
  apiPrefix: "providerDiscountSubtype",
  extraFormKey: DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
  extraApiKey: DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
  extraListParam: "providerDiscountTypeMasterId",
  extraFilterInputKeys: ["providerDiscountTypeMasterId", "discountType"],
  secondaryExtraDefaults: { [DISCOUNT_SUBTYPE_TYPE_NAME_FIELD]: "" },
  validateExtraBeforeCode: true,
});

export function createDiscountSubtypeExtraDefaults(): Record<string, ProviderMasterExtraValue> {
  return discountSubtypeMaster.extraDefaults();
}

export function isDiscountSubtypeFormValid(
  code: string,
  name: string,
  extra: Record<string, ProviderMasterExtraValue>,
): boolean {
  return discountSubtypeMaster.isFormValid(code, name, extra);
}

export function getDiscountSubtypeFormValidationError(
  form: DiscountSubtypeFormState,
  labels: { code: string; name: string; discountType: string },
): string | null {
  return discountSubtypeMaster.getValidationError(form, {
    code: labels.code,
    name: labels.name,
    extra: labels.discountType,
  });
}

export function mapRecordToDiscountSubtypeForm(
  record: ProviderMasterRecord,
): DiscountSubtypeFormState {
  return discountSubtypeMaster.mapRecordToForm(record);
}

export function buildDiscountSubtypeListParams(
  page: number,
  size: number,
  filters: Record<string, unknown>,
): DiscountSubtypeListParams {
  return discountSubtypeMaster.buildListParams(page, size, filters) as DiscountSubtypeListParams;
}

export function buildDiscountSubtypeCreatePayload(
  form: DiscountSubtypeFormState,
): Record<string, unknown> {
  return discountSubtypeMaster.buildCreatePayload(form);
}

export function buildDiscountSubtypePatchPayload(
  current: DiscountSubtypeFormState,
  original: DiscountSubtypeFormState,
): Record<string, unknown> {
  return discountSubtypeMaster.buildPatchPayload(current, original);
}
