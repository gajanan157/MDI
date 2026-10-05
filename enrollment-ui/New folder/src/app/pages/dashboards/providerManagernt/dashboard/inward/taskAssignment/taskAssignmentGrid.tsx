import type { ColDef } from "ag-grid-community";
import type { TFunction } from "i18next";
import { applyBulkIcMappingGridCellStyle } from "../../../provider-master/ic-corporate-mapping/config";
import {
  AssignedToCell,
  SelectAllHeader,
  StatusCell,
  TaskActionsCell,
  TaskDetailsCell,
  TaskDueDateCell,
  TaskIconCell,
  TaskPriorityCell,
  TaskSelectCell,
  TaskSlaCell,
  WorkflowStageCell,
} from "./taskAssignmentGridCells";
import type { ProviderInwardTaskGridRow } from "./taskAssignmentGridTypes";

export type {
  ProviderInwardTaskGridRow,
  TaskGridContext,
  TaskGridSelectionState,
} from "./taskAssignmentGridTypes";

export {
  TASK_ASSIGNMENT_ROW_HEIGHT,
  isTaskSelectable,
  toTaskGridRows,
} from "./taskAssignmentGridTypes";

const SELECT_COLUMN_CLASS = "task-select-cell";

export function createTaskAssignmentGridColumns(
  t: TFunction,
): ColDef<ProviderInwardTaskGridRow>[] {
  return applyBulkIcMappingGridCellStyle([
    {
      colId: "select",
      headerName: "",
      width: 36,
      maxWidth: 36,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      pinned: "left",
      headerClass: "ag-header-cell-center",
      headerComponent: SelectAllHeader,
      cellClass: `ag-cell-center ${SELECT_COLUMN_CLASS}`,
      cellRenderer: TaskSelectCell,
    },
    {
      colId: "taskIcon",
      headerName: "",
      width: 36,
      maxWidth: 36,
      sortable: false,
      resizable: false,
      suppressMovable: true,
      pinned: "left",
      cellClass: "ag-cell-center",
      cellRenderer: TaskIconCell,
    },
    {
      colId: "taskDetails",
      headerName: t("providerMaster.dashboard.inward.taskAssignment.colTaskDetails"),
      flex: 1.4,
      minWidth: 140,
      sortable: true,
      pinned: "left",
      cellRenderer: TaskDetailsCell,
    },
    {
      field: "workflowStage",
      headerName: t("providerMaster.dashboard.inward.taskAssignment.colWorkflowStage"),
      minWidth: 110,
      flex: 0.9,
      sortable: true,
      cellRenderer: WorkflowStageCell,
    },
    {
      field: "status",
      headerName: t("providerMaster.dashboard.inward.table.status"),
      minWidth: 96,
      flex: 0.85,
      sortable: true,
      headerClass: "ag-header-cell-center",
      cellClass: "ag-cell-center",
      cellRenderer: StatusCell,
    },
    {
      colId: "assignedTo",
      headerName: t("providerMaster.dashboard.inward.table.assignedTo"),
      minWidth: 160,
      flex: 1.1,
      sortable: true,
      headerClass: "ag-header-cell-center",
      cellClass: "ag-cell-center",
      cellRenderer: AssignedToCell,
    },
    {
      field: "priority",
      headerName: t("providerMaster.dashboard.inward.taskAssignment.colPriority"),
      minWidth: 96,
      width: 96,
      flex: 0,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: "ag-header-cell-center",
      cellClass: "ag-cell-center task-priority-cell",
      cellRenderer: TaskPriorityCell,
    },
    {
      field: "dueDate",
      headerName: t("providerMaster.dashboard.inward.taskAssignment.colDueDate"),
      minWidth: 118,
      width: 118,
      flex: 0,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: "ag-header-cell-center",
      cellClass: "ag-cell-center task-due-date-cell",
      cellRenderer: TaskDueDateCell,
    },
    {
      colId: "sla",
      headerName: t("providerMaster.dashboard.inward.taskAssignment.colSla"),
      minWidth: 88,
      flex: 0.7,
      sortable: false,
      headerClass: "ag-header-cell-center",
      cellClass: "ag-cell-center",
      cellRenderer: TaskSlaCell,
    },
    {
      colId: "actions",
      headerName: t("providerMaster.dashboard.inward.taskAssignment.colActions"),
      width: 72,
      minWidth: 72,
      maxWidth: 72,
      flex: 0,
      sortable: false,
      suppressHeaderMenuButton: true,
      suppressSizeToFit: true,
      pinned: "right",
      lockPinned: true,
      headerClass: "ag-header-cell-center task-actions-header",
      cellClass: "ag-cell-center task-actions-cell",
      cellRenderer: TaskActionsCell,
    },
  ]);
}
