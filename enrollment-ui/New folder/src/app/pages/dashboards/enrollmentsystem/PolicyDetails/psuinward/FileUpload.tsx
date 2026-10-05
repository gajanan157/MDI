import React, { useRef } from "react";
import { Controller, Control, FieldError } from "react-hook-form";

interface FileUploadProps {
  control: Control<any>;
  name: string;
  label: string;
  accept: string;
  error?: FieldError;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  control,
  name,
  label,
  accept,
  error,
  required = false,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    onChange: (file: File) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedFile = e.dataTransfer.files?.[0];

    if (!selectedFile) return;
    onChange(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const file = field.value;

        return (
          <div className="w-full">
            <label className="input-label dropdown-label font-medium text-[14px] text-black">
              {label}
              {required && <span className="text-red-500">*</span>}
            </label>

            {!file ? (
              <div
                className="border-2 border-dashed rounded-lg p-5 bg-gray-50 text-center cursor-pointer mt-1"
                onClick={() => fileRef.current?.click()}
                onDrop={(e) => handleDrop(e, field.onChange)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  hidden
                  ref={fileRef}
                  type="file"
                  accept={accept}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (!selectedFile) return;

                    field.onChange(selectedFile);
                  }}
                />

                <p className="text-sm text-gray-600">
                  Click to upload file
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Supported: XML
                </p>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3 mt-1">
                <span className="text-sm">{file.name}</span>

                <button
                  type="button"
                  className="text-red-500 text-xl cursor-pointer"
                  onClick={() => field.onChange(null)}
                >
                  ×
                </button>
              </div>
            )}

            {error && (
              <p className="input-text-error text-error dark:text-error-lighter text-left text-[10px] text-xsm">
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default FileUpload;