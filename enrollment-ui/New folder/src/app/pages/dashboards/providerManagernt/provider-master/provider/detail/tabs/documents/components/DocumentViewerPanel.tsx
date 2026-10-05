import { XMarkIcon } from "@heroicons/react/24/outline";
import PdfViewer from "@/components/shared/PdfViewer";
import type { DocumentViewerState } from "../utils/documentsHelpers";

type DocumentViewerPanelProps = {
  open: boolean;
  document: DocumentViewerState | null;
  onClose: () => void;
};

function renderDocumentPreviewContent(document: DocumentViewerState | null) {
  if (!document?.url) {
    return (
      <div className="flex min-h-[190px] flex-1 items-center justify-center rounded-lg bg-white text-sm text-gray-500">
        No preview available for this document.
      </div>
    );
  }
  if (document.type === "image") {
    return (
      <div className="flex flex-1 justify-center overflow-auto">
        <img
          src={document.url}
          alt={document.name}
          className="max-h-[290px] w-auto max-w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div className="flex min-h-0 min-h-[190px] flex-1 overflow-hidden rounded-lg bg-white shadow-sm">
      <PdfViewer
        pdfUrl={document.url}
        title={document.name}
        height="100%"
        showToolbar={true}
        className="min-h-0"
      />
    </div>
  );
}

export function DocumentViewerPanel({
  open,
  document,
  onClose,
}: Readonly<DocumentViewerPanelProps>) {
  return (
    <div
      className={`min-w-0 shrink-0 rounded-lg border border-gray-200 bg-gray-50/80 shadow-sm transition-all duration-300 lg:flex lg:flex-col ${
        open
          ? "w-full opacity-100 lg:w-1/2"
          : "w-0 opacity-0 lg:w-0 lg:overflow-hidden"
      }`}
    >
      {open ? (
        <>
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
            <span className="truncate text-sm font-semibold text-gray-800">
              {document?.name ?? "Document preview"}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              aria-label="Close document viewer"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-100 p-3">
            {renderDocumentPreviewContent(document)}
          </div>
        </>
      ) : null}
    </div>
  );
}
