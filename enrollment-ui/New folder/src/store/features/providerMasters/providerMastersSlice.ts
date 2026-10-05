import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ProviderMasterRecord } from "@/app/pages/dashboards/providerManagernt/masters/utils/masterConfig";
import {
  fetchProviderIdentifierTypeMasterAPI,
  fetchProviderIdentifierTypeMasterByIdAPI,
  createProviderIdentifierTypeMasterAPI,
  patchProviderIdentifierTypeMasterAPI,
  deleteProviderIdentifierTypeMasterAPI,
  fetchProviderDiscountTypeMasterAPI,
  fetchProviderDiscountTypeMasterByIdAPI,
  createProviderDiscountTypeMasterAPI,
  patchProviderDiscountTypeMasterAPI,
  deleteProviderDiscountTypeMasterAPI,
  fetchProviderDiscountSubtypeMasterAPI,
  fetchProviderDiscountSubtypeMasterByIdAPI,
  createProviderDiscountSubtypeMasterAPI,
  patchProviderDiscountSubtypeMasterAPI,
  deleteProviderDiscountSubtypeMasterAPI,
  fetchProviderDiscountInclusionExclusionMasterAPI,
  fetchProviderDiscountInclusionExclusionMasterByIdAPI,
  createProviderDiscountInclusionExclusionMasterAPI,
  patchProviderDiscountInclusionExclusionMasterAPI,
  deleteProviderDiscountInclusionExclusionMasterAPI,
  fetchProviderTaxonomyMasterAPI,
  fetchProviderTaxonomyMasterByIdAPI,
  createProviderTaxonomyMasterAPI,
  patchProviderTaxonomyMasterAPI,
  deleteProviderTaxonomyMasterAPI,
  fetchInsurerProviderNetworkModeAPI,
  fetchInsurerProviderNetworkModeByIdAPI,
  createInsurerProviderNetworkModeAPI,
  patchInsurerProviderNetworkModeAPI,
  deleteInsurerProviderNetworkModeAPI,
  fetchProviderMasterActivityLogApi,
  type ProviderIdentifierTypeMasterListParams,
  type ProviderDiscountTypeMasterListParams,
  type ProviderDiscountSubtypeMasterListParams,
  type ProviderDiscountInclusionExclusionMasterListParams,
  type ProviderMasterApiRejectValue,
  type ProviderTaxonomyMasterListParams,
  type InsurerProviderNetworkModeListParams,
  getProviderMasterApiRejectValue,
} from "./providerMastersAPI";
import type { ProviderMasterKey } from "@/app/pages/dashboards/providerManagernt/masters/utils/masterConfig";
import type { ProviderMasterActivityLogEntry } from "@/app/pages/dashboards/providerManagernt/masters/utils/providerMasterActivityLogTypes";
import {
  normalizeProviderTypeMasterList,
  normalizeProviderTypeMasterRow,
} from "./providerTypeMasterNormalizer";
import { DISCOUNT_TYPE_SERVICE_TYPE_FIELD } from "@/app/pages/dashboards/providerManagernt/masters/utils/discountTypeFormConfig";
import {
  DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
  DISCOUNT_SUBTYPE_TYPE_NAME_FIELD,
} from "@/app/pages/dashboards/providerManagernt/masters/utils/discountSubtypeFormConfig";
import { DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD } from "@/app/pages/dashboards/providerManagernt/masters/utils/discountInclusionExclusionFormConfig";

type ProviderMastersState = {
  providerIdentifierTypeRows: ProviderMasterRecord[];
  providerIdentifierTypeTotal: number;
  selectedProviderIdentifierType: ProviderMasterRecord | null;
  providerDiscountTypeRows: ProviderMasterRecord[];
  providerDiscountTypeTotal: number;
  selectedProviderDiscountType: ProviderMasterRecord | null;
  providerDiscountSubtypeRows: ProviderMasterRecord[];
  providerDiscountSubtypeTotal: number;
  selectedProviderDiscountSubtype: ProviderMasterRecord | null;
  providerDiscountInclusionExclusionRows: ProviderMasterRecord[];
  providerDiscountInclusionExclusionTotal: number;
  selectedProviderDiscountInclusionExclusion: ProviderMasterRecord | null;
  providerTaxonomyRows: ProviderMasterRecord[];
  providerTaxonomyTotal: number;
  selectedProviderTaxonomy: ProviderMasterRecord | null;
  insurerProviderNetworkModeRows: ProviderMasterRecord[];
  insurerProviderNetworkModeTotal: number;
  selectedInsurerProviderNetworkMode: ProviderMasterRecord | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  detailError: string | null;
  activityLog: {
    masterKey: ProviderMasterKey | null;
    rows: ProviderMasterActivityLogEntry[];
    loading: boolean;
    error: string | null;
  };
};

const initialState: ProviderMastersState = {
  providerIdentifierTypeRows: [],
  providerIdentifierTypeTotal: 0,
  selectedProviderIdentifierType: null,
  providerDiscountTypeRows: [],
  providerDiscountTypeTotal: 0,
  selectedProviderDiscountType: null,
  providerDiscountSubtypeRows: [],
  providerDiscountSubtypeTotal: 0,
  selectedProviderDiscountSubtype: null,
  providerDiscountInclusionExclusionRows: [],
  providerDiscountInclusionExclusionTotal: 0,
  selectedProviderDiscountInclusionExclusion: null,
  providerTaxonomyRows: [],
  providerTaxonomyTotal: 0,
  selectedProviderTaxonomy: null,
  insurerProviderNetworkModeRows: [],
  insurerProviderNetworkModeTotal: 0,
  selectedInsurerProviderNetworkMode: null,
  loading: false,
  detailLoading: false,
  error: null,
  detailError: null,
  activityLog: {
    masterKey: null,
    rows: [],
    loading: false,
    error: null,
  },
};

function getStringValue(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value != null && value !== "") return String(value);
  }
  return "";
}

function getBooleanValue(record: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
  }
  return false;
}

function getOptionalBooleanValue(
  record: Record<string, unknown>,
  keys: string[],
): boolean | undefined {
  for (const key of keys) {
    if (!(key in record)) continue;
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
  }
  return undefined;
}

function resolveRecordStatus(
  record: Record<string, unknown>,
  booleanKeys: string[],
): ProviderMasterRecord["recordStatus"] {
  const statusText = getStringValue(record, ["recordStatus", "status", "activeStatus"]);
  const normalizedStatus = statusText.trim().toLowerCase();

  if (normalizedStatus === "inactive" || normalizedStatus === "0") {
    return "INACTIVE";
  }
  if (normalizedStatus === "active" || normalizedStatus === "1") {
    return "ACTIVE";
  }

  const optionalActive = getOptionalBooleanValue(record, booleanKeys);
  if (optionalActive === false) return "INACTIVE";
  if (optionalActive === true) return "ACTIVE";

  return "ACTIVE";
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;
  const candidates = [
    root.data,
    root.content,
    root.result,
    root.records,
    root.items,
    root.list,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      const nested = extractRows(candidate);
      if (nested.length) return nested;
    }
  }

  return [];
}

function extractTotal(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const directTotal = root.totalElements ?? root.totalRecords ?? root.totalItems;

  if (typeof directTotal === "number") return directTotal;
  if (typeof directTotal === "string" && directTotal.trim()) {
    const parsed = Number(directTotal);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const nestedCandidates = [root.data, root.result, root.page, root.pagination];
  for (const candidate of nestedCandidates) {
    const nestedTotal = extractTotal(candidate);
    if (nestedTotal != null) return nestedTotal;
  }

  return null;
}

function extractApiMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;
  const message = (payload as Record<string, unknown>).message;
  if (typeof message === "string" && message.trim()) return message.trim();
  return undefined;
}

function extractRecord(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const root = payload as Record<string, unknown>;
  const candidates = [root.data, root.result, root.record, root.item];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate;
    }
  }

  return payload;
}

function mapProviderIdentifierRecord(
  item: unknown,
  index: number,
): ProviderMasterRecord | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const id = getStringValue(record, [
    "id",
    "identifierTypeId",
    "providerIdentifierTypeMasterId",
    "providerIdentifierTypeId",
    "uuid",
  ]);
  const code = getStringValue(record, [
    "code",
    "identifierTypeCode",
    "providerIdentifierTypeCode",
    "providerIdentifierCode",
  ]);
  const name = getStringValue(record, [
    "name",
    "identifierTypeName",
    "providerIdentifierTypeName",
    "identifierName",
  ]);

  if (!code && !name) return null;

  return {
    id: id || `provider_identifier_type_master-api-${index}`,
    code,
    name,
    description: getStringValue(record, [
      "description",
      "identifierTypeDescription",
      "providerIdentifierTypeDescription",
    ]),
    recordStatus: resolveRecordStatus(record, ["active", "isActive"]),
    extra: {
      identifierLevel: getStringValue(record, ["identifierLevel"]),
      identifierCategory: getStringValue(record, ["identifierCategory"]),
      identifierSubcategory: getStringValue(record, ["identifierSubcategory"]),
      issuingAuthorityName: getStringValue(record, ["issuingAuthorityName"]),
      valueDataType: getStringValue(record, ["valueDataType"]),
      applicableProviderClass: getStringValue(record, ["applicableProviderClass"]),
      applicableProviderType: getStringValue(record, ["applicableProviderType"]),
      applicableProviderSubclass: getStringValue(record, ["applicableProviderSubclass"]),
      appliesToProvider: getBooleanValue(record, ["appliesToProvider"]),
      appliesToFacility: getBooleanValue(record, ["appliesToFacility"]),
      appliesToPractitioner: getBooleanValue(record, ["appliesToPractitioner"]),
      isMandatory: getBooleanValue(record, ["isMandatory"]),
      allowsMultiple: getBooleanValue(record, ["allowsMultiple"]),
      supportsValidityPeriod: getBooleanValue(record, ["supportsValidityPeriod"]),
      verificationRequired: getBooleanValue(record, ["verificationRequired"]),
      isPrimaryAllowed: getBooleanValue(record, ["isPrimaryAllowed"]),
      isUniquePerProvider: getBooleanValue(record, ["isUniquePerProvider"]),
      isUniquePerFacility: getBooleanValue(record, ["isUniquePerFacility"]),
      isUniquePerPractitioner: getBooleanValue(record, ["isUniquePerPractitioner"]),
      isGloballyUnique: getBooleanValue(record, ["isGloballyUnique"]),
      sourceOfTruth: getStringValue(record, ["sourceOfTruth"]),
      sourceSystem: getStringValue(record, ["sourceSystem"]),
    },
  };
}

function mapProviderDiscountTypeRecord(
  item: unknown,
  index: number,
): ProviderMasterRecord | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const id = getStringValue(record, [
    "id",
    "providerDiscountTypeMasterId",
    "discountTypeId",
    "discountTypeMasterId",
    "uuid",
  ]);
  const code = getStringValue(record, [
    "providerDiscountTypeCode",
    "discountTypeCode",
    "typeCode",
    "code",
  ]);
  const name = getStringValue(record, [
    "providerDiscountTypeName",
    "discountTypeName",
    "typeName",
    "name",
  ]);
  const description = getStringValue(record, [
    "providerDiscountTypeDescription",
    "discountTypeDescription",
    "description",
  ]);
  const serviceType = getStringValue(record, [
    "providerServiceType",
    "provider_service_type",
    "serviceType",
  ]);

  if (!id && !code && !name) return null;

  return {
    id: id || `provider_discount_type_master-api-${index}`,
    code,
    name,
    description,
    recordStatus: resolveRecordStatus(record, ["isActive", "active"]),
    extra: {
      [DISCOUNT_TYPE_SERVICE_TYPE_FIELD]: serviceType,
    },
  };
}

function mapProviderDiscountSubtypeRecord(
  item: unknown,
  index: number,
): ProviderMasterRecord | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const nestedType =
    record.providerDiscountType && typeof record.providerDiscountType === "object"
      ? (record.providerDiscountType as Record<string, unknown>)
      : null;
  const id = getStringValue(record, [
    "id",
    "providerDiscountSubtypeMasterId",
    "discountSubtypeId",
    "discountSubtypeMasterId",
    "uuid",
  ]);
  const code = getStringValue(record, [
    "providerDiscountSubtypeCode",
    "discountSubtypeCode",
    "typeCode",
    "code",
  ]);
  const name = getStringValue(record, [
    "providerDiscountSubtypeName",
    "discountSubtypeName",
    "typeName",
    "name",
  ]);
  const description = getStringValue(record, [
    "providerDiscountSubtypeDescription",
    "discountSubtypeDescription",
    "description",
  ]);
  const typeMasterId =
    getStringValue(record, [
      DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
      "discountTypeMasterId",
      "providerDiscountTypeId",
    ]) ||
    (nestedType
      ? getStringValue(nestedType, ["id", "providerDiscountTypeMasterId"])
      : "");
  const typeName =
    getStringValue(record, [DISCOUNT_SUBTYPE_TYPE_NAME_FIELD, "discountTypeName"]) ||
    (nestedType
      ? getStringValue(nestedType, ["providerDiscountTypeName", "name"])
      : "");

  if (!id && !code && !name) return null;

  return {
    id: id || `provider_discount_sub_type_master-api-${index}`,
    code,
    name,
    description,
    recordStatus: resolveRecordStatus(record, ["isActive", "active"]),
    extra: {
      [DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD]: typeMasterId,
      [DISCOUNT_SUBTYPE_TYPE_NAME_FIELD]: typeName,
    },
  };
}

function mapProviderDiscountInclusionExclusionRecord(
  item: unknown,
  index: number,
): ProviderMasterRecord | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const id = getStringValue(record, [
    "id",
    "providerInclusionExclusionMasterId",
    "discountInclusionExclusionMasterId",
    "uuid",
  ]);
  const code = getStringValue(record, [
    "providerInclusionExclusionCode",
    "inclusionExclusionCode",
    "typeCode",
    "code",
  ]);
  const name = getStringValue(record, [
    "providerInclusionExclusionName",
    "inclusionExclusionName",
    "typeName",
    "name",
  ]);
  const description = getStringValue(record, [
    "providerInclusionExclusionDescription",
    "inclusionExclusionDescription",
    "description",
  ]);
  const type = getStringValue(record, [
    DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
    "inclusionExclusionType",
    "type",
  ]);

  if (!id && !code && !name) return null;

  return {
    id: id || `provider_discount_inclusion_exclusion_master-api-${index}`,
    code,
    name,
    description,
    recordStatus: resolveRecordStatus(record, ["isActive", "active"]),
    extra: {
      [DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD]: type,
    },
  };
}

function mapInsurerProviderNetworkModeRecordStatus(
  record: Record<string, unknown>,
): ProviderMasterRecord["recordStatus"] {
  const status = String(record.recordStatus ?? "").trim().toLowerCase();
  if (status === "inactive") return "INACTIVE";
  if (status === "active") return "ACTIVE";
  return "ACTIVE";
}

function mapInsurerProviderNetworkModeRecord(
  item: unknown,
): ProviderMasterRecord | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ["insurerProviderNetworkModeId"]);
  const modeType = getStringValue(record, ["insurerProviderNetworkModeType"]);
  const tariffType = getStringValue(record, ["insurerProviderNetworkTariffType"]);
  const insurerId = getStringValue(record, ["insurerId"]);

  if (!modeType && !tariffType && !insurerId) return null;

  return {
    id,
    code: modeType,
    name: tariffType,
    description: insurerId,
    recordStatus: mapInsurerProviderNetworkModeRecordStatus(record),
    extra: {
      tpaId: getStringValue(record, ["tpaId"]),
      insurerId,
      insurerProviderNetworkModeType: modeType,
      insurerProviderNetworkTariffType: tariffType,
      insurerProviderNetworkActiveFlag: getBooleanValue(record, [
        "insurerProviderNetworkActiveFlag",
      ]),
      insurerProviderNetworkModeEffectiveFrom: getStringValue(record, [
        "insurerProviderNetworkModeEffectiveFrom",
      ]),
      insurerProviderNetworkModeEffectiveTo: getStringValue(record, [
        "insurerProviderNetworkModeEffectiveTo",
      ]),
    },
  };
}

export const fetchProviderIdentifierTypeMaster = createAsyncThunk<
  { rows: ProviderMasterRecord[]; total: number },
  ProviderIdentifierTypeMasterListParams
>("providerMasters/fetchProviderIdentifierTypeMaster", async (params) => {
  const payload = await fetchProviderIdentifierTypeMasterAPI(params);
  const rows = extractRows(payload)
    .map(mapProviderIdentifierRecord)
    .filter((row): row is ProviderMasterRecord => Boolean(row));

  return {
    rows,
    total: extractTotal(payload) ?? rows.length,
  };
});

export const fetchProviderIdentifierTypeMasterById = createAsyncThunk<
  ProviderMasterRecord | null,
  string
>("providerMasters/fetchProviderIdentifierTypeMasterById", async (id) => {
  const payload = await fetchProviderIdentifierTypeMasterByIdAPI(id);
  return mapProviderIdentifierRecord(extractRecord(payload), 0);
});

export const createProviderIdentifierTypeMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  Record<string, unknown>
>("providerMasters/createProviderIdentifierTypeMaster", async (payload) => {
  const response = await createProviderIdentifierTypeMasterAPI(payload);
  return {
    record: mapProviderIdentifierRecord(extractRecord(response), 0),
    message: extractApiMessage(response),
  };
});

export const patchProviderIdentifierTypeMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  { id: string; payload: Record<string, unknown> }
>("providerMasters/patchProviderIdentifierTypeMaster", async ({ id, payload }) => {
  const response = await patchProviderIdentifierTypeMasterAPI(id, payload);
  return {
    record: mapProviderIdentifierRecord(extractRecord(response), 0),
    message: extractApiMessage(response),
  };
});

export const deleteProviderIdentifierTypeMaster = createAsyncThunk<
  { id: string; message?: string },
  string
>("providerMasters/deleteProviderIdentifierTypeMaster", async (id) => {
  const response = await deleteProviderIdentifierTypeMasterAPI(id);
  return {
    id,
    message: extractApiMessage(response),
  };
});

export const fetchProviderDiscountTypeMaster = createAsyncThunk<
  { rows: ProviderMasterRecord[]; total: number },
  ProviderDiscountTypeMasterListParams
>("providerMasters/fetchProviderDiscountTypeMaster", async (params) => {
  const payload = await fetchProviderDiscountTypeMasterAPI(params);
  const rows = extractRows(payload)
    .map((row, index) => mapProviderDiscountTypeRecord(row, index))
    .filter((row): row is ProviderMasterRecord => Boolean(row));

  return {
    rows,
    total: extractTotal(payload) ?? rows.length,
  };
});

export const fetchProviderDiscountTypeMasterById = createAsyncThunk<
  ProviderMasterRecord | null,
  string
>("providerMasters/fetchProviderDiscountTypeMasterById", async (id) => {
  const payload = await fetchProviderDiscountTypeMasterByIdAPI(id);
  const mapped = mapProviderDiscountTypeRecord(extractRecord(payload), 0);
  if (!mapped) {
    throw new Error("Provider discount type record not found.");
  }
  return { ...mapped, id: mapped.id || id };
});

export const createProviderDiscountTypeMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  Record<string, unknown>,
  { rejectValue: ProviderMasterApiRejectValue }
>("providerMasters/createProviderDiscountTypeMaster", async (payload, { rejectWithValue }) => {
  const response = await createProviderDiscountTypeMasterAPI(payload);
  if (!response.success) {
    return rejectWithValue(
      getProviderMasterApiRejectValue(response, "Failed to create provider discount type"),
    );
  }
  return {
    record: mapProviderDiscountTypeRecord(extractRecord(response.data), 0),
    message: extractApiMessage(response.data),
  };
});

export const patchProviderDiscountTypeMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  { id: string; payload: Record<string, unknown> },
  { rejectValue: ProviderMasterApiRejectValue }
>("providerMasters/patchProviderDiscountTypeMaster", async ({ id, payload }, { rejectWithValue }) => {
  const response = await patchProviderDiscountTypeMasterAPI(id, payload);
  if (!response.success) {
    return rejectWithValue(
      getProviderMasterApiRejectValue(response, "Failed to update provider discount type"),
    );
  }
  return {
    record: mapProviderDiscountTypeRecord(extractRecord(response.data), 0),
    message: extractApiMessage(response.data),
  };
});

export const deleteProviderDiscountTypeMaster = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: ProviderMasterApiRejectValue }
>("providerMasters/deleteProviderDiscountTypeMaster", async (id, { rejectWithValue }) => {
  const response = await deleteProviderDiscountTypeMasterAPI(id);
  if (!response.success) {
    return rejectWithValue(
      getProviderMasterApiRejectValue(response, "Failed to delete provider discount type"),
    );
  }
  return {
    id,
    message: extractApiMessage(response.data),
  };
});

export const fetchProviderDiscountSubtypeMaster = createAsyncThunk<
  { rows: ProviderMasterRecord[]; total: number },
  ProviderDiscountSubtypeMasterListParams
>("providerMasters/fetchProviderDiscountSubtypeMaster", async (params) => {
  const payload = await fetchProviderDiscountSubtypeMasterAPI(params);
  const rows = extractRows(payload)
    .map((row, index) => mapProviderDiscountSubtypeRecord(row, index))
    .filter((row): row is ProviderMasterRecord => Boolean(row));

  return {
    rows,
    total: extractTotal(payload) ?? rows.length,
  };
});

export const fetchProviderDiscountSubtypeMasterById = createAsyncThunk<
  ProviderMasterRecord | null,
  string
>("providerMasters/fetchProviderDiscountSubtypeMasterById", async (id) => {
  const payload = await fetchProviderDiscountSubtypeMasterByIdAPI(id);
  const mapped = mapProviderDiscountSubtypeRecord(extractRecord(payload), 0);
  if (!mapped) {
    throw new Error("Provider discount subtype record not found.");
  }
  return { ...mapped, id: mapped.id || id };
});

export const createProviderDiscountSubtypeMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  Record<string, unknown>,
  { rejectValue: ProviderMasterApiRejectValue }
>("providerMasters/createProviderDiscountSubtypeMaster", async (payload, { rejectWithValue }) => {
  const response = await createProviderDiscountSubtypeMasterAPI(payload);
  if (!response.success) {
    return rejectWithValue(
      getProviderMasterApiRejectValue(response, "Failed to create provider discount subtype"),
    );
  }
  return {
    record: mapProviderDiscountSubtypeRecord(extractRecord(response.data), 0),
    message: extractApiMessage(response.data),
  };
});

export const patchProviderDiscountSubtypeMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  { id: string; payload: Record<string, unknown> },
  { rejectValue: ProviderMasterApiRejectValue }
>("providerMasters/patchProviderDiscountSubtypeMaster", async ({ id, payload }, { rejectWithValue }) => {
  const response = await patchProviderDiscountSubtypeMasterAPI(id, payload);
  if (!response.success) {
    return rejectWithValue(
      getProviderMasterApiRejectValue(response, "Failed to update provider discount subtype"),
    );
  }
  return {
    record: mapProviderDiscountSubtypeRecord(extractRecord(response.data), 0),
    message: extractApiMessage(response.data),
  };
});

export const deleteProviderDiscountSubtypeMaster = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: ProviderMasterApiRejectValue }
>("providerMasters/deleteProviderDiscountSubtypeMaster", async (id, { rejectWithValue }) => {
  const response = await deleteProviderDiscountSubtypeMasterAPI(id);
  if (!response.success) {
    return rejectWithValue(
      getProviderMasterApiRejectValue(response, "Failed to delete provider discount subtype"),
    );
  }
  return {
    id,
    message: extractApiMessage(response.data),
  };
});

export const fetchProviderDiscountInclusionExclusionMaster = createAsyncThunk<
  { rows: ProviderMasterRecord[]; total: number },
  ProviderDiscountInclusionExclusionMasterListParams
>("providerMasters/fetchProviderDiscountInclusionExclusionMaster", async (params) => {
  const payload = await fetchProviderDiscountInclusionExclusionMasterAPI(params);
  const rows = extractRows(payload)
    .map((row, index) => mapProviderDiscountInclusionExclusionRecord(row, index))
    .filter((row): row is ProviderMasterRecord => Boolean(row));

  return {
    rows,
    total: extractTotal(payload) ?? rows.length,
  };
});

export const fetchProviderDiscountInclusionExclusionMasterById = createAsyncThunk<
  ProviderMasterRecord | null,
  string
>("providerMasters/fetchProviderDiscountInclusionExclusionMasterById", async (id) => {
  const payload = await fetchProviderDiscountInclusionExclusionMasterByIdAPI(id);
  const mapped = mapProviderDiscountInclusionExclusionRecord(extractRecord(payload), 0);
  if (!mapped) {
    throw new Error("Provider discount inclusion/exclusion record not found.");
  }
  return { ...mapped, id: mapped.id || id };
});

export const createProviderDiscountInclusionExclusionMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  Record<string, unknown>,
  { rejectValue: ProviderMasterApiRejectValue }
>(
  "providerMasters/createProviderDiscountInclusionExclusionMaster",
  async (payload, { rejectWithValue }) => {
    const response = await createProviderDiscountInclusionExclusionMasterAPI(payload);
    if (!response.success) {
      return rejectWithValue(
        getProviderMasterApiRejectValue(
          response,
          "Failed to create provider discount inclusion/exclusion",
        ),
      );
    }
    return {
      record: mapProviderDiscountInclusionExclusionRecord(extractRecord(response.data), 0),
      message: extractApiMessage(response.data),
    };
  },
);

export const patchProviderDiscountInclusionExclusionMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  { id: string; payload: Record<string, unknown> },
  { rejectValue: ProviderMasterApiRejectValue }
>(
  "providerMasters/patchProviderDiscountInclusionExclusionMaster",
  async ({ id, payload }, { rejectWithValue }) => {
    const response = await patchProviderDiscountInclusionExclusionMasterAPI(id, payload);
    if (!response.success) {
      return rejectWithValue(
        getProviderMasterApiRejectValue(
          response,
          "Failed to update provider discount inclusion/exclusion",
        ),
      );
    }
    return {
      record: mapProviderDiscountInclusionExclusionRecord(extractRecord(response.data), 0),
      message: extractApiMessage(response.data),
    };
  },
);

export const deleteProviderDiscountInclusionExclusionMaster = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: ProviderMasterApiRejectValue }
>(
  "providerMasters/deleteProviderDiscountInclusionExclusionMaster",
  async (id, { rejectWithValue }) => {
    const response = await deleteProviderDiscountInclusionExclusionMasterAPI(id);
    if (!response.success) {
      return rejectWithValue(
        getProviderMasterApiRejectValue(
          response,
          "Failed to delete provider discount inclusion/exclusion",
        ),
      );
    }
    return {
      id,
      message: extractApiMessage(response.data),
    };
  },
);

export const fetchProviderTaxonomyMaster = createAsyncThunk<
  { rows: ProviderMasterRecord[]; total: number },
  ProviderTaxonomyMasterListParams
>("providerMasters/fetchProviderTaxonomyMaster", async (params) => {
  const payload = await fetchProviderTaxonomyMasterAPI(params);
  const rows = normalizeProviderTypeMasterList(extractRows(payload));

  return {
    rows,
    total: extractTotal(payload) ?? rows.length,
  };
});

export const fetchProviderTaxonomyMasterById = createAsyncThunk<
  ProviderMasterRecord | null,
  string
>("providerMasters/fetchProviderTaxonomyMasterById", async (id) => {
  const payload = await fetchProviderTaxonomyMasterByIdAPI(id);
  const record = normalizeProviderTypeMasterRow(extractRecord(payload));
  if (!record) {
    throw new Error("Provider taxonomy record not found.");
  }
  return record;
});

export const createProviderTaxonomyMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  Record<string, unknown>
>("providerMasters/createProviderTaxonomyMaster", async (payload) => {
  const response = await createProviderTaxonomyMasterAPI(payload);
  const record = normalizeProviderTypeMasterRow(extractRecord(response));
  if (!record) {
    throw new Error("Invalid provider taxonomy create response.");
  }
  return {
    record,
    message: extractApiMessage(response),
  };
});

export const patchProviderTaxonomyMaster = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  { id: string; payload: Record<string, unknown> }
>("providerMasters/patchProviderTaxonomyMaster", async ({ id, payload }) => {
  const response = await patchProviderTaxonomyMasterAPI(id, payload);
  const record = normalizeProviderTypeMasterRow(extractRecord(response));
  if (!record) {
    throw new Error("Invalid provider taxonomy update response.");
  }
  return {
    record,
    message: extractApiMessage(response),
  };
});

export const deleteProviderTaxonomyMaster = createAsyncThunk<
  { id: string; message?: string },
  string
>("providerMasters/deleteProviderTaxonomyMaster", async (id) => {
  const response = await deleteProviderTaxonomyMasterAPI(id);
  return {
    id,
    message: extractApiMessage(response),
  };
});

export const fetchInsurerProviderNetworkMode = createAsyncThunk<
  { rows: ProviderMasterRecord[]; total: number },
  InsurerProviderNetworkModeListParams
>("providerMasters/fetchInsurerProviderNetworkMode", async (params) => {
  const payload = await fetchInsurerProviderNetworkModeAPI(params);
  const rows = extractRows(payload)
    .map(mapInsurerProviderNetworkModeRecord)
    .filter((row): row is ProviderMasterRecord => Boolean(row));

  return {
    rows,
    total: extractTotal(payload) ?? rows.length,
  };
});

export const fetchInsurerProviderNetworkModeById = createAsyncThunk<
  ProviderMasterRecord | null,
  string
>("providerMasters/fetchInsurerProviderNetworkModeById", async (id) => {
  const payload = await fetchInsurerProviderNetworkModeByIdAPI(id);
  const mapped = mapInsurerProviderNetworkModeRecord(extractRecord(payload));
  if (!mapped) return null;
  return { ...mapped, id: mapped.id || id };
});

export const createInsurerProviderNetworkMode = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  Record<string, unknown>
>("providerMasters/createInsurerProviderNetworkMode", async (payload) => {
  const response = await createInsurerProviderNetworkModeAPI(payload);
  return {
    record: mapInsurerProviderNetworkModeRecord(extractRecord(response)),
    message: extractApiMessage(response),
  };
});

export const patchInsurerProviderNetworkMode = createAsyncThunk<
  { record: ProviderMasterRecord | null; message?: string },
  { id: string; payload: Record<string, unknown> }
>("providerMasters/patchInsurerProviderNetworkMode", async ({ id, payload }) => {
  const response = await patchInsurerProviderNetworkModeAPI(id, payload);
  return {
    record: mapInsurerProviderNetworkModeRecord(extractRecord(response)),
    message: extractApiMessage(response),
  };
});

export const deleteInsurerProviderNetworkMode = createAsyncThunk<
  { id: string; message?: string },
  string
>("providerMasters/deleteInsurerProviderNetworkMode", async (id) => {
  const response = await deleteInsurerProviderNetworkModeAPI(id);
  return {
    id,
    message: extractApiMessage(response),
  };
});

export const fetchProviderMasterActivityLog = createAsyncThunk<
  { masterKey: ProviderMasterKey; rows: ProviderMasterActivityLogEntry[] },
  ProviderMasterKey
>("providerMasters/fetchActivityLog", async (masterKey) => ({
  masterKey,
  rows: await fetchProviderMasterActivityLogApi(masterKey),
}));

const providerMastersSlice = createSlice({
  name: "providerMasters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderIdentifierTypeMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderIdentifierTypeMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.providerIdentifierTypeRows = action.payload.rows;
        state.providerIdentifierTypeTotal = action.payload.total;
      })
      .addCase(fetchProviderIdentifierTypeMaster.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to load provider identifier types";
      })
      .addCase(fetchProviderIdentifierTypeMasterById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedProviderIdentifierType = null;
      })
      .addCase(fetchProviderIdentifierTypeMasterById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProviderIdentifierType = action.payload;
      })
      .addCase(fetchProviderIdentifierTypeMasterById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to load provider identifier type details";
      })
      .addCase(createProviderIdentifierTypeMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(createProviderIdentifierTypeMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderIdentifierType = action.payload.record;
        state.providerIdentifierTypeRows = [
          action.payload.record,
          ...state.providerIdentifierTypeRows,
        ];
        state.providerIdentifierTypeTotal += 1;
      })
      .addCase(createProviderIdentifierTypeMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to create provider identifier type";
      })
      .addCase(patchProviderIdentifierTypeMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(patchProviderIdentifierTypeMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderIdentifierType = action.payload.record;
        state.providerIdentifierTypeRows = state.providerIdentifierTypeRows.map((row) =>
          row.id === action.payload.record?.id ? action.payload.record : row,
        );
      })
      .addCase(patchProviderIdentifierTypeMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to update provider identifier type";
      })
      .addCase(deleteProviderIdentifierTypeMaster.fulfilled, (state, action) => {
        state.providerIdentifierTypeRows = state.providerIdentifierTypeRows.filter(
          (row) => row.id !== action.payload.id,
        );
        state.providerIdentifierTypeTotal = Math.max(
          0,
          state.providerIdentifierTypeTotal - 1,
        );
      })
      .addCase(fetchProviderDiscountTypeMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderDiscountTypeMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.providerDiscountTypeRows = action.payload.rows;
        state.providerDiscountTypeTotal = action.payload.total;
      })
      .addCase(fetchProviderDiscountTypeMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load provider discount types";
      })
      .addCase(fetchProviderDiscountTypeMasterById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedProviderDiscountType = null;
      })
      .addCase(fetchProviderDiscountTypeMasterById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProviderDiscountType = action.payload;
      })
      .addCase(fetchProviderDiscountTypeMasterById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to load provider discount type details";
      })
      .addCase(createProviderDiscountTypeMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(createProviderDiscountTypeMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderDiscountType = action.payload.record;
        state.providerDiscountTypeRows = [
          action.payload.record,
          ...state.providerDiscountTypeRows,
        ];
        state.providerDiscountTypeTotal += 1;
      })
      .addCase(createProviderDiscountTypeMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload?.message ??
          action.error.message ??
          "Failed to create provider discount type";
      })
      .addCase(patchProviderDiscountTypeMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(patchProviderDiscountTypeMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderDiscountType = action.payload.record;
        state.providerDiscountTypeRows = state.providerDiscountTypeRows.map((row) =>
          row.id === action.payload.record?.id ? action.payload.record : row,
        );
      })
      .addCase(patchProviderDiscountTypeMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload?.message ??
          action.error.message ??
          "Failed to update provider discount type";
      })
      .addCase(deleteProviderDiscountTypeMaster.fulfilled, (state, action) => {
        state.providerDiscountTypeRows = state.providerDiscountTypeRows.filter(
          (row) => row.id !== action.payload.id,
        );
        state.providerDiscountTypeTotal = Math.max(0, state.providerDiscountTypeTotal - 1);
      })
      .addCase(fetchProviderDiscountSubtypeMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderDiscountSubtypeMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.providerDiscountSubtypeRows = action.payload.rows;
        state.providerDiscountSubtypeTotal = action.payload.total;
      })
      .addCase(fetchProviderDiscountSubtypeMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load provider discount subtypes";
      })
      .addCase(fetchProviderDiscountSubtypeMasterById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedProviderDiscountSubtype = null;
      })
      .addCase(fetchProviderDiscountSubtypeMasterById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProviderDiscountSubtype = action.payload;
      })
      .addCase(fetchProviderDiscountSubtypeMasterById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to load provider discount subtype details";
      })
      .addCase(createProviderDiscountSubtypeMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(createProviderDiscountSubtypeMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderDiscountSubtype = action.payload.record;
        state.providerDiscountSubtypeRows = [
          action.payload.record,
          ...state.providerDiscountSubtypeRows,
        ];
        state.providerDiscountSubtypeTotal += 1;
      })
      .addCase(createProviderDiscountSubtypeMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload?.message ??
          action.error.message ??
          "Failed to create provider discount subtype";
      })
      .addCase(patchProviderDiscountSubtypeMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(patchProviderDiscountSubtypeMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderDiscountSubtype = action.payload.record;
        state.providerDiscountSubtypeRows = state.providerDiscountSubtypeRows.map((row) =>
          row.id === action.payload.record?.id ? action.payload.record : row,
        );
      })
      .addCase(patchProviderDiscountSubtypeMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload?.message ??
          action.error.message ??
          "Failed to update provider discount subtype";
      })
      .addCase(deleteProviderDiscountSubtypeMaster.fulfilled, (state, action) => {
        state.providerDiscountSubtypeRows = state.providerDiscountSubtypeRows.filter(
          (row) => row.id !== action.payload.id,
        );
        state.providerDiscountSubtypeTotal = Math.max(
          0,
          state.providerDiscountSubtypeTotal - 1,
        );
      })
      .addCase(fetchProviderDiscountInclusionExclusionMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderDiscountInclusionExclusionMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.providerDiscountInclusionExclusionRows = action.payload.rows;
        state.providerDiscountInclusionExclusionTotal = action.payload.total;
      })
      .addCase(fetchProviderDiscountInclusionExclusionMaster.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to load provider discount inclusion/exclusion records";
      })
      .addCase(fetchProviderDiscountInclusionExclusionMasterById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedProviderDiscountInclusionExclusion = null;
      })
      .addCase(fetchProviderDiscountInclusionExclusionMasterById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProviderDiscountInclusionExclusion = action.payload;
      })
      .addCase(fetchProviderDiscountInclusionExclusionMasterById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to load provider discount inclusion/exclusion details";
      })
      .addCase(createProviderDiscountInclusionExclusionMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(createProviderDiscountInclusionExclusionMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderDiscountInclusionExclusion = action.payload.record;
        state.providerDiscountInclusionExclusionRows = [
          action.payload.record,
          ...state.providerDiscountInclusionExclusionRows,
        ];
        state.providerDiscountInclusionExclusionTotal += 1;
      })
      .addCase(createProviderDiscountInclusionExclusionMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload?.message ??
          action.error.message ??
          "Failed to create provider discount inclusion/exclusion";
      })
      .addCase(patchProviderDiscountInclusionExclusionMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(patchProviderDiscountInclusionExclusionMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderDiscountInclusionExclusion = action.payload.record;
        state.providerDiscountInclusionExclusionRows =
          state.providerDiscountInclusionExclusionRows.map((row) =>
            row.id === action.payload.record?.id ? action.payload.record : row,
          );
      })
      .addCase(patchProviderDiscountInclusionExclusionMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload?.message ??
          action.error.message ??
          "Failed to update provider discount inclusion/exclusion";
      })
      .addCase(deleteProviderDiscountInclusionExclusionMaster.fulfilled, (state, action) => {
        state.providerDiscountInclusionExclusionRows =
          state.providerDiscountInclusionExclusionRows.filter(
            (row) => row.id !== action.payload.id,
          );
        state.providerDiscountInclusionExclusionTotal = Math.max(
          0,
          state.providerDiscountInclusionExclusionTotal - 1,
        );
      })
      .addCase(fetchProviderTaxonomyMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderTaxonomyMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.providerTaxonomyRows = action.payload.rows;
        state.providerTaxonomyTotal = action.payload.total;
      })
      .addCase(fetchProviderTaxonomyMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load provider taxonomy records";
      })
      .addCase(fetchProviderTaxonomyMasterById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedProviderTaxonomy = null;
      })
      .addCase(fetchProviderTaxonomyMasterById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProviderTaxonomy = action.payload;
      })
      .addCase(fetchProviderTaxonomyMasterById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to load provider taxonomy details";
      })
      .addCase(createProviderTaxonomyMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(createProviderTaxonomyMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderTaxonomy = action.payload.record;
        state.providerTaxonomyRows = [action.payload.record, ...state.providerTaxonomyRows];
        state.providerTaxonomyTotal += 1;
      })
      .addCase(createProviderTaxonomyMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to create provider taxonomy";
      })
      .addCase(patchProviderTaxonomyMaster.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(patchProviderTaxonomyMaster.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedProviderTaxonomy = action.payload.record;
        state.providerTaxonomyRows = state.providerTaxonomyRows.map((row) =>
          row.id === action.payload.record?.id ? action.payload.record : row,
        );
      })
      .addCase(patchProviderTaxonomyMaster.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to update provider taxonomy";
      })
      .addCase(deleteProviderTaxonomyMaster.fulfilled, (state, action) => {
        state.providerTaxonomyRows = state.providerTaxonomyRows.filter(
          (row) => row.id !== action.payload.id,
        );
        state.providerTaxonomyTotal = Math.max(0, state.providerTaxonomyTotal - 1);
      })
      .addCase(fetchInsurerProviderNetworkMode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsurerProviderNetworkMode.fulfilled, (state, action) => {
        state.loading = false;
        state.insurerProviderNetworkModeRows = action.payload.rows;
        state.insurerProviderNetworkModeTotal = action.payload.total;
      })
      .addCase(fetchInsurerProviderNetworkMode.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to load insurer provider network mode records";
      })
      .addCase(fetchInsurerProviderNetworkModeById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedInsurerProviderNetworkMode = null;
      })
      .addCase(fetchInsurerProviderNetworkModeById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedInsurerProviderNetworkMode = action.payload;
      })
      .addCase(fetchInsurerProviderNetworkModeById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to load insurer provider network mode details";
      })
      .addCase(createInsurerProviderNetworkMode.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(createInsurerProviderNetworkMode.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedInsurerProviderNetworkMode = action.payload.record;
        state.insurerProviderNetworkModeRows = [
          action.payload.record,
          ...state.insurerProviderNetworkModeRows,
        ];
        state.insurerProviderNetworkModeTotal += 1;
      })
      .addCase(createInsurerProviderNetworkMode.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to create insurer provider network mode";
      })
      .addCase(patchInsurerProviderNetworkMode.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(patchInsurerProviderNetworkMode.fulfilled, (state, action) => {
        state.detailLoading = false;
        if (!action.payload.record) return;
        state.selectedInsurerProviderNetworkMode = action.payload.record;
        state.insurerProviderNetworkModeRows = state.insurerProviderNetworkModeRows.map(
          (row) => (row.id === action.payload.record?.id ? action.payload.record : row),
        );
      })
      .addCase(patchInsurerProviderNetworkMode.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.error.message ?? "Failed to update insurer provider network mode";
      })
      .addCase(deleteInsurerProviderNetworkMode.fulfilled, (state, action) => {
        state.insurerProviderNetworkModeRows = state.insurerProviderNetworkModeRows.filter(
          (row) => row.id !== action.payload.id,
        );
        state.insurerProviderNetworkModeTotal = Math.max(
          0,
          state.insurerProviderNetworkModeTotal - 1,
        );
      })
      .addCase(fetchProviderMasterActivityLog.pending, (state, action) => {
        state.activityLog.loading = true;
        state.activityLog.error = null;
        state.activityLog.masterKey = action.meta.arg;
      })
      .addCase(fetchProviderMasterActivityLog.fulfilled, (state, action) => {
        state.activityLog.loading = false;
        state.activityLog.rows = action.payload.rows;
      })
      .addCase(fetchProviderMasterActivityLog.rejected, (state, action) => {
        state.activityLog.loading = false;
        state.activityLog.rows = [];
        state.activityLog.error = action.error.message ?? "";
      });
  },
});

export default providerMastersSlice.reducer;
