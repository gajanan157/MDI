import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchStagingProviderInsurerList } from "@/store/features/bulkIcMapping/bulkIcMappingSlice";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { useProviderGridPagination } from "@/app/pages/dashboards/providerManagernt/shared/useProviderGridPagination";
import type {
  NormalizedStagingProviderInsurerCounts,
  NormalizedStagingProviderInsurerRow,
} from "./normalizer";
import {
  getStagingProviderStatusFilter,
  type BulkIcMappingStagingMainTab,
  type BulkIcMappingStagingSubTab,
} from "./utils";
import type { BulkIcMappingRowType } from "../types";

export type BulkIcMappingStagingFilters = {
  providerName: string;
  providerIibRohiniCode: string;
  state: string;
  city: string;
  pincode: string;
};

const EMPTY_FILTERS: BulkIcMappingStagingFilters = {
  providerName: "",
  providerIibRohiniCode: "",
  state: "",
  city: "",
  pincode: "",
};

function asSearchText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

const EMPTY_COUNTS: NormalizedStagingProviderInsurerCounts = {
  totalReceived: 0,
  validCount: 0,
  invalidCount: 0,
  pendingCount: 0,
  processedCount: 0,
  validationFailedCount: 0,
  processingFailedCount: 0,
  mappedCount: 0,
  alreadyMappedCount: 0,
  createdCount: 0,
  notFoundForDeEmpanelmentCount: 0,
  deEmpanelledCount: 0,
  alreadyDeEmpanelledCount: 0,
};

export type UseBulkIcMappingStagingListOptions = {
  /** When job failed, error is shown in the job card — skip duplicate list toasts. */
  suppressErrorToast?: boolean;
  /** Default empanel vs de-empanel staging rows. */
  initialRowType?: BulkIcMappingRowType;
};

export function useBulkIcMappingStagingList(
  inwardNo: string,
  options: UseBulkIcMappingStagingListOptions = {},
) {
  const { suppressErrorToast = false, initialRowType = "EMPANELMENT" } = options;
  const suppressErrorToastRef = useRef(suppressErrorToast);
  suppressErrorToastRef.current = suppressErrorToast;
  const dispatch = useAppDispatch();
  const {
    page,
    pageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();
  const [appliedFilters, setAppliedFilters] =
    useState<BulkIcMappingStagingFilters>(EMPTY_FILTERS);
  const [activeMainTab, setActiveMainTab] = useState<BulkIcMappingStagingMainTab>("total");
  const [activeSubTab, setActiveSubTab] = useState<BulkIcMappingStagingSubTab>("success");
  const [activeRowType, setActiveRowType] = useState<BulkIcMappingRowType>(initialRowType);
  const [rows, setRows] = useState<NormalizedStagingProviderInsurerRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [counts, setCounts] = useState<NormalizedStagingProviderInsurerCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(false);

  const statusFilter = useMemo(
    () => getStagingProviderStatusFilter(activeMainTab, activeSubTab, activeRowType),
    [activeMainTab, activeSubTab, activeRowType],
  );

  const loadStagingRows = useCallback(async () => {
    if (!inwardNo.trim()) return;

    setLoading(true);
    try {
      const providerName = appliedFilters.providerName.trim();
      const providerIibRohiniCode = appliedFilters.providerIibRohiniCode.trim();

      const result = await dispatch(
        fetchStagingProviderInsurerList({
          inwardNo,
          page,
          size: pageSize,
          rowType: activeRowType,
          providerStatus: statusFilter?.providerStatus,
          stagingStatus: statusFilter?.stagingStatus,
          providerName: providerName || undefined,
          providerIibRohiniCode: providerIibRohiniCode || undefined,
          state: appliedFilters.state.trim() || undefined,
          city: appliedFilters.city.trim() || undefined,
          pincode: appliedFilters.pincode.trim() || undefined,
        }),
      ).unwrap();

      setRows(result.rows);
      setTotalRecords(result.totalRecords);
      setCounts(result.counts);
    } catch (err) {
      const message = typeof err === "string" ? err : "";
      // Read via ref so job-status loading → idle does not re-trigger this fetch.
      if (message && !suppressErrorToastRef.current) {
        showProviderError(message);
      }
      setRows([]);
      setTotalRecords(0);
      setCounts(EMPTY_COUNTS);
    } finally {
      setLoading(false);
    }
  }, [dispatch, inwardNo, page, pageSize, statusFilter, appliedFilters, activeRowType]);

  useEffect(() => {
    loadStagingRows();
  }, [loadStagingRows]);

  const handleSearch = useCallback(
    (data: Record<string, unknown>) => {
      setAppliedFilters({
        providerName: asSearchText(data.providerName),
        providerIibRohiniCode: asSearchText(data.providerIibRohiniCode),
        state: asSearchText(data.state),
        city: asSearchText(data.city),
        pincode: asSearchText(data.pincode).replace(/\D/g, ""),
      });
      resetPage();
    },
    [resetPage],
  );

  const handleTabSelect = useCallback(
    (mainTab: BulkIcMappingStagingMainTab, subTab: BulkIcMappingStagingSubTab) => {
      setActiveMainTab(mainTab);
      setActiveSubTab(subTab);
      resetPage();
    },
    [resetPage],
  );

  const handleRowTypeChange = useCallback(
    (rowType: BulkIcMappingRowType) => {
      setActiveRowType(rowType);
      setActiveMainTab("total");
      setActiveSubTab("success");
      resetPage();
    },
    [resetPage],
  );

  return {
    page,
    pageSize,
    totalItems: totalRecords,
    rows,
    filteredRows: rows,
    counts,
    activeMainTab,
    activeSubTab,
    activeRowType,
    handleRowTypeChange,
    handleTabSelect,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    reloadStagingRows: loadStagingRows,
    loading,
  };
}
