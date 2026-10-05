import clsx from "clsx";
import { MapPinIcon } from "@heroicons/react/24/solid";
import {
  ProviderChangeBadge,
  ProviderChartPanel,
} from "../../../shared/dashboard";
import type {
  ProviderDashboardDrillDownDetail,
  ProviderDashboardDrillDownTab,
} from "../analyticsTypes";

type ProviderDashboardDrillDownProps = {
  activeTab: ProviderDashboardDrillDownTab;
  detail: ProviderDashboardDrillDownDetail;
  onTabChange: (tab: ProviderDashboardDrillDownTab) => void;
  fillHeight?: boolean;
};

const DRILL_DOWN_TABS: { id: ProviderDashboardDrillDownTab; label: string }[] = [
  { id: "state", label: "By State" },
  { id: "city", label: "By City" },
  { id: "ic", label: "By IC" },
];

function MapPlaceholder() {
  return (
    <div className="relative flex h-full min-h-[72px] items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-blue-50 to-emerald-50">
      <svg
        viewBox="0 0 200 240"
        className="h-full w-full max-w-[120px] text-blue-200"
        aria-hidden
      >
        <path
          d="M60 20 L140 30 L170 80 L155 140 L120 200 L70 210 L40 150 L30 90 Z"
          fill="currentColor"
          stroke="#93c5fd"
          strokeWidth="2"
        />
      </svg>
      <MapPinIcon className="absolute h-6 w-6 text-rose-500 drop-shadow" />
    </div>
  );
}

export function ProviderDashboardDrillDown({
  activeTab,
  detail,
  onTabChange,
  fillHeight = false,
}: Readonly<ProviderDashboardDrillDownProps>) {
  return (
    <ProviderChartPanel
      title="Drill-down Insights"
      subtitle="Explore metrics by geography or insurer"
      fillHeight={fillHeight}
      className="h-full"
    >
      <div className="mb-2 flex shrink-0 flex-wrap gap-1 border-b border-gray-100 pb-2">
        {DRILL_DOWN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "rounded-md px-2 py-1 text-[11px] font-medium transition",
              activeTab === tab.id
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className={clsx(
          "grid min-h-0 grid-cols-[1.1fr_1fr] gap-2",
          fillHeight && "flex-1",
        )}
      >
        <div className="flex min-h-0 flex-col rounded-md border border-gray-100 bg-gray-50 p-2">
          <div className="min-h-0 flex-1">
            <MapPlaceholder />
          </div>
          <p className="mt-1.5 text-center text-xs font-semibold text-gray-800">
            {detail.title}
          </p>
          <p className="text-center text-[10px] text-gray-500">{detail.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {detail.metrics.map((metric) => (
            <div
              key={metric.id}
              className="rounded-md border border-gray-100 bg-white px-2 py-1.5"
            >
              <p className="text-[10px] font-medium text-gray-500">{metric.label}</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-900">
                {metric.value}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-gray-500">{metric.subLabel}</span>
                {metric.changePercent !== undefined ? (
                  <ProviderChangeBadge
                    changePercent={metric.changePercent}
                    variant="plain"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProviderChartPanel>
  );
}
