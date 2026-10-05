import { downloadBlobFile } from "@/utils/dom/downloadBlobFile";
import type { NormalizedStagingProviderInsurerRow } from "./normalizer";

function escapeCsvCell(value: string): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

/** Export current filtered staging rows for one inward. */
export function downloadBulkIcMappingStagingReport(
  rows: NormalizedStagingProviderInsurerRow[],
  inwardNo: string,
) {
  const header = [
    "Sr. No.",
    "Provider Name",
    "Rohini Code",
    "City",
    "State",
    "Pincode",
    "Status",
    "Reason",
  ];

  const lines = rows.map((row, index) => [
    String(index + 1),
    row.providerName,
    row.providerIibRohiniCode,
    row.providerAddressCity,
    row.providerAddressState,
    row.providerAddressPostalCode,
    row.providerStatus,
    row.providerStatusReason,
  ]);

  const csv = [header, ...lines]
    .map((cols) => cols.map((val) => escapeCsvCell(String(val))).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlobFile({
    blob,
    filename: `bulk-ic-mapping-staging-${inwardNo}.csv`,
  });
}
