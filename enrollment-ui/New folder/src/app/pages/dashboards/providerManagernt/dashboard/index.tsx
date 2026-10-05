import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ChartBarIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Page, Button, CheckListButton } from "../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { useInwardDashboard } from "./inward/useInwardDashboard";
import type { ProviderDashboardTab } from "./ProviderDashboardTabBar";

export default function ProviderDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProviderDashboardTab>("inward");
  const inward = useInwardDashboard();

  return (
    <Page title={t("providerMaster.dashboard.pageTitle", { defaultValue: "Provider Inward Dashboard" })}>
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title={t("providerMaster.dashboard.pageTitle", { defaultValue: "Provider Inward Dashboard" })}
          totalCount={inward.inwardState.totalRecords}
          countLabel="Inwards"
          badge={{ text: "Intake Pipeline", variant: "info" }}
          onRefresh={inward.inwardState.handleRefresh}
          isRefreshing={inward.inwardState.loading}
        >
          {activeTab === "inward" && (
            <>
              <CheckListButton
                onClick={inward.toggleInwardSearch}
                label={
                  inward.isInwardSearchOpen
                    ? t("providerMaster.button.hideSearch")
                    : t("providerMaster.button.search")
                }
                bgColor="bg-blue-600"
                textColor="text-white"
                size="text-xs"
                className="flex h-7 items-center justify-center gap-1.5 rounded-lg px-2.5 py-0!"
                isSearch
              />
              {inward.showCreateInward && (
                <Button
                  color="primary"
                  className="flex h-7 items-center gap-1 rounded-lg px-2.5 py-0! text-xs font-semibold"
                  onClick={() => inward.setCreateOpen(true)}
                  aria-label={t("providerMaster.dashboard.inward.createInward")}
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-0.5" />
                  {t("providerMaster.dashboard.inward.createInward")}
                </Button>
              )}
              <Button
                variant={inward.showInsights ? "filled" : "outlined"}
                color="secondary"
                className="flex h-7 items-center gap-1 rounded-lg px-2.5 py-0! text-xs font-semibold"
                onClick={() => inward.setShowInsights((prev) => !prev)}
                title="Toggle visual summary insights"
              >
                <ChartBarIcon className="w-3.5 h-3.5 mr-0.5" />
                {inward.showInsights ? "Hide Insights" : "Insights"}
              </Button>
            </>
          )}

          {/* Tab Switcher: Inward Dashboard vs Analytics Dashboard */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-dark-800 border border-slate-200 dark:border-dark-700">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "inward"}
              onClick={() => setActiveTab("inward")}
              className={clsx(
                "cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                activeTab === "inward"
                  ? "bg-white text-blue-600 shadow-2xs dark:bg-dark-700 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-dark-300"
              )}
            >
              {t("providerMaster.dashboard.tabs.inward", { defaultValue: "Inward Dashboard" })}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
              className={clsx(
                "cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                activeTab === "analytics"
                  ? "bg-white text-blue-600 shadow-2xs dark:bg-dark-700 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-dark-300"
              )}
            >
              {t("providerMaster.dashboard.tabs.analytics", { defaultValue: "Analytics Dashboard" })}
            </button>
          </div>
        </CompactPageHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeTab === "analytics" ? (
            <AnalyticsDashboard />
          ) : (
            inward.content
          )}
        </div>
      </div>
    </Page>
  );
}
