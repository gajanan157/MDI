import { downloadBlobFile } from "@/utils/dom/downloadBlobFile";
import type { BulkIcMappingInwardRow } from "./rows";

function escapeCsvCell(value: string): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

/** Export current filtered inward rows (dummy data until API is wired). */
export function downloadBulkIcMappingInwardReport(rows: BulkIcMappingInwardRow[]) {
  const header = [
    "Inward Number",
    "Inward Date & Time",
    "Inward Type",
    "Insurer Name",
  ];

  const lines = rows.map((row) => [
    row.inwardNo,
    row.createdAt,
    row.inwardType,
    row.insurerName,
  ]);

  const csv = [header, ...lines]
    .map((cols) => cols.map((val) => escapeCsvCell(String(val))).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlobFile({ blob, filename: "bulk-ic-mapping-inward.csv" });
}
