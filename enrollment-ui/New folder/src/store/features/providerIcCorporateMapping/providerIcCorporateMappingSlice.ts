import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchGlobalProviderNetworkMappingListApi } from "./providerIcCorporateMappingAPI";
import type { GlobalNetworkMappingListFilters } from "./providerIcCorporateMappingTypes";

type ProviderIcCorporateMappingState = {
  globalListLoading: boolean;
  error: string | null;
};

const initialState: ProviderIcCorporateMappingState = {
  globalListLoading: false,
  error: null,
};

export const fetchGlobalProviderNetworkMappingList = createAsyncThunk(
  "providerIcCorporateMapping/fetchGlobalList",
  async (filters: GlobalNetworkMappingListFilters, { rejectWithValue }) => {
    const result = await fetchGlobalProviderNetworkMappingListApi(filters);
    if (!result.ok) {
      return rejectWithValue({
        message: result.message ?? "",
        status: result.status,
      });
    }
    return result;
  },
);

const providerIcCorporateMappingSlice = createSlice({
  name: "providerIcCorporateMapping",
  initialState,
  reducers: {
    clearProviderIcCorporateMappingError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalProviderNetworkMappingList.pending, (state) => {
        state.globalListLoading = true;
        state.error = null;
      })
      .addCase(fetchGlobalProviderNetworkMappingList.fulfilled, (state) => {
        state.globalListLoading = false;
      })
      .addCase(fetchGlobalProviderNetworkMappingList.rejected, (state, action) => {
        state.globalListLoading = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = String(payload?.message ?? action.error.message ?? "");
      });
  },
});

export const { clearProviderIcCorporateMappingError } =
  providerIcCorporateMappingSlice.actions;
export default providerIcCorporateMappingSlice.reducer;
