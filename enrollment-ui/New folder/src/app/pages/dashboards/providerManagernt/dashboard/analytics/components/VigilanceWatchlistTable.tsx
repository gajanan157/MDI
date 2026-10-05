import clsx from "clsx";
import { VIGILANCE_WATCHLIST_DATA } from "../analyticsDummyData";

export function VigilanceWatchlistTable() {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-dark-700 dark:bg-dark-800">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-dark-700">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Vigilance, Risk & De-Panelment Radar
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Real-time tracking of GIPSA blacklists, cashless suspensions, and fraud anomaly triggers
            </p>
          </div>
          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
            37 Providers Flagged
          </span>
        </div>

        {/* Table */}
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-dark-700">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-medium dark:bg-dark-900">
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-left text-[11px]">
                  Flagged Hospital
                </th>
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-left text-[11px]">
                  City / State
                </th>
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-center text-[11px]">
                  Risk Category
                </th>
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-center text-[11px]">
                  Exposure / Reason
                </th>
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-center text-[11px]">
                  Vigilance Action
                </th>
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-right text-[11px]">
                  Flagged Date
                </th>
              </tr>
            </thead>
            <tbody>
              {VIGILANCE_WATCHLIST_DATA.map((row, idx) => (
                <tr
                  key={row.id}
                  className={clsx(
                    "transition-colors hover:bg-slate-50/80 dark:hover:bg-dark-700/60",
                    idx % 2 === 0 ? "bg-white dark:bg-dark-800" : "bg-slate-50/40 dark:bg-dark-750",
                  )}
                >
                  <td className="border-b border-slate-100 px-2.5 py-1.5 font-semibold text-slate-900 dark:border-dark-700 dark:text-slate-100">
                    {row.providerName}
                  </td>
                  <td className="border-b border-slate-100 px-2.5 py-1.5 text-slate-500 dark:border-dark-700 dark:text-slate-400">
                    {row.city}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center dark:border-dark-700">
                    <span
                      className={clsx(
                        "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase",
                        row.severity === "critical"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200",
                      )}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-2.5 py-1.5 text-center font-medium text-slate-700 dark:border-dark-700 dark:text-slate-300">
                    {row.claimsAtRisk}
                  </td>
                  <td className="border-b border-slate-100 px-2.5 py-1.5 text-center font-semibold text-slate-800 dark:border-dark-700 dark:text-slate-200">
                    {row.status}
                  </td>
                  <td className="border-b border-slate-100 px-2.5 py-1.5 text-right tabular-nums text-slate-400 dark:border-dark-700">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-1.5 dark:border-dark-700">
        <span>GIPSA Depaneled Database: <strong className="text-emerald-700 dark:text-emerald-400">Synced Today 06:00 AM</strong></span>
        <span>Rejection Threshold Flag: <strong className="text-slate-800 dark:text-slate-100">&gt; 15.0% Cashless Repudiation</strong></span>
      </div>
    </div>
  );
}
