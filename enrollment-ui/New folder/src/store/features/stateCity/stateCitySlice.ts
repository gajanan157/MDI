// stateCitySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { City, StateItem, StateResponse } from "./stateCityTypes";
import { fetchCityByStateNameAPI, fetchStateAPI } from "./stateCityAPI";

interface StateCityState {
  cityList: City[];
  stateList: StateItem[];
  cityPagination: any;
  loading: boolean;
  error?: string;
  /** Latest city request key — used to ignore stale responses. */
  activeCityQueryKey: string | null;
}

const initialState: StateCityState = {
  cityList: [],
  stateList: [],
  cityPagination: {},
  loading: false,
  activeCityQueryKey: null,
};

// ----------- STATE (simple GET) -----------
export const fetchStates = createAsyncThunk(
  "location/fetchStates",
  async () => {
    return await fetchStateAPI();
  },
);

// ----------- CITY (by stateName) -----------
export const fetchCitiesByState = createAsyncThunk(
  "location/fetchCitiesByState",
  async ({
    stateName,
    searchCity,
    pinCode,
    page,
    size,
  }: {
    stateName: string;
    searchCity?: string;
    pinCode?: string;
    page?: number;
    size?: number;
  }) => {
    return await fetchCityByStateNameAPI(
      stateName,
      searchCity,
      pinCode,
      page,
      size,
    );
  },
);
/** Append only when loading later pages for the same query; first page replaces. */
function mergeUniqueCities(existing: City[], incoming: City[]): City[] {
  const map = new Map<string, City>();

  [...existing, ...incoming].forEach((city) => {
    const key = `${city.city}-${city.stateName}`;
    map.set(key, city);
  });

  return Array.from(map.values());
}

function isCityListAppendPage(page: number | undefined): boolean {
  return typeof page === "number" && page > 1;
}

function cityQueryKey(arg: {
  stateName?: string;
  searchCity?: string;
  pinCode?: string;
  page?: number;
}): string {
  return [
    String(arg.stateName ?? "").trim(),
    String(arg.pinCode ?? "").trim(),
    String(arg.searchCity ?? "").trim(),
    String(arg.page ?? 1),
  ].join("|");
}

function readIncomingCities(payload: unknown): City[] {
  if (Array.isArray(payload)) return payload as City[];
  if (payload != null && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as City[];
  }
  return [];
}

// ----------- SLICE -----------
const stateCitySlice = createSlice({
  name: "stateCity",
  initialState,
  reducers: {
    clearCityList(state) {
      state.cityList = [];
      state.cityPagination = {};
      // Non-null sentinel so in-flight responses are ignored after clear.
      state.activeCityQueryKey = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- STATE ----
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchStates.fulfilled,
        (state, action: PayloadAction<StateResponse>) => {
          // The API can return no list (service down or URL not served); keep it an array so screens can map it.
          state.stateList = Array.isArray(action?.payload?.data) ? action.payload.data : [];
          state.loading = false;
        },
      )
      .addCase(fetchStates.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // ---- CITY ----
      .addCase(fetchCitiesByState.pending, (state, action) => {
        state.loading = true;
        state.activeCityQueryKey = cityQueryKey(action.meta.arg);
      })

      .addCase(fetchCitiesByState.fulfilled, (state, action) => {
        const requestKey = cityQueryKey(action.meta.arg);
        // Ignore outdated responses when the user changed state quickly.
        if (
          state.activeCityQueryKey != null &&
          state.activeCityQueryKey !== requestKey
        ) {
          return;
        }

        const incomingCities = readIncomingCities(action.payload);

        // First page replaces prior state cities (avoids Maharashtra+Bihar mix).
        // Keep all pincode rows in store for pin lookup; dropdown dedupes labels separately.
        // Later pages still append for pagination.
        state.cityList = isCityListAppendPage(action.meta.arg.page)
          ? mergeUniqueCities(state.cityList ?? [], incomingCities)
          : incomingCities;

        const pagination =
          action.payload != null &&
          typeof action.payload === "object" &&
          "pagination" in action.payload
            ? (action.payload as { pagination?: unknown }).pagination
            : undefined;
        state.cityPagination = pagination ?? {};
        state.loading = false;
      })

      .addCase(fetchCitiesByState.rejected, (state, action) => {
        const requestKey = cityQueryKey(action.meta.arg);
        if (
          state.activeCityQueryKey != null &&
          state.activeCityQueryKey !== requestKey
        ) {
          return;
        }
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const { clearCityList } = stateCitySlice.actions;
export default stateCitySlice.reducer;
