import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createProviderDiscountConfiguration as createProviderDiscountConfigurationApi,
  fetchProviderDiscountConfigurationById as fetchProviderDiscountConfigurationByIdApi,
  fetchProviderDiscountConfigurationList as fetchProviderDiscountConfigurationListApi,
  patchProviderDiscountConfiguration as patchProviderDiscountConfigurationApi,
} from "./providerDiscountConfigurationAPI";
import type {
  CreateProviderDiscountConfigurationBody,
  NormalizedProviderDiscountConfiguration,
  PatchProviderDiscountConfigurationBody,
  ProviderDiscountConfigurationListFilters,
  ProviderDiscountConfigurationState,
} from "./providerDiscountConfigurationTypes";

const initialState: ProviderDiscountConfigurationState = {
  list: {
    providerId: null,
    rows: [],
    totalRecords: 0,
    loading: false,
    error: null,
    requestId: null,
  },
  detail: {
    configurationId: null,
    row: null,
    loading: false,
    error: null,
    requestId: null,
  },
  create: {
    saving: false,
    error: null,
  },
  update: {
    saving: false,
    error: null,
  },
};

export const fetchProviderDiscountConfigurationList = createAsyncThunk<
  {
    providerId: string;
    rows: NormalizedProviderDiscountConfiguration[];
    totalRecords: number;
  },
  ProviderDiscountConfigurationListFilters,
  { rejectValue: string }
>(
  "providerDiscountConfiguration/fetchList",
  async (filters, { rejectWithValue }) => {
    const providerId = filters.providerId?.trim() ?? "";
    const result = await fetchProviderDiscountConfigurationListApi(filters);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return {
      providerId,
      rows: result.rows,
      totalRecords: result.totalRecords,
    };
  },
);

export const fetchProviderDiscountConfigurationById = createAsyncThunk<
  {
    configurationId: string;
    row: NormalizedProviderDiscountConfiguration;
  },
  string,
  { rejectValue: string; state: { providerDiscountConfiguration: ProviderDiscountConfigurationState } }
>(
  "providerDiscountConfiguration/fetchById",
  async (configurationId, { rejectWithValue }) => {
    const result = await fetchProviderDiscountConfigurationByIdApi(configurationId);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return {
      configurationId: result.row.providerDiscountConfigurationId,
      row: result.row,
    };
  },
);

export const createProviderDiscountConfiguration = createAsyncThunk<
  {
    row: NormalizedProviderDiscountConfiguration;
    message?: string;
  },
  { providerId: string; body: CreateProviderDiscountConfigurationBody },
  { rejectValue: string }
>(
  "providerDiscountConfiguration/create",
  async ({ providerId, body }, { rejectWithValue }) => {
    const result = await createProviderDiscountConfigurationApi(providerId, body);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return {
      row: result.row,
      message: result.message,
    };
  },
);

export const patchProviderDiscountConfiguration = createAsyncThunk<
  {
    row: NormalizedProviderDiscountConfiguration;
    message?: string;
  },
  { configurationId: string; body: PatchProviderDiscountConfigurationBody },
  { rejectValue: string }
>(
  "providerDiscountConfiguration/patch",
  async ({ configurationId, body }, { rejectWithValue }) => {
    const result = await patchProviderDiscountConfigurationApi(configurationId, body);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return {
      row: result.row,
      message: result.message,
    };
  },
);

const providerDiscountConfigurationSlice = createSlice({
  name: "providerDiscountConfiguration",
  initialState,
  reducers: {
    clearProviderDiscountConfigurationList: (state) => {
      state.list = { ...initialState.list };
    },
    clearProviderDiscountConfigurationDetail: (state) => {
      state.detail = { ...initialState.detail };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderDiscountConfigurationList.pending, (state, action) => {
        const nextProviderId = action.meta.arg.providerId?.trim() || state.list.providerId;
        if (state.list.providerId !== nextProviderId) {
          state.list.rows = [];
          state.list.totalRecords = 0;
        }
        state.list.loading = true;
        state.list.error = null;
        state.list.requestId = action.meta.requestId;
        state.list.providerId = nextProviderId;
      })
      .addCase(fetchProviderDiscountConfigurationList.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.loading = false;
        state.list.providerId = action.payload.providerId;
        state.list.rows = action.payload.rows;
        state.list.totalRecords = action.payload.totalRecords;
        state.list.error = null;
        state.list.requestId = null;
      })
      .addCase(fetchProviderDiscountConfigurationList.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.loading = false;
        state.list.rows = [];
        state.list.totalRecords = 0;
        state.list.error = action.payload ?? action.error.message ?? "";
        state.list.requestId = null;
      })
      .addCase(fetchProviderDiscountConfigurationById.pending, (state, action) => {
        state.detail.loading = true;
        state.detail.error = null;
        state.detail.requestId = action.meta.requestId;
        state.detail.configurationId = action.meta.arg.trim();
      })
      .addCase(fetchProviderDiscountConfigurationById.fulfilled, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.loading = false;
        state.detail.configurationId = action.payload.configurationId;
        state.detail.row = action.payload.row;
        state.detail.error = null;
        state.detail.requestId = null;
      })
      .addCase(fetchProviderDiscountConfigurationById.rejected, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.loading = false;
        state.detail.row = null;
        state.detail.error = action.payload ?? action.error.message ?? "";
        state.detail.requestId = null;
      })
      .addCase(createProviderDiscountConfiguration.pending, (state) => {
        state.create.saving = true;
        state.create.error = null;
      })
      .addCase(createProviderDiscountConfiguration.fulfilled, (state, action) => {
        state.create.saving = false;
        state.create.error = null;
        const { row } = action.payload;
        const existingIndex = state.list.rows.findIndex(
          (entry) =>
            entry.providerDiscountConfigurationId === row.providerDiscountConfigurationId,
        );
        if (existingIndex >= 0) {
          state.list.rows[existingIndex] = row;
        } else {
          state.list.rows = [row, ...state.list.rows];
          state.list.totalRecords += 1;
        }
      })
      .addCase(createProviderDiscountConfiguration.rejected, (state, action) => {
        state.create.saving = false;
        state.create.error = action.payload ?? action.error.message ?? "";
      })
      .addCase(patchProviderDiscountConfiguration.pending, (state) => {
        state.update.saving = true;
        state.update.error = null;
      })
      .addCase(patchProviderDiscountConfiguration.fulfilled, (state, action) => {
        state.update.saving = false;
        state.update.error = null;
        const { row } = action.payload;
        if (state.detail.configurationId === row.providerDiscountConfigurationId) {
          state.detail.row = row;
        }
        const existingIndex = state.list.rows.findIndex(
          (entry) =>
            entry.providerDiscountConfigurationId === row.providerDiscountConfigurationId,
        );
        if (existingIndex >= 0) {
          state.list.rows[existingIndex] = row;
        }
      })
      .addCase(patchProviderDiscountConfiguration.rejected, (state, action) => {
        state.update.saving = false;
        state.update.error = action.payload ?? action.error.message ?? "";
      });
  },
});

export const {
  clearProviderDiscountConfigurationList,
  clearProviderDiscountConfigurationDetail,
} = providerDiscountConfigurationSlice.actions;
export default providerDiscountConfigurationSlice.reducer;
