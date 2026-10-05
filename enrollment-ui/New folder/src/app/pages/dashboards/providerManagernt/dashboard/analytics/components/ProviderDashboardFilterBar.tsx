import {
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  PROVIDER_DASHBOARD_CITY_OPTIONS,
  PROVIDER_DASHBOARD_HORIZON_OPTIONS,
  PROVIDER_DASHBOARD_INSURER_OPTIONS,
  PROVIDER_DASHBOARD_NETWORK_TYPE_OPTIONS,
  PROVIDER_DASHBOARD_STATE_OPTIONS,
  PROVIDER_DASHBOARD_STATUS_OPTIONS,
} from "../analyticsConfig";
import type { ProviderDashboardFilterValues } from "../analyticsTypes";

type ProviderDashboardFilterBarProps = {
  filters: ProviderDashboardFilterValues;
  onFilterChange: (key: keyof ProviderDashboardFilterValues, value: string) => void;
  onReset?: () => void;
};

export function ProviderDashboardFilterBar({
  filters,
  onFilterChange,
  onReset,
}: Readonly<ProviderDashboardFilterBarProps>) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs dark:border-dark-700 dark:bg-dark-800">
      {/* Left: Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
          <FunnelIcon className="h-3.5 w-3.5 text-blue-600" />
          <span>Filters:</span>
        </div>

        {/* Network Mode */}
        <select
          aria-label="Network Mode"
          className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-dark-600 dark:bg-dark-700 dark:text-slate-200"
          value={filters.networkType ?? "all"}
          onChange={(e) => onFilterChange("networkType", e.target.value)}
        >
          {PROVIDER_DASHBOARD_NETWORK_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Empanelment Status */}
        <select
          aria-label="Empanelment Status"
          className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-dark-600 dark:bg-dark-700 dark:text-slate-200"
          value={filters.providerStatus ?? "all"}
          onChange={(e) => onFilterChange("providerStatus", e.target.value)}
        >
          {PROVIDER_DASHBOARD_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Insurer (IC) */}
        <select
          aria-label="Insurer (IC)"
          className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-dark-600 dark:bg-dark-700 dark:text-slate-200"
          value={filters.insurer ?? "all"}
          onChange={(e) => onFilterChange("insurer", e.target.value)}
        >
          {PROVIDER_DASHBOARD_INSURER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* MOU Expiry Horizon */}
        <select
          aria-label="MOU Expiry Horizon"
          className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-dark-600 dark:bg-dark-700 dark:text-slate-200"
          value={filters.expiryHorizon ?? "all"}
          onChange={(e) => onFilterChange("expiryHorizon", e.target.value)}
        >
          {PROVIDER_DASHBOARD_HORIZON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* State */}
        <select
          aria-label="State"
          className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-dark-600 dark:bg-dark-700 dark:text-slate-200"
          value={filters.state ?? "all"}
          onChange={(e) => onFilterChange("state", e.target.value)}
        >
          {PROVIDER_DASHBOARD_STATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* City Cluster */}
        <select
          aria-label="City Cluster"
          className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-dark-600 dark:bg-dark-700 dark:text-slate-200"
          value={filters.city ?? "all"}
          onChange={(e) => onFilterChange("city", e.target.value)}
        >
          {PROVIDER_DASHBOARD_CITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-700 dark:hover:text-white"
          >
            <ArrowPathIcon className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
