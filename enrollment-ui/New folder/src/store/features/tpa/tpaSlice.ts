import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { fetchTPABranchesAPI, fetchTPABranchesAPIForSpoc, fetchTPASpocsDropdownAPI } from "./tpaAPI";
import { TPABranch } from "./tpaTypes";
import type { RootState } from "@/store/store";
interface TPAState {
  branches: TPABranch[];
  branchesForSpoc: any[];
  spocs: any[];
  selectedRoles: string[]; // <-- add this
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: TPAState = {
  branches: [],
  branchesForSpoc: [],
  selectedRoles: [],
  spocs: [],
  totalRecords: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

export const fetchTPABranches = createAsyncThunk(
  "tpa/fetchTPABranches",
  async (payload?: Record<string, any>) => {
    // ⭐ minimal change: ensure page & size defaults
    const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };

    const response = await fetchTPABranchesAPI(finalPayload);
    return response;
  },
  {
    condition: (_, { getState }) => {
      const { tpa } = getState() as RootState;
      // Only dedupe in-flight requests; callers may refetch with different params later.
      return !tpa.loading;
    },
  },
);
export const fetchTPABranchesForSpoc = createAsyncThunk(
  "tpabranch/fetchTPABranchesForSpoc",
  async () => {


    const response = await fetchTPABranchesAPIForSpoc();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const { tpa } = getState() as RootState;
      // Only dedupe in-flight requests; callers may refetch with different params later.
      return !tpa.loading;
    },
  },
);

export const fetchTPASpocs = createAsyncThunk(
  "tpa/fetchTPASpocs",
  async (branchId: string) => {
    const response = await fetchTPASpocsDropdownAPI(branchId);
    return response;
  },
);

const tpaSlice = createSlice({
  name: "tpa",
  initialState,
  // reducers: {},
  reducers: {
    setSelectedRoles: (state, action: PayloadAction<string[]>) => {
      state.selectedRoles = action.payload;
    },
    clearSelectedRoles: (state) => {
      state.selectedRoles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch TPA Branches
      .addCase(fetchTPABranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTPABranches.fulfilled, (state, action) => {
        const res = action.payload;

        state.branches = res?.data ?? [];
        state.totalRecords = res?.pagination?.totalRecords ?? 0;
        state.totalPages = res?.pagination?.totalPages ?? 0;
        state.currentPage = res?.pagination?.currentPage ?? 1;
        state.loading = false;
      })
      .addCase(fetchTPABranches.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch TPA branches";
      })

      // Fetch TPA SPOCs
      .addCase(fetchTPASpocs.fulfilled, (state, action) => {
        const res = action.payload;
        state.spocs = res?.data ?? [];
      })

      // Fetch TPA Branches For SPOC
      .addCase(fetchTPABranchesForSpoc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTPABranchesForSpoc.fulfilled, (state, action) => {
        const res = action.payload;

        state.branchesForSpoc = res?.data ?? [];
        state.totalRecords = res?.pagination?.totalRecords ?? 0;
        state.totalPages = res?.pagination?.totalPages ?? 0;
        state.currentPage = res?.pagination?.currentPage ?? 1;
        state.loading = false;
      })
      .addCase(fetchTPABranchesForSpoc.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch TPA branches";
      });
  },
});

export const {
  setSelectedRoles,
  clearSelectedRoles,
} = tpaSlice.actions;

export default tpaSlice.reducer;
