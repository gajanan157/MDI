import clsx from "clsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type ProviderDashboardTab = "analytics" | "inward";

type ProviderDashboardTabBarProps = {
  activeTab: ProviderDashboardTab;
  onTabChange: (tab: ProviderDashboardTab) => void;
  actions?: ReactNode;
  compact?: boolean;
};

const TABS: ProviderDashboardTab[] = ["analytics", "inward"];

export function ProviderDashboardTabBar({
  activeTab,
  onTabChange,
  actions,
  compact = false,
}: Readonly<ProviderDashboardTabBarProps>) {
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-gray-200 shadow-soft transition-all dark:bg-dark-700 dark:border-dark-600 dark:shadow-none",
        compact ? "px-2 py-1.5" : "px-3 py-2",
      )}
    >
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : <div />}

      <div
        className="inline-flex rounded-lg bg-gray-100 p-0.5 ring-1 ring-gray-200/70 dark:bg-dark-800 dark:ring-dark-600"
        role="tablist"
        aria-label={t("providerMaster.dashboard.tabs.ariaLabel")}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab)}
              className={clsx(
                "cursor-pointer rounded-md px-3.5 py-1 text-xs transition-all duration-150",
                isActive
                  ? "bg-white text-primary-600 font-medium shadow-xs ring-1 ring-gray-200/50 dark:bg-dark-700 dark:text-primary-400 dark:ring-dark-600"
                  : "text-gray-600 hover:text-gray-900 dark:text-dark-300 dark:hover:text-dark-50",
              )}
            >
              {t(`providerMaster.dashboard.tabs.${tab}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
