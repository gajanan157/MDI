import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  BankDetailsComparisonModal,
  useBankComparisonFieldLabels,
} from "../../../shared/bankDetailsComparison";
import type { BankComparisonRow } from "../../../shared/bankDetailsComparison";
import { Pagination, PROVIDER_GRID_PAGE_SIZE_OPTIONS } from "../../../shared/providerShell";
import { ProviderJobProcessingPanel } from "../../ic-corporate-mapping/job/ProcessingPanel";
import { isProviderJobTerminalStatus } from "../../ic-corporate-mapping/job/progressUtils";
import { useProviderJobStatus } from "../../ic-corporate-mapping/job/useStatus";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchStagingBankComparison } from "@/store/features/bulkBankDetails/bulkBankDetailsSlice";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import type { BankVerificationInwardRow } from "../inwardTypes";
import { readBulkBankDetailsPersistedInsurerId } from "../upload";
import { ResultsGridSection } from "./ResultsGridSection";
import { VerificationSummaryCards } from "./SummaryCards";
import type { BankVerificationResultRow } from "./types";
import { useBankVerificationStagingList } from "./useList";

type VerificationResultsViewProps = {
  inward: BankVerificationInwardRow;
};

export function VerificationResultsView({ inward }: Readonly<VerificationResultsViewProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fieldLabels = useBankComparisonFieldLabels(t);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareRows, setCompareRows] = useState<BankComparisonRow[]>([]);
  const [compareSubtitle, setCompareSubtitle] = useState("");
  const [compareInsurerLabel, setCompareInsurerLabel] = useState("");

  const insurerId =
    inward.insurerId.trim() ||
    inward.configuredIcId.trim() ||
    readBulkBankDetailsPersistedInsurerId(inward.inwardNo);

  const {
    data: providerJobStatus,
    isLoading: isProviderJobStatusLoading,
    isFetched: isProviderJobStatusFetched,
    isSuccess: isProviderJobStatusSuccess,
  } = useProviderJobStatus(inward.inwardNo, { source: "provider-bank-job" });

  const suppressStagingErrorToast =
    isProviderJobStatusLoading || providerJobStatus?.jobStatus === "FAILED";

  // The bulk bank details staging list only has meaningful data once the
  // provider bank job has reached a terminal state (jobStatus is the source
  // of truth — a step can report COMPLETED slightly before the job does).
  // For inwards with no tracked job at all, load it as soon as we know that.
  const jobNotFound =
    isProviderJobStatusFetched &&
    isProviderJobStatusSuccess &&
    !isProviderJobStatusLoading &&
    providerJobStatus == null;
  const canLoadStagingResults =
    jobNotFound ||
    (providerJobStatus != null && isProviderJobTerminalStatus(providerJobStatus.jobStatus));

  const {
    rows,
    counts,
    activeFilter,
    handleFilterChange,
    page,
    pageSize,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
    loading,
  } = useBankVerificationStagingList(inward.inwardNo, {
    insurerId: insurerId || undefined,
    suppressErrorToast: suppressStagingErrorToast,
    enabled: canLoadStagingResults,
  });

  const summaryCounts = useMemo(
    () => ({
      ...counts,
      validationFailedCount:
        counts.validationFailedCount || providerJobStatus?.validationFailedCount || 0,
      processingFailedCount:
        counts.processingFailedCount || providerJobStatus?.processingFailedCount || 0,
    }),
    [counts, providerJobStatus],
  );

  const pagedRows = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        uiSerialNo: (page - 1) * pageSize + index + 1,
      })),
    [page, pageSize, rows],
  );

  const openCompareModal = useCallback(
    async (row: BankVerificationResultRow) => {
      const stagingId = row.id.trim();
      if (!stagingId) {
        showProviderError(t("providerMaster.bankVerification.results.comparisonMissingId"));
        return;
      }

      setCompareInsurerLabel(
        t("providerMaster.bankDetailsComparison.insurerColumnWithName", {
          name: inward.insurerName,
        }),
      );
      setCompareSubtitle(row.providerName);
      setCompareRows([]);
      setCompareOpen(true);
      setCompareLoading(true);

      try {
        const result = await dispatch(
          fetchStagingBankComparison({
            stagingBankProviderInsurerId: stagingId,
            fieldLabels,
          }),
        ).unwrap();
        setCompareRows(result.rows);
        if (result.providerName) {
          setCompareSubtitle(result.providerName);
        }
        const insurerDisplayName =
          result.insurerName || result.insurerCode || inward.insurerName;
        if (insurerDisplayName) {
          setCompareInsurerLabel(
            t("providerMaster.bankDetailsComparison.insurerColumnWithName", {
              name: insurerDisplayName,
            }),
          );
        }
      } catch (err) {
        const message =
          typeof err === "string" && err.trim()
            ? err
            : t("providerMaster.bankVerification.results.comparisonFailed");
        showProviderError(message);
        setCompareOpen(false);
      } finally {
        setCompareLoading(false);
      }
    },
    [dispatch, fieldLabels, inward.insurerName, t],
  );

  const onViewRow = useCallback(
    (row: BankVerificationResultRow) => {
      openCompareModal(row).catch(() => undefined);
    },
    [openCompareModal],
  );

  const onEmailRow = useCallback(
    (row: BankVerificationResultRow) => {
      toast.info(
        t("providerMaster.bankVerification.results.emailRow", {
          providerName: row.providerName,
        }),
        { position: "top-right" },
      );
    },
    [t],
  );

  const showStagingDetails = canLoadStagingResults;
  const showNoProviderJobError = jobNotFound;

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-hidden p-1">
        <ProviderJobProcessingPanel
          inwardNo={inward.inwardNo}
          statusSource="provider-bank-job"
        />

        {showNoProviderJobError ? (
          <p className="px-1 text-[11px] text-amber-700">
            {t("providerMaster.bankVerification.results.noJobFound")}
          </p>
        ) : null}

        {showStagingDetails ? (
          <>
            <VerificationSummaryCards
              counts={summaryCounts}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              t={t}
            />

            <div className="bulk-ic-mapping-grid relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
              {loading ? (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : null}
              <ResultsGridSection
                rowData={pagedRows}
                t={t}
                activeFilter={activeFilter}
                onViewRow={onViewRow}
                onEmailRow={onEmailRow}
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

      <BankDetailsComparisonModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        rows={compareRows}
        loading={compareLoading}
        subtitle={compareSubtitle || undefined}
        providerColumnLabel={t("providerMaster.bankDetailsComparison.providerColumnDefault")}
        insurerColumnLabel={compareInsurerLabel}
      />
    </>
  );
}
