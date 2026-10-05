import { useState } from "react";
import type { TFunction } from "i18next";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import type { InwardTaskPriority } from "./providerInwardTaskTypes";
import { TaskDueDateField, TaskPrioritySelect, TaskUserDropdown } from "./taskAssignmentControls";

export type AssignTabMode = "selected" | "all";

const CONTROL_CLASS =
    "h-8 min-w-0 rounded-md [&_.react-select__control]:min-h-[32px] [&_.react-select__control]:text-[11px]";
const DATE_CLASS = "w-[148px] shrink-0";
const REMARK_CLASS = "min-w-[120px] flex-1 sm:max-w-[160px]";
const ACTION_BUTTON_CLASS = "h-8 shrink-0 px-4 text-[11px]";

type TaskAssignmentAssignTabsProps = {
    selectedCount: number;
    pendingCount: number;
    assignAllEnabled: boolean;
    subcategory: string;
    assigning: boolean;
    saving: boolean;
    bulkUserId: string;
    bulkPriority: InwardTaskPriority | "";
    bulkDueDate: string;
    assignAllDueDateRemark: string;
    bulkDueDateRemark: string;
    assignAllUserId: string;
    assignAllPriority: InwardTaskPriority | "";
    assignAllDueDate: string;
    userOptions: { label: string; value: string }[];
    bulkUserOptions: { label: string; value: string }[];
    onBulkUserChange: (value: string) => void;
    onBulkPriorityChange: (value: InwardTaskPriority | "") => void;
    onBulkDueDateChange: (value: string) => void;
    onBulkDueDateRemarkChange: (value: string) => void;
    onAssignAllUserChange: (value: string) => void;
    onAssignAllPriorityChange: (value: InwardTaskPriority | "") => void;
    onAssignAllDueDateChange: (value: string) => void;
    onAssignAllDueDateRemarkChange: (value: string) => void;
    onApplySelected: () => void;
    onAssignAll: () => void;
    onClearSelection: () => void;
    t: TFunction;
};

function AssignTabButton({
    active,
    label,
    onClick,
}: Readonly<{ active: boolean; label: string; onClick: () => void }>) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${active
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
        >
            {label}
        </button>
    );
}

type AssignTabFieldState = {
    userId: string;
    priority: InwardTaskPriority | "";
    dueDate: string;
    dueDateRemark: string;
    onUserChange: (value: string) => void;
    onPriorityChange: (value: InwardTaskPriority | "") => void;
    onDueDateChange: (value: string) => void;
    onDueDateRemarkChange: (value: string) => void;
    dropdownOptions: { label: string; value: string }[];
    userFieldName: string;
    priorityFieldName: string;
    dueDateFieldName: string;
    remarkFieldName: string;
    fieldsDisabled: boolean;
    userTitle: string;
};

function resolveAssignTabFields(
    isSelectedMode: boolean,
    props: TaskAssignmentAssignTabsProps,
    busy: boolean,
    t: TFunction,
): AssignTabFieldState {
    if (isSelectedMode) {
        return {
            userId: props.bulkUserId,
            priority: props.bulkPriority,
            dueDate: props.bulkDueDate,
            dueDateRemark: props.bulkDueDateRemark,
            onUserChange: props.onBulkUserChange,
            onPriorityChange: props.onBulkPriorityChange,
            onDueDateChange: props.onBulkDueDateChange,
            onDueDateRemarkChange: props.onBulkDueDateRemarkChange,
            dropdownOptions: props.bulkUserOptions,
            userFieldName: "bulkAssignUserId",
            priorityFieldName: "bulkPriority",
            dueDateFieldName: "bulkDueDate",
            remarkFieldName: "bulkDueDateRemark",
            fieldsDisabled: busy,
            userTitle: t("providerMaster.dashboard.inward.taskAssignment.reassignHint"),
        };
    }

    return {
        userId: props.assignAllUserId,
        priority: props.assignAllPriority,
        dueDate: props.assignAllDueDate,
        dueDateRemark: props.assignAllDueDateRemark,
        onUserChange: props.onAssignAllUserChange,
        onPriorityChange: props.onAssignAllPriorityChange,
        onDueDateChange: props.onAssignAllDueDateChange,
        onDueDateRemarkChange: props.onAssignAllDueDateRemarkChange,
        dropdownOptions: props.userOptions,
        userFieldName: "assignAllUserId",
        priorityFieldName: "assignAllPriority",
        dueDateFieldName: "assignAllDueDate",
        remarkFieldName: "assignAllDueDateRemark",
        fieldsDisabled: busy || !props.assignAllEnabled,
        userTitle: t("providerMaster.dashboard.inward.taskAssignment.assignAllWarning", {
            subcategory: props.subcategory,
        }),
    };
}

export function TaskAssignmentAssignTabs(props: Readonly<TaskAssignmentAssignTabsProps>) {
    const {
        selectedCount,
        pendingCount,
        assignAllEnabled,
        subcategory,
        assigning,
        saving,
        bulkUserId,
        bulkPriority,
        bulkDueDate,
        assignAllUserId,
        onApplySelected,
        onAssignAll,
        onClearSelection,
        t,
    } = props;
    const [mode, setMode] = useState<AssignTabMode>("selected");
    const busy = assigning || saving;
    const isSelectedMode = mode === "selected";
    const fields = resolveAssignTabFields(isSelectedMode, props, busy, t);

    const canApplySelected =
        selectedCount > 0 && Boolean(bulkUserId || bulkPriority || bulkDueDate);
    const canAssignAll = assignAllEnabled && pendingCount > 0 && Boolean(assignAllUserId);

    return (
        <div className="mx-3 mt-1.5 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
                <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-0.5">
                    <AssignTabButton
                        active={isSelectedMode}
                        label={t("providerMaster.dashboard.inward.taskAssignment.assignTabSelected", {
                            count: selectedCount,
                        })}
                        onClick={() => setMode("selected")}
                    />
                    <AssignTabButton
                        active={!isSelectedMode}
                        label={t("providerMaster.dashboard.inward.taskAssignment.assignTabAll", {
                            count: pendingCount,
                        })}
                        onClick={() => setMode("all")}
                    />
                </div>

                {isSelectedMode && selectedCount > 0 ? (
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-700"
                        title={t("providerMaster.dashboard.inward.taskAssignment.clearSelection")}
                    >
                        <XMarkIcon className="h-3.5 w-3.5" />
                        {selectedCount}
                    </button>
                ) : null}

                <div className="min-w-[200px] flex-1 sm:min-w-[240px] sm:max-w-[320px]">
                    <TaskUserDropdown
                        name={fields.userFieldName}
                        value={fields.userId}
                        onChange={fields.onUserChange}
                        options={fields.dropdownOptions}
                        disabled={fields.fieldsDisabled}
                        placeholder={t("providerMaster.dashboard.inward.taskAssignment.selectUserToAssign")}
                        className={CONTROL_CLASS}
                        formClassName="[&_.dropdown-label]:hidden"
                        title={fields.userTitle}
                    />
                </div>

                <div className="w-[108px] shrink-0">
                    <TaskPrioritySelect
                        name={fields.priorityFieldName}
                        value={fields.priority}
                        onChange={fields.onPriorityChange}
                        disabled={fields.fieldsDisabled}
                        allowEmpty
                        placeholder={t("providerMaster.dashboard.inward.taskAssignment.setPriority")}
                        className={CONTROL_CLASS}
                    />
                </div>

                <div className={DATE_CLASS}>
                    <TaskDueDateField
                        name={fields.dueDateFieldName}
                        value={fields.dueDate}
                        onChange={fields.onDueDateChange}
                        disabled={fields.fieldsDisabled}
                        variant="toolbar"
                        placeholder={t("providerMaster.dashboard.inward.taskAssignment.setDeadline")}
                    />
                </div>

                <div className={REMARK_CLASS}>
                    <input
                        type="text"
                        name={fields.remarkFieldName}
                        value={fields.dueDateRemark}
                        onChange={(event) => fields.onDueDateRemarkChange(event.target.value)}
                        disabled={fields.fieldsDisabled || !fields.dueDate}
                        placeholder={t("providerMaster.dashboard.inward.taskAssignment.dueDateRemarkPlaceholder")}
                        title={t("providerMaster.dashboard.inward.taskAssignment.dueDateRemark")}
                        className="form-input h-8 w-full rounded-md border border-gray-300 px-2 text-[11px] text-slate-800 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                </div>

                {isSelectedMode ? (
                    <Button
                        type="button"
                        color="primary"
                        className={`ml-auto ${ACTION_BUTTON_CLASS}`}
                        disabled={!canApplySelected || busy}
                        onClick={onApplySelected}
                        title={t("providerMaster.dashboard.inward.taskAssignment.applyBulkHint")}
                    >
                        {t("providerMaster.dashboard.inward.taskAssignment.applyChanges")}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        color="primary"
                        className={`ml-auto ${ACTION_BUTTON_CLASS}`}
                        disabled={!canAssignAll || busy}
                        onClick={onAssignAll}
                        title={t("providerMaster.dashboard.inward.taskAssignment.assignAllWarning", {
                            subcategory,
                        })}
                    >
                        {t("providerMaster.dashboard.inward.taskAssignment.assignAllPending")}
                    </Button>
                )}
            </div>
        </div>
    );
}
