import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { ProviderAvatarStack } from "../../../shared/dashboard";
import type { ProviderInwardRow } from "../providerInwardTypes";
import { fetchInwardTaskSummary } from "./providerInwardTaskMockData";
import type { ProviderInwardTaskSummary } from "./providerInwardTaskTypes";

type ProviderInwardAssignedToCellProps = {
    row: ProviderInwardRow;
    onAssignClick: (row: ProviderInwardRow) => void;
    refreshKey?: number;
};

const MAX_VISIBLE_ASSIGNEES = 2;

export function ProviderInwardAssignedToCell({
    row,
    onAssignClick,
    refreshKey = 0,
}: Readonly<ProviderInwardAssignedToCellProps>) {
    const { t } = useTranslation();
    const [summary, setSummary] = useState<ProviderInwardTaskSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetchInwardTaskSummary(row.inwardNo, row.subcategory)
            .then((next) => {
                if (active) {
                    setSummary(next);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [refreshKey, row.inwardNo, row.subcategory]);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center gap-1.5">
                <div className="size-6 animate-pulse rounded-full bg-gray-200 dark:bg-dark-600" />
                <div className="h-3 w-14 animate-pulse rounded bg-gray-200 dark:bg-dark-600" />
            </div>
        );
    }

    if (!summary) return null;

    const showAssignButton =
        summary.hasUnassignedPending && summary.assignees.length === 0;

    if (showAssignButton) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <button
                    type="button"
                    className="inline-flex max-w-full cursor-pointer items-center gap-0.5 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-tiny font-medium leading-none text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                    onClick={(event) => {
                        event.stopPropagation();
                        onAssignClick(row);
                    }}
                >
                    <UserPlusIcon className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                        {t("providerMaster.dashboard.inward.taskAssignment.assignTasks")}
                    </span>
                </button>
            </div>
        );
    }

    if (summary.assignees.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <span className="text-tiny font-medium text-slate-400">
                    {t("providerMaster.dashboard.inward.taskAssignment.unassigned")}
                </span>
            </div>
        );
    }

    return (
        <div className="flex h-full min-w-0 items-center justify-center gap-1">
            <ProviderAvatarStack
                max={MAX_VISIBLE_ASSIGNEES}
                items={summary.assignees.map((assignee) => ({
                    id: assignee.id,
                    initials: assignee.initials,
                    colorClass: assignee.avatarColor,
                    title: assignee.name,
                }))}
            />
            <button
                type="button"
                className="shrink-0 cursor-pointer rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-tiny font-medium leading-none text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
                onClick={(event) => {
                    event.stopPropagation();
                    onAssignClick(row);
                }}
            >
                {t("providerMaster.dashboard.inward.taskAssignment.manage")}
            </button>
        </div>
    );
}
