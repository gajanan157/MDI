/** S3 bucket for provider bank documents (scan upload API). */
export const BANK_DOCUMENT_S3_BUCKET = "provider";

/** All provider bank/PAN document uploads: `s3SubBucketName=PROVIDER_PAN_AND_BANK_DETAILS`. */
export const BANK_DOCUMENT_S3_SUB_BUCKET = "PROVIDER_PAN_AND_BANK_DETAILS";

export const BANK_DOCUMENT_ENTITY_TYPE = "PROVIDER";

export const BANK_DOCUMENT_TYPE_CANCEL_CHEQUE = "PROVIDER_CANCELLED_CHEQUE";

export const BANK_DOCUMENT_TYPE_PAN_CARD = "PROVIDER_PAN_CARD";

/** Cancel cheque and PAN card uploads always require OCR. */
export const BANK_DOCUMENT_OCR_REQUIRED = "OCR_REQUIRED";
