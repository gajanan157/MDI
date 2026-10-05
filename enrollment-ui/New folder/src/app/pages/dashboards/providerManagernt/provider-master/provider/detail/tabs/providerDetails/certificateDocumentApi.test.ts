import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchCertificateDocumentPresign,
  viewProviderCertificate,
} from "./certificateDocumentApi";

const mocks = vi.hoisted(() => ({
  getPresignDownloadList: vi.fn(),
  showProviderError: vi.fn(),
}));

vi.mock("@/services/presignFilesApi", () => ({
  getPresignDownloadList: mocks.getPresignDownloadList,
  parsePresignListResponse: (data: unknown) => {
    if (data && typeof data === "object" && "content" in data) {
      const content = (data as { content?: unknown[] }).content;
      return { items: Array.isArray(content) ? content : [], totalElements: 0, page: 0, size: 1 };
    }
    return { items: [], totalElements: 0, page: 0, size: 1 };
  },
}));

vi.mock(
  "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog",
  () => ({
    showProviderError: mocks.showProviderError,
  }),
);

describe("viewProviderCertificate", () => {
  beforeEach(() => {
    mocks.getPresignDownloadList.mockReset();
    mocks.showProviderError.mockReset();
    vi.stubGlobal("open", vi.fn());
  });

  it("shows a centered error when fileMetadataId is missing", async () => {
    await viewProviderCertificate(null, "Certificate file is not available.");

    expect(mocks.showProviderError).toHaveBeenCalledWith(
      "Certificate file is not available.",
      404,
    );
    expect(mocks.getPresignDownloadList).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("opens the presigned URL when fileMetadataId is present", async () => {
    mocks.getPresignDownloadList.mockResolvedValue({
      success: true,
      data: {
        content: [{ presignedUrl: "https://files.example/cert.pdf", originalFileName: "cert.pdf" }],
      },
    });

    await viewProviderCertificate("meta-1", "Certificate file is not available.");

    expect(mocks.getPresignDownloadList).toHaveBeenCalledWith(
      expect.objectContaining({ fileMetadataId: "meta-1", s3BucketName: "provider" }),
    );
    expect(window.open).toHaveBeenCalledWith(
      "https://files.example/cert.pdf",
      "_blank",
      "noopener,noreferrer",
    );
    expect(mocks.showProviderError).not.toHaveBeenCalled();
  });
});

describe("fetchCertificateDocumentPresign", () => {
  beforeEach(() => {
    mocks.getPresignDownloadList.mockReset();
  });

  it("returns false when fileMetadataId is empty", async () => {
    await expect(fetchCertificateDocumentPresign("  ")).resolves.toEqual({
      ok: false,
      message: "File metadata id is required.",
    });
  });
});
