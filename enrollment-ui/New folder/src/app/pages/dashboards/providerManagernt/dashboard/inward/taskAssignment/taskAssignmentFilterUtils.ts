import type { TFunction } from "i18next";
import type { SearchField } from "@/app/pages/dashboards/CommonSearch";
import { TASK_PRIORITY_STYLES, TASK_STATUS_STYLES } from "./taskAssignmentConfig";
import type { InwardTaskFilterStatus, InwardTaskPriority } from "./providerInwardTaskTypes";

export type TaskAssignmentFilters = {
  searchQuery: string;
  statusFilter: InwardTaskFilterStatus;
  priorityFilter: InwardTaskPriority | "ALL";
  assigneeFilter: string;
  workflowStageFilter: string;
  dueDateFilter: "ALL" | "OVERDUE" | "TODAY" | "THIS_WEEK";
};

export const DEFAULT_TASK_FILTERS: TaskAssignmentFilters = {
  searchQuery: "",
  statusFilter: "ALL",
  priorityFilter: "ALL",
  assigneeFilter: "ALL",
  workflowStageFilter: "ALL",
  dueDateFilter: "ALL",
};

export function countActiveFilters(filters: TaskAssignmentFilters): number {
  let count = 0;
  if (filters.searchQuery.trim()) count += 1;
  if (filters.statusFilter !== "ALL") count += 1;
  if (filters.priorityFilter !== "ALL") count += 1;
  if (filters.assigneeFilter !== "ALL") count += 1;
  if (filters.workflowStageFilter !== "ALL") count += 1;
  if (filters.dueDateFilter !== "ALL") count += 1;
  return count;
}

export function buildTaskAssignmentSearchFields(
  t: TFunction,
  workflowStages: string[],
  assigneeOptions: { label: string; value: string }[],
): SearchField[] {
  return [
    {
      name: "searchQuery",
      label: t("providerMaster.dashboard.inward.taskAssignment.searchTasks"),
      type: "text",
      defaultValue: "",
    },
    {
      name: "statusFilter",
      label: t("providerMaster.dashboard.inward.table.status"),
      type: "dropdown",
      defaultValue: "ALL",
      options: [
        { label: t("providerMaster.dashboard.inward.taskAssignment.allStatuses"), value: "ALL" },
        ...Object.entries(TASK_STATUS_STYLES).map(([key, style]) => ({
          label: style.label,
          value: key,
        })),
      ],
    },
    {
      name: "priorityFilter",
      label: t("providerMaster.dashboard.inward.taskAssignment.colPriority"),
      type: "dropdown",
      defaultValue: "ALL",
      options: [
        { label: t("providerMaster.dashboard.inward.taskAssignment.allPriorities"), value: "ALL" },
        ...Object.entries(TASK_PRIORITY_STYLES).map(([key, style]) => ({
          label: style.label,
          value: key,
        })),
      ],
    },
    {
      name: "assigneeFilter",
      label: t("providerMaster.dashboard.inward.table.assignedTo"),
      type: "dropdown",
      defaultValue: "ALL",
      options: assigneeOptions,
    },
    {
      name: "workflowStageFilter",
      label: t("providerMaster.dashboard.inward.taskAssignment.colWorkflowStage"),
      type: "dropdown",
      defaultValue: "ALL",
      options: [
        { label: t("providerMaster.dashboard.inward.taskAssignment.allStages"), value: "ALL" },
        ...workflowStages.map((stage) => ({ label: stage, value: stage })),
      ],
    },
    {
      name: "dueDateFilter",
      label: t("providerMaster.dashboard.inward.taskAssignment.colDueDate"),
      type: "dropdown",
      defaultValue: "ALL",
      options: [
        { label: t("providerMaster.dashboard.inward.taskAssignment.allDueDates"), value: "ALL" },
        { label: t("providerMaster.dashboard.inward.taskAssignment.overdue"), value: "OVERDUE" },
        { label: t("providerMaster.dashboard.inward.taskAssignment.dueToday"), value: "TODAY" },
        { label: t("providerMaster.dashboard.inward.taskAssignment.dueThisWeek"), value: "THIS_WEEK" },
      ],
    },
  ];
}

export function mapSearchFormToFilters(
  data: Record<string, unknown>,
): Partial<TaskAssignmentFilters> {
  return {
    searchQuery: String(data.searchQuery ?? "").trim(),
    statusFilter: (data.statusFilter as InwardTaskFilterStatus) || "ALL",
    priorityFilter: (data.priorityFilter as InwardTaskPriority | "ALL") || "ALL",
    assigneeFilter: String(data.assigneeFilter ?? "ALL"),
    workflowStageFilter: String(data.workflowStageFilter ?? "ALL"),
    dueDateFilter:
      (data.dueDateFilter as TaskAssignmentFilters["dueDateFilter"]) || "ALL",
  };
}
