import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import type { DocumentListItem } from "../utils/documentMasterGrid";
import { formatOptionalDocumentDate } from "../utils/documentsConfig";
import {
  appendUploadedDocumentVersion,
  createUploadVersionId,
  inferDocumentFileType,
} from "../utils/documentsHelpers";

type UseDocumentUploadArgs = {
  localDocumentList: DocumentListItem[];
  setLocalDocumentList: React.Dispatch<React.SetStateAction<DocumentListItem[]>>;
  setUploadedVersionUrls: React.Dispatch<
    React.SetStateAction<Record<string, { url: string; type: "image" | "pdf" }>>
  >;
  onUploadSuccess: (message: string) => void;
};

export function useDocumentUpload({
  localDocumentList,
  setLocalDocumentList,
  setUploadedVersionUrls,
  onUploadSuccess,
}: UseDocumentUploadArgs) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadModalDoc, setUploadModalDoc] = useState<DocumentListItem | null>(
    null,
  );
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStartDate, setUploadStartDate] = useState("");
  const [uploadValidTill, setUploadValidTill] = useState("");

  const uploadForm = useForm<{ selectedDocumentNo: string }>({
    defaultValues: { selectedDocumentNo: "" },
  });

  const resetUploadFields = () => {
    setUploadModalDoc(null);
    setUploadFile(null);
    setUploadStartDate("");
    setUploadValidTill("");
    uploadForm.reset({ selectedDocumentNo: "" });
  };

  const openUploadModal = (row: DocumentListItem | null) => {
    uploadForm.reset({ selectedDocumentNo: "" });
    if (row) {
      setUploadModalDoc(row);
      setUploadStartDate(formatOptionalDocumentDate(row.startDate));
      setUploadValidTill(formatOptionalDocumentDate(row.validTill));
    } else {
      resetUploadFields();
    }
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    resetUploadFields();
  };

  const selectUploadDocument = (documentNo: number) => {
    const row = localDocumentList.find((item) => item.no === documentNo);
    if (!row) return;
    setUploadModalDoc(row);
    setUploadStartDate(formatOptionalDocumentDate(row.startDate));
    setUploadValidTill(formatOptionalDocumentDate(row.validTill));
  };

  const handleUploadSubmit = useCallback(() => {
    if (!uploadModalDoc || !uploadFile) return;

    const versionId = createUploadVersionId();
    const url = URL.createObjectURL(uploadFile);
    const type = inferDocumentFileType(uploadFile);

    setUploadedVersionUrls((prev) => ({ ...prev, [versionId]: { url, type } }));
    setLocalDocumentList((prev) =>
      appendUploadedDocumentVersion(prev, {
        documentNo: uploadModalDoc.no,
        file: uploadFile,
        startDate: uploadStartDate,
        validTill: uploadValidTill,
        versionId,
        url,
        type,
      }),
    );

    const uploadedDocumentName = uploadModalDoc.name;
    setUploadModalOpen(false);
    setUploadModalDoc(null);
    setUploadFile(null);
    setUploadStartDate("");
    setUploadValidTill("");
    uploadForm.reset({ selectedDocumentNo: "" });
    onUploadSuccess(`"${uploadedDocumentName}" uploaded successfully.`);
  }, [
    onUploadSuccess,
    setLocalDocumentList,
    setUploadedVersionUrls,
    uploadFile,
    uploadForm,
    uploadModalDoc,
    uploadStartDate,
    uploadValidTill,
  ]);

  return {
    uploadForm,
    uploadModalOpen,
    uploadModalDoc,
    uploadFile,
    setUploadFile,
    uploadStartDate,
    setUploadStartDate,
    uploadValidTill,
    setUploadValidTill,
    openUploadModal,
    closeUploadModal,
    selectUploadDocument,
    handleUploadSubmit,
  };
}
