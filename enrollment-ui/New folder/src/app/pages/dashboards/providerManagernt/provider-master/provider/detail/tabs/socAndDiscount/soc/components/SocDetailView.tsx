import { StatusEditVerifyBar } from "../../../../shared/StatusEditVerifyBar";
import type { SocDetailRecord } from "../data/socListData";
import type { SocStatusBarConfig } from "../utils/socHelpers";
import { SocDetailContent, type SocDetailPanelProps } from "./SocDetailContent";

type SocDetailViewProps = {
  providerBarSection: React.ReactNode;
  statusBarConfig: SocStatusBarConfig;
  socDetail: SocDetailRecord;
  isSocViewMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveDisabledTitle?: string;
  panelProps: Omit<SocDetailPanelProps, "socDetail">;
};

export function SocDetailView({
  providerBarSection,
  statusBarConfig,
  socDetail,
  isSocViewMode,
  onEdit,
  onCancel,
  onSave,
  saveDisabled = false,
  saveDisabledTitle,
  panelProps,
}: Readonly<SocDetailViewProps>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-1">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={statusBarConfig.providerStatus}
        blacklistedByIcs={statusBarConfig.blacklistedByIcs}
        canWrite={statusBarConfig.canWrite}
        canVerify={statusBarConfig.canVerify}
        isEditMode={!isSocViewMode}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        saveDisabled={saveDisabled}
        saveDisabledTitle={saveDisabledTitle}
        verifyDisabled={statusBarConfig.verifyDisabled}
        verifyDisabledTitle={statusBarConfig.verifyDisabledTitle}
        auditLog={statusBarConfig.auditLog}
        extraActions={undefined}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <SocDetailContent socDetail={socDetail} {...panelProps} />
      </div>
    </div>
  );
}
