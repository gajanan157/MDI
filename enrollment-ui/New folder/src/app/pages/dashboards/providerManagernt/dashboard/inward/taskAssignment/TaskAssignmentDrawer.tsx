import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Transition, TransitionChild } from "@headlessui/react";
import { ClipboardDocumentListIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import AlertDialog from "@/components/shared/dialog/AlertDialog/AlertDialog";
import { Button } from "@/components/ui";
import {
    CheckListButton,
    CommonSearch,
    PROVIDER_ACTION_BUTTON_CLASS,
    PROVIDER_OVERLAY_Z_INDEX_CLASS,
    PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS,
} from "../../../shared/providerShell";
import type { useProviderInwardTaskAssignment } from "./useProviderInwardTaskAssignment";
import { TaskAssignmentKpiCards } from "./TaskAssignmentKpiCards";
import { TaskAssignmentAssignTabs } from "./TaskAssignmentAssignTabs";
import { BULK_UNASSIGN_USER_ID } from "./taskAssignmentConfig";
import { TaskAssignmentTaskGrid } from "./TaskAssignmentTaskGrid";
import { TaskAssignmentAssignmentPanel } from "./TaskAssignmentAssignmentPanel";
import { TaskAuditLogDialog } from "./TaskAuditLogDialog";
import { TaskWorkflowDialog } from "./TaskWorkflowDialog";
import type { TaskAssignmentPanelAction } from "./providerInwardTaskTypes";
import {
    buildTaskAssignmentSearchFields,
    mapSearchFormToFilters,
} from "./taskAssignmentFilterUtils";
import { TaskAssignmentFilterChips } from "./taskAssignmentFilters";
import { TaskAssignmentDrawerHeader } from "./TaskAssignmentDrawerHeader";

type TaskAssignmentState = ReturnType<typeof useProviderInwardTaskAssignment>;

type TaskAssignmentDrawerProps = {
    assignment: TaskAssignmentState;
};

export function TaskAssignmentDrawer({ assignment }: Readonly<TaskAssignmentDrawerProps>) {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAssignPanelOpen, setIsAssignPanelOpen] = useState(false);
    const [auditLogOpen, setAuditLogOpen] = useState(false);
    const [workflowTaskId, setWorkflowTaskId] = useState<string | null>(null);
    const {
        drawerOpen,
        context,
        filteredTasks,
        summary,
        progressPercent,
        loading,
        assigning,
        savingPriority,
        savingDueDate,
        selectedTaskIds,
        filters,
        patchFilters,
        resetFilters,
        activeFilterCount,
        workflowStages,
        assignAllUserId,
        setAssignAllUserId,
        assignAllPriority,
        setAssignAllPriority,
        assignAllDueDate,
        setAssignAllDueDate,
        assignAllDueDateRemark,
        setAssignAllDueDateRemark,
        bulkPriority,
        setBulkPriority,
        bulkDueDate,
        setBulkDueDate,
        bulkDueDateRemark,
        setBulkDueDateRemark,
        bulkUserId,
        setBulkUserId,
        userOptions,
        confirmAssignAllOpen,
        setConfirmAssignAllOpen,
        assignmentPanelOpen,
        assignmentPanelMode,
        panelTasks,
        panelUserId,
        setPanelUserId,
        panelComment,
        setPanelComment,
        panelNotify,
        setPanelNotify,
        closeDrawer,
        toggleTaskSelection,
        setTaskSelection,
        clearSelection,
        handleApplyBulkChanges,
        handleAssignAllPending,
        handlePriorityChange,
        handleDueDateChange,
        handleRowAction,
        handleOverdueView,
        closeAssignmentPanel,
        commitPanelAssignment,
        statusFilter,
        setStatusFilter,
    } = assignment;

    const assigneeOptions = useMemo(() => {
        const unique = new Map<string, string>();
        for (const user of userOptions) {
            unique.set(user.id, user.name);
        }
        return [
            { label: t("providerMaster.dashboard.inward.taskAssignment.allAssignees"), value: "ALL" },
            { label: t("providerMaster.dashboard.inward.taskAssignment.unassigned"), value: "UNASSIGNED" },
            ...[...unique.entries()].map(([id, name]) => ({ label: name, value: id })),
        ];
    }, [t, userOptions]);

    const searchFields = useMemo(
        () => buildTaskAssignmentSearchFields(t, workflowStages, assigneeOptions),
        [assigneeOptions, t, workflowStages],
    );

    const userDropdownOptions = useMemo(
        () => userOptions.map((user) => ({ label: user.name, value: user.id })),
        [userOptions],
    );

    const bulkUserDropdownOptions = useMemo(
        () => [
            ...userDropdownOptions,
            {
                label: t("providerMaster.dashboard.inward.taskAssignment.removeAssignment"),
                value: BULK_UNASSIGN_USER_ID,
            },
        ],
        [t, userDropdownOptions],
    );

    const workflowTask = useMemo(
        () => filteredTasks.find((task) => task.id === workflowTaskId) ?? null,
        [filteredTasks, workflowTaskId],
    );

    const handleGridRowAction = useCallback(
        (taskId: string, action: TaskAssignmentPanelAction) => {
            if (action === "timeline") {
                setWorkflowTaskId(taskId);
                return;
            }
            handleRowAction(taskId, action);
        },
        [handleRowAction],
    );

    useEffect(() => {
        if (!drawerOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;

            if (auditLogOpen) {
                event.preventDefault();
                event.stopPropagation();
                setAuditLogOpen(false);
                return;
            }
            if (workflowTaskId) {
                event.preventDefault();
                event.stopPropagation();
                setWorkflowTaskId(null);
            }
        };

        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [auditLogOpen, drawerOpen, workflowTaskId]);

    if (!context) return null;

    const subcategory = context.row.subcategory;

    return (
        <>
            <Transition show={drawerOpen} as={Fragment}>
                <div className={`fixed inset-0 ${PROVIDER_OVERLAY_Z_INDEX_CLASS}`}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                            onClick={closeDrawer}
                            aria-hidden
                        />
                    </TransitionChild>

                    <TransitionChild
                        as={Fragment}
                        enter="transform transition ease-out duration-300"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in duration-200"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                    >
                        <aside className="fixed inset-y-0 right-0 flex h-[100dvh] w-full max-w-[1120px] flex-col overflow-hidden bg-slate-50 shadow-2xl">
                            <TaskAssignmentDrawerHeader
                                inwardNo={context.row.inwardNo}
                                providerName={context.providerName}
                                subcategory={subcategory}
                                progressPercent={progressPercent}
                                onClose={closeDrawer}
                                t={t}
                            />

                            <TaskAssignmentKpiCards
                                summary={summary}
                                overdueCount={summary.overdue}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                onOverdueView={handleOverdueView}
                                actions={
                                    <>
                                        <Button
                                            type="button"
                                            variant={isAssignPanelOpen ? "outlined" : "filled"}
                                            color={isAssignPanelOpen ? undefined : "primary"}
                                            className={
                                                isAssignPanelOpen
                                                    ? PROVIDER_ACTION_BUTTON_CLASS
                                                    : `${PROVIDER_ACTION_BUTTON_CLASS} bg-blue-600 text-white hover:bg-blue-700`
                                            }
                                            onClick={() => setIsAssignPanelOpen((open) => !open)}
                                            title={
                                                isAssignPanelOpen
                                                    ? t("providerMaster.dashboard.inward.taskAssignment.hideAssignPanel")
                                                    : t("providerMaster.dashboard.inward.taskAssignment.showAssignPanel")
                                            }
                                        >
                                            <UserPlusIcon className="h-3.5 w-3.5" />
                                            {isAssignPanelOpen
                                                ? t("providerMaster.dashboard.inward.taskAssignment.hideAssignPanel")
                                                : t("providerMaster.dashboard.inward.taskAssignment.showAssignPanel")}
                                        </Button>
                                        <CheckListButton
                                            onClick={() => setIsSearchOpen((open) => !open)}
                                            label={
                                                isSearchOpen
                                                    ? t("providerMaster.button.hideSearch")
                                                    : t("providerMaster.button.search")
                                            }
                                            bgColor="bg-blue-600"
                                            textColor="text-white"
                                            size="text-xs"
                                            className={PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS}
                                            isSearch
                                        />
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            className={PROVIDER_ACTION_BUTTON_CLASS}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setAuditLogOpen(true);
                                            }}
                                            title={t("providerMaster.toolbar.auditLogTitle")}
                                        >
                                            <ClipboardDocumentListIcon className="h-3.5 w-3.5" />
                                            {t("providerMaster.toolbar.auditLog")}
                                        </Button>
                                    </>
                                }
                                t={t}
                            />

                            {isAssignPanelOpen ? (
                                <TaskAssignmentAssignTabs
                                    selectedCount={selectedTaskIds.length}
                                    pendingCount={summary.pending}
                                    assignAllEnabled={summary.allowBulkAssignAll}
                                    subcategory={subcategory}
                                    assigning={assigning}
                                    saving={savingPriority || savingDueDate}
                                    bulkUserId={bulkUserId}
                                    bulkPriority={bulkPriority}
                                    bulkDueDate={bulkDueDate}
                                    assignAllUserId={assignAllUserId}
                                    assignAllPriority={assignAllPriority}
                                    assignAllDueDate={assignAllDueDate}
                                    assignAllDueDateRemark={assignAllDueDateRemark}
                                    bulkDueDateRemark={bulkDueDateRemark}
                                    userOptions={userDropdownOptions}
                                    bulkUserOptions={bulkUserDropdownOptions}
                                    onBulkUserChange={setBulkUserId}
                                    onBulkPriorityChange={setBulkPriority}
                                    onBulkDueDateChange={setBulkDueDate}
                                    onBulkDueDateRemarkChange={setBulkDueDateRemark}
                                    onAssignAllUserChange={setAssignAllUserId}
                                    onAssignAllPriorityChange={setAssignAllPriority}
                                    onAssignAllDueDateChange={setAssignAllDueDate}
                                    onAssignAllDueDateRemarkChange={setAssignAllDueDateRemark}
                                    onApplySelected={() => {
                                        handleApplyBulkChanges().catch(() => undefined);
                                    }}
                                    onAssignAll={() => setConfirmAssignAllOpen(true)}
                                    onClearSelection={clearSelection}
                                    t={t}
                                />
                            ) : null}

                            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-2 pt-2">
                                {isSearchOpen ? (
                                    <div className="mb-2 shrink-0">
                                        <CommonSearch
                                            key={`task-search-${context.row.inwardNo}`}
                                            fields={searchFields}
                                            onSearch={(data) => patchFilters(mapSearchFormToFilters(data))}
                                            isSubmitting={loading}
                                            title={t("providerMaster.dashboard.inward.taskAssignment.filterTitle")}
                                            showToggleButton={false}
                                            isOpen
                                            onToggle={() => setIsSearchOpen(false)}
                                            allowEmptySearch
                                        />
                                    </div>
                                ) : null}

                                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                                    <TaskAssignmentFilterChips
                                        filters={filters}
                                        activeFilterCount={activeFilterCount}
                                        onFiltersChange={patchFilters}
                                        onReset={resetFilters}
                                        t={t}
                                    />
                                    <TaskAssignmentTaskGrid
                                        tasks={filteredTasks}
                                        loading={loading}
                                        selectedTaskIds={selectedTaskIds}
                                        assigning={assigning}
                                        savingPriority={savingPriority}
                                        savingDueDate={savingDueDate}
                                        onToggleSelect={toggleTaskSelection}
                                        onToggleSelectAll={setTaskSelection}
                                        onPriorityChange={(taskId, priority) => {
                                            handlePriorityChange(taskId, priority).catch(() => undefined);
                                        }}
                                        onDueDateChange={(taskId, dueDate) => {
                                            handleDueDateChange(taskId, dueDate).catch(() => undefined);
                                        }}
                                        onRowAction={handleGridRowAction}
                                        onClearFilters={resetFilters}
                                        t={t}
                                    />
                                </div>
                            </div>
                        </aside>
                    </TransitionChild>
                </div>
            </Transition>

            <TaskAssignmentAssignmentPanel
                open={assignmentPanelOpen}
                mode={assignmentPanelMode}
                tasks={panelTasks}
                assignUserId={panelUserId}
                comment={panelComment}
                assigning={assigning}
                notifyOnAssign={panelNotify}
                userOptions={userOptions}
                onClose={closeAssignmentPanel}
                onUserChange={setPanelUserId}
                onCommentChange={setPanelComment}
                onNotifyChange={setPanelNotify}
                onAssign={() => {
                    commitPanelAssignment(false).catch(() => undefined);
                }}
                onAssignAndNotify={() => {
                    commitPanelAssignment(true).catch(() => undefined);
                }}
                t={t}
            />

            <TaskAuditLogDialog
                open={auditLogOpen}
                onClose={() => setAuditLogOpen(false)}
                tasks={filteredTasks}
                inwardNo={context.row.inwardNo}
            />

            <TaskWorkflowDialog
                open={Boolean(workflowTask)}
                task={workflowTask}
                onClose={() => setWorkflowTaskId(null)}
            />

            <AlertDialog
                type="partial"
                isOpen={confirmAssignAllOpen}
                onClose={() => setConfirmAssignAllOpen(false)}
                onConfirm={handleAssignAllPending}
                title={t("providerMaster.dashboard.inward.taskAssignment.confirmAssignAllTitle")}
                message={t("providerMaster.dashboard.inward.taskAssignment.confirmAssignAllMessage", {
                    count: summary.pending,
                    subcategory,
                })}
                confirmText={t("providerMaster.dashboard.inward.taskAssignment.assignAllPending")}
                closeText={t("providerMaster.button.cancel")}
                confirmDisabled={assigning}
            />

            <style>{`
        .provider-date-picker-popper,
        #root .react-datepicker-popper {
          z-index: 9999 !important;
        }
        .task-assignment-grid .task-due-date-cell,
        .task-assignment-grid .task-due-date-cell .ag-cell-wrapper,
        .task-assignment-grid .task-due-date-field {
          overflow: hidden !important;
        }
        .task-assignment-grid .task-due-date-field .form-input {
          min-width: 0 !important;
        }
        .task-assignment-grid .task-audit-header .ag-header-cell-label {
          text-transform: none !important;
          letter-spacing: normal !important;
          white-space: nowrap !important;
        }
        .task-assignment-grid .task-actions-cell,
        .task-assignment-grid .task-actions-cell .ag-cell-wrapper {
          overflow: visible !important;
        }
        .task-assignment-grid,
        .provider-inward-grid.task-assignment-grid {
          --ag-cell-horizontal-padding: 8px;
          --ag-header-height: 32px;
        }
        .task-assignment-grid .ag-header-row,
        .provider-inward-grid .ag-header-row {
          height: 32px !important;
          min-height: 32px !important;
        }
        .task-assignment-grid .ag-header-cell,
        .provider-inward-grid .ag-header-cell {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .task-assignment-grid .ag-header-cell-label,
        .provider-inward-grid .ag-header-cell-label {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #64748b !important;
          letter-spacing: normal;
          text-transform: none;
        }
        .task-assignment-grid .ag-header-cell-comp-wrapper,
        .provider-inward-grid .ag-header-cell-comp-wrapper {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .task-assignment-grid .ag-header-cell-center .ag-header-cell-comp-wrapper,
        .provider-inward-grid .ag-header-cell-center .ag-header-cell-comp-wrapper,
        .task-assignment-grid .ag-header-cell-center .ag-header-cell-label,
        .provider-inward-grid .ag-header-cell-center .ag-header-cell-label {
          justify-content: center !important;
        }
        .task-assignment-grid .ag-header,
        .provider-inward-grid .ag-header {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .task-assignment-grid .ag-row,
        .provider-inward-grid .ag-row {
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .task-assignment-grid .task-row-selectable,
        .provider-inward-grid .task-row-selectable {
          cursor: pointer;
        }
        .task-assignment-grid button:not(:disabled),
        .provider-inward-grid button:not(:disabled) {
          cursor: pointer;
        }
        .task-assignment-grid .task-row-selectable:hover,
        .provider-inward-grid .task-row-selectable:hover {
          background: #f8fafc !important;
        }
        .task-assignment-grid .ag-row-selected,
        .task-assignment-grid .task-row-selected,
        .provider-inward-grid .ag-row-selected,
        .provider-inward-grid .task-row-selected {
          background: #eff6ff !important;
        }
        .task-assignment-grid .ag-cell,
        .provider-inward-grid .ag-cell {
          display: flex !important;
          align-items: center !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .task-assignment-grid .ag-cell-wrapper,
        .provider-inward-grid .ag-cell-wrapper {
          display: flex !important;
          align-items: center !important;
          height: 100% !important;
          width: 100% !important;
        }
        .task-assignment-grid .ag-cell.ag-cell-center .ag-cell-wrapper,
        .provider-inward-grid .ag-cell.ag-cell-center .ag-cell-wrapper {
          justify-content: center !important;
        }
        .task-assignment-grid .task-select-cell,
        .provider-inward-grid .task-select-cell {
          overflow: visible !important;
        }
        .task-assignment-grid .task-select-cell .ag-cell-wrapper,
        .provider-inward-grid .task-select-cell .ag-cell-wrapper {
          overflow: visible !important;
        }
        .task-assignment-grid .ag-root-wrapper,
        .provider-inward-grid .ag-root-wrapper {
          border: none !important;
          border-radius: 0 !important;
        }
      `}</style>
        </>
    );
}
