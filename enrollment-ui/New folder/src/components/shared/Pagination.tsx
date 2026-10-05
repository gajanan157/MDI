import { useTranslation } from "react-i18next";

export type PaginationProps = {
  page?: number; // current page (1-based)
  pageSize?: number; // items per page
  totalItems: number; // total item count
  onPageChange?: (page: number) => void; // called when page changes
  onPageSizeChange?: (size: number) => void; // called when page size changes
  pageSizeOptions?: number[];
  className?: string;
};

export default function Pagination({
  page = 1,
  pageSize = 20,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const { t } = useTranslation();

  const goTo = (newPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, newPage || 1));
    onPageChange?.(clamped);
  };

  const handlePageSizeChange = (size: number) => {
    if (Number.isNaN(size) || size <= 0) return;
    onPageSizeChange?.(size);
    // optional: jump back to page 1 when page size changes
    onPageChange?.(1);
  };

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);


  const DesktopPagination = (
    <div
      className={`hidden flex-col gap-2 text-sm sm:flex sm:flex-row sm:items-center sm:justify-end sm:gap-4 ${className} text-[11px]`}
    >
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        <span className="text-muted-foreground hidden sm:inline">
          {t("branch.paginationObj.pageSize")}:
        </span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="border-border bg-background focus:ring-primary h-8 rounded border px-2 py-1 text-center text-sm focus:ring-2 focus:outline-none sm:h-8"
          aria-label="Page size"
          title="Change page size"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Counts: on small screens this becomes compact */}
      <div className="text-muted-foreground text-center sm:text-left">
        <span className="hidden sm:inline">
          {start} to {end} of {totalItems}
        </span>
        <span className="inline sm:hidden">
          {start}-{end} / {totalItems}
        </span>
      </div>

      {/* Navigation buttons: grouped and responsive sizes */}
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <button
          onClick={() => goTo(1)}
          disabled={page === 1}
          className="border-border bg-background hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded border disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
          title="First Page"
          aria-label="First page"
        >
          <span aria-hidden>«</span>
        </button>

        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className=" border-border bg-background hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded border disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
          title="Previous Page"
          aria-label="Previous page"
        >
          <span aria-hidden>‹</span>
        </button>

        <span className="text-muted-foreground px-2 text-center">
          <span className="text-[11px]">{t("branch.paginationObj.page")}</span>
          <span className="font-medium">{page}</span>
          <span className="hidden sm:inline"> of {totalPages}</span>
          <span className="inline sm:hidden">/{totalPages}</span>
        </span>

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className="border-border bg-background hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded border disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
          title="Next Page"
          aria-label="Next page"
        >
          <span aria-hidden>›</span>
        </button>

        <button
          onClick={() => goTo(totalPages)}
          disabled={page === totalPages}
          className="border-border bg-background hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded border disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
          title="Last Page"
          aria-label="Last page"
        >
          <span aria-hidden>»</span>
        </button>
      </div>
    </div>
  );

  // --------------------------
  // Mobile-only compact JSX
  // Rendered only on xs via utility classes (block on xs, hidden on sm+)
  // This keeps the desktop markup untouched while providing a compact single-row mobile UI
  // --------------------------
  const MobilePagination = (
    <div
      className={`relative z-10 block w-full shrink-0 border-t border-gray-200 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] sm:hidden dark:border-dark-600 ${className}`}
      role="navigation"
      aria-label="Pagination (mobile)"
    >
      {/* Single row: page size + range (left) · nav (right); horizontal scroll if ultra-narrow */}
      <div className="flex min-w-0 items-stretch justify-between gap-2 text-[11px]">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <label className="text-muted-foreground sr-only" htmlFor="pagination-page-size-mobile">
             {t("branch.paginationObj.pageSize")}
          </label>
          <select
            id="pagination-page-size-mobile"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border-border bg-background h-8 w-[3.25rem] shrink-0 rounded border px-1 text-center text-[11px]"
            aria-label="Page size"
            title="Rows per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-muted-foreground min-w-0 truncate tabular-nums">
            {start}-{end}/{totalItems}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-px">
          <button
            type="button"
            onClick={() => goTo(1)}
            disabled={page === 1}
            className="border-border bg-background hover:bg-accent flex h-8 w-7 shrink-0 items-center justify-center rounded-l border border-r-0 disabled:opacity-50"
            aria-label="First page"
            title="First"
          >
            «
          </button>
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="border-border bg-background hover:bg-accent flex h-8 w-7 shrink-0 items-center justify-center border border-r-0 disabled:opacity-50"
            aria-label="Previous page"
            title="Previous"
          >
            ‹
          </button>
          <span
            className="text-muted-foreground flex h-8 min-w-[2.75rem] items-center justify-center border border-r-0 px-1 text-center tabular-nums"
            aria-live="polite"
          >
            {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="border-border bg-background hover:bg-accent flex h-8 w-7 shrink-0 items-center justify-center border border-r-0 disabled:opacity-50"
            aria-label="Next page"
            title="Next"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => goTo(totalPages)}
            disabled={page === totalPages}
            className="border-border bg-background hover:bg-accent flex h-8 w-7 shrink-0 items-center justify-center rounded-r border disabled:opacity-50"
            aria-label="Last page"
            title="Last"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );

  // Render mobile variant for xs and original for sm+
  return (
    <>
      {MobilePagination}
      {DesktopPagination}
    </>
  );
}
