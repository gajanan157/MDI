import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchBulkBankDetailsInwards } from "@/store/features/bulkBankDetails/bulkBankDetailsSlice";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { matchesTextFilter } from "../../shared/matchesTextFilter";
import { useProviderGridPagination } from "../../shared/useProviderGridPagination";
import type { BankVerificationInwardRow } from "./inwardTypes";

export type BankVerificationInwardFilters = {
  inwardNo: string;
  insurerName: string;
};

const EMPTY_FILTERS: BankVerificationInwardFilters = {
  inwardNo: "",
  insurerName: "",
};

export function useBankVerificationInwardList(refreshToken: number) {
  const dispatch = useAppDispatch();
  const {
    page,
    pageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();
  const [filters, setFilters] = useState<BankVerificationInwardFilters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<BankVerificationInwardRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadInwards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dispatch(
        fetchBulkBankDetailsInwards({
          page,
          size: pageSize,
          inwardNo: filters.inwardNo,
        }),
      ).unwrap();

      setRows(result.rows);
      setTotalRecords(result.totalRecords);
    } catch (err) {
      const message = typeof err === "string" ? err : "";
      if (message) {
        showProviderError(message);
      }
      setRows([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, pageSize, filters.inwardNo]);

  useEffect(() => {
    loadInwards();
  }, [loadInwards, refreshToken]);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesTextFilter(row.insurerName, filters.insurerName)),
    [rows, filters.insurerName],
  );

  const handleSearch = useCallback(
    (data: Record<string, unknown>) => {
      setFilters({
        inwardNo: String(data.inwardNo ?? ""),
        insurerName: String(data.insurerName ?? ""),
      });
      resetPage();
    },
    [resetPage],
  );

  return {
    filteredRows,
    totalItems: totalRecords,
    page,
    pageSize,
    loading,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
  };
}
