/**
 * Bulk IC / Corporate hospital-list upload inward listing.
 * Grid data is loaded from `GET v1/files/inwards` (see bulkIcMappingInwardAPI.ts).
 */

export type BulkIcMappingInwardStatus =
  | "COMPLETED"
  | "QC_PENDING"
  | "PROCESSOR_PENDING"
  | "REJECTED_INWARD";

export type BulkIcMappingInwardRow = {
  id: string;
  inwardNo: string;
  policyNo: string;
  insurerName: string;
  corporateName: string;
  fileName: string;
  createdAt: string;
  documentType: string;
  inwardType: string;
  uploadedByName: string;
  recordStatus: string;
  status: BulkIcMappingInwardStatus;
  inwardSourceEntityId: string;
  inwardSourceEntityType: string;
  inwardReceivedTpaBranchId: string;
  departmentId: string;
  /** Optional — carried from Provider Dashboard for job-launch file lookup. */
  s3BucketName?: string;
  s3SubBucketName?: string;
};

/** Minimal row so staging can open from Provider Dashboard without the IC mapping list API. */
export function createMinimalBulkIcMappingInwardRow(
  inwardNo: string,
  extras?: Partial<BulkIcMappingInwardRow>,
): BulkIcMappingInwardRow {
  const trimmed = inwardNo.trim();
  return {
    policyNo: "",
    insurerName: "",
    corporateName: "",
    fileName: "",
    createdAt: "",
    documentType: "PROVIDER_IC_NETWORK_RECORDS",
    inwardType: "",
    uploadedByName: "",
    recordStatus: "Active",
    status: "PROCESSOR_PENDING",
    inwardSourceEntityId: "",
    inwardSourceEntityType: "",
    inwardReceivedTpaBranchId: "",
    departmentId: "",
    ...extras,
    id: trimmed,
    inwardNo: trimmed,
  };
}


export const BULK_IC_MAPPING_INWARD_STATUS_CLASS: Record<BulkIcMappingInwardStatus, string> = {
  COMPLETED: "rounded px-1.5 py-0.5 text-[10px] font-semibold bg-green-100 text-green-800",
  QC_PENDING: "rounded px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800",
  PROCESSOR_PENDING: "rounded px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-800",
  REJECTED_INWARD: "rounded px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800",
};

export type BulkIcMappingUploadMeta = {
  entity: "ic" | "corporate";
  fileName: string;
  insurerLabel: string;
  corporateLabel: string;
  inwardNo: string;
};
