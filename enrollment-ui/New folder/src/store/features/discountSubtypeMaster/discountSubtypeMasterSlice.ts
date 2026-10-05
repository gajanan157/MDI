import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchDiscountSubtypeMasterAPI } from "./discountSubtypeMasterAPI";
import type {
  DiscountSubtypeMasterRecord,
  DiscountSubtypeMasterRecordStatus,
  DiscountSubtypeMasterResponse,
  FetchDiscountSubtypeMasterParams,
} from "./discountSubtypeMasterTypes";

type DiscountSubtypeMasterState = {
  /** Subtype rows keyed by `providerDiscountTypeMasterId`. */
  byMasterId: Record<string, DiscountSubtypeMasterRecord[]>;
  loadingByMasterId: Record<string, boolean>;
  error: string | null;
};

const initialState: DiscountSubtypeMasterState = {
  byMasterId: {},
  loadingByMasterId: {},
  error: null,
};

function pickString(item: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = item[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function resolveRecordStatus(item: Record<string, unknown>): DiscountSubtypeMasterRecordStatus {
  const status = pickString(item, ["recordStatus", "status", "activeStatus"]).toLowerCase();
  if (status === "inactive" || status === "0" || status === "deleted") return "INACTIVE";
  if (status === "active" || status === "1") return "ACTIVE";
  if (item.isActive === false || item.active === false) return "INACTIVE";
  return "ACTIVE";
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

export function normalizeDiscountSubtypeMasterRow(
  row: unknown,
): DiscountSubtypeMasterRecord | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;

  const id = pickString(item, [
    "providerDiscountSubtypeMasterId",
    "discountSubtypeId",
    "id",
    "discountSubtypeMasterId",
  ]);
  const code = pickString(item, [
    "providerDiscountSubtypeCode",
    "discountSubtypeCode",
    "typeCode",
    "code",
  ]);
  const name = pickString(item, [
    "providerDiscountSubtypeName",
    "discountSubtypeName",
    "typeName",
    "name",
    "displayName",
  ]);
  if (!id && !code && !name) return null;

  const resolvedId = id || code || name;
  const resolvedCode = code || resolvedId;
  return {
    id: resolvedId,
    code: resolvedCode,
    name: name || resolvedCode,
    value: resolvedCode || resolvedId,
    providerDiscountTypeMasterId: pickString(item, [
      "providerDiscountTypeMasterId",
      "discountTypeMasterId",
      "providerDiscountTypeId",
    ]),
    recordStatus: resolveRecordStatus(item),
  };
}

export const fetchDiscountSubtypeMaster = createAsyncThunk<
  DiscountSubtypeMasterResponse | null,
  FetchDiscountSubtypeMasterParams
>("discountSubtypeMaster/fetch", async (params) => {
  return fetchDiscountSubtypeMasterAPI(params);
});

const discountSubtypeMasterSlice = createSlice({
  name: "discountSubtypeMaster",
  initialState,
  reducers: {
    clearDiscountSubtypeMaster: (state, action: PayloadAction<string | undefined>) => {
      const masterId = action.payload?.trim();
      if (!masterId) {
        state.byMasterId = {};
        state.loadingByMasterId = {};
        state.error = null;
        return;
      }
      delete state.byMasterId[masterId];
      delete state.loadingByMasterId[masterId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountSubtypeMaster.pending, (state, action) => {
        const masterId = action.meta.arg.providerDiscountTypeMasterId.trim();
        state.loadingByMasterId[masterId] = true;
        state.error = null;
      })
      .addCase(fetchDiscountSubtypeMaster.fulfilled, (state, action) => {
        const masterId = action.meta.arg.providerDiscountTypeMasterId.trim();
        state.loadingByMasterId[masterId] = false;
        state.byMasterId[masterId] = extractRows(action.payload)
          .map((row) => normalizeDiscountSubtypeMasterRow(row))
          .filter((row): row is DiscountSubtypeMasterRecord => row != null);
        if (!action.payload) {
          state.error = "Failed to load discount subtypes";
        }
      })
      .addCase(fetchDiscountSubtypeMaster.rejected, (state, action) => {
        const masterId = action.meta.arg.providerDiscountTypeMasterId.trim();
        state.loadingByMasterId[masterId] = false;
        state.error = action.error.message ?? "Failed to load discount subtypes";
      });
  },
});

export const { clearDiscountSubtypeMaster } = discountSubtypeMasterSlice.actions;
export default discountSubtypeMasterSlice.reducer;
