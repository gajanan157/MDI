import { useCallback, useState } from "react";
import { PROVIDER_GRID_DEFAULT_PAGE_SIZE } from "./providerGridPagination.constants";

/**
 * Shared page / page-size state for provider management grids.
 * Does not fetch data — callers keep domain load logic local.
 */
export function useProviderGridPagination(
  initialPageSize: number = PROVIDER_GRID_DEFAULT_PAGE_SIZE,
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPage,
    handlePageChange,
    handlePageSizeChange,
  };
}
