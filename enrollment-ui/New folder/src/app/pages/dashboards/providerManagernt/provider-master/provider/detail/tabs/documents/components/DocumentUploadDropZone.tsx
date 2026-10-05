import { useRef, useState } from "react";
import clsx from "clsx";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { DOCUMENT_UPLOAD_ACCEPT } from "../utils/documentsConfig";

type DocumentUploadDropZoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
};

function resolveDropZoneClass(isDragging: boolean, hasFile: boolean): string {
  if (isDragging) {
    return "border-primary-500 bg-primary-50/70 ring-primary-500/25 ring-2";
  }
  if (hasFile) {
    return "hover:border-primary-300 border-gray-200 bg-white shadow-sm hover:bg-gray-50/80";
  }
  return "hover:border-primary-400 hover:bg-primary-50/35 border-gray-300 bg-gray-50/90";
}

export function DocumentUploadDropZone({
  file,
  onFileChange,
}: Readonly<DocumentUploadDropZoneProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const applyFiles = (list: FileList | null) => {
    const nextFile = list?.[0];
    if (nextFile) onFileChange(nextFile);
  };

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-800">
        Document file
      </label>
      <div
        className={clsx(
          "relative flex min-h-[128px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all",
          resolveDropZoneClass(isDragging, Boolean(file)),
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          applyFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Choose document file"
      >
        <input
          ref={inputRef}
          type="file"
          accept={DOCUMENT_UPLOAD_ACCEPT}
          className="hidden"
          onChange={(e) => {
            applyFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {file ? (
          <div className="flex w-full max-w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3 text-left">
              <div className="bg-primary-50 text-primary-600 ring-primary-100 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1">
                <CloudArrowUpIcon className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <p
                  className="truncate text-sm font-semibold text-gray-900"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB · click to replace
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outlined"
              className="h-9 shrink-0 border-gray-300 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <>
            <CloudArrowUpIcon
              className="text-primary-500 h-7 w-10"
              aria-hidden
            />
            <p className="text-sm font-medium text-gray-800">
              Drop file here or <span className="text-primary-600">browse</span>
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-gray-500">
              PDF, Word, Excel, CSV, or images.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
