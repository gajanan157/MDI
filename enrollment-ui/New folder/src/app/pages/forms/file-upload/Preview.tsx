// Import Dependencies
import { useRef, useState } from "react";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/solid";

import invariant from "tiny-invariant";

// Local Imports
import { Button, Upload } from "@/components/ui";
import PdfViewer from "@/components/shared/PdfViewer";
import { EyeIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";


export interface PreviewProps {
  label?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  className?: string;
  isRequred?: boolean;
  isCancel?: boolean;
  isDisable?: boolean;
}

const Preview: React.FC<PreviewProps> = ({
  label = "Upload File",
  value = [],
  onChange,
  accept = "image/*",
  className,
  isRequred = false,
  isCancel = false,
  isDisable = false,
}) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  // RESET STYLE (Same as Reset Component)
  const handleReset = () => {
    invariant(uploadRef?.current, "Can't access input file");
    uploadRef.current.value = "";
    onChange?.([]);
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleViewPdf = async () => {
    if (!value?.[0]) return;

    try {
      // Check if value[0] is a File (has 'type' property)
      if (value[0] instanceof File) {
        const fileUrl = URL.createObjectURL(value[0]);
        setPdfUrl(fileUrl);
        setIsDrawerOpen(true);
      } else if ((value[0] as any).downloadUrl) {
        // fallback: open downloadUrl in a new tab
        const downloadUrl = (value[0] as any).downloadUrl;
        window.open(downloadUrl, "_blank");
      } else {
        console.warn("No file or downloadUrl available");
      }
    } catch (err) {
      console.error("Failed to open PDF", err);
    }
  };

  const { t } = useTranslation()
  const isPdf = value?.[0]?.type === "application/pdf";
  const isPdf2 = (value?.[0] as any)?.contentType === "application/pdf";
  return (
    <>
      <div className={`max-w-xl ${className}`}>
        {label && (
          <label className="input-label mb-2 block">
            {label}
            {isRequred && <span className="text-red-500"> *</span>}
          </label>
        )}

        <div className="flex justify-between gap-2">
          <Upload onChange={onChange} ref={uploadRef} accept={accept} disabled={isDisable}>
            {(props) => (
              <Button color="primary" {...props} className="gap-2">
                <CloudArrowUpIcon className="size-5" />
                <span className="input-label">{t("upload")}</span>
              </Button>
            )}
          </Upload>
          {(value.length > 0 && isCancel) && (
            <Button disabled={!value.length} onClick={handleReset}>
              <XMarkIcon className="size-5" />
            </Button>
          )}
        </div>


        {value.length > 0 && (
          <div>
            File name :{" "}
            <span className="input-label font-medium">
              {(value[0] as any)?.name ?? (value[0] as any)?.fileName}
            </span>
          </div>
        )}
        {(isPdf || isPdf2) && (
          <button
            type="button"
            onClick={handleViewPdf}
            className="cursor-pointer flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <EyeIcon className="h-4 w-4" />
            View PDF
          </button>
        )}

      </div>
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div
            className={`fixed right-0 top-0 z-50 h-full w-full md:w-1/2 bg-white shadow-xl
              transform transition-transform duration-300 ease-in-out
              ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">PDF Preview</h3>
              <button onClick={() => setIsDrawerOpen(false)}>
                <XMarkIcon className="cursor-pointer h-5 w-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>
            <div className="h-[calc(100%-52px)]">
              {pdfUrl && (
                <PdfViewer
                  pdfUrl={pdfUrl}
                  title="Document Viewer"
                  height="100%"
                  className="h-full"
                />
              )}
            </div>
          </div>
        </>
      )}

    </>
  );
};

export { Preview };
