import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isUnfilteredProviderAgreementListRequest } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/utils/providerAgreementHelpers";
import type { CreateProviderAgreementBody } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/providerAgreementSave";
import {
  createProviderAgreement as createProviderAgreementApi,
  fetchProviderAgreementById as fetchProviderAgreementByIdApi,
  fetchProviderAgreementList as fetchProviderAgreementListApi,
  fetchProviderCheckPpnStateCity as fetchProviderCheckPpnStateCityApi,
  fetchProviderCheckPpnValidation as fetchProviderCheckPpnValidationApi,
  fetchProviderGipsaPpnCityOptionsApi,
  fetchProviderGipsaPpnStateOptionsApi,
  patchProviderAgreement as patchProviderAgreementApi,
} from "./providerAgreementAPI";
import type { PatchProviderAgreementBody } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/providerAgreementSave";
import type {
  GipsaPpnDropdownOption,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/agreement/utils/agreementGipsaPpnNormalizer";
import type {
  NormalizedCheckPpnStateCity,
  NormalizedProviderAgreement,
  ProviderAgreementListFilters,
  ProviderAgreementState,
} from "./providerAgreementTypes";

const PROVIDER_AGREEMENT_TYPE_SUMMARY_FILTERS: ProviderAgreementListFilters = {
  page: 1,
  size: 100,
};

function refreshProviderAgreementTypeSummary(
  dispatch: (action: ReturnType<typeof fetchProviderAgreementList>) => unknown,
  providerId: string,
) {
  return dispatch(
    fetchProviderAgreementList({
      providerId,
      filters: PROVIDER_AGREEMENT_TYPE_SUMMARY_FILTERS,
    }),
  );
}

const initialState: ProviderAgreementState = {
  list: {
    providerId: null,
    rows: [],
    totalRecords: 0,
    loading: false,
    error: null,
    listMessage: null,
    requestId: null,
  },
  detail: {
    providerId: null,
    agreementId: null,
    row: null,
    loading: false,
    error: null,
    requestId: null,
  },
  summary: {
    providerId: null,
    typeLabels: [],
    loading: false,
  },
  create: {
    saving: false,
    error: null,
  },
  ppnCheck: {
    providerId: null,
    data: null,
    loading: false,
    error: null,
  },
};

function uniqueAgreementTypeLabels(names: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];

  names.forEach((name) => {
    const trimmed = name.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    labels.push(trimmed);
  });

  return labels;
}

export const fetchProviderAgreementList = createAsyncThunk<
  {
    providerId: string;
    rows: NormalizedProviderAgreement[];
    totalRecords: number;
    listMessage?: string;
  },
  { providerId: string; filters?: ProviderAgreementListFilters },
  { rejectValue: string }
>(
  "providerAgreement/fetchList",
  async ({ providerId, filters }, { rejectWithValue }) => {
    const result = await fetchProviderAgreementListApi(providerId, filters);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }

    return {
      providerId,
      rows: result.rows,
      totalRecords: result.totalRecords,
      listMessage: result.listMessage,
    };
  },
);

export const fetchProviderAgreementById = createAsyncThunk<
  {
    providerId: string;
    agreementId: string;
    row: NormalizedProviderAgreement;
  },
  { providerId: string; agreementId: string },
  { rejectValue: string; state: { providerAgreement: ProviderAgreementState } }
>(
  "providerAgreement/fetchById",
  async ({ providerId, agreementId }, { rejectWithValue }) => {
    const result = await fetchProviderAgreementByIdApi(providerId, agreementId);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }

    return {
      providerId,
      agreementId,
      row: result.row,
    };
  },
  {
    condition: ({ providerId, agreementId }, { getState }) => {
      const detail = getState().providerAgreement.detail;
      // Skip duplicate in-flight request for the same agreement.
      return !(
        detail.loading &&
        detail.providerId === providerId &&
        detail.agreementId === agreementId
      );
    },
  },
);

export type ProviderAgreementMutationRejectValue = {
  message: string;
  status?: number;
};

export const createProviderAgreement = createAsyncThunk<
  { message?: string; data?: NormalizedProviderAgreement },
  { providerId: string; body: CreateProviderAgreementBody },
  { rejectValue: ProviderAgreementMutationRejectValue }
>(
  "providerAgreement/create",
  async ({ providerId, body }, { dispatch, rejectWithValue }) => {
    const result = await createProviderAgreementApi(providerId, body);
    if (!result.ok) {
      return rejectWithValue({
        message: result.message ?? "",
        status: result.status,
      });
    }

    await refreshProviderAgreementTypeSummary(dispatch, providerId);

    return { message: result.message, data: result.data };
  },
);

export const updateProviderAgreement = createAsyncThunk<
  { message?: string },
  { providerId: string; body: PatchProviderAgreementBody },
  { rejectValue: ProviderAgreementMutationRejectValue }
>(
  "providerAgreement/update",
  async ({ providerId, body }, { dispatch, rejectWithValue }) => {
    const result = await patchProviderAgreementApi(providerId, body);
    if (!result.ok) {
      return rejectWithValue({
        message: result.message ?? "",
        status: result.status,
      });
    }

    await refreshProviderAgreementTypeSummary(dispatch, providerId);

    return { message: result.message };
  },
);

export const fetchProviderCheckPpnStateCity = createAsyncThunk<
  { providerId: string; data: NormalizedCheckPpnStateCity },
  { providerId: string; validationOnly?: boolean },
  { rejectValue: string }
>(
  "providerAgreement/fetchCheckPpnStateCity",
  async ({ providerId, validationOnly = false }, { rejectWithValue }) => {
    if (validationOnly) {
      const validationResult = await fetchProviderCheckPpnValidationApi(providerId);
      if (!validationResult.ok) {
        return rejectWithValue(validationResult.message);
      }

      return {
        providerId,
        data: validationResult.data,
      };
    }

    const result = await fetchProviderCheckPpnStateCityApi(providerId);
    if (!result.ok) {
      return rejectWithValue(result.message);
    }

    return {
      providerId,
      data: result.data,
    };
  },
);

export const fetchProviderGipsaPpnStateOptions = createAsyncThunk<
  { options: GipsaPpnDropdownOption[] },
  string,
  { rejectValue: string }
>(
  "providerAgreement/fetchGipsaPpnStateOptions",
  async (providerGipsaPpnStateName, { rejectWithValue }) => {
    const result = await fetchProviderGipsaPpnStateOptionsApi(providerGipsaPpnStateName);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return { options: result.options };
  },
);

export const fetchProviderGipsaPpnCityOptions = createAsyncThunk<
  { options: GipsaPpnDropdownOption[] },
  string,
  { rejectValue: string }
>(
  "providerAgreement/fetchGipsaPpnCityOptions",
  async (providerGipsaPpnCityName, { rejectWithValue }) => {
    const result = await fetchProviderGipsaPpnCityOptionsApi(providerGipsaPpnCityName);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return { options: result.options };
  },
);

const providerAgreementSlice = createSlice({
  name: "providerAgreement",
  initialState,
  reducers: {
    clearProviderAgreement(state) {
      state.list = initialState.list;
      state.detail = initialState.detail;
      state.summary = initialState.summary;
      state.create = initialState.create;
      state.ppnCheck = initialState.ppnCheck;
    },
    clearProviderAgreementPpnCheck(state) {
      state.ppnCheck = initialState.ppnCheck;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderAgreementList.pending, (state, action) => {
        state.list.loading = true;
        state.list.error = null;
        state.list.providerId = action.meta.arg.providerId;
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchProviderAgreementList.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.loading = false;
        state.list.rows = action.payload.rows;
        state.list.totalRecords = action.payload.totalRecords;
        state.list.listMessage = action.payload.listMessage ?? null;

        if (isUnfilteredProviderAgreementListRequest(action.meta.arg.filters)) {
          state.summary.providerId = action.payload.providerId;
          state.summary.typeLabels = uniqueAgreementTypeLabels(
            action.payload.rows.map((row) => row.providerAgreementName),
          );
          state.summary.loading = false;
        }
      })
      .addCase(fetchProviderAgreementList.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.loading = false;
        state.list.rows = [];
        state.list.totalRecords = 0;
        state.list.listMessage = null;
        state.list.error = action.payload ?? action.error.message ?? "";
      })
      .addCase(fetchProviderAgreementById.pending, (state, action) => {
        state.detail.loading = true;
        state.detail.error = null;
        state.detail.providerId = action.meta.arg.providerId;
        state.detail.agreementId = action.meta.arg.agreementId;
        state.detail.requestId = action.meta.requestId;
        state.detail.row = null;
      })
      .addCase(fetchProviderAgreementById.fulfilled, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.loading = false;
        state.detail.row = action.payload.row;
      })
      .addCase(fetchProviderAgreementById.rejected, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.loading = false;
        state.detail.row = null;
        state.detail.error = action.payload ?? action.error.message ?? "";
      })
      .addCase(createProviderAgreement.pending, (state) => {
        state.create.saving = true;
        state.create.error = null;
      })
      .addCase(createProviderAgreement.fulfilled, (state) => {
        state.create.saving = false;
      })
      .addCase(createProviderAgreement.rejected, (state, action) => {
        state.create.saving = false;
        state.create.error =
          action.payload?.message ?? action.error.message ?? "";
      })
      .addCase(updateProviderAgreement.pending, (state) => {
        state.create.saving = true;
        state.create.error = null;
      })
      .addCase(updateProviderAgreement.fulfilled, (state) => {
        state.create.saving = false;
      })
      .addCase(updateProviderAgreement.rejected, (state, action) => {
        state.create.saving = false;
        state.create.error =
          action.payload?.message ?? action.error.message ?? "";
      })
      .addCase(fetchProviderCheckPpnStateCity.pending, (state, action) => {
        state.ppnCheck.loading = true;
        state.ppnCheck.error = null;
        state.ppnCheck.providerId = action.meta.arg.providerId;
        state.ppnCheck.data = null;
      })
      .addCase(fetchProviderCheckPpnStateCity.fulfilled, (state, action) => {
        state.ppnCheck.loading = false;
        state.ppnCheck.data = action.payload.data;
      })
      .addCase(fetchProviderCheckPpnStateCity.rejected, (state, action) => {
        state.ppnCheck.loading = false;
        state.ppnCheck.data = null;
        state.ppnCheck.error = action.payload ?? action.error.message ?? "";
      });
  },
});

export const { clearProviderAgreement, clearProviderAgreementPpnCheck } =
  providerAgreementSlice.actions;

export default providerAgreementSlice.reducer;
