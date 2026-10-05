import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AuditLogDialog } from "../../../shared/AuditLogDialog";
import { Button, PROVIDER_DRAWER_DIALOG_Z_INDEX_CLASS } from "../../../shared/providerShell";
import { formatToDDMMMYYYY } from "../../../shared/dateFormat";
import { getInwardAssignmentAuditLog, getTaskAuditLog } from "./providerInwardTaskMockData";
import type { ProviderInwardTask } from "./providerInwardTaskTypes";

type TaskAuditLogDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Single-task audit when set. */
  task?: ProviderInwardTask | null;
  /** All tasks audit for inward-level view. */
  tasks?: ProviderInwardTask[];
  inwardNo?: string;
};

export function TaskAuditLogDialog({
  open,
  onClose,
  task = null,
  tasks = [],
  inwardNo,
}: Readonly<TaskAuditLogDialogProps>) {
  const { t } = useTranslation();
  const isInwardView = !task && tasks.length > 0;

  const rows = useMemo(() => {
    if (task) {
      return getTaskAuditLog(task).map((entry) => ({
        ...entry,
        taskName: task.name,
        performedAtDisplay: formatToDDMMMYYYY(entry.performedAt.slice(0, 10)),
      }));
    }
    if (isInwardView) {
      return getInwardAssignmentAuditLog(tasks).map((entry) => ({
        ...entry,
        performedAtDisplay: formatToDDMMMYYYY(entry.performedAt.slice(0, 10)),
      }));
    }
    return [];
  }, [isInwardView, task, tasks]);

  const columnDefs = useMemo(
    () => [
      {
        field: "performedAtDisplay",
        headerName: t("providerMaster.dashboard.inward.taskAssignment.auditColDate"),
        flex: 0.7,
        minWidth: 100,
        sortable: false,
      },
      ...(isInwardView || task
        ? [
            {
              field: "taskName",
              headerName: t("providerMaster.dashboard.inward.taskAssignment.colTaskDetails"),
              flex: 1,
              minWidth: 140,
              sortable: false,
            },
          ]
        : []),
      {
        field: "action",
        headerName: t("providerMaster.dashboard.inward.taskAssignment.auditColAction"),
        flex: 0.9,
        minWidth: 110,
        sortable: false,
      },
      {
        field: "performedBy",
        headerName: t("providerMaster.dashboard.inward.taskAssignment.auditColUser"),
        flex: 0.9,
        minWidth: 110,
        sortable: false,
      },
      {
        field: "remarks",
        headerName: t("providerMaster.dashboard.inward.taskAssignment.auditColRemarks"),
        flex: 1.1,
        minWidth: 140,
        sortable: false,
      },
    ],
    [isInwardView, t, task],
  );

  const title = task
    ? t("providerMaster.dashboard.inward.taskAssignment.auditLogTitle", { task: task.name })
    : t("providerMaster.dashboard.inward.taskAssignment.inwardAuditLogTitle", {
        inwardNo: inwardNo ?? "—",
      });

  if (!open) return null;

  return (
    <AuditLogDialog
      open={open}
      onClose={onClose}
      overlayZIndexClassName={PROVIDER_DRAWER_DIALOG_Z_INDEX_CLASS}
      title={title}
      titleId="task-audit-log-dialog-title"
      columnDefs={columnDefs}
      rows={rows}
      pagination={false}
      gridHeight={Math.min(360, Math.max(160, rows.length * 36 + 48))}
      widthClassName="w-full max-w-4xl sm:w-[92%]"
      contentClassName="min-h-[240px] pb-1"
      gridWrapperClassName=""
      hideFooter={false}
      footer={
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" onClick={onClose}>
              {t("providerMaster.button.cancel")}
            </Button>
          </div>
        </div>
      }
    />
  );
}
