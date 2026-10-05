import { usePermission } from "@/app/auth/usePermission";
import { useTranslation } from "react-i18next";
import {
  Button,
  PROVIDER_ACTION_BUTTON_CLASS,
} from "../../../../../../shared/providerShell";

export function AgreementListToolbar({
  onNewAgreement,
}: Readonly<{
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  onNewAgreement: () => void;
  showSearch?: boolean;
}>) {
  const { canWrite } = usePermission("provider-list");
  const { t } = useTranslation();

  return (
    <>
      {canWrite ? (
        <Button
          type="button"
          color="primary"
          variant="filled"
          className={PROVIDER_ACTION_BUTTON_CLASS}
          onClick={onNewAgreement}
        >
          {t("providerMaster.agreement.newAgreement")}
        </Button>
      ) : null}
    </>
  );
}
