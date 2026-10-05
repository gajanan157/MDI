import { useCallback, useState } from "react";
import type {
  DocumentGridRow,
  DocumentListItem,
  DocumentPreview,
  DocumentSampleFile,
} from "../utils/documentMasterGrid";
import {
  buildDocumentViewerState,
  resolveDocumentRowPreview,
  type DocumentViewerState,
} from "../utils/documentsHelpers";

type UseDocumentPreviewArgs = {
  localDocumentList: DocumentListItem[];
  documentSampleFiles: Record<number, DocumentSampleFile>;
  uploadedVersionUrls: Record<string, { url: string; type: "image" | "pdf" }>;
};

export function useDocumentPreview({
  localDocumentList,
  documentSampleFiles,
  uploadedVersionUrls,
}: UseDocumentPreviewArgs) {
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [documentViewerDoc, setDocumentViewerDoc] =
    useState<DocumentViewerState | null>(null);

  const resolveRowPreview = useCallback(
    (row: DocumentGridRow): DocumentPreview | null =>
      resolveDocumentRowPreview(
        row,
        localDocumentList,
        documentSampleFiles,
        uploadedVersionUrls,
      ),
    [documentSampleFiles, localDocumentList, uploadedVersionUrls],
  );

  const handleDocumentView = useCallback(
    (row: DocumentGridRow, preview: DocumentPreview | null) => {
      setDocumentViewerDoc(buildDocumentViewerState(row, preview));
      setDocumentViewerOpen(true);
    },
    [],
  );

  const closeDocumentViewer = () => {
    setDocumentViewerOpen(false);
  };

  return {
    documentViewerOpen,
    documentViewerDoc,
    resolveRowPreview,
    handleDocumentView,
    closeDocumentViewer,
  };
}
