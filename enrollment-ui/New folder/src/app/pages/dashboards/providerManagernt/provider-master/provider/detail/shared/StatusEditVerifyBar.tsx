import clsx from "clsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui";
import { Button } from "../../../../shared/providerShell";
import {
  PencilSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ProviderAuditLogButton } from "./ProviderAuditLogButton";
import type { ProviderAuditLogContext } from "./providerAuditLog";
import {
  PROVIDER_ACTION_BUTTON_CLASS,
  PROVIDER_COMPACT_ACTION_BUTTON_CLASS,
} from "../../../../shared/providerButtonStyles";

type StatusEditModeActionButtonsProps = {
  onCancel: () => void;
  onSave: () => void;
  saveDisabled: boolean;
  saving: boolean;
  saveDisabledTitle?: string;
  cancelLabel: string;
  saveLabel: string;
  savingLabel: string;
};

function StatusEditModeActionButtons({
  onCancel,
  onSave,
  saveDisabled,
  saving,
  saveDisabledTitle,
  cancelLabel,
  saveLabel,
  savingLabel,
}: Readonly<StatusEditModeActionButtonsProps>) {
  const saveTitle = saveDisabled && !saving ? saveDisabledTitle : undefined;

  return (
    <div className="flex flex-nowrap gap-1.5">
      <Button
        type="button"
        variant="outlined"
        className={PROVIDER_COMPACT_ACTION_BUTTON_CLASS}
        onClick={onCancel}
        disabled={saving}
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        color="primary"
        className={clsx(
          PROVIDER_COMPACT_ACTION_BUTTON_CLASS,
          "inline-flex items-center justify-center gap-1",
          saving && "w-auto min-w-20",
        )}
        onClick={onSave}
        disabled={saveDisabled || saving}
        title={saveTitle}
      >
        {saving ? (
          <Spinner
            color="neutral"
            className="size-3.5 border-2 border-white"
            aria-hidden
          />
        ) : null}
        {saving ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}

type StatusViewModeActionButtonsProps = {
  auditLog?: ProviderAuditLogContext;
  hideEdit: boolean;
  showCancelInViewMode: boolean;
  canWrite: boolean;
  onEdit: () => void;
  onCancel: () => void;
  editDisabled: boolean;
  editDisabledTitle?: string;
  canVerify: boolean;
  onVerify: () => void;
  verifyDisabled: boolean;
  verifyDisabledTitle?: string;
  cancelLabel: string;
  editLabel: string;
  verifyLabel: string;
};

function StatusViewModeActionButtons({
  auditLog,
  hideEdit,
  showCancelInViewMode,
  canWrite,
  onEdit,
  onCancel,
  editDisabled,
  editDisabledTitle,
  canVerify,
  onVerify,
  verifyDisabled,
  verifyDisabledTitle,
  cancelLabel,
  editLabel,
  verifyLabel,
}: Readonly<StatusViewModeActionButtonsProps>) {
  const showEdit = !hideEdit && canWrite;

  return (
    <div className="flex flex-nowrap gap-1.5">
      {auditLog ? (
        <ProviderAuditLogButton providerId={auditLog.providerId} tabId={auditLog.tabId} />
      ) : null}
      {showEdit ? (
        <Button
          type="button"
          variant="outlined"
          className={PROVIDER_ACTION_BUTTON_CLASS}
          onClick={onEdit}
          disabled={editDisabled}
          title={editDisabled ? editDisabledTitle : undefined}
        >
          <PencilSquareIcon className="h-3 w-3" />
          {editLabel}
        </Button>
      ) : null}
      {showCancelInViewMode ? (
        <Button
          type="button"
          variant="outlined"
          className={PROVIDER_ACTION_BUTTON_CLASS}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      ) : null}
      {canVerify ? (
        <Button
          type="button"
          color="primary"
          className={PROVIDER_ACTION_BUTTON_CLASS}
          onClick={onVerify}
          disabled={verifyDisabled}
          title={verifyDisabled ? verifyDisabledTitle : undefined}
        >
          <CheckCircleIcon className="h-3 w-3" />
          {verifyLabel}
        </Button>
      ) : null}
    </div>
  );
}

type StatusEditVerifyActionButtonsProps = StatusEditModeActionButtonsProps &
  StatusViewModeActionButtonsProps & {
    isEditMode: boolean;
  };

function StatusEditVerifyActionButtons({
  isEditMode,
  ...actionProps
}: Readonly<StatusEditVerifyActionButtonsProps>) {
  if (isEditMode) {
    return <StatusEditModeActionButtons {...actionProps} />;
  }
  return <StatusViewModeActionButtons {...actionProps} />;
}

export interface StatusEditVerifyBarProps {
  /**
   * Kept for call-site compatibility. IC network View modal was removed.
   */
  providerStatus?: string;
  /**
   * Kept for call-site compatibility. IC network View modal was removed.
   */
  blacklistedByIcs?: string[];
  canWrite: boolean;
  /** Optional dedicated permission for Verify action; defaults to `canWrite`. */
  canVerify?: boolean;
  isEditMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onVerify?: () => void;
  /** When true, Save is disabled while already in edit mode. */
  saveDisabled?: boolean;
  /** When true, Save shows a spinner and cannot be clicked again. */
  saving?: boolean;
  saveDisabledTitle?: string;
  /** When true, Edit button is disabled (e.g. when IC must be selected first) */
  editDisabled?: boolean;
  /** Tooltip when Edit is disabled */
  editDisabledTitle?: string;
  /** When true, hide the Edit button (e.g. agreement list tab). Verify / Save / Cancel unchanged. */
  hideEdit?: boolean;
  /** When true, show Cancel next to Edit while not in edit mode (e.g. agreement view → list). */
  showCancelInViewMode?: boolean;
  /** When true, Verify is disabled (e.g. network GET `/details` failed). */
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  /** Shown on the left before Verify/Edit (e.g. Search + New Agreement on agreement list). */
  extraActions?: ReactNode;
  /** Right-aligned slot (e.g. SOC/Discount or IC/Corporate sub-tab toggle). */
  trailingContent?: ReactNode;
  /** Center slot between action buttons and right content (e.g. infra summary stats). */
  middleContent?: ReactNode;
  /** When set, shows Audit Log for the active provider tab. */
  auditLog?: ProviderAuditLogContext;
}

export function StatusEditVerifyBar({
  canWrite,
  canVerify = canWrite,
  isEditMode,
  onEdit,
  onCancel,
  onSave,
  onVerify = () => {},
  saveDisabled = false,
  saving = false,
  saveDisabledTitle,
  editDisabled = false,
  editDisabledTitle,
  hideEdit = false,
  showCancelInViewMode = false,
  verifyDisabled = false,
  verifyDisabledTitle,
  extraActions,
  trailingContent,
  middleContent,
  auditLog,
}: Readonly<StatusEditVerifyBarProps>) {
  const { t } = useTranslation();

  const actionButtons = (
    <StatusEditVerifyActionButtons
      isEditMode={isEditMode}
      onCancel={onCancel}
      onSave={onSave}
      saveDisabled={saveDisabled}
      saving={saving}
      saveDisabledTitle={saveDisabledTitle}
      auditLog={auditLog}
      hideEdit={hideEdit}
      showCancelInViewMode={showCancelInViewMode}
      canWrite={canWrite}
      onEdit={onEdit}
      editDisabled={editDisabled}
      editDisabledTitle={editDisabledTitle}
      canVerify={canVerify}
      onVerify={onVerify}
      verifyDisabled={verifyDisabled}
      verifyDisabledTitle={verifyDisabledTitle}
      cancelLabel={t("providerMaster.button.cancel")}
      saveLabel={t("providerMaster.button.save")}
      savingLabel={t("providerMaster.button.saving")}
      editLabel={t("providerMaster.common.edit")}
      verifyLabel={t("providerMaster.toolbar.verify")}
    />
  );

  const actionsBlock = (
    <div className="flex flex-nowrap items-center gap-1">
      {extraActions}
      {actionButtons}
    </div>
  );

  let toolbarBody: ReactNode;
  if (middleContent) {
    toolbarBody = (
      <div className="grid grid-cols-1 items-center gap-1 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-0">
        <div className="flex shrink-0 items-center lg:border-r lg:border-slate-200 lg:pr-2">
          {actionsBlock}
        </div>
        <div className="min-w-0 overflow-x-auto lg:border-r lg:border-slate-200 lg:px-2">
          {middleContent}
        </div>
        {trailingContent ? (
          <div className="flex shrink-0 items-center lg:pl-2">{trailingContent}</div>
        ) : null}
      </div>
    );
  } else if (trailingContent) {
    toolbarBody = (
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">{actionsBlock}</div>
        <div className="flex shrink-0 items-center sm:ml-auto">{trailingContent}</div>
      </div>
    );
  } else {
    toolbarBody = <div className="flex flex-wrap items-center gap-1">{actionsBlock}</div>;
  }

  return (
    <div
      className={clsx(
        "rounded-lg border border-slate-200 bg-white",
        middleContent ? "px-2 py-1" : "px-2.5 py-1.5",
      )}
    >
      {toolbarBody}
    </div>
  );
}
