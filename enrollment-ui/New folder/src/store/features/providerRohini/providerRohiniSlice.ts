import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  buildRohiniExcelDownloadParams,
  buildRohiniMasterQueryParams,
  downloadProviderRohiniMasterExcel,
  extractMessageFromRegisterResponse,
  extractRohiniAdditionalData,
  extractRohiniListFromEnvelope,
  getProviderRohiniMasterDetail,
  getProviderRohiniMasterList,
  mapRohiniApiItemToRow,
  parseRohiniValidateResponse,
  postProviderRohiniMasterRegisterUpload,
  postProviderRohiniMasterValidate,
} from "./providerRohiniAPI";
import { downloadBlobFile } from "@/utils/dom/downloadBlobFile";
import type {
  ProviderRohiniState,
  RohiniListFilters,
  RohiniValidateUploadPayload,
} from "./providerRohiniTypes";

/** Args for `fetchRohiniList` — `countExpiringInDays` is a request flag, not the API count. */
export type FetchRohiniListArgs = {
  page: number;
  size: number;
  filters: RohiniListFilters;
  countExpiringInDays?: boolean;
};

export const fetchRohiniList = createAsyncThunk(
  "providerRohini/fetchList",
  async (args: FetchRohiniListArgs) => {
    const apiPage = Math.max(0, args.page - 1);
    const params = buildRohiniMasterQueryParams(
      apiPage,
      args.size,
      false,
      args.filters,
      args.countExpiringInDays,
    );

    const body = await getProviderRohiniMasterList(params);

    const { items, totalItems: extractedTotal } =
      extractRohiniListFromEnvelope(body);
    const rows = items.map((item, index) => mapRohiniApiItemToRow(item, index));
    const totalItems =
      extractedTotal > 0 ? extractedTotal : rows.length > 0 ? rows.length : 0;

    const { inwardNos, countExpiringInDays } =
      extractRohiniAdditionalData(body);

    return { rows, totalItems, inwardNos, countExpiringInDays };
  },
);

export const fetchRohiniDetail = createAsyncThunk(
  "providerRohini/fetchDetail",
  async (id: string) => {
    const envelope = await getProviderRohiniMasterDetail(id);
    return mapRohiniApiItemToRow(envelope.data, 0);
  },
);

export const exportRohiniMaster = createAsyncThunk(
  "providerRohini/export",
  async (args: {
    filters: RohiniListFilters;
    countExpiringInDays?: boolean;
  }) => {
    const params = buildRohiniExcelDownloadParams(
      args.filters,
      args.countExpiringInDays,
    );
    const blob = await downloadProviderRohiniMasterExcel(params);
    downloadBlobFile({ blob, filename: "rohini-master-export.xlsx" });
  },
);

export const registerRohiniMasterUpload = createAsyncThunk<
  unknown,
  { inwardNo: string; fileMetadataId: string },
  { rejectValue: string }
>("providerRohini/registerUpload", async (args, { rejectWithValue }) => {
  try {
    const data = await postProviderRohiniMasterRegisterUpload(
      args.inwardNo,
      args.fileMetadataId,
    );
    if (data && typeof data === "object" && data.success === false) {
      return rejectWithValue(
        extractMessageFromRegisterResponse(data) ??
          "Rohini register upload failed",
      );
    }
    return data;
  } catch (e: unknown) {
    const err = e as {
      response?: { data?: unknown };
      message?: string;
    };
    const fromBody = extractMessageFromRegisterResponse(err.response?.data);
    return rejectWithValue(
      fromBody ??
        (typeof err.message === "string" && err.message.trim()
          ? err.message.trim()
          : undefined) ??
        "Failed to register Rohini document upload",
    );
  }
});

export const validateRohiniUpload = createAsyncThunk<
  RohiniValidateUploadPayload,
  string,
  { rejectValue: string }
>("providerRohini/validateUpload", async (inwardNo, { rejectWithValue }) => {
  try {
    const data = await postProviderRohiniMasterValidate(inwardNo);

    if (data?.success === false) {
      return rejectWithValue(data.message ?? "Validation failed");
    }

    return parseRohiniValidateResponse(data);
  } catch (e: unknown) {
    const err = e as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return rejectWithValue(
      err.response?.data?.message ?? err.message ?? "Validation failed",
    );
  }
});

const initialState: ProviderRohiniState = {
  rows: [],
  totalItems: 0,
  inwardNos: [],
  countExpiringInDays: null,
  loading: false,
  exportLoading: false,
  validateLoading: false,
  error: null,
};

const providerRohiniSlice = createSlice({
  name: "providerRohini",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRohiniList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRohiniList.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows;
        state.totalItems = action.payload.totalItems;
        state.inwardNos = action.payload.inwardNos;
        state.countExpiringInDays = action.payload.countExpiringInDays;
      })
      .addCase(fetchRohiniList.rejected, (state, action) => {
        state.loading = false;
        state.rows = [];
        state.totalItems = 0;
        state.inwardNos = [];
        state.countExpiringInDays = null;
        state.error = action.error.message ?? "Failed to fetch Rohini list";
      })
      .addCase(exportRohiniMaster.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportRohiniMaster.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportRohiniMaster.rejected, (state) => {
        state.exportLoading = false;
      })
      .addCase(validateRohiniUpload.pending, (state) => {
        state.validateLoading = true;
        state.error = null;
      })
      .addCase(validateRohiniUpload.fulfilled, (state) => {
        state.validateLoading = false;
      })
      .addCase(validateRohiniUpload.rejected, (state, action) => {
        state.validateLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.error.message ?? "Validation failed");
      });
  },
});

export default providerRohiniSlice.reducer;

export type {
  ProviderRohiniRow,
  RohiniInwardNoItem,
  RohiniRegisterUploadApiBody,
  RohiniValidateUploadPayload,
} from "./providerRohiniTypes";

export {
  extractDownloadUrlFromRegisterResponse,
  extractErrorFileNameFromRegisterResponse,
  extractFileMetadataIdFromScanUpload,
  extractInwardNoFromScanUpload,
  extractMessageFromRegisterResponse,
} from "./providerRohiniAPI";
