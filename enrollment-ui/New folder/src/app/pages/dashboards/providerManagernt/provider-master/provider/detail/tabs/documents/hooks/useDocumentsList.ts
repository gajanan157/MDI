import { useEffect, useState } from "react";
import type { DocumentListItem } from "../utils/documentMasterGrid";

export function useDocumentsList(documentList: DocumentListItem[]) {
  const [localDocumentList, setLocalDocumentList] = useState<DocumentListItem[]>(
    () => [...documentList],
  );
  const [uploadedVersionUrls, setUploadedVersionUrls] = useState<
    Record<string, { url: string; type: "image" | "pdf" }>
  >({});

  useEffect(() => {
    setLocalDocumentList([...documentList]);
  }, [documentList]);

  return {
    localDocumentList,
    setLocalDocumentList,
    uploadedVersionUrls,
    setUploadedVersionUrls,
  };
}
