export type ProviderJobStatus =
  | "STARTING"
  | "STARTED"
  | "COMPLETED"
  | "FAILED"
  | "STOPPED";

export type ProviderJobStepStatus =
  | "PENDING"
  | "STARTING"
  | "STARTED"
  | "COMPLETED"
  | "FAILED"
  | "STOPPED";

export type NormalizedProviderJobStep = {
  status: ProviderJobStepStatus;
  rowsRead: number;
  rowsWritten: number;
  totalRows: number;
  created: number;
  alreadyMapped: number;
  mapped: number;
  failed: number;
};

export type NormalizedProviderJobError = {
  userMessage: string;
  errorCode: string;
  failedStep: string;
  technicalDetail: string;
};

export type NormalizedProviderJobValidationError = {
  sheet: string;
  rowType: string;
  missingColumns: string[];
};

export type NormalizedProviderJobStatus = {
  inwardNo: string;
  jobStatus: ProviderJobStatus;
  startTime: string;
  endTime: string;
  progress: {
    stagingStep: NormalizedProviderJobStep;
    mappingStep: NormalizedProviderJobStep;
  };
  error: NormalizedProviderJobError | null;
  validationErrors?: NormalizedProviderJobValidationError[];
  validationFailedCount?: number;
  processingFailedCount?: number;
};

export type ProviderJobProgressDisplay = {
  value: number;
  label: string;
  tone: "starting" | "processing" | "completed" | "failed" | "stopped";
  showBar: boolean;
  indeterminate: boolean;
};

export type ProviderJobSummaryCounts = {
  created: number;
  alreadyMapped: number;
  mapped: number;
  failed: number;
};

/** Single visible dashboard state — only one card renders at a time. */
export type ProviderJobDashboardView =
  | "staging"
  | "mapping"
  | "completed"
  | "failed"
  | "stopped";

export type ProviderJobStepProgressDisplay = {
  processed: number;
  total: number;
  percent: number;
  indeterminate: boolean;
};

export type ProviderJobActiveProgress = {
  view: "staging" | "mapping";
  stepLabel: string;
  progress: ProviderJobStepProgressDisplay;
  showBar: boolean;
  barClassName: string;
};
