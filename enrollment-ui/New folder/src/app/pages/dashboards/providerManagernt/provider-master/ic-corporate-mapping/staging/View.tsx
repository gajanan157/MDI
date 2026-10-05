import { useMemo, useState } from "react";
import {
    AgGridSuperWrapper,
    CommonSearch,
    Pagination,
    PROVIDER_GRID_PAGE_SIZE_OPTIONS,
    type SearchField,
    useDisclosure,
} from "../../../shared/providerShell";
import type { BulkIcMappingInwardRow } from "../inward/rows";
import { BulkIcMappingStagingSummaryCards } from "./SummaryCards";
import { ProviderJobProcessingPanel } from "../job/ProcessingPanel";
import { isProviderJobStillProcessing } from "../job/progressUtils";
import { useProviderJobStatus } from "../job/useStatus";
import { getBulkIcMappingStagingGridColumns } from "./grid";
import { useBulkIcMappingStagingList } from "./useList";
import { shouldShowStagingReasonColumn } from "./utils";
import { ProviderDataToolbar } from "../../../shared/ProviderDataToolbar";
import { readBulkIcMappingPersistedContext } from "../upload";
import {
    resolveBulkIcMappingRowType,
    resolveBulkIcMappingTypeFromRowType,
    type BulkIcMappingRowType,
} from "../types";
import clsx from "clsx";
import { useAppSelector } from "@/store/hooks/useAppSelector";

type BulkIcMappingStagingViewProps = {
    inward: BulkIcMappingInwardRow;
};

export function BulkIcMappingStagingView({ inward }: Readonly<BulkIcMappingStagingViewProps>) {
    const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
    const [searchSubmitting, setSearchSubmitting] = useState(false);
    const stateList = useAppSelector((state) => state.stateCity.stateList);

    const mappingType =
        readBulkIcMappingPersistedContext(inward.inwardNo)?.mappingType ?? "empanel";
    const initialRowType = resolveBulkIcMappingRowType(mappingType);

    const { data: providerJobStatus, isLoading: isProviderJobStatusLoading, isFetched: isProviderJobStatusFetched, isSuccess: isProviderJobStatusSuccess } =
        useProviderJobStatus(inward.inwardNo);
    const suppressStagingErrorToast =
        isProviderJobStatusLoading || providerJobStatus?.jobStatus === "FAILED";

    /** Status API 404 / PROV-BATCH-404-24 — show on-page, not as a toast. */
    const showNoProviderJobError =
        isProviderJobStatusFetched &&
        isProviderJobStatusSuccess &&
        !isProviderJobStatusLoading &&
        providerJobStatus == null;

    const {
        filteredRows,
        counts,
        activeMainTab,
        activeSubTab,
        activeRowType,
        handleRowTypeChange,
        handleTabSelect,
        handleSearch,
        page,
        pageSize,
        totalItems,
        handlePageChange,
        handlePageSizeChange,
        reloadStagingRows,
        loading,
    } = useBulkIcMappingStagingList(inward.inwardNo, {
        suppressErrorToast: suppressStagingErrorToast,
        initialRowType,
    });

    const summaryMappingType = resolveBulkIcMappingTypeFromRowType(activeRowType);

    const rowTypeOptions: Array<{ id: BulkIcMappingRowType; label: string }> = [
        { id: "EMPANELMENT", label: "Empaneled" },
        { id: "DE_EMPANELMENT", label: "De-empanelled" },
    ];

    const showReasonColumn = shouldShowStagingReasonColumn(activeMainTab, activeSubTab);

    const gridRows = useMemo(
        () =>
            filteredRows.map((row, index) => ({
                ...row,
                uiSerialNo: (page - 1) * pageSize + index + 1,
            })),
        [filteredRows, page, pageSize],
    );

    const columnDefs = useMemo(
        () => getBulkIcMappingStagingGridColumns(showReasonColumn),
        [showReasonColumn],
    );

    const stateOptions = useMemo(
        () =>
            stateList.map((item) => ({
                label: item.stateName,
                value: item.stateName,
            })),
        [stateList],
    );

    const searchFields: SearchField[] = useMemo(
        () => [
            { name: "providerName", label: "Provider Name", type: "text" },
            { name: "providerIibRohiniCode", label: "Rohini Code", type: "text" },
            {
                name: "pincode",
                label: "Pincode",
                type: "text",
                numericOnly: true,
            },
            {
                name: "state",
                label: "State",
                type: "dropdown",
                options: stateOptions,
                allowCustomValue: true,
            },
            {
                name: "city",
                label: "City",
                type: "dropdown",
                options: [],
                allowCustomValue: true,
            },
        ],
        [stateOptions],
    );

    const handleSearchSubmit = async (data: Record<string, unknown>) => {
        setSearchSubmitting(true);
        try {
            handleSearch(data);
        } finally {
            setSearchSubmitting(false);
        }
    };

    const showStagingDetails = !isProviderJobStillProcessing(
        providerJobStatus,
        isProviderJobStatusLoading,
    );

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-hidden px-1.5 sm:px-2">
            <ProviderJobProcessingPanel
                inwardNo={inward.inwardNo}
                onTerminalStatus={(jobStatus) => {
                    if (jobStatus === "COMPLETED") {
                        reloadStagingRows();
                    }
                }}
            />

            {showNoProviderJobError ? (
                <div
                    className="shrink-0 overflow-hidden rounded-sm border border-red-200/90 bg-gradient-to-r from-red-50/40 to-white shadow-sm ring-1 ring-slate-900/[0.04]"
                    role="alert"
                >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-l-[3px] border-l-red-500 px-2.5 py-1.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-red-600 text-[10px] font-bold text-white">
                            !
                        </span>
                        <p className="text-[11px] font-bold text-slate-900">Job status</p>
                        <p className="min-w-0 flex-1 text-[11px] leading-snug text-red-700">
                            No job found for the given inward number.
                        </p>
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-red-800 ring-1 ring-red-200/80">
                            {inward.inwardNo}
                        </span>
                    </div>
                </div>
            ) : null}

            {showStagingDetails ? (
                <>
                    <BulkIcMappingStagingSummaryCards
                        counts={counts}
                        activeMainTab={activeMainTab}
                        activeSubTab={activeSubTab}
                        onTabSelect={handleTabSelect}
                        mappingType={summaryMappingType}
                    />

                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                        <ProviderDataToolbar
                            layout="actions-only"
                            className="!gap-1"
                            items={[
                                {
                                    type: "search",
                                    key: "search",
                                    open: isSearchOpen,
                                    onToggle: toggleSearch,
                                    className: "h-8 rounded-md px-3 text-xs",
                                },
                            ]}
                        />

                        <fieldset
                            className="m-0 inline-flex rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm"
                        >
                            <legend className="sr-only">Staging row type</legend>
                            {rowTypeOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleRowTypeChange(option.id)}
                                    className={clsx(
                                        "min-w-[5.5rem] rounded px-2.5 py-1 text-center text-[11px] font-semibold leading-tight transition-all",
                                        activeRowType === option.id
                                            ? "bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/80"
                                            : "text-gray-600 hover:text-gray-900",
                                    )}
                                    aria-pressed={activeRowType === option.id}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </fieldset>
                    </div>

                    {isSearchOpen ? (
                        <div className="shrink-0">
                            <CommonSearch
                                fields={searchFields}
                                onSearch={handleSearchSubmit}
                                isSubmitting={searchSubmitting}
                                title="Staging provider search"
                                showToggleButton={false}
                                isOpen={isSearchOpen}
                                onToggle={toggleSearch}
                                allowEmptySearch
                                isState
                            />
                        </div>
                    ) : null}

                    <div className="bulk-ic-mapping-grid relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
                        {loading ? (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            </div>
                        ) : null}
                        <AgGridSuperWrapper
                            rowData={gridRows}
                            columnDefs={columnDefs}
                            pagination={false}
                            height="100%"
                            domLayout="normal"
                            getRowId={({ data }) => String((data as { id: string }).id)}
                        />
                        <Pagination
                            className="shrink-0 border-t border-gray-100 px-2 py-1"
                            page={page}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
                        />
                    </div>
                </>
            ) : null}
        </div>
    );
}
