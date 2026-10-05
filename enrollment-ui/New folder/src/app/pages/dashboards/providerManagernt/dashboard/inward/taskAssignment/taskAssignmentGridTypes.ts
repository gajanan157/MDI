import type { TFunction } from "i18next";
import type {
  InwardTaskPriority,
  ProviderInwardTask,
  TaskAssignmentPanelAction,
} from "./providerInwardTaskTypes";

export type ProviderInwardTaskGridRow = ProviderInwardTask & {
  __isSelected: boolean;
};

export type TaskGridContext = {
  t: TFunction;
  assigning: boolean;
  savingPriority: boolean;
  savingDueDate: boolean;
  selectedTaskIds: string[];
  pendingTaskIds: string[];
  onToggleSelect: (taskId: string) => void;
  onToggleSelectAll: (taskIds: string[]) => void;
  onPriorityChange: (taskId: string, priority: InwardTaskPriority) => void;
  onDueDateChange: (taskId: string, dueDate: string) => void;
  onRowAction: (taskId: string, action: TaskAssignmentPanelAction) => void;
};

export type TaskGridSelectionState = {
  selectedTaskIds: string[];
  pendingTaskIds: string[];
  assigning: boolean;
};

export const TASK_ASSIGNMENT_ROW_HEIGHT = 32;

export function isTaskSelectable(task: ProviderInwardTask | undefined) {
  if (!task) return false;
  return (
    task.status === "PENDING" ||
    task.status === "ASSIGNED" ||
    task.status === "IN_PROGRESS" ||
    task.status === "BLOCKED"
  );
}

export function toTaskGridRows(
  tasks: ProviderInwardTask[],
  selectedTaskIds: string[],
): ProviderInwardTaskGridRow[] {
  return tasks.map((task) => ({
    ...task,
    __isSelected: selectedTaskIds.includes(task.id),
  }));
}
