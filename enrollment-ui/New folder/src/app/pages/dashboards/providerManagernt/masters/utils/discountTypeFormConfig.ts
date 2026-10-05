import type { ProviderMasterExtraValue, ProviderMasterRecord } from "./masterConfig";
import { createDiscountFamilyMasterConfig } from "./discountFamilyMasterFactory";

export const DISCOUNT_TYPE_SERVICE_TYPE_FIELD = "provider_service_type";

type DiscountTypeFormState = Pick<
  ProviderMasterRecord,
  "code" | "name" | "description" | "recordStatus"
> & {
  extra: Record<string, ProviderMasterExtraValue>;
};

type DiscountTypeListParams = {
  page: number;
  size: number;
  providerDiscountTypeCode?: string;
  providerServiceType?: string;
  providerDiscountTypeName?: string;
  isActive?: boolean;
  recordStatus?: string;
};

const discountTypeMaster = createDiscountFamilyMasterConfig({
  apiPrefix: "providerDiscountType",
  extraFormKey: DISCOUNT_TYPE_SERVICE_TYPE_FIELD,
  extraApiKey: "providerServiceType",
  extraListParam: "providerServiceType",
  extraFilterInputKeys: ["serviceType"],
});

export function createDiscountTypeExtraDefaults(): Record<string, ProviderMasterExtraValue> {
  return discountTypeMaster.extraDefaults();
}

export function isDiscountTypeActive(status: DiscountTypeFormState["recordStatus"]): boolean {
  return status === "ACTIVE";
}

export function isDiscountTypeFormValid(
  code: string,
  name: string,
  extra: Record<string, ProviderMasterExtraValue>,
): boolean {
  return discountTypeMaster.isFormValid(code, name, extra);
}

export function getDiscountTypeFormValidationError(
  form: DiscountTypeFormState,
  labels: { code: string; name: string; serviceType: string },
): string | null {
  return discountTypeMaster.getValidationError(form, {
    code: labels.code,
    name: labels.name,
    extra: labels.serviceType,
  });
}

export function mapRecordToDiscountTypeForm(record: ProviderMasterRecord): DiscountTypeFormState {
  return discountTypeMaster.mapRecordToForm(record);
}

export function buildDiscountTypeListParams(
  page: number,
  size: number,
  filters: Record<string, unknown>,
): DiscountTypeListParams {
  return discountTypeMaster.buildListParams(page, size, filters) as DiscountTypeListParams;
}

export function buildDiscountTypeCreatePayload(
  form: DiscountTypeFormState,
): Record<string, unknown> {
  return discountTypeMaster.buildCreatePayload(form);
}

export function buildDiscountTypePatchPayload(
  current: DiscountTypeFormState,
  original: DiscountTypeFormState,
): Record<string, unknown> {
  return discountTypeMaster.buildPatchPayload(current, original);
}
