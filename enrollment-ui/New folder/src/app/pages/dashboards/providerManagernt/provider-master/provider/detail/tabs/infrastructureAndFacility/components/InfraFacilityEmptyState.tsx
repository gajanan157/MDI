import {
  BuildingOffice2Icon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { ProviderTabEmptyState } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/shared/ProviderTabEmptyState";

type InfraFacilityEmptyStateProps = {
  variant: "infrastructure" | "facility" | "manpower";
};

const EMPTY_STATE_CONFIG = {
  infrastructure: {
    icon: BuildingOffice2Icon,
    title: "Infrastructure details not found",
    description: 'Use "Edit" above to add bed and room counts for this provider.',
  },
  facility: {
    icon: WrenchScrewdriverIcon,
    title: "Facility details not found",
    description: "No facility management records are available for this provider yet.",
  },
  manpower: {
    icon: UserGroupIcon,
    title: "Manpower details not found",
    description: 'Use "Edit" above to add manpower counts for this provider.',
  },
} as const;

export function InfraFacilityEmptyState({ variant }: Readonly<InfraFacilityEmptyStateProps>) {
  const config = EMPTY_STATE_CONFIG[variant];

  return (
    <ProviderTabEmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
    />
  );
}
