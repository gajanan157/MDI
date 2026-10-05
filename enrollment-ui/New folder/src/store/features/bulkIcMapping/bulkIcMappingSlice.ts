import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  downloadBulkIcMappingErrorFileApi,
  downloadBulkIcMappingInwardFileApi,
  fetchBulkIcMappingInwardsApi,
  fetchProviderJobStatusApi,
  fetchStagingProviderInsurerListApi,
  type FetchBulkIcMappingInwardsParams,
  type FetchStagingProviderInsurerParams,
} from "./bulkIcMappingAPI";

type BulkIcMappingState = {
  inwardLoading: boolean;
  stagingLoading: boolean;
  jobStatusLoading: boolean;
  downloadLoading: boolean;
  error: string | null;
};

const initialState: BulkIcMappingState = {
  inwardLoading: false,
  stagingLoading: false,
  jobStatusLoading: false,
  downloadLoading: false,
  error: null,
};

export const fetchBulkIcMappingInwards = createAsyncThunk(
  "bulkIcMapping/fetchInwards",
  async (params: FetchBulkIcMappingInwardsParams, { rejectWithValue }) => {
    const result = await fetchBulkIcMappingInwardsApi(params);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return result;
  },
);

export const fetchStagingProviderInsurerList = createAsyncThunk(
  "bulkIcMapping/fetchStagingList",
  async (params: FetchStagingProviderInsurerParams, { rejectWithValue }) => {
    const result = await fetchStagingProviderInsurerListApi(params);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return result;
  },
);

export const fetchProviderJobStatus = createAsyncThunk(
  "bulkIcMapping/fetchJobStatus",
  async (inwardNo: string, { rejectWithValue }) => {
    const result = await fetchProviderJobStatusApi(inwardNo);
    if (!result.ok) {
      return rejectWithValue({
        message: result.message ?? "",
        stopPolling: result.stopPolling,
      });
    }
    return result.job;
  },
);

export const downloadBulkIcMappingInwardFile = createAsyncThunk(
  "bulkIcMapping/downloadInwardFile",
  async (inwardNo: string, { rejectWithValue }) => {
    const result = await downloadBulkIcMappingInwardFileApi(inwardNo);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return true;
  },
);

export const downloadBulkIcMappingErrorFile = createAsyncThunk(
  "bulkIcMapping/downloadErrorFile",
  async (inwardNo: string, { rejectWithValue }) => {
    const result = await downloadBulkIcMappingErrorFileApi(inwardNo);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return true;
  },
);

const bulkIcMappingSlice = createSlice({
  name: "bulkIcMapping",
  initialState,
  reducers: {
    clearBulkIcMappingError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBulkIcMappingInwards.pending, (state) => {
        state.inwardLoading = true;
        state.error = null;
      })
      .addCase(fetchBulkIcMappingInwards.fulfilled, (state) => {
        state.inwardLoading = false;
      })
      .addCase(fetchBulkIcMappingInwards.rejected, (state, action) => {
        state.inwardLoading = false;
        state.error = String(action.payload ?? action.error.message ?? "");
      })
      .addCase(fetchStagingProviderInsurerList.pending, (state) => {
        state.stagingLoading = true;
        state.error = null;
      })
      .addCase(fetchStagingProviderInsurerList.fulfilled, (state) => {
        state.stagingLoading = false;
      })
      .addCase(fetchStagingProviderInsurerList.rejected, (state, action) => {
        state.stagingLoading = false;
        state.error = String(action.payload ?? action.error.message ?? "");
      })
      .addCase(fetchProviderJobStatus.pending, (state) => {
        state.jobStatusLoading = true;
        state.error = null;
      })
      .addCase(fetchProviderJobStatus.fulfilled, (state) => {
        state.jobStatusLoading = false;
      })
      .addCase(fetchProviderJobStatus.rejected, (state, action) => {
        state.jobStatusLoading = false;
        state.error = String(
          (action.payload as { message?: string } | undefined)?.message ??
            action.error.message ??
            "",
        );
      })
      .addCase(downloadBulkIcMappingInwardFile.pending, (state) => {
        state.downloadLoading = true;
        state.error = null;
      })
      .addCase(downloadBulkIcMappingInwardFile.fulfilled, (state) => {
        state.downloadLoading = false;
      })
      .addCase(downloadBulkIcMappingInwardFile.rejected, (state, action) => {
        state.downloadLoading = false;
        state.error = String(action.payload ?? action.error.message ?? "");
      })
      .addCase(downloadBulkIcMappingErrorFile.pending, (state) => {
        state.downloadLoading = true;
        state.error = null;
      })
      .addCase(downloadBulkIcMappingErrorFile.fulfilled, (state) => {
        state.downloadLoading = false;
      })
      .addCase(downloadBulkIcMappingErrorFile.rejected, (state, action) => {
        state.downloadLoading = false;
        state.error = String(action.payload ?? action.error.message ?? "");
      });
  },
});

export const { clearBulkIcMappingError } = bulkIcMappingSlice.actions;
export default bulkIcMappingSlice.reducer;
