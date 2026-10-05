import type { TFunction } from "i18next";
import {
  ProviderFilterChipGroup,
  type ProviderFilterChip,
} from "../../../shared/dashboard";
import { TASK_PRIORITY_STYLES, TASK_STATUS_STYLES } from "./taskAssignmentConfig";
import type { TaskAssignmentFilters } from "./taskAssignmentFilterUtils";

type TaskAssignmentFilterChipsProps = {
  filters: TaskAssignmentFilters;
  activeFilterCount: number;
  onFiltersChange: (patch: Partial<TaskAssignmentFilters>) => void;
  onReset: () => void;
  t: TFunction;
};

export function TaskAssignmentFilterChips({
  filters,
  activeFilterCount,
  onFiltersChange,
  onReset,
  t,
}: Readonly<TaskAssignmentFilterChipsProps>) {
  const chips = buildFilterChips(filters, t, onFiltersChange);

  return (
    <ProviderFilterChipGroup
      chips={chips}
      onClearAll={onReset}
      clearAllLabel={t("providerMaster.dashboard.inward.taskAssignment.clearAllFilters")}
      label={
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {t("providerMaster.dashboard.inward.taskAssignment.filters")} ({activeFilterCount})
        </span>
      }
    />
  );
}

function buildFilterChips(
  filters: TaskAssignmentFilters,
  t: TFunction,
  onChange: (patch: Partial<TaskAssignmentFilters>) => void,
): ProviderFilterChip[] {
  const chips: ProviderFilterChip[] = [];

  if (filters.searchQuery.trim()) {
    chips.push({
      key: "search",
      label: `"${filters.searchQuery.trim()}"`,
      onRemove: () => onChange({ searchQuery: "" }),
    });
  }
  if (filters.statusFilter !== "ALL") {
    chips.push({
      key: "status",
      label:
        TASK_STATUS_STYLES[filters.statusFilter as keyof typeof TASK_STATUS_STYLES]?.label ??
        filters.statusFilter,
      onRemove: () => onChange({ statusFilter: "ALL" }),
    });
  }
  if (filters.priorityFilter !== "ALL") {
    chips.push({
      key: "priority",
      label: TASK_PRIORITY_STYLES[filters.priorityFilter].label,
      onRemove: () => onChange({ priorityFilter: "ALL" }),
    });
  }
  if (filters.assigneeFilter !== "ALL") {
    chips.push({
      key: "assignee",
      label:
        filters.assigneeFilter === "UNASSIGNED"
          ? t("providerMaster.dashboard.inward.taskAssignment.unassigned")
          : filters.assigneeFilter,
      onRemove: () => onChange({ assigneeFilter: "ALL" }),
    });
  }
  if (filters.workflowStageFilter !== "ALL") {
    chips.push({
      key: "stage",
      label: filters.workflowStageFilter,
      onRemove: () => onChange({ workflowStageFilter: "ALL" }),
    });
  }
  if (filters.dueDateFilter !== "ALL") {
    const labels: Record<TaskAssignmentFilters["dueDateFilter"], string> = {
      ALL: "",
      OVERDUE: t("providerMaster.dashboard.inward.taskAssignment.overdue"),
      TODAY: t("providerMaster.dashboard.inward.taskAssignment.dueToday"),
      THIS_WEEK: t("providerMaster.dashboard.inward.taskAssignment.dueThisWeek"),
    };
    chips.push({
      key: "due",
      label: labels[filters.dueDateFilter],
      onRemove: () => onChange({ dueDateFilter: "ALL" }),
    });
  }

  return chips;
}
