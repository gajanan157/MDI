import type { ReactNode } from "react";
import clsx from "clsx";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { PROVIDER_ACTION_BUTTON_CLASS } from "@/app/pages/dashboards/providerManagernt/shared/providerButtonStyles";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import type {
  NormalizedProviderJobStatus,
  NormalizedProviderJobValidationError,
} from "./statusTypes";
import {
  calculateActiveJobProgress,
  formatProviderJobDuration,
  resolveProviderJobErrorMessage,
  resolveProviderJobFailedStage,
} from "./progressUtils";
import { parseJobTechnicalDetail } from "./errorUtils";
import { formatProviderJobDateTime, providerJobDashboardClass } from "./theme.constants";
import { JobChip, JobLinearProgress, JobSummaryField } from "./theme";

type DashboardCardProps = {
  job: NormalizedProviderJobStatus;
  className?: string;
  isRefreshing?: boolean;
};

type JobFailedCardProps = DashboardCardProps & {
  onRetry?: () => void;
  onViewDetails?: () => void;
};

function DashboardCardShell({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={clsx(providerJobDashboardClass.card, className)}>{children}</div>
  );
}

function ProcessingBadge({ label, tone }: Readonly<{ label: string; tone: "green" | "blue" }>) {
  return (
    <JobChip
      label={label}
      className={
        tone === "green"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
          : "bg-blue-50 text-blue-700 ring-blue-600/20"
      }
    />
  );
}

export function JobInProgressSummaryCard({ job, className, isRefreshing }: Readonly<DashboardCardProps>) {
  const active = calculateActiveJobProgress(job);

  return (
    <div
      className={clsx(
        providerJobDashboardClass.card,
        "border-l-[3px] border-l-blue-500 bg-gradient-to-r from-blue-50/40 to-white",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-1.5 sm:flex-nowrap">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-blue-600 text-white">
          <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" aria-hidden />
        </span>

        <h3 className="shrink-0 text-xs font-bold text-slate-900">Provider Import In Progress</h3>
        <ProcessingBadge label="Processing" tone="blue" />
        {isRefreshing ? (
          <ArrowPathIcon className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-400" aria-hidden />
        ) : null}

        {active.showBar ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <JobLinearProgress
              value={active.progress.percent}
              barClassName={active.barClassName}
              indeterminate={active.progress.indeterminate}
              className="h-1.5 min-w-0 flex-1"
            />
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-900">
              {active.progress.indeterminate ? "…" : `${active.progress.percent}%`}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatCompactJobDateTime(value: string): string {
  if (!value.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveInlineJobStatShellClass(highlight: boolean, highlightTone: "green" | "red"): string {
  if (!highlight) return "bg-white/90 ring-1 ring-slate-200/70";
  if (highlightTone === "red") return "bg-red-600 text-white";
  return "bg-emerald-600 text-white";
}

function resolveInlineJobStatLabelClass(highlight: boolean, highlightTone: "green" | "red"): string {
  if (!highlight) return "text-slate-500";
  if (highlightTone === "red") return "text-red-50";
  return "text-emerald-50";
}

function InlineJobStat({
  label,
  value,
  highlight = false,
  highlightTone = "green",
  wrap = false,
}: Readonly<{
  label: string;
  value: string;
  highlight?: boolean;
  highlightTone?: "green" | "red";
  wrap?: boolean;
}>) {
  return (
    <span
      className={clsx(
        "inline-flex min-w-0 items-center gap-1 rounded-sm px-1.5 py-0.5",
        !wrap && "max-w-[11rem]",
        resolveInlineJobStatShellClass(highlight, highlightTone),
      )}
      title={`${label}: ${value}`}
    >
      <span
        className={clsx(
          "shrink-0 text-[9px] font-semibold uppercase",
          resolveInlineJobStatLabelClass(highlight, highlightTone),
        )}
      >
        {label}
      </span>
      <span
        className={clsx(
          "text-[10px] font-semibold tabular-nums",
          wrap ? "break-words" : "truncate",
          highlight ? "text-white" : "text-slate-900",
        )}
      >
        {value}
      </span>
    </span>
  );
}

function FailedJobTechnicalDetail({
  technicalDetail,
  userMessage,
}: Readonly<{
  technicalDetail: string;
  userMessage: string;
}>) {
  const sections = parseJobTechnicalDetail(technicalDetail).filter(
    (section) => section.bullets.length > 0 || section.lines.length > 0,
  );

  if (sections.length === 0) return null;

  const normalizedUserMessage = userMessage.trim().toLowerCase();
  const visibleSections = sections.filter((section) => {
    const sectionText = [section.title, ...section.bullets, ...section.lines]
      .join(" ")
      .trim()
      .toLowerCase();
    return !normalizedUserMessage || !normalizedUserMessage.includes(sectionText);
  });

  if (visibleSections.length === 0) return null;

  return (
    <div className="min-w-0 flex-[1_1_100%] basis-full space-y-0.5">
      {visibleSections.map((section) => (
        <div key={section.title} className="min-w-0">
          {section.bullets.length > 0 ? (
            <ul className="list-disc space-y-0.5 pl-4 text-[10px] leading-snug text-red-700">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="break-words">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {section.lines.length > 0 ? (
            <div className="space-y-0.5 text-[10px] leading-snug text-red-700">
              {section.lines.map((line) => (
                <p key={line} className="break-words">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Multi-line list of missing columns, for the details popup. */
function formatMissingColumnsPopup(
  validationErrors: NormalizedProviderJobValidationError[],
): string {
  const columns = Array.from(
    new Set(
      validationErrors.flatMap((entry) => entry.missingColumns).filter(Boolean),
    ),
  );
  return [
    "The uploaded blacklist file is missing required columns. Please upload the correct file.",
    "",
    ...columns.map((column) => `• ${column}`),
  ].join("\n");
}

export function JobCompletedSummaryCard({ job, className }: Readonly<DashboardCardProps>) {
  const duration = formatProviderJobDuration(job.startTime, job.endTime);
  const started = formatCompactJobDateTime(job.startTime);
  const completed = formatCompactJobDateTime(job.endTime);

  return (
    <div
      className={clsx(
        providerJobDashboardClass.card,
        "border-l-[3px] border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-1 sm:flex-nowrap sm:px-3 sm:py-1">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-emerald-600 text-white">
          <CheckCircleIcon className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
        </span>

        <h3 className="shrink-0 text-xs font-bold text-slate-900">Job Completed</h3>
        <JobChip
          label="COMPLETED"
          className="shrink-0 bg-emerald-600 px-2 py-px text-[10px] text-white ring-emerald-700/30"
        />

        <span className="hidden h-3 w-px shrink-0 bg-emerald-200/80 lg:block" aria-hidden />

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 lg:flex-nowrap lg:justify-end">
          <InlineJobStat label="Inward" value={job.inwardNo} />
          <InlineJobStat label="Started" value={started} />
          <InlineJobStat label="Done" value={completed} />
          <InlineJobStat label="Duration" value={duration} highlight />
        </div>
      </div>
    </div>
  );
}

export function JobFailedSummaryCard({
  job,
  className,
  onRetry,
  onViewDetails,
}: Readonly<JobFailedCardProps>) {
  const failedTime = job.endTime.trim() ? formatCompactJobDateTime(job.endTime) : "—";
  const errorMessage = resolveProviderJobErrorMessage(job);
  const failedStage = resolveProviderJobFailedStage(job);
  const technicalDetail = job.error?.technicalDetail.trim() ?? "";
  const validationErrors = job.validationErrors ?? [];
  const hasMissingColumns = validationErrors.some(
    (entry) => entry.missingColumns.length > 0,
  );
  const openMissingColumnsPopup = () => {
    showProviderError(
      formatMissingColumnsPopup(validationErrors),
      "Missing columns",
      400,
    );
  };

  return (
    <div
      className={clsx(
        providerJobDashboardClass.card,
        "border-l-[3px] border-l-red-500 bg-gradient-to-r from-red-50/40 to-white",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-2 py-1 sm:px-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-red-600 text-white">
          <XCircleIcon className="h-3 w-3" strokeWidth={2.2} aria-hidden />
        </span>

        <h3 className="shrink-0 text-[11px] font-bold text-slate-900">Job Failed</h3>
        <JobChip
          label="FAILED"
          className="shrink-0 bg-red-600 px-1.5 py-px text-[9px] text-white ring-red-700/30"
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5">
          <p
            className="min-w-0 break-words text-[10px] leading-snug text-red-600"
            title={errorMessage}
          >
            {errorMessage}
          </p>

          {hasMissingColumns ? (
            <button
              type="button"
              onClick={openMissingColumnsPopup}
              aria-label="View missing columns"
              className="inline-flex shrink-0 cursor-pointer items-center text-red-500 hover:text-red-700"
            >
              <InformationCircleIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <span className="hidden h-2.5 w-px shrink-0 bg-red-200/80 sm:block" aria-hidden />

        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1 sm:ml-auto">
          <InlineJobStat label="Inward" value={job.inwardNo} wrap />
          <InlineJobStat label="Stage" value={failedStage} wrap />
          <InlineJobStat label="At" value={failedTime} highlight highlightTone="red" />
        </div>

        {onRetry || onViewDetails ? (
          <div className="flex shrink-0 gap-1">
            {onRetry ? (
              <Button type="button" color="primary" className={PROVIDER_ACTION_BUTTON_CLASS} onClick={onRetry}>
                Retry
              </Button>
            ) : null}
            {onViewDetails ? (
              <Button
                type="button"
                variant="outlined"
                className={PROVIDER_ACTION_BUTTON_CLASS}
                onClick={onViewDetails}
              >
                Details
              </Button>
            ) : null}
          </div>
        ) : null}

        <FailedJobTechnicalDetail technicalDetail={technicalDetail} userMessage={errorMessage} />
      </div>
    </div>
  );
}

export function JobStoppedSummaryCard({ job, className }: Readonly<DashboardCardProps>) {
  return (
    <DashboardCardShell className={className}>
      <div className={providerJobDashboardClass.cardBody}>
        <div className="space-y-4">
          <h3 className={providerJobDashboardClass.title}>Provider Job Stopped</h3>
          <p className="text-sm text-slate-600">
            The job was stopped before completion. Partial results may be available below.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <JobSummaryField label="Inward Number" value={job.inwardNo} />
            <JobSummaryField label="Status" value={job.jobStatus} />
            <JobSummaryField label="Stopped At" value={formatProviderJobDateTime(job.endTime)} />
          </div>
        </div>
      </div>
    </DashboardCardShell>
  );
}
