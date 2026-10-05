import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDisclosure } from "@/hooks";
import {
  AgreementEmbeddedList,
  AgreementListSearchAndNewButtons,
} from "../AgreementListPage";
import { StatusEditVerifyBar } from "../../../shared/StatusEditVerifyBar";
import type { AgreementStatusBarConfig } from "../utils/providerAgreementHelpers";

type AgreementListViewProps = {
  providerId?: string;
  providerBarSection: React.ReactNode;
  statusBarConfig: AgreementStatusBarConfig;
  isAgreementViewMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onNewAgreement: () => void;
  onViewAgreement: (agreementId: string) => void;
  onEditAgreement: (agreementId: string) => void;
};

export function AgreementListView({
  providerId,
  providerBarSection,
  statusBarConfig,
  isAgreementViewMode,
  onEdit,
  onCancel,
  onSave,
  onNewAgreement,
  onViewAgreement,
  onEditAgreement,
}: Readonly<AgreementListViewProps>) {
  const { t } = useTranslation();
  const [listIsEmpty, setListIsEmpty] = useState(true);
  const [agreementListSearchOpen, agreementListSearch] = useDisclosure(false);

  useEffect(() => {
    if (listIsEmpty && agreementListSearchOpen) {
      agreementListSearch.close();
    }
  }, [agreementListSearchOpen, agreementListSearch, listIsEmpty]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 p-1">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={statusBarConfig.providerStatus}
        blacklistedByIcs={statusBarConfig.blacklistedByIcs}
        canWrite={statusBarConfig.canWrite}
        canVerify={statusBarConfig.canVerify}
        isEditMode={!isAgreementViewMode}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        editDisabled={false}
        hideEdit
        verifyDisabled={statusBarConfig.verifyDisabled}
        verifyDisabledTitle={statusBarConfig.verifyDisabledTitle}
        auditLog={statusBarConfig.auditLog}
        extraActions={
          <AgreementListSearchAndNewButtons
            isSearchOpen={agreementListSearchOpen}
            onToggleSearch={agreementListSearch.toggle}
            onNewAgreement={onNewAgreement}
            showSearch={!listIsEmpty}
          />
        }
      />
      <AgreementEmbeddedList
        providerId={providerId}
        showHeader={false}
        fillAvailableHeight
        suppressToolbar
        searchOpen={agreementListSearchOpen}
        onSearchToggle={agreementListSearch.toggle}
        hideRowEdit
        emptyStateTitle={t("providerMaster.agreement.detailsNotFound")}
        emptyStateDescription=""
        onEmptyStateChange={setListIsEmpty}
        onViewAgreement={onViewAgreement}
        onEditAgreement={onEditAgreement}
        onNewAgreement={onNewAgreement}
      />
    </div>
  );
}
