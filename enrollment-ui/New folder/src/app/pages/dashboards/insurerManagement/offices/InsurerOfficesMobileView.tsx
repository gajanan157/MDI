import { EyeIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import type { InsurerOfficeRow } from "@/store/features/insurerOffice/insurerOfficeType";

export type { InsurerOfficeRow };

type Props = {
  offices: InsurerOfficeRow[];
  onView: (row: InsurerOfficeRow) => void;
  onAssignContact?: (row: InsurerOfficeRow) => void;
  canWrite?: boolean;
};

export default function InsurerOfficesMobileView({
  offices,
  onView,
  onAssignContact,
  canWrite = false,
}: Props) {
  if (!offices?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-400">
        No offices to display.
      </div>
    );
  }

  const renderField = (label: string, value: string | undefined | null) => (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-dark-600">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-sm text-gray-800 dark:text-gray-200">
        {value ?? "—"}
      </span>
    </div>
  );

  const formatDate = (val: string | undefined | null) => {
    if (!val) return null;
    try {
      return format(new Date(val), "dd MMM yyyy");
    } catch {
      return val;
    }
  };

  return (
    <div className="flex flex-col gap-3 py-2">
      {offices.map((row) => {
        const underwritingCenter =
          row.underwritingCenter === true || row.underwritingCenter === "true"
            ? "Yes"
            : row.underwritingCenter === false ||
                row.underwritingCenter === "false"
              ? "No"
              : row.underwritingCenter != null
                ? String(row.underwritingCenter)
                : null;
        const status = row.activeFlag ? "Active" : "Inactive";

        return (
          <div
            key={row.insurerOfficeId}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dark-600 dark:bg-dark-800"
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-col">
                {renderField("Insurance Company Name", row.insurerName ?? null)}
                {renderField("Office Name", row.officeName ?? null)}
                {renderField("Office Type", row.officeType ?? null)}
                {renderField("Office Code", row.officeCode ?? null)}
                {renderField(
                  "Is Underwriting Center",
                  underwritingCenter ?? null,
                )}
                {renderField(
                  "Effective From",
                  formatDate(row.effectiveFrom) ?? null,
                )}
                {renderField(
                  "Effective To",
                  formatDate(row.effectiveTo) ?? null,
                )}
                {renderField("Status", status)}
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-dark-600">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  title="View"
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </button>
                {canWrite && onAssignContact && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignContact(row);
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-green-200 bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                    title="Assign Contact Person"
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    Assign
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
