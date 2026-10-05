import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { useProviderGridPagination } from "@/app/pages/dashboards/providerManagernt/shared/useProviderGridPagination";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchExclusionStagingList } from "@/store/features/excludedProvider/excludedProviderSlice";
import type {
    ExclusionStagingListingMode,
    NormalizedStagingBlacklistCounts,
    NormalizedStagingBlacklistRow,
} from "@/store/features/excludedProvider/exclusionStagingNormalizer";
import {
    EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
    EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
} from "../config";

export type ExclusionStagingMainTab = "total" | "process";

export type ExclusionStagingSubTab =
    | "success"
    | "fail"
    | "processed"
    | "processedNew"
    | "processedExisting"
    | "partialMatch"
    | "notFound"
    | "convertedToInactive"
    | "processFail"
    | "pending";

/** Sub-filters under Partial Match (All / similarity %). */
export type PartialMatchSimilarityBand = "all" | "50To70" | "71To90" | "91To100";

export type { ExclusionStagingListingMode };

const STAGING_BLACKLIST_API_STATUS = {
    COMPLETED: "COMPLETED",
    PENDING: "PENDING",
    FAILED: "FAILED",
    VALIDATION_FAILED: "VALIDATION_FAILED",
    PROCESSED_NEW: "PROCESSED_NEW",
    PROCESSED_EXISTING: "PROCESSED_EXISTING",
    PARTIAL_MATCH: "PARTIAL_MATCH",
    NOT_FOUND: "NOT_FOUND",
    CONVERTED_TO_INACTIVE: "CONVERTED_TO_INACTIVE",
} as const;

/** Similarity bands for Partial Match sub-filters (decimal scores). */
const PARTIAL_MATCH_SIMILARITY = {
    band50To70: { min: 0.5, max: 0.7 },
    band71To90: { min: 0.71, max: 0.9 },
    band91To100: { min: 0.91, max: 1 },
} as const;

type StagingBlacklistListFilter = {
    stagingStatus?: string;
    isValid?: boolean;
    minMatchSimilarityScore?: number;
    maxMatchSimilarityScore?: number;
};

function resolveListingModeFromDocumentType(
    documentType: string,
): ExclusionStagingListingMode {
    return documentType.trim() === EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST
        ? "watchlisted"
        : "blacklisted";
}

function resolveRestrictionTypeFromListingMode(
    mode: ExclusionStagingListingMode,
): string {
    return mode === "watchlisted"
        ? EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST
        : EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION;
}

export function isExclusionStagingFailView(
    mainTab: ExclusionStagingMainTab,
    subTab: ExclusionStagingSubTab,
): boolean {
    return (
        (mainTab === "total" && subTab === "fail") ||
        (mainTab === "process" &&
            (subTab === "processFail" || subTab === "notFound"))
    );
}

function getPartialMatchScoreFilter(
    band: PartialMatchSimilarityBand,
): Pick<
    StagingBlacklistListFilter,
    "minMatchSimilarityScore" | "maxMatchSimilarityScore"
> {
    if (band === "50To70") {
        return {
            minMatchSimilarityScore: PARTIAL_MATCH_SIMILARITY.band50To70.min,
            maxMatchSimilarityScore: PARTIAL_MATCH_SIMILARITY.band50To70.max,
        };
    }
    if (band === "71To90") {
        return {
            minMatchSimilarityScore: PARTIAL_MATCH_SIMILARITY.band71To90.min,
            maxMatchSimilarityScore: PARTIAL_MATCH_SIMILARITY.band71To90.max,
        };
    }
    if (band === "91To100") {
        return {
            minMatchSimilarityScore: PARTIAL_MATCH_SIMILARITY.band91To100.min,
            maxMatchSimilarityScore: PARTIAL_MATCH_SIMILARITY.band91To100.max,
        };
    }
    return {};
}

function getStagingBlacklistStatusFilter(
    mainTab: ExclusionStagingMainTab,
    subTab: ExclusionStagingSubTab,
    partialMatchBand: PartialMatchSimilarityBand,
): StagingBlacklistListFilter | undefined {
    if (mainTab === "total") {
        if (subTab === "success") {
            return { isValid: true };
        }
        if (subTab === "fail") {
            return { stagingStatus: STAGING_BLACKLIST_API_STATUS.VALIDATION_FAILED };
        }
        return undefined;
    }

    if (subTab === "processed" || subTab === "processedNew") {
        return { stagingStatus: STAGING_BLACKLIST_API_STATUS.PROCESSED_NEW };
    }
    if (subTab === "processedExisting") {
        return { stagingStatus: STAGING_BLACKLIST_API_STATUS.PROCESSED_EXISTING };
    }
    if (subTab === "partialMatch") {
        const scoreFilter = getPartialMatchScoreFilter(partialMatchBand);
        // 91–100 band: score range only — do not send stagingStatus.
        if (partialMatchBand === "91To100") {
            return { ...scoreFilter };
        }
        return {
            stagingStatus: STAGING_BLACKLIST_API_STATUS.PARTIAL_MATCH,
            ...scoreFilter,
        };
    }
    if (subTab === "notFound") {
        return { stagingStatus: STAGING_BLACKLIST_API_STATUS.NOT_FOUND };
    }
    if (subTab === "convertedToInactive") {
        return { stagingStatus: STAGING_BLACKLIST_API_STATUS.CONVERTED_TO_INACTIVE };
    }
    if (subTab === "processFail") {
        return { stagingStatus: STAGING_BLACKLIST_API_STATUS.FAILED };
    }
    if (subTab === "pending") {
        return { stagingStatus: STAGING_BLACKLIST_API_STATUS.PENDING };
    }

    return { stagingStatus: STAGING_BLACKLIST_API_STATUS.COMPLETED };
}

export type ExclusionStagingFilters = {
    providerName: string;
    state: string;
    city: string;
    pincode: string;
};

const EMPTY_FILTERS: ExclusionStagingFilters = {
    providerName: "",
    state: "",
    city: "",
    pincode: "",
};

const EMPTY_COUNTS: NormalizedStagingBlacklistCounts = {
    totalReceived: 0,
    validCount: 0,
    invalidCount: 0,
    pendingCount: 0,
    notFoundCount: 0,
    processedNewCount: 0,
    processedExistingCount: 0,
    failedCount: 0,
    processedCount: 0,
    convertedToInactiveCount: 0,
    partialMatchCount: 0,
    partialMatch50To70Count: 0,
    partialMatch70To90Count: 0,
};

export type UseExclusionStagingListOptions = {
    /** When job failed, error is shown in the job card — skip duplicate list toasts. */
    suppressErrorToast?: boolean;
    /** When false, skip staging list fetch (e.g. while job status is still loading/processing). */
    enabled?: boolean;
};

export function useExclusionStagingList(
    inwardNo: string,
    documentType: string,
    options: UseExclusionStagingListOptions = {},
) {
    const dispatch = useAppDispatch();
    const { suppressErrorToast = false, enabled = true } = options;
    const suppressErrorToastRef = useRef(suppressErrorToast);
    suppressErrorToastRef.current = suppressErrorToast;

    const {
        page,
        pageSize,
        resetPage,
        handlePageChange,
        handlePageSizeChange,
    } = useProviderGridPagination();
    const [appliedFilters, setAppliedFilters] =
        useState<ExclusionStagingFilters>(EMPTY_FILTERS);
    const [activeMainTab, setActiveMainTab] =
        useState<ExclusionStagingMainTab>("total");
    const [activeSubTab, setActiveSubTab] =
        useState<ExclusionStagingSubTab>("success");
    const [partialMatchBand, setPartialMatchBand] =
        useState<PartialMatchSimilarityBand>("all");
    const [activeListingMode, setActiveListingMode] =
        useState<ExclusionStagingListingMode>(() =>
            resolveListingModeFromDocumentType(documentType),
        );
    const [rows, setRows] = useState<NormalizedStagingBlacklistRow[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [counts, setCounts] =
        useState<NormalizedStagingBlacklistCounts>(EMPTY_COUNTS);
    const [loading, setLoading] = useState(false);

    const restrictionType = useMemo(
        () => resolveRestrictionTypeFromListingMode(activeListingMode),
        [activeListingMode],
    );

    const statusFilter = useMemo(
        () =>
            getStagingBlacklistStatusFilter(
                activeMainTab,
                activeSubTab,
                partialMatchBand,
            ),
        [activeMainTab, activeSubTab, partialMatchBand],
    );

    const loadStagingRows = useCallback(async () => {
        if (!enabled || !inwardNo.trim()) return;

        setLoading(true);
        try {
            const providerName = appliedFilters.providerName.trim();
            const state = appliedFilters.state.trim();
            const city = appliedFilters.city.trim();
            const pincode = appliedFilters.pincode.trim();

            const result = await dispatch(
                fetchExclusionStagingList({
                    inwardNo,
                    restrictionType,
                    listingMode: activeListingMode,
                    page,
                    size: pageSize,
                    stagingStatus: statusFilter?.stagingStatus,
                    isValid: statusFilter?.isValid,
                    minMatchSimilarityScore: statusFilter?.minMatchSimilarityScore,
                    maxMatchSimilarityScore: statusFilter?.maxMatchSimilarityScore,
                    providerName: providerName || undefined,
                    state: state || undefined,
                    city: city || undefined,
                    pincode: pincode || undefined,
                    includeConvertedToInactiveRecords:
                        activeSubTab === "convertedToInactive" ? true : undefined,
                }),
            ).unwrap();

            setRows(result.rows);
            setTotalRecords(result.totalRecords);
            setCounts(result.counts);
        } catch (err) {
            let message = "";
            if (typeof err === "string") {
                message = err;
            } else if (err instanceof Error) {
                message = err.message;
            }
            if (message && !suppressErrorToastRef.current) {
                showProviderError(message);
            }
            setRows([]);
            setTotalRecords(0);
            setCounts(EMPTY_COUNTS);
        } finally {
            setLoading(false);
        }
    }, [
        activeListingMode,
        activeSubTab,
        appliedFilters,
        dispatch,
        enabled,
        inwardNo,
        page,
        pageSize,
        restrictionType,
        statusFilter,
    ]);

    useEffect(() => {
        setActiveListingMode(resolveListingModeFromDocumentType(documentType));
    }, [documentType]);

    useEffect(() => {
        if (!enabled) return;
        loadStagingRows().catch(() => undefined);
    }, [enabled, loadStagingRows]);

    const handleSearch = useCallback(
        (data: Record<string, unknown>) => {
            setAppliedFilters({
                providerName: String(data.providerName ?? "").trim(),
                state: String(data.state ?? "").trim(),
                city: String(data.city ?? "").trim(),
                pincode: String(data.pincode ?? "")
                    .replace(/\D/g, "")
                    .trim(),
            });
            resetPage();
        },
        [resetPage],
    );

    const handleTabSelect = useCallback(
        (mainTab: ExclusionStagingMainTab, subTab: ExclusionStagingSubTab) => {
            setActiveMainTab(mainTab);
            setActiveSubTab(subTab);
            if (subTab === "partialMatch") {
                setPartialMatchBand("all");
            }
            resetPage();
        },
        [resetPage],
    );

    const handlePartialMatchBandChange = useCallback(
        (band: PartialMatchSimilarityBand) => {
            setPartialMatchBand(band);
            resetPage();
        },
        [resetPage],
    );

    const handleListingModeChange = useCallback(
        (mode: ExclusionStagingListingMode) => {
            setActiveListingMode(mode);
            setActiveMainTab("total");
            setActiveSubTab("success");
            setPartialMatchBand("all");
            resetPage();
        },
        [resetPage],
    );

    return {
        page,
        pageSize,
        totalItems: totalRecords,
        filteredRows: rows,
        counts,
        activeMainTab,
        activeSubTab,
        partialMatchBand,
        activeListingMode,
        handleListingModeChange,
        handleTabSelect,
        handlePartialMatchBandChange,
        handleSearch,
        handlePageChange,
        handlePageSizeChange,
        reloadStagingRows: loadStagingRows,
        loading,
    };
}
