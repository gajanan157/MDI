import clsx from "clsx";
import { MOU_GOVERNANCE_DATA, TPA_SUMMARY_PILLS } from "../analyticsDummyData";

const STATUS_PILL_STYLES = {
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200",
};

export function MouGovernanceTable() {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-dark-700 dark:bg-dark-800">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-dark-700">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              MOU & Tariff Expiry Governance
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Renegotiation timeline to prevent cashless stoppage and tariff leakage
            </p>
          </div>
          {/* Summary Pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
              Avg Discount: {TPA_SUMMARY_PILLS.avgDiscount}
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200">
              SOC Compliance: {TPA_SUMMARY_PILLS.socCompliance}
            </span>
          </div>
        </div>

        {/* Governance Table */}
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-dark-700">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-medium dark:bg-dark-900">
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-left text-[11px]">
                  Renewal Horizon
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[11px]">
                  # Hospitals
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[11px]">
                  Share %
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[11px]">
                  Avg Discount
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[11px]">
                  SOC Adherence
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-right text-[11px]">
                  Action Status
                </th>
              </tr>
            </thead>
            <tbody>
              {MOU_GOVERNANCE_DATA.map((row, idx) => (
                <tr
                  key={row.id}
                  className={clsx(
                    "transition-colors hover:bg-slate-50/80 dark:hover:bg-dark-700/60",
                    idx % 2 === 0 ? "bg-white dark:bg-dark-800" : "bg-slate-50/40 dark:bg-dark-750",
                  )}
                >
                  <td className="border-b border-slate-100 px-2.5 py-1.5 font-semibold text-slate-800 dark:border-dark-700 dark:text-slate-200">
                    {row.horizon}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center font-bold tabular-nums text-slate-900 dark:border-dark-700 dark:text-white">
                    {row.hospitals}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center tabular-nums text-slate-600 dark:border-dark-700 dark:text-slate-300">
                    {row.sharePercent}%
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center font-semibold tabular-nums text-emerald-700 dark:border-dark-700 dark:text-emerald-400">
                    {row.avgDiscount}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center tabular-nums text-blue-700 dark:border-dark-700 dark:text-blue-400">
                    {row.socCompliance}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-right dark:border-dark-700">
                    <span
                      className={clsx(
                        "inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-tight",
                        STATUS_PILL_STYLES[row.statusVariant],
                      )}
                    >
                      {row.statusText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-1.5 dark:border-dark-700">
        <span>YTD Negotiated Tariff Savings: <strong className="text-slate-800 dark:text-slate-100">{TPA_SUMMARY_PILLS.savingsYTD}</strong></span>
        <span>Disputed Billing Inwards: <strong className="text-rose-600 dark:text-rose-400">{TPA_SUMMARY_PILLS.disputedBills}</strong></span>
      </div>
    </div>
  );
}
