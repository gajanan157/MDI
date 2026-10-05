import { useCallback, useEffect, useState } from "react";
import { showErrorMessage } from "@/utils/errorHandler";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchGlobalProviderNetworkMappingList } from "@/store/features/providerIcCorporateMapping/providerIcCorporateMappingSlice";
import { useProviderGridPagination } from "../../../shared/useProviderGridPagination";
import type { IcWiseGridRow } from "../types";

export type NetworkMappingListFilters = {
  providerName: string;
  rohiniNumber: string;
  icId: string;
};

const EMPTY_FILTERS: NetworkMappingListFilters = {
  providerName: "",
  rohiniNumber: "",
  icId: "",
};

export function useGlobalNetworkMappingList() {
  const dispatch = useAppDispatch();
  const {
    page,
    pageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();
  const [filters, setFilters] = useState<NetworkMappingListFilters>(EMPTY_FILTERS);
  const [rows, setRows] = useState<IcWiseGridRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dispatch(
        fetchGlobalProviderNetworkMappingList({
          page,
          size: pageSize,
          providerName: filters.providerName,
          rohiniRegistryCode: filters.rohiniNumber,
          insurerId: filters.icId,
        }),
      ).unwrap();

      setRows(result.rows);
      setTotalRecords(result.totalRecords);
    } catch (err) {
      const payload = err as { message?: string; status?: number } | string;
      if (typeof payload === "string") {
        if (payload) showErrorMessage({ error: payload });
      } else {
        showErrorMessage({ status: payload.status, error: payload.message });
      }
      setRows([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, pageSize, filters.providerName, filters.rohiniNumber, filters.icId]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const handleSearch = useCallback(
    (data: Record<string, unknown>) => {
      setFilters({
        providerName: String(data.providerName ?? ""),
        rohiniNumber: String(data.rohiniNumber ?? ""),
        icId: String(data.icId ?? ""),
      });
      resetPage();
    },
    [resetPage],
  );

  return {
    page,
    pageSize,
    totalItems: totalRecords,
    rows,
    loading,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
  };
}
