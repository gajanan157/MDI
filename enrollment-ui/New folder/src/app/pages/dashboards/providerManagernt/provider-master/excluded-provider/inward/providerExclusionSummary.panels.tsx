import clsx from "clsx";
import type { ColDef } from "ag-grid-community";
import type { ComponentType } from "react";
import type { TFunction } from "i18next";
import type { NormalizedStagingBlacklistRow } from "@/store/features/excludedProvider/exclusionStagingNormalizer";
import {
  AgGridSuperWrapper,
  CommonSearch,
  Pagination,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
  type SearchField,
} from "../../../shared/providerShell";
import { ProviderDataToolbar } from "../../../shared/ProviderDataToolbar";
import {
  ProviderStagingSummaryCards,
  type ProviderStagingSummaryCardConfig,
} from "../../../shared/ProviderStagingSummaryCards";
import type {
  ExclusionStagingListingMode,
  ExclusionStagingMainTab,
  ExclusionStagingSubTab,
  PartialMatchSimilarityBand,
} from "./useExclusionStagingList";
import type { ExclusionSummaryViewFlags } from "./providerExclusionSummary.hooks";

export function NoBlacklistJobErrorBanner({
  inwardNo,
}: Readonly<{ inwardNo: string }>) {
  return (
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
          No blacklist job found for the given inward number.
        </p>
        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-red-800 ring-1 ring-red-200/80">
          {inwardNo}
        </span>
      </div>
    </div>
  );
}

type ExclusionStagingDetailsPanelProps = {
  t: TFunction;
  viewFlags: ExclusionSummaryViewFlags;
  summaryCards: ProviderStagingSummaryCardConfig<
    ExclusionStagingMainTab,
    ExclusionStagingSubTab
  >[];
  activeMainTab: ExclusionStagingMainTab;
  activeSubTab: ExclusionStagingSubTab;
  onTabSelect: (
    mainTab: ExclusionStagingMainTab,
    subTab: ExclusionStagingSubTab,
  ) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  searchSubmitting: boolean;
  searchFields: SearchField[];
  onSearchSubmit: (data: Record<string, unknown>) => Promise<void>;
  onSearchReset: () => void;
  partialMatchBand: PartialMatchSimilarityBand;
  totalItems: number;
  onPartialMatchBandChange: (band: PartialMatchSimilarityBand) => void;
  listingModeOptions: Array<{ id: ExclusionStagingListingMode; label: string }>;
  activeListingMode: ExclusionStagingListingMode;
  onListingModeChange: (mode: ExclusionStagingListingMode) => void;
  submittingNotFound: boolean;
  selectedStagingCount: number;
  onNotFoundSubmitClick: () => void;
  filteredRows: NormalizedStagingBlacklistRow[];
  columnDefs: ColDef[];
  loading: boolean;
  onNotFoundRowsSelected: (rows: NormalizedStagingBlacklistRow[]) => void;
  selectedStagingIds: Set<string>;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  partialMatchBands: ComponentType<{
    activeBand: PartialMatchSimilarityBand;
    activeCount: number;
    onBandChange: (band: PartialMatchSimilarityBand) => void;
  }>;
};

function getExclusionStagingRowId(data: unknown): string {
  const row = data as NormalizedStagingBlacklistRow;
  const stagingId = String(row.providerBlacklistStagingId ?? "").trim();
  return stagingId || String(row.id);
}

export function ExclusionStagingDetailsPanel({
  t,
  viewFlags,
  summaryCards,
  activeMainTab,
  activeSubTab,
  onTabSelect,
  isSearchOpen,
  toggleSearch,
  searchSubmitting,
  searchFields,
  onSearchSubmit,
  onSearchReset,
  partialMatchBand,
  totalItems,
  onPartialMatchBandChange,
  listingModeOptions,
  activeListingMode,
  onListingModeChange,
  submittingNotFound,
  selectedStagingCount,
  onNotFoundSubmitClick,
  filteredRows,
  columnDefs,
  loading,
  onNotFoundRowsSelected,
  selectedStagingIds,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  partialMatchBands: PartialMatchBands,
}: Readonly<ExclusionStagingDetailsPanelProps>) {
  const { showPartialMatchBands, isNotFoundTab } = viewFlags;

  return (
    <>
      <ProviderStagingSummaryCards
        cards={summaryCards}
        activeMainTab={activeMainTab}
        activeSubTab={activeSubTab}
        onTabSelect={onTabSelect}
        failSectionKeys={["fail", "processFail", "notFound"]}
      />

      <div
        className={clsx(
          "grid shrink-0 items-center gap-2",
          showPartialMatchBands
            ? "grid-cols-1 sm:grid-cols-[1fr_auto_1fr]"
            : "grid-cols-[1fr_auto]",
        )}
      >
        <div className="flex min-w-0 items-center justify-start">
          <ProviderDataToolbar
            layout="actions-only"
            className="!gap-1"
            items={[
              {
                type: "search",
                key: "search",
                open: isSearchOpen,
                onToggle: toggleSearch,
              },
              isNotFoundTab
                ? {
                    type: "button",
                    key: "not-found-submit",
                    label: t("providerMaster.excludedProvider.uploadDialog.submit", {
                      defaultValue: "Submit",
                    }),
                    pendingLabel: t(
                      "providerMaster.excludedProvider.inward.notFoundBulkSubmitting",
                      { defaultValue: "Submitting..." },
                    ),
                    pending: submittingNotFound,
                    variant: "primary-filled",
                    disabled: submittingNotFound || selectedStagingCount === 0,
                    title:
                      selectedStagingCount === 0
                        ? t(
                            "providerMaster.excludedProvider.inward.notFoundBulkSelectHint",
                            {
                              defaultValue:
                                "Select at least one record to submit.",
                            },
                          )
                        : undefined,
                    onClick: onNotFoundSubmitClick,
                  }
                : null,
            ]}
          />
        </div>

        {showPartialMatchBands ? (
          <div className="flex justify-center sm:justify-center">
            <PartialMatchBands
              activeBand={partialMatchBand}
              activeCount={totalItems}
              onBandChange={onPartialMatchBandChange}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <div
            className="inline-flex rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm"
            role="group"
            aria-label="Restriction listing type"
          >
            {listingModeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onListingModeChange(option.id)}
                className={clsx(
                  "min-w-[5.5rem] rounded px-2.5 py-1 text-center text-[11px] font-semibold leading-tight transition-all",
                  activeListingMode === option.id
                    ? "bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/80"
                    : "text-gray-600 hover:text-gray-900",
                )}
                aria-pressed={activeListingMode === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isSearchOpen ? (
        <div className="shrink-0">
          <CommonSearch
            fields={searchFields}
            onSearch={onSearchSubmit}
            onReset={onSearchReset}
            isSubmitting={searchSubmitting}
            title={t("providerMaster.excludedProvider.inward.stagingSearch", {
              defaultValue: "Staging provider search",
            })}
            showToggleButton={false}
            isOpen={isSearchOpen}
            onToggle={toggleSearch}
            allowEmptySearch
            isState
          />
        </div>
      ) : null}

      <div
        className="bulk-ic-mapping-grid relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white"
        style={{ ["--ag-cell-horizontal-padding" as string]: "12px" }}
      >
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : null}
        <AgGridSuperWrapper
          rowData={filteredRows}
          columnDefs={columnDefs}
          pagination={false}
          height="100%"
          domLayout="normal"
          multiSelectCheckboxes={isNotFoundTab}
          onRowsSelected={
            isNotFoundTab
              ? (rows) =>
                  onNotFoundRowsSelected(rows as NormalizedStagingBlacklistRow[])
              : undefined
          }
          syncSelectedRowIds={
            isNotFoundTab ? Array.from(selectedStagingIds) : undefined
          }
          getRowId={({ data }) => getExclusionStagingRowId(data)}
        />
        <Pagination
          className="shrink-0 border-t border-gray-100 px-2 py-1"
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
        />
      </div>
    </>
  );
}
