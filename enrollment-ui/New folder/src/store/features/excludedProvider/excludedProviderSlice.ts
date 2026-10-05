import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BlacklistedBy, BlacklistedRow } from "@/app/pages/dashboards/providerManagernt/provider-master/excluded-provider/blacklistedHospital";
import type { RootState } from "@/store/store";
import { downloadBlobFileWithExtension } from "@/utils/dom/downloadBlobFile";
import {
  downloadProviderBlacklistExport,
  fetchBulkExcludeInwardsApi,
  fetchExclusionStagingListApi,
  getProviderBlacklist,
  getStagingProviderBlacklist,
  type FetchBulkExcludeInwardsParams,
  type FetchExclusionStagingListParams,
  type StagingProviderBlacklistQuery,
} from "./excludedProviderAPI";
import type { ExcludedProviderQuery, ProviderBlacklistPageResponse } from "./excludedProviderTypes";

function toBlacklistedBy(raw: unknown): BlacklistedBy {
  const s = String(raw ?? "").toUpperCase();
  if (s === "TPA" || s === "INSURER" || s === "GLOBAL") return s;
  return "TPA";
}

function str(item: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = item[k];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "";
}

/** Map one API blacklist row to grid row — matches provider-management `Provider-Blacklist` list DTO. */
export function mapBlacklistApiItemToRow(
  item: Record<string, unknown>,
  index: number,
): BlacklistedRow {
  const src = item.providerBlacklistSource ?? item.blacklistedBy ?? item.blacklisted_by;
  const srcTrim = src != null ? String(src).trim() : "";
  const excludedByDisplay =
    srcTrim !== "" ? srcTrim.toUpperCase() : "-";

  return {
    id: String(
      item.providerBlacklistMasterId ??
        item.id ??
        item.providerBlacklistId ??
        item.provider_blacklist_id ??
        `row-${index}`,
    ),
    raw: item,
    providerName: String(item.providerName ?? item.provider_name ?? ""),
    icName: String(
      item.insurerName ??
        item.insurerCompanyName ??
        item.icName ??
        item.insurer_company_name ??
        "",
    ),
    providerCode: String(item.providerCode ?? item.provider_code ?? ""),
    address: String(
      item.providerAddress ??
        item.address ??
        item.provider_address ??
        "",
    ),
    effectiveFrom: String(
      item.providerBlacklistEffectiveFrom ??
        item.effectiveFrom ??
        item.effective_from ??
        item.effectiveDate ??
        "",
    ),
    remarkCategory: String(
      item.providerBlacklistReasonDescription ??
        item.remarkCategory ??
        item.remark_category ??
        "",
    ),
    state: String(item.providerState ?? item.state ?? ""),
    district: String(
      item.providerDistrict ??
        item.district ??
        item.provider_district ??
        "",
    ),
    city: String(item.providerCity ?? item.city ?? ""),
    pincode: String(
      item.providerPincode ??
        item.pincode ??
        item.pinCode ??
        item.provider_pincode ??
        "",
    ),
    blacklistedBy: toBlacklistedBy(src),
    excludedByDisplay,
    insurerId: str(item, "insurerId", "insurer_id"),
    providerIcCode: str(item, "providerIcCode", "provider_ic_code"),
    providerIibRohiniCode: str(item, "providerIibRohiniCode", "provider_iib_rohini_code"),
    providerStatusReason: str(
      item,
      "providerStatusReason"
    ),
    providerBlacklistStartDate: str(
      item,
      "providerBlacklistStartDate",
      "provider_blacklist_start_date",
    ),
    providerBlacklistMappingId: str(
      item,
      "providerBlacklistMappingId",
      "provider_blacklist_mapping_id",
    ),
    providerBlacklistReasonCode: str(
      item,
      "providerBlacklistReasonCode",
      "provider_blacklist_reason_code",
    ),
    effectiveTo: str(
      item,
      "providerBlacklistEffectiveTo",
      "provider_blacklist_effective_to",
    ),
    providerBlacklistStatus: str(
      item,
      "providerBlacklistStatus",
      "provider_blacklist_status",
    ),
    providerBlacklistClaimScope: str(
      item,
      "providerBlacklistClaimScope",
      "provider_blacklist_claim_scope",
    ),
    providerFacilities: str(item, "providerFacilities", "provider_facilities"),
    tpaId: str(item, "tpaId", "tpa_id"),
    tenantId: str(item, "tenantId", "tenant_id"),
  };
}

/** Total count from Spring-style fields or nested `pagination` (Provider-Blacklist API). */
function totalRecordsFromEnvelope(
  obj: Record<string, unknown>,
  listLength: number,
): number {
  const pag = obj.pagination;
  if (pag && typeof pag === "object") {
    const p = pag as Record<string, unknown>;
    const fromPag = Number(
      p.totalRecords ??
        p.total_records ??
        p.totalElements ??
        p.total_elements,
    );
    if (Number.isFinite(fromPag) && fromPag >= 0) {
      return fromPag;
    }
  }
  const top = Number(
    obj.totalElements ??
      obj.total ??
      obj.totalRecords ??
      obj.total_records,
  );
  if (Number.isFinite(top) && top >= 0) {
    return top;
  }
  return listLength;
}

function extractListAndTotal(obj: Record<string, unknown>): {
  list: unknown[];
  total: number;
} | null {
  if (Array.isArray(obj.content)) {
    return {
      list: obj.content,
      total: totalRecordsFromEnvelope(obj, obj.content.length),
    };
  }
  if (Array.isArray(obj.records)) {
    return {
      list: obj.records,
      total: totalRecordsFromEnvelope(obj, obj.records.length),
    };
  }
  if (Array.isArray(obj.items)) {
    return {
      list: obj.items,
      total: totalRecordsFromEnvelope(obj, obj.items.length),
    };
  }
  if (Array.isArray(obj.data)) {
    return {
      list: obj.data,
      total: totalRecordsFromEnvelope(obj, obj.data.length),
    };
  }
  return null;
}

function unwrapPage(data: ProviderBlacklistPageResponse | null | undefined): {
  rows: BlacklistedRow[];
  totalElements: number;
} {
  if (data == null) {
    return { rows: [], totalElements: 0 };
  }
  if (Array.isArray(data)) {
    const rows = data.map((row, i) =>
      mapBlacklistApiItemToRow(
        (row && typeof row === "object" ? row : {}) as Record<string, unknown>,
        i,
      ),
    );
    return { rows, totalElements: rows.length };
  }
  if (typeof data !== "object") {
    return { rows: [], totalElements: 0 };
  }
  const d = data as Record<string, unknown>;
  let extracted = extractListAndTotal(d);

  if (!extracted && d.data && typeof d.data === "object") {
    const inner = d.data as Record<string, unknown>;
    extracted = extractListAndTotal(inner);
    if (!extracted && Array.isArray(inner.data)) {
      extracted = {
        list: inner.data,
        total: Number(inner.totalElements ?? inner.data.length),
      };
    }
  }
  if (!extracted && d.result && typeof d.result === "object") {
    extracted = extractListAndTotal(d.result as Record<string, unknown>);
  }
  if (!extracted && d.payload && typeof d.payload === "object") {
    extracted = extractListAndTotal(d.payload as Record<string, unknown>);
  }

  if (!extracted) {
    return { rows: [], totalElements: 0 };
  }

  const rows = extracted.list.map((row, i) =>
    mapBlacklistApiItemToRow((row && typeof row === "object" ? row : {}) as Record<string, unknown>, i),
  );
  return { rows, totalElements: extracted.total };
}

export interface ExcludedProviderState {
  query: ExcludedProviderQuery;
  rows: BlacklistedRow[];
  totalElements: number;
  loading: boolean;
  exportLoading: boolean;
  inwardLoading: boolean;
  stagingListLoading: boolean;
  error: string | null;
}

const defaultQuery: ExcludedProviderQuery = {
  providerName: "",
  insurerId: null,
  providerBlacklistSource: undefined,
  state: "",
  district: "",
  city: "",
  pincode: "",
  page: 1,
  size: 20,
  download: false,
  sortBy: undefined,
};

const initialState: ExcludedProviderState = {
  query: { ...defaultQuery },
  rows: [],
  totalElements: 0,
  loading: false,
  exportLoading: false,
  inwardLoading: false,
  stagingListLoading: false,
  error: null,
};

export const fetchExcludedProviders = createAsyncThunk<
  { rows: BlacklistedRow[]; totalElements: number },
  Partial<ExcludedProviderQuery> | void,
  { state: RootState }
>("excludedProvider/fetch", async (arg, { getState, rejectWithValue }) => {
  const prev = getState().excludedProvider.query;
  const merged: ExcludedProviderQuery = {
    ...prev,
    ...(arg ?? {}),
  };
  try {
    const data = await getProviderBlacklist(merged);
    const { rows, totalElements } = unwrapPage(data ?? undefined);
    return { rows, totalElements };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load excluded providers";
    return rejectWithValue(msg);
  }
});

export type FetchStagingExcludedProvidersArg = Partial<StagingProviderBlacklistQuery> & {
  inwardNo: string;
  restrictionType?: string;
};

/** Exclusion inward staging — GET `/v1/staging-provider-blacklist`. */
export const fetchStagingExcludedProviders = createAsyncThunk<
  { rows: BlacklistedRow[]; totalElements: number },
  FetchStagingExcludedProvidersArg,
  { state: RootState }
>("excludedProvider/fetchStaging", async (arg, { getState, rejectWithValue }) => {
  const prev = getState().excludedProvider.query;
  const merged: StagingProviderBlacklistQuery = {
    page: arg.page ?? prev.page ?? 1,
    size: arg.size ?? prev.size ?? 20,
    providerName: arg.providerName ?? prev.providerName,
    inwardNo: arg.inwardNo,
    restrictionType: arg.restrictionType?.trim() || undefined,
    stagingStatus: arg.stagingStatus?.trim() || "COMPLETED",
    providerStatus: arg.providerStatus?.trim() || undefined,
    providerIibRohiniCode: arg.providerIibRohiniCode?.trim() || undefined,
    includeCounts: arg.includeCounts ?? true,
    includeConvertedToInactiveRecords:
      arg.includeConvertedToInactiveRecords === true ? true : undefined,
  };
  try {
    const data = await getStagingProviderBlacklist(merged);
    const { rows, totalElements } = unwrapPage(data ?? undefined);
    return { rows, totalElements };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Failed to load staging excluded providers";
    return rejectWithValue(msg);
  }
});

/**
 * Excel export: GET `/v1/Provider-Blacklist/download-excel` with the same `query` as the grid
 * (providerName, insurerId, providerBlacklistSource, state, city, page, size, download, sortBy).
 */
export const exportExcludedProviders = createAsyncThunk<
  void,
  void,
  { state: RootState }
>("excludedProvider/export", async (_, { getState }) => {
  const q = getState().excludedProvider.query;
  const blob = await downloadProviderBlacklistExport(q);
  downloadBlobFileWithExtension("excluded-providers-export", blob);
});

/** Bulk Exclude list / route inward — GET `v1/files/inwards` (exclusion + watchlist, separate calls). */
export const fetchBulkExcludeInwards = createAsyncThunk(
  "excludedProvider/fetchBulkExcludeInwards",
  async (params: FetchBulkExcludeInwardsParams, { rejectWithValue }) => {
    const result = await fetchBulkExcludeInwardsApi(params);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return result;
  },
);

/**
 * Bulk Exclude inward staging grid — GET `/v1/staging-provider-blacklist`
 * (normalized rows + summary counts).
 */
export const fetchExclusionStagingList = createAsyncThunk(
  "excludedProvider/fetchExclusionStagingList",
  async (params: FetchExclusionStagingListParams, { rejectWithValue }) => {
    const result = await fetchExclusionStagingListApi(params);
    if (!result.ok) {
      return rejectWithValue(result.message ?? "");
    }
    return result;
  },
);

const excludedProviderSlice = createSlice({
  name: "excludedProvider",
  initialState,
  reducers: {
    setExcludedProviderQuery(state, action: PayloadAction<Partial<ExcludedProviderQuery>>) {
      state.query = { ...state.query, ...action.payload };
    },
    resetExcludedProviderQuery(state) {
      state.query = { ...defaultQuery };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExcludedProviders.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const arg = action.meta.arg as Partial<ExcludedProviderQuery> | void;
        if (arg && typeof arg === "object") {
          state.query = { ...state.query, ...arg };
        }
      })
      .addCase(fetchExcludedProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.rows = action.payload.rows;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchExcludedProviders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? "Request failed";
        state.rows = [];
      })
      .addCase(fetchStagingExcludedProviders.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const arg = action.meta.arg;
        state.query = {
          ...state.query,
          page: arg.page ?? state.query.page,
          size: arg.size ?? state.query.size,
          providerName: arg.providerName ?? state.query.providerName,
        };
      })
      .addCase(fetchStagingExcludedProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.rows = action.payload.rows;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchStagingExcludedProviders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? "Request failed";
        state.rows = [];
      })
      .addCase(exportExcludedProviders.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportExcludedProviders.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportExcludedProviders.rejected, (state) => {
        state.exportLoading = false;
      })
      .addCase(fetchBulkExcludeInwards.pending, (state) => {
        state.inwardLoading = true;
        state.error = null;
      })
      .addCase(fetchBulkExcludeInwards.fulfilled, (state) => {
        state.inwardLoading = false;
      })
      .addCase(fetchBulkExcludeInwards.rejected, (state, action) => {
        state.inwardLoading = false;
        state.error = String(action.payload ?? action.error.message ?? "");
      })
      .addCase(fetchExclusionStagingList.pending, (state) => {
        state.stagingListLoading = true;
        state.error = null;
      })
      .addCase(fetchExclusionStagingList.fulfilled, (state) => {
        state.stagingListLoading = false;
      })
      .addCase(fetchExclusionStagingList.rejected, (state, action) => {
        state.stagingListLoading = false;
        state.error = String(action.payload ?? action.error.message ?? "");
      });
  },
});

export const { setExcludedProviderQuery, resetExcludedProviderQuery } =
  excludedProviderSlice.actions;

export default excludedProviderSlice.reducer;
