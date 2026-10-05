import {
    CheckCircleIcon,
    ClockIcon,
    Cog6ToothIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    PROVIDER_INWARD_CHART_BODY_HEIGHT,
    PROVIDER_INWARD_CHART_CARD_CLASS,
} from "../../providerDashboardLayout";
import type { ProviderInwardCardKey } from "../providerInwardTypes";
import { ProviderDashboardChartCard } from "./ProviderDashboardChartCard";

type ProviderInwardStatusBadgesProps = {
    pending: number;
    processing: number;
    completed: number;
    rejected: number;
    title?: string;
    activeCard?: ProviderInwardCardKey;
    inwardStatusFilter?: ProviderInwardCardKey | null;
    onStatusClick?: (card: ProviderInwardCardKey) => void;
    inCard?: boolean;
};

const STATUS_BADGES = [
    {
        key: "pending",
        cardKey: "PENDING",
        icon: ClockIcon,
        rowClass: "bg-warning/10 border border-warning/30 text-warning-darker dark:bg-warning/20 dark:border-warning/40 dark:text-warning-lighter hover:bg-warning/15",
        activeClass: "ring-2 ring-warning shadow-soft dark:shadow-none",
        iconClass: "text-warning",
    },
    {
        key: "processing",
        cardKey: "PROCESSING",
        icon: Cog6ToothIcon,
        rowClass: "bg-warning-darker/10 border border-warning-darker/30 text-warning-darker dark:bg-warning-darker/20 dark:border-warning-darker/40 dark:text-warning-lighter hover:bg-warning-darker/15",
        activeClass: "ring-2 ring-warning-darker shadow-soft dark:shadow-none",
        iconClass: "text-warning-darker",
    },
    {
        key: "completed",
        cardKey: "COMPLETED",
        icon: CheckCircleIcon,
        rowClass: "bg-success/10 border border-success/30 text-success-darker dark:bg-success/20 dark:border-success/40 dark:text-success-lighter hover:bg-success/15",
        activeClass: "ring-2 ring-success shadow-soft dark:shadow-none",
        iconClass: "text-success",
    },
    {
        key: "rejected",
        cardKey: "REJECTED",
        icon: XCircleIcon,
        rowClass: "bg-error/10 border border-error/30 text-error-darker dark:bg-error/20 dark:border-error/40 dark:text-error-lighter hover:bg-error/15",
        activeClass: "ring-2 ring-error shadow-soft dark:shadow-none",
        iconClass: "text-error",
    },
] as const;

function resolveActiveStatusKey(
    activeCard: ProviderInwardCardKey | undefined,
    inwardStatusFilter: ProviderInwardCardKey | null | undefined,
): ProviderInwardCardKey | null {
    if (activeCard === "TODAY") return inwardStatusFilter ?? null;
    if (activeCard && activeCard !== "TOTAL") return activeCard;
    return null;
}

export function ProviderInwardStatusBadges({
    pending,
    processing,
    completed,
    rejected,
    title,
    activeCard,
    inwardStatusFilter,
    onStatusClick,
    inCard = false,
}: Readonly<ProviderInwardStatusBadgesProps>) {
    const { t } = useTranslation();
    const counts = useMemo(
        () => ({ pending, processing, completed, rejected }),
        [completed, pending, processing, rejected],
    );
    const total = pending + processing + completed + rejected || 1;

    const rows = useMemo(
        () =>
            STATUS_BADGES.map((badge) => ({
                ...badge,
                count: counts[badge.key],
                percent: ((counts[badge.key] / total) * 100).toFixed(1),
            })),
        [counts, total],
    );

    const activeStatusKey = resolveActiveStatusKey(activeCard, inwardStatusFilter);

    const content = (
        <div
            className={clsx(
                "flex gap-1.5",
                inCard
                    ? `h-full min-h-0 flex-1 flex-col justify-between ${PROVIDER_INWARD_CHART_BODY_HEIGHT}`
                    : "flex-wrap items-center",
            )}
        >
            {rows.map((badge) => {
                const Icon = badge.icon;
                const isActive = activeStatusKey === badge.cardKey;

                const rowBody = (
                    <>
                        <span className="flex min-w-0 items-center gap-1.5">
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white dark:bg-dark-700 shadow-2xs ring-1 ring-black/5 dark:ring-white/10">
                                <Icon className={clsx("size-2.5", badge.iconClass)} aria-hidden="true" />
                            </span>
                            <span className="truncate font-semibold text-gray-800 dark:text-dark-100 text-tiny">
                                {t(`providerMaster.dashboard.inward.cards.${badge.key}`)}
                            </span>
                        </span>
                        <span className="shrink-0 tabular-nums">
                            <span className="font-bold text-gray-900 dark:text-dark-50 text-tiny">{badge.count.toLocaleString()}</span>
                            {inCard ? (
                                <span className="ml-1 font-medium text-gray-500 dark:text-dark-300 text-tiny">({badge.percent}%)</span>
                            ) : null}
                        </span>
                    </>
                );

                const rowClassName = clsx(
                    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-150 select-none",
                    inCard ? "min-h-[22px] flex-1 text-tiny-plus" : "inline-flex px-2 py-0.5 text-tiny",
                    badge.rowClass,
                    isActive
                        ? clsx("font-semibold", badge.activeClass)
                        : "opacity-95",
                    onStatusClick && "hover:scale-[1.01] active:scale-[0.99]",
                );

                if (onStatusClick) {
                    return (
                        <button
                            key={badge.key}
                            type="button"
                            title={t(`providerMaster.dashboard.inward.cards.${badge.key}`)}
                            onClick={() => onStatusClick(badge.cardKey)}
                            className={clsx(rowClassName, "w-full cursor-pointer text-left")}
                        >
                            {rowBody}
                        </button>
                    );
                }

                return (
                    <div key={badge.key} className={rowClassName}>
                        {rowBody}
                    </div>
                );
            })}
        </div>
    );

    if (!inCard) return content;

    return (
        <ProviderDashboardChartCard
            title={title ?? t("providerMaster.dashboard.inward.charts.todayStatus")}
            className={PROVIDER_INWARD_CHART_CARD_CLASS}
            fillHeight
        >
            {content}
        </ProviderDashboardChartCard>
    );
}
