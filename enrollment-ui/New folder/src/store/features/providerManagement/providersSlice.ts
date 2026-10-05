import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { hospitalMainList, type HospitalRecord } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/hospitalData";

export type ProviderTab = "network" | "nonNetwork";
export type StatusCardFilter = "all" | "Empaneled" | "Cashless On Hold";

export interface NonNetworkRow extends HospitalRecord {
  state?: string;
  city?: string;
  noOfBeds?: number;
}

interface ProvidersState {
  activeTab: ProviderTab;
  statusCardFilter: StatusCardFilter;
  loading: boolean;
  error: string | null;
  network: HospitalRecord[];
  nonNetwork: NonNetworkRow[];
}

const initialState: ProvidersState = {
  activeTab: "network",
  statusCardFilter: "all",
  loading: false,
  error: null,
  network: hospitalMainList,
  // For now, use the same hospital list as placeholder data for non-network.
  // This can be replaced with real API data later.
  nonNetwork: hospitalMainList as NonNetworkRow[],
};

export const fetchNonNetworkProviders = createAsyncThunk<
  NonNetworkRow[]
>("providerManagement/fetchNonNetworkProviders", async () => {
  return [];
});

const providersSlice = createSlice({
  name: "providerManagement",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<ProviderTab>) {
      state.activeTab = action.payload;
    },
    setStatusCardFilter(state, action: PayloadAction<StatusCardFilter>) {
      state.statusCardFilter = action.payload;
    },
    setNonNetworkProviders(state, action: PayloadAction<NonNetworkRow[]>) {
      state.nonNetwork = action.payload;
    },
    addNonNetworkProvider(state, action: PayloadAction<NonNetworkRow>) {
      state.nonNetwork.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNonNetworkProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNonNetworkProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.nonNetwork = action.payload;
      })
      .addCase(fetchNonNetworkProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load providers";
      });
  },
});

export const {
  setActiveTab,
  setStatusCardFilter,
  setNonNetworkProviders,
  addNonNetworkProvider,
} = providersSlice.actions;

export default providersSlice.reducer;

