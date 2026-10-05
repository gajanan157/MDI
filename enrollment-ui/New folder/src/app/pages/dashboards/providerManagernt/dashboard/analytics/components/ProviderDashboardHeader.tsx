import { Button } from "@/components/ui";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

type ProviderDashboardHeaderProps = {
  onReset: () => void;
};

export function ProviderDashboardHeader({
  onReset,
}: Readonly<ProviderDashboardHeaderProps>) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5 dark:border-dark-700">
      <div className="min-w-0">
        <h2 className="text-xs-plus font-bold text-slate-900 dark:text-white">
          Provider Network Analytics & Governance
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Executive monitoring for cashless availability, tariff MOU expiry horizons, ROHINI compliance & vigilance radar.
        </p>
      </div>
      <Button
        type="button"
        variant="outlined"
        className="flex h-6.5 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
        onClick={onReset}
      >
        <ArrowPathIcon className="h-3 w-3" />
        Reset Filters
      </Button>
    </div>
  );
}
