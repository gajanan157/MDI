import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { downloadBlobFileWithExtension } from "@/utils/dom/downloadBlobFile";
import { extractApiFieldErrors } from "@/app/api/apiService";
import {
  createProvider as createProviderApi,
  getProviderList,
  downloadProviderListExcel,
} from "./providerAPI";
import {
  PROVIDER_LIST_IDENTIFIER_KEYS,
} from "./providerListIdentifierFieldKeys";
import { normalizeProviderListRohiniIdentifier } from "./providerListIdentifierNormalizer";
import type {
  CreateProviderBody,
  CreateProviderResult,
  NetworkProviderRow,
  ProviderListQuery,
  ProviderPageResponse,
} from "./providerTypes";

function str(item: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = item[k];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function normalizeNetworkType(
  value: unknown,
): "NETWORK" | "NON_NETWORK" | undefined {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "NON_NETWORK") return "NON_NETWORK";
  if (normalized === "NETWORK") return "NETWORK";
  return undefined;
}

export function mapProviderApiItemToRow(
  item: Record<string, unknown>,
  index: number,
): NetworkProviderRow {
  const providerNetworkType =
    normalizeNetworkType(
      str(
        item,
        "providerNetworkType",
        "provider_network_type",
        "networkType",
        "network_type",
      ),
    ) ?? normalizeNetworkType(item.globalProviderNetwork);
  const globalProviderNetwork = normalizeNetworkType(item.globalProviderNetwork);
  const tpaProviderNetwork = normalizeNetworkType(item.tpaProviderNetwork);
  const insurerProviderNetwork = normalizeNetworkType(item.insurerProviderNetwork);
  const noOfBedsRaw = Number(
    item.noOfBeds ??
      item.no_of_beds ??
      item.numberOfBeds ??
      item.number_of_beds ??
      item.beds,
  );
  const noOfBeds = Number.isFinite(noOfBedsRaw) ? noOfBedsRaw : null;

  const rohiniIdentifier = normalizeProviderListRohiniIdentifier(
    item[PROVIDER_LIST_IDENTIFIER_KEYS.identifiers],
  );

  const providerRohiniCode =
    str(
      item,
      "providerRohiniCode",
      "provider_rohini_code",
      "rohiniCode",
      "rohini_code",
      "providerIibRohiniCode",
    ) || rohiniIdentifier?.identifierValue || "";

  const effectiveToDate = (() => {
    const flat = str(item, "effectiveToDate", "effective_to_date");
    if (flat) return flat;
    return rohiniIdentifier?.validTo ?? null;
  })();

  return {
    id: str(item, "id", "providerId", "provider_id") || `row-${index}`,
    providerName: str(item, "providerName", "provider_name", "name"),
    providerRohiniCode,
    address: str(
      item,
      "address",
      "providerAddress",
      "provider_address",
      "fullAddress",
    ),
    city: str(item, "city", "providerCity", "provider_city"),
    state: str(item, "state", "providerState", "provider_state"),
    providerCode: str(item, "providerCode", "provider_code", "code"),
    noOfBeds,
    providerType: (() => {
      const value = str(item, "providerType");
      return value ? (value as NetworkProviderRow["providerType"]) : undefined;
    })(),
    providerNetworkType,
    globalProviderNetwork,
    tpaProviderNetwork,
    insurerProviderNetwork,
    networkSource: str(item, "networkSource"),
    effectiveToDate,
    nextRenewalDueDate: (() => {
      const v = str(item, "nextRenewalDueDate", "next_renewal_due_date");
      return v || null;
    })(),
  };
}

function countExpiringFromEnvelope(
  obj: Record<string, unknown> | null | undefined,
): number | null {
  if (!obj || typeof obj !== "object") return null;
  const add = obj.additionalData;
  if (add && typeof add === "object" && !Array.isArray(add)) {
    const n = Number((add as Record<string, unknown>).countExpiringInDays);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function totalRecordsFromEnvelope(
  obj: Record<string, unknown>,
  listLength: number,
): number {
  const pag = obj.pagination;
  if (pag && typeof pag === "object") {
    const p = pag as Record<string, unknown>;
    const fromPag = Number(
      p.totalRecords ?? p.total_records ?? p.totalElements ?? p.total_elements,
    );
    if (Number.isFinite(fromPag) && fromPag >= 0) {
      return fromPag;
    }
  }
  const top = Number(
    obj.totalElements ?? obj.total ?? obj.totalRecords ?? obj.total_records,
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

const EMPTY_UNWRAP_PAGE = {
  rows: [] as NetworkProviderRow[],
  totalElements: 0,
  countExpiringInDays: null as number | null,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function mapRowsFromList(list: unknown[]): NetworkProviderRow[] {
  return list.map((row, i) =>
    mapProviderApiItemToRow(
      (row && typeof row === "object" ? row : {}) as Record<string, unknown>,
      i,
    ),
  );
}

function extractListFromDataEnvelope(
  envelope: Record<string, unknown>,
): { list: unknown[]; total: number } | null {
  const fromRoot = extractListAndTotal(envelope);
  if (fromRoot) return fromRoot;

  const inner = asRecord(envelope.data);
  if (inner) {
    const fromInner = extractListAndTotal(inner);
    if (fromInner) return fromInner;
    if (Array.isArray(inner.data)) {
      return {
        list: inner.data,
        total: Number(inner.totalElements ?? inner.data.length),
      };
    }
  }

  for (const key of ["result", "payload"] as const) {
    const nested = asRecord(envelope[key]);
    if (!nested) continue;
    const extracted = extractListAndTotal(nested);
    if (extracted) return extracted;
  }

  return null;
}

function resolveCountExpiringInDays(
  envelope: Record<string, unknown>,
): number | null {
  for (const candidate of [
    envelope,
    asRecord(envelope.data),
    asRecord(envelope.result),
    asRecord(envelope.payload),
  ]) {
    const count = countExpiringFromEnvelope(candidate ?? undefined);
    if (count != null) return count;
  }
  return null;
}

function unwrapPage(data: ProviderPageResponse | null | undefined): {
  rows: NetworkProviderRow[];
  totalElements: number;
  countExpiringInDays: number | null;
} {
  if (data == null) {
    return EMPTY_UNWRAP_PAGE;
  }
  if (Array.isArray(data)) {
    const rows = mapRowsFromList(data);
    return { rows, totalElements: rows.length, countExpiringInDays: null };
  }
  if (typeof data !== "object") {
    return EMPTY_UNWRAP_PAGE;
  }

  const envelope = data as Record<string, unknown>;
  const countExpiringInDays = resolveCountExpiringInDays(envelope);
  const extracted = extractListFromDataEnvelope(envelope);

  if (!extracted) {
    return { rows: [], totalElements: 0, countExpiringInDays };
  }

  const rows = mapRowsFromList(extracted.list);
  return {
    rows,
    totalElements: extracted.total,
    countExpiringInDays,
  };
}

export type ProviderListFetchReject = {
  message: string;
  status?: number;
};

export interface ProviderListState {
  query: ProviderListQuery;
  rows: NetworkProviderRow[];
  totalElements: number;
  /** From `additionalData.countExpiringInDays` when the API returns it. */
  countExpiringInDays: number | null;
  loading: boolean;
  exportLoading: boolean;
  createSaving: boolean;
  createError: string | null;
  error: string | null;
  /** HTTP status when the last list fetch failed (for toast handling e.g. 502/503). */
  errorStatus: number | null;
}

const defaultQuery: ProviderListQuery = {
  providerName: "",
  providerRohiniCode: "",
  providerCode: "",
  page: 1,
  size: 20,
  sortBy: undefined,
};

const initialState: ProviderListState = {
  query: { ...defaultQuery },
  rows: [],
  totalElements: 0,
  countExpiringInDays: null,
  loading: false,
  exportLoading: false,
  createSaving: false,
  createError: null,
  error: null,
  errorStatus: null,
};

export const fetchProviderList = createAsyncThunk<
  {
    rows: NetworkProviderRow[];
    totalElements: number;
    countExpiringInDays: number | null;
  },
  Partial<ProviderListQuery> | void,
  { state: RootState; rejectValue: ProviderListFetchReject }
>("providerList/fetch", async (arg, { getState, rejectWithValue }) => {
  const prev = getState().providerList.query;
  const merged: ProviderListQuery = {
    ...prev,
    ...(arg ?? {}),
  };
  try {
    const res = await getProviderList(merged);
    if (!res.success) {
      return rejectWithValue({
        message: res.error ?? res.message ?? "Request failed",
        status: res.status,
      });
    }
    const { rows, totalElements, countExpiringInDays } = unwrapPage(
      res.data ?? undefined,
    );
    return { rows, totalElements, countExpiringInDays };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load providers";
    const status =
      e instanceof Error
        ? (e as Error & { status?: number }).status
        : undefined;
    return rejectWithValue({ message, status });
  }
});

export const exportProviderList = createAsyncThunk(
  "providerList/export",
  async (query: ProviderListQuery) => {
    const blob = await downloadProviderListExcel(query);
    downloadBlobFileWithExtension("providers-export", blob);
  },
);

export type CreateProviderReject = {
  message: string;
  status?: number;
  errorPayload?: unknown;
  fields?: Record<string, string>;
};

/** POST `/v1/provider` — create provider from Add Provider form. */
export const createProvider = createAsyncThunk<
  CreateProviderResult,
  CreateProviderBody,
  { rejectValue: CreateProviderReject }
>("providerList/create", async (body, { rejectWithValue }) => {
  try {
    const res = await createProviderApi(body);
    if (!res.success) {
      const fields = extractApiFieldErrors(res.errorPayload);
      return rejectWithValue({
        message: res.error ?? res.message ?? "Failed to create provider",
        status: res.status,
        errorPayload: res.errorPayload,
        fields: Object.keys(fields).length > 0 ? fields : undefined,
      });
    }
    return {
      data: res.data,
      message: res.message ?? undefined,
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create provider";
    const status =
      e instanceof Error
        ? (e as Error & { status?: number }).status
        : undefined;
    return rejectWithValue({ message, status });
  }
});

const providerListSlice = createSlice({
  name: "providerList",
  initialState,
  reducers: {
    setProviderListQuery(
      state,
      action: PayloadAction<Partial<ProviderListQuery>>,
    ) {
      state.query = { ...state.query, ...action.payload };
    },
    resetProviderListQuery(state) {
      state.query = { ...defaultQuery };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderList.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.errorStatus = null;
        const arg = action.meta.arg as Partial<ProviderListQuery> | void;
        if (arg && typeof arg === "object") {
          state.query = { ...state.query, ...arg };
        }
      })
      .addCase(fetchProviderList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.errorStatus = null;
        state.rows = action.payload.rows;
        state.totalElements = action.payload.totalElements;
        state.countExpiringInDays = action.payload.countExpiringInDays;
      })
      .addCase(fetchProviderList.rejected, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (p && typeof p === "object" && "message" in p) {
          state.error = p.message || "Request failed";
          state.errorStatus =
            typeof p.status === "number" && Number.isFinite(p.status)
              ? p.status
              : null;
        } else {
          state.error = action.error.message ?? "Request failed";
          state.errorStatus = null;
        }
        state.rows = [];
        state.totalElements = 0;
        state.countExpiringInDays = null;
      })
      .addCase(exportProviderList.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportProviderList.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportProviderList.rejected, (state) => {
        state.exportLoading = false;
      })
      .addCase(createProvider.pending, (state) => {
        state.createSaving = true;
        state.createError = null;
      })
      .addCase(createProvider.fulfilled, (state) => {
        state.createSaving = false;
        state.createError = null;
      })
      .addCase(createProvider.rejected, (state, action) => {
        state.createSaving = false;
        const p = action.payload;
        if (p && typeof p === "object" && "message" in p) {
          state.createError = p.message || "Failed to create provider";
        } else {
          state.createError = action.error.message ?? "Failed to create provider";
        }
      });
  },
});

export const { setProviderListQuery, resetProviderListQuery } =
  providerListSlice.actions;

export default providerListSlice.reducer;
