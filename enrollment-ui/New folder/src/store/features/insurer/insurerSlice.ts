import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { FetchInsurersParams, Insurer, InsurerResponse } from "./insurerTypes";
import { fetchInsurersAPI, fetchInsurersSearchAPI } from "./insurerAPI";

interface InsurerState {
  insurerMainList: Insurer[];
  loading: boolean;
  totalRecords: number;
  error?: string;
}

const initialState: InsurerState = {
  insurerMainList: [],
  loading: false,
  totalRecords: 0,
};

export const fetchInsurers = createAsyncThunk("insurer/fetch", async ({ queryObj, page, size }: FetchInsurersParams = {}) => {
  if (queryObj && Object.keys(queryObj).length > 0) {
    return await fetchInsurersSearchAPI(queryObj, page, size);
  } else {
    return await fetchInsurersAPI(size, page);
  }
},
);
const insurerSlice = createSlice({
  name: "insurer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsurers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInsurers.fulfilled, (state, action: PayloadAction<InsurerResponse>) => {
          state.insurerMainList = action?.payload?.data;
          state.totalRecords = action?.payload?.pagination?.totalRecords;
          state.loading = false;
        },
      )
      .addCase(fetchInsurers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});

export default insurerSlice.reducer;
