import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ProviderDetailInfrastructure } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/hospitalData";
import {
  getProviderInfrastructure,
  mapProviderInfrastructureApiResponse,
  patchProviderInfrastructure,
} from "./providerInfrastructureAPI";
import type {
  ProviderInfrastructure,
  ProviderInfrastructurePatchPayload,
  ProviderInfrastructureState,
} from "./providerInfrastructureTypes";

const initialState: ProviderInfrastructureState = {
  data: null,
  providerId: null,
  loading: false,
  saving: false,
  error: null,
  saveError: null,
};

export function mapInfrastructureToProviderDetail(
  infra: ProviderInfrastructure | null | undefined,
): ProviderDetailInfrastructure | undefined {
  if (!infra) return undefined;
  const roomDetailList = (infra.roomDetailList ?? [])
    .map((row) => ({
      providerBedTypeName: row.providerBedTypeName ?? undefined,
      providerBedCount: row.providerBedCount ?? undefined,
    }))
    .filter(
      (row) =>
        row.providerBedTypeName !== undefined || row.providerBedCount !== undefined,
    );

  if (infra.totalBedCount == null && roomDetailList.length === 0) {
    return undefined;
  }

  return {
    totalBedCount: infra.totalBedCount ?? undefined,
    roomDetailList,
  };
}

export const fetchProviderInfrastructure = createAsyncThunk<
  ProviderInfrastructure | null,
  string,
  { rejectValue: string }
>("providerInfrastructure/fetch", async (providerId, { rejectWithValue }) => {
  const res = await getProviderInfrastructure(providerId);
  if (!res.success) {
    return rejectWithValue(res.error ?? "Failed to load provider infrastructure");
  }
  return res.data;
});

export const updateProviderInfrastructure = createAsyncThunk<
  ProviderInfrastructure | null,
  { providerId: string; payload: ProviderInfrastructurePatchPayload },
  { rejectValue: string }
>(
  "providerInfrastructure/update",
  async ({ providerId, payload }, { rejectWithValue }) => {
    const res = await patchProviderInfrastructure(providerId, payload);
    if (!res.success) {
      return rejectWithValue(res.error ?? "Failed to update provider infrastructure");
    }
    return res.data;
  },
);

const providerInfrastructureSlice = createSlice({
  name: "providerInfrastructure",
  initialState,
  reducers: {
    clearProviderInfrastructure(state) {
      state.data = null;
      state.providerId = null;
      state.loading = false;
      state.saving = false;
      state.error = null;
      state.saveError = null;
    },
    setProviderInfrastructureFromApi(state, action: { payload: unknown }) {
      const mapped = mapProviderInfrastructureApiResponse(
        action.payload,
        state.providerId ?? undefined,
      );
      state.data = mapped;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderInfrastructure.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.providerId = action.meta.arg;
      })
      .addCase(fetchProviderInfrastructure.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProviderInfrastructure.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load provider infrastructure";
      })
      .addCase(updateProviderInfrastructure.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateProviderInfrastructure.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateProviderInfrastructure.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          action.payload ??
          action.error.message ??
          "Failed to update provider infrastructure";
      });
  },
});

export const { clearProviderInfrastructure, setProviderInfrastructureFromApi } =
  providerInfrastructureSlice.actions;

export default providerInfrastructureSlice.reducer;
