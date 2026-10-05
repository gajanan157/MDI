import type { TFunction } from "i18next";
import type { BankFormValues } from "../../../schemas";
import type { HospitalDetailRecord } from "../../../../hospitalData";
import {
  BANK_FORM_API_FIELDS,
  type BankTabFieldsFromApi,
} from "../../../utils/sectionMerges/bank/bankTypes";
import type { ProviderAuditLogContext } from "../../../shared/providerAuditLog";
import {
  BANK_DETAILS_AUDIT_TAB_ID,
  EMPTY_BANK_FORM,
} from "./bankDetailsConfig";
import {
  BANK_DOCUMENT_TYPE_CANCEL_CHEQUE,
  BANK_DOCUMENT_TYPE_PAN_CARD,
} from "./bankDocumentConfig";

export type BankDocumentPreview = {
  url: string;
  isPdf: boolean;
  fileMetadataId?: string;
  fileName?: string;
};

export type IfscVerificationStatus = "verified" | "not_verified" | null;

export type BankDetailsStatusBarConfig = {
  providerStatus: string;
  blacklistedByIcs: string[];
  auditLog: ProviderAuditLogContext;
};

export function isPdfUrl(url: string): boolean {
  const path = url.split("?")[0]?.split("#")[0] ?? url;
  return path.toLowerCase().endsWith(".pdf");
}

export function previewFromUrl(url: string): BankDocumentPreview {
  return { url, isPdf: isPdfUrl(url) };
}

export function isAllowedBankDocumentFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf", "jpg", "jpeg", "png"].includes(ext)) return true;
  const type = file.type.toLowerCase();
  return (
    type === "application/pdf" ||
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/jpg"
  );
}

export function revokeBlobPreview(preview: BankDocumentPreview | null) {
  if (preview?.url.startsWith("blob:")) {
    URL.revokeObjectURL(preview.url);
  }
}

export function bankFormValuesFromApiFields(
  fields: BankTabFieldsFromApi,
): BankFormValues {
  const values = { ...EMPTY_BANK_FORM };
  for (const key of BANK_FORM_API_FIELDS) {
    values[key] = String(fields[key] ?? "");
  }
  return values;
}

function kycDocumentUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  return "";
}

function readKycDocumentUrl(record: Record<string, unknown>): string {
  for (const key of [
    "presignedUrl",
    "downloadUrl",
    "url",
    "fileUrl",
    "documentUrl",
    "providerDocumentUrl",
  ]) {
    const url = kycDocumentUrl(record[key]);
    if (url) return url;
  }
  return "";
}

function normalizeKycDocumentType(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function readKycFileMetadataId(record: Record<string, unknown>): string {
  for (const key of [
    "fileMetadataId",
    "cancelChequeFileMetadataId",
    "panCardFileMetadataId",
    "providerFileMetadataId",
  ]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function previewFromKycDocuments(raw: unknown): {
  cancelledCheque: BankDocumentPreview | null;
  panCard: BankDocumentPreview | null;
} {
  if (!Array.isArray(raw)) {
    return { cancelledCheque: null, panCard: null };
  }

  let cancelledCheque: BankDocumentPreview | null = null;
  let panCard: BankDocumentPreview | null = null;

  for (const item of raw) {
    if (item == null || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const docType = normalizeKycDocumentType(
      record.documentType ?? record.providerDocumentType ?? record.type,
    );
    const url = readKycDocumentUrl(record);
    const fileMetadataId = readKycFileMetadataId(record);
    if (!url && !fileMetadataId) continue;

    const preview: BankDocumentPreview = {
      ...(url ? previewFromUrl(url) : { url: "", isPdf: false }),
      ...(fileMetadataId ? { fileMetadataId } : {}),
    };
    if (
      docType === normalizeKycDocumentType(BANK_DOCUMENT_TYPE_CANCEL_CHEQUE) ||
      docType.includes("CANCEL") ||
      docType.includes("CHEQUE")
    ) {
      cancelledCheque = preview;
      continue;
    }
    if (
      docType === normalizeKycDocumentType(BANK_DOCUMENT_TYPE_PAN_CARD) ||
      docType.includes("PAN")
    ) {
      panCard = preview;
    }
  }

  return { cancelledCheque, panCard };
}

function previewFromFileMetadataId(
  fileMetadataId: string | undefined,
): BankDocumentPreview | null {
  const trimmed = fileMetadataId?.trim() ?? "";
  if (!trimmed) return null;
  return { url: "", isPdf: false, fileMetadataId: trimmed };
}

function mergeDocumentPreview(
  preferred: BankDocumentPreview | null,
  fallback: BankDocumentPreview | null,
): BankDocumentPreview | null {
  if (!preferred && !fallback) return null;
  if (!preferred) return fallback;
  if (!fallback) return preferred;
  return {
    url: preferred.url || fallback.url,
    isPdf: preferred.url ? preferred.isPdf : fallback.isPdf,
    fileMetadataId: preferred.fileMetadataId || fallback.fileMetadataId,
    fileName: preferred.fileName || fallback.fileName,
  };
}

export function ifscVerificationFromApi(
  verified: boolean | null | undefined,
): IfscVerificationStatus {
  if (verified === true) return "verified";
  if (verified === false) return "not_verified";
  return null;
}

export function documentPreviewsFromApiFields(
  fields: BankTabFieldsFromApi | null,
): {
  cancelledCheque: BankDocumentPreview | null;
  panCard: BankDocumentPreview | null;
} {
  if (!fields) {
    return { cancelledCheque: null, panCard: null };
  }

  const fromDocuments = previewFromKycDocuments(fields.providerBankKycDocuments);
  const fromMetadata = {
    cancelledCheque: previewFromFileMetadataId(fields.cancelChequeFileMetadataId),
    panCard: previewFromFileMetadataId(fields.panCardFileMetadataId),
  };

  let cancelledCheque = mergeDocumentPreview(
    fromDocuments.cancelledCheque,
    fromMetadata.cancelledCheque,
  );
  const panCard = mergeDocumentPreview(fromDocuments.panCard, fromMetadata.panCard);

  if (!cancelledCheque && !panCard) {
    const kycUrl = kycDocumentUrl(fields.providerBankKycDocuments);
    cancelledCheque = kycUrl ? previewFromUrl(kycUrl) : null;
  }

  return { cancelledCheque, panCard };
}

export function buildBankDetailsStatusBarConfig(
  hospital: HospitalDetailRecord | null,
  t: TFunction,
): BankDetailsStatusBarConfig {
  const providerStatus = hospital?.status?.trim() || t("providerMaster.expiry.emptyValue");
  return {
    providerStatus,
    blacklistedByIcs: hospital?.blacklistedByIcNames?.length
      ? hospital.blacklistedByIcNames
      : [t("providerMaster.detailTabs.owner.noIcInfo")],
    auditLog: {
      providerId: hospital?.id,
      tabId: BANK_DETAILS_AUDIT_TAB_ID,
    },
  };
}

export function hasRequiredBankDocuments(
  cancelledCheque: BankDocumentPreview | null,
  panCard: BankDocumentPreview | null,
): boolean {
  return cancelledCheque != null && panCard != null;
}

export function getBankDetailsSaveDisabledState(
  isFormValid: boolean,
  cancelledCheque: BankDocumentPreview | null,
  panCard: BankDocumentPreview | null,
  t: TFunction,
): { saveDisabled: boolean; saveDisabledTitle?: string } {
  const V = "providerMaster.detailTabs.bank.validation";
  if (!isFormValid) {
    return {
      saveDisabled: true,
      saveDisabledTitle: t(`${V}.completeRequiredFields`),
    };
  }
  if (!hasRequiredBankDocuments(cancelledCheque, panCard)) {
    return {
      saveDisabled: true,
      saveDisabledTitle: t(`${V}.uploadDocuments`),
    };
  }
  return { saveDisabled: false };
}

export function ifscVerifiedForSave(
  status: IfscVerificationStatus,
): boolean | null {
  if (status === "verified") return true;
  if (status === "not_verified") return false;
  return null;
}
