import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AuditLogDialog } from "../../shared/AuditLogDialog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchProviderMasterActivityLog } from "@/store/features/providerMasters/providerMastersSlice";
import type { ProviderMasterKey } from "../utils/masterConfig";
import { formatProviderAuditDateTime } from "../../provider-master/provider/detail/shared/providerAuditLog";
import type { ProviderMasterActivityLogEntry } from "../utils/providerMasterActivityLogTypes";

type ProviderMasterActivityLogDialogProps = {
  open: boolean;
  onClose: () => void;
  masterKey: ProviderMasterKey;
  masterTitle: string;
};

type ActivityLogGridRow = ProviderMasterActivityLogEntry & {
  changedAtDisplay: string;
};

export function ProviderMasterActivityLogDialog({
  open,
  onClose,
  masterKey,
  masterTitle,
}: Readonly<ProviderMasterActivityLogDialogProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activityLogState = useAppSelector((state) => state.providerMasters.activityLog);

  const isCurrentRequest = activityLogState.masterKey === masterKey;
  const loading = isCurrentRequest && activityLogState.loading;
  const error = isCurrentRequest ? activityLogState.error : null;

  useEffect(() => {
    if (!open) return;
    dispatch(fetchProviderMasterActivityLog(masterKey));
  }, [open, masterKey, dispatch]);

  const rows = useMemo<ActivityLogGridRow[]>(() => {
    if (!isCurrentRequest) return [];
    return activityLogState.rows.map((entry) => ({
      ...entry,
      changedAtDisplay: formatProviderAuditDateTime(entry.changedAt),
    }));
  }, [activityLogState.rows, isCurrentRequest]);

  const columnDefs = useMemo(
    () => [
      {
        field: "recordCode",
        headerName: t("providerMaster.toolbar.auditColumns.recordCode"),
        flex: 1,
        minWidth: 140,
        sortable: false,
      },
      {
        field: "recordName",
        headerName: t("providerMaster.toolbar.auditColumns.recordName"),
        flex: 1.2,
        minWidth: 180,
        sortable: false,
      },
      {
        field: "fieldName",
        headerName: t("providerMaster.toolbar.auditColumns.fieldName"),
        flex: 1,
        minWidth: 130,
        sortable: false,
      },
      {
        field: "oldValue",
        headerName: t("providerMaster.toolbar.auditColumns.oldValue"),
        flex: 1,
        minWidth: 120,
        sortable: false,
      },
      {
        field: "newValue",
        headerName: t("providerMaster.toolbar.auditColumns.newValue"),
        flex: 1,
        minWidth: 120,
        sortable: false,
      },
      {
        field: "action",
        headerName: t("providerMaster.toolbar.auditColumns.action"),
        flex: 0.7,
        minWidth: 90,
        sortable: false,
      },
      {
        field: "changedBy",
        headerName: t("providerMaster.toolbar.auditColumns.changedBy"),
        flex: 1,
        minWidth: 120,
        sortable: false,
      },
      {
        field: "changedAtDisplay",
        headerName: t("providerMaster.toolbar.auditColumns.dateTime"),
        flex: 1,
        minWidth: 150,
        sortable: false,
      },
    ],
    [t],
  );

  return (
    <AuditLogDialog
      open={open}
      onClose={onClose}
      title={`${t("providerMaster.mastersPage.auditLog")} — ${masterTitle}`}
      titleId="provider-master-activity-log-dialog-title"
      columnDefs={columnDefs}
      rows={rows}
      loading={loading}
      loadingMessage={t("providerMaster.toolbar.loadingAuditLog")}
      error={error}
    />
  );
}
