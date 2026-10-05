import { Switch } from "@/components/ui";
import { EyeIcon } from "@heroicons/react/24/outline";

export type TPABranchRow = {
  tpaBranchId: string;
  recordStatus?: string;
  branchCode?: string;
  branchName?: string;
  serviceTypes?: string;
  business?: string;
  address?: { city?: string; stateName?: string };
  contactPhone?: string;
  contactEmail?: string;
  raw?: any;
};

type Props = {
  branches: TPABranchRow[];
  onToggle: (row: TPABranchRow) => void;
  onView: (row: TPABranchRow) => void;
  canWrite?: boolean;
};

export default function TPABranchesMobileView({
  branches,
  onToggle,
  onView,
  canWrite = false,
}: Readonly<Props>) {
  if (!branches?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-400">
        No branches to display.
      </div>
    );
  }

  const renderField = (label: string, value: string | undefined | null) => (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-dark-600">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="min-w-0 wrap-break-word text-right text-sm text-gray-800 dark:text-gray-200">
        {value ?? "—"}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 py-2">
      {branches.map((row) => {
        const businessUnit = row.serviceTypes ?? row.business ?? "";
        const code = row.branchCode ?? "";
        const branchName = row.branchName ?? "";
        const city = row.address?.city ?? "";
        const stateName = row.address?.stateName ?? "";
        const contactPhone = row.contactPhone ?? "";
        const contactEmail = row.contactEmail ?? "";

        return (
          <div
            key={row.tpaBranchId}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dark-600 dark:bg-dark-800"
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-col">
                {renderField("Code", code || undefined)}
                {renderField("Business Unit", businessUnit || undefined)}
                {renderField("Branch", branchName || undefined)}
                {renderField("City", city || undefined)}
                {renderField("State", stateName || undefined)}
                {renderField("Contact Phone", contactPhone || undefined)}
                {renderField("Contact Email", contactEmail || undefined)}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-dark-600">
                <div className="flex items-center gap-2">
                  {["Active", "Inactive"].includes(row?.recordStatus ?? "") &&
                  canWrite ? (
                    <>
                      <Switch
                        color="info"
                        checked={row?.recordStatus === "Active"}
                        onChange={() => onToggle(row)}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {row?.recordStatus === "Active" ? "Active" : "Inactive"}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {row?.recordStatus ?? "—"}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                  }}
                  className="flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  title="View"
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
