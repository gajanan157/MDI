import { PROVIDER_JOB_STATUS_API_KEYS as KEYS } from "./statusFieldKeys";
import type {
  NormalizedProviderJobError,
  NormalizedProviderJobStatus,
  NormalizedProviderJobStep,
  NormalizedProviderJobValidationError,
  ProviderJobStatus,
  ProviderJobStepStatus,
} from "./statusTypes";

const EMPTY_STEP: NormalizedProviderJobStep = {
  status: "PENDING",
  rowsRead: 0,
  rowsWritten: 0,
  totalRows: 0,
  created: 0,
  alreadyMapped: 0,
  mapped: 0,
  failed: 0,
};

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = Number(record[key]);
  return Number.isFinite(value) ? value : 0;
}

function normalizeStepStatus(value: string): ProviderJobStepStatus {
  const normalized = value.trim().toUpperCase();
  if (
    normalized === "PENDING" ||
    normalized === "STARTING" ||
    normalized === "STARTED" ||
    normalized === "COMPLETED" ||
    normalized === "FAILED" ||
    normalized === "STOPPED"
  ) {
    return normalized;
  }
  return "PENDING";
}

function normalizeJobStatus(value: string): ProviderJobStatus {
  const normalized = value.trim().toUpperCase();
  if (
    normalized === "STARTING" ||
    normalized === "STARTED" ||
    normalized === "COMPLETED" ||
    normalized === "FAILED" ||
    normalized === "STOPPED"
  ) {
    return normalized;
  }
  return "STARTING";
}

function normalizeStep(record: unknown): NormalizedProviderJobStep {
  if (!isApiRecord(record)) return { ...EMPTY_STEP };

  return {
    status: normalizeStepStatus(readString(record, KEYS.stepStatus)),
    rowsRead: readNumber(record, KEYS.rowsRead),
    rowsWritten: readNumber(record, KEYS.rowsWritten),
    totalRows: readNumber(record, KEYS.totalRows),
    created: readNumber(record, KEYS.created),
    alreadyMapped: readNumber(record, KEYS.alreadyMapped),
    mapped: readNumber(record, KEYS.mapped),
    failed: readNumber(record, KEYS.failed),
  };
}

function normalizeJobError(record: Record<string, unknown>): NormalizedProviderJobError | null {
  const nestedError = normalizeError(record[KEYS.error]);
  const userMessage =
    readString(record, KEYS.userMessage) ||
    readString(record, KEYS.message) ||
    nestedError?.userMessage ||
    "";
  const errorCode = nestedError?.errorCode || readString(record, KEYS.errorCode);
  const failedStep = readString(record, KEYS.failedStep) || nestedError?.failedStep || "";
  const technicalDetail =
    readString(record, KEYS.technicalDetail) || nestedError?.technicalDetail || "";

  if (!userMessage && !errorCode && !failedStep && !technicalDetail) {
    return nestedError;
  }

  return {
    userMessage,
    errorCode,
    failedStep,
    technicalDetail,
  };
}

function normalizeValidationErrors(
  value: unknown,
): NormalizedProviderJobValidationError[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isApiRecord)
    .map((entry) => {
      const rawColumns = entry[KEYS.missingColumns];
      const missingColumns = Array.isArray(rawColumns)
        ? rawColumns.map((column) => String(column ?? "").trim()).filter(Boolean)
        : [];
      return {
        sheet: readString(entry, KEYS.sheet),
        rowType: readString(entry, KEYS.rowType),
        missingColumns,
      };
    })
    .filter((entry) => entry.missingColumns.length > 0);
}

function unwrapJobPayload(payload: unknown): Record<string, unknown> | null {
  if (!isApiRecord(payload)) return null;
  if (isApiRecord(payload[KEYS.data])) {
    return payload[KEYS.data] as Record<string, unknown>;
  }
  return payload;
}

/** Normalizes `GET /v1/provider-job/status` body once at the API boundary. */
export function normalizeProviderJobStatus(payload: unknown): NormalizedProviderJobStatus | null {
  const record = unwrapJobPayload(payload);
  if (!record) return null;

  const inwardNo = readString(record, KEYS.inwardNo);
  if (!inwardNo) return null;

  const progressValue = record[KEYS.progress];
  const progressRecord = isApiRecord(progressValue) ? progressValue : null;

  return {
    inwardNo,
    jobStatus: normalizeJobStatus(readString(record, KEYS?.jobStatus)),
    startTime: readString(record, KEYS?.startTime),
    endTime: readString(record, KEYS?.endTime),
    progress: {
      stagingStep: normalizeStep(progressRecord?.[KEYS.stagingStep]),
      mappingStep: normalizeStep(progressRecord?.[KEYS.mappingStep]),
    },
    error: normalizeJobError(record),
    validationErrors: normalizeValidationErrors(record[KEYS.validationErrors]),
  };
}

function normalizeError(record: unknown): NormalizedProviderJobError | null {
  if (!isApiRecord(record)) return null;

  const userMessage =
    readString(record, KEYS.userMessage) || readString(record, KEYS.message);
  const errorCode = readString(record, KEYS.errorCode);
  const failedStep = readString(record, KEYS.failedStep);
  const technicalDetail = readString(record, KEYS.technicalDetail);

  if (!userMessage && !errorCode && !failedStep && !technicalDetail) {
    return null;
  }

  return { userMessage, errorCode, failedStep, technicalDetail };
}

function readEnvelopeMessage(payload: Record<string, unknown>): string {
  return readString(payload, KEYS.message);
}

/** Handles HTTP 400 envelopes: `{ success: false, message, data, error }`. */
export function normalizeProviderJobStatusFromEnvelope(
  payload: unknown,
): NormalizedProviderJobStatus | null {
  const job = normalizeProviderJobStatus(payload);
  if (!job || !isApiRecord(payload)) return job;

  const rootMessage = readEnvelopeMessage(payload);
  const rootError = normalizeError(payload[KEYS.error]);

  if (rootError) {
    return {
      ...job,
      error: {
        ...job.error,
        ...rootError,
        userMessage: job.error?.userMessage || rootError.userMessage || rootMessage,
      },
    };
  }

  if (job.jobStatus === "FAILED") {
    const dataMessage = readString(unwrapJobPayload(payload) ?? {}, KEYS.message);
    const userMessage = job.error?.userMessage || rootMessage || dataMessage;
    const failedStep = job.error?.failedStep || "";
    const technicalDetail = job.error?.technicalDetail || "";

    if (userMessage || failedStep || technicalDetail || job.error?.errorCode) {
      return {
        ...job,
        error: {
          userMessage,
          errorCode: job.error?.errorCode || "",
          failedStep,
          technicalDetail,
        },
      };
    }
  }

  return job;
}
