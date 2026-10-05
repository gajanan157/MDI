import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchStagingBankProviderInsurerList } from "@/store/features/bulkBankDetails/bulkBankDetailsSlice";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { useProviderGridPagination } from "@/app/pages/dashboards/providerManagernt/shared/useProviderGridPagination";
import { toProviderStagingStatusParam } from "./normalizer";
import type {
  BankVerificationResultCounts,
  BankVerificationResultRow,
  BankVerificationSummaryFilter,
} from "./types";

const EMPTY_COUNTS: BankVerificationResultCounts = {
  total: 0,
  processed: 0,
  failed: 0,
  providerNotFound: 0,
  matched: 0,
  notMatched: 0,
  pending: 0,
  bankDetailsMissing: 0,
  validationFailedCount: 0,
  processingFailedCount: 0,
};

export type UseBankVerificationStagingListOptions = {
  insurerId?: string;
  suppressErrorToast?: boolean;
  /** Skip fetching (e.g. while the provider bank job is still running). Defaults to true. */
  enabled?: boolean;
};

export function useBankVerificationStagingList(
  inwardNo: string,
  options: UseBankVerificationStagingListOptions = {},
) {
  const { insurerId, suppressErrorToast = false, enabled = true } = options;
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
  const [activeFilter, setActiveFilter] = useState<BankVerificationSummaryFilter>("all");
  const [rows, setRows] = useState<BankVerificationResultRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [counts, setCounts] = useState<BankVerificationResultCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(false);

  const loadStagingRows = useCallback(async () => {
    if (!inwardNo.trim() || !enabled) return;

    setLoading(true);
    try {
      const result = await dispatch(
        fetchStagingBankProviderInsurerList({
          inwardNo,
          page,
          size: pageSize,
          insurerId: insurerId?.trim() || undefined,
          includeCounts: true,
          providerStagingStatus:
            activeFilter === "all"
              ? undefined
              : toProviderStagingStatusParam(activeFilter),
        }),
      ).unwrap();

      setRows(result.rows);
      setTotalRecords(result.totalRecords);
      if (result.hasSummaryCounts) {
        setCounts(result.counts);
      }
    } catch (err) {
      const message = typeof err === "string" ? err : "";
      if (message && !suppressErrorToastRef.current) {
        showProviderError(message);
      }
      setRows([]);
      setTotalRecords(0);
      setCounts(EMPTY_COUNTS);
    } finally {
      setLoading(false);
    }
  }, [
    activeFilter,
    dispatch,
    enabled,
    insurerId,
    inwardNo,
    page,
    pageSize,
  ]);

  useEffect(() => {
    loadStagingRows();
  }, [loadStagingRows]);

  const handleFilterChange = useCallback(
    (filter: BankVerificationSummaryFilter) => {
      setActiveFilter(filter);
      resetPage();
    },
    [resetPage],
  );

  return {
    page,
    pageSize,
    totalItems: totalRecords,
    rows,
    counts,
    activeFilter,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    reloadStagingRows: loadStagingRows,
    loading,
  };
}
