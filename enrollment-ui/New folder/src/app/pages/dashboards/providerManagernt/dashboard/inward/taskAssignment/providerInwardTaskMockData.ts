import type {
  ProviderAuditLogEntry,
} from "../../../provider-master/provider/detail/shared/providerAuditLog";
import type {
  InwardTaskAssignee,
  InwardTaskPriority,
  InwardTaskUserOption,
  ProviderInwardTask,
  ProviderInwardTaskSummary,
} from "./providerInwardTaskTypes";
import { AVATAR_COLORS } from "./taskAssignmentConfig";
import { countOverdueTasks } from "./taskDueDateUtils";

type TaskAuditLogEntry = {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  remarks?: string;
};

/** Users loaded from user-impersonation-service for assign dropdowns. */
let cachedAssignableUsers: InwardTaskUserOption[] | null = null;

const taskStore = new Map<string, ProviderInwardTask[]>();

function resolveAssignableUser(userId: string): InwardTaskUserOption | undefined {
  return cachedAssignableUsers?.find((user) => user.id === userId);
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildDefaultTasks(
  inwardNo: string,
  subcategory: string,
): ProviderInwardTask[] {
  const seed = inwardNo.charCodeAt(inwardNo.length - 1) % 3;
  if (seed === 0) {
    return [
      {
        id: `${inwardNo}-t1`,
        inwardNo,
        name: "Document Verification",
        workflowStage: "Intake Review",
        priority: "HIGH",
        status: "PENDING",
        subcategory,
        dueDate: "2026-07-22",
      },
      {
        id: `${inwardNo}-t2`,
        inwardNo,
        name: "Provider Code Mapping",
        workflowStage: "Data Enrichment",
        priority: "MEDIUM",
        status: "PENDING",
        subcategory,
        dueDate: "2026-07-23",
      },
      {
        id: `${inwardNo}-t3`,
        inwardNo,
        name: "Bank Details Validation",
        workflowStage: "Compliance Check",
        priority: "HIGH",
        status: "PENDING",
        subcategory,
        dueDate: "2026-07-21",
      },
    ];
  }

  if (seed === 1) {
    return [
      {
        id: `${inwardNo}-t1`,
        inwardNo,
        name: "Rohini Registration Review",
        workflowStage: "Registration",
        priority: "HIGH",
        status: "ASSIGNED",
        subcategory,
        assignedUserId: "u1",
        assignedUserName: "Priya Sharma",
        assignedUserInitials: "PS",
        assignedUserEmail: "priya.sharma@magma.com",
        dueDate: "2026-07-20",
      },
      {
        id: `${inwardNo}-t2`,
        inwardNo,
        name: "Tariff Sheet Upload",
        workflowStage: "Documentation",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        subcategory,
        assignedUserId: "u2",
        assignedUserName: "Rajesh Kumar",
        assignedUserInitials: "RK",
        assignedUserEmail: "rajesh.kumar@magma.com",
        dueDate: "2026-07-22",
      },
      {
        id: `${inwardNo}-t3`,
        inwardNo,
        name: "Network Agreement Check",
        workflowStage: "Legal Review",
        priority: "LOW",
        status: "COMPLETED",
        subcategory,
        assignedUserId: "u3",
        assignedUserName: "Anita Desai",
        assignedUserInitials: "AD",
        assignedUserEmail: "anita.desai@magma.com",
        dueDate: "2026-07-18",
      },
      {
        id: `${inwardNo}-t4`,
        inwardNo,
        name: "Quality Control",
        workflowStage: "QC",
        priority: "MEDIUM",
        status: "PENDING",
        subcategory,
        dueDate: "2026-07-24",
      },
    ];
  }

  return [
    {
      id: `${inwardNo}-t1`,
      inwardNo,
      name: "Initial Screening",
      workflowStage: "Intake",
      priority: "MEDIUM",
      status: "ASSIGNED",
      subcategory,
      assignedUserId: "u4",
      assignedUserName: "Vikram Singh",
      assignedUserInitials: "VS",
      dueDate: "2026-07-21",
    },
    {
      id: `${inwardNo}-t2`,
      inwardNo,
      name: "IC Mapping Validation",
      workflowStage: "Mapping",
      priority: "HIGH",
      status: "ASSIGNED",
      subcategory,
      assignedUserId: "u5",
      assignedUserName: "Meera Patel",
      assignedUserInitials: "MP",
      dueDate: "2026-07-22",
    },
    {
      id: `${inwardNo}-t3`,
      inwardNo,
      name: "Final Approval",
      workflowStage: "Approval",
      priority: "HIGH",
      status: "ASSIGNED",
      subcategory,
      assignedUserId: "u1",
      assignedUserName: "Priya Sharma",
      assignedUserInitials: "PS",
      dueDate: "2026-07-23",
    },
    {
      id: `${inwardNo}-t4`,
      inwardNo,
      name: "Archive & Closure",
      workflowStage: "Closure",
      priority: "LOW",
      status: "ASSIGNED",
      subcategory,
      assignedUserId: "u2",
      assignedUserName: "Rajesh Kumar",
      assignedUserInitials: "RK",
      dueDate: "2026-07-25",
    },
    {
      id: `${inwardNo}-t5`,
      inwardNo,
      name: "Audit Trail Review",
      workflowStage: "Audit",
      priority: "MEDIUM",
      status: "ASSIGNED",
      subcategory,
      assignedUserId: "u3",
      assignedUserName: "Anita Desai",
      assignedUserInitials: "AD",
      dueDate: "2026-07-26",
    },
  ];
}

function ensureTasks(inwardNo: string, subcategory: string): ProviderInwardTask[] {
  if (!taskStore.has(inwardNo)) {
    taskStore.set(inwardNo, buildDefaultTasks(inwardNo, subcategory));
  }
  return taskStore.get(inwardNo)!;
}

type StatusCountKey =
  | "pending"
  | "assigned"
  | "inProgress"
  | "completed"
  | "rejected"
  | "blocked"
  | "cancelled";

const STATUS_COUNT_KEY: Record<ProviderInwardTask["status"], StatusCountKey | null> = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
  REJECTED: "rejected",
  BLOCKED: "blocked",
  CANCELLED: "cancelled",
};

function bumpStatusCount(
  counts: Record<StatusCountKey, number>,
  status: ProviderInwardTask["status"],
) {
  const key = STATUS_COUNT_KEY[status];
  if (key) counts[key] += 1;
}

function collectTaskAssignees(tasks: ProviderInwardTask[]): InwardTaskAssignee[] {
  const assigneeMap = new Map<string, InwardTaskAssignee>();

  for (const task of tasks) {
    if (!task.assignedUserId || !task.assignedUserName) continue;
    if (assigneeMap.has(task.assignedUserId)) continue;

    assigneeMap.set(task.assignedUserId, {
      id: task.assignedUserId,
      name: task.assignedUserName,
      initials: task.assignedUserInitials ?? initials(task.assignedUserName),
      avatarColor: AVATAR_COLORS[assigneeMap.size % AVATAR_COLORS.length],
    });
  }

  return [...assigneeMap.values()];
}

function resolveAllowBulkAssignAll(tasks: ProviderInwardTask[]): boolean {
  const pendingTasks = tasks.filter((task) => task.status === "PENDING");
  if (pendingTasks.length === 0) return false;

  const pendingSubcategories = new Set(pendingTasks.map((task) => task.subcategory));
  return (
    pendingSubcategories.size === 1 || pendingTasks.every((task) => !task.assignedUserId)
  );
}

export function summarizeInwardTasks(tasks: ProviderInwardTask[]): ProviderInwardTaskSummary {
  const counts: Record<StatusCountKey, number> = {
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    blocked: 0,
    cancelled: 0,
  };

  let hasUnassignedPending = false;

  for (const task of tasks) {
    bumpStatusCount(counts, task.status);
    if (task.status === "PENDING" && !task.assignedUserId) {
      hasUnassignedPending = true;
    }
  }

  return {
    ...counts,
    overdue: countOverdueTasks(tasks),
    total: tasks.length,
    assignees: collectTaskAssignees(tasks),
    hasUnassignedPending,
    allowBulkAssignAll: resolveAllowBulkAssignAll(tasks),
  };
}

export async function fetchInwardTasks(
  inwardNo: string,
  subcategory: string,
): Promise<ProviderInwardTask[]> {
  await delay(400);
  return structuredClone(ensureTasks(inwardNo, subcategory));
}

export async function fetchInwardTaskSummary(
  inwardNo: string,
  subcategory: string,
): Promise<ProviderInwardTaskSummary> {
  const tasks = ensureTasks(inwardNo, subcategory);
  return summarizeInwardTasks(tasks);
}

export function setInwardTaskUserOptions(users: InwardTaskUserOption[]): void {
  cachedAssignableUsers = users.map((user) => ({ ...user }));
}

export function getInwardTaskUserOptions(): InwardTaskUserOption[] {
  return cachedAssignableUsers ? [...cachedAssignableUsers] : [];
}

export async function assignInwardTasks(
  inwardNo: string,
  taskIds: string[],
  userId: string,
  priority?: InwardTaskPriority,
): Promise<ProviderInwardTask[]> {
  await delay(350);
  const tasks = taskStore.get(inwardNo);
  if (!tasks) return [];

  const user = resolveAssignableUser(userId);
  if (!user) return tasks;

  for (const task of tasks) {
    if (taskIds.includes(task.id) && task.status === "PENDING") {
      task.assignedUserId = user.id;
      task.assignedUserName = user.name;
      task.assignedUserInitials = initials(user.name);
      task.assignedUserEmail = user.email;
      task.status = "ASSIGNED";
      if (priority) {
        task.priority = priority;
      }
    }
  }

  return structuredClone(tasks);
}

export async function updateInwardTaskPriority(
  inwardNo: string,
  taskId: string,
  priority: InwardTaskPriority,
): Promise<ProviderInwardTask[]> {
  return updateInwardTaskPriorities(inwardNo, [taskId], priority);
}

export async function updateInwardTaskPriorities(
  inwardNo: string,
  taskIds: string[],
  priority: InwardTaskPriority,
): Promise<ProviderInwardTask[]> {
  await delay(200);
  const tasks = taskStore.get(inwardNo);
  if (!tasks) return [];

  for (const task of tasks) {
    if (taskIds.includes(task.id) && task.status !== "COMPLETED") {
      task.priority = priority;
    }
  }

  return structuredClone(tasks);
}

export async function updateInwardTaskDueDate(
  inwardNo: string,
  taskId: string,
  dueDate: string,
  remark?: string,
): Promise<ProviderInwardTask[]> {
  await delay(200);
  const tasks = taskStore.get(inwardNo);
  if (!tasks) return [];

  for (const task of tasks) {
    if (task.id === taskId && task.status !== "COMPLETED") {
      task.dueDate = dueDate;
      if (remark !== undefined) {
        const trimmed = remark.trim();
        if (trimmed) task.dueDateRemark = trimmed;
        else delete task.dueDateRemark;
      }
    }
  }

  return structuredClone(tasks);
}

export async function assignAllPendingInwardTasks(
  inwardNo: string,
  userId: string,
  priority?: InwardTaskPriority,
  unassignedOnly = false,
): Promise<ProviderInwardTask[]> {
  const tasks = taskStore.get(inwardNo) ?? [];
  const pendingIds = tasks
    .filter((t) => t.status === "PENDING" && (!unassignedOnly || !t.assignedUserId))
    .map((t) => t.id);
  return assignInwardTasks(inwardNo, pendingIds, userId, priority);
}

export async function removeInwardTaskAssignments(
  inwardNo: string,
  taskIds: string[],
): Promise<ProviderInwardTask[]> {
  await delay(250);
  const tasks = taskStore.get(inwardNo);
  if (!tasks) return [];

  for (const task of tasks) {
    if (
      taskIds.includes(task.id) &&
      task.status !== "COMPLETED" &&
      task.status !== "CANCELLED"
    ) {
      delete task.assignedUserId;
      delete task.assignedUserName;
      delete task.assignedUserInitials;
      delete task.assignedUserEmail;
      task.status = "PENDING";
    }
  }

  return structuredClone(tasks);
}

export async function updateInwardTaskDueDates(
  inwardNo: string,
  taskIds: string[],
  dueDate: string,
  remark?: string,
): Promise<ProviderInwardTask[]> {
  await delay(200);
  const tasks = taskStore.get(inwardNo);
  if (!tasks) return [];

  for (const task of tasks) {
    if (taskIds.includes(task.id) && task.status !== "COMPLETED") {
      task.dueDate = dueDate;
      if (remark !== undefined) {
        const trimmed = remark.trim();
        if (trimmed) task.dueDateRemark = trimmed;
        else delete task.dueDateRemark;
      }
    }
  }

  return structuredClone(tasks);
}

export async function reassignInwardTasksViaRemove(
  inwardNo: string,
  taskIds: string[],
  userId: string,
  priority?: InwardTaskPriority,
): Promise<ProviderInwardTask[]> {
  await removeInwardTaskAssignments(inwardNo, taskIds);
  return assignInwardTasks(inwardNo, taskIds, userId, priority);
}

export function getTaskAuditLog(task: ProviderInwardTask): TaskAuditLogEntry[] {
  const entries: TaskAuditLogEntry[] = [
    {
      id: `${task.id}-created`,
      action: "Task created",
      performedBy: "System",
      performedAt: "2026-07-10T09:00:00",
      remarks: `Workflow stage: ${task.workflowStage}`,
    },
  ];

  if (task.assignedUserName) {
    entries.push({
      id: `${task.id}-assigned`,
      action: "Assigned",
      performedBy: "Admin User",
      performedAt: "2026-07-12T11:30:00",
      remarks: `Assigned to ${task.assignedUserName}`,
    });
  }

  if (task.status === "IN_PROGRESS") {
    entries.push({
      id: `${task.id}-started`,
      action: "Work started",
      performedBy: task.assignedUserName ?? "Assignee",
      performedAt: "2026-07-14T15:45:00",
    });
  }

  if (task.status === "COMPLETED") {
    entries.push({
      id: `${task.id}-completed`,
      action: "Completed",
      performedBy: task.assignedUserName ?? "Assignee",
      performedAt: "2026-07-18T16:20:00",
    });
  }

  entries.push({
    id: `${task.id}-priority`,
    action: "Priority updated",
    performedBy: task.assignedUserName ?? "Admin User",
    performedAt: "2026-07-13T10:15:00",
    remarks: `Priority set to ${task.priority}`,
  });

  if (task.dueDateRemark) {
    entries.push({
      id: `${task.id}-duedate`,
      action: "Due date updated",
      performedBy: task.assignedUserName ?? "Admin User",
      performedAt: "2026-07-15T09:30:00",
      remarks: task.dueDateRemark,
    });
  }

  return entries.sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
  );
}

function findTaskById(taskId: string): ProviderInwardTask | undefined {
  for (const tasks of taskStore.values()) {
    const task = tasks.find((item) => item.id === taskId);
    if (task) return task;
  }
  return undefined;
}

function mapTaskAuditToProviderEntries(task: ProviderInwardTask): ProviderAuditLogEntry[] {
  return getTaskAuditLog(task).map((entry) => ({
    id: entry.id,
    changedAt: entry.performedAt,
    changedBy: entry.performedBy,
    section: "Task Assignment",
    certificate: task.name,
    fieldName: entry.action,
    oldValue: "—",
    newValue: entry.remarks ?? "—",
    action: entry.action.toUpperCase().replace(/\s+/g, "_"),
  }));
}

/** Used by shared ProviderAuditLogDialog — `providerId` is the task id. */
export function getTaskAuditLogByTaskId(taskId: string): ProviderAuditLogEntry[] {
  const task = findTaskById(taskId);
  if (!task) return [];
  return mapTaskAuditToProviderEntries(task);
}

export function getInwardAssignmentAuditLog(
  tasks: ProviderInwardTask[],
): Array<TaskAuditLogEntry & { taskName: string }> {
  return tasks
    .flatMap((task) =>
      getTaskAuditLog(task).map((entry) => ({
        ...entry,
        taskName: task.name,
      })),
    )
    .sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
    );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function resolveProviderName(sourceEntity: string): string {
  return sourceEntity.trim() || "—";
}
