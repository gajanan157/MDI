import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  isProviderJobTerminalStatus,
  resolveProviderJobDashboardView,
} from "./progressUtils";
import { useProviderJobStatus, type ProviderJobStatusSource } from "./useStatus";
import type { ProviderJobStatus } from "./statusTypes";
import {
  JobCompletedSummaryCard,
  JobFailedSummaryCard,
  JobInProgressSummaryCard,
  JobStoppedSummaryCard,
} from "./DashboardViews";
import { providerJobDashboardClass } from "./theme.constants";

export type ProviderJobProcessingPanelProps = {
  inwardNo: string;
  className?: string;
  /** Which status API to poll. Defaults to IC bulk-mapping `provider-job`. */
  statusSource?: ProviderJobStatusSource;
  onTerminalStatus?: (jobStatus: ProviderJobStatus) => void;
  onRetryJob?: () => void;
  onViewJobDetails?: () => void;
};

const COMPLETED_BANNER_AUTO_HIDE_MS = 5000;

function getCompletedBannerStorageKey(inwardNo: string): string {
  return `provider-job-completed-banner:${inwardNo.trim()}`;
}

function hasCompletedBannerBeenShown(inwardNo: string): boolean {
  try {
    return sessionStorage.getItem(getCompletedBannerStorageKey(inwardNo)) === "shown";
  } catch {
    return false;
  }
}

function markCompletedBannerShown(inwardNo: string): void {
  try {
    sessionStorage.setItem(getCompletedBannerStorageKey(inwardNo), "shown");
  } catch {
    // sessionStorage may be unavailable
  }
}

function JobDashboardLoadingCard({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={clsx(
        providerJobDashboardClass.card,
        "border-l-[3px] border-l-slate-200 bg-gradient-to-r from-slate-50/40 to-white",
        className,
      )}
    >
      <div className="flex animate-pulse flex-wrap items-center gap-x-2 gap-y-1 px-2 py-1 sm:px-2.5">
        <div className="h-6 w-6 shrink-0 rounded-sm bg-slate-200" />
        <div className="h-3.5 w-14 shrink-0 rounded-sm bg-slate-200" />
        <div className="h-4 w-12 shrink-0 rounded-sm bg-slate-200" />
        <div className="min-w-0 flex-1 rounded-sm bg-slate-100 py-1">
          <div className="h-2.5 w-full max-w-md rounded-sm bg-slate-200" />
        </div>
        <span className="hidden h-2.5 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1">
          <div className="h-5 w-[5.5rem] rounded-sm bg-slate-100" />
          <div className="h-5 w-[6.5rem] rounded-sm bg-slate-100" />
          <div className="h-5 w-[4.5rem] rounded-sm bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function ProviderJobProcessingPanel({
  inwardNo,
  className,
  statusSource = "provider-job",
  onTerminalStatus,
  onRetryJob,
  onViewJobDetails,
}: Readonly<ProviderJobProcessingPanelProps>) {
  const terminalNotifiedRef = useRef(false);
  const completedBannerHandledRef = useRef(false);
  const [showCompletedBanner, setShowCompletedBanner] = useState(false);

  const { data: job, isLoading, isFetching } = useProviderJobStatus(inwardNo, {
    source: statusSource,
  });

  useEffect(() => {
    if (!job) return;
    if (resolveProviderJobDashboardView(job) !== "completed") return;
    if (completedBannerHandledRef.current) return;
    if (hasCompletedBannerBeenShown(inwardNo)) return;

    completedBannerHandledRef.current = true;
    markCompletedBannerShown(inwardNo);
    setShowCompletedBanner(true);

    const timer = window.setTimeout(() => {
      setShowCompletedBanner(false);
    }, COMPLETED_BANNER_AUTO_HIDE_MS);

    return () => window.clearTimeout(timer);
  }, [job, inwardNo]);

  useEffect(() => {
    if (!job || !onTerminalStatus) return;
    if (!isProviderJobTerminalStatus(job.jobStatus)) return;
    if (terminalNotifiedRef.current) return;
    terminalNotifiedRef.current = true;
    onTerminalStatus(job.jobStatus);
  }, [job, onTerminalStatus]);

  if (isLoading && !job) {
    return <JobDashboardLoadingCard className={className} />;
  }

  if (!job) return null;

  const view = resolveProviderJobDashboardView(job);

  if (view === "completed") {
    if (!showCompletedBanner) return null;
    return <JobCompletedSummaryCard job={job} className={className} />;
  }

  if (view === "failed") {
    return (
      <JobFailedSummaryCard
        job={job}
        className={className}
        onRetry={onRetryJob}
        onViewDetails={onViewJobDetails}
      />
    );
  }

  if (view === "stopped") {
    return <JobStoppedSummaryCard job={job} className={className} />;
  }

  return (
    <JobInProgressSummaryCard job={job} className={className} isRefreshing={isFetching} />
  );
}
