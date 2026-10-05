import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  verifyRestrictionPolicyExistsApi,
  type VerifyRestrictionPolicyResult,
} from "./providerRestrictionAPI";

type ProviderRestrictionState = {
  policyVerifyLoading: boolean;
  policyVerifyError: string | null;
};

const initialState: ProviderRestrictionState = {
  policyVerifyLoading: false,
  policyVerifyError: null,
};

export const verifyRestrictionPolicy = createAsyncThunk<
  Extract<VerifyRestrictionPolicyResult, { ok: true }>,
  { insurerId: string; policyNo: string },
  { rejectValue: string }
>(
  "providerRestriction/verifyPolicy",
  async ({ insurerId, policyNo }, { rejectWithValue }) => {
    const result = await verifyRestrictionPolicyExistsApi(insurerId, policyNo);
    if (!result.ok) {
      return rejectWithValue(result.message);
    }
    return result;
  },
);

const providerRestrictionSlice = createSlice({
  name: "providerRestriction",
  initialState,
  reducers: {
    clearRestrictionPolicyVerify(state) {
      state.policyVerifyLoading = false;
      state.policyVerifyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyRestrictionPolicy.pending, (state) => {
        state.policyVerifyLoading = true;
        state.policyVerifyError = null;
      })
      .addCase(verifyRestrictionPolicy.fulfilled, (state) => {
        state.policyVerifyLoading = false;
      })
      .addCase(verifyRestrictionPolicy.rejected, (state, action) => {
        state.policyVerifyLoading = false;
        state.policyVerifyError = action.payload ?? action.error.message ?? "";
      });
  },
});

export const { clearRestrictionPolicyVerify } = providerRestrictionSlice.actions;
export default providerRestrictionSlice.reducer;
