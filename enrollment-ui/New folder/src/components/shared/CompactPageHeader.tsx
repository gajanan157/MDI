import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export interface CompactPageHeaderProps {
  /** Page or section title */
  title: string;
  /** Optional record count to display in a pill badge */
  totalRecords?: number | string | null;
  /** Optional record count label (defaults to "Records") */
  recordLabel?: string;
  /** Optional status or system badge */
  statusBadge?: string;
  /** Optional refresh callback */
  onRefresh?: () => void;
  /** Refreshing loading state */
  isRefreshing?: boolean;
  /** Right-side action elements (e.g., Search toggle, Add button, Export) */
  children?: React.ReactNode;
  /** Custom extra classes */
  className?: string;
}

/**
 * Universal B2B Compact Page Header.
 * Provides a standardized, high-density top action bar across all pages
 * with consistent typography, record count pill, and action button alignment.
 */
export default function CompactPageHeader({
  title,
  totalRecords,
  recordLabel = "Records",
  statusBadge,
  onRefresh,
  isRefreshing = false,
  children,
  className = "",
}: Readonly<CompactPageHeaderProps>) {
  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-3 py-1.5 rounded-lg shadow-2xs dark:border-dark-700 dark:bg-dark-800 ${className}`}
    >
      {/* Left: Title & Count Chips */}
      <div className="flex items-center gap-2.5 min-w-0">
        <h1 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
          {title}
        </h1>

        {totalRecords !== undefined && totalRecords !== null && (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-dark-700 dark:text-slate-300">
            <span>Total:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-bold">
              {typeof totalRecords === "number"
                ? totalRecords.toLocaleString()
                : totalRecords}
            </strong>
            <span className="text-slate-400 font-normal">{recordLabel}</span>
          </span>
        )}

        {statusBadge && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {statusBadge}
          </span>
        )}
      </div>

      {/* Right: Actions (Search, Add, Refresh, etc.) */}
      <div className="flex items-center gap-2 shrink-0">
        {children}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 cursor-pointer dark:border-dark-600 dark:bg-dark-800 dark:text-slate-200"
            title="Refresh records"
          >
            <ArrowPathIcon
              className={`h-3.5 w-3.5 ${
                isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"
              }`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? "Syncing..." : "Sync"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
