import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    PROVIDER_INWARD_WORKLOAD_BY_USER,
    type ProviderInwardWorkloadUser,
} from "../providerInwardDashboardDummyData";
import {
    PROVIDER_INWARD_CHART_ROW_CLASS,
    PROVIDER_INWARD_CHART_ROW_ITEM_CLASS,
    PROVIDER_INWARD_CHART_ROW_TODAY_CLASS,
} from "../../providerDashboardLayout";
import {
    buildInwardDonutChartData,
    resolveInwardDonutTitle,
    resolveInwardStatusBreakup,
    resolveTodayInwardStatusPanelTitle,
    shouldShowTodayInwardStatusPanel,
} from "../providerInwardChartData";
import type {
    ProviderInwardCardKey,
    ProviderInwardStatusCounts,
    ProviderInwardTodayBreakup,
} from "../providerInwardTypes";
import { ProviderInwardStatusBadges } from "./ProviderInwardStatusBadges";
import { ProviderInwardStatusDonut } from "./ProviderInwardStatusDonut";
import { ProviderInwardWorkloadByUser } from "./ProviderInwardWorkloadByUser";

type ProviderInwardChartRowProps = {
    activeCard: ProviderInwardCardKey;
    counts: ProviderInwardStatusCounts;
    todayBreakup: ProviderInwardTodayBreakup;
    inwardStatusFilter?: ProviderInwardCardKey | null;
    onInwardStatusSelect?: (status: ProviderInwardCardKey) => void;
    workloadUsers?: ProviderInwardWorkloadUser[];
};

export function ProviderInwardChartRow({
    activeCard,
    counts,
    todayBreakup,
    inwardStatusFilter = null,
    onInwardStatusSelect,
    workloadUsers = PROVIDER_INWARD_WORKLOAD_BY_USER,
}: Readonly<ProviderInwardChartRowProps>) {
    const { t } = useTranslation();
    const isTodayView = shouldShowTodayInwardStatusPanel(activeCard);

    const { slices, total } = useMemo(
        () => buildInwardDonutChartData(activeCard, counts, todayBreakup),
        [activeCard, counts, todayBreakup],
    );

    const todayStatusBreakup = useMemo(
        () => resolveInwardStatusBreakup("TODAY", counts, todayBreakup),
        [counts, todayBreakup],
    );

    const donutTitle = useMemo(
        () => resolveInwardDonutTitle(activeCard, t),
        [activeCard, t],
    );

    const todayStatusPanelTitle = useMemo(
        () => resolveTodayInwardStatusPanelTitle(t),
        [t],
    );

    return (
        <div
            className={
                isTodayView
                    ? PROVIDER_INWARD_CHART_ROW_TODAY_CLASS
                    : PROVIDER_INWARD_CHART_ROW_CLASS
            }
        >
            <div className={PROVIDER_INWARD_CHART_ROW_ITEM_CLASS}>
                <ProviderInwardStatusDonut
                    slices={slices}
                    total={total}
                    title={donutTitle}
                    activeStatusKey={isTodayView ? inwardStatusFilter : (activeCard !== "TOTAL" ? activeCard : null)}
                    onStatusClick={onInwardStatusSelect}
                />
            </div>
            <div className={PROVIDER_INWARD_CHART_ROW_ITEM_CLASS}>
                <ProviderInwardWorkloadByUser users={workloadUsers} />
            </div>
            {isTodayView ? (
                <div className={PROVIDER_INWARD_CHART_ROW_ITEM_CLASS}>
                    <ProviderInwardStatusBadges
                        inCard
                        title={todayStatusPanelTitle}
                        pending={todayStatusBreakup.pending}
                        processing={todayStatusBreakup.processing}
                        completed={todayStatusBreakup.completed}
                        rejected={todayStatusBreakup.rejected}
                        activeCard={activeCard}
                        inwardStatusFilter={inwardStatusFilter}
                        onStatusClick={onInwardStatusSelect}
                    />
                </div>
            ) : null}
        </div>
    );
}
