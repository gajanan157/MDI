import clsx from "clsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ProviderInwardCardKey } from "../providerInwardTypes";
import type { ProviderInwardDonutSlice } from "../providerInwardDashboardDummyData";

const LEGEND_LABEL_KEYS = {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    REJECTED: "rejected",
} as const;

export type InwardStatusLegendItem = ProviderInwardDonutSlice & {
    percent: string;
};

type ProviderInwardStatusLegendProps = {
    items: InwardStatusLegendItem[];
    activeStatusKey?: ProviderInwardCardKey | null;
    onStatusClick?: (status: ProviderInwardCardKey) => void;
};

const STATUS_ACCENT_LEFT: Partial<Record<ProviderInwardCardKey, string>> = {
    PENDING: "border-l-warning",
    PROCESSING: "border-l-warning-darker",
    COMPLETED: "border-l-success",
    REJECTED: "border-l-error",
    TODAY: "border-l-info",
    TOTAL: "border-l-primary-600",
};

export function ProviderInwardStatusLegend({
    items,
    activeStatusKey = null,
    onStatusClick,
}: Readonly<ProviderInwardStatusLegendProps>) {
    const { t } = useTranslation();

    return (
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0 pr-1">
            {items.map((item) => {
                const labelKey = LEGEND_LABEL_KEYS[item.key];
                const isActive = activeStatusKey === item.key;
                const label = t(`providerMaster.dashboard.inward.cards.${labelKey}`);

                const content: ReactNode = (
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5 w-full">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <span
                                className="size-2 shrink-0 rounded-full shadow-2xs ring-1 ring-black/10"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                            />
                            <span className="truncate font-medium text-gray-700 dark:text-dark-200">{label}</span>
                        </div>
                        <span className="shrink-0 tabular-nums text-gray-900 dark:text-dark-50 text-right">
                            <span className="font-bold">{item.value.toLocaleString()}</span>{" "}
                            <span className="font-normal text-gray-400 dark:text-dark-400 text-tiny">({item.percent}%)</span>
                        </span>
                    </div>
                );

                if (!onStatusClick) {
                    return (
                        <div key={item.key} className="flex items-center text-tiny leading-tight">
                            {content}
                        </div>
                    );
                }

                return (
                    <button
                        key={item.key}
                        type="button"
                        title={label}
                        onClick={() => onStatusClick(item.key)}
                        className={clsx(
                            "flex w-full cursor-pointer items-center rounded-md px-1.5 py-1 text-left text-tiny leading-tight transition-all duration-150",
                            isActive
                                ? clsx(
                                    "bg-white shadow-soft ring-1 ring-gray-300 font-semibold border-l-2 dark:bg-dark-600 dark:ring-dark-500 dark:shadow-none",
                                    STATUS_ACCENT_LEFT[item.key] ?? "border-l-primary-600",
                                )
                                : "bg-transparent hover:bg-gray-100 text-gray-600 dark:text-dark-300 dark:hover:bg-dark-600/70",
                        )}
                    >
                        {content}
                    </button>
                );
            })}
        </div>
    );
}
