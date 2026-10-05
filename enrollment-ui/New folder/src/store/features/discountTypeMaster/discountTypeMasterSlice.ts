import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchDiscountTypeMasterAPI } from "./discountTypeMasterAPI";
import type {
  DiscountTypeCategory,
  DiscountTypeMasterRecord,
  DiscountTypeMasterRecordStatus,
  DiscountTypeMasterResponse,
  FetchDiscountTypeMasterParams,
} from "./discountTypeMasterTypes";

type DiscountTypeMasterState = {
  ipdList: DiscountTypeMasterRecord[];
  opdList: DiscountTypeMasterRecord[];
  loading: boolean;
  error: string | null;
};

const initialState: DiscountTypeMasterState = {
  ipdList: [],
  opdList: [],
  loading: false,
  error: null,
};

function pickString(item: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = item[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function lettersOnly(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapCategory(raw: string): DiscountTypeCategory {
  const upper = raw.trim().toUpperCase();
  if (!upper) return "";
  if (
    upper === "IPD" ||
    upper === "I" ||
    upper.includes("INPATIENT") ||
    upper.includes("IN-PATIENT") ||
    upper.includes("IN_PATIENT")
  ) {
    return "IPD";
  }
  if (
    upper === "OPD" ||
    upper === "O" ||
    upper.includes("OUTPATIENT") ||
    upper.includes("OUT-PATIENT") ||
    upper.includes("OUT_PATIENT")
  ) {
    return "OPD";
  }
  return "";
}

function resolveCategory(item: Record<string, unknown>): DiscountTypeCategory {
  const fromText = mapCategory(
    pickString(item, [
      "providerServiceType",
      "discountTypeCategory",
      "discountCategory",
      "category",
      "applicableFor",
      "applicableService",
      "serviceType",
      "serviceCategory",
      "ipdOpd",
      "treatmentType",
      "claimType",
      "discountTypeGroup",
    ]),
  );
  if (fromText) return fromText;
  if (item.isIpd === true || item.ipd === true) return "IPD";
  if (item.isOpd === true || item.opd === true) return "OPD";
  return "";
}

function resolveRecordStatus(item: Record<string, unknown>): DiscountTypeMasterRecordStatus {
  const status = pickString(item, ["recordStatus", "status", "activeStatus"]).toLowerCase();
  if (status === "inactive" || status === "0" || status === "deleted") return "INACTIVE";
  if (status === "active" || status === "1") return "ACTIVE";
  if (item.isActive === false || item.active === false) return "INACTIVE";
  return "ACTIVE";
}

/**
 * Keep special IPD panels (individual / package) working when the master
 * uses similar names or codes instead of the hardcoded picker ids.
 */
function mapKnownDiscountTypeValue(code: string, name: string, id: string): string {
  const codeNorm = lettersOnly(code);
  const nameNorm = lettersOnly(name);

  if (codeNorm === "individual" || codeNorm.includes("individual") || nameNorm.includes("individual")) {
    return "individual";
  }
  if (codeNorm === "netbill" || codeNorm.includes("netbill") || nameNorm.includes("netbill")) {
    return "netBill";
  }
  if (
    codeNorm.includes("approvedamount") ||
    nameNorm.includes("approvedamount")
  ) {
    return "approvedAmountDiscount";
  }
  if (
    codeNorm === "package" ||
    codeNorm === "packagediscount" ||
    codeNorm.includes("packagediscount") ||
    nameNorm === "package" ||
    nameNorm === "packagediscount" ||
    nameNorm.startsWith("packagediscount") ||
    nameNorm.endsWith("packagediscount")
  ) {
    return "package";
  }

  return code || id || name;
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;
  const candidates = [root.data, root.content, root.result, root.records, root.items, root.list];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      const nested = extractRows(candidate);
      if (nested.length) return nested;
    }
  }

  return [];
}

export function normalizeDiscountTypeMasterRow(row: unknown): DiscountTypeMasterRecord | null {
  if (typeof row === "string") {
    const name = row.trim();
    if (!name) return null;
    return {
      id: name,
      code: name,
      name,
      value: mapKnownDiscountTypeValue(name, name, name),
      category: "",
      recordStatus: "ACTIVE",
    };
  }

  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;

  const id = pickString(item, [
    "providerDiscountTypeMasterId",
    "discountTypeId",
    "id",
    "discountTypeMasterId",
  ]);
  const code = pickString(item, [
    "providerDiscountTypeCode",
    "discountTypeCode",
    "typeCode",
    "code",
  ]);
  const name = pickString(item, [
    "providerDiscountTypeName",
    "discountTypeName",
    "typeName",
    "name",
    "displayName",
    "discountType",
  ]);
  if (!id && !code && !name) return null;

  const resolvedId = id || code || name;
  return {
    id: resolvedId,
    code,
    name: name || code || resolvedId,
    value: mapKnownDiscountTypeValue(code, name || code, resolvedId),
    category: resolveCategory(item),
    recordStatus: resolveRecordStatus(item),
  };
}

export const fetchDiscountTypeMaster = createAsyncThunk<
  DiscountTypeMasterResponse | null,
  FetchDiscountTypeMasterParams | undefined
>("discountTypeMaster/fetch", async (params) => {
  return fetchDiscountTypeMasterAPI(params ?? { download: true });
});

const discountTypeMasterSlice = createSlice({
  name: "discountTypeMaster",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountTypeMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountTypeMaster.fulfilled, (state, action) => {
        const serviceType = action.meta.arg?.providerServiceType;
        const rows = extractRows(action.payload)
          .map((row) => normalizeDiscountTypeMasterRow(row))
          .filter((row): row is DiscountTypeMasterRecord => row != null)
          .map((row) => ({
            ...row,
            category: row.category || serviceType || "",
          }));
        if (serviceType === "OPD") {
          state.opdList = rows;
        } else {
          state.ipdList = rows;
        }
        state.loading = false;
        if (!action.payload) {
          state.error = "Failed to load discount types";
        }
      })
      .addCase(fetchDiscountTypeMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load discount types";
      });
  },
});

export default discountTypeMasterSlice.reducer;
