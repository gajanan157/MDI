import type {
  NormalizedProviderJobStatus,
  NormalizedProviderJobStep,
  ProviderJobActiveProgress,
  ProviderJobDashboardView,
  ProviderJobProgressDisplay,
  ProviderJobStepProgressDisplay,
  ProviderJobStepStatus,
  ProviderJobSummaryCounts,
} from "./statusTypes";
import { parseJobTechnicalDetail } from "./errorUtils";

export function getProviderJobSummaryCounts(
  job: NormalizedProviderJobStatus,
): ProviderJobSummaryCounts {
  const mapping = job.progress.mappingStep;
  return {
    created: mapping.created,
    alreadyMapped: mapping.alreadyMapped,
    mapped: mapping.mapped,
    failed: mapping.failed,
  };
}

function isStepInProgress(status: ProviderJobStepStatus): boolean {
  return status === "STARTING" || status === "STARTED";
}

/** Resolves the single dashboard card that should be visible. */
export function resolveProviderJobDashboardView(
  job: NormalizedProviderJobStatus,
): ProviderJobDashboardView {
  const staging = job.progress.stagingStep;
  const mapping = job.progress.mappingStep;

  if (
    job.jobStatus === "FAILED" ||
    staging.status === "FAILED" ||
    mapping.status === "FAILED"
  ) {
    return "failed";
  }

  if (
    job.jobStatus === "STOPPED" ||
    staging.status === "STOPPED" ||
    mapping.status === "STOPPED"
  ) {
    return "stopped";
  }

  // The top-level jobStatus is the source of truth for "completed" — a step
  // can report COMPLETED slightly before the backend flips the overall job
  // status, so don't let the step alone close out the dashboard early.
  if (job.jobStatus === "COMPLETED") {
    return "completed";
  }

  if (
    staging.status === "COMPLETED" &&
    (isStepInProgress(mapping.status) || mapping.status === "COMPLETED")
  ) {
    return "mapping";
  }

  if (isStepInProgress(staging.status) || staging.status === "PENDING") {
    return "staging";
  }

  if (staging.status === "COMPLETED") {
    return "mapping";
  }

  return "staging";
}

/** True while job status is loading or still on staging/mapping dashboard views. */
export function isProviderJobStillProcessing(
  job: NormalizedProviderJobStatus | null | undefined,
  isLoading: boolean,
): boolean {
  if (isLoading && !job) return true;
  if (!job) return false;
  const view = resolveProviderJobDashboardView(job);
  return view === "staging" || view === "mapping";
}

export function resolveStepTotal(
  step: NormalizedProviderJobStep,
  fallbackTotal = 0,
): number {
  if (step.totalRows > 0) return step.totalRows;
  // Mapping step often omits totalRows; use staging file total before rowsRead.
  if (fallbackTotal > 0) return fallbackTotal;
  if (step.rowsRead > 0) return step.rowsRead;
  return 0;
}

export function calculateStepProgress(
  step: NormalizedProviderJobStep,
  options?: { fallbackTotal?: number },
): ProviderJobStepProgressDisplay {
  const total = resolveStepTotal(step, options?.fallbackTotal ?? 0);
  const processed = step.rowsWritten;

  if (total <= 0) {
    return {
      processed,
      total: 0,
      percent: isStepInProgress(step.status) ? 0 : 100,
      indeterminate: isStepInProgress(step.status),
    };
  }

  const percent = Math.min(100, Math.round((processed / total) * 100));
  return {
    processed,
    total,
    percent,
    indeterminate: false,
  };
}

/**
 * Single combined progress bar across both steps:
 * staging fills 0–50%, mapping fills 50–100%, and a COMPLETED job reads 100%.
 */
export const PROVIDER_JOB_STAGING_PROGRESS_WEIGHT = 50;

export function calculateActiveJobProgress(
  job: NormalizedProviderJobStatus,
): ProviderJobActiveProgress {
  const view = resolveProviderJobDashboardView(job);
  const staging = job.progress.stagingStep;
  const mapping = job.progress.mappingStep;
  const weight = PROVIDER_JOB_STAGING_PROGRESS_WEIGHT;

  // Same rule as resolveProviderJobDashboardView: only the top-level jobStatus
  // can close out the bar. A step reporting COMPLETED on its own still caps
  // out at 99% so the bar doesn't disappear before the job truly finishes.
  const mappingCompleted = job.jobStatus === "COMPLETED";

  if (view === "mapping" || mappingCompleted) {
    const stepProgress = calculateStepProgress(mapping, {
      fallbackTotal: staging.totalRows,
    });
    const combinedPercent = mappingCompleted
      ? 100
      : Math.min(
          99,
          weight + Math.round((stepProgress.percent / 100) * (100 - weight)),
        );

    return {
      view: "mapping",
      stepLabel: "Mapping",
      progress: {
        processed: stepProgress.processed,
        total: stepProgress.total,
        percent: combinedPercent,
        indeterminate: stepProgress.indeterminate && combinedPercent <= weight,
      },
      showBar: !mappingCompleted,
      barClassName: "bg-blue-600",
    };
  }

  const stepProgress = calculateStepProgress(staging);
  const stagingCompleted = staging.status === "COMPLETED";
  const combinedPercent = stagingCompleted
    ? weight
    : Math.min(weight - 1, Math.round((stepProgress.percent / 100) * weight));

  return {
    view: "staging",
    stepLabel: "Staging",
    progress: {
      processed: stepProgress.processed,
      total: stepProgress.total,
      percent: combinedPercent,
      indeterminate: stepProgress.indeterminate && combinedPercent === 0,
    },
    showBar: true,
    barClassName: "bg-blue-600",
  };
}

export function formatStepProgressLabel(step: NormalizedProviderJobStep, fallbackTotal = 0): string {
  const total = resolveStepTotal(step, fallbackTotal);
  if (total > 0) {
    return `${step.rowsWritten} / ${total}`;
  }
  return `${step.rowsWritten}`;
}

const PROVIDER_JOB_FAILED_STEP_LABELS: Record<string, string> = {
  providerfileformatvalidationstep: "File Format Validation",
};

function isAsciiUpper(ch: string): boolean {
  return ch >= "A" && ch <= "Z";
}

function isAsciiLower(ch: string): boolean {
  return ch >= "a" && ch <= "z";
}

function isAsciiDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

/** Linear-time camelCase splitter (avoids ReDoS-prone regex backtracking). */
function splitCamelCaseLabel(label: string): string[] {
  if (!label) return [];

  const words: string[] = [];
  let wordStart = 0;

  const pushWord = (end: number) => {
    if (end > wordStart) {
      words.push(label.slice(wordStart, end));
    }
    wordStart = end;
  };

  for (let i = 0; i < label.length; i++) {
    const ch = label[i];
    const prev = i > 0 ? label[i - 1] : "";
    const next = i + 1 < label.length ? label[i + 1] : "";

    if (isAsciiUpper(ch) && (isAsciiLower(prev) || isAsciiDigit(prev))) {
      pushWord(i);
      wordStart = i;
      continue;
    }

    if (isAsciiUpper(ch) && isAsciiUpper(prev) && isAsciiLower(next)) {
      pushWord(i);
      wordStart = i;
    }
  }

  pushWord(label.length);
  return words;
}

function stripProviderJobStepAffixes(value: string): string {
  let label = value;
  if (label.toLowerCase().startsWith("provider")) {
    label = label.slice("provider".length);
  }
  if (label.toLowerCase().endsWith("step")) {
    label = label.slice(0, -"step".length);
  }
  return label;
}

/** Turns backend step ids like `providerFileFormatValidationStep` into readable labels. */
export function formatProviderJobFailedStepLabel(failedStep: string): string {
  const trimmed = failedStep.trim();
  if (!trimmed) return "Unknown";

  const knownLabel = PROVIDER_JOB_FAILED_STEP_LABELS[trimmed.toLowerCase()];
  if (knownLabel) return knownLabel;

  const label = stripProviderJobStepAffixes(trimmed);
  const words = splitCamelCaseLabel(label);
  if (words.length === 0) return trimmed;

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function resolveProviderJobFailedStage(job: NormalizedProviderJobStatus): string {
  const failedStep = job.error?.failedStep.trim() ?? "";

  if (failedStep) {
    const normalized = failedStep.toLowerCase();
    if (normalized.includes("mapping")) return "Mapping";
    if (normalized.includes("staging")) return "Staging";
    return formatProviderJobFailedStepLabel(failedStep);
  }

  if (job.progress.mappingStep.status === "FAILED") return "Mapping";
  if (job.progress.stagingStep.status === "FAILED") return "Staging";
  return "Unknown";
}

export function resolveProviderJobErrorMessage(job: NormalizedProviderJobStatus): string {
  const userMessage = job.error?.userMessage.trim() ?? "";
  if (userMessage) return userMessage;

  const technicalDetail = job.error?.technicalDetail.trim() ?? "";
  if (technicalDetail) {
    const sections = parseJobTechnicalDetail(technicalDetail).filter(
      (section) => section.bullets.length > 0 || section.lines.length > 0,
    );

    if (sections.length > 0) {
      return sections
        .map((section) => {
          const parts = [
            section.title,
            ...section.bullets,
            ...section.lines,
          ].filter(Boolean);
          return parts.join(". ");
        })
        .join(" ");
    }
  }

  return "The provider import process could not be completed.";
}

export function formatProviderJobDuration(startTime: string, endTime: string): string {
  if (!startTime.trim() || !endTime.trim()) return "—";

  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return "—";

  const diffSeconds = Math.max(0, (endMs - startMs) / 1000);
  if (diffSeconds < 1) return `${diffSeconds.toFixed(1)} Seconds`;
  if (diffSeconds < 60) {
    const roundedTenth = Math.round(diffSeconds * 10) / 10;
    return Number.isInteger(roundedTenth)
      ? `${roundedTenth} Seconds`
      : `${roundedTenth.toFixed(1)} Seconds`;
  }

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = Math.round(diffSeconds % 60);
  if (minutes < 60) {
    return seconds > 0 ? `${minutes} Min ${seconds} Sec` : `${minutes} Minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} Hr ${remainingMinutes} Min` : `${hours} Hours`;
}

export function getProviderJobActiveStep(job: NormalizedProviderJobStatus): number {
  return resolveProviderJobDashboardView(job) === "mapping" ? 1 : 0;
}

/** @deprecated Use resolveProviderJobDashboardView + calculateStepProgress for UI. */
export function calculateProviderJobProgress(
  job: NormalizedProviderJobStatus,
): ProviderJobProgressDisplay {
  const view = resolveProviderJobDashboardView(job);

  if (view === "failed") {
    return { value: 0, label: "", tone: "failed", showBar: false, indeterminate: false };
  }

  if (view === "completed") {
    return { value: 100, label: "Completed", tone: "completed", showBar: false, indeterminate: false };
  }

  if (view === "stopped") {
    return { value: 0, label: "Job stopped", tone: "stopped", showBar: false, indeterminate: false };
  }

  const step =
    view === "mapping" ? job.progress.mappingStep : job.progress.stagingStep;
  const progress =
    view === "mapping"
      ? calculateStepProgress(step, {
          fallbackTotal: job.progress.stagingStep.totalRows,
        })
      : calculateStepProgress(step);

  return {
    value: progress.percent,
    label: view === "mapping" ? "Mapping..." : "Staging...",
    tone: "processing",
    showBar: true,
    indeterminate: progress.indeterminate,
  };
}

export function isProviderJobTerminalStatus(status: string): boolean {
  return status === "COMPLETED" || status === "FAILED" || status === "STOPPED";
}
