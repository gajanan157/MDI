import type { TFunction } from "i18next";
import type { ProviderAuditLogContext } from "../../../shared/providerAuditLog";
import type {
  DocumentGridRow,
  DocumentListItem,
  DocumentPreview,
  DocumentSampleFile,
} from "./documentMasterGrid";
import { resolveDocumentVersions } from "./documentMasterGrid";

export type DocumentsHospitalSummary = {
  id?: string;
  status?: string;
  blacklistedByIcNames?: string[];
} | null;

export type DocumentsToolbarConfig = {
  providerStatus: string;
  blacklistedByIcs: string[];
  auditLog: ProviderAuditLogContext;
};

export function buildDocumentsToolbarConfig(
  hospital: DocumentsHospitalSummary,
  t: TFunction,
): DocumentsToolbarConfig {
  const providerStatus = hospital?.status ?? "";

  return {
    providerStatus,
    blacklistedByIcs: hospital?.blacklistedByIcNames?.length
      ? hospital.blacklistedByIcNames
      : [t("providerMaster.detailTabs.documents.noIcInfo")],
    auditLog: {
      providerId: hospital?.id,
      tabId: "hospital-document",
    },
  };
}

export function buildDocumentTypeOptions(documentList: DocumentListItem[], t: TFunction) {
  return [
    { label: t("providerMaster.detailTabs.documents.chooseDocumentType"), value: "" },
    ...documentList.map((row) => ({
      label: `${row.no}. ${row.name}`,
      value: String(row.no),
    })),
  ];
}

export function createUploadVersionId(): string {
  return `upload-${Date.now()}`;
}

export function inferDocumentFileType(file: File): "image" | "pdf" {
  return file.type.startsWith("image/") ? "image" : "pdf";
}

export function appendUploadedDocumentVersion(
  list: DocumentListItem[],
  input: {
    documentNo: number;
    file: File;
    startDate: string;
    validTill: string;
    versionId: string;
    url: string;
    type: "image" | "pdf";
  },
): DocumentListItem[] {
  return list.map((row) =>
    row.no === input.documentNo
      ? {
          ...row,
          startDate: input.startDate.trim() || "-",
          validTill: input.validTill.trim() || "-",
          versions: [
            ...(row.versions ?? []),
            {
              id: input.versionId,
              fileName: input.file.name,
              startDate: input.startDate.trim() || "-",
              validTill: input.validTill.trim() || "-",
              url: input.url,
              type: input.type,
              active: true,
            },
          ],
        }
      : row,
  );
}

export function resolveDocumentRowPreview(
  row: DocumentGridRow,
  documentList: DocumentListItem[],
  documentSampleFiles: Record<number, DocumentSampleFile>,
  uploadedVersionUrls: Record<string, { url: string; type: "image" | "pdf" }>,
): DocumentPreview | null {
  if (row.isVersion) {
    const fromUpload = row.versionId
      ? uploadedVersionUrls[row.versionId]
      : undefined;
    const url = fromUpload?.url ?? row.url;
    if (!url) return null;
    return {
      url,
      type: fromUpload?.type ?? row.fileType ?? "pdf",
      downloadName: row.downloadName ?? row.name,
    };
  }

  const doc = documentList.find((item) => item.no === row.documentNo);
  if (!doc) return null;

  const versions = resolveDocumentVersions(doc, documentSampleFiles);
  const latest = versions[versions.length - 1];
  if (!latest) return null;

  const fromUpload = uploadedVersionUrls[latest.id];
  const url = fromUpload?.url ?? latest.url;
  if (!url) return null;

  return {
    url,
    type: fromUpload?.type ?? latest.type ?? "pdf",
    downloadName: latest.fileName,
  };
}

export type DocumentViewerState = {
  no: number;
  name: string;
  url: string;
  type: "image" | "pdf";
  downloadName: string;
};

export function buildDocumentViewerState(
  row: DocumentGridRow,
  preview: DocumentPreview | null,
): DocumentViewerState {
  const viewerName = row.isVersion ? row.name : `${row.no}. ${row.name}`;

  return {
    no: row.documentNo,
    name: viewerName,
    url: preview?.url ?? "",
    type: preview?.type ?? "pdf",
    downloadName: preview?.downloadName ?? "",
  };
}
