import CompactStatCard from "@/components/shared/CompactStatCard";
import {
  BuildingOffice2Icon,
  ClockIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { TPA_EXECUTIVE_VITALS } from "../analyticsDummyData";

const ICON_MAP = {
  "active-cashless": <BuildingOffice2Icon className="h-4 w-4" />,
  "mou-risk": <ClockIcon className="h-4 w-4" />,
  "rohini-compliance": <ShieldCheckIcon className="h-4 w-4" />,
  "nabh-accreditation": <CheckBadgeIcon className="h-4 w-4" />,
  "vigilance-risk": <ExclamationTriangleIcon className="h-4 w-4" />,
  "pipeline-empanelment": <ArrowPathIcon className="h-4 w-4" />,
};

export function ProviderDashboardCategoryStats() {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
      {TPA_EXECUTIVE_VITALS.map((vital) => (
        <CompactStatCard
          key={vital.id}
          title={vital.label}
          count={vital.value}
          color={vital.color || "blue"}
          variant="bordered"
          icon={ICON_MAP[vital.id as keyof typeof ICON_MAP]}
          height="h-12"
          className="shadow-2xs"
        />
      ))}
    </div>
  );
}
