import { Fragment } from "react";
import type { TFunction } from "i18next";
import { Transition, TransitionChild } from "@headlessui/react";
import {
    BellAlertIcon,
    PaperAirplaneIcon,
    UserCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import type { InwardTaskUserOption, ProviderInwardTask, AssignmentPanelMode } from "./providerInwardTaskTypes";
import { TaskUserDropdown } from "./taskAssignmentControls";

type TaskAssignmentAssignmentPanelProps = {
    open: boolean;
    mode: AssignmentPanelMode;
    tasks: ProviderInwardTask[];
    assignUserId: string;
    comment: string;
    assigning: boolean;
    notifyOnAssign: boolean;
    userOptions: InwardTaskUserOption[];
    onClose: () => void;
    onUserChange: (userId: string) => void;
    onCommentChange: (comment: string) => void;
    onNotifyChange: (notify: boolean) => void;
    onAssign: () => void;
    onAssignAndNotify: () => void;
    t: TFunction;
};

export function TaskAssignmentAssignmentPanel({
    open,
    mode,
    tasks,
    assignUserId,
    comment,
    assigning,
    notifyOnAssign,
    userOptions,
    onClose,
    onUserChange,
    onCommentChange,
    onNotifyChange,
    onAssign,
    onAssignAndNotify,
    t,
}: Readonly<TaskAssignmentAssignmentPanelProps>) {
    const selectedUser = userOptions.find((user) => user.id === assignUserId);
    const dropdownOptions = userOptions.map((user) => ({
        label: user.name,
        value: user.id,
    }));

    return (
        <Transition show={open} as={Fragment}>
            <div className="fixed inset-0 z-[110]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/20" onClick={onClose} aria-hidden />
                </TransitionChild>

                <TransitionChild
                    as={Fragment}
                    enter="transform transition ease-out duration-250"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in duration-200"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                >
                    <aside className="fixed inset-y-0 right-0 flex w-full max-w-[380px] flex-col border-l border-slate-200 bg-white shadow-2xl">
                        <header className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    {mode === "reassign"
                                        ? t("providerMaster.dashboard.inward.taskAssignment.reassignTasks")
                                        : t("providerMaster.dashboard.inward.taskAssignment.assignTasksTitle")}
                                </h3>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    {t("providerMaster.dashboard.inward.taskAssignment.selectedCount", {
                                        count: tasks.length,
                                    })}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
                            <section>
                                <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {t("providerMaster.dashboard.inward.taskAssignment.selectedTasks")}
                                </h4>
                                <ul className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                                    {tasks.map((task) => (
                                        <li
                                            key={task.id}
                                            className="truncate text-[11px] font-medium text-slate-700"
                                            title={task.name}
                                        >
                                            {task.name}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <TaskUserDropdown
                                    name="panelAssignUserId"
                                    label={t("providerMaster.dashboard.inward.taskAssignment.selectUser")}
                                    value={assignUserId}
                                    onChange={onUserChange}
                                    options={dropdownOptions}
                                    disabled={assigning}
                                    placeholder={t("providerMaster.dashboard.inward.taskAssignment.selectUserToAssign")}
                                    className="[&_.react-select__control]:min-h-[36px] [&_.react-select__control]:rounded-xl [&_.react-select__control]:text-[12px]"
                                />
                            </section>

                            {selectedUser ? (
                                <section className="rounded-xl p-3 ring-1 ring-slate-200 bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <UserCircleIcon className="h-5 w-5 shrink-0 text-slate-500" />
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-semibold text-slate-800">{selectedUser.name}</p>
                                            {selectedUser.email ? (
                                                <p className="truncate text-[10px] text-slate-500">{selectedUser.email}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </section>
                            ) : null}

                            <section>
                                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {t("providerMaster.dashboard.inward.taskAssignment.comments")}
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(event) => onCommentChange(event.target.value)}
                                    rows={3}
                                    placeholder={t("providerMaster.dashboard.inward.taskAssignment.commentPlaceholder")}
                                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-[12px] text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </section>

                            <label className="inline-flex items-center gap-2 text-[11px] text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={notifyOnAssign}
                                    onChange={(event) => onNotifyChange(event.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                                />
                                {t("providerMaster.dashboard.inward.taskAssignment.notifyAssignee")}
                            </label>
                        </div>

                        <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-3">
                            <Button
                                type="button"
                                color="primary"
                                className="h-9 w-full text-[12px]"
                                disabled={!assignUserId || assigning || tasks.length === 0}
                                onClick={onAssign}
                            >
                                <PaperAirplaneIcon className="mr-1.5 inline h-4 w-4" />
                                {t("providerMaster.dashboard.inward.taskAssignment.assign")}
                            </Button>
                            <Button
                                type="button"
                                className="h-9 w-full border border-slate-200 bg-white text-[12px] text-slate-700 hover:bg-slate-50"
                                disabled={!assignUserId || assigning || tasks.length === 0}
                                onClick={onAssignAndNotify}
                            >
                                <BellAlertIcon className="mr-1.5 inline h-4 w-4" />
                                {t("providerMaster.dashboard.inward.taskAssignment.assignAndNotify")}
                            </Button>
                        </footer>
                    </aside>
                </TransitionChild>
            </div>
        </Transition>
    );
}
