import { Button } from "@/components/ui";
import { PROVIDER_FORM_BUTTON_CLASS } from "../../../shared/providerButtonStyles";
import { MouGovernanceTable } from "./MouGovernanceTable";
import { InsurerPenetrationTable } from "./InsurerPenetrationTable";
import { VigilanceWatchlistTable } from "./VigilanceWatchlistTable";
import { AccreditationQualityCards } from "./AccreditationQualityCards";

type ProviderDashboardAnalyticsPanelProps = {
  onClearFilters: () => void;
  showNoData: boolean;
};

export function ProviderDashboardAnalyticsPanel({
  onClearFilters,
  showNoData,
}: Readonly<ProviderDashboardAnalyticsPanelProps>) {
  if (showNoData) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-gray-900">No matching providers found</p>
        <p className="mt-1 max-w-sm text-xs text-gray-500">
          No hospital network records match your current filter selection.
        </p>
        <Button
          type="button"
          color="primary"
          variant="filled"
          className={`mt-3 ${PROVIDER_FORM_BUTTON_CLASS}`}
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      {/* Top Left: MOU & Tariff Expiry Horizon */}
      <MouGovernanceTable />

      {/* Top Right: Insurer (IC) & PPN Cashless Penetration */}
      <InsurerPenetrationTable />

      {/* Bottom Left: Vigilance, Risk & De-Panelment Radar */}
      <VigilanceWatchlistTable />

      {/* Bottom Right: Quality Accreditation & Pricing Slabs */}
      <AccreditationQualityCards />
    </div>
  );
}
