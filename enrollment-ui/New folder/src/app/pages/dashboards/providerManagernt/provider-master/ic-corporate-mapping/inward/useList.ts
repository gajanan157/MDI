import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchBulkIcMappingInwards } from "@/store/features/bulkIcMapping/bulkIcMappingSlice";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { matchesTextFilter } from "@/app/pages/dashboards/providerManagernt/shared/matchesTextFilter";
import { useProviderGridPagination } from "@/app/pages/dashboards/providerManagernt/shared/useProviderGridPagination";
import type { BulkIcMappingInwardRow } from "./rows";

export type BulkIcMappingInwardFilters = {
  inwardNo: string;
  insurerName: string;
};

const EMPTY_FILTERS: BulkIcMappingInwardFilters = {
  inwardNo: "",
  insurerName: "",
};

export function useBulkIcMappingInwardList(refreshToken: number) {
  const dispatch = useAppDispatch();
  const {
    page,
    pageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();
  const [filters, setFilters] = useState<BulkIcMappingInwardFilters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<BulkIcMappingInwardRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadInwards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dispatch(
        fetchBulkIcMappingInwards({
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

  const filteredRows = useMemo(() => {
    return rows.filter((row) => matchesTextFilter(row.insurerName, filters.insurerName));
  }, [rows, filters.insurerName]);

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
    page,
    pageSize,
    totalItems: totalRecords,
    filteredRows,
    filters,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    loading,
  };
}
