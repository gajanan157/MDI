// insurerSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { InsurerOffice, InsurerOfficeResponse } from "./insurerOfficeType";
import {
  fetchInsurerOfficeAPI,
  fetchInsurerOfficeSearchAPI,
  fetchInsurerOfficeByIdAPI,
} from "./insurerOfficeAPI";

interface InsurerState {
  list: InsurerOffice[];
  parentOffices: InsurerOffice[];
  childOffices: InsurerOffice[];
  subChildOffices: InsurerOffice[];
  loading: boolean;
  totalRecords: number;
  error?: string | null;
}

const initialState: InsurerState = {
  list: [],
  parentOffices: [],
  childOffices: [],
  subChildOffices: [],
  loading: false,
  totalRecords: 0,
  error: null,
};

interface FetchInsurerParams {
  query?: string;
  id?: string | number;
  level?: "PARENT" | "CHILD" | "SUB_CHILD"; // 🔹 USED FOR ROUTING ONLY
  onlyNames?: boolean; // 🔹 If true, don't update main list (only for dropdown options)
}

// ✅ EXISTING THUNK — UNCHANGED
export const fetchInsurerOffices = createAsyncThunk<
  InsurerOfficeResponse,
  FetchInsurerParams | undefined,
  { rejectValue: string }
>("insurer/fetchOffice", async (params, { rejectWithValue }) => {
  try {
    if (params?.id) {
      const item = await fetchInsurerOfficeByIdAPI(params.id);
      const normalized: InsurerOfficeResponse = {
        data: [item],
        pagination: { totalRecords: 1 },
      } as unknown as InsurerOfficeResponse;
      return normalized;
    } else if (params?.query) {
      return await fetchInsurerOfficeSearchAPI(params.query);
    } else if (params) {
      return await fetchInsurerOfficeAPI(params);
    } else {
      return await fetchInsurerOfficeAPI();
    }
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch insurer offices";
    return rejectWithValue(String(message));
  }
});

const insurerSlice = createSlice({
  name: "insurerOffice",
  initialState,
  reducers: {
    // Optional helpers if you want to clear lists manually
    clearChildOffices(state) {
      state.childOffices = [];
      state.subChildOffices = [];
    },
    clearSubChildOffices(state) {
      state.subChildOffices = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsurerOffices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ✅ UPDATED BUT BACKWARD-SAFE
      .addCase(fetchInsurerOffices.fulfilled, (state, action) => {
        const data = action.payload.data ?? [];

        // 🔹 Get the full params including onlyNames
        const args = action.meta.arg as FetchInsurerParams | undefined;
        const isOnlyNames = (args as any)?.onlyNames === true;

        // 🔹 Only update main list if this is NOT a dropdown-only request
        // If onlyNames is true, this is for dropdown options, not table data
        // Don't update the main table list when fetching dropdown options to prevent breaking AgGrid
        if (!isOnlyNames) {
          state.list = data;
          state.totalRecords =
            action.payload.pagination?.totalRecords ?? data.length;
        }
        // If onlyNames is true, don't update main list - only update dropdown-specific lists

        state.loading = false;
        state.error = null;

        // 🔹 NEW: Route data based on hierarchy level (for dropdown options)
        if (args?.level === "PARENT") {
          state.parentOffices = data;
        } else if (args?.level === "CHILD") {
          state.childOffices = data;
        } else if (args?.level === "SUB_CHILD") {
          state.subChildOffices = data;
        }
      })

      .addCase(fetchInsurerOffices.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ??
          action.error?.message ??
          "Unknown error";
      });
  },
});

export const { clearChildOffices, clearSubChildOffices } = insurerSlice.actions;

export default insurerSlice.reducer;
