import { useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  PROVIDER_INWARD_CHART_BODY_HEIGHT,
  PROVIDER_INWARD_CHART_CARD_CLASS,
} from "../../providerDashboardLayout";
import { ProviderDashboardChartCard } from "./ProviderDashboardChartCard";
import { ProviderProgressBar } from "../../../shared/dashboard";

type ViewMode = "sla" | "type";

type ProviderInwardSlaBreakdownProps = {
  totalInward?: number;
  inCard?: boolean;
};

const SLA_TIERS = [
  {
    key: "onTrack",
    label: "< 4 hrs (On Track)",
    count: 2,
    percent: 50,
    color: "#10b981",
    textColor: "text-success-darker dark:text-success-lighter",
    icon: CheckCircleIcon,
  },
  {
    key: "warning",
    label: "4–12 hrs (Warning)",
    count: 1,
    percent: 25,
    color: "#f59e0b",
    textColor: "text-warning-darker dark:text-warning-lighter",
    icon: ClockIcon,
  },
  {
    key: "breached",
    label: "> 24 hrs (Escalated)",
    count: 1,
    percent: 25,
    color: "#f43f5e",
    textColor: "text-error-darker dark:text-error-lighter",
    icon: ExclamationCircleIcon,
  },
];

const CATEGORY_TIERS = [
  { key: "icMapping", label: "IC Provider Mapping", count: 1, percent: 25, color: "#3b82f6" },
  { key: "empanelment", label: "Empanelment Req.", count: 1, percent: 25, color: "#8b5cf6" },
  { key: "tariff", label: "Tariff Revision", count: 1, percent: 25, color: "#10b981" },
  { key: "mandate", label: "Bank Mandate", count: 1, percent: 25, color: "#f97316" },
];

export function ProviderInwardSlaBreakdown({
  inCard = true,
}: Readonly<ProviderInwardSlaBreakdownProps>) {
  const [viewMode, setViewMode] = useState<ViewMode>("sla");

  const headerAction = (
    <div className="flex items-center gap-0.5 rounded bg-gray-100 dark:bg-dark-600 p-0.5 text-tiny font-medium text-gray-600 dark:text-dark-300">
      <button
        type="button"
        onClick={() => setViewMode("sla")}
        className={clsx(
          "cursor-pointer rounded px-1.5 py-0.5 transition",
          viewMode === "sla"
            ? "bg-white font-semibold text-gray-900 shadow-soft dark:bg-dark-700 dark:text-dark-50 dark:shadow-none"
            : "hover:text-gray-900 dark:hover:text-dark-50",
        )}
      >
        SLA
      </button>
      <button
        type="button"
        onClick={() => setViewMode("type")}
        className={clsx(
          "cursor-pointer rounded px-1.5 py-0.5 transition",
          viewMode === "type"
            ? "bg-white font-semibold text-gray-900 shadow-soft dark:bg-dark-700 dark:text-dark-50 dark:shadow-none"
            : "hover:text-gray-900 dark:hover:text-dark-50",
        )}
      >
        Types
      </button>
    </div>
  );

  const content = (
    <div
      className={clsx(
        "flex h-full min-h-0 flex-1 flex-col justify-between py-0.5",
        PROVIDER_INWARD_CHART_BODY_HEIGHT,
      )}
    >
      {viewMode === "sla"
        ? SLA_TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.key}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_36px] items-center gap-x-1.5"
              >
                <div className="flex min-w-0 items-center gap-1">
                  <Icon className={clsx("size-3 shrink-0", tier.textColor)} aria-hidden="true" />
                  <span className="truncate text-tiny font-medium text-gray-700 dark:text-dark-200">
                    {tier.label}
                  </span>
                </div>
                <div className="min-w-0">
                  <ProviderProgressBar
                    value={tier.percent}
                    heightClassName="h-1.5"
                    trackClassName="rounded-full bg-gray-100 dark:bg-dark-600"
                    barClassName="rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                </div>
                <span className="text-right text-tiny font-semibold tabular-nums text-gray-900 dark:text-dark-50">
                  {tier.count}{" "}
                  <span className="font-normal text-gray-400 dark:text-dark-400">({tier.percent}%)</span>
                </span>
              </div>
            );
          })
        : CATEGORY_TIERS.map((tier) => (
            <div
              key={tier.key}
              className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_36px] items-center gap-x-1.5"
            >
              <div className="flex min-w-0 items-center gap-1">
                <DocumentDuplicateIcon className="size-3 shrink-0 text-gray-500 dark:text-dark-300" aria-hidden="true" />
                <span className="truncate text-tiny font-medium text-gray-700 dark:text-dark-200">
                  {tier.label}
                </span>
              </div>
              <div className="min-w-0">
                <ProviderProgressBar
                  value={tier.percent}
                  heightClassName="h-1.5"
                  trackClassName="rounded-full bg-gray-100 dark:bg-dark-600"
                  barClassName="rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
              </div>
              <span className="text-right text-tiny font-semibold tabular-nums text-gray-900 dark:text-dark-50">
                {tier.count}{" "}
                <span className="font-normal text-gray-400 dark:text-dark-400">({tier.percent}%)</span>
              </span>
            </div>
          ))}
    </div>
  );

  if (!inCard) return content;

  return (
    <ProviderDashboardChartCard
      title={viewMode === "sla" ? "Turnaround Time (SLA)" : "Inward Request Types"}
      action={headerAction}
      className={PROVIDER_INWARD_CHART_CARD_CLASS}
      fillHeight
    >
      {content}
    </ProviderDashboardChartCard>
  );
}
