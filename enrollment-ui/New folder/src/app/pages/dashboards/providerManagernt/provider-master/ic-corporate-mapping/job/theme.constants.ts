import type { ProviderJobProgressDisplay, ProviderJobStatus } from "./statusTypes";
import { formatProviderDateTimeDisplay } from "../../../shared/dateFormat";

export const PROVIDER_JOB_STATUS_LABEL: Record<ProviderJobStatus, string> = {
  STARTING: "Starting",
  STARTED: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  STOPPED: "Stopped",
};

export const providerJobDashboardClass = {
  card: "overflow-hidden rounded-sm border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]",
  cardBody: "px-6 py-6 sm:px-8 sm:py-7",
  title: "text-base font-semibold tracking-tight text-slate-900 sm:text-lg",
  subtitle: "text-sm font-medium text-slate-600",
  label: "text-[11px] font-medium uppercase tracking-wide text-slate-500",
  value: "text-sm font-semibold text-slate-900 sm:text-[15px]",
  chip:
    "inline-flex items-center rounded-sm px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
};

export function getProviderJobStatusChipClass(status: ProviderJobStatus): string {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (status === "FAILED") return "bg-red-50 text-red-700 ring-red-600/20";
  if (status === "STOPPED") return "bg-slate-100 text-slate-700 ring-slate-500/20";
  return "bg-blue-50 text-blue-700 ring-blue-600/20";
}

export function getProviderJobProgressBarClass(tone: ProviderJobProgressDisplay["tone"]): string {
  if (tone === "completed") return "bg-emerald-500";
  if (tone === "failed") return "bg-red-500";
  if (tone === "stopped") return "bg-slate-400";
  if (tone === "starting") return "bg-emerald-500";
  return "bg-blue-600";
}

export function formatProviderJobDateTime(value: string): string {
  return formatProviderDateTimeDisplay(value);
}

/** @deprecated Use JobSummaryField */
export const providerJobPanelClass = providerJobDashboardClass;
