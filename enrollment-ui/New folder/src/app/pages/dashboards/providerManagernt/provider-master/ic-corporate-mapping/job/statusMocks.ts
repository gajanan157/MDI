import type { NormalizedProviderJobStatus, ProviderJobStatus } from "./statusTypes";

const BASE_INWARD = "W68645547218224";

const MOCK_STARTING: NormalizedProviderJobStatus = {
  inwardNo: BASE_INWARD,
  jobStatus: "STARTING",
  startTime: "2026-05-28T10:15:00+05:30",
  endTime: "",
  progress: {
    stagingStep: {
      status: "STARTING",
      rowsRead: 0,
      rowsWritten: 0,
      totalRows: 34,
      created: 0,
      alreadyMapped: 0,
      mapped: 0,
      failed: 0,
    },
    mappingStep: {
      status: "PENDING",
      rowsRead: 0,
      rowsWritten: 0,
      totalRows: 0,
      created: 0,
      alreadyMapped: 0,
      mapped: 0,
      failed: 0,
    },
  },
  error: null,
};

const MOCK_STARTED: NormalizedProviderJobStatus = {
  inwardNo: BASE_INWARD,
  jobStatus: "STARTED",
  startTime: "2026-05-28T10:15:00+05:30",
  endTime: "",
  progress: {
    stagingStep: {
      status: "COMPLETED",
      rowsRead: 183,
      rowsWritten: 183,
      totalRows: 183,
      created: 0,
      alreadyMapped: 0,
      mapped: 0,
      failed: 0,
    },
    mappingStep: {
      status: "STARTED",
      rowsRead: 180,
      rowsWritten: 90,
      totalRows: 180,
      created: 89,
      alreadyMapped: 1,
      mapped: 0,
      failed: 0,
    },
  },
  error: null,
};

const MOCK_COMPLETED: NormalizedProviderJobStatus = {
  inwardNo: BASE_INWARD,
  jobStatus: "COMPLETED",
  startTime: "2026-05-28T10:15:00+05:30",
  endTime: "2026-05-28T10:22:14+05:30",
  progress: {
    stagingStep: {
      status: "COMPLETED",
      rowsRead: 183,
      rowsWritten: 183,
      totalRows: 183,
      created: 0,
      alreadyMapped: 0,
      mapped: 0,
      failed: 0,
    },
    mappingStep: {
      status: "COMPLETED",
      rowsRead: 180,
      rowsWritten: 180,
      totalRows: 180,
      created: 165,
      alreadyMapped: 10,
      mapped: 3,
      failed: 2,
    },
  },
  error: null,
};

const MOCK_FAILED: NormalizedProviderJobStatus = {
  inwardNo: BASE_INWARD,
  jobStatus: "FAILED",
  startTime: "2026-05-28T10:15:00+05:30",
  endTime: "2026-05-28T10:16:02+05:30",
  progress: {
    stagingStep: {
      status: "FAILED",
      rowsRead: 0,
      rowsWritten: 0,
      totalRows: 0,
      created: 0,
      alreadyMapped: 0,
      mapped: 0,
      failed: 0,
    },
    mappingStep: {
      status: "PENDING",
      rowsRead: 0,
      rowsWritten: 0,
      totalRows: 0,
      created: 0,
      alreadyMapped: 0,
      mapped: 0,
      failed: 0,
    },
  },
  error: {
    userMessage: "Bulk upload validation failed. Please fix the file and re-upload.",
    errorCode: "BULK_VALIDATION_001",
    failedStep: "Staging",
    technicalDetail: [
      "Missing Columns:",
      "- Rohini ID",
      "- Hospital Name",
      "- Hospital Address",
      "- City",
      "- State",
      "- Pin Code",
      "- Open/Valued",
      "Column Count Mismatch",
      "Expected: 7",
      "Actual: 8",
    ].join("\n"),
  },
  validationErrors: [
    {
      sheet: "Sheet1",
      rowType: "BLACKLISTED",
      missingColumns: [
        "Final ID",
        "Provider name",
        "Std City",
        "Address",
        "Pin Code",
        "Effective Date",
      ],
    },
  ],
};

const MOCK_STOPPED: NormalizedProviderJobStatus = {
  inwardNo: BASE_INWARD,
  jobStatus: "STOPPED",
  startTime: "2026-05-28T10:15:00+05:30",
  endTime: "2026-05-28T10:18:40+05:30",
  progress: {
    stagingStep: {
      status: "COMPLETED",
      rowsRead: 183,
      rowsWritten: 183,
      totalRows: 183,
      created: 0,
      alreadyMapped: 0,
      mapped: 0,
      failed: 0,
    },
    mappingStep: {
      status: "STOPPED",
      rowsRead: 180,
      rowsWritten: 45,
      totalRows: 180,
      created: 40,
      alreadyMapped: 5,
      mapped: 0,
      failed: 0,
    },
  },
  error: null,
};

export const PROVIDER_JOB_STATUS_MOCKS: Record<ProviderJobStatus, NormalizedProviderJobStatus> = {
  STARTING: MOCK_STARTING,
  STARTED: MOCK_STARTED,
  COMPLETED: MOCK_COMPLETED,
  FAILED: MOCK_FAILED,
  STOPPED: MOCK_STOPPED,
};

export function getProviderJobStatusMock(status: ProviderJobStatus): NormalizedProviderJobStatus {
  return PROVIDER_JOB_STATUS_MOCKS[status];
}

/** Raw API envelope mocks for local testing. */
export const PROVIDER_JOB_STATUS_API_MOCKS: Record<ProviderJobStatus, { data: NormalizedProviderJobStatus }> =
  {
    STARTING: { data: MOCK_STARTING },
    STARTED: { data: MOCK_STARTED },
    COMPLETED: { data: MOCK_COMPLETED },
    FAILED: { data: MOCK_FAILED },
    STOPPED: { data: MOCK_STOPPED },
  };
