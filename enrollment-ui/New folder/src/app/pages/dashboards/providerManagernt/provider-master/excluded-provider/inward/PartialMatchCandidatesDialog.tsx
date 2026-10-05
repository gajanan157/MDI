import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HashtagIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import AlertDialog from "@/components/shared/dialog/AlertDialog/AlertDialog";
import { ConfigFormDialog } from "@/components/shared/dialog/commonDialog";
import { Button, GhostSpinner } from "@/components/ui";
import {
  getStagingBlacklistPartialMatchCandidates,
  matchStagingProviderBlacklist,
  postStagingProviderBlacklistNotFound,
} from "@/store/features/excludedProvider/excludedProviderAPI";
import {
  formatMatchSimilarityPercent,
  type NormalizedPartialMatchCandidate,
} from "@/store/features/excludedProvider/exclusionStagingNormalizer";
import type { PartialMatchSimilarityBand } from "./useExclusionStagingList";
import { showProviderError } from "../../../shared/ProviderAlertDialog";
import { applyBulkIcMappingGridCellStyle } from "../../ic-corporate-mapping/config";
import {
  AgGridSuperWrapper,
  PROVIDER_DRAWER_DIALOG_Z_INDEX_CLASS,
  PROVIDER_GRID_DEFAULT_PAGE_SIZE,
  PROVIDER_GRID_PAGE_SIZE_OPTIONS,
} from "../../../shared/providerShell";

type PartialMatchCandidatesDialogProps = {
  open: boolean;
  stagingId: string;
  sourceProviderName?: string;
  sourceAddress?: string;
  sourceCity?: string;
  sourceState?: string;
  sourcePincode?: string;
  /**
   * Active Partial Match similarity sub-filter. In the 91–100% band the records
   * are treated as near-certain matches, so both actions are disabled here.
   */
  similarityBand?: PartialMatchSimilarityBand;
  onClose: () => void;
  /** Refresh parent staging list + counts after Submit / Not Found succeeds. */
  onSuccess?: () => void;
};

type ConfirmKind = "match" | "notFound" | null;
type SubmittingAction = "match" | "notFound" | null;

function joinLocationParts(...parts: Array<string | undefined>): string {
  return parts.map((part) => String(part ?? "").trim()).filter(Boolean).join(", ");
}

function displayValue(value: string | null | undefined): string {
  const trimmed = String(value ?? "").trim();
  return trimmed || "—";
}

function normalizeCompareValue(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

type CompareStatus = "match" | "different" | "missing_incoming";

function resolveCompareStatus(
  incoming: string | null | undefined,
  selected: string | null | undefined,
): CompareStatus {
  const a = normalizeCompareValue(incoming);
  const b = normalizeCompareValue(selected);
  if (!a && b) return "missing_incoming";
  if (!a && !b) return "match";
  if (a !== b) return "different";
  return "match";
}

function getMatchScorePercent(score: number | null | undefined): number | null {
  if (score == null || !Number.isFinite(score)) return null;
  const pct = score <= 1 ? Math.round(score * 100) : Math.round(score);
  return Math.max(0, Math.min(100, pct));
}

function getMatchStrengthLabel(percent: number | null): string {
  if (percent == null) return "—";
  if (percent >= 90) return "Strong Match";
  if (percent >= 70) return "Good Match";
  if (percent >= 50) return "Moderate Match";
  return "Weak Match";
}

function MatchScoreRing({ percent }: Readonly<{ percent: number }>) {
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative h-8 w-8 shrink-0">
      <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32" aria-hidden>
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="#d1fae5"
          strokeWidth="3.5"
        />
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald-700">
        {percent}%
      </span>
    </div>
  );
}

type CompareFieldRow = {
  key: string;
  label: string;
  incoming: string;
  selected: string;
  status: CompareStatus;
  Icon: typeof BuildingOfficeIcon;
};

function StatusPill({
  status,
  labels,
}: Readonly<{
  status: CompareStatus;
  labels: {
    match: string;
    different: string;
    missingIncoming: string;
  };
}>) {
  if (status === "match") {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-100 px-1 py-px text-[8px] font-semibold leading-3 text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircleIcon className="h-2.5 w-2.5" aria-hidden />
        {labels.match}
      </span>
    );
  }
  if (status === "missing_incoming") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-rose-100 px-1 py-px text-[8px] font-semibold leading-3 text-rose-700 ring-1 ring-rose-200">
        {labels.missingIncoming}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-red-100 px-1 py-px text-[8px] font-semibold leading-3 text-red-700 ring-1 ring-red-300">
      {labels.different}
    </span>
  );
}

function ProviderCompareRow({
  label,
  incoming,
  selected,
  status,
  Icon,
  statusLabels,
}: Readonly<
  Omit<CompareFieldRow, "key"> & {
    statusLabels: {
      match: string;
      different: string;
      missingIncoming: string;
    };
  }
>) {
  let rowBg = "bg-white";
  if (status === "different") rowBg = "bg-red-50/90";
  else if (status === "missing_incoming") rowBg = "bg-rose-50/80";

  return (
    <div
      className={`grid grid-cols-1 gap-1 border-b border-gray-100 px-2 py-1.5 last:border-b-0 sm:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)_6.5rem] sm:items-start ${rowBg}`}
    >
      <div className="flex items-start gap-1 pt-0.5">
        <Icon className="mt-px h-3 w-3 shrink-0 text-gray-400" aria-hidden />
        <p className="text-[10px] font-semibold leading-3.5 text-gray-600">
          {label}
        </p>
      </div>
      <p className="break-words text-[10px] leading-3.5 text-gray-800">
        {incoming}
      </p>
      <p className="break-words text-[10px] leading-3.5 text-gray-800">
        {selected}
      </p>
      <div className="flex sm:justify-start">
        <StatusPill status={status} labels={statusLabels} />
      </div>
    </div>
  );
}

function MatchConfirmBody({
  scorePercent,
  diffCount,
  fields,
  t,
  i18nPrefix,
}: Readonly<{
  scorePercent: number | null;
  diffCount: number;
  fields: CompareFieldRow[];
  t: (key: string, options?: Record<string, unknown>) => string;
  i18nPrefix: string;
}>) {
  const strength = getMatchStrengthLabel(scorePercent);
  const scoreHint =
    diffCount > 0
      ? t(`${i18nPrefix}.matchScoreHintWithDiff`, {
          defaultValue: "The records match, but some differences were found.",
        })
      : t(`${i18nPrefix}.matchScoreHintExact`, {
          defaultValue: "The selected records look closely aligned.",
        });

  const statusLabels = {
    match: t(`${i18nPrefix}.compareStatusMatch`, { defaultValue: "Match" }),
    different: t(`${i18nPrefix}.compareStatusDifferent`, {
      defaultValue: "Different",
    }),
    missingIncoming: t(`${i18nPrefix}.compareStatusMissingIncoming`, {
      defaultValue: "Missing in incoming",
    }),
  };

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-1 gap-1.5 rounded-md border border-gray-200 bg-gray-50/80 p-1.5 sm:grid-cols-2">
        <div className="flex items-center gap-1.5 rounded bg-white px-1.5 py-1 ring-1 ring-gray-100">
          {scorePercent != null ? (
            <MatchScoreRing percent={scorePercent} />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700">
              —
            </div>
          )}
          <div className="min-w-0 text-left">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-500">
              {t(`${i18nPrefix}.matchScore`, { defaultValue: "Match Score" })}
            </p>
            <p className="text-[11px] font-bold leading-3 text-emerald-700">
              {strength}
            </p>
            <p className="truncate text-[9px] leading-3 text-gray-500" title={scoreHint}>
              {scoreHint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded bg-white px-1.5 py-1 ring-1 ring-amber-100">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <ExclamationTriangleIcon className="h-3 w-3" aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-[11px] font-bold leading-3 text-amber-700">
              {t(`${i18nPrefix}.differencesFound`, {
                defaultValue: "{{count}} Differences Found",
                count: diffCount,
              })}
            </p>
            <p className="text-[9px] leading-3 text-gray-500">
              {t(`${i18nPrefix}.differencesFoundHint`, {
                defaultValue: "Please review the details carefully.",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-gray-100 px-2 py-1">
          <p className="text-[10px] font-bold text-gray-800">
            {t(`${i18nPrefix}.providerComparison`, {
              defaultValue: "Provider Comparison",
            })}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-[8px] font-semibold">
            <span className="inline-flex items-center gap-1 text-red-700">
              <span className="h-1.5 w-1.5 rounded-sm bg-red-400" />
              {statusLabels.different}
            </span>
            <span className="inline-flex items-center gap-1 text-rose-700">
              <span className="h-1.5 w-1.5 rounded-sm bg-rose-300" />
              {statusLabels.missingIncoming}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)_6.5rem] gap-1 border-b border-gray-100 bg-gray-50 px-2 py-0.5">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
            {t(`${i18nPrefix}.compareField`, { defaultValue: "Field" })}
          </p>
          <div className="flex items-center gap-0.5 rounded bg-sky-50 px-1 py-px">
            <BuildingOfficeIcon className="h-2.5 w-2.5 text-sky-600" aria-hidden />
            <p className="text-[8px] font-bold uppercase tracking-wide text-sky-700">
              {t(`${i18nPrefix}.compareIncoming`, {
                defaultValue: "Incoming Provider",
              })}
            </p>
          </div>
          <div className="flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-px">
            <CheckCircleIcon className="h-2.5 w-2.5 text-emerald-600" aria-hidden />
            <p className="text-[8px] font-bold uppercase tracking-wide text-emerald-700">
              {t(`${i18nPrefix}.compareSelected`, {
                defaultValue: "Selected Provider Master",
              })}
            </p>
          </div>
          <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
            {t(`${i18nPrefix}.compareStatus`, { defaultValue: "Status" })}
          </p>
        </div>

        <div className="max-h-44 overflow-y-auto">
          {fields.map(({ key, ...field }) => (
            <ProviderCompareRow
              key={key}
              {...field}
              statusLabels={statusLabels}
            />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-1">
        <ExclamationTriangleIcon
          className="mt-px h-3 w-3 shrink-0 text-amber-600"
          aria-hidden
        />
        <p className="text-left text-[9px] leading-3.5 text-amber-900">
          <span className="font-semibold">
            {t(`${i18nPrefix}.confirmMatchWarningTitle`, {
              defaultValue:
                "Please verify the highlighted differences before confirming this provider match.",
            })}
          </span>{" "}
          <span className="text-amber-800/90">
            {t(`${i18nPrefix}.confirmMatchWarningBody`, {
              defaultValue:
                "Once confirmed, this selection will be used as the final Provider Master record.",
            })}
          </span>
        </p>
      </div>
    </div>
  );
}

export function PartialMatchCandidatesDialog({
  open,
  stagingId,
  sourceProviderName,
  sourceAddress,
  sourceCity,
  sourceState,
  sourcePincode,
  similarityBand,
  onClose,
  onSuccess,
}: Readonly<PartialMatchCandidatesDialogProps>) {
  const { t } = useTranslation();
  const I = "providerMaster.excludedProvider.inward";
  const noopForm = useForm<Record<string, unknown>>({ defaultValues: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<NormalizedPartialMatchCandidate[]>([]);
  const [selectedRow, setSelectedRow] =
    useState<NormalizedPartialMatchCandidate | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [submitting, setSubmitting] = useState<SubmittingAction>(null);

  useEffect(() => {
    if (!open) {
      setRows([]);
      setError("");
      setLoading(false);
      setSelectedRow(null);
      setConfirmKind(null);
      setSubmitting(null);
      return;
    }

    const id = stagingId.trim();
    if (!id) {
      setRows([]);
      setSelectedRow(null);
      setError(t(`${I}.stagingIdMissing`, { defaultValue: "Staging id is missing." }));
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    setSelectedRow(null);
    setConfirmKind(null);
    setSubmitting(null);

    getStagingBlacklistPartialMatchCandidates(id)
      .then((nextRows) => {
        if (!cancelled) setRows(nextRows);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setRows([]);
        setError(
          err instanceof Error && err.message.trim()
            ? err.message
            : t(`${I}.loadMatchingFailed`, {
                defaultValue: "Failed to load matching records.",
              }),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [I, open, stagingId, t]);

  const title = useMemo(() => {
    const name = sourceProviderName?.trim() ?? "";
    if (name) return name;
    return t(`${I}.matchingRecords`, { defaultValue: "Matching records" });
  }, [I, sourceProviderName, t]);

  const addressSubtitle = useMemo(
    () => joinLocationParts(sourceAddress, sourceCity, sourceState, sourcePincode),
    [sourceAddress, sourceCity, sourcePincode, sourceState],
  );

  const columnDefs = useMemo(
    () =>
      applyBulkIcMappingGridCellStyle([
        {
          field: "providerName",
          headerName: t("providerMaster.excludedProvider.view.providerName"),
          flex: 1.4,
          minWidth: 160,
          tooltipField: "providerName",
        },
        {
          field: "providerRohiniCode",
          headerName: t("providerMaster.addForm.rohiniNumber", {
            defaultValue: "Rohini Number",
          }),
          flex: 1,
          minWidth: 130,
          valueFormatter: (params: { value?: string | null }) => {
            const value = String(params.value ?? "").trim();
            return value || "—";
          },
        },
        {
          field: "matchSimilarityScore",
          headerName: t(`${I}.matchScore`, { defaultValue: "Match Score" }),
          flex: 0.7,
          minWidth: 110,
          valueFormatter: (params: { value?: number | null }) =>
            formatMatchSimilarityPercent(params.value) || "—",
        },
        {
          field: "providerState",
          headerName: t("providerMaster.excludedProvider.view.state", {
            defaultValue: "State",
          }),
          flex: 0.8,
          minWidth: 100,
        },
        {
          field: "providerCity",
          headerName: t("providerMaster.excludedProvider.view.city", {
            defaultValue: "City",
          }),
          flex: 0.8,
          minWidth: 100,
        },
        {
          field: "providerPincode",
          headerName: t("providerMaster.excludedProvider.view.pincode", {
            defaultValue: "Pincode",
          }),
          flex: 0.7,
          minWidth: 90,
        },
        {
          field: "providerAddress",
          headerName: t("providerMaster.excludedProvider.view.address", {
            defaultValue: "Address",
          }),
          flex: 1.6,
          minWidth: 180,
          tooltipField: "providerAddress",
        },
      ]),
    [I, t],
  );

  const matchConfirmMessage = t(`${I}.confirmMatchMessage`, {
    defaultValue: "Review the differences below before confirming this match.",
  });

  const matchScorePercent = useMemo(
    () => getMatchScorePercent(selectedRow?.matchSimilarityScore),
    [selectedRow],
  );

  const matchCompareFields = useMemo((): CompareFieldRow[] => {
    if (!selectedRow) return [];

    const rows: Array<{
      key: string;
      label: string;
      incomingRaw: string | undefined;
      selectedRaw: string | undefined;
      Icon: CompareFieldRow["Icon"];
    }> = [
      {
        key: "name",
        label: t(`${I}.confirmMatchProviderName`, {
          defaultValue: "Provider Name",
        }),
        incomingRaw: sourceProviderName,
        selectedRaw: selectedRow.providerName,
        Icon: BuildingOfficeIcon,
      },
      {
        key: "address",
        label: t("providerMaster.excludedProvider.view.address", {
          defaultValue: "Address",
        }),
        incomingRaw: sourceAddress,
        selectedRaw: selectedRow.providerAddress,
        Icon: MapPinIcon,
      },
      {
        key: "city",
        label: t("providerMaster.excludedProvider.view.city", {
          defaultValue: "City",
        }),
        incomingRaw: sourceCity,
        selectedRaw: selectedRow.providerCity,
        Icon: MapPinIcon,
      },
      {
        key: "pincode",
        label: t("providerMaster.excludedProvider.view.pincode", {
          defaultValue: "Pincode",
        }),
        incomingRaw: sourcePincode,
        selectedRaw: selectedRow.providerPincode,
        Icon: HashtagIcon,
      },
      {
        key: "state",
        label: t("providerMaster.excludedProvider.view.state", {
          defaultValue: "State",
        }),
        incomingRaw: sourceState,
        selectedRaw: selectedRow.providerState,
        Icon: MapPinIcon,
      },
    ];

    return rows.map((row) => ({
      key: row.key,
      label: row.label,
      incoming: displayValue(row.incomingRaw),
      selected: displayValue(row.selectedRaw),
      status: resolveCompareStatus(row.incomingRaw, row.selectedRaw),
      Icon: row.Icon,
    }));
  }, [
    I,
    selectedRow,
    sourceAddress,
    sourceCity,
    sourcePincode,
    sourceProviderName,
    sourceState,
    t,
  ]);

  const diffCount = useMemo(
    () =>
      matchCompareFields.filter((field) => field.status !== "match").length,
    [matchCompareFields],
  );

  // 91–100% similarity records are treated as near-certain matches — the manual
  // Submit / Not Found actions are disabled for that sub-filter.
  const bandLocked = similarityBand === "91To100";
  const actionsDisabled = loading || submitting != null || bandLocked;
  const matchDisabled = actionsDisabled || !selectedRow;
  const notFoundDisabled = actionsDisabled;

  const closeConfirm = () => {
    if (submitting != null) return;
    setConfirmKind(null);
  };

  const finishSuccess = (message: string) => {
    toast.success(message, { position: "top-right", duration: 4000 });
    setConfirmKind(null);
    setSelectedRow(null);
    onClose();
    onSuccess?.();
  };

  const handleConfirmMatch = async () => {
    if (!selectedRow || submitting != null) return;
    const id = stagingId.trim();
    const providerId = selectedRow.providerId.trim();
    if (!id || !providerId) return;

    setSubmitting("match");
    try {
      const result = await matchStagingProviderBlacklist(id, providerId);
      if (!result.ok) {
        showProviderError(
          result.message ??
            t(`${I}.matchFailed`, { defaultValue: "Failed to match provider." }),
          "Error",
          result.status,
        );
        return;
      }
      finishSuccess(
        result.message ??
          t(`${I}.matchSuccess`, { defaultValue: "Provider matched successfully." }),
      );
    } catch (err: unknown) {
      showProviderError(
        err instanceof Error && err.message.trim()
          ? err.message
          : t(`${I}.matchFailed`, { defaultValue: "Failed to match provider." }),
      );
    } finally {
      setSubmitting(null);
    }
  };

  const handleConfirmNotFound = async () => {
    if (submitting != null) return;
    const id = stagingId.trim();
    if (!id) return;

    setSubmitting("notFound");
    try {
      const result = await postStagingProviderBlacklistNotFound(id);
      if (!result.ok) {
        showProviderError(
          result.message ??
            t(`${I}.notFoundFailed`, {
              defaultValue: "Failed to process Not Found.",
            }),
          "Error",
          result.status,
        );
        return;
      }
      finishSuccess(
        result.message ??
          t(`${I}.notFoundSuccess`, {
            defaultValue: "Provider Not Found processed successfully.",
          }),
      );
    } catch (err: unknown) {
      showProviderError(
        err instanceof Error && err.message.trim()
          ? err.message
          : t(`${I}.notFoundFailed`, {
              defaultValue: "Failed to process Not Found.",
            }),
      );
    } finally {
      setSubmitting(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <ConfigFormDialog
        open={open}
        onClose={() => {
          if (submitting != null) return;
          onClose();
        }}
        overlayZIndexClassName={PROVIDER_DRAWER_DIALOG_Z_INDEX_CLASS}
        title={title}
        titleClassName="truncate text-sm font-semibold leading-5 text-gray-900"
        titleIcon={
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
            <BuildingOffice2Icon className="h-3.5 w-3.5 text-blue-600" aria-hidden />
          </div>
        }
        subtitle={
          addressSubtitle ? (
            <span className="flex min-w-0 items-center gap-1">
              <MapPinIcon className="h-3 w-3 shrink-0 text-gray-400" aria-hidden />
              <span className="min-w-0 truncate" title={addressSubtitle}>
                {addressSubtitle}
              </span>
            </span>
          ) : undefined
        }
        titleId="partial-match-candidates-dialog-title"
        fields={[]}
        form={noopForm}
        onSubmit={() => undefined}
        maxColumns={1}
        widthClassName="w-full max-w-5xl sm:w-[96%]"
        bodyClassName="overflow-hidden"
        contentClassName="px-3 py-1.5"
        error={error || undefined}
        hideFooter
        footer={
          <div className="box-border shrink-0 border-t border-gray-200 bg-white px-4 py-2 sm:px-6">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {bandLocked ? (
                <p className="mr-auto text-[11px] leading-4 text-gray-500">
                  {t(`${I}.bandLockedHint`, {
                    defaultValue:
                      "91–100% similarity records are auto-matched — no manual action needed.",
                  })}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outlined"
                color="warning"
                className="h-8 min-w-[6.5rem] px-4 py-0 text-xs"
                disabled={notFoundDisabled}
                onClick={() => setConfirmKind("notFound")}
              >
                {submitting === "notFound" ? (
                  <span className="inline-flex items-center gap-2">
                    <GhostSpinner variant="soft" className="size-3.5 border-2" />
                    {t(`${I}.notFound`, { defaultValue: "Not Found" })}
                  </span>
                ) : (
                  t(`${I}.notFound`, { defaultValue: "Not Found" })
                )}
              </Button>
              <Button
                type="button"
                color="primary"
                className="h-8 min-w-[6.5rem] px-4 py-0 text-xs"
                disabled={matchDisabled}
                onClick={() => {
                  if (!selectedRow) return;
                  setConfirmKind("match");
                }}
              >
                {submitting === "match" ? (
                  <span className="inline-flex items-center gap-2">
                    <GhostSpinner variant="soft" className="size-3.5 border-2" />
                    {t(`${I}.submit`, { defaultValue: "Submit" })}
                  </span>
                ) : (
                  t(`${I}.submit`, { defaultValue: "Submit" })
                )}
              </Button>
            </div>
          </div>
        }
      >
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : null}
          {!loading && !error && rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {t(`${I}.noMatchingRecords`, {
                defaultValue: "No matching records found.",
              })}
            </p>
          ) : null}
          {!loading && !error && rows.length > 0 ? (
            <AgGridSuperWrapper
              rowData={rows}
              columnDefs={columnDefs}
              pagination
              pageSize={PROVIDER_GRID_DEFAULT_PAGE_SIZE}
              pageSizeOptions={[...PROVIDER_GRID_PAGE_SIZE_OPTIONS]}
              height={34 + Math.min(rows.length, 10) * 28 + 2}
              domLayout="normal"
              singleSelectCheckboxes
              onRowSelected={(row) =>
                setSelectedRow((row as NormalizedPartialMatchCandidate | null) ?? null)
              }
              getRowId={({ data }) =>
                String((data as NormalizedPartialMatchCandidate).providerId)
              }
            />
          ) : null}
        </div>
      </ConfigFormDialog>

      <AlertDialog
        type="success"
        isOpen={confirmKind === "match"}
        onClose={closeConfirm}
        onConfirm={handleConfirmMatch}
        title={t(`${I}.confirmMatchTitle`, {
          defaultValue: "Confirm Provider Match",
        })}
        message={matchConfirmMessage}
        confirmText={t(`${I}.confirmMatchAction`, {
          defaultValue: "Confirm Match",
        })}
        closeText={t("providerMaster.button.cancel", { defaultValue: "Cancel" })}
        confirmDisabled={submitting != null}
        hideCloseIcon={submitting != null}
      >
        {selectedRow ? (
          <MatchConfirmBody
            scorePercent={matchScorePercent}
            diffCount={diffCount}
            fields={matchCompareFields}
            t={t}
            i18nPrefix={I}
          />
        ) : null}
      </AlertDialog>

      <AlertDialog
        type="partial"
        isOpen={confirmKind === "notFound"}
        onClose={closeConfirm}
        onConfirm={handleConfirmNotFound}
        title={t(`${I}.confirmNotFoundTitle`, {
          defaultValue: "Confirm Not Found",
        })}
        message={t(`${I}.confirmNotFoundMessage`, {
          defaultValue:
            "Are you sure the provider is not found in the displayed matching records (50%–70% match range)?",
        })}
        confirmText={t(`${I}.confirmNotFoundAction`, {
          defaultValue: "Confirm Not Found",
        })}
        closeText={t("providerMaster.button.cancel", { defaultValue: "Cancel" })}
        confirmDisabled={submitting != null}
        hideCloseIcon={submitting != null}
      />
    </>
  );
}
