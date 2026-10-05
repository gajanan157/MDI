export type DueDateTone = "overdue" | "soon" | "normal";

export type SlaTone = "onTime" | "dueSoon" | "overdue";

export type SlaIndicator = {
  tone: SlaTone;
  label: string;
  tooltip: string;
};

export function getDueDateDiffDays(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function getDueDateRelativeLabel(dueDate: string): { label: string; tone: DueDateTone } {
  const diffDays = getDueDateDiffDays(dueDate);

  if (diffDays < 0) return { label: "(Overdue)", tone: "overdue" };
  if (diffDays === 0) return { label: "(Today)", tone: "soon" };
  if (diffDays === 1) return { label: "(1 day left)", tone: "soon" };
  return { label: `(${diffDays} days left)`, tone: "normal" };
}

export function getTaskSlaIndicator(dueDate: string, status: string): SlaIndicator {
  if (status === "COMPLETED" || status === "CANCELLED") {
    return {
      tone: "onTime",
      label: "Met",
      tooltip: "SLA met — task completed",
    };
  }

  const relative = getDueDateRelativeLabel(dueDate);

  if (relative.tone === "overdue") {
    const days = Math.abs(getDueDateDiffDays(dueDate));
    return {
      tone: "overdue",
      label: days === 0 ? "Overdue" : `${days}d overdue`,
      tooltip: `SLA breached — ${days === 0 ? "due date passed" : `${days} day(s) overdue`}`,
    };
  }

  if (relative.tone === "soon") {
    return {
      tone: "dueSoon",
      label: relative.label.replace(/[()]/g, ""),
      tooltip: "SLA at risk — due soon",
    };
  }

  return {
    tone: "onTime",
    label: relative.label.replace(/[()]/g, ""),
    tooltip: "SLA on track",
  };
}

export function countOverdueTasks(
  tasks: { dueDate: string; status: string }[],
): number {
  return tasks.filter(
    (task) =>
      task.status !== "COMPLETED" &&
      task.status !== "CANCELLED" &&
      getDueDateRelativeLabel(task.dueDate).tone === "overdue",
  ).length;
}
