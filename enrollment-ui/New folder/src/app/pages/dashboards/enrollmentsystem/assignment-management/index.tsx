import { Page } from "@/components/shared/Page";
import CompactPageHeader from "@/components/shared/CompactPageHeader";
import { useBreadcrumb } from "@/hooks/useBreadcrumbs";
import { UserGroupIcon } from "@heroicons/react/24/outline";

export default function AssignmentIndex() {
  useBreadcrumb([{ title: "Assignment Management" }]);

  return (
    <Page title="Assignment Management">
      <div className="flex h-[calc(100vh-4.25rem)] w-full flex-1 flex-col overflow-hidden p-2.5 space-y-1.5">
        <CompactPageHeader
          title="Workflow Assignment Management"
          recordLabel="Assignments"
          statusBadge="Routing Active"
        />

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-2xs dark:border-dark-600 dark:bg-dark-800">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-dark-700">
            <UserGroupIcon className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Workflow Assignment Matrix
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            Automated and manual queue routing for Data Processors and QC Verifiers across Group Policies.
          </p>
        </div>
      </div>
    </Page>
  );
}