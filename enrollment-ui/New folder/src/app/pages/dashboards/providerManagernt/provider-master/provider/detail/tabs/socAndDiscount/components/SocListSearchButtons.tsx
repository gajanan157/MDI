import { useTranslation } from "react-i18next";
import { usePermission } from "@/app/auth/usePermission";
import {
  Button,
  CheckListButton,
  PROVIDER_ACTION_BUTTON_CLASS,
  PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS,
} from "@/app/pages/dashboards/providerManagernt/shared/providerShell";

export function SocListSearchButtons({
  isSearchOpen,
  onToggleSearch,
  onAddSoc,
  addLabelKey = "providerMaster.soc.toolbar.addSoc",
  hideAdd = false,
}: Readonly<{
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  onAddSoc: () => void;
  addLabelKey?: string;
  hideAdd?: boolean;
}>) {
  const { t } = useTranslation();
  const { canWrite } = usePermission("provider-list");

  return (
    <>
      <CheckListButton
        onClick={onToggleSearch}
        label={
          isSearchOpen
            ? t("providerMaster.button.hideSearch")
            : t("providerMaster.button.search")
        }
        bgColor="bg-blue-600"
        textColor="text-white"
        size="text-xs"
        className={PROVIDER_TOOLBAR_SEARCH_BUTTON_CLASS}
        isSearch
      />
      {!hideAdd && canWrite ? (
        <Button
          type="button"
          color="primary"
          variant="filled"
          className={PROVIDER_ACTION_BUTTON_CLASS}
          onClick={onAddSoc}
        >
          {t(addLabelKey)}
        </Button>
      ) : null}
    </>
  );
}
