import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ClockIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { ProviderStatCard } from "../../../shared/dashboard";
import type { ProviderInwardCardKey } from "../providerInwardTypes";
import { PROVIDER_INWARD_SPARKLINE_SERIES } from "../providerInwardDashboardDummyData";
import {
    PROVIDER_INWARD_CARD_ACCENT,
    PROVIDER_INWARD_CARD_THEME,
} from "../providerInwardDashboardConfig";

const CARD_ICONS: Record<
    ProviderInwardCardKey,
    ComponentType<SVGProps<SVGSVGElement>>
> = {
    TOTAL: DocumentTextIcon,
    TODAY: CalendarDaysIcon,
    PENDING: ClockIcon,
    PROCESSING: Cog6ToothIcon,
    COMPLETED: CheckCircleIcon,
    REJECTED: XCircleIcon,
};

type ProviderInwardStatCardProps = {
    cardKey: ProviderInwardCardKey;
    title: string;
    count: number;
    delta?: { value: number; up?: boolean };
    deltaLabel?: string;
    active?: boolean;
    onClick?: () => void;
};

export function ProviderInwardStatCard({
    cardKey,
    title,
    count,
    delta,
    deltaLabel,
    active = false,
    onClick,
}: Readonly<ProviderInwardStatCardProps>) {
    return (
        <ProviderStatCard
            title={title}
            count={count}
            icon={CARD_ICONS[cardKey]}
            theme={PROVIDER_INWARD_CARD_THEME[cardKey]}
            activeBorderClass={PROVIDER_INWARD_CARD_ACCENT[cardKey].activeBorder}
            sparkline={PROVIDER_INWARD_SPARKLINE_SERIES[cardKey] ?? []}
            delta={delta}
            deltaLabel={deltaLabel}
            active={active}
            onClick={onClick}
        />
    );
}
