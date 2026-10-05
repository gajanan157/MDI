import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProviderFacility, patchProviderFacility } from "./providerFacilityAPI";
import type {
  ProviderFacility,
  ProviderFacilityPatchPayload,
  ProviderFacilityState,
} from "./providerFacilityTypes";

const initialState: ProviderFacilityState = {
  data: null,
  providerId: null,
  loading: false,
  saving: false,
  error: null,
  saveError: null,
};

export const fetchProviderFacility = createAsyncThunk<
  ProviderFacility | null,
  string,
  { rejectValue: string }
>("providerFacility/fetch", async (providerId, { rejectWithValue }) => {
  const res = await getProviderFacility(providerId);
  if (!res.success) {
    return rejectWithValue(res.error ?? "Failed to load provider facility");
  }
  return res.data;
});

export const updateProviderFacility = createAsyncThunk<
  ProviderFacility | null,
  { providerId: string; payload: ProviderFacilityPatchPayload },
  { rejectValue: string }
>("providerFacility/update", async ({ providerId, payload }, { rejectWithValue }) => {
  const res = await patchProviderFacility(providerId, payload);
  if (!res.success) {
    return rejectWithValue(res.error ?? "Failed to update provider facility");
  }
  return res.data;
});

const providerFacilitySlice = createSlice({
  name: "providerFacility",
  initialState,
  reducers: {
    clearProviderFacility(state) {
      state.data = null;
      state.providerId = null;
      state.loading = false;
      state.saving = false;
      state.error = null;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderFacility.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.providerId = action.meta.arg;
      })
      .addCase(fetchProviderFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProviderFacility.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to load provider facility";
      })
      .addCase(updateProviderFacility.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateProviderFacility.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateProviderFacility.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload ?? action.error.message ?? "Failed to update provider facility";
      });
  },
});

export const { clearProviderFacility } = providerFacilitySlice.actions;
export default providerFacilitySlice.reducer;
