import * as yup from "yup";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

export const DOCUMENT_TYPE_VALUES = ["MASTER_PRODUCT", "ADDENDUM"] as const;

export const documentSchema = yup.object({
  documentType: yup
    .string()
    .default("MASTER_PRODUCT")
    .oneOf(DOCUMENT_TYPE_VALUES, "Document type must be Master Product or Addendum"),
  documents: yup
    .array()
    .of(
      yup
        .mixed<File>()
        .required("File is required")
        .test(
          "fileType",
          "Only PDF files are allowed",
          (file) => !!file && ALLOWED_MIME_TYPES.includes(file.type),
        )
        .test(
          "fileSize",
          "File size must be less than 50 MB",
          (file) => !!file && file.size <= MAX_FILE_SIZE,
        ),
    )
    .min(1, "Please upload at least one PDF document")
    .required("Document is required"),
});
