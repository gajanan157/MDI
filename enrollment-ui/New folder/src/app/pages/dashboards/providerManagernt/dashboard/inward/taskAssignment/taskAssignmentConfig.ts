import type { InwardTaskPriority, InwardTaskStatus } from "./providerInwardTaskTypes";

export const TASK_STATUS_STYLES: Record<
  InwardTaskStatus,
  { badge: string; dot: string; label: string; tooltip: string }
> = {
  PENDING: {
    badge: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-500",
    label: "Pending",
    tooltip: "Awaiting assignment or action",
  },
  ASSIGNED: {
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    label: "Assigned",
    tooltip: "Assigned to a team member",
  },
  IN_PROGRESS: {
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    label: "In Progress",
    tooltip: "Work is actively in progress",
  },
  BLOCKED: {
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
    label: "Blocked",
    tooltip: "Blocked by a dependency or issue",
  },
  COMPLETED: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    label: "Completed",
    tooltip: "Task completed successfully",
  },
  CANCELLED: {
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    label: "Cancelled",
    tooltip: "Task was cancelled",
  },
  REJECTED: {
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    label: "Rejected",
    tooltip: "Task was rejected",
  },
};

export const TASK_PRIORITY_STYLES: Record<
  InwardTaskPriority,
  { badge: string; label: string; icon: string }
> = {
  LOW: { badge: "bg-emerald-100 text-emerald-700", label: "Low", icon: "↓" },
  MEDIUM: { badge: "bg-blue-100 text-blue-700", label: "Medium", icon: "→" },
  HIGH: { badge: "bg-yellow-100 text-yellow-700", label: "High", icon: "↑" },
};

/** Rectangular pill styling (matches provider list Network / Type badges). */
export const TASK_ASSIGNMENT_PILL_CLASS =
  "inline-flex items-center gap-1 rounded px-2 py-1 text-tiny-plus font-medium leading-none";

export const TASK_PRIORITY_ORDER: Record<InwardTaskPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export const TASK_PRIORITY_OPTIONS: InwardTaskPriority[] = (
  Object.keys(TASK_PRIORITY_ORDER) as InwardTaskPriority[]
).sort((a, b) => TASK_PRIORITY_ORDER[a] - TASK_PRIORITY_ORDER[b]);

export const SLA_TONE_STYLES = {
  onTime: "bg-emerald-100 text-emerald-700",
  dueSoon: "bg-yellow-100 text-yellow-700",
  overdue: "bg-rose-100 text-rose-700",
} as const;

export function getTaskIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("document") || lower.includes("verification") || lower.includes("tariff")) {
    return { className: "bg-blue-100 text-blue-600", glyph: "DOC" };
  }
  if (lower.includes("mapping") || lower.includes("code") || lower.includes("quality")) {
    return { className: "bg-violet-100 text-violet-600", glyph: "QC" };
  }
  if (lower.includes("bank") || lower.includes("network") || lower.includes("agreement")) {
    return { className: "bg-emerald-100 text-emerald-600", glyph: "NET" };
  }
  if (lower.includes("rohini") || lower.includes("registration")) {
    return { className: "bg-sky-100 text-sky-600", glyph: "REG" };
  }
  return { className: "bg-slate-100 text-slate-600", glyph: "TSK" };
}

export const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
] as const;

export function resolveWorkflowName(subcategory: string): string {
  return `${subcategory} Workflow`;
}

/** Bulk toolbar sentinel — assign selected tasks back to unassigned. */
export const BULK_UNASSIGN_USER_ID = "__UNASSIGN__";
