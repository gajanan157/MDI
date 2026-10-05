import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import CompactStatCard, { StatCardColor } from "@/components/shared/CompactStatCard";
import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ClockIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import {
    CommonSearch,
    Pagination,
    PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../../../shared/providerShell";
import { createProviderInwardSearchFields } from "../../../shared/providerMasterI18n";
import {
    PROVIDER_INWARD_CARD_DELTAS,
} from "../providerInwardDashboardDummyData";
import { PROVIDER_INWARD_CARD_ORDER } from "../providerInwardDashboardConfig";
import type { useProviderInwardList } from "../useProviderInwardList";
import { ProviderInwardChartRow } from "./ProviderInwardChartRow";
import { ProviderInwardGridSection } from "./ProviderInwardGridSection";
import type { ProviderInwardRow } from "../providerInwardTypes";

const CARD_ICONS: Record<
    (typeof PROVIDER_INWARD_CARD_ORDER)[number],
    React.ComponentType<{ className?: string }>
> = {
    TOTAL: DocumentTextIcon,
    TODAY: CalendarDaysIcon,
    PENDING: ClockIcon,
    PROCESSING: Cog6ToothIcon,
    COMPLETED: CheckCircleIcon,
    REJECTED: XCircleIcon,
};

const CARD_COLORS: Record<
    (typeof PROVIDER_INWARD_CARD_ORDER)[number],
    StatCardColor
> = {
    TOTAL: "blue",
    TODAY: "indigo",
    PENDING: "amber",
    PROCESSING: "orange",
    COMPLETED: "emerald",
    REJECTED: "rose",
};

type ProviderInwardListState = ReturnType<typeof useProviderInwardList>;

type ProviderInwardDashboardSectionProps = {
    inwardState: ProviderInwardListState;
    isSearchOpen: boolean;
    onToggleSearch: () => void;
    onAssignClick?: (row: ProviderInwardRow) => void;
    summaryRefreshKey?: number;
    showInsights?: boolean;
};

export function ProviderInwardDashboardSection({
    inwardState,
    isSearchOpen,
    onToggleSearch,
    onAssignClick,
    summaryRefreshKey,
    showInsights = false,
}: Readonly<ProviderInwardDashboardSectionProps>) {
    const { t } = useTranslation();
    const {
        activeCard,
        counts,
        countsLoading,
        todayBreakup,
        inwardStatusFilter,
        filteredRows,
        totalRecords,
        page,
        pageSize,
        loading,
        handleCardSelect,
        handleInwardStatusSelect,
        handleSearch,
        handlePageChange,
        handlePageSizeChange,
    } = inwardState;

    const inwardSearchFields = useMemo(
        () => createProviderInwardSearchFields(t),
        [t],
    );

    const fromYesterdayLabel = t("providerMaster.dashboard.inward.cards.fromYesterday");
    const todayDeltaLabel = t("providerMaster.dashboard.inward.cards.todayDelta");

    const getCardDelta = (key: (typeof PROVIDER_INWARD_CARD_ORDER)[number]) => {
        if (key === "TODAY") {
            return { value: counts.TODAY, up: true };
        }
        return PROVIDER_INWARD_CARD_DELTAS[key];
    };

    const getCardDeltaLabel = (key: (typeof PROVIDER_INWARD_CARD_ORDER)[number]) =>
        key === "TODAY" ? todayDeltaLabel : fromYesterdayLabel;

    return (
        <section className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
            {/* Cards/charts hide while search is open so search + grid stay fully visible. */}
            {isSearchOpen ? null : (
                <div className="shrink-0 space-y-1.5">
                    <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
                        {PROVIDER_INWARD_CARD_ORDER.map((cardKey) => {
                            const Icon = CARD_ICONS[cardKey];
                            return (
                                <CompactStatCard
                                    key={cardKey}
                                    variant="bordered"
                                    color={CARD_COLORS[cardKey]}
                                    title={t(`providerMaster.dashboard.inward.cards.${cardKey.toLowerCase()}`)}
                                    count={countsLoading ? 0 : counts[cardKey]}
                                    active={activeCard === cardKey}
                                    onClick={() => handleCardSelect(cardKey)}
                                    icon={Icon ? <Icon className="h-4 w-4" /> : undefined}
                                    height="h-auto"
                                />
                            );
                        })}
                    </div>

                    {showInsights && (
                        <ProviderInwardChartRow
                            activeCard={activeCard}
                            counts={counts}
                            todayBreakup={todayBreakup}
                            inwardStatusFilter={inwardStatusFilter}
                            onInwardStatusSelect={handleInwardStatusSelect}
                        />
                    )}
                </div>
            )}

            {isSearchOpen ? (
                <div className="shrink-0">
                    <CommonSearch
                        fields={inwardSearchFields}
                        onSearch={handleSearch}
                        isSubmitting={loading}
                        title={t("providerMaster.dashboard.inward.search.filterTitle")}
                        showToggleButton={false}
                        isOpen
                        onToggle={onToggleSearch}
                        allowEmptySearch
                    />
                </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                <ProviderInwardGridSection
                    rowData={filteredRows}
                    loading={loading}
                    onAssignClick={onAssignClick}
                    summaryRefreshKey={summaryRefreshKey}
                />
                <Pagination
                    className="shrink-0"
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalRecords}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
                />
            </div>
        </section>
    );
}
