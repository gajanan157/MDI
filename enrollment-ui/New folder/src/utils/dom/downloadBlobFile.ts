type DownloadBlobFileOptions = {
  blob: Blob;
  filename: string;
};

/**
 * Simple client-side file downloader.
 * Useful when you already have the content as a Blob (CSV/XLSX/etc.).
 */
export function downloadBlobFile({ blob, filename }: DownloadBlobFileOptions) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function inferBlobExtension(blob: Blob): string {
  const contentType = blob.type.toLowerCase();

  if (contentType.includes("csv") || contentType.includes("text/csv")) {
    return "csv";
  }

  if (contentType.includes("pdf")) {
    return "pdf";
  }

  return "xlsx";
}

/** Download a blob using a base filename; extension is inferred from blob type. */
export function downloadBlobFileWithExtension(
  baseFilename: string,
  blob: Blob,
): void {
  const filename = baseFilename.includes(".")
    ? baseFilename
    : `${baseFilename}.${inferBlobExtension(blob)}`;
  downloadBlobFile({ blob, filename });
}

