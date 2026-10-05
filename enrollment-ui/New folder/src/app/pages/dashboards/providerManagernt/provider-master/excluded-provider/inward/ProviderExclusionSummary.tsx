import clsx from "clsx";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  EyeIcon,
  Squares2X2Icon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  useDisclosure,
} from "../../../shared/providerShell";
import { formatProviderDateTimeDisplay } from "../../../shared/dateFormat";
import {
  type ProviderStagingSummaryCardConfig,
} from "../../../shared/ProviderStagingSummaryCards";
import AlertDialog from "@/components/shared/dialog/AlertDialog/AlertDialog";
import { applyBulkIcMappingGridCellStyle } from "../../ic-corporate-mapping/config";
import { ProviderJobProcessingPanel } from "../../ic-corporate-mapping/job/ProcessingPanel";
import {
  formatMatchSimilarityPercent,
  type NormalizedStagingBlacklistCounts,
} from "@/store/features/excludedProvider/exclusionStagingNormalizer";
import { PartialMatchCandidatesDialog } from "./PartialMatchCandidatesDialog";
import {
  useExclusionStagingList,
  type ExclusionStagingListingMode,
  type ExclusionStagingMainTab,
  type ExclusionStagingSubTab,
  type PartialMatchSimilarityBand,
} from "./useExclusionStagingList";
import {
  ExclusionStagingDetailsPanel,
  NoBlacklistJobErrorBanner,
} from "./providerExclusionSummary.panels";
import {
  resolveExclusionSummaryViewFlags,
  useExclusionJobGate,
  useExclusionStagingSearchFields,
  useNotFoundBulkSubmit,
  type PartialMatchDialogArgs,
} from "./providerExclusionSummary.hooks";

type Props = {
  inwardNo: string;
  documentType: string;
};

type ExclusionStagingColumn = {
  field: string;
  headerName: string;
  flex: number;
  minWidth: number;
  sortable: boolean;
  filter: boolean;
  valueFormatter?: (params: { value?: unknown }) => string;
  cellRenderer?: (params: {
    value?: unknown;
    data?: {
      matchSimilarityScore?: number | null;
      providerBlacklistStagingId?: string;
      id?: string;
      providerName?: string;
      providerAddress?: string;
      providerAddressCity?: string;
      providerAddressState?: string;
      providerAddressPostalCode?: string;
    };
  }) => ReactNode;
  tooltipField?: string;
  wrapText?: boolean;
  autoHeight?: boolean;
};

const CARD_ACTIVE_RING: Record<ExclusionStagingMainTab, string> = {
  total: "ring-blue-400",
  process: "ring-amber-400",
};

/** Mid: 50–70%. High: 71–90%. Very high: 91–100%. */
function getMatchSimilarityBand(
  score: number | null | undefined,
): "mid" | "high" | "veryHigh" | null {
  if (score == null || !Number.isFinite(score)) return null;
  if (score >= 0.5 && score <= 0.7) return "mid";
  if (score >= 0.71 && score <= 0.9) return "high";
  if (score >= 0.91 && score <= 1) return "veryHigh";
  return null;
}

/** Same capsule palette as Providers grid (Network / Non-Network / expiry). */
const MATCH_SIMILARITY_CAPSULE: Record<"mid" | "high" | "veryHigh" | "neutral", string> = {
  mid: "bg-yellow-100 text-yellow-700",
  high: "bg-green-100 text-green-700",
  veryHigh: "bg-emerald-100 text-emerald-800",
  neutral: "bg-slate-100 text-slate-700",
};

const MATCH_SIMILARITY_TAB_ACTIVE: Record<
  PartialMatchSimilarityBand,
  string
> = {
  all: "bg-white text-primary-700 shadow-sm ring-1 ring-gray-200/80",
  "50To70":
    "bg-yellow-100 text-yellow-800 shadow-sm ring-1 ring-yellow-300/80",
  "71To90": "bg-green-100 text-green-800 shadow-sm ring-1 ring-green-300/80",
  "91To100": "bg-emerald-100 text-emerald-800 shadow-sm ring-1 ring-emerald-300/80",
};

const MATCH_SIMILARITY_TAB_ICON_ACTIVE: Record<
  PartialMatchSimilarityBand,
  string
> = {
  all: "text-primary-600",
  "50To70": "text-yellow-700",
  "71To90": "text-green-700",
  "91To100": "text-emerald-700",
};

const MATCH_SIMILARITY_TAB_COUNT: Record<PartialMatchSimilarityBand, string> = {
  all: "bg-primary-50 text-primary-800",
  "50To70": "bg-yellow-200/70 text-yellow-900",
  "71To90": "bg-green-200/70 text-green-900",
  "91To100": "bg-emerald-200/70 text-emerald-900",
};

function MatchSimilarityScoreCell({
  value,
  stagingId,
  providerName,
  address,
  city,
  state,
  pincode,
  onShowMatches,
}: Readonly<{
  value?: number | null;
  stagingId?: string;
  providerName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  onShowMatches?: (args: PartialMatchDialogArgs) => void;
}>) {
  const { t } = useTranslation();
  const score =
    typeof value === "number" && Number.isFinite(value) ? value : null;
  const label = formatMatchSimilarityPercent(score);
  const resolvedStagingId = String(stagingId ?? "").trim();
  const canViewMatches = Boolean(resolvedStagingId && onShowMatches);

  const band = getMatchSimilarityBand(score);
  const capsuleClass =
    MATCH_SIMILARITY_CAPSULE[band ?? "neutral"] ?? MATCH_SIMILARITY_CAPSULE.neutral;

  return (
    <div className="flex h-full items-center gap-1">
      {label ? (
        <span
          className={clsx(
            "inline-flex rounded px-2 py-1 text-xs font-medium tabular-nums",
            capsuleClass,
          )}
        >
          {label}
        </span>
      ) : (
        <span className="text-[11px] text-gray-400">—</span>
      )}
      {canViewMatches ? (
        <button
          type="button"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
          title={t("providerMaster.excludedProvider.inward.showMatchingRecords", {
            defaultValue: "Show matching records",
          })}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            onShowMatches?.({
              stagingId: resolvedStagingId,
              providerName: String(providerName ?? "").trim(),
              address: String(address ?? "").trim(),
              city: String(city ?? "").trim(),
              state: String(state ?? "").trim(),
              pincode: String(pincode ?? "").trim(),
            });
          }}
        >
          <EyeIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      ) : null}
    </div>
  );
}

const PARTIAL_MATCH_BAND_OPTIONS: Array<{
  id: PartialMatchSimilarityBand;
  label: string;
  hint: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  {
    id: "all",
    label: "All",
    hint: "Show all partial matches",
    Icon: Squares2X2Icon,
  },
  {
    id: "50To70",
    label: "50 to 70%",
    hint: "Medium similarity score (50% to 70%)",
    Icon: ScaleIcon,
  },
  {
    id: "71To90",
    label: "71 to 90%",
    hint: "High similarity score (70% to 90%)",
    Icon: ArrowTrendingUpIcon,
  },
  {
    id: "91To100",
    label: "91 to 100%",
    hint: "Very high similarity score (91% to 100%)",
    Icon: CheckBadgeIcon,
  },
];

function PartialMatchSimilarityBands({
  activeBand,
  activeCount,
  onBandChange,
}: Readonly<{
  activeBand: PartialMatchSimilarityBand;
  activeCount: number;
  onBandChange: (band: PartialMatchSimilarityBand) => void;
}>) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] font-semibold text-slate-500 sm:inline">
        Similarity
      </span>
      <fieldset
        className="m-0 inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/80 p-0.5 shadow-sm"
      >
        <legend className="sr-only">Partial match similarity</legend>
        {PARTIAL_MATCH_BAND_OPTIONS.map((option) => {
          const isActive = activeBand === option.id;
          const { Icon } = option;
          return (
            <button
              key={option.id}
              type="button"
              title={
                isActive ? `${option.hint} (${activeCount})` : option.hint
              }
              onClick={() => onBandChange(option.id)}
              aria-pressed={isActive}
              className={clsx(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1.5",
                "text-[11px] font-semibold leading-tight transition-all",
                isActive
                  ? MATCH_SIMILARITY_TAB_ACTIVE[option.id]
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Icon
                className={clsx(
                  "h-3.5 w-3.5 shrink-0",
                  isActive
                    ? MATCH_SIMILARITY_TAB_ICON_ACTIVE[option.id]
                    : "text-gray-400",
                )}
                aria-hidden
              />
              <span>{option.label}</span>
              {isActive ? (
                <span
                  className={clsx(
                    "rounded px-1.5 py-px text-[10px] font-bold tabular-nums",
                    MATCH_SIMILARITY_TAB_COUNT[option.id],
                  )}
                >
                  {activeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}

function buildSummaryCards(
  counts: NormalizedStagingBlacklistCounts,
): ProviderStagingSummaryCardConfig<
  ExclusionStagingMainTab,
  ExclusionStagingSubTab
>[] {
  return [
    {
      key: "total",
      label: "Total",
      headerClass: "bg-blue-500",
      activeRingClass: CARD_ACTIVE_RING.total,
      total: counts.totalReceived,
      sections: [
        {
          key: "success",
          label: "Total Excluded Providers",
          count: counts.validCount,
        },
        { key: "fail", label: "Validation Failed", count: counts.invalidCount },
      ],
    },
    {
      key: "process",
      label: "Processed",
      headerClass: "bg-amber-500",
      activeRingClass: CARD_ACTIVE_RING.process,
      total: counts.validCount,
      sections: [
        {
          key: "processedNew",
          label: "New",
          count: counts.processedNewCount,
        },
        {
          key: "processedExisting",
          label: "Existing",
          count: counts.processedExistingCount,
        },
        {
          key: "partialMatch",
          label: "Partial Match",
          count: counts.partialMatchCount,
        },
        {
          key: "notFound",
          label: "Not Found",
          count: counts.notFoundCount,
        },
        {
          key: "convertedToInactive",
          label: "Removed from Exclusions",
          count: counts.convertedToInactiveCount,
        },
        {
          key: "pending",
          label: "Pending for Processing",
          count: counts.pendingCount,
        },
        {
          key: "processFail",
          label: "Processing Failed",
          count: counts.failedCount,
        },
      ],
    },
  ];
}

function getExclusionStagingGridColumns(
  showReasonColumn = false,
  rohiniHeaderName = "Rohini Number",
  showSimilarityScoreColumn = false,
  showRemarkColumn = false,
  useBlacklistEffectiveFrom = false,
  onShowMatches?: (args: PartialMatchDialogArgs) => void,
) {
  const columns: ExclusionStagingColumn[] = [
    {
      field: "providerName",
      headerName: "Provider Name",
      flex: 1.3,
      minWidth: 160,
      sortable: true,
      filter: false,
    },
    {
      field: "providerIibRohiniCode",
      headerName: rohiniHeaderName,
      flex: 0.9,
      minWidth: 130,
      sortable: true,
      filter: false,
      valueFormatter: (params) => {
        const value = String(params.value ?? "").trim();
        if (!value || /^no\s+rohini(\s+id)?$/i.test(value)) return "";
        return value;
      },
    },
  ];

  if (showSimilarityScoreColumn) {
    columns.push({
      field: "matchSimilarityScore",
      headerName: "Match Score",
      flex: 0.95,
      minWidth: 130,
      sortable: true,
      filter: false,
      cellRenderer: (params) => (
        <MatchSimilarityScoreCell
          value={
            typeof params.value === "number"
              ? params.value
              : params.data?.matchSimilarityScore
          }
          stagingId={
            params.data?.providerBlacklistStagingId || params.data?.id
          }
          providerName={params.data?.providerName}
          address={params.data?.providerAddress}
          city={params.data?.providerAddressCity}
          state={params.data?.providerAddressState}
          pincode={params.data?.providerAddressPostalCode}
          onShowMatches={onShowMatches}
        />
      ),
    });
  }

  columns.push(
    {
      field: "providerAddressState",
      headerName: "State",
      flex: 1.1,
      minWidth: 140,
      sortable: true,
      filter: false,
      tooltipField: "providerAddressState",
    },
    {
      field: "providerAddressCity",
      headerName: "City",
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: false,
      tooltipField: "providerAddressCity",
    },
    {
      field: "providerAddressPostalCode",
      headerName: "Pincode",
      flex: 0.75,
      minWidth: 100,
      sortable: true,
      filter: false,
    },
    {
      field: useBlacklistEffectiveFrom
        ? "providerBlacklistEffectiveFrom"
        : "providerBlacklistStartDate",
      headerName: "Effective From",
      flex: 1.1,
      minWidth: 160,
      sortable: true,
      filter: false,
      valueFormatter: (params) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "providerAddress",
      headerName: "Address",
      flex: 1.6,
      minWidth: 200,
      sortable: true,
      filter: false,
      tooltipField: "providerAddress",
    },
  );

  if (showRemarkColumn) {
    columns.push({
      field: "providerStatusReason",
      headerName: "Remark",
      flex: 1.8,
      minWidth: 260,
      sortable: true,
      filter: false,
      tooltipField: "providerStatusReason",
    });
  }

  if (showReasonColumn) {
    columns.push({
      field: "providerStatusReason",
      headerName: "Reason",
      flex: 1.4,
      minWidth: 220,
      sortable: false,
      filter: false,
      tooltipField: "providerStatusReason",
      wrapText: false,
      autoHeight: false,
    });
  }

  return applyBulkIcMappingGridCellStyle(columns);
}

export function ProviderExclusionSummary({
  inwardNo,
  documentType,
}: Readonly<Props>) {
  const { t } = useTranslation();
  const [isSearchOpen, { toggle: toggleSearch }] = useDisclosure(false);
  const [searchSubmitting, setSearchSubmitting] = useState(false);
  const [matchDialog, setMatchDialog] = useState<PartialMatchDialogArgs | null>(
    null,
  );

  const { suppressStagingErrorToast, showNoBlacklistJobError, showStagingDetails } =
    useExclusionJobGate(inwardNo);

  const {
    filteredRows,
    counts,
    activeMainTab,
    activeSubTab,
    partialMatchBand,
    activeListingMode,
    handleListingModeChange,
    handleTabSelect,
    handlePartialMatchBandChange,
    handleSearch,
    page,
    pageSize,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
    reloadStagingRows,
    loading,
  } = useExclusionStagingList(inwardNo, documentType, {
    suppressErrorToast: suppressStagingErrorToast,
    enabled: showStagingDetails,
  });

  const viewFlags = resolveExclusionSummaryViewFlags(activeMainTab, activeSubTab);
  const notFoundBulk = useNotFoundBulkSubmit({
    isNotFoundTab: viewFlags.isNotFoundTab,
    filteredRows,
    reloadStagingRows,
    t,
  });
  const searchFields = useExclusionStagingSearchFields(t);

  const listingModeOptions: Array<{
    id: ExclusionStagingListingMode;
    label: string;
  }> = [
    {
      id: "blacklisted",
      label: t("providerMaster.excludedProvider.uploadDialog.excluded", {
        defaultValue: "Excluded",
      }),
    },
    {
      id: "watchlisted",
      label: t("providerMaster.excludedProvider.uploadDialog.watchlisted", {
        defaultValue: "Watchlisted",
      }),
    },
  ];

  const rohiniHeaderName = t("providerMaster.addForm.rohiniNumber", {
    defaultValue: "Rohini Number",
  });

  const columnDefs = useMemo(
    () =>
      getExclusionStagingGridColumns(
        viewFlags.showReasonColumn,
        rohiniHeaderName,
        viewFlags.showSimilarityScoreColumn,
        viewFlags.showRemarkColumn,
        viewFlags.useBlacklistEffectiveFrom,
        setMatchDialog,
      ),
    [
      rohiniHeaderName,
      viewFlags.showReasonColumn,
      viewFlags.showRemarkColumn,
      viewFlags.showSimilarityScoreColumn,
      viewFlags.useBlacklistEffectiveFrom,
    ],
  );

  const handleSearchSubmit = async (data: Record<string, unknown>) => {
    setSearchSubmitting(true);
    try {
      handleSearch(data);
    } finally {
      setSearchSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-hidden">
      <ProviderJobProcessingPanel
        inwardNo={inwardNo}
        statusSource="blacklist-job"
      />

      {showNoBlacklistJobError ? (
        <NoBlacklistJobErrorBanner inwardNo={inwardNo} />
      ) : null}

      {showStagingDetails ? (
        <ExclusionStagingDetailsPanel
          t={t}
          viewFlags={viewFlags}
          summaryCards={buildSummaryCards(counts)}
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
          onTabSelect={handleTabSelect}
          isSearchOpen={isSearchOpen}
          toggleSearch={toggleSearch}
          searchSubmitting={searchSubmitting}
          searchFields={searchFields}
          onSearchSubmit={handleSearchSubmit}
          onSearchReset={notFoundBulk.clearSelectedStagingIds}
          partialMatchBand={partialMatchBand}
          totalItems={totalItems}
          onPartialMatchBandChange={handlePartialMatchBandChange}
          listingModeOptions={listingModeOptions}
          activeListingMode={activeListingMode}
          onListingModeChange={handleListingModeChange}
          submittingNotFound={notFoundBulk.submittingNotFound}
          selectedStagingCount={notFoundBulk.selectedStagingIds.size}
          onNotFoundSubmitClick={notFoundBulk.openNotFoundSubmitConfirm}
          filteredRows={filteredRows}
          columnDefs={columnDefs}
          loading={loading}
          onNotFoundRowsSelected={notFoundBulk.handleNotFoundRowsSelected}
          selectedStagingIds={notFoundBulk.selectedStagingIds}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          partialMatchBands={PartialMatchSimilarityBands}
        />
      ) : null}

      <PartialMatchCandidatesDialog
        open={matchDialog != null}
        stagingId={matchDialog?.stagingId ?? ""}
        sourceProviderName={matchDialog?.providerName}
        sourceAddress={matchDialog?.address}
        sourceCity={matchDialog?.city}
        sourceState={matchDialog?.state}
        sourcePincode={matchDialog?.pincode}
        similarityBand={partialMatchBand}
        onClose={() => setMatchDialog(null)}
        onSuccess={() => {
          reloadStagingRows().catch(() => undefined);
        }}
      />

      <AlertDialog
        type="partial"
        isOpen={notFoundBulk.confirmNotFoundSubmitOpen}
        onClose={notFoundBulk.closeNotFoundSubmitConfirm}
        onConfirm={notFoundBulk.handleNotFoundSubmit}
        title={t(
          "providerMaster.excludedProvider.inward.notFoundBulkConfirmTitle",
          { defaultValue: "Confirm Submit" },
        )}
        message={t(
          "providerMaster.excludedProvider.inward.notFoundBulkConfirmMessage",
          {
            defaultValue:
              "Selected records are not found. Do you want to create them as new providers?",
          },
        )}
        confirmText={
          notFoundBulk.submittingNotFound
            ? t(
                "providerMaster.excludedProvider.inward.notFoundBulkSubmitting",
                { defaultValue: "Submitting..." },
              )
            : t("providerMaster.excludedProvider.uploadDialog.submit", {
                defaultValue: "Submit",
              })
        }
        closeText={t("providerMaster.button.cancel", { defaultValue: "Cancel" })}
        confirmDisabled={notFoundBulk.submittingNotFound}
        hideCloseIcon={notFoundBulk.submittingNotFound}
      />
    </div>
  );
}
