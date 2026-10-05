import { useEffect, useMemo, useState } from "react";
import { PROVIDER_GRID_DEFAULT_PAGE_SIZE } from "../../../../../../shared/providerGridPagination.constants";

/** Client-side pagination for the Facility / Manpower section grids. */
export function useSectionGridPagination<T>(rows: T[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PROVIDER_GRID_DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(rows.length / pageSize));
    setPage((current) => Math.min(current, lastPage));
  }, [rows.length, pageSize]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return {
    page,
    pageSize,
    pagedRows,
    totalItems: rows.length,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
  };
}
