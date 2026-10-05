import { Page, PageContent } from "../../../shared/providerShell";
import { Tabs } from "@/components/shared/Tabs";
import { useViewHospitalPage } from "./hooks/useViewHospitalPage";
import { useViewHospitalTabs } from "./hooks/useViewHospitalTabs";

export default function ViewHospitalPage() {
  const page = useViewHospitalPage();
  const tabs = useViewHospitalTabs(page);

  return (
    <Page title={page.pageTitle}>
      <PageContent noPadding className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-0.5 py-1 sm:px-2">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Tabs
              tabs={tabs}
              fitTabsInOneRow
              activeTabId={page.tabNav.activeTabId}
              onTabChange={page.tabNav.handleTabChange}
            />
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
