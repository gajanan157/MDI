import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchDiscountInclusionExclusionMasterAPI } from "./discountInclusionExclusionMasterAPI";
import type {
  DiscountInclusionExclusionMasterRecord,
  DiscountInclusionExclusionMasterRecordStatus,
  DiscountInclusionExclusionMasterResponse,
  DiscountInclusionExclusionType,
  FetchDiscountInclusionExclusionMasterParams,
} from "./discountInclusionExclusionMasterTypes";

type DiscountInclusionExclusionMasterState = {
  list: DiscountInclusionExclusionMasterRecord[];
  loading: boolean;
  error: string | null;
};

const initialState: DiscountInclusionExclusionMasterState = {
  list: [],
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

function resolveRecordStatus(
  item: Record<string, unknown>,
): DiscountInclusionExclusionMasterRecordStatus {
  const status = pickString(item, ["recordStatus", "status", "activeStatus"]).toLowerCase();
  if (status === "inactive" || status === "0" || status === "deleted") return "INACTIVE";
  if (status === "active" || status === "1") return "ACTIVE";
  if (item.isActive === false || item.active === false) return "INACTIVE";
  return "ACTIVE";
}

function resolveType(item: Record<string, unknown>): DiscountInclusionExclusionType {
  const raw = pickString(item, [
    "providerInclusionExclusionType",
    "inclusionExclusionType",
    "type",
  ]).toUpperCase();
  if (raw === "INCLUSION" || raw === "EXCLUSION") return raw;
  return "";
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

export function normalizeDiscountInclusionExclusionMasterRow(
  row: unknown,
): DiscountInclusionExclusionMasterRecord | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;

  const id = pickString(item, [
    "providerInclusionExclusionMasterId",
    "inclusionExclusionMasterId",
    "id",
  ]);
  const code = pickString(item, [
    "providerInclusionExclusionCode",
    "inclusionExclusionCode",
    "code",
  ]);
  const name = pickString(item, [
    "providerInclusionExclusionName",
    "inclusionExclusionName",
    "name",
    "displayName",
  ]);
  if (!id && !code && !name) return null;

  const resolvedCode = code || id || name;
  return {
    id: id || resolvedCode,
    code: resolvedCode,
    name: name || resolvedCode,
    description: pickString(item, ["description", "providerInclusionExclusionDescription"]),
    type: resolveType(item),
    recordStatus: resolveRecordStatus(item),
  };
}

export const fetchDiscountInclusionExclusionMaster = createAsyncThunk<
  DiscountInclusionExclusionMasterResponse | null,
  FetchDiscountInclusionExclusionMasterParams | undefined
>("discountInclusionExclusionMaster/fetch", async (params) => {
  return fetchDiscountInclusionExclusionMasterAPI(params ?? {});
});

const discountInclusionExclusionMasterSlice = createSlice({
  name: "discountInclusionExclusionMaster",
  initialState,
  reducers: {
    clearDiscountInclusionExclusionMaster: (state) => {
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscountInclusionExclusionMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountInclusionExclusionMaster.fulfilled, (state, action) => {
        state.list = extractRows(action.payload)
          .map((row) => normalizeDiscountInclusionExclusionMasterRow(row))
          .filter((row): row is DiscountInclusionExclusionMasterRecord => row != null);
        state.loading = false;
        if (!action.payload) {
          state.error = "Failed to load inclusion/exclusion master";
        }
      })
      .addCase(fetchDiscountInclusionExclusionMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load inclusion/exclusion master";
      });
  },
});

export const { clearDiscountInclusionExclusionMaster } =
  discountInclusionExclusionMasterSlice.actions;
export default discountInclusionExclusionMasterSlice.reducer;
