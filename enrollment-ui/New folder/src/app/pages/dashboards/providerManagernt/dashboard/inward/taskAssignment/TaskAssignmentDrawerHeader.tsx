import type { TFunction } from "i18next";
import { ClipboardDocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CopyButton } from "@/components/ui";
import { ProviderProgressBar } from "../../../shared/dashboard";
import { resolveWorkflowName } from "./taskAssignmentConfig";

type TaskAssignmentDrawerHeaderProps = {
    inwardNo: string;
    providerName: string;
    subcategory: string;
    progressPercent: number;
    onClose: () => void;
    t: TFunction;
};

export function TaskAssignmentDrawerHeader({
    inwardNo,
    providerName,
    subcategory,
    progressPercent,
    onClose,
    t,
}: Readonly<TaskAssignmentDrawerHeaderProps>) {
    const workflowName = resolveWorkflowName(subcategory);

    return (
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        <h2 className="text-base font-semibold tracking-tight text-slate-900">
                            {t("providerMaster.dashboard.inward.taskAssignment.title")}
                        </h2>
                        <div className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-2 py-1">
                            <span className="font-mono text-[12px] font-semibold text-blue-700">{inwardNo}</span>
                            <CopyButton value={inwardNo}>
                                {({ copy, copied }) => (
                                    <button
                                        type="button"
                                        onClick={copy}
                                        className="rounded p-0.5 text-blue-500 hover:bg-blue-200/70 hover:text-blue-800"
                                        title={copied ? "Copied" : "Copy inward number"}
                                    >
                                        <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </CopyButton>
                        </div>
                    </div>

                    <dl className="mt-2.5 flex flex-wrap items-start gap-x-6 gap-y-1.5">
                        <MetaItem
                            label={t("providerMaster.dashboard.inward.taskAssignment.providerName")}
                            value={providerName}
                        />
                        <MetaItem
                            label={t("providerMaster.dashboard.inward.taskAssignment.subcategory")}
                            value={subcategory}
                        />
                        <MetaItem
                            label={t("providerMaster.dashboard.inward.taskAssignment.workflowName")}
                            value={workflowName}
                        />
                    </dl>
                </div>

                <div className="flex w-[200px] shrink-0 flex-col items-end gap-1.5 sm:w-[220px]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title={t("providerMaster.toolbar.close")}
                        aria-label={t("providerMaster.toolbar.close")}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>

                    <ProviderProgressBar
                        value={progressPercent}
                        label={
                            <div className="mb-1 flex items-center justify-between gap-1.5">
                                <span className="truncate text-[10px] font-medium text-slate-600">
                                    {t("providerMaster.dashboard.inward.taskAssignment.overallProgress")}
                                </span>
                                <span className="inline-flex rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                                    {progressPercent}%
                                </span>
                            </div>
                        }
                    />
                </div>
            </div>
        </header>
    );
}

function MetaItem({ label, value }: Readonly<{ label: string; value: string }>) {
    return (
        <div className="min-w-0">
            <dt className="text-[11px] font-semibold capitalize text-slate-500">{label}</dt>
            <dd className="break-words text-[12px] font-medium leading-snug text-slate-700">
                {value}
            </dd>
        </div>
    );
}
