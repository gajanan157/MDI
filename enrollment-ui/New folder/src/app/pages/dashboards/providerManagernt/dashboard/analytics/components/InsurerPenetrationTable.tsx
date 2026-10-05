import clsx from "clsx";
import { INSURER_PENETRATION_DATA } from "../analyticsDummyData";

const TAG_STYLES = {
  emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200",
  blue: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200",
  slate: "bg-slate-100 text-slate-700 dark:bg-dark-700 dark:text-slate-300 border border-slate-200",
};

export function InsurerPenetrationTable() {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-dark-700 dark:bg-dark-800">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-dark-700">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Insurer (IC) & PPN Cashless Penetration
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hospital mapping density and cashless authorization readiness by underwriter
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-dark-700 dark:text-slate-300">
            5 Underwriters Tracked
          </span>
        </div>

        {/* Table */}
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-dark-700">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-medium dark:bg-dark-900">
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-left text-[11px]">
                  Insurer / Underwriter
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[11px]">
                  Network Tier
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[11px]">
                  Cashless Mapped
                </th>
                <th className="border-b border-slate-700 px-2.5 py-1.5 text-left text-[11px] w-[140px]">
                  Penetration Share
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-center text-[11px]">
                  Pre-Auth TAT
                </th>
                <th className="border-b border-slate-700 px-2 py-1.5 text-right text-[11px]">
                  Leakage
                </th>
              </tr>
            </thead>
            <tbody>
              {INSURER_PENETRATION_DATA.map((row, idx) => (
                <tr
                  key={row.id}
                  className={clsx(
                    "transition-colors hover:bg-slate-50/80 dark:hover:bg-dark-700/60",
                    idx % 2 === 0 ? "bg-white dark:bg-dark-800" : "bg-slate-50/40 dark:bg-dark-750",
                  )}
                >
                  <td className="border-b border-slate-100 px-2.5 py-1.5 font-semibold text-slate-800 dark:border-dark-700 dark:text-slate-200">
                    {row.insurerName}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center dark:border-dark-700">
                    <span
                      className={clsx(
                        "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase",
                        TAG_STYLES[row.tagVariant],
                      )}
                    >
                      {row.tag}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center font-bold tabular-nums text-slate-900 dark:border-dark-700 dark:text-white">
                    {row.mappedCount.toLocaleString()}
                  </td>
                  <td className="border-b border-slate-100 px-2.5 py-1.5 dark:border-dark-700">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-200 dark:bg-dark-600">
                        <div
                          className="h-full rounded bg-blue-600 transition-all duration-300"
                          style={{ width: `${row.penetrationPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-slate-700 dark:text-slate-300">
                        {row.penetrationPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-center font-medium tabular-nums text-slate-700 dark:border-dark-700 dark:text-slate-300">
                    {row.preAuthTat}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-1.5 text-right font-medium tabular-nums text-slate-500 dark:border-dark-700 dark:text-slate-400">
                    {row.discountLeakage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-1.5 dark:border-dark-700">
        <span>GIPSA PPN Active Packages: <strong className="text-emerald-700 dark:text-emerald-400">128 Standardized Procedures</strong></span>
        <span>Standard Pre-Auth SLA: <strong className="text-slate-800 dark:text-slate-100">&lt; 2.0 Hours</strong></span>
      </div>
    </div>
  );
}
