import { ArrowUpTrayIcon, EyeIcon } from "@heroicons/react/24/outline";

export type MasterProductRow = {
  masterProductId: string;
  legalName?: string;
  uin?: string;
  productName?: string;
  status?: string;
};

type Props = {
  products: MasterProductRow[];
  onView: (row: MasterProductRow) => void;
  onUpload: (row: MasterProductRow) => void;
};

const statusColors: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  inactive:
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  archived: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function MasterProductMobileView({
  products,
  onView,
  onUpload,
}: Props) {
  if (!products?.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-400">
        No master products to display.
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

  return (
    <div className="flex flex-col gap-3 py-2">
      {products.map((row) => {
        const status = row.status ?? "";
        const statusLower = String(status).toLowerCase();
        const statusClass =
          statusColors[statusLower] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

        return (
          <div
            key={row.masterProductId}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dark-600 dark:bg-dark-800"
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-col">
                {renderField("Insurer", row.legalName ?? null)}
                {renderField("UIN No", row.uin ?? null)}
                {renderField("Product Name", row.productName ?? null)}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-dark-600">
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Status
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
                  >
                    {status || "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-dark-600">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                  }}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  title="View"
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpload(row);
                  }}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  title="Upload"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
