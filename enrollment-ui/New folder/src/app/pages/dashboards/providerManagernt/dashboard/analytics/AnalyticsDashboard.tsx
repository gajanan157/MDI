import { useMemo, useState } from "react";
import { PROVIDER_DASHBOARD_FILTER_DEFAULTS } from "./analyticsConfig";
import type { ProviderDashboardFilterValues } from "./analyticsTypes";
import { ProviderDashboardAlertStrip } from "./components/ProviderDashboardAlertStrip";
import { ProviderDashboardAnalyticsPanel } from "./components/ProviderDashboardAnalyticsPanel";
import { ProviderDashboardCategoryStats } from "./components/ProviderDashboardCategoryStats";
import { ProviderDashboardFilterBar } from "./components/ProviderDashboardFilterBar";

export function AnalyticsDashboard() {
  const [filters, setFilters] = useState<ProviderDashboardFilterValues>(
    PROVIDER_DASHBOARD_FILTER_DEFAULTS,
  );

  const showNoData = useMemo(
    () =>
      filters.providerStatus === "pending" &&
      filters.state === "delhi" &&
      filters.city === "pune",
    [filters.providerStatus, filters.state, filters.city],
  );

  const handleFilterChange = (
    key: keyof ProviderDashboardFilterValues,
    value: string,
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(PROVIDER_DASHBOARD_FILTER_DEFAULTS);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
      {/* 1. Sleek Filter Toolbar */}
      <ProviderDashboardFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 2. Urgent Risk & Horizon Banner */}
      <ProviderDashboardAlertStrip />

      {/* 3. Executive Vitals Strip (6 compact cards) */}
      <ProviderDashboardCategoryStats />

      {/* 4. Core Governance & Cashless Operations Grid */}
      <ProviderDashboardAnalyticsPanel
        onClearFilters={handleResetFilters}
        showNoData={showNoData}
      />
    </div>
  );
}
