import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  FetchMakerCheckersParams,
  FetchMakerCheckerByIdParams,
  ApplyChangesParams,
  ApprovalActionParams,
  SendChatMessageParams,
  MakerChecker,
  MakerCheckerResponse,
  ApplyChangesResponse,
  ApprovalResponse,
  ChatMessageResponse,
} from "./makerCheckerTypes";
import {
  fetchMakerCheckersAPI,
  fetchMakerCheckerByIdAPI,
  applyChangesMakerCheckerAPI,
  approvalActionMakerCheckerAPI,
  sendChatMessageAPI,
} from "./makerCheckerAPI";
import { showErrorMessage } from "@/utils/errorHandler";

interface MakerCheckerState {
  requestList: MakerChecker[];
  selectedRequest: MakerChecker | null;
  loading: boolean;
  loadingItem: boolean;
  applyingChanges: boolean;
  performingAction: boolean;
  sendingChatMessage: boolean;
  totalRecords: number;
  error: string | null;
}

const initialState: MakerCheckerState = {
  requestList: [],
  selectedRequest: null,
  loading: false,
  loadingItem: false,
  applyingChanges: false,
  performingAction: false,
  sendingChatMessage: false,
  totalRecords: 0,
  error: null,
};

// Fetch list with pagination and search
export const fetchMakerCheckers = createAsyncThunk(
  "makerChecker/fetch",
  async ({ page, size, queryObj }: FetchMakerCheckersParams = {}) => {
    return await fetchMakerCheckersAPI(page, size, queryObj);
  },
);

// Fetch by ID
export const fetchMakerCheckerById = createAsyncThunk(
  "makerChecker/fetchById",
  async ({ id }: FetchMakerCheckerByIdParams) => {
    return await fetchMakerCheckerByIdAPI(id);
  },
);

// Apply changes
export const applyChangesMakerChecker = createAsyncThunk(
  "makerChecker/applyChanges",
  async ({
    id,
    requestId,
    data,
    files,
  }: ApplyChangesParams) => {
    return await applyChangesMakerCheckerAPI(id, requestId, data, files);
  },
);

// Approval action (handles approve and reverse to maker based on action flag)
export const approvalActionMakerChecker = createAsyncThunk(
  "makerChecker/approvalAction",
  async ({ requestId, action, role, userId, userName }: ApprovalActionParams) => {
    return await approvalActionMakerCheckerAPI(requestId, action, role, userId, userName);
  },
);

// Send chat message
export const sendChatMessage = createAsyncThunk(
  "makerChecker/sendChatMessage",
  async (params: SendChatMessageParams) => {
    return await sendChatMessageAPI(params);
  },
);

const makerCheckerSlice = createSlice({
  name: "makerChecker",
  initialState,
  reducers: {
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchMakerCheckers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMakerCheckers.fulfilled,
        (state, action: PayloadAction<MakerCheckerResponse>) => {
          state.requestList = action.payload.data || [];
          state.totalRecords = action.payload.pagination?.totalRecords || 0;
          state.loading = false;
        },
      )
      .addCase(fetchMakerCheckers.rejected, (state, action) => {
        state.loading = false;
        const errorMessage =
          action.error.message || "Failed to fetch maker checker requests";
        state.error = errorMessage;
        showErrorMessage(action.error, errorMessage);
      })
      // Fetch by ID
      .addCase(fetchMakerCheckerById.pending, (state) => {
        state.loadingItem = true;
        state.error = null;
      })
      .addCase(
        fetchMakerCheckerById.fulfilled,
        (state, action: PayloadAction<MakerChecker>) => {
          state.selectedRequest = action.payload;
          state.loadingItem = false;
        },
      )
      .addCase(fetchMakerCheckerById.rejected, (state, action) => {
        state.loadingItem = false;
        const errorMessage =
          action.error.message || "Failed to fetch maker checker request";
        state.error = errorMessage;
        showErrorMessage(action.error, errorMessage);
      })
      // Apply changes
      .addCase(applyChangesMakerChecker.pending, (state) => {
        state.applyingChanges = true;
        state.error = null;
      })
      .addCase(
        applyChangesMakerChecker.fulfilled,
        (state, action: PayloadAction<ApplyChangesResponse>) => {
          // Update the request in the list if it exists
          if (action.payload.data) {
            const index = state.requestList.findIndex(
              (r) => r.id === action.payload.data?.id,
            );
            if (index !== -1) {
              state.requestList[index] = action.payload.data;
            }
            // Update selected request if it's the same one
            if (state.selectedRequest?.id === action.payload.data.id) {
              state.selectedRequest = action.payload.data;
            }
          }
          state.applyingChanges = false;
        },
      )
      .addCase(applyChangesMakerChecker.rejected, (state, action) => {
        state.applyingChanges = false;
        const errorMessage = action.error.message || "Failed to apply changes";
        state.error = errorMessage;
        showErrorMessage(action.error, errorMessage);
      })
      // Approval action (approve/reverse to maker)
      .addCase(approvalActionMakerChecker.pending, (state) => {
        state.performingAction = true;
        state.error = null;
      })
      .addCase(
        approvalActionMakerChecker.fulfilled,
        (state, action: PayloadAction<ApprovalResponse>) => {
          // Update the request in the list if it exists
          if (action.payload.data) {
            const index = state.requestList.findIndex(
              (r) => r.id === action.payload.data?.id,
            );
            if (index !== -1) {
              state.requestList[index] = action.payload.data;
            }
            // Update selected request if it's the same one
            if (state.selectedRequest?.id === action.payload.data.id) {
              state.selectedRequest = action.payload.data;
            }
          }
          state.performingAction = false;
        },
      )
      .addCase(approvalActionMakerChecker.rejected, (state, action) => {
        state.performingAction = false;
        const errorMessage =
          action.error.message || "Failed to perform approval action";
        state.error = errorMessage;
        showErrorMessage(action.error, errorMessage);
      })
      // Send chat message
      .addCase(sendChatMessage.pending, (state) => {
        state.sendingChatMessage = true;
        state.error = null;
      })
      .addCase(
        sendChatMessage.fulfilled,
        (state, action: PayloadAction<ChatMessageResponse>) => {
          state.sendingChatMessage = false;
        },
      )
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sendingChatMessage = false;
        const errorMessage = action.error.message || "Failed to send chat message";
        state.error = errorMessage;
        showErrorMessage(action.error, errorMessage);
      });
  },
});

export const { clearSelectedRequest, clearError } = makerCheckerSlice.actions;
export default makerCheckerSlice.reducer;

