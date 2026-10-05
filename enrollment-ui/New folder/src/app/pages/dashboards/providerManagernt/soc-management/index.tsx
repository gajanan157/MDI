import { useEffect } from "react";
import { Page } from "../shared/providerShell";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { useBreadcrumbContext } from "@/app/contexts/breadcrumb/context";

export default function SocManagementPage() {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { title: "Provider Management" },
      { title: "Provider Master" },
      { title: "SOC Management" },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  return (
    <Page title="SOC Management">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="SOC Management"
          badge={{ text: "Schedule of Charges", variant: "info" }}
        />
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-dark-100">
            Schedule of Charges
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-dark-400">
            Use the provider detail SOC tab for version history, tariff mapping, and document uploads.
          </p>
        </div>
      </div>
    </Page>
  );
}
