// src/redux/tpa/tpaSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchInsurerListAPI } from "./insurerListAPI";
import { InsurerListResponse, InsurerList } from "./insurerListTypes";

interface ParentBranchsState {
  insurerList: InsurerList[];
  loading: boolean;
  error: string | null;
}

const initialState: ParentBranchsState = {
  insurerList: [],
  loading: false,
  error: null,
};

export const fetchInsurerList = createAsyncThunk(
  "tpa/fetchInsurerList",
  async () => {
    const response: InsurerListResponse | null = await fetchInsurerListAPI();
    return response;
  },
);

const tpaSlice = createSlice({
  name: "tpa",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsurerList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsurerList.fulfilled, (state, action) => {
        const res = action.payload;
        state.insurerList = res?.data ?? [];
        state.loading = false;
      })
      .addCase(fetchInsurerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch TPA branches";
      });
  },
});

export default tpaSlice.reducer;
