import { useDisclosure } from "@/hooks";
import { StatusEditVerifyBar } from "../../../../shared/StatusEditVerifyBar";
import type { SocStatusBarConfig } from "../../soc/utils/socHelpers";
import { SocListSearchButtons } from "../../components/SocListSearchButtons";
import { DiscountEmbeddedList } from "./DiscountEmbeddedList";

type DiscountListViewProps = {
  providerBarSection: React.ReactNode;
  statusBarConfig: SocStatusBarConfig;
  providerId?: string;
  onViewDiscount: (id: string) => void;
  onAddDiscount: () => void;
};

export function DiscountListView({
  providerBarSection,
  statusBarConfig,
  providerId,
  onViewDiscount,
  onAddDiscount,
}: Readonly<DiscountListViewProps>) {
  const [searchOpen, search] = useDisclosure(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0.5 p-1">
      {providerBarSection}
      <StatusEditVerifyBar
        providerStatus={statusBarConfig.providerStatus}
        blacklistedByIcs={statusBarConfig.blacklistedByIcs}
        canWrite={statusBarConfig.canWrite}
        canVerify={statusBarConfig.canVerify}
        isEditMode={false}
        onEdit={() => undefined}
        onCancel={() => undefined}
        onSave={() => undefined}
        hideEdit
        verifyDisabled={statusBarConfig.verifyDisabled}
        verifyDisabledTitle={statusBarConfig.verifyDisabledTitle}
        auditLog={statusBarConfig.auditLog}
        extraActions={
          <SocListSearchButtons
            isSearchOpen={searchOpen}
            onToggleSearch={search.toggle}
            onAddSoc={onAddDiscount}
            addLabelKey="providerMaster.soc.toolbar.addDiscount"
          />
        }
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <DiscountEmbeddedList
          providerId={providerId}
          onViewDiscount={onViewDiscount}
          fillAvailableHeight
          searchOpen={searchOpen}
          onSearchToggle={search.toggle}
        />
      </div>
    </div>
  );
}
