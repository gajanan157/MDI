import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchBulkBankDetailsInwardsApi,
  fetchStagingBankComparisonApi,
  fetchStagingBankProviderInsurerListApi,
  type FetchBulkBankDetailsInwardsParams,
  type FetchStagingBankProviderInsurerParams,
} from "./bulkBankDetailsAPI";
import type { BankComparisonFieldLabels } from "@/app/pages/dashboards/providerManagernt/shared/bankDetailsComparison";

type BulkBankDetailsState = {
  inwardLoading: boolean;
  stagingLoading: boolean;
  comparisonLoading: boolean;
  error: string | null;
};

const initialState: BulkBankDetailsState = {
  inwardLoading: false,
  stagingLoading: false,
  comparisonLoading: false,
  error: null,
};

export const fetchBulkBankDetailsInwards = createAsyncThunk(
  "bulkBankDetails/fetchInwards",
  async (params: FetchBulkBankDetailsInwardsParams, { rejectWithValue }) => {
    const result = await fetchBulkBankDetailsInwardsApi(params);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return result;
  },
);

export const fetchStagingBankProviderInsurerList = createAsyncThunk(
  "bulkBankDetails/fetchStagingList",
  async (params: FetchStagingBankProviderInsurerParams, { rejectWithValue }) => {
    const result = await fetchStagingBankProviderInsurerListApi(params);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return result;
  },
);

export const fetchStagingBankComparison = createAsyncThunk(
  "bulkBankDetails/fetchComparison",
  async (
    params: { stagingBankProviderInsurerId: string; fieldLabels: BankComparisonFieldLabels },
    { rejectWithValue },
  ) => {
    const result = await fetchStagingBankComparisonApi(
      params.stagingBankProviderInsurerId,
      params.fieldLabels,
    );
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return result;
  },
);

const bulkBankDetailsSlice = createSlice({
  name: "bulkBankDetails",
  initialState,
  reducers: {
    clearBulkBankDetailsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBulkBankDetailsInwards.pending, (state) => {
        state.inwardLoading = true;
        state.error = null;
      })
      .addCase(fetchBulkBankDetailsInwards.fulfilled, (state) => {
        state.inwardLoading = false;
      })
      .addCase(fetchBulkBankDetailsInwards.rejected, (state, action) => {
        state.inwardLoading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : String(action.error.message ?? "");
      })
      .addCase(fetchStagingBankProviderInsurerList.pending, (state) => {
        state.stagingLoading = true;
        state.error = null;
      })
      .addCase(fetchStagingBankProviderInsurerList.fulfilled, (state) => {
        state.stagingLoading = false;
      })
      .addCase(fetchStagingBankProviderInsurerList.rejected, (state, action) => {
        state.stagingLoading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : String(action.error.message ?? "");
      })
      .addCase(fetchStagingBankComparison.pending, (state) => {
        state.comparisonLoading = true;
        state.error = null;
      })
      .addCase(fetchStagingBankComparison.fulfilled, (state) => {
        state.comparisonLoading = false;
      })
      .addCase(fetchStagingBankComparison.rejected, (state, action) => {
        state.comparisonLoading = false;
        state.error = typeof action.payload === "string"
          ? action.payload
          : String(action.error.message ?? "");
      });
  },
});

export const { clearBulkBankDetailsError } = bulkBankDetailsSlice.actions;
export default bulkBankDetailsSlice.reducer;
