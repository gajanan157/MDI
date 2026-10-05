import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createProviderOwner as createProviderOwnerApi,
  fetchProviderOwnerById as fetchProviderOwnerByIdApi,
  fetchProviderOwnerList as fetchProviderOwnerListApi,
  patchProviderOwner as patchProviderOwnerApi,
} from "./providerOwnerAPI";
import type {
  CreateProviderOwnerBody,
  NormalizedProviderOwner,
  PatchProviderOwnerBody,
  ProviderOwnerListFilters,
  ProviderOwnerRejectPayload,
  ProviderOwnerState,
} from "./providerOwnerTypes";

const initialState: ProviderOwnerState = {
  list: {
    providerId: null,
    rows: [],
    loading: false,
    error: null,
  },
  detail: {
    providerId: null,
    ownerId: null,
    row: null,
    loading: false,
    error: null,
  },
  mutate: {
    saving: false,
    error: null,
  },
};

function toRejectPayload(
  message?: string,
  status?: number,
): ProviderOwnerRejectPayload {
  return { message: message ?? "", status };
}

function rejectMessage(payload: ProviderOwnerRejectPayload | undefined, fallback?: string): string {
  return payload?.message || fallback || "";
}

export const fetchProviderOwnerList = createAsyncThunk<
  { providerId: string; rows: NormalizedProviderOwner[] },
  { providerId: string; filters?: ProviderOwnerListFilters },
  { rejectValue: ProviderOwnerRejectPayload }
>("providerOwner/fetchList", async ({ providerId, filters }, { rejectWithValue }) => {
  const result = await fetchProviderOwnerListApi(providerId, filters);
  if (!result.ok) {
    return rejectWithValue(toRejectPayload(result.message, result.status));
  }

  return { providerId, rows: result.rows };
});

export const fetchProviderOwnerById = createAsyncThunk<
  { providerId: string; ownerId: string; row: NormalizedProviderOwner },
  { providerId: string; ownerId: string },
  { rejectValue: ProviderOwnerRejectPayload }
>("providerOwner/fetchById", async ({ providerId, ownerId }, { rejectWithValue }) => {
  const result = await fetchProviderOwnerByIdApi(providerId, ownerId);
  if (!result.ok) {
    return rejectWithValue(toRejectPayload(result.message, result.status));
  }

  return { providerId, ownerId, row: result.row };
});

export const createProviderOwner = createAsyncThunk<
  { message?: string },
  { providerId: string; body: CreateProviderOwnerBody },
  { rejectValue: ProviderOwnerRejectPayload }
>("providerOwner/create", async ({ providerId, body }, { rejectWithValue }) => {
  const result = await createProviderOwnerApi(providerId, body);
  if (!result.ok) {
    return rejectWithValue(toRejectPayload(result.message, result.status));
  }

  return { message: result.message };
});

export const patchProviderOwner = createAsyncThunk<
  { message?: string },
  { providerId: string; body: PatchProviderOwnerBody },
  { rejectValue: ProviderOwnerRejectPayload }
>("providerOwner/patch", async ({ providerId, body }, { rejectWithValue }) => {
  const result = await patchProviderOwnerApi(providerId, body);
  if (!result.ok) {
    return rejectWithValue(toRejectPayload(result.message, result.status));
  }

  return { message: result.message };
});

const providerOwnerSlice = createSlice({
  name: "providerOwner",
  initialState,
  reducers: {
    clearProviderOwner(state) {
      state.list = initialState.list;
      state.detail = initialState.detail;
      state.mutate = initialState.mutate;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderOwnerList.pending, (state, action) => {
        state.list.loading = true;
        state.list.error = null;
        state.list.providerId = action.meta.arg.providerId;
      })
      .addCase(fetchProviderOwnerList.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.rows = action.payload.rows;
      })
      .addCase(fetchProviderOwnerList.rejected, (state, action) => {
        state.list.loading = false;
        state.list.rows = [];
        state.list.error = rejectMessage(action.payload, action.error.message);
      })
      .addCase(fetchProviderOwnerById.pending, (state, action) => {
        state.detail.loading = true;
        state.detail.error = null;
        state.detail.providerId = action.meta.arg.providerId;
        state.detail.ownerId = action.meta.arg.ownerId;
      })
      .addCase(fetchProviderOwnerById.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.row = action.payload.row;
      })
      .addCase(fetchProviderOwnerById.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.row = null;
        state.detail.error = rejectMessage(action.payload, action.error.message);
      })
      .addCase(createProviderOwner.pending, (state) => {
        state.mutate.saving = true;
        state.mutate.error = null;
      })
      .addCase(createProviderOwner.fulfilled, (state) => {
        state.mutate.saving = false;
      })
      .addCase(createProviderOwner.rejected, (state, action) => {
        state.mutate.saving = false;
        state.mutate.error = rejectMessage(action.payload, action.error.message);
      })
      .addCase(patchProviderOwner.pending, (state) => {
        state.mutate.saving = true;
        state.mutate.error = null;
      })
      .addCase(patchProviderOwner.fulfilled, (state) => {
        state.mutate.saving = false;
      })
      .addCase(patchProviderOwner.rejected, (state, action) => {
        state.mutate.saving = false;
        state.mutate.error = rejectMessage(action.payload, action.error.message);
      });
  },
});

export const { clearProviderOwner } = providerOwnerSlice.actions;

export default providerOwnerSlice.reducer;
