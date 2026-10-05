import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  FetchMbmDashboardParams,
  FetchMbmDashboardByIdParams,
  MbmDashboardItem,
  MbmDashboardResponse,
} from "./mbmDashboardTypes";
import {
  fetchMbmDashboardAPI,
  fetchMbmDashboardByIdAPI,
} from "./mbmDashboardAPI";
import { showErrorMessage } from "@/utils/errorHandler";

interface MbmDashboardState {
  dashboardList: MbmDashboardItem[];
  selectedItem: MbmDashboardItem | null;
  loading: boolean;
  loadingItem: boolean;
  totalRecords: number;
  error: string | null;
}

const initialState: MbmDashboardState = {
  dashboardList: [],
  selectedItem: null,
  loading: false,
  loadingItem: false,
  totalRecords: 0,
  error: null,
};

export const fetchMbmDashboard = createAsyncThunk(
  "mbmDashboard/fetch",
  async ({ page, size, queryObj }: FetchMbmDashboardParams = {}) => {
    return await fetchMbmDashboardAPI(page, size, queryObj);
  }
);

export const fetchMbmDashboardById = createAsyncThunk(
  "mbmDashboard/fetchById",
  async ({ id }: FetchMbmDashboardByIdParams) => {
    return await fetchMbmDashboardByIdAPI(id);
  }
);

const mbmDashboardSlice = createSlice({
  name: "mbmDashboard",
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchMbmDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMbmDashboard.fulfilled,
        (state, action: PayloadAction<MbmDashboardResponse>) => {
          state.dashboardList = action?.payload?.data || [];
          state.totalRecords = action.payload.pagination?.totalRecords || 0;
          state.loading = false;
        }
      )
      .addCase(fetchMbmDashboard.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.error.message || "Failed to fetch dashboard data";
        state.error = errorMessage;
        showErrorMessage(action.error, errorMessage);
      })
      // Fetch by ID
      .addCase(fetchMbmDashboardById.pending, (state) => {
        state.loadingItem = true;
        state.error = null;
      })
      .addCase(
        fetchMbmDashboardById.fulfilled,
        (state, action: PayloadAction<MbmDashboardItem>) => {
          state.selectedItem = action.payload;
          state.loadingItem = false;
        }
      )
      .addCase(fetchMbmDashboardById.rejected, (state, action) => {
        state.loadingItem = false;
        const errorMessage = action.error.message || "Failed to fetch item";
        state.error = errorMessage;
        showErrorMessage(action.error, errorMessage);
      });
  },
});

export const { clearSelectedItem } = mbmDashboardSlice.actions;
export default mbmDashboardSlice.reducer;

