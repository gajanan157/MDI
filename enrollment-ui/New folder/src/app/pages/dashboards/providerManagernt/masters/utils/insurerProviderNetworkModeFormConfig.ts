import type {
  ProviderMasterExtraValue,
  ProviderMasterRecord,
  ProviderMasterRecordStatus,
} from "./masterConfig";
import {
  EFFECTIVE_FROM_MUST_NOT_BE_AFTER_TO,
  isEffectiveFromOnOrBeforeEffectiveTo,
} from "../../shared/effectiveDateRange";

export const NETWORK_MODE_AND_TARIFF_TYPE_OPTIONS = [
  { label: "TPA", value: "TPA" },
  { label: "Insurer", value: "INSURER" },
  { label: "Hybrid", value: "HYBRID" },
] as const;

export const NETWORK_MODE_TYPE_OPTIONS = NETWORK_MODE_AND_TARIFF_TYPE_OPTIONS;
export const NETWORK_TARIFF_TYPE_OPTIONS = NETWORK_MODE_AND_TARIFF_TYPE_OPTIONS;

export const NETWORK_MODE_RECORD_STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
] as const;

export type NetworkModeFieldType = "text" | "dropdown" | "checkbox" | "date";

export type NetworkModeField = {
  name: string;
  label: string;
  type: NetworkModeFieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  /** Dropdown options loaded from insurer list API at runtime. */
  dynamicOptions?: "insurer";
};

export const INSURER_PROVIDER_NETWORK_MODE_FIELDS: NetworkModeField[] = [
  {
    name: "insurerId",
    label: "Insurer Name",
    type: "dropdown",
    required: true,
    dynamicOptions: "insurer",
  },
  {
    name: "insurerProviderNetworkModeType",
    label: "Network Mode Type",
    type: "dropdown",
    required: true,
    options: [...NETWORK_MODE_TYPE_OPTIONS],
  },
  {
    name: "insurerProviderNetworkTariffType",
    label: "Tariff Type",
    type: "dropdown",
    required: true,
    options: [...NETWORK_TARIFF_TYPE_OPTIONS],
  },
  {
    name: "insurerProviderNetworkModeEffectiveFrom",
    label: "Effective From",
    type: "date",
    required: true,
  },
  {
    name: "insurerProviderNetworkModeEffectiveTo",
    label: "Effective To",
    type: "date",
    required: true,
  },
  {
    name: "recordStatus",
    label: "Status",
    type: "dropdown",
    required: true,
    options: [...NETWORK_MODE_RECORD_STATUS_OPTIONS],
  },
  {
    name: "insurerProviderNetworkActiveFlag",
    label: "Active Flag",
    type: "checkbox",
  },
];

export function createNetworkModeFormDefaults(): Record<
  string,
  ProviderMasterExtraValue
> {
  return INSURER_PROVIDER_NETWORK_MODE_FIELDS.reduce<
    Record<string, ProviderMasterExtraValue>
  >((acc, field) => {
    if (field.type === "checkbox") {
      acc[field.name] = false;
      return acc;
    }
    if (field.name === "recordStatus") {
      acc[field.name] = "ACTIVE";
      return acc;
    }
    acc[field.name] = "";
    return acc;
  }, {});
}

export function mapRecordToNetworkModeFormExtra(
  record: ProviderMasterRecord,
): Record<string, ProviderMasterExtraValue> {
  return {
    ...createNetworkModeFormDefaults(),
    insurerId: String(record.extra?.insurerId ?? record.description ?? ""),
    insurerProviderNetworkModeType: String(
      record.extra?.insurerProviderNetworkModeType ?? record.code ?? "",
    ),
    insurerProviderNetworkTariffType: String(
      record.extra?.insurerProviderNetworkTariffType ?? record.name ?? "",
    ),
    insurerProviderNetworkActiveFlag: Boolean(
      record.extra?.insurerProviderNetworkActiveFlag,
    ),
    tpaId: String(record.extra?.tpaId ?? ""),
    insurerProviderNetworkModeEffectiveFrom: String(
      record.extra?.insurerProviderNetworkModeEffectiveFrom ?? "",
    )
      .trim()
      .slice(0, 10),
    insurerProviderNetworkModeEffectiveTo: String(
      record.extra?.insurerProviderNetworkModeEffectiveTo ?? "",
    )
      .trim()
      .slice(0, 10),
    recordStatus: record.recordStatus,
  };
}

export function getNetworkModeFormValidationError(
  extra: Record<string, ProviderMasterExtraValue>,
): string | null {
  for (const field of INSURER_PROVIDER_NETWORK_MODE_FIELDS) {
    if (!field.required) continue;
    if (field.type === "checkbox") continue;
    if (!String(extra[field.name] ?? "").trim()) {
      return `${field.label} is required.`;
    }
  }

  if (
    !isEffectiveFromOnOrBeforeEffectiveTo(
      String(extra.insurerProviderNetworkModeEffectiveFrom ?? ""),
      String(extra.insurerProviderNetworkModeEffectiveTo ?? ""),
    )
  ) {
    return EFFECTIVE_FROM_MUST_NOT_BE_AFTER_TO;
  }

  return null;
}

export function isNetworkModeFormValid(
  extra: Record<string, ProviderMasterExtraValue>,
): boolean {
  return getNetworkModeFormValidationError(extra) === null;
}

export function buildNetworkModeListParams(
  page: number,
  size: number,
  filters: Record<string, unknown>,
): {
  page: number;
  size: number;
  insurerId?: string;
  insurerProviderNetworkModeType?: string;
  insurerProviderNetworkTariffType?: string;
  insurerProviderNetworkActiveFlag?: boolean;
  insurerProviderNetworkModeEffectiveFrom?: string;
  insurerProviderNetworkModeEffectiveTo?: string;
  recordStatus?: string;
} {
  const params: {
    page: number;
    size: number;
    insurerId?: string;
    insurerProviderNetworkModeType?: string;
    insurerProviderNetworkTariffType?: string;
    insurerProviderNetworkActiveFlag?: boolean;
    insurerProviderNetworkModeEffectiveFrom?: string;
    insurerProviderNetworkModeEffectiveTo?: string;
    recordStatus?: string;
  } = { page, size };

  const insurerId = String(
    filters.insurerId ?? filters.description ?? "",
  ).trim();
  const modeType = String(filters.code ?? "").trim();
  const tariffType = String(filters.name ?? "").trim();
  const recordStatus = String(filters.status ?? "").trim();
  const effectiveFrom = String(filters.effectiveFrom ?? "").trim();
  const effectiveTo = String(filters.effectiveTo ?? "").trim();
  const activeFlag = String(filters.activeFlag ?? "").trim();

  if (insurerId) params.insurerId = insurerId;
  if (modeType) params.insurerProviderNetworkModeType = modeType;
  if (tariffType) params.insurerProviderNetworkTariffType = tariffType;
  if (recordStatus) params.recordStatus = networkModeListApiRecordStatus(recordStatus);
  if (effectiveFrom)
    params.insurerProviderNetworkModeEffectiveFrom = effectiveFrom;
  if (effectiveTo) params.insurerProviderNetworkModeEffectiveTo = effectiveTo;
  if (activeFlag === "true") params.insurerProviderNetworkActiveFlag = true;
  if (activeFlag === "false") params.insurerProviderNetworkActiveFlag = false;

  return params;
}

export function buildNetworkModeCreatePayload(
  extra: Record<string, ProviderMasterExtraValue>,
): Record<string, unknown> {
  return {
    tpaId: String(extra.tpaId ?? "").trim(),
    insurerId: String(extra.insurerId ?? "").trim(),
    insurerProviderNetworkModeType: String(
      extra.insurerProviderNetworkModeType ?? "",
    ).trim(),
    insurerProviderNetworkTariffType: String(
      extra.insurerProviderNetworkTariffType ?? "",
    ).trim(),
    insurerProviderNetworkActiveFlag: Boolean(
      extra.insurerProviderNetworkActiveFlag,
    ),
    insurerProviderNetworkModeEffectiveFrom: String(
      extra.insurerProviderNetworkModeEffectiveFrom ?? "",
    ).trim(),
    insurerProviderNetworkModeEffectiveTo: String(
      extra.insurerProviderNetworkModeEffectiveTo ?? "",
    ).trim(),
  };
}

function networkModeRecordStatus(
  value: ProviderMasterExtraValue | undefined,
): ProviderMasterRecordStatus {
  const normalized = String(value ?? "ACTIVE").trim().toUpperCase();
  return normalized === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

/** GET list filter query uses `Active` / `Inactive`. */
function networkModeListApiRecordStatus(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (normalized === "INACTIVE") return "Inactive";
  if (normalized === "ACTIVE") return "Active";
  return value.trim();
}

/** PATCH body uses `ACTIVE` / `INACTIVE`. */
function networkModePatchApiRecordStatus(
  value: ProviderMasterExtraValue | undefined,
): string {
  return networkModeRecordStatus(value);
}

export function buildNetworkModePatchPayload(
  current: Record<string, ProviderMasterExtraValue>,
  original: Record<string, ProviderMasterExtraValue>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const currentTpaId = String(current.tpaId ?? "").trim();
  const originalTpaId = String(original.tpaId ?? "").trim();
  if (currentTpaId !== originalTpaId) {
    payload.tpaId = currentTpaId;
  }

  for (const field of INSURER_PROVIDER_NETWORK_MODE_FIELDS) {
    const currentValue = current[field.name];
    const originalValue = original[field.name];

    if (field.type === "checkbox") {
      if (Boolean(currentValue) !== Boolean(originalValue)) {
        payload[field.name] = Boolean(currentValue);
      }
      continue;
    }

    if (field.name === "recordStatus") {
      if (
        networkModeRecordStatus(currentValue) !==
        networkModeRecordStatus(originalValue)
      ) {
        payload.recordStatus = networkModePatchApiRecordStatus(currentValue);
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
