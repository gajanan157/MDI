import { createSlice } from "@reduxjs/toolkit";

interface GlobalLoadingState {
  isLoading: boolean;
  activeRequests: number;
  showLoader: boolean; // Controls when to actually show the loader (after delay)
}

const initialState: GlobalLoadingState = {
  isLoading: false,
  activeRequests: 0,
  showLoader: false,
};

const globalLoadingSlice = createSlice({
  name: "globalLoading",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.activeRequests += 1;
      state.isLoading = true;
      // Show loader after a small delay (handled in component)
      state.showLoader = state.activeRequests > 0;
    },
    stopLoading: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      state.isLoading = state.activeRequests > 0;
      state.showLoader = state.activeRequests > 0;
    },
    resetLoading: (state) => {
      state.activeRequests = 0;
      state.isLoading = false;
      state.showLoader = false;
    },
  },
});

export const { startLoading, stopLoading, resetLoading } = globalLoadingSlice.actions;
export default globalLoadingSlice.reducer;

