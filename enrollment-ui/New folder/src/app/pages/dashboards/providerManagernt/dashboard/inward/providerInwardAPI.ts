import { inwardGenerateApi, getApi } from "@/app/api/apiService";
import { buildQueryParams } from "@/store/features/Broker/BrokerApi";
import { extractApiMessage } from "@/store/utils/extractApiMessage";
import { parseProviderDate, toProviderDateStorageValue } from "../../shared/dateFormat";
import { normalizeProviderInwardList } from "./providerInwardNormalizer";
import type {
  ProviderInwardApiStatus,
  ProviderInwardCardKey,
  ProviderInwardRow,
  ProviderInwardStatusCounts,
  ProviderInwardTodayBreakup,
} from "./providerInwardTypes";

const INWARDS_PATH = "v1/files/inwards";

export type FetchProviderInwardsParams = {
  page: number;
  size: number;
  departmentId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  inwardNo?: string;
  sourceEntityName?: string;
};

export type FetchProviderInwardsResult =
  | {
      ok: true;
      rows: ProviderInwardRow[];
      totalRecords: number;
    }
  | {
      ok: false;
      message?: string;
    };

function parseInwardListBody(body: unknown): { items: unknown[]; totalRecords: number } {
  if (body == null || typeof body !== "object") {
    return { items: [], totalRecords: 0 };
  }

  const record = body as Record<string, unknown>;
  const items = Array.isArray(record.data) ? record.data : [];
  const pagination = record.pagination;
  const totalFromPagination =
    pagination != null && typeof pagination === "object"
      ? Number((pagination as Record<string, unknown>).totalRecords)
      : Number.NaN;

  return {
    items,
    totalRecords: Number.isFinite(totalFromPagination) ? totalFromPagination : items.length,
  };
}

function buildTodayRange(): { fromDate: string; toDate: string } {
  const today = toProviderDateStorageValue(new Date());
  return { fromDate: today, toDate: today };
}

export async function fetchProviderInwardsApi(
  params: FetchProviderInwardsParams,
): Promise<FetchProviderInwardsResult> {
  const queryPayload: Record<string, string> = {};

  if (params.departmentId?.trim()) {
    queryPayload.departmentId = params.departmentId.trim();
  }
  if (params.fromDate?.trim()) queryPayload.fromDate = params.fromDate.trim();
  if (params.toDate?.trim()) queryPayload.toDate = params.toDate.trim();
  if (params.status?.trim()) queryPayload.status = params.status.trim();
  if (params.inwardNo?.trim()) queryPayload.inwardNo = params.inwardNo.trim();
  if (params.sourceEntityName?.trim()) {
    queryPayload.sourceEntityName = params.sourceEntityName.trim();
  }

  const apiPage = params.page > 0 ? params.page - 1 : 0;
  const query = buildQueryParams(queryPayload, apiPage, params.size);
  const response = await getApi<unknown>(inwardGenerateApi, `${INWARDS_PATH}?${query}`);

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        (typeof response.message === "string" ? response.message : undefined),
    };
  }

  const parsed = parseInwardListBody(response.data);
  return {
    ok: true,
    rows: normalizeProviderInwardList(parsed.items),
    totalRecords: parsed.totalRecords,
  };
}

async function fetchAllProviderInwardRows(
  departmentId: string,
): Promise<{ rows: ProviderInwardRow[]; totalRecords: number }> {
  const pageSize = 100;
  const first = await fetchProviderInwardsApi({
    departmentId,
    page: 1,
    size: pageSize,
  });
  if (!first.ok) {
    return { rows: [], totalRecords: 0 };
  }

  let allRows = first.rows;
  const totalPages = Math.ceil(first.totalRecords / pageSize);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchProviderInwardsApi({
      departmentId,
      page,
      size: pageSize,
    });
    if (next.ok) {
      allRows = allRows.concat(next.rows);
    }
  }

  return { rows: allRows, totalRecords: first.totalRecords };
}

function isTodayInward(createdDate: string, today: string): boolean {
  if (!createdDate) return false;
  if (createdDate.startsWith(today)) return true;
  const parsed = parseProviderDate(createdDate);
  if (!parsed) return false;
  return toProviderDateStorageValue(parsed) === today;
}

function countRowsByCardStatus(rows: ProviderInwardRow[]): {
  PENDING: number;
  PROCESSING: number;
  COMPLETED: number;
  REJECTED: number;
} {
  const counts = {
    PENDING: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    REJECTED: 0,
  };

  for (const row of rows) {
    if (row.status === "PROCESSOR_PENDING") counts.PENDING += 1;
    else if (row.status === "QC_PENDING") counts.PROCESSING += 1;
    else if (row.status === "COMPLETED") counts.COMPLETED += 1;
    else if (row.status === "REJECTED_INWARD") counts.REJECTED += 1;
  }

  return counts;
}

function countTodayBreakupFromRows(
  rows: ProviderInwardRow[],
  today: string,
): ProviderInwardTodayBreakup {
  const todayRows = rows.filter((row) => isTodayInward(row.createdDate, today));
  const statusCounts = countRowsByCardStatus(todayRows);
  return {
    pending: statusCounts.PENDING,
    processing: statusCounts.PROCESSING,
    completed: statusCounts.COMPLETED,
    rejected: statusCounts.REJECTED,
  };
}

export async function fetchProviderInwardStatusCounts(
  departmentId: string,
): Promise<ProviderInwardStatusCounts> {
  const { counts } = await fetchProviderInwardDashboardStats(departmentId);
  return counts;
}

export async function fetchProviderInwardTodayBreakup(
  departmentId: string,
): Promise<ProviderInwardTodayBreakup> {
  const { todayBreakup } = await fetchProviderInwardDashboardStats(departmentId);
  return todayBreakup;
}

/** One paginated fetch for both status counts and today breakup (avoids duplicate inwards pages). */
export async function fetchProviderInwardDashboardStats(
  departmentId: string,
): Promise<{
  counts: ProviderInwardStatusCounts;
  todayBreakup: ProviderInwardTodayBreakup;
}> {
  const today = toProviderDateStorageValue(new Date());
  const { rows, totalRecords } = await fetchAllProviderInwardRows(departmentId);
  const statusCounts = countRowsByCardStatus(rows);
  const todayCount = rows.filter((row) => isTodayInward(row.createdDate, today)).length;

  return {
    counts: {
      TOTAL: totalRecords,
      TODAY: todayCount,
      PENDING: statusCounts.PENDING,
      PROCESSING: statusCounts.PROCESSING,
      COMPLETED: statusCounts.COMPLETED,
      REJECTED: statusCounts.REJECTED,
    },
    todayBreakup: countTodayBreakupFromRows(rows, today),
  };
}

export function buildProviderInwardListFilters(
  activeCard: ProviderInwardCardKey,
  departmentId: string,
): Omit<FetchProviderInwardsParams, "page" | "size"> {
  const base = { departmentId };
  if (activeCard === "TODAY") {
    return { ...base, ...buildTodayRange() };
  }

  const statusMap: Partial<Record<ProviderInwardCardKey, ProviderInwardApiStatus>> = {
    PENDING: "PROCESSOR_PENDING",
    PROCESSING: "QC_PENDING",
    COMPLETED: "COMPLETED",
    REJECTED: "REJECTED_INWARD",
  };
  const status = statusMap[activeCard];
  if (status) {
    return { ...base, status };
  }

  return base;
}
