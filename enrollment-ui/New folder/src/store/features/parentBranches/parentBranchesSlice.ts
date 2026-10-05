// src/redux/tpa/tpaSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchParentBranchesAPI } from "./parentBranchesAPI";
import { ParentBranchResponse, ParentBranch } from "./parentBranchesTypes";
import { showErrorMessage } from "@/utils/errorHandler";

interface ParentBranchsState {
  parentBranchs: ParentBranch[];
  loading: boolean;
  error: string | null;
}

const initialState: ParentBranchsState = {
  parentBranchs: [],
  loading: false,
  error: null,
};

export const fetchParentBranches = createAsyncThunk(
  "tpa/fetchParentBranches",
  async () => {
    const response: ParentBranchResponse | null =
      await fetchParentBranchesAPI();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { parentBranchs: ParentBranchsState };
      if (state.parentBranchs.loading) return false;
      if ((state.parentBranchs.parentBranchs?.length ?? 0) > 0) return false;
      return true;
    },
  },
);

const tpaSlice = createSlice({
  name: "tpa",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParentBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParentBranches.fulfilled, (state, action) => {
        const res = action.payload;
        state.parentBranchs = res?.data ?? [];
        state.loading = false;
      })
      .addCase(fetchParentBranches.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.error.message || "Failed to fetch parent branches";
        state.error = errorMessage;
        showErrorMessage({ error: errorMessage });
      });
  },
});

export default tpaSlice.reducer;
