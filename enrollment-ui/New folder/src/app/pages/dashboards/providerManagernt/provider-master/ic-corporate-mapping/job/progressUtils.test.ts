import { describe, expect, it } from "vitest";
import { normalizeProviderJobStatusFromEnvelope } from "./statusNormalizer";
import {
  calculateActiveJobProgress,
  calculateProviderJobProgress,
  calculateStepProgress,
  formatProviderJobDuration,
  formatProviderJobFailedStepLabel,
  PROVIDER_JOB_STAGING_PROGRESS_WEIGHT,
  resolveProviderJobDashboardView,
  resolveProviderJobFailedStage,
} from "./progressUtils";
import { getProviderJobStatusMock } from "./statusMocks";
import { parseJobTechnicalDetail } from "./errorUtils";

describe("normalizeProviderJobStatusFromEnvelope", () => {
  it("parses HTTP 400 envelope with failed job data", () => {
    const job = normalizeProviderJobStatusFromEnvelope({
      success: false,
      status: 400,
      message: "The uploaded file does not match the expected format.",
      data: {
        inwardNo: "W94536965196388",
        jobStatus: "FAILED",
        userMessage: "The uploaded file does not match the expected format.",
        failedStep: "providerFileFormatValidationStep",
        technicalDetail: "com.mdindiaonline.provider.common.exception.FileFormatValidationException",
      },
      error: {
        errorCode: "PROV-BATCH-400-20",
        failedStep: "providerFileFormatValidationStep",
      },
    });

    expect(job?.jobStatus).toBe("FAILED");
    expect(job?.error?.userMessage).toBe(
      "The uploaded file does not match the expected format.",
    );
  });

  it("normalizes validationErrors, keeping only entries with missing columns", () => {
    const job = normalizeProviderJobStatusFromEnvelope({
      success: false,
      status: 400,
      message: "The uploaded file does not match the expected format.",
      data: {
        inwardNo: "W36070621536065",
        jobStatus: "FAILED",
        failedStep: "blacklistFileFormatValidationStep",
        validationErrors: [
          {
            sheet: "Sheet1",
            rowType: "BLACKLISTED",
            missingColumns: ["Final ID", "Provider name", "  "],
            error: null,
          },
          { sheet: "Sheet2", rowType: "BLACKLISTED", missingColumns: [] },
        ],
      },
    });

    expect(job?.validationErrors).toEqual([
      {
        sheet: "Sheet1",
        rowType: "BLACKLISTED",
        missingColumns: ["Final ID", "Provider name"],
      },
    ]);
  });
});

describe("resolveProviderJobDashboardView", () => {
  it("shows staging while staging is in progress", () => {
    const job = getProviderJobStatusMock("STARTING");
    expect(resolveProviderJobDashboardView(job)).toBe("staging");
  });

  it("shows mapping when staging is complete and mapping is in progress", () => {
    const job = getProviderJobStatusMock("STARTED");
    expect(resolveProviderJobDashboardView(job)).toBe("mapping");
  });

  it("shows completed summary when job is completed", () => {
    const job = getProviderJobStatusMock("COMPLETED");
    expect(resolveProviderJobDashboardView(job)).toBe("completed");
  });

  it("shows failed summary when job failed", () => {
    const job = getProviderJobStatusMock("FAILED");
    expect(resolveProviderJobDashboardView(job)).toBe("failed");
  });

  it("shows stopped summary when job stopped", () => {
    const job = getProviderJobStatusMock("STOPPED");
    expect(resolveProviderJobDashboardView(job)).toBe("stopped");
  });

  it("keeps showing mapping (not completed) when the mapping step reports COMPLETED before jobStatus does", () => {
    // Backend can flip mappingStep.status to COMPLETED slightly ahead of the
    // overall jobStatus — the dashboard must not close out early on that alone.
    const job = normalizeProviderJobStatusFromEnvelope({
      success: true,
      status: 200,
      message: "Provider bank job is in progress",
      data: {
        inwardNo: "W1",
        jobStatus: "STARTED",
        startTime: "2026-09-04T18:34:31.65961",
        endTime: null,
        progress: {
          stagingStep: { status: "COMPLETED", rowsRead: 50000, rowsWritten: 50000, totalRows: 50000 },
          mappingStep: { status: "COMPLETED", rowsRead: 21704, rowsWritten: 21704, totalRows: 21704 },
        },
      },
    });
    expect(job).not.toBeNull();
    if (!job) return;

    expect(resolveProviderJobDashboardView(job)).toBe("mapping");
    const active = calculateActiveJobProgress(job);
    expect(active.showBar).toBe(true);
    expect(active.progress.percent).toBe(99);
  });
});

describe("calculateStepProgress", () => {
  it("calculates staging progress from rowsWritten and totalRows", () => {
    const job = getProviderJobStatusMock("STARTING");
    expect(calculateStepProgress(job.progress.stagingStep)).toMatchObject({
      processed: 0,
      total: 34,
      percent: 0,
    });
  });

  it("calculates mapping progress as half complete for STARTED mock", () => {
    const job = getProviderJobStatusMock("STARTED");
    expect(calculateStepProgress(job.progress.mappingStep)).toMatchObject({
      processed: 90,
      total: 180,
      percent: 50,
    });
  });

  it("uses staging totalRows when mapping step has no totalRows", () => {
    const job = normalizeProviderJobStatusFromEnvelope({
      success: true,
      status: 200,
      message: "Provider job is in progress",
      data: {
        inwardNo: "W11210290728316",
        jobStatus: "STARTED",
        startTime: "2026-06-16T14:17:38.121847",
        progress: {
          stagingStep: {
            status: "COMPLETED",
            rowsRead: 3002,
            rowsWritten: 3002,
            totalRows: 3002,
          },
          mappingStep: {
            status: "STARTED",
            rowsRead: 700,
            rowsWritten: 700,
          },
        },
      },
    });

    expect(job).not.toBeNull();
    if (!job) return;

    const active = calculateActiveJobProgress(job);
    expect(active.view).toBe("mapping");
    // Combined bar: mapping at 23% of its own step -> 50% + 23%*50% ≈ 62%.
    expect(active.progress).toMatchObject({
      processed: 700,
      total: 3002,
      percent: 62,
    });
    expect(active.showBar).toBe(true);
  });

  it("keeps the combined bar in the first half while staging runs", () => {
    const job = getProviderJobStatusMock("STARTING");
    const active = calculateActiveJobProgress(job);
    expect(active.view).toBe("staging");
    expect(active.progress.percent).toBeLessThanOrEqual(
      PROVIDER_JOB_STAGING_PROGRESS_WEIGHT,
    );
  });

  it("reads 50% once staging completes and mapping starts", () => {
    const job = normalizeProviderJobStatusFromEnvelope({
      success: true,
      status: 200,
      message: "in progress",
      data: {
        inwardNo: "W1",
        jobStatus: "STARTED",
        startTime: "2026-06-16T14:17:38.121847",
        progress: {
          stagingStep: { status: "COMPLETED", rowsRead: 100, rowsWritten: 100, totalRows: 100 },
          mappingStep: { status: "STARTED", rowsRead: 0, rowsWritten: 0, totalRows: 80 },
        },
      },
    });
    expect(job).not.toBeNull();
    if (!job) return;
    expect(calculateActiveJobProgress(job).progress.percent).toBe(50);
  });

  it("hides progress bar and reads 100% when mapping step is completed", () => {
    const job = getProviderJobStatusMock("COMPLETED");
    const active = calculateActiveJobProgress(job);
    expect(resolveProviderJobDashboardView(job)).toBe("completed");
    expect(active.showBar).toBe(false);
    expect(active.progress.percent).toBe(100);
  });
});

describe("providerJobProgressUtils", () => {
  it("returns 0% staging progress for STARTING", () => {
    const job = getProviderJobStatusMock("STARTING");
    expect(calculateProviderJobProgress(job)).toMatchObject({
      value: 0,
      label: "Staging...",
      tone: "processing",
      showBar: true,
    });
  });

  it("returns 50% when mapping is half complete", () => {
    const job = getProviderJobStatusMock("STARTED");
    expect(calculateProviderJobProgress(job).value).toBe(50);
  });

  it("returns 100% for COMPLETED", () => {
    const job = getProviderJobStatusMock("COMPLETED");
    expect(calculateProviderJobProgress(job)).toMatchObject({
      value: 100,
      tone: "completed",
    });
  });

  it("hides progress bar for FAILED", () => {
    const job = getProviderJobStatusMock("FAILED");
    expect(calculateProviderJobProgress(job).showBar).toBe(false);
  });

  it("formats short job duration in seconds", () => {
    expect(
      formatProviderJobDuration("2026-06-10T20:20:31.365318", "2026-06-10T20:20:32.870864"),
    ).toBe("1.5 Seconds");
  });

  it("resolves failed stage from staging step", () => {
    const job = getProviderJobStatusMock("FAILED");
    expect(resolveProviderJobFailedStage(job)).toBe("Staging");
  });

  it("formats backend failed step ids into readable stage labels", () => {
    expect(formatProviderJobFailedStepLabel("providerFileFormatValidationStep")).toBe(
      "File Format Validation",
    );
    expect(formatProviderJobFailedStepLabel("providerHTTPResponseStep")).toBe(
      "HTTP Response",
    );
  });

  it("resolves failed stage from error.failedStep when step status is not failed", () => {
    const job = normalizeProviderJobStatusFromEnvelope({
      success: false,
      status: 400,
      message: "The uploaded file does not match the expected format.",
      data: {
        inwardNo: "W94536965196388",
        jobStatus: "FAILED",
        userMessage: "The uploaded file does not match the expected format.",
        failedStep: "providerFileFormatValidationStep",
      },
    });

    expect(job).not.toBeNull();
    if (!job) return;

    expect(resolveProviderJobFailedStage(job)).toBe("File Format Validation");
  });
});

describe("parseJobTechnicalDetail", () => {
  it("parses missing columns and count mismatch sections", () => {
    const sections = parseJobTechnicalDetail(
      [
        "Missing Columns:",
        "- Rohini ID",
        "- Hospital Name",
        "Column Count Mismatch",
        "Expected: 7",
        "Actual: 8",
      ].join("\n"),
    );

    expect(sections[0]?.title).toBe("Missing Columns");
    expect(sections[0]?.bullets).toEqual(["Rohini ID", "Hospital Name"]);
    expect(sections[1]?.title).toBe("Column Count Mismatch");
    expect(sections[1]?.lines).toEqual(["Expected: 7", "Actual: 8"]);
  });
});
