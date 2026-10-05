import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProviderManpower, patchProviderManpower } from "./providerManpowerAPI";
import type {
  ProviderManpower,
  ProviderManpowerPatchPayload,
  ProviderManpowerState,
} from "./providerManpowerTypes";

const initialState: ProviderManpowerState = {
  data: null,
  providerId: null,
  loading: false,
  saving: false,
  error: null,
  saveError: null,
};

export const fetchProviderManpower = createAsyncThunk<
  ProviderManpower | null,
  string,
  { rejectValue: string }
>("providerManpower/fetch", async (providerId, { rejectWithValue }) => {
  const res = await getProviderManpower(providerId);
  if (!res.success) {
    return rejectWithValue(res.error ?? "Failed to load provider manpower");
  }
  return res.data;
});

export const updateProviderManpower = createAsyncThunk<
  ProviderManpower | null,
  { providerId: string; payload: ProviderManpowerPatchPayload },
  { rejectValue: string }
>("providerManpower/update", async ({ providerId, payload }, { rejectWithValue }) => {
  const res = await patchProviderManpower(providerId, payload);
  if (!res.success) {
    return rejectWithValue(res.error ?? "Failed to update provider manpower");
  }
  return res.data;
});

const providerManpowerSlice = createSlice({
  name: "providerManpower",
  initialState,
  reducers: {
    clearProviderManpower(state) {
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
      .addCase(fetchProviderManpower.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.providerId = action.meta.arg;
      })
      .addCase(fetchProviderManpower.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProviderManpower.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to load provider manpower";
      })
      .addCase(updateProviderManpower.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateProviderManpower.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateProviderManpower.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload ?? action.error.message ?? "Failed to update provider manpower";
      });
  },
});

export const { clearProviderManpower } = providerManpowerSlice.actions;
export default providerManpowerSlice.reducer;
