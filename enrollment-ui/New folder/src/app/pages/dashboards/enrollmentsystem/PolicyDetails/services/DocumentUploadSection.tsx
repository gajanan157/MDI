import React, { useRef } from "react";
import { Controller } from "react-hook-form";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface DocumentUploadSectionProps {
  s3SubBucketName?: string | undefined;

  InwardSubOptions: Record<string, any>;
  formatOptions?: (data: any) => any[];

  control: any;
  errors: any;
  watch: any;
  setValue: any;

  fields: any[];
  append: any;
  remove: any;

  acceptedFileTypes?: string;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  s3SubBucketName,
  InwardSubOptions,
  formatOptions,
  control,
  errors,
  watch,
  setValue,
  fields,
  append,
  remove,
  acceptedFileTypes = ".pdf,.doc,.docx,.xls,.xlsx",
}) => {
  const { t } = useTranslation();
  let canAddMoreDocuments: boolean = true
  const isDuplicateFile = (index: number, selectedFile: File) => {
    const documents = watch("documents") || [];
    return documents?.some((doc: any, i: number) => {
      if (i === index) return false;
      return (doc?.file && doc.file.name === selectedFile.name && doc.file.size === selectedFile.size && doc.file.lastModified === selectedFile.lastModified);
    });
  };
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
    onChange: (file: File) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedFile = e.dataTransfer.files?.[0];

    if (!selectedFile) return;

    if (isDuplicateFile(index, selectedFile)) {
      toast.error("This file has already been uploaded.", {
        duration: 2000,
      });
      return;
    }

    onChange(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  return (
    <div className="space-y-2">
      {fields?.map((item, index) => {
        const file = watch(`documents.${index}.file`);
        const documents = watch("documents") || [];
        const subBucketKey = s3SubBucketName?.toUpperCase();

        const options =
          subBucketKey ? InwardSubOptions[subBucketKey] : undefined;

        let allOptions = [];

        if (options) {
          allOptions = formatOptions ? formatOptions(options) : options;
        }

        const selectedDocumentTypes = new Set(
          documents
            ?.filter((_: any, i: number) => i !== index)
            ?.map((doc: any) => doc?.documentType)
            ?.filter(Boolean)
        );


        const filteredOptions = allOptions?.filter((option: any) => !selectedDocumentTypes.has(option.value ?? option.documentType ?? option.id));
        canAddMoreDocuments = fields.length < allOptions.length;
        return (
          <div
            key={item.id}
            className="flex border rounded-xl p-3 bg-white shadow-sm mt-2 gap-6 relative">
            {s3SubBucketName && (
              <div className=" mb-1 w-1/2">
                <DropdownSelect
                  label={t("inwardUploadDoc.fields.documentType.label")}
                  defaultValue={t(
                    "inwardUploadDoc.fields.documentType.placeholder"
                  )}
                  name={`documents.${index}.documentType`}
                  name_key="documentType"
                  control={control}
                  errors={errors?.documents?.[index]?.documentType}

                  options={filteredOptions}
                  className="h-[38px] rounded-[10px]"
                  isRequired
                />
              </div>
            )}
            <div className="flex flex-col w-1/2">
              <label className="input-label dropdown-label  font-medium text-[14px] text-black">
                {t("inwardUploadDoc.fields.uploadDocuments")}
                <span className="text-red-500">*</span>
              </label>

              {!file ? (
                <Controller
                  control={control}
                  name={`documents.${index}.file`}
                  render={({ field }) => {
                    const fileRef = useRef<HTMLInputElement>(null);
                    return (
                      <div
                        className="border-2 border-dashed rounded-xl  mt-0 bg-gray-50 text-center cursor-pointer"
                        onClick={() => fileRef.current?.click()}
                        onDrop={(e) => handleDrop(e, index, field.onChange)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <input
                          ref={fileRef}
                          hidden
                          type="file"
                          accept={acceptedFileTypes}
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0];

                            if (!selectedFile) return;

                            if (isDuplicateFile(index, selectedFile)) {
                              toast.error("This file has already been uploaded.", { duration: 2000 });
                              e.target.value = "";
                              return;
                            }
                            field.onChange(selectedFile);
                          }}
                        />

                        <p className="text-[12px] text-gray-500">
                          {t(
                            "inwardUploadDoc.uploadSection.clickToUpload"
                          )}
                        </p>

                        <p className="text-[10px] text-gray-400">
                          {t(
                            "inwardUploadDoc.uploadSection.allowedFormats"
                          )}
                        </p>
                      </div>

                    );
                  }}
                />
              ) : (
                <div className=" flex justify-between items-center bg-gray-100 rounded-lg p-2">
                  <span className="input-label dropdown-label font-normal  text-[14px] text-black">{file.name}</span>

                  <button
                    type="button"
                    className="text-red-500 font-bold text-xl cursor-pointer"
                    onClick={() =>
                      setValue(`documents.${index}.file`, null, {
                        shouldValidate: true,
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              )}

              {errors?.documents?.[index]?.file && (
                <p className="input-text-error text-error dark:text-error-lighter text-left text-[10px] text-xsm">
                  {errors.documents[index].file.message}
                </p>
              )}
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute right-0 top-0 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition"
                title="Remove Document"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      {canAddMoreDocuments && (
        <button
          type="button"
          className="bg-blue-600 text-white px-2 py-2 rounded-lg cursor-pointer"
          onClick={() =>
            append({
              documentType: "",
              file: null,
            })
          }
        >
          + Add More Document
        </button>
      )}
    </div>
  );
};

export default DocumentUploadSection;