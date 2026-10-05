import type { AxiosInstance } from "axios";
import { masterApi } from "@/app/api/apiService";
import { showErrorMessage } from "@/utils/errorHandler";

type ExportPayload = Record<string, any>;

type DownloadExportFileOptions<TPayload extends ExportPayload> = {
  apiEndpoint: string;
  payload: TPayload;
  /**
   * Base filename without extension (recommended).
   * Examples:
   * - "blacklisted-hospitals" -> "...xlsx" / "...csv"
   * - "file.csv" -> kept as-is
   */
  filename: string;
  apiClient?: AxiosInstance;
};

const inferExtensionFromContentType = (contentType: string): string => {
  const ct = contentType.toLowerCase();

  if (
    ct.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ) ||
    ct.includes("application/vnd.ms-excel")
  ) {
    return "xlsx";
  }

  if (ct.includes("text/csv") || ct.includes("application/csv")) return "csv";

  if (ct.includes("application/pdf")) return "pdf";

  return "csv";
};

const ensureFilenameHasExtension = (filename: string, ext: string) => {
  if (filename.includes(".")) return filename;
  return `${filename}.${ext}`;
};

/**
 * Generic "export file" helper:
 * - POSTs payload to backend
 * - Expects binary blob in response
 * - Triggers download on the client
 */
export async function downloadExportFile<TPayload extends ExportPayload>({
  apiEndpoint,
  payload,
  filename,
  apiClient = masterApi,
}: DownloadExportFileOptions<TPayload>): Promise<void> {
  try {
    const res = await apiClient.post(apiEndpoint, payload, {
      responseType: "blob",
    });

    const contentType = (res.headers?.["content-type"] as string | undefined) ?? "";
    const ext = inferExtensionFromContentType(contentType);

    const blob = new Blob([res.data], {
      type: contentType || "application/octet-stream",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ensureFilenameHasExtension(filename, ext);
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    showErrorMessage({
      status: err?.status ?? err?.response?.status,
      error: err?.error ?? err?.message,
    });
    throw err;
  }
}

