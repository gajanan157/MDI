import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AuditLogDialog } from "../../../../shared/AuditLogDialog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchProviderAuditLog } from "@/store/features/providerDetail/providerDetailSlice";
import {
  formatProviderAuditDateTime,
  PROVIDER_AUDIT_LOG_SECTION_LABELS,
  type ProviderAuditLogEntry,
  type ProviderAuditLogTabId,
} from "./providerAuditLog";

type ProviderAuditLogDialogProps = {
  open: boolean;
  onClose: () => void;
  providerId: string;
  tabId: ProviderAuditLogTabId;
};

type AuditLogGridRow = ProviderAuditLogEntry & {
  changedAtDisplay: string;
};

export function ProviderAuditLogDialog({
  open,
  onClose,
  providerId,
  tabId,
}: Readonly<ProviderAuditLogDialogProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auditLogState = useAppSelector((state) => state.providerDetail.auditLog);

  const isCurrentRequest =
    auditLogState.providerId === providerId && auditLogState.tabId === tabId;
  const loading = isCurrentRequest && auditLogState.loading;
  const error = isCurrentRequest ? auditLogState.error : null;

  const sectionLabel = PROVIDER_AUDIT_LOG_SECTION_LABELS[tabId];

  useEffect(() => {
    if (!open || !providerId) return;
    dispatch(fetchProviderAuditLog({ providerId, tabId }));
  }, [open, providerId, tabId, dispatch]);

  const rows = useMemo<AuditLogGridRow[]>(() => {
    if (!isCurrentRequest) return [];
    return auditLogState.rows.map((entry) => ({
      ...entry,
      changedAtDisplay: formatProviderAuditDateTime(entry.changedAt),
    }));
  }, [auditLogState.rows, isCurrentRequest]);

  const columnDefs = useMemo(
    () => [
      {
        field: "section",
        headerName: t("providerMaster.toolbar.auditColumns.section"),
        flex: 1,
        minWidth: 140,
        sortable: false,
      },
      {
        field: "certificate",
        headerName: t("providerMaster.toolbar.auditColumns.certificate"),
        flex: 1,
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
      title={t("providerMaster.toolbar.auditLogDialogTitle", { section: sectionLabel })}
      titleId="provider-audit-log-dialog-title"
      columnDefs={columnDefs}
      rows={rows}
      loading={loading}
      loadingMessage={t("providerMaster.toolbar.loadingAuditLog")}
      error={error}
    />
  );
}
