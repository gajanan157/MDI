import { useEffect, useRef, useState } from "react";
import { fetchInwardDocumentsAPI } from "../../PolicyDetails/InwardView";
import { useTranslation } from "react-i18next";

export const truncateFileName = (fileName: string) => {
  if (!fileName) return "";
  const ext = fileName?.substring(fileName?.lastIndexOf("."));
  const name = fileName?.substring(0, fileName?.lastIndexOf("."));
  if (fileName?.length <= 40) return fileName;
  return `${name?.slice(0, 12)}....${ext}`;
};
interface DocumentItem {
  fileMetadataId: string;
  fileName: string;
  downloadUrl: string;
  documentType?: string;
}

interface Props {
  inwardNo: string |null;
}

export const formatDocType = (type: string) => {
  if (!type) return "";

  return type
    ?.replace(/_/g, " ")
    ?.replace(/([a-z])([A-Z])/g, "$1 $2")
    ?.split(" ")
    ?.map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};



const DocumentDropdown: React.FC<Props> = ({ inwardNo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {t} = useTranslation()
  const ref = useRef<HTMLDivElement>(null);
  
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  useEffect(() => {
    const getDocuments = async (inwardNo:any) => {
      try {
        const response = await fetchInwardDocumentsAPI(inwardNo);
        setDocuments(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocuments([]);
      }
    };

    if (inwardNo) {
      getDocuments(inwardNo);
    }
  }, [inwardNo]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      className="relative w-1/2 max-w-[210px] rounded-lg border bg-gray-50"
      ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700">
        <span> {t("endorsementSummary.viewDocument")}</span>

        <svg
          className={`h-4 w-4 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-[250px] w-full overflow-y-auto rounded-lg border bg-white shadow-md">
          {documents?.length > 0 ? (
            documents?.map((doc) => (
              <a
                key={doc.fileMetadataId}
                href={doc.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-[11px] text-gray-700 transition hover:bg-gray-100"
                title={doc.fileName}
              >
                {truncateFileName(doc.fileName)}
                {doc.documentType &&
                  ` (${formatDocType(doc.documentType)})`}
              </a>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No Documents Found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentDropdown;