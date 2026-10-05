import { useCallback, useEffect, useMemo, useState } from "react";
import { showProviderError } from "../../shared/ProviderAlertDialog";
import { useProviderInwardContextIds } from "../../shared/providerInwardDefaults";
import { useProviderGridPagination } from "../../shared/useProviderGridPagination";
import {
  buildProviderInwardListFilters,
  fetchProviderInwardDashboardStats,
  fetchProviderInwardsApi,
} from "./providerInwardAPI";
import { downloadProviderInwardReport } from "./providerInwardExport";
import { PROVIDER_INWARD_CARD_STATUS } from "./providerInwardDashboardConfig";
import type {
  ProviderInwardCardKey,
  ProviderInwardRow,
  ProviderInwardSearchFilters,
  ProviderInwardStatusCounts,
  ProviderInwardTodayBreakup,
} from "./providerInwardTypes";

const EMPTY_COUNTS: ProviderInwardStatusCounts = {
  TOTAL: 0,
  TODAY: 0,
  PENDING: 0,
  PROCESSING: 0,
  COMPLETED: 0,
  REJECTED: 0,
};

const EMPTY_BREAKUP: ProviderInwardTodayBreakup = {
  pending: 0,
  processing: 0,
  completed: 0,
  rejected: 0,
};

const EMPTY_FILTERS: ProviderInwardSearchFilters = {
  query: "",
  inwardNo: "",
  sourceEntity: "",
  fromDate: "",
  toDate: "",
};

function matchesQuery(row: ProviderInwardRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    row.inwardNo.toLowerCase().includes(q) ||
    row.sourceEntity.toLowerCase().includes(q) ||
    row.documentType.toLowerCase().includes(q) ||
    row.subcategory.toLowerCase().includes(q) ||
    row.createdBy.toLowerCase().includes(q)
  );
}

export function useProviderInwardList() {
  const {
    departmentId,
    inwardReceivedTpaBranchId,
    tpaBranchOptions,
    ready: contextReady,
  } = useProviderInwardContextIds();
  const {
    page,
    pageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();
  const [activeCard, setActiveCard] = useState<ProviderInwardCardKey>("TODAY");
  const [inwardStatusFilter, setInwardStatusFilter] =
    useState<ProviderInwardCardKey | null>(null);
  const [rows, setRows] = useState<ProviderInwardRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [counts, setCounts] = useState<ProviderInwardStatusCounts>(EMPTY_COUNTS);
  const [todayBreakup, setTodayBreakup] =
    useState<ProviderInwardTodayBreakup>(EMPTY_BREAKUP);
  const [filters, setFilters] = useState<ProviderInwardSearchFilters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [exporting, setExporting] = useState(false);

  const listFilters = useMemo(() => {
    if (!departmentId) return null;
    const base = buildProviderInwardListFilters(activeCard, departmentId);
    if (activeCard !== "TODAY" || !inwardStatusFilter) {
      return base;
    }

    const status = PROVIDER_INWARD_CARD_STATUS[inwardStatusFilter];
    return status ? { ...base, status } : base;
  }, [activeCard, departmentId, inwardStatusFilter]);

  // Counts only when department is ready or an explicit refresh is requested.
  // Opening Create Inward must not be a dependency of this effect.
  useEffect(() => {
    if (!contextReady || !departmentId) return;

    let cancelled = false;
    setCountsLoading(true);
    fetchProviderInwardDashboardStats(departmentId)
      .then(({ counts: nextCounts, todayBreakup: nextBreakup }) => {
        if (cancelled) return;
        setCounts(nextCounts);
        setTodayBreakup(nextBreakup);
      })
      .catch(() => {
        if (cancelled) return;
        setCounts(EMPTY_COUNTS);
        setTodayBreakup(EMPTY_BREAKUP);
      })
      .finally(() => {
        if (!cancelled) setCountsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contextReady, departmentId, refreshToken]);

  // Grid rows only when list filters / paging / search / refresh change.
  useEffect(() => {
    if (!contextReady || !listFilters) {
      setRows([]);
      setTotalRecords(0);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchProviderInwardsApi({
      ...listFilters,
      page,
      size: pageSize,
      inwardNo: filters.inwardNo || undefined,
      sourceEntityName: filters.sourceEntity || undefined,
      fromDate: filters.fromDate.trim() || listFilters.fromDate,
      toDate: filters.toDate.trim() || listFilters.toDate,
    })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          if (result.message) showProviderError(result.message);
          setRows([]);
          setTotalRecords(0);
          return;
        }
        setRows(result.rows);
        setTotalRecords(result.totalRecords);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    contextReady,
    filters.fromDate,
    filters.inwardNo,
    filters.sourceEntity,
    filters.toDate,
    listFilters,
    page,
    pageSize,
    refreshToken,
  ]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => matchesQuery(row, filters.query));
  }, [filters.query, rows]);

  const handleCardSelect = useCallback(
    (card: ProviderInwardCardKey) => {
      setActiveCard(card);
      setInwardStatusFilter(null);
      resetPage();
    },
    [resetPage],
  );

  const handleInwardStatusSelect = useCallback(
    (status: ProviderInwardCardKey) => {
      setInwardStatusFilter((current) => (current === status ? null : status));
      resetPage();
    },
    [resetPage],
  );

  const handleSearch = useCallback(
    (data: Record<string, unknown>) => {
      setFilters({
        query: String(data.query ?? ""),
        inwardNo: String(data.inwardNo ?? ""),
        sourceEntity: String(data.sourceEntity ?? ""),
        fromDate: String(data.fromDate ?? ""),
        toDate: String(data.toDate ?? ""),
      });
      resetPage();
    },
    [resetPage],
  );

  const handleReset = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setActiveCard("TODAY");
    setInwardStatusFilter(null);
    resetPage();
    setRefreshToken((token) => token + 1);
  }, [resetPage]);

  const handleRefresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  const handleExport = useCallback(() => {
    if (filteredRows.length === 0) {
      showProviderError("No records to export.");
      return;
    }
    setExporting(true);
    try {
      downloadProviderInwardReport(filteredRows);
    } finally {
      setExporting(false);
    }
  }, [filteredRows]);

  return {
    activeCard,
    counts,
    countsLoading,
    todayBreakup,
    inwardStatusFilter,
    filteredRows,
    totalRecords,
    page,
    pageSize,
    loading,
    exporting,
    contextReady,
    departmentId,
    inwardReceivedTpaBranchId,
    tpaBranchOptions,
    handleCardSelect,
    handleInwardStatusSelect,
    handleSearch,
    handleReset,
    handleRefresh,
    handlePageChange,
    handlePageSizeChange,
    handleExport,
    refreshAfterCreate: handleRefresh,
  };
}
