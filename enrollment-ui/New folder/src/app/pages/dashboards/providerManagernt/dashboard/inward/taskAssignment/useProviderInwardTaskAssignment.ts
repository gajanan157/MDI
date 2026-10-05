import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ProviderInwardRow } from "../providerInwardTypes";
import {
  assignAllPendingInwardTasks,
  assignInwardTasks,
  fetchInwardTasks,
  getInwardTaskUserOptions,
  removeInwardTaskAssignments,
  reassignInwardTasksViaRemove,
  resolveProviderName,
  setInwardTaskUserOptions,
  summarizeInwardTasks,
  updateInwardTaskDueDate,
  updateInwardTaskDueDates,
  updateInwardTaskPriorities,
  updateInwardTaskPriority,
} from "./providerInwardTaskMockData";
import type {
  AssignmentPanelMode,
  InwardTaskFilterStatus,
  InwardTaskPriority,
  InwardTaskUserOption,
  ProviderInwardTask,
  TaskAssignmentPanelAction,
  TaskAssignmentDrawerContext,
} from "./providerInwardTaskTypes";
import { BULK_UNASSIGN_USER_ID, TASK_PRIORITY_ORDER } from "./taskAssignmentConfig";
import {
  countActiveFilters,
  DEFAULT_TASK_FILTERS,
  type TaskAssignmentFilters,
} from "./taskAssignmentFilterUtils";
import { getDueDateRelativeLabel } from "./taskDueDateUtils";
import { fetchTaskAssignmentUsers } from "./taskAssignmentUsersAPI";

function showUndoToast(
  message: string,
  previousTasks: ProviderInwardTask[],
  restore: (tasks: ProviderInwardTask[]) => void,
  undoLabel: string,
) {
  toast.success(message, {
    position: "top-right",
    action: {
      label: undoLabel,
      onClick: () => restore(previousTasks),
    },
  });
}

export function useProviderInwardTaskAssignment(onAssigned?: () => void) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [context, setContext] = useState<TaskAssignmentDrawerContext | null>(null);
  const [tasks, setTasks] = useState<ProviderInwardTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [savingPriority, setSavingPriority] = useState(false);
  const [savingDueDate, setSavingDueDate] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskAssignmentFilters>(DEFAULT_TASK_FILTERS);
  const [confirmAssignAllOpen, setConfirmAssignAllOpen] = useState(false);
  const [assignAllUserId, setAssignAllUserId] = useState("");
  const [assignAllPriority, setAssignAllPriority] = useState<InwardTaskPriority | "">("");
  const [assignAllDueDate, setAssignAllDueDate] = useState("");
  const [assignAllDueDateRemark, setAssignAllDueDateRemark] = useState("");
  const [summaryVersion, setSummaryVersion] = useState(0);

  const [assignmentPanelOpen, setAssignmentPanelOpen] = useState(false);
  const [assignmentPanelMode, setAssignmentPanelMode] = useState<AssignmentPanelMode>("assign");
  const [panelTaskIds, setPanelTaskIds] = useState<string[]>([]);
  const [panelUserId, setPanelUserId] = useState("");
  const [panelComment, setPanelComment] = useState("");
  const [panelNotify, setPanelNotify] = useState(true);

  const [bulkPriority, setBulkPriority] = useState<InwardTaskPriority | "">("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkDueDateRemark, setBulkDueDateRemark] = useState("");
  const [bulkUserId, setBulkUserId] = useState("");

  const bumpSummaryVersion = useCallback(() => {
    setSummaryVersion((current) => current + 1);
  }, []);

  const [userOptions, setUserOptions] = useState<InwardTaskUserOption[]>([]);
  const summary = useMemo(() => summarizeInwardTasks(tasks), [tasks]);
  const progressPercent =
    summary.total === 0 ? 0 : Math.round((summary.completed / summary.total) * 100);

  const workflowStages = useMemo(
    () =>
      [...new Set(tasks.map((task) => task.workflowStage))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [tasks],
  );

  const loadTasks = useCallback(async (row: ProviderInwardRow) => {
    setLoading(true);
    try {
      const next = await fetchInwardTasks(row.inwardNo, row.subcategory);
      setTasks(next);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAssignableUsers = useCallback(async () => {
    try {
      const users = await fetchTaskAssignmentUsers({ page: 1, size: 20 });
      setInwardTaskUserOptions(users);
      setUserOptions(getInwardTaskUserOptions());
    } catch {
      toast.error(
        t("providerMaster.dashboard.inward.taskAssignment.toastUsersLoadFailed", {
          defaultValue: "Failed to load users for assignment.",
        }),
      );
    }
  }, [t]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_TASK_FILTERS);
  }, []);

  const openDrawer = useCallback(
    (row: ProviderInwardRow) => {
      setContext({
        row,
        providerName: resolveProviderName(row.sourceEntity),
      });
      setDrawerOpen(true);
      setSelectedTaskIds([]);
      setFilters(DEFAULT_TASK_FILTERS);
      setAssignAllUserId("");
      setAssignAllPriority("");
      setAssignAllDueDate("");
      setBulkPriority("");
      setBulkDueDate("");
      setBulkUserId("");
      setAssignmentPanelOpen(false);
      loadTasks(row).catch(() => undefined);
      loadAssignableUsers().catch(() => undefined);
    },
    [loadAssignableUsers, loadTasks],
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setContext(null);
    setTasks([]);
    setConfirmAssignAllOpen(false);
    setAssignmentPanelOpen(false);
  }, []);

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  }, []);

  const setTaskSelection = useCallback((taskIds: string[]) => {
    setSelectedTaskIds(taskIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  const patchFilters = useCallback((patch: Partial<TaskAssignmentFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      list = list.filter(
        (task) =>
          task.name.toLowerCase().includes(q) ||
          task.workflowStage.toLowerCase().includes(q) ||
          task.assignedUserName?.toLowerCase().includes(q),
      );
    }

    if (filters.statusFilter !== "ALL") {
      if (filters.statusFilter === "ASSIGNED") {
        list = list.filter(
          (task) => task.status === "ASSIGNED" || task.status === "IN_PROGRESS",
        );
      } else {
        list = list.filter((task) => task.status === filters.statusFilter);
      }
    }

    if (filters.priorityFilter !== "ALL") {
      list = list.filter((task) => task.priority === filters.priorityFilter);
    }

    if (filters.assigneeFilter === "UNASSIGNED") {
      list = list.filter((task) => !task.assignedUserId);
    } else if (filters.assigneeFilter !== "ALL") {
      list = list.filter((task) => task.assignedUserId === filters.assigneeFilter);
    }

    if (filters.workflowStageFilter !== "ALL") {
      list = list.filter((task) => task.workflowStage === filters.workflowStageFilter);
    }

    if (filters.dueDateFilter === "OVERDUE") {
      list = list.filter(
        (task) =>
          task.status !== "COMPLETED" &&
          getDueDateRelativeLabel(task.dueDate).tone === "overdue",
      );
    } else if (filters.dueDateFilter === "TODAY") {
      list = list.filter((task) => getDueDateRelativeLabel(task.dueDate).label === "(Today)");
    } else if (filters.dueDateFilter === "THIS_WEEK") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      list = list.filter((task) => {
        const due = new Date(`${task.dueDate}T00:00:00`);
        return due >= today && due <= weekEnd;
      });
    }

    list.sort(
      (a, b) => TASK_PRIORITY_ORDER[a.priority] - TASK_PRIORITY_ORDER[b.priority],
    );

    return list;
  }, [filters, tasks]);

  const panelTasks = useMemo(
    () => tasks.filter((task) => panelTaskIds.includes(task.id)),
    [panelTaskIds, tasks],
  );

  const openAssignmentPanel = useCallback(
    (taskIds: string[], mode: AssignmentPanelMode = "assign") => {
      setPanelTaskIds(taskIds);
      setAssignmentPanelMode(mode);
      setPanelUserId("");
      setPanelComment("");
      setPanelNotify(true);
      setAssignmentPanelOpen(true);
    },
    [],
  );

  const closeAssignmentPanel = useCallback(() => {
    setAssignmentPanelOpen(false);
    setPanelTaskIds([]);
    setPanelUserId("");
    setPanelComment("");
  }, []);

  const commitPanelAssignment = useCallback(
    async (withNotify: boolean) => {
      if (!context || !panelUserId || panelTaskIds.length === 0) return;
      const previous = structuredClone(tasks);
      setAssigning(true);
      try {
        const pendingIds = panelTaskIds.filter((id) => {
          const task = tasks.find((item) => item.id === id);
          return task?.status === "PENDING";
        });
        const reassignIds = panelTaskIds.filter((id) => !pendingIds.includes(id));

        let next = tasks;
        if (pendingIds.length > 0) {
          next = await assignInwardTasks(
            context.row.inwardNo,
            pendingIds,
            panelUserId,
            bulkPriority || undefined,
          );
        }
        if (reassignIds.length > 0) {
          next = await reassignInwardTasksViaRemove(
            context.row.inwardNo,
            reassignIds,
            panelUserId,
          );
        }

        setTasks(next);
        setSelectedTaskIds((current) => current.filter((id) => !panelTaskIds.includes(id)));
        closeAssignmentPanel();
        showUndoToast(
          withNotify
            ? t("providerMaster.dashboard.inward.taskAssignment.toastAssignedAndNotified")
            : t("providerMaster.dashboard.inward.taskAssignment.toastTaskAssigned"),
          previous,
          setTasks,
          t("providerMaster.dashboard.inward.taskAssignment.undo"),
        );
        bumpSummaryVersion();
        onAssigned?.();
      } finally {
        setAssigning(false);
      }
    },
    [
      bulkPriority,
      bumpSummaryVersion,
      closeAssignmentPanel,
      context,
      onAssigned,
      panelTaskIds,
      panelUserId,
      t,
      tasks,
    ],
  );

  const handleApplyBulkChanges = useCallback(async () => {
    if (!context || selectedTaskIds.length === 0) return;
    if (!bulkUserId && !bulkPriority && !bulkDueDate) return;

    const previous = structuredClone(tasks);
    setAssigning(true);
    try {
      let next = tasks;

      if (bulkUserId === BULK_UNASSIGN_USER_ID) {
        next = await removeInwardTaskAssignments(context.row.inwardNo, selectedTaskIds);
      } else if (bulkUserId) {
        const pendingIds = selectedTaskIds.filter((id) => {
          const task = tasks.find((item) => item.id === id);
          return task?.status === "PENDING";
        });
        const reassignIds = selectedTaskIds.filter((id) => !pendingIds.includes(id));

        if (pendingIds.length > 0) {
          next = await assignInwardTasks(
            context.row.inwardNo,
            pendingIds,
            bulkUserId,
            bulkPriority || undefined,
          );
        }
        if (reassignIds.length > 0) {
          next = await reassignInwardTasksViaRemove(
            context.row.inwardNo,
            reassignIds,
            bulkUserId,
            bulkPriority || undefined,
          );
        }
      }

      if (bulkPriority) {
        next = await updateInwardTaskPriorities(
          context.row.inwardNo,
          selectedTaskIds,
          bulkPriority,
        );
      }

      if (bulkDueDate) {
        next = await updateInwardTaskDueDates(
          context.row.inwardNo,
          selectedTaskIds,
          bulkDueDate,
          bulkDueDateRemark,
        );
      }

      setTasks(next);
      setBulkUserId("");
      setBulkPriority("");
      setBulkDueDate("");
      setBulkDueDateRemark("");
      showUndoToast(
        t("providerMaster.dashboard.inward.taskAssignment.toastBulkChangesApplied"),
        previous,
        setTasks,
        t("providerMaster.dashboard.inward.taskAssignment.undo"),
      );
      bumpSummaryVersion();
      onAssigned?.();
    } finally {
      setAssigning(false);
    }
  }, [
    bulkDueDate,
    bulkDueDateRemark,
    bulkPriority,
    bulkUserId,
    bumpSummaryVersion,
    context,
    onAssigned,
    selectedTaskIds,
    t,
    tasks,
  ]);

  const handleAssignAllPending = useCallback(async () => {
    if (!context || !assignAllUserId) return;
    const previous = structuredClone(tasks);
    const pendingIds = tasks.filter((task) => task.status === "PENDING").map((task) => task.id);
    setAssigning(true);
    try {
      let next = await assignAllPendingInwardTasks(
        context.row.inwardNo,
        assignAllUserId,
        assignAllPriority || undefined,
      );

      if (assignAllDueDate && pendingIds.length > 0) {
        next = await updateInwardTaskDueDates(
          context.row.inwardNo,
          pendingIds,
          assignAllDueDate,
          assignAllDueDateRemark,
        );
      }

      setTasks(next);
      setAssignAllUserId("");
      setAssignAllPriority("");
      setAssignAllDueDate("");
      setAssignAllDueDateRemark("");
      setConfirmAssignAllOpen(false);
      showUndoToast(
        t("providerMaster.dashboard.inward.taskAssignment.toastAllAssigned"),
        previous,
        setTasks,
        t("providerMaster.dashboard.inward.taskAssignment.undo"),
      );
      bumpSummaryVersion();
      onAssigned?.();
    } finally {
      setAssigning(false);
    }
  }, [
    assignAllDueDate,
    assignAllDueDateRemark,
    assignAllPriority,
    assignAllUserId,
    bumpSummaryVersion,
    context,
    onAssigned,
    t,
    tasks,
  ]);

  const handlePriorityChange = useCallback(
    async (taskId: string, priority: InwardTaskPriority) => {
      if (!context) return;
      setSavingPriority(true);
      try {
        const next = await updateInwardTaskPriority(context.row.inwardNo, taskId, priority);
        setTasks(next);
      } finally {
        setSavingPriority(false);
      }
    },
    [context],
  );

  const handleDueDateChange = useCallback(
    async (taskId: string, dueDate: string, remark = "") => {
      if (!context || !dueDate) return;
      setSavingDueDate(true);
      try {
        const next = await updateInwardTaskDueDate(
          context.row.inwardNo,
          taskId,
          dueDate,
          remark,
        );
        setTasks(next);
        toast.success(t("providerMaster.dashboard.inward.taskAssignment.toastDueDateUpdated"), {
          position: "top-right",
        });
      } finally {
        setSavingDueDate(false);
      }
    },
    [context, t],
  );

  const handleRowAction = useCallback(
    (taskId: string, action: TaskAssignmentPanelAction) => {
      if (!tasks.some((item) => item.id === taskId)) return;

      switch (action) {
        case "assign":
          openAssignmentPanel([taskId], "assign");
          break;
        case "reassign":
          openAssignmentPanel([taskId], "reassign");
          break;
        case "remove": {
          const removeAssignment = async () => {
            if (!context) return;
            const previous = structuredClone(tasks);
            const next = await removeInwardTaskAssignments(context.row.inwardNo, [taskId]);
            setTasks(next);
            showUndoToast(
              t("providerMaster.dashboard.inward.taskAssignment.toastRemovedAssignment"),
              previous,
              setTasks,
              t("providerMaster.dashboard.inward.taskAssignment.undo"),
            );
            bumpSummaryVersion();
          };
          removeAssignment().catch(() => undefined);
          break;
        }
        default:
          break;
      }
    },
    [bumpSummaryVersion, context, openAssignmentPanel, t, tasks],
  );

  const handleOverdueView = useCallback(() => {
    patchFilters({ dueDateFilter: "OVERDUE", statusFilter: "ALL" });
  }, [patchFilters]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (assignmentPanelOpen) {
          closeAssignmentPanel();
          return;
        }
        closeDrawer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [assignmentPanelOpen, closeAssignmentPanel, closeDrawer, drawerOpen]);

  return {
    drawerOpen,
    context,
    tasks,
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
    activeFilterCount: countActiveFilters(filters),
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
    summaryVersion,
    assignmentPanelOpen,
    assignmentPanelMode,
    panelTasks,
    panelUserId,
    setPanelUserId,
    panelComment,
    setPanelComment,
    panelNotify,
    setPanelNotify,
    openDrawer,
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
    statusFilter: filters.statusFilter,
    setStatusFilter: (status: InwardTaskFilterStatus) => patchFilters({ statusFilter: status }),
  };
}
