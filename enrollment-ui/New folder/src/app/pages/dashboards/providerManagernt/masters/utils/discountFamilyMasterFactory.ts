import type {
  ProviderMasterExtraValue,
  ProviderMasterRecord,
  ProviderMasterRecordStatus,
} from "./masterConfig";

/**
 * Shared shape + CRUD-helper logic for the three "discount family" masters
 * (discount type, discount subtype, discount inclusion/exclusion), which are
 * identical except for their API field prefix and which extra field(s) they carry.
 */
export type DiscountFamilyFormState = Pick<
  ProviderMasterRecord,
  "code" | "name" | "description" | "recordStatus"
> & {
  extra: Record<string, ProviderMasterExtraValue>;
};

export function asDiscountFamilyFilterText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isDiscountFamilyRecordActive(status: ProviderMasterRecordStatus): boolean {
  return status === "ACTIVE";
}

export type DiscountFamilyMasterSpec = {
  /** e.g. "providerDiscountType" -> builds `${apiPrefix}Code/Name/Description` API fields. */
  apiPrefix: string;
  /** Key inside `form.extra` holding the master-specific required value. */
  extraFormKey: string;
  /** API field name the extra value is sent under in create/patch payloads. */
  extraApiKey: string;
  /** Query param name the extra value is sent under in list params. */
  extraListParam: string;
  /** UI filter keys to read the extra value from, in priority order. */
  extraFilterInputKeys: string[];
  /** Additional non-validated, non-API extra fields to seed as defaults (e.g. a cached display name). */
  secondaryExtraDefaults?: Record<string, ProviderMasterExtraValue>;
  /** Discount subtype validates its extra field before code; the others validate code first. */
  validateExtraBeforeCode?: boolean;
};

export function createDiscountFamilyMasterConfig(spec: DiscountFamilyMasterSpec) {
  const {
    apiPrefix,
    extraFormKey,
    extraApiKey,
    extraListParam,
    extraFilterInputKeys,
    secondaryExtraDefaults,
    validateExtraBeforeCode,
  } = spec;

  function extraDefaults(): Record<string, ProviderMasterExtraValue> {
    return { [extraFormKey]: "", ...(secondaryExtraDefaults ?? {}) };
  }

  function isFormValid(
    code: string,
    name: string,
    extra: Record<string, ProviderMasterExtraValue>,
  ): boolean {
    return Boolean(code.trim() && name.trim() && String(extra[extraFormKey] ?? "").trim());
  }

  function getValidationError(
    form: DiscountFamilyFormState,
    labels: { code: string; name: string; extra: string },
  ): string | null {
    const checkCode = () => (!form.code.trim() ? `${labels.code} is required.` : null);
    const checkExtra = () =>
      !String(form.extra[extraFormKey] ?? "").trim() ? `${labels.extra} is required.` : null;
    const checkName = () => (!form.name.trim() ? `${labels.name} is required.` : null);

    const order = validateExtraBeforeCode
      ? [checkExtra, checkCode, checkName]
      : [checkCode, checkExtra, checkName];

    for (const check of order) {
      const error = check();
      if (error) return error;
    }
    return null;
  }

  function mapRecordToForm(record: ProviderMasterRecord): DiscountFamilyFormState {
    return {
      code: record.code,
      name: record.name,
      description: record.description,
      recordStatus: record.recordStatus,
      extra: {
        ...extraDefaults(),
        ...record.extra,
      },
    };
  }

  function buildListParams(
    page: number,
    size: number,
    filters: Record<string, unknown>,
  ): Record<string, unknown> {
    const params: Record<string, unknown> = { page, size };

    const code = asDiscountFamilyFilterText(filters.code);
    const name = asDiscountFamilyFilterText(filters.name);
    const status = asDiscountFamilyFilterText(filters.status);

    let extraValue = "";
    for (const key of extraFilterInputKeys) {
      extraValue = asDiscountFamilyFilterText(filters[key]);
      if (extraValue) break;
    }

    if (code) params[`${apiPrefix}Code`] = code;
    if (extraValue) params[extraListParam] = extraValue;
    if (name) params[`${apiPrefix}Name`] = name;
    if (status === "ACTIVE" || status === "INACTIVE") {
      params.isActive = status === "ACTIVE";
      params.recordStatus = status;
    }

    return params;
  }

  function buildCreatePayload(form: DiscountFamilyFormState): Record<string, unknown> {
    return {
      [`${apiPrefix}Code`]: form.code.trim(),
      [extraApiKey]: String(form.extra[extraFormKey] ?? "").trim(),
      [`${apiPrefix}Name`]: form.name.trim(),
      [`${apiPrefix}Description`]: form.description.trim(),
      isActive: isDiscountFamilyRecordActive(form.recordStatus),
    };
  }

  function buildPatchPayload(
    current: DiscountFamilyFormState,
    original: DiscountFamilyFormState,
  ): Record<string, unknown> {
    const payload = buildCreatePayload(current);
    const previous = buildCreatePayload(original);
    if (JSON.stringify(payload) === JSON.stringify(previous)) return {};
    return payload;
  }

  return {
    extraDefaults,
    isFormValid,
    getValidationError,
    mapRecordToForm,
    buildListParams,
    buildCreatePayload,
    buildPatchPayload,
  };
}
