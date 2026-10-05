import type { ReactNode } from "react";
import type { CustomCellRendererProps, IHeaderParams } from "ag-grid-community";
import { CheckIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import type { TFunction } from "i18next";
import { formatProviderDateTimeDisplay } from "../../../shared/dateFormat";
import {
  ProviderStatusPill,
  ProviderUserAvatar,
} from "../../../shared/dashboard";
import {
  AVATAR_COLORS,
  getTaskIcon,
  SLA_TONE_STYLES,
  TASK_ASSIGNMENT_PILL_CLASS,
  TASK_PRIORITY_OPTIONS,
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
} from "./taskAssignmentConfig";
import { TaskDueDateField } from "./taskAssignmentControls";
import type {
  InwardTaskPriority,
  ProviderInwardTask,
  TaskAssignmentPanelAction,
} from "./providerInwardTaskTypes";
import { getDueDateRelativeLabel, getTaskSlaIndicator } from "./taskDueDateUtils";
import {
  isTaskSelectable,
  type ProviderInwardTaskGridRow,
  type TaskGridContext,
  type TaskGridSelectionState,
} from "./taskAssignmentGridTypes";

function cellWrap(content: ReactNode, center = false) {
  return (
    <div
      className={`flex h-full w-full min-w-0 overflow-hidden ${center ? "justify-center" : ""} items-center`}
    >
      {content}
    </div>
  );
}

function stopGridPropagation(event: React.MouseEvent | React.ChangeEvent) {
  event.stopPropagation();
}

function getAssigneeEmail(task: ProviderInwardTask): string {
  if (task.assignedUserEmail) return task.assignedUserEmail;
  if (!task.assignedUserName) return "";
  return `${task.assignedUserName.toLowerCase().replace(/\s+/g, ".")}@magma.com`;
}

export function AssignedToCell(
  params: CustomCellRendererProps<ProviderInwardTaskGridRow, unknown, TaskGridContext>,
) {
  const task = params.data;
  const ctx = params.context;
  if (!task || !ctx) return null;
  if (!task.assignedUserName) {
    return cellWrap(
      <span className="text-[10px] font-medium text-slate-400">
        {ctx.t("providerMaster.dashboard.inward.taskAssignment.unassigned")}
      </span>,
      true,
    );
  }
  const initials = task.assignedUserInitials ?? task.assignedUserName.slice(0, 2).toUpperCase();
  const colorIndex = task.assignedUserId?.charCodeAt(task.assignedUserId.length - 1) ?? 0;
  const email = getAssigneeEmail(task);
  return cellWrap(
    <div
      className="inline-flex max-w-full min-w-0 items-center gap-1.5"
      title={`${task.assignedUserName}\n${email}`}
    >
      <ProviderUserAvatar
        initials={initials}
        colorClass={AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]}
        textClass="text-[8px]"
        title={`${task.assignedUserName}\n${email}`}
      />
      <span className="min-w-0 truncate text-[10px] font-semibold text-slate-800">
        {task.assignedUserName}
      </span>
    </div>,
    true,
  );
}

export function StatusCell(params: CustomCellRendererProps<ProviderInwardTaskGridRow>) {
  const task = params.data;
  if (!task) return null;
  const statusStyle = TASK_STATUS_STYLES[task.status];
  return cellWrap(
    <ProviderStatusPill
      label={statusStyle.label}
      className={`${TASK_ASSIGNMENT_PILL_CLASS} ${statusStyle.badge}`}
      dotClassName={statusStyle.dot}
      title={statusStyle.tooltip}
    />,
    true,
  );
}

function TaskSelectCheckbox({
  checked,
  disabled,
  indeterminate,
  title,
  onToggle,
}: Readonly<{
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  title?: string;
  onToggle: () => void;
}>) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate && !checked ? "mixed" : checked}
      aria-label={title}
      disabled={disabled}
      title={title}
      onClick={(event) => {
        stopGridPropagation(event);
        if (!disabled) onToggle();
      }}
      onMouseDown={stopGridPropagation}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
        checked
          ? "border-blue-600 bg-blue-600 text-white"
          : indeterminate
            ? "border-blue-500 bg-blue-50"
            : "border-slate-400 bg-white hover:border-blue-500"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      {checked ? <CheckIcon className="h-2.5 w-2.5" /> : null}
      {indeterminate && !checked ? <span className="h-0.5 w-2 rounded bg-blue-600" /> : null}
    </button>
  );
}

export function TaskSelectCell(
  params: CustomCellRendererProps<ProviderInwardTaskGridRow, unknown, TaskGridContext>,
) {
  const task = params.data;
  const ctx = params.context;
  if (!task || !ctx) return null;

  if (!isTaskSelectable(task)) {
    return cellWrap(<span className="inline-block h-4 w-4 shrink-0" aria-hidden />, true);
  }

  return cellWrap(
    <TaskSelectCheckbox
      checked={task.__isSelected}
      disabled={ctx.assigning}
      title={ctx.t("providerMaster.dashboard.inward.taskAssignment.selectTask", {
        name: task.name,
      })}
      onToggle={() => ctx.onToggleSelect(task.id)}
    />,
    true,
  );
}

export function SelectAllHeader({
  context,
}: Readonly<
  IHeaderParams<ProviderInwardTaskGridRow, unknown, TaskGridContext & TaskGridSelectionState>
>) {
  const ctx = context;
  if (!ctx) return null;

  const selectableIds = ctx.pendingTaskIds;
  const selectedSelectable = selectableIds.filter((id) => ctx.selectedTaskIds.includes(id));
  const allSelected = selectableIds.length > 0 && selectedSelectable.length === selectableIds.length;
  const someSelected = selectedSelectable.length > 0 && !allSelected;
  const disabled = selectableIds.length === 0 || ctx.assigning;

  return (
    <div className="flex h-full items-center justify-center">
      <TaskSelectCheckbox
        checked={allSelected}
        indeterminate={someSelected}
        disabled={disabled}
        title={ctx.t("providerMaster.dashboard.inward.taskAssignment.selectAllPending")}
        onToggle={() => {
          ctx.onToggleSelectAll(allSelected ? [] : selectableIds);
        }}
      />
    </div>
  );
}

export function TaskPriorityCell(
  params: CustomCellRendererProps<ProviderInwardTaskGridRow, unknown, TaskGridContext>,
) {
  const task = params.data;
  const ctx = params.context;
  if (!task || !ctx) return null;

  const style = TASK_PRIORITY_STYLES[task.priority];
  const disabled =
    ctx.assigning ||
    ctx.savingPriority ||
    task.status === "COMPLETED" ||
    task.status === "CANCELLED";

  if (disabled) {
    return cellWrap(
      <span className={`${TASK_ASSIGNMENT_PILL_CLASS} ${style.badge}`} title={style.label}>
        <span aria-hidden>{style.icon}</span>
        {style.label}
      </span>,
      true,
    );
  }

  return cellWrap(
    <div className="relative inline-flex max-w-full items-center justify-center">
      <select
        aria-label={ctx.t("providerMaster.dashboard.inward.taskAssignment.colPriority")}
        value={task.priority}
        disabled={disabled}
        onClick={stopGridPropagation}
        onMouseDown={stopGridPropagation}
        onChange={(event) =>
          ctx.onPriorityChange(task.id, event.target.value as InwardTaskPriority)
        }
        className="absolute inset-0 z-[1] cursor-pointer opacity-0"
      >
        {TASK_PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {TASK_PRIORITY_STYLES[priority].label}
          </option>
        ))}
      </select>
      <span
        className={`${TASK_ASSIGNMENT_PILL_CLASS} ${style.badge} pointer-events-none`}
        title={style.label}
      >
        <span aria-hidden>{style.icon}</span>
        {style.label}
      </span>
    </div>,
    true,
  );
}

export function TaskDueDateCell(
  params: CustomCellRendererProps<ProviderInwardTaskGridRow, unknown, TaskGridContext>,
) {
  const task = params.data;
  const ctx = params.context;
  if (!task || !ctx) return null;

  const relative = getDueDateRelativeLabel(task.dueDate);

  if (task.status === "COMPLETED" || task.status === "CANCELLED") {
    return cellWrap(
      <p
        className="min-w-0 truncate text-[10px] leading-none text-slate-700"
        title={task.dueDateRemark ?? undefined}
      >
        {formatProviderDateTimeDisplay(task.dueDate)}
      </p>,
      true,
    );
  }

  const dueDateTitle = `${formatProviderDateTimeDisplay(task.dueDate)} · ${relative.label}${
    task.dueDateRemark ? ` · ${task.dueDateRemark}` : ""
  }`;

  return cellWrap(
    <TaskDueDateField
      name={`due-${task.id}`}
      value={task.dueDate}
      onChange={(value) => {
        if (value && value !== task.dueDate) {
          ctx.onDueDateChange(task.id, value);
        }
      }}
      disabled={ctx.savingDueDate || ctx.assigning}
      variant="grid"
      title={dueDateTitle}
      placeholder={ctx.t("providerMaster.dashboard.inward.taskAssignment.setDeadline")}
    />,
    true,
  );
}

export function TaskSlaCell(
  params: CustomCellRendererProps<ProviderInwardTaskGridRow, unknown, TaskGridContext>,
) {
  const task = params.data;
  if (!task) return null;

  const sla = getTaskSlaIndicator(task.dueDate, task.status);

  return cellWrap(
    <span
      title={sla.tooltip}
      className={`${TASK_ASSIGNMENT_PILL_CLASS} ${SLA_TONE_STYLES[sla.tone]}`}
    >
      {sla.label}
    </span>,
    true,
  );
}

function TaskRowActionsCell({
  task,
  disabled = false,
  t,
  onAction,
}: Readonly<{
  task: ProviderInwardTask;
  disabled?: boolean;
  t: TFunction;
  onAction: (taskId: string, action: TaskAssignmentPanelAction) => void;
}>) {
  const canReassign =
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED" &&
    (Boolean(task.assignedUserId) ||
      task.status === "ASSIGNED" ||
      task.status === "IN_PROGRESS");
  const showWorkflow =
    Boolean(task.workflowStage) &&
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED";

  const run = (action: TaskAssignmentPanelAction) => {
    onAction(task.id, action);
  };

  return (
    <div
      data-row-action-root="true"
      className="inline-flex items-center justify-center gap-0.5"
      onClick={stopGridPropagation}
      onMouseDown={stopGridPropagation}
    >
      {showWorkflow ? (
        <button
          type="button"
          disabled={disabled}
          title={t("providerMaster.dashboard.inward.taskAssignment.openWorkflow", {
            stage: task.workflowStage,
          })}
          aria-label={t("providerMaster.dashboard.inward.taskAssignment.viewWorkflow")}
          onClick={(event) => {
            stopGridPropagation(event);
            run("timeline");
          }}
          onMouseDown={stopGridPropagation}
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowPathIcon className="h-4 w-4" aria-hidden />
        </button>
      ) : null}

      {canReassign ? (
        <button
          type="button"
          disabled={disabled}
          title={t("providerMaster.dashboard.inward.taskAssignment.reassignTask")}
          aria-label={t("providerMaster.dashboard.inward.taskAssignment.reassignTask")}
          onClick={(event) => {
            stopGridPropagation(event);
            run("reassign");
          }}
          onMouseDown={stopGridPropagation}
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowsRightLeftIcon className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function TaskActionsCell(
  params: CustomCellRendererProps<ProviderInwardTaskGridRow, unknown, TaskGridContext>,
) {
  const task = params.data;
  const ctx = params.context;
  if (!task || !ctx) return null;

  return cellWrap(
    <TaskRowActionsCell
      task={task}
      disabled={ctx.assigning}
      t={ctx.t}
      onAction={ctx.onRowAction}
    />,
    true,
  );
}

export function WorkflowStageCell(
  params: CustomCellRendererProps<ProviderInwardTaskGridRow, unknown, TaskGridContext>,
) {
  const task = params.data;
  const ctx = params.context;
  if (!task || !ctx) return null;
  return cellWrap(
    <button
      type="button"
      title={ctx.t("providerMaster.dashboard.inward.taskAssignment.viewWorkflow")}
      onClick={(event) => {
        stopGridPropagation(event);
        ctx.onRowAction(task.id, "timeline");
      }}
      onMouseDown={stopGridPropagation}
      className="max-w-full cursor-pointer truncate rounded bg-purple-100 px-2 py-1 text-[11px] font-medium text-purple-700 transition-colors hover:bg-purple-200/80"
    >
      {task.workflowStage}
    </button>,
  );
}

export function TaskIconCell(params: CustomCellRendererProps<ProviderInwardTaskGridRow>) {
  const task = params.data;
  if (!task) return null;
  const icon = getTaskIcon(task.name);
  return cellWrap(
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[8px] font-bold ${icon.className}`}
      title={task.name}
    >
      {icon.glyph}
    </span>,
    true,
  );
}

export function TaskDetailsCell(params: CustomCellRendererProps<ProviderInwardTaskGridRow>) {
  const task = params.data;
  if (!task) return null;
  return cellWrap(
    <span className="truncate text-[11px] font-semibold text-slate-800">{task.name}</span>,
  );
}
