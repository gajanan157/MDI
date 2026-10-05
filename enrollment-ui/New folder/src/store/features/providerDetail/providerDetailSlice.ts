import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ProviderAuditLogTabId } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/shared/providerAuditLog";
import {
  fetchCertificateTypeOptionsApi,
  fetchProviderAuditLogApi,
} from "./providerDetailAPI";
import type { ProviderDetailState } from "./providerDetailTypes";

const initialState: ProviderDetailState = {
  certificateTypeOptions: [],
  certificateTypesLoading: false,
  certificateTypesError: null,
  auditLog: {
    providerId: null,
    tabId: null,
    rows: [],
    loading: false,
    error: null,
  },
};

export const fetchCertificateTypeOptions = createAsyncThunk(
  "providerDetail/fetchCertificateTypeOptions",
  async () => fetchCertificateTypeOptionsApi(),
);

export const fetchProviderAuditLog = createAsyncThunk(
  "providerDetail/fetchProviderAuditLog",
  async ({
    providerId,
    tabId,
  }: {
    providerId: string;
    tabId: ProviderAuditLogTabId;
  }) => ({
    providerId,
    tabId,
    rows: await fetchProviderAuditLogApi(providerId, tabId),
  }),
);

const providerDetailSlice = createSlice({
  name: "providerDetail",
  initialState,
  reducers: {
    clearProviderAuditLog(state) {
      state.auditLog = initialState.auditLog;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificateTypeOptions.pending, (state) => {
        state.certificateTypesLoading = true;
        state.certificateTypesError = null;
      })
      .addCase(fetchCertificateTypeOptions.fulfilled, (state, action) => {
        state.certificateTypesLoading = false;
        state.certificateTypeOptions = action.payload;
      })
      .addCase(fetchCertificateTypeOptions.rejected, (state, action) => {
        state.certificateTypesLoading = false;
        state.certificateTypeOptions = [];
        state.certificateTypesError = action.error.message ?? "";
      })
      .addCase(fetchProviderAuditLog.pending, (state, action) => {
        state.auditLog.loading = true;
        state.auditLog.error = null;
        state.auditLog.providerId = action.meta.arg.providerId;
        state.auditLog.tabId = action.meta.arg.tabId;
      })
      .addCase(fetchProviderAuditLog.fulfilled, (state, action) => {
        state.auditLog.loading = false;
        state.auditLog.rows = action.payload.rows;
      })
      .addCase(fetchProviderAuditLog.rejected, (state, action) => {
        state.auditLog.loading = false;
        state.auditLog.rows = [];
        state.auditLog.error = action.error.message ?? "";
      });
  },
});

export const { clearProviderAuditLog } = providerDetailSlice.actions;
export default providerDetailSlice.reducer;
