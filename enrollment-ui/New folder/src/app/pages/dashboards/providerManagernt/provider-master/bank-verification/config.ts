import type { CellStyle } from "ag-grid-community";
import {
  buildInwardDocumentViewPath,
  INWARD_DOCUMENT_VIEW_PATH_PREFIX,
  type InwardDocumentNavState,
} from "../../shared/inwardDocumentView";
import { loadIcProvisionRows } from "../ic-provisioning/storage";

export const BANK_VERIFICATION_LIST_PATH = "/provider-masters/bank-verification";
export const BANK_VERIFICATION_UPLOAD_PATH = `${BANK_VERIFICATION_LIST_PATH}/upload`;
export const BANK_VERIFICATION_INWARD_PATH_PREFIX = `${BANK_VERIFICATION_LIST_PATH}/inward`;

export function buildBankVerificationInwardPath(inwardNo: string): string {
  return `${BANK_VERIFICATION_INWARD_PATH_PREFIX}/${encodeURIComponent(inwardNo.trim())}`;
}

export function isBankVerificationUploadPathname(pathname: string): boolean {
  return (
    pathname === BANK_VERIFICATION_UPLOAD_PATH ||
    pathname.startsWith(`${BANK_VERIFICATION_UPLOAD_PATH}/`) ||
    pathname.startsWith(`${BANK_VERIFICATION_INWARD_PATH_PREFIX}/`)
  );
}

export {
  buildInwardDocumentViewPath,
  INWARD_DOCUMENT_VIEW_PATH_PREFIX,
  type InwardDocumentNavState as BankVerificationInwardDocumentNavState,
};
export const BANK_VERIFICATION_GRID_CELL_STYLE: CellStyle = {
  fontSize: "11px",
  lineHeight: "1.25rem",
};

export const BANK_VERIFICATION_S3_BUCKET = "provider";
/** Scan-upload subcategory for bulk IC-provider bank details. */
export const BANK_VERIFICATION_S3_SUB_BUCKET = "BANK DETAILS";
export const BANK_VERIFICATION_DOCUMENT_TYPE = "INSURER_BANK_ACCOUNT_DETAILS";
/** Supporting .eml uploaded against the same inward after the data file. */
export const BANK_VERIFICATION_EMAIL_DOCUMENT_TYPE = "SUPPLIMENTRY_DOCUMENT";
export const BANK_VERIFICATION_INWARD_RECEIVED_CHANNEL = "EMAIL";
export const BANK_VERIFICATION_INWARD_PRIORITY = "HIGH";
export const BANK_VERIFICATION_PROVIDER_JOB_LAUNCH_PATH = "/v1/provider-bank-job/launch";
export const BANK_VERIFICATION_PROVIDER_JOB_STATUS_PATH = "/v1/provider-bank-job/status";

const IC_NAME_BY_CODE: Record<string, string> = {
  UIIC: "United India Insurance",
  NIA: "New India Assurance",
  MAGMA: "Magma HDI General Insurance",
};

export type ConfiguredIcOption = {
  value: string;
  label: string;
  icCode: string;
  insurerName: string;
};

export function getConfiguredIcOptions(): ConfiguredIcOption[] {
  return loadIcProvisionRows()
    .filter((row) => row.configType.toLowerCase().includes("bank"))
    .map((row) => {
      const insurerName = IC_NAME_BY_CODE[row.icCode] ?? row.icCode;
      return {
        value: row.id,
        label: `${row.icCode} (${insurerName})`,
        icCode: row.icCode,
        insurerName,
      };
    });
}

export const DATA_FILE_ACCEPT = ".csv,.xlsx,.xls,.pdf";
export const EMAIL_FILE_ACCEPT = ".eml";

const DATA_FILE_MIME = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/pdf",
] as const;

const EMAIL_FILE_MIME = ["message/rfc822"] as const;

function isDataFileByName(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".pdf");
}

function isEmailFileByName(file: File): boolean {
  return file.name.toLowerCase().endsWith(".eml");
}

export function isBankVerificationDataFile(file: File): boolean {
  if (isDataFileByName(file)) return true;
  if (file.type && DATA_FILE_MIME.includes(file.type as (typeof DATA_FILE_MIME)[number])) {
    return true;
  }
  return false;
}

export function isBankVerificationEmailFile(file: File): boolean {
  if (isEmailFileByName(file)) return true;
  if (file.type && EMAIL_FILE_MIME.includes(file.type as (typeof EMAIL_FILE_MIME)[number])) {
    return true;
  }
  return false;
}
