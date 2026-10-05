import type { ProviderInwardRow } from "../providerInwardTypes";

export type InwardTaskStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type InwardTaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type InwardTaskAssignee = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
};

export type ProviderInwardTask = {
  id: string;
  inwardNo: string;
  name: string;
  workflowStage: string;
  priority: InwardTaskPriority;
  status: InwardTaskStatus;
  subcategory: string;
  assignedUserId?: string;
  assignedUserName?: string;
  assignedUserInitials?: string;
  assignedUserEmail?: string;
  dueDate: string;
  dueDateRemark?: string;
};

export type ProviderInwardTaskSummary = {
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  rejected: number;
  blocked: number;
  cancelled: number;
  overdue: number;
  total: number;
  assignees: InwardTaskAssignee[];
  hasUnassignedPending: boolean;
  allowBulkAssignAll: boolean;
};

export type TaskAssignmentPanelAction =
  | "assign"
  | "reassign"
  | "remove"
  | "timeline";

export type AssignmentPanelMode = "assign" | "reassign";

export type TaskAssignmentDrawerContext = {
  row: ProviderInwardRow;
  providerName: string;
};

export type InwardTaskUserOption = {
  id: string;
  name: string;
  email: string;
};

export type InwardTaskFilterStatus = "ALL" | InwardTaskStatus;
