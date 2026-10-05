import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import DropdownSelect from "@/components/shared/form/DropdownSelect";

export interface PdfViewerProps {
  pdfUrl?: string;
  title?: string;
  className?: string;
  height?: string;
  availablePdfs?: Array<{ id: string; name: string; url: string }>;
  selectedPdfUrl?: string | null;
  onPdfSelect?: (url: string) => void;
  pageNumber?: number;
  searchText?: string;
  showToolbar?: boolean;
  isLoading?: boolean;
}

/* -------------------------------------------------------
   Memoized iframe
-------------------------------------------------------- */
const PdfIframe = React.memo(
  ({ src, title }: { src: string; title: string }) => (
    <iframe
      key={src}
      src={src}
      title={title}
      className="h-full w-full border-0"
      style={{ width: "100%", height: "100%" }}
    />
  ),
);

PdfIframe.displayName = "PdfIframe";

/* -------------------------------------------------------
   PdfViewer
-------------------------------------------------------- */
export default function PdfViewer({
  pdfUrl,
  title = "PDF Viewer",
  className = "",
  height = "100%",
  availablePdfs = [],
  selectedPdfUrl,
  onPdfSelect,
  pageNumber = 1,
  searchText,
  showToolbar = true,
  isLoading = false, // ✅ FIX: destructured properly
}: PdfViewerProps) {
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(pageNumber);

  /* -------------------------------------------------------
     react-hook-form
  -------------------------------------------------------- */
  const { control, setValue, reset } = useForm({
    defaultValues: {
      selectedDocument: "",
    },
  });

  /* -------------------------------------------------------
     Decide final PDF URL
  -------------------------------------------------------- */
  const currentPdfUrl = useMemo(() => {
    return selectedPdfUrl || pdfUrl || "";
  }, [selectedPdfUrl, pdfUrl]);

  /* -------------------------------------------------------
     Build iframe src — use pageNumber prop so source-click
     navigation shows the correct page immediately (no effect lag).
  -------------------------------------------------------- */
  const pageForSrc = pageNumber ?? currentPage;
  const iframeSrc = useMemo(() => {
    if (!currentPdfUrl) return "";

    const baseUrl = currentPdfUrl.split("#")[0];
    let src = `${baseUrl}#page=${pageForSrc}&toolbar=${showToolbar ? 1 : 0}`;

    if (searchText?.trim()) {
      src += `&search=${encodeURIComponent(searchText)}`;
    }
    return src;
  }, [currentPdfUrl, pageForSrc, searchText, showToolbar]);

  /* -------------------------------------------------------
     Dropdown options
  -------------------------------------------------------- */
  const dropdownOptions = useMemo(
    () =>
      availablePdfs.map((pdf) => ({
        value: pdf.id,
        label: pdf.name.endsWith(".pdf") ? pdf.name : `${pdf.name}.pdf`,
      })),
    [availablePdfs],
  );

  /* -------------------------------------------------------
     Sync dropdown with selectedPdfUrl when PDFs change
  -------------------------------------------------------- */
  useEffect(() => {
    if (availablePdfs.length === 0) {
      reset({ selectedDocument: "" });
      return;
    }

    // Match dropdown to the PDF actually being displayed (selectedPdfUrl)
    const matchingPdf = selectedPdfUrl
      ? availablePdfs.find((p) => p.url === selectedPdfUrl)
      : null;
    const pdfToSelect = matchingPdf ?? availablePdfs[0];
    reset({ selectedDocument: pdfToSelect.id });

    if (!selectedPdfUrl) {
      onPdfSelect?.(pdfToSelect.url);
    }
  }, [availablePdfs, reset, selectedPdfUrl, onPdfSelect]);

  /* -------------------------------------------------------
     Handle dropdown change
  -------------------------------------------------------- */
  const handleDocumentSelect = useCallback(
    (value: string | number | (string | number)[]) => {
      const id = Array.isArray(value) ? String(value[0]) : String(value);
      const pdf = availablePdfs.find((p) => p.id === id);
      if (!pdf) return;

      setValue("selectedDocument", id);
      onPdfSelect?.(pdf.url);
    },
    [availablePdfs, onPdfSelect, setValue],
  );

  /* -------------------------------------------------------
     Page navigation
  -------------------------------------------------------- */
  useEffect(() => {
    if (pageNumber && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  }, [pageNumber, currentPage]);

  /* -------------------------------------------------------
     Render
  -------------------------------------------------------- */
  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow ${className}`}
      style={{ minWidth: 0 }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-800 px-3 py-2">
        {isLoading ? (
          <span className="text-xs text-gray-300">Loading documents...</span>
        ) : dropdownOptions.length > 0 ? (
          <div className="w-[220px]">
            <DropdownSelect
              key={availablePdfs.map((p) => `${p.id}:${p.name}`).join("|")}
              name="selectedDocument"
              control={control}
              options={dropdownOptions}
              onChange={handleDocumentSelect}
              className="text-xs"
              formClassName="!mt-0"
            />
          </div>
        ) : (
          <span className="text-xs text-gray-200">No documents</span>
        )}
      </div>

      {/* PDF container */}
      <div
        ref={iframeContainerRef}
        className="relative flex-1 overflow-hidden bg-gray-100 p-2"
        style={{ height }}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
              <p className="mt-2 text-sm">Loading documents...</p>
            </div>
          </div>
        ) : iframeSrc ? (
          <PdfIframe src={iframeSrc} title={title} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-4 shadow-sm">
              <DocumentTextIcon className="h-8 w-8 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                Master Product document not found
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
