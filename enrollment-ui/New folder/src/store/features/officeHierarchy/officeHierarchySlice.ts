import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Office } from "@/app/pages/dashboards/insurerManagement/InsurerOfficeHierarchy/utils/hierarchyUtils";
import type { OfficeHierarchySearchParams } from "./officeHierarchyTypes";
import { searchOfficeHierarchyAPI } from "./officeHierarchyAPI";
import {
  transformApiResponse,
  isApiResponseFormat,
} from "@/app/pages/dashboards/insurerManagement/InsurerOfficeHierarchy/utils/apiResponseTransformer";

/* =========================
   STATE
========================= */

interface OfficeHierarchyState {
  hierarchyList: Office[];
  loading: boolean;
  error: string | null;
}

const initialState: OfficeHierarchyState = {
  hierarchyList: [],
  loading: false,
  error: null,
};

/* =========================
   THUNK
========================= */

export const searchOfficeHierarchy = createAsyncThunk<
  Office[],
  { queryObj: OfficeHierarchySearchParams },
  { rejectValue: string }
>("officeHierarchy/search", async ({ queryObj }, { rejectWithValue }) => {
  try {
    // 🔹 API already returns response.data
    const res = await searchOfficeHierarchyAPI(queryObj);


    // 🔹 res.data = { insurer, parentOffice }
    if (!isApiResponseFormat(res.data)) {
      console.error("❌ Invalid API response format", res.data);
      return rejectWithValue("Invalid API response format");
    }

    // 🔹 Transform once → Office[]
    const transformed = transformApiResponse(res.data);


    return transformed;
  } catch (e: any) {
    console.error("❌ Hierarchy fetch failed", e);
    return rejectWithValue(e?.message || "Failed to fetch office hierarchy");
  }
});

/* =========================
   SLICE
========================= */

const officeHierarchySlice = createSlice({
  name: "officeHierarchy",
  initialState,
  reducers: {
    clearHierarchy(state) {
      state.hierarchyList = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchOfficeHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOfficeHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.hierarchyList = action.payload; // ✅ Office[]
      })
      .addCase(searchOfficeHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export const { clearHierarchy } = officeHierarchySlice.actions;
export default officeHierarchySlice.reducer;
