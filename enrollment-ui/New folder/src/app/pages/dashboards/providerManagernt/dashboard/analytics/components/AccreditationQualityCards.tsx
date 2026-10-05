import { QUALITY_SLABS_DATA } from "../analyticsDummyData";

export function AccreditationQualityCards() {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-dark-700 dark:bg-dark-800">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-dark-700">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Quality Accreditation & Pricing Slabs
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              NABH / NABL accreditation distribution directly governing tariff tiering
            </p>
          </div>
          <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200">
            4 Quality Tiers
          </span>
        </div>

        {/* 4 Cards Grid - matching PriorityCard layout */}
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUALITY_SLABS_DATA.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs dark:border-dark-700 dark:bg-dark-750"
            >
              <div
                className={`py-1 text-center text-[11px] font-bold text-white ${item.color}`}
              >
                {item.tier}
              </div>
              <div className="bg-slate-50/60 p-2 text-center dark:bg-dark-800">
                <div className="text-base font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {item.count.toLocaleString()}
                </div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {item.percentage} of network
                </div>
                <div className="mt-1.5 rounded border border-slate-200/80 bg-white px-1 py-0.5 text-[9px] font-medium text-slate-700 dark:border-dark-600 dark:bg-dark-700 dark:text-slate-300">
                  {item.pricingImpact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-1.5 dark:border-dark-700">
        <span>Accreditation Verification Cycle: <strong className="text-slate-800 dark:text-slate-100">Monthly NABH API Sync</strong></span>
        <span>ROHINI Registered Providers: <strong className="text-emerald-700 dark:text-emerald-400">12,294 (98.5%)</strong></span>
      </div>
    </div>
  );
}
