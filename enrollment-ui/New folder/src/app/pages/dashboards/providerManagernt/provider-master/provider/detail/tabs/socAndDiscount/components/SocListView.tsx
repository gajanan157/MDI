import { useDisclosure } from "@/hooks";
import { StatusEditVerifyBar } from "../../../shared/StatusEditVerifyBar";
import type { SocStatusBarConfig } from "../soc/utils/socHelpers";
import { SocEmbeddedList } from "../soc";
import { SocListSearchButtons } from "./SocListSearchButtons";

type SocListViewProps = {
  providerBarSection: React.ReactNode;
  statusBarConfig: SocStatusBarConfig;
  providerId?: string;
  onViewSoc: (socId: string) => void;
  onAddSoc: () => void;
};

export function SocListView({
  providerBarSection,
  statusBarConfig,
  providerId,
  onViewSoc,
  onAddSoc,
}: Readonly<SocListViewProps>) {
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
            onAddSoc={onAddSoc}
          />
        }
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <SocEmbeddedList
          providerId={providerId}
          onViewSoc={onViewSoc}
          fillAvailableHeight
          searchOpen={searchOpen}
          onSearchToggle={search.toggle}
        />
      </div>
    </div>
  );
}
