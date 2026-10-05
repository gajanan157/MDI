import { useMemo } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
    getProviderInwardWorkloadBarColor,
    type ProviderInwardWorkloadUser,
} from "../providerInwardDashboardDummyData";
import {
    PROVIDER_INWARD_CHART_BODY_HEIGHT,
    PROVIDER_INWARD_CHART_CARD_CLASS,
} from "../../providerDashboardLayout";
import { ProviderDashboardChartCard } from "./ProviderDashboardChartCard";
import { ProviderProgressBar } from "../../../shared/dashboard";

import clsx from "clsx";

const MAX_VISIBLE_USERS = 10;
const USERS_PER_COLUMN = 5;

type WorkloadRow = ProviderInwardWorkloadUser & {
    widthPercent: number;
    color: string;
};

type ProviderInwardWorkloadByUserProps = {
    users: ProviderInwardWorkloadUser[];
    onViewAll?: () => void;
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

const AVATAR_COLORS = [
    "bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300",
    "bg-info-100 text-info-700 dark:bg-info-950/60 dark:text-info-300",
    "bg-warning-100 text-warning-700 dark:bg-warning-950/60 dark:text-warning-300",
    "bg-success-100 text-success-700 dark:bg-success-950/60 dark:text-success-300",
    "bg-gray-100 text-gray-700 dark:bg-dark-600 dark:text-dark-200",
    "bg-primary-50 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200",
    "bg-info-50 text-info-800 dark:bg-info-900/50 dark:text-info-200",
    "bg-warning-50 text-warning-800 dark:bg-warning-900/50 dark:text-warning-200",
    "bg-success-50 text-success-800 dark:bg-success-900/50 dark:text-success-200",
    "bg-gray-200 text-gray-800 dark:bg-dark-500 dark:text-dark-100",
];

function WorkloadUserRow({ row, index }: Readonly<{ row: WorkloadRow; index: number }>) {
    const initials = getInitials(row.name);
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

    return (
        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_18px] items-center gap-x-1.5 py-0.5">
            <div className="flex min-w-0 items-center gap-1">
                <span
                    className={clsx(
                        "flex size-4 shrink-0 items-center justify-center rounded-full text-tiny font-bold shadow-2xs ring-1 ring-black/5 dark:ring-white/10",
                        avatarColor,
                    )}
                >
                    {initials}
                </span>
                <span className="truncate text-tiny font-medium leading-none text-gray-800 dark:text-dark-100" title={row.name}>
                    {row.name}
                </span>
            </div>
            <div className="min-w-0">
                <ProviderProgressBar
                    value={row.widthPercent}
                    heightClassName="h-1.5"
                    trackClassName="rounded-full bg-gray-100 dark:bg-dark-600"
                    barClassName="rounded-full shadow-2xs transition-all duration-300"
                    style={{ backgroundColor: row.color }}
                />
            </div>
            <span className="text-right text-tiny font-bold tabular-nums leading-none text-gray-900 dark:text-dark-50">
                {row.count}
            </span>
        </div>
    );
}

export function ProviderInwardWorkloadByUser({
    users,
    onViewAll,
}: Readonly<ProviderInwardWorkloadByUserProps>) {
    const { t } = useTranslation();

    const columns = useMemo(() => {
        const visibleUsers = users.slice(0, MAX_VISIBLE_USERS);
        const maxCount = Math.max(...visibleUsers.map((user) => user.count), 1);
        const rows: WorkloadRow[] = visibleUsers.map((user, index) => ({
            ...user,
            widthPercent: (user.count / maxCount) * 100,
            color: getProviderInwardWorkloadBarColor(index),
        }));

        return [rows.slice(0, USERS_PER_COLUMN), rows.slice(USERS_PER_COLUMN, MAX_VISIBLE_USERS)];
    }, [users]);

    return (
        <ProviderDashboardChartCard
            title={t("providerMaster.dashboard.inward.charts.workloadByUser")}
            className={PROVIDER_INWARD_CHART_CARD_CLASS}
            fillHeight
        >
            <div className={`flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden ${PROVIDER_INWARD_CHART_BODY_HEIGHT}`}>
                <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] overflow-hidden">
                    <div className="flex h-full min-w-0 flex-col justify-between py-0.5 pr-1.5">
                        {columns[0].map((row, i) => (
                            <WorkloadUserRow key={row.name} row={row} index={i} />
                        ))}
                    </div>
                    <div className="my-0.5 w-px self-stretch bg-gray-200 dark:bg-dark-600" aria-hidden="true" />
                    <div className="flex h-full min-w-0 flex-col justify-between py-0.5 pl-1.5">
                        {columns[1].map((row, i) => (
                            <WorkloadUserRow key={row.name} row={row} index={USERS_PER_COLUMN + i} />
                        ))}
                    </div>
                </div>

                <div className="flex shrink-0 justify-end pt-px">
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="inline-flex cursor-pointer items-center gap-0.5 text-tiny font-medium leading-none text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
                    >
                        {t("providerMaster.dashboard.inward.charts.viewAllUsers")}
                        <ArrowRightIcon className="size-3" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </ProviderDashboardChartCard>
    );
}
