import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
  createProvidersFromStagingBlacklist,
  type StagingBlacklistCreateResult,
} from "@/store/features/excludedProvider/excludedProviderAPI";
import type { NormalizedStagingBlacklistRow } from "@/store/features/excludedProvider/exclusionStagingNormalizer";
import type { SearchField } from "../../../shared/providerShell";
import { showProviderError } from "../../../shared/ProviderAlertDialog";
import { isProviderJobStillProcessing } from "../../ic-corporate-mapping/job/progressUtils";
import { useProviderJobStatus } from "../../ic-corporate-mapping/job/useStatus";
import {
  isExclusionStagingFailView,
  type ExclusionStagingMainTab,
  type ExclusionStagingSubTab,
} from "./useExclusionStagingList";

export type PartialMatchDialogArgs = {
  stagingId: string;
  providerName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type ExclusionSummaryViewFlags = {
  showPartialMatchBands: boolean;
  isNotFoundTab: boolean;
  showReasonColumn: boolean;
  showSimilarityScoreColumn: boolean;
  showRemarkColumn: boolean;
  useBlacklistEffectiveFrom: boolean;
};

export function resolveExclusionSummaryViewFlags(
  activeMainTab: ExclusionStagingMainTab,
  activeSubTab: ExclusionStagingSubTab,
): ExclusionSummaryViewFlags {
  const isProcessPartialMatch =
    activeMainTab === "process" && activeSubTab === "partialMatch";
  return {
    showPartialMatchBands: isProcessPartialMatch,
    isNotFoundTab: activeMainTab === "process" && activeSubTab === "notFound",
    showReasonColumn: isExclusionStagingFailView(activeMainTab, activeSubTab),
    showSimilarityScoreColumn: isProcessPartialMatch,
    showRemarkColumn: isProcessPartialMatch,
    useBlacklistEffectiveFrom:
      activeMainTab === "process" && activeSubTab === "convertedToInactive",
  };
}

export function useExclusionJobGate(inwardNo: string) {
  const {
    data: providerJobStatus,
    isLoading: isProviderJobStatusLoading,
    isFetched: isProviderJobStatusFetched,
    isSuccess: isProviderJobStatusSuccess,
  } = useProviderJobStatus(inwardNo, { source: "blacklist-job" });

  const suppressStagingErrorToast =
    isProviderJobStatusLoading || providerJobStatus?.jobStatus === "FAILED";

  const showNoBlacklistJobError =
    isProviderJobStatusFetched &&
    isProviderJobStatusSuccess &&
    !isProviderJobStatusLoading &&
    providerJobStatus == null;

  const showStagingDetails = !isProviderJobStillProcessing(
    providerJobStatus,
    isProviderJobStatusLoading,
  );

  return {
    suppressStagingErrorToast,
    showNoBlacklistJobError,
    showStagingDetails,
  };
}

function updateSelectedStagingIdsAfterSubmit(
  result: StagingBlacklistCreateResult,
  setSelectedStagingIds: Dispatch<SetStateAction<Set<string>>>,
) {
  if (!result.ok || result.failedCount <= 0) {
    setSelectedStagingIds(new Set());
    return;
  }

  const failedIds = new Set(
    result.items
      .filter((item) => /FAIL/i.test(item.status))
      .map((item) => item.stagingId),
  );
  const successIds = new Set(
    result.items
      .filter((item) => /^(CREATED|SUCCESS|PROCESSED)$/i.test(item.status))
      .map((item) => item.stagingId),
  );

  setSelectedStagingIds((prev) => {
    const next = new Set(prev);
    for (const id of successIds) next.delete(id);
    if (failedIds.size === 0 && successIds.size === 0) {
      return new Set();
    }
    return next;
  });
}

function notifyNotFoundBulkSubmitResult(
  result: StagingBlacklistCreateResult,
  t: TFunction,
) {
  if (!result.ok) return;

  const createdCount = result.createdCount;
  const failedCount = result.failedCount;

  if (failedCount > 0) {
    const partialMessage =
      failedCount === 1
        ? t("providerMaster.excludedProvider.inward.notFoundBulkPartialSuccess", {
            defaultValue:
              "{{created}} records submitted successfully and {{failed}} record failed.",
            created: createdCount,
            failed: failedCount,
          })
        : t(
            "providerMaster.excludedProvider.inward.notFoundBulkPartialSuccessPlural",
            {
              defaultValue:
                "{{created}} records submitted successfully and {{failed}} records failed.",
              created: createdCount,
              failed: failedCount,
            },
          );
    toast.warning(partialMessage, { position: "top-right", duration: 5000 });
    return;
  }

  toast.success(
    result.message?.trim() ||
      t("providerMaster.excludedProvider.inward.notFoundBulkSubmitSuccess", {
        defaultValue: "Selected Not Found records submitted successfully.",
      }),
    { position: "top-right", duration: 4000 },
  );
}

export function useNotFoundBulkSubmit(args: {
  isNotFoundTab: boolean;
  filteredRows: NormalizedStagingBlacklistRow[];
  reloadStagingRows: () => Promise<void>;
  t: TFunction;
}) {
  const { isNotFoundTab, filteredRows, reloadStagingRows, t } = args;
  const [selectedStagingIds, setSelectedStagingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [submittingNotFound, setSubmittingNotFound] = useState(false);
  const [confirmNotFoundSubmitOpen, setConfirmNotFoundSubmitOpen] =
    useState(false);

  useEffect(() => {
    if (!isNotFoundTab) {
      setSelectedStagingIds(new Set());
      setSubmittingNotFound(false);
      setConfirmNotFoundSubmitOpen(false);
    }
  }, [isNotFoundTab]);

  const handleNotFoundRowsSelected = useCallback(
    (rows: NormalizedStagingBlacklistRow[]) => {
      setSelectedStagingIds((prev) => {
        const pageIds = new Set(
          filteredRows
            .map((row) => String(row.providerBlacklistStagingId ?? "").trim())
            .filter(Boolean),
        );
        const next = new Set(prev);
        for (const id of pageIds) next.delete(id);
        for (const row of rows) {
          const id = String(row.providerBlacklistStagingId ?? "").trim();
          if (id) next.add(id);
        }
        if (next.size === prev.size && [...next].every((id) => prev.has(id))) {
          return prev;
        }
        return next;
      });
    },
    [filteredRows],
  );

  const clearSelectedStagingIds = useCallback(() => {
    setSelectedStagingIds((prev) => (prev.size === 0 ? prev : new Set()));
  }, []);

  const openNotFoundSubmitConfirm = useCallback(() => {
    if (!isNotFoundTab || submittingNotFound || selectedStagingIds.size === 0) {
      return;
    }
    setConfirmNotFoundSubmitOpen(true);
  }, [isNotFoundTab, selectedStagingIds.size, submittingNotFound]);

  const closeNotFoundSubmitConfirm = useCallback(() => {
    if (submittingNotFound) return;
    setConfirmNotFoundSubmitOpen(false);
  }, [submittingNotFound]);

  const handleNotFoundSubmit = useCallback(async () => {
    if (!isNotFoundTab || submittingNotFound) return;
    const stagingIds = Array.from(selectedStagingIds);
    if (stagingIds.length === 0) return;

    setSubmittingNotFound(true);
    try {
      const result = await createProvidersFromStagingBlacklist(stagingIds);
      if (!result.ok) {
        showProviderError(
          result.message ??
            t("providerMaster.excludedProvider.inward.notFoundBulkSubmitFailed", {
              defaultValue:
                "Unable to submit the selected records. Please try again.",
            }),
          "Error",
          result.status,
        );
        return;
      }

      notifyNotFoundBulkSubmitResult(result, t);
      if (result.failedCount > 0) {
        updateSelectedStagingIdsAfterSubmit(result, setSelectedStagingIds);
      } else {
        setSelectedStagingIds(new Set());
      }

      await reloadStagingRows();
    } catch (err: unknown) {
      showProviderError(
        err instanceof Error && err.message.trim()
          ? err.message
          : t("providerMaster.excludedProvider.inward.notFoundBulkSubmitFailed", {
              defaultValue:
                "Unable to submit the selected records. Please try again.",
            }),
      );
    } finally {
      setSubmittingNotFound(false);
      setConfirmNotFoundSubmitOpen(false);
    }
  }, [
    isNotFoundTab,
    reloadStagingRows,
    selectedStagingIds,
    submittingNotFound,
    t,
  ]);

  return {
    selectedStagingIds,
    submittingNotFound,
    confirmNotFoundSubmitOpen,
    handleNotFoundRowsSelected,
    clearSelectedStagingIds,
    openNotFoundSubmitConfirm,
    closeNotFoundSubmitConfirm,
    handleNotFoundSubmit,
  };
}

export function useExclusionStagingSearchFields(t: TFunction) {
  const stateList = useAppSelector((state) => state.stateCity.stateList);
  const stateOptions = useMemo(
    () =>
      stateList.map((item) => ({
        label: item.stateName,
        value: item.stateName,
      })),
    [stateList],
  );

  return useMemo<SearchField[]>(
    () => [
      {
        name: "providerName",
        label: t("providerMaster.excludedProvider.view.providerName"),
        type: "text",
      },
      {
        name: "pincode",
        label: t("providerMaster.addForm.pincode"),
        type: "text",
        numericOnly: true,
      },
      {
        name: "state",
        label: t("providerMaster.addForm.state"),
        type: "dropdown",
        options: stateOptions,
        allowCustomValue: true,
      },
      {
        name: "city",
        label: t("providerMaster.addForm.city"),
        type: "dropdown",
        options: [],
        allowCustomValue: true,
      },
    ],
    [stateOptions, t],
  );
}
