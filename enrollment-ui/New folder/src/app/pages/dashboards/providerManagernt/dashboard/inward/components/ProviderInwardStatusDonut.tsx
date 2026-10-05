import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import {
    PROVIDER_INWARD_CHART_BODY_HEIGHT,
    PROVIDER_INWARD_CHART_CARD_CLASS,
    PROVIDER_INWARD_DONUT_CHART_SIZE,
} from "../../providerDashboardLayout";
import {
    createProviderInwardDonutTooltipContent,
    PROVIDER_INWARD_RECHARTS_TOOLTIP_PROPS,
} from "./providerInwardChartTooltipConfig";
import { ProviderDashboardChartCard } from "./ProviderDashboardChartCard";
import { ProviderInwardStatusLegend } from "./ProviderInwardStatusLegend";
import type { ProviderInwardDonutSlice } from "../providerInwardDashboardDummyData";
import type { ProviderInwardCardKey } from "../providerInwardTypes";

type ProviderInwardStatusDonutProps = {
    slices: ProviderInwardDonutSlice[];
    total: number;
    title?: string;
    activeStatusKey?: ProviderInwardCardKey | null;
    onStatusClick?: (status: ProviderInwardCardKey) => void;
};

const SLICE_STROKE = "#ffffff";

export function ProviderInwardStatusDonut({
    slices,
    total,
    title,
    activeStatusKey = null,
    onStatusClick,
}: Readonly<ProviderInwardStatusDonutProps>) {
    const { t } = useTranslation();
    const chartTitle =
        title ?? t("providerMaster.dashboard.inward.charts.todayStatusOverview");

    const legend = useMemo(() => {
        const sum = slices.reduce((acc, slice) => acc + slice.value, 0) || 1;
        return slices.map((slice) => ({
            ...slice,
            percent: ((slice.value / sum) * 100).toFixed(1),
        }));
    }, [slices]);

    const chartData = useMemo(() => {
        const activeSlices = slices.filter((slice) => slice.value > 0);
        if (activeSlices.length > 0) return activeSlices;
        return [{ name: "—", value: 1, color: "#e5e7eb", key: "PENDING" as const }];
    }, [slices]);

    const hasData = slices.some((slice) => slice.value > 0);

    const renderTooltip = useMemo(
        () => createProviderInwardDonutTooltipContent(total),
        [total],
    );

    return (
        <ProviderDashboardChartCard
            title={chartTitle}
            className={PROVIDER_INWARD_CHART_CARD_CLASS}
            fillHeight
        >
            <div
                className={`flex h-full w-full min-h-0 flex-1 items-center justify-between gap-2 overflow-hidden ${PROVIDER_INWARD_CHART_BODY_HEIGHT}`}
            >
                <ProviderInwardStatusLegend
                    items={legend}
                    activeStatusKey={activeStatusKey}
                    onStatusClick={onStatusClick}
                />

                <div className={`relative ml-auto ${PROVIDER_INWARD_DONUT_CHART_SIZE}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="42%"
                                outerRadius="96%"
                                paddingAngle={hasData ? 2 : 0}
                                stroke={SLICE_STROKE}
                                strokeWidth={2}
                                isAnimationActive={false}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.key} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={renderTooltip} {...PROVIDER_INWARD_RECHARTS_TOOLTIP_PROPS} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
                        <span className="text-sm font-bold tabular-nums leading-none text-gray-900 dark:text-dark-50">
                            {total.toLocaleString()}
                        </span>
                        <span className="mt-0.5 text-tiny font-medium leading-none text-gray-500 dark:text-dark-300">
                            {t("providerMaster.dashboard.inward.charts.total")}
                        </span>
                    </div>
                </div>
            </div>
        </ProviderDashboardChartCard>
    );
}
