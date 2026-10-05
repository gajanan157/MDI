import { downloadBlobFile } from "@/utils/dom/downloadBlobFile";
import type { ProviderInwardRow } from "./providerInwardTypes";

function escapeCsvCell(value: string): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function downloadProviderInwardReport(rows: ProviderInwardRow[]) {
  const header = [
    "Inward No.",
    "Created Date",
    "Source Entity",
    "Document Type",
    "Subcategory",
    "Status",
    "Assigned To",
    "Created By",
  ];

  const lines = rows.map((row) => [
    row.inwardNo,
    row.createdDate,
    row.sourceEntity,
    row.documentType,
    row.subcategory,
    row.statusLabel,
    row.assignedTo,
    row.createdBy,
  ]);

  const csv = [header, ...lines]
    .map((cols) => cols.map((val) => escapeCsvCell(String(val))).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlobFile({ blob, filename: "provider-inward-dashboard.csv" });
}
