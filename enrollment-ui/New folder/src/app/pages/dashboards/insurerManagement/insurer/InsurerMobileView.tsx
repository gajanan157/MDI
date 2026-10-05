import { EyeIcon } from "@heroicons/react/24/outline";

export type InsurerRow = {
  id: string;
  name?: string;
  irdaiInsurerCode?: string;
  brandName?: string;
  code?: string;
  insurerType?: string;
  isActive?: boolean;
};

type Props = {
  insurers: InsurerRow[];
  onView: (row: InsurerRow) => void;
};

export default function InsurerMobileView({
  insurers,
  onView,
}: Readonly<Props>) {
  if (!insurers?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-400">
        No insurers to display.
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
    <div className="flex flex-col gap-1">
      {insurers.map((row) => {
        const status = row.isActive ? "Active" : "Inactive";

        return (
          <div
            key={row.id}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dark-600 dark:bg-dark-800"
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-col">
                {renderField("Insurance Company Name", row.name ?? null)}
                {renderField("IRDAI Code", row.irdaiInsurerCode ?? null)}
                {renderField("Brand Name", row.brandName ?? null)}
                {renderField("Insurer Code", row.code ?? null)}
                {renderField("Type", row.insurerType ?? null)}
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
