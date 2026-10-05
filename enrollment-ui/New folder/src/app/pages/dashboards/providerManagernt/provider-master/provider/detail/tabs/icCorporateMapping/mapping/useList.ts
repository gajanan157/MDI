import { useCallback, useEffect, useState } from "react";
import { showErrorMessage } from "@/utils/errorHandler";
import { useProviderGridPagination } from "../../../../../../shared/useProviderGridPagination";
import {
  fetchProviderNetworkMappingList,
  PROVIDER_MAPPING_TYPE_CORPORATE,
  type ProviderMappingType,
  type ProviderNetworkMappingSearchFilters,
} from "../api";
import {
  mapCorporateNetworkMappingListToGridRows,
  mapNetworkMappingListToGridRows,
} from "./network";
import type { ItemWithIdName } from "../types";

function mapRowsToGridItems(
  providerMappingType: ProviderMappingType,
  rows: Parameters<typeof mapNetworkMappingListToGridRows>[0],
): ItemWithIdName[] {
  if (providerMappingType === PROVIDER_MAPPING_TYPE_CORPORATE) {
    return mapCorporateNetworkMappingListToGridRows(rows);
  }
  return mapNetworkMappingListToGridRows(rows);
}

function withProviderMappingType(
  providerMappingType: ProviderMappingType,
  filters?: ProviderNetworkMappingSearchFilters,
): ProviderNetworkMappingSearchFilters {
  return {
    ...filters,
    providerMappingType,
  };
}

export function useProviderNetworkMappingList(
  providerId: string | undefined,
  enabled: boolean,
  providerMappingType: ProviderMappingType,
) {
  const {
    page,
    pageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  } = useProviderGridPagination();
  const [appliedFilters, setAppliedFilters] =
    useState<ProviderNetworkMappingSearchFilters>({});
  const [rows, setRows] = useState<ItemWithIdName[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadRows = useCallback(async () => {
    if (!enabled || !providerId) {
      setRows([]);
      setTotalRecords(0);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchProviderNetworkMappingList(providerId, {
        ...withProviderMappingType(providerMappingType, appliedFilters),
        page,
        size: pageSize,
      });
      if (!result.ok) {
        if (result.message) {
          showErrorMessage({ error: result.message });
        }
        setRows([]);
        setTotalRecords(0);
        return;
      }
      setRows(mapRowsToGridItems(providerMappingType, result.rows));
      setTotalRecords(result.totalRecords);
    } finally {
      setLoading(false);
    }
  }, [enabled, providerId, providerMappingType, appliedFilters, page, pageSize]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    resetPage();
    setAppliedFilters({});
  }, [providerId, providerMappingType, resetPage]);

  /** Re-fetches from the API with the search filters (Apply button). */
  const search = useCallback(
    (filters: ProviderNetworkMappingSearchFilters) => {
      setAppliedFilters(filters);
      resetPage();
    },
    [resetPage],
  );

  const reload = useCallback(async () => {
    await loadRows();
  }, [loadRows]);

  return {
    rows,
    loading,
    totalRecords,
    page,
    pageSize,
    reload,
    search,
    handlePageChange,
    handlePageSizeChange,
  };
}
