import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function ProviderDashboardAlertStrip() {
  return (
    <div className="flex shrink-0 items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs text-amber-900 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold uppercase text-white shadow-2xs">
          <ExclamationTriangleIcon className="h-3 w-3" />
          Urgent Horizon
        </span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          91 hospital agreements expiring in &lt;30 days (Renegotiation Required)
        </span>
        <span className="hidden sm:inline text-slate-300 dark:text-dark-600">|</span>
        <span className="hidden sm:inline text-[11px] text-amber-800 dark:text-amber-300">
          186 providers pending ROHINI verification
        </span>
      </div>
      <span className="hidden md:inline text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        IRDAI &amp; GIPSA Radar: 37 Flagged
      </span>
    </div>
  );
}
