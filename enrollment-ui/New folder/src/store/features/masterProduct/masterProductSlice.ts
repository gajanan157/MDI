import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  FetchMasterProductsParams,
  FetchMasterProductByIdParams,
  ApplyChangesParams,
  ApproveProductParams,
  FetchMasterProductDocumentsParams,
  CreateMasterProductParams,
  MasterProduct,
  MasterProductResponse,
  ApplyChangesResponse,
  ApproveProductResponse,
  FetchMasterProductDocumentsResponse,
  MasterProductDocument,
  MasterProductRemark,
  MasterProductRemarksResponse,
} from "./masterProductTypes";
import {
  fetchMasterProductsAPI,
  fetchMasterProductByIdAPI,
  applyChangesMasterProductAPI,
  approveMasterProductAPI,
  fetchMasterProductDocumentsAPI,
  createMasterProductAPI,
  fetchMasterProductRemarksAPI,
  sendMasterProductRemarkAPI,
} from "./masterProductAPI";

/* ------------------------------------------------------------------ */
/* STATE */
/* ------------------------------------------------------------------ */
interface MasterProductState {
  productList: MasterProduct[];
  selectedProduct: MasterProduct | null;
  loading: boolean;
  loadingItem: boolean;
  applyingChanges: boolean;
  approving: boolean;
  creating: boolean;
  totalRecords: number;
  error: string | null;
  documents: MasterProductDocument[];
  loadingDocuments: boolean;
  remarks: MasterProductRemark[];
  loadingRemarks: boolean;
  sendingRemark: boolean;
  remarksPagination: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    recordPerPage: number;
  } | null;
}

const initialState: MasterProductState = {
  productList: [],
  selectedProduct: null,
  loading: false,
  loadingItem: false,
  applyingChanges: false,
  approving: false,
  creating: false,
  totalRecords: 0,
  error: null,
  documents: [],
  loadingDocuments: false,
  remarks: [],
  loadingRemarks: false,
  sendingRemark: false,
  remarksPagination: null,
};

/* ------------------------------------------------------------------ */
/* THUNKS */
/* ------------------------------------------------------------------ */

export const fetchMasterProducts = createAsyncThunk(
  "masterProduct/fetch",
  async ({ page, size, queryObj }: FetchMasterProductsParams = {}) =>
    fetchMasterProductsAPI(page, size, queryObj),
);

export const fetchMasterProductById = createAsyncThunk(
  "masterProduct/fetchById",
  async ({ id }: FetchMasterProductByIdParams) => fetchMasterProductByIdAPI(id),
);

export const applyChangesMasterProduct = createAsyncThunk(
  "masterProduct/applyChanges",
  async ({ id, masterProductJson, documents, documentType }: ApplyChangesParams) => {
    const result = await applyChangesMasterProductAPI(id, masterProductJson, documents, documentType);
    return result;
  },
);

export const approveMasterProduct = createAsyncThunk(
  "masterProduct/approve",
  async ({ id, productId }: ApproveProductParams) =>
    approveMasterProductAPI(id, productId),
);

export const fetchMasterProductDocuments = createAsyncThunk(
  "masterProduct/fetchDocuments",
  async ({ id }: FetchMasterProductDocumentsParams) =>
    fetchMasterProductDocumentsAPI(id),
);

export const createMasterProduct = createAsyncThunk(
  "masterProduct/create",
  async (params: CreateMasterProductParams, { rejectWithValue }) => {
    const res = await createMasterProductAPI(params);
    if (!res.success || !res.data) {
      return rejectWithValue({
        status: res.status,
        message: res.message,
        error: res.error,
        errorPayload: res.errorPayload,
      });
    }
    return res.data;
  },
);

export const fetchMasterProductRemarks = createAsyncThunk(
  "masterProduct/fetchRemarks",
  async ({
    id,
    page,
    size,
  }: {
    id: string;
    page?: number;
    size?: number;
  }) => fetchMasterProductRemarksAPI(id, page, size),
);

export const sendMasterProductRemark = createAsyncThunk(
  "masterProduct/sendRemark",
  async (params: {
    id: string;
    message: string;
    userId?: string;
    userName?: string;
  }) => sendMasterProductRemarkAPI(params),
);

/* ------------------------------------------------------------------ */
/* SLICE */
/* ------------------------------------------------------------------ */

const masterProductSlice = createSlice({
  name: "masterProduct",
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.documents = [];
      state.remarks = [];
      state.remarksPagination = null;
      state.error = null;
    },
    clearDocuments: (state) => {
      state.documents = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------------- FETCH LIST ---------------- */
      .addCase(fetchMasterProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMasterProducts.fulfilled,
        (state, action: PayloadAction<MasterProductResponse>) => {
          state.productList = action.payload?.data ?? [];
          state.totalRecords = action.payload?.pagination?.totalRecords ?? 0;
          state.loading = false;
        },
      )
      .addCase(fetchMasterProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch master products";
      })

      /* ---------------- FETCH BY ID ---------------- */
      .addCase(fetchMasterProductById.pending, (state) => {
        state.loadingItem = true;
        state.error = null;
        state.documents = []; // ✅ critical reset
        state.approving = false; // reset so next product doesn't show "Approving..."
      })
      .addCase(
        fetchMasterProductById.fulfilled,
        (state, action: PayloadAction<MasterProduct>) => {
          state.selectedProduct = action.payload;
          state.loadingItem = false;
        },
      )
      .addCase(fetchMasterProductById.rejected, (state, action) => {
        state.loadingItem = false;
        state.error = action.error.message ?? "Failed to fetch master product";
      })

      /* ---------------- APPLY CHANGES ---------------- */
      .addCase(applyChangesMasterProduct.pending, (state) => {
        state.applyingChanges = true;
        state.error = null;
      })
      .addCase(
        applyChangesMasterProduct.fulfilled,
        (state, action: PayloadAction<ApplyChangesResponse>) => {
          const updated = action.payload?.data;
          if (!updated) return;

          const index = state.productList.findIndex((p) => p.id === updated.id);
          if (index !== -1) state.productList[index] = updated;
          if (state.selectedProduct?.id === updated.id) {
            state.selectedProduct = updated;
          }

          state.applyingChanges = false;
        },
      )
      .addCase(applyChangesMasterProduct.rejected, (state, action) => {
        state.applyingChanges = false;
        state.error = action.error.message ?? "Failed to apply changes";
      })

      /* ---------------- APPROVE ---------------- */
      .addCase(approveMasterProduct.pending, (state) => {
        state.approving = true;
        state.error = null;
      })
      .addCase(
        approveMasterProduct.fulfilled,
        (state, action: PayloadAction<ApproveProductResponse>) => {
          const updated = action.payload?.data;
          if (!updated) return;

          const index = state.productList.findIndex((p) => p.id === updated.id);
          if (index !== -1) state.productList[index] = updated;
          if (state.selectedProduct?.id === updated.id) {
            state.selectedProduct = updated;
          }

          state.approving = false;
        },
      )
      .addCase(approveMasterProduct.rejected, (state, action) => {
        state.approving = false;
        state.error =
          action.error.message ?? "Failed to approve master product";
      })

      /* ---------------- CREATE ---------------- */
      .addCase(createMasterProduct.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createMasterProduct.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createMasterProduct.rejected, (state, action) => {
        state.creating = false;
        state.error =
          action.error.message ?? "Failed to create master product";
      })

      /* ---------------- FETCH DOCUMENTS ---------------- */
      .addCase(fetchMasterProductDocuments.pending, (state) => {
        state.loadingDocuments = true;
        state.documents = []; // ✅ always clear first
        state.error = null;
      })
      .addCase(
        fetchMasterProductDocuments.fulfilled,
        (state, action: PayloadAction<FetchMasterProductDocumentsResponse>) => {
          state.documents = action.payload?.data ?? [];
          state.loadingDocuments = false;
        },
      )
      .addCase(fetchMasterProductDocuments.rejected, (state, action) => {
        state.loadingDocuments = false;
        state.documents = []; // ✅ ensure dropdown clears
        state.error =
          action.error.message ?? "Failed to fetch master product documents";
      })

      /* ---------------- FETCH REMARKS ---------------- */
      .addCase(fetchMasterProductRemarks.pending, (state) => {
        state.loadingRemarks = true;
        state.remarks = [];
      })
      .addCase(
        fetchMasterProductRemarks.fulfilled,
        (state, action: PayloadAction<MasterProductRemarksResponse>) => {
          const data = action.payload?.data;
          const raw = Array.isArray(data) ? data : data ? [data] : [];
          state.remarks = raw.filter((r): r is MasterProductRemark => r != null);
          const p = action.payload?.pagination;
          if (p) {
            const totalPages = Math.max(1, p.totalPages ?? 1);
            const currentPage = Math.max(1, Math.min((p.currentPage ?? 0) + 1, totalPages)); // Ensure currentPage <= totalPages
            state.remarksPagination = {
              totalRecords: p.totalRecords ?? 0,
              totalPages,
              currentPage,
              recordPerPage: p.recordPerPage ?? p.size ?? 10,
            };
          } else {
            // Reset pagination if API doesn't return it
            state.remarksPagination = null;
          }
          state.loadingRemarks = false;
        },
      )
      .addCase(fetchMasterProductRemarks.rejected, (state) => {
        state.loadingRemarks = false;
        state.remarks = [];
        state.remarksPagination = null;
      })

      /* ---------------- SEND REMARK ---------------- */
      .addCase(sendMasterProductRemark.pending, (state) => {
        state.sendingRemark = true;
      })
      .addCase(sendMasterProductRemark.fulfilled, (state) => {
        state.sendingRemark = false;
        // Do not add here - rely on refetch in component to avoid duplicate when API returns full list
      })
      .addCase(sendMasterProductRemark.rejected, (state) => {
        state.sendingRemark = false;
      });
  },
});

export const { clearSelectedProduct, clearDocuments, clearError } =
  masterProductSlice.actions;

export default masterProductSlice.reducer;
